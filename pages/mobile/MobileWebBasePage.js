const assert = require('node:assert/strict');
const { getMobilePlatform, getUserAgentPatterns } = require('../../utils/mobilePlatform');

class MobileWebBasePage {
  /** Initializes this page object and its locators. */
  constructor(driver = browser) {
    this.driver = driver;
  }

  /** Opens open. */
  async open(path = '/') {
    this.logMobileStep('ACTION', `Open mobile page: ${path}`);
    await this.navigateTo(path);
    await this.waitForPageReady();
    await this.acceptCookiesIfVisible();
    await this.dismissPromoPopupIfPresent();
  }

  /** Checks whether session lost error. */
  isSessionLostError(error) {
    return /invalid session id|browser has closed the connection|disconnected|chrome not reachable/i.test(
      String(error?.message || error)
    );
  }

  /** Checks whether navigation timeout error. */
  isNavigationTimeoutError(error) {
    return /timeout|timed out receiving message from renderer|unable to receive message from renderer/i.test(
      String(error?.message || error)
    );
  }

  /** Checks whether chrome native URL. */
  isChromeNativeUrl(url) {
    return /^chrome-native:|^chrome:|^about:blank$/i.test(String(url || ''));
  }

  /** Resolves a navigation URL against the configured base URL. */
  resolveNavigationUrl(path) {
    const target = String(path || '/');

    if (/^[a-z][a-z\d+.-]*:/i.test(target)) {
      return target;
    }

    const wdioBrowser = typeof browser === 'undefined' ? undefined : browser;
    const baseUrl = this.driver.options?.baseUrl || wdioBrowser?.options?.baseUrl;

    if (!baseUrl) {
      return target;
    }

    return new URL(target, `${baseUrl.replace(/\/$/, '')}/`).toString();
  }

  /** Navigates to navigate to. */
  async navigateTo(path) {
    const beforeUrl = await this.driver.getUrl().catch(() => '');
    const targetUrl = this.resolveNavigationUrl(path);

    try {
      this.logMobileStep('ACTION', `Navigate to ${targetUrl}`);
      await this.driver.url(targetUrl);
      await this.driver.pause(Number(process.env.APPIUM_NAVIGATION_SETTLE_MS || 8000));
      const afterUrl = await this.driver.getUrl().catch(() => '');

      if (this.isChromeNativeUrl(afterUrl)) {
        this.logStep(`Mobile Chrome stayed on ${afterUrl}; retrying navigation to ${targetUrl}`);
        await this.driver.url(targetUrl);
        await this.driver.pause(Number(process.env.APPIUM_NAVIGATION_SETTLE_MS || 8000));
      }

      return;
    } catch (error) {
      if (!this.isNavigationTimeoutError(error)) {
        throw error;
      }

      const afterUrl = await this.driver.getUrl().catch(() => '');

      if (afterUrl && afterUrl !== beforeUrl && !this.isChromeNativeUrl(afterUrl)) {
        this.logStep(`Continuing after mobile Chrome navigation timeout. Current URL: ${afterUrl}`);
        return;
      }

      throw error;
    }
  }

  /** Reloads the mobile browser session after session loss. */
  async reloadSessionAfterLoss() {
    if (typeof this.driver.reloadSession !== 'function') {
      throw new Error('Mobile Chrome session was lost and this driver cannot reload the session.');
    }

    await this.driver.reloadSession();
  }

  /** Waits for page ready. */
  async waitForPageReady(timeout = 30000) {
    let sessionLostError;

    await this.driver.waitUntil(
      async () => {
        let snapshot;

        try {
          snapshot = await this.driver.execute(() => ({
            bodyTextLength: (document.body?.innerText || '').trim().length,
            sourceTextLength: (document.documentElement?.textContent || '').trim().length,
            readyState: document.readyState,
          }));
        } catch (error) {
          if (this.isSessionLostError(error)) {
            sessionLostError = error;
            return true;
          }

          throw error;
        }

        const hasUsableDom =
          snapshot.bodyTextLength > 20 ||
          snapshot.sourceTextLength > 1000 ||
          (snapshot.readyState === 'interactive' && snapshot.bodyTextLength > 20);

        if (snapshot.bodyTextLength > 20 && snapshot.readyState === 'loading') {
          await this.driver.execute(() => window.stop());
        }

        return hasUsableDom;
      },
      {
        timeout,
        timeoutMsg: 'Mobile web page did not become interactive',
      }
    );

    if (sessionLostError) {
      throw sessionLostError;
    }

    await this.dismissBlockingOverlaysIfPresent();
  }

  /** Accepts the cookie banner when it is visible. */
  async acceptCookiesIfVisible() {
    await this.removeCookieOverlays();
  }

  /** Closes cookie preferences if visible. */
  async closeCookiePreferencesIfVisible() {
    const closed = await this.driver.execute(() => {
      const modalText = document.body?.innerText || '';

      if (!/cookie preferences|strictly necessary cookies|performance cookies/i.test(modalText)) {
        return false;
      }

      const selectors = [
        '#accept-recommended-btn-handler',
        '#onetrust-accept-btn-handler',
        '.save-preference-btn-handler',
        '.ot-pc-refuse-all-handler',
        '#close-pc-btn-handler',
        '.ot-close-icon',
        '[aria-label*="close" i]',
        'button',
      ];
      const elements = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
      const button = elements.find((element) => {
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        const label = element.getAttribute('aria-label') || '';
        const id = element.id || '';
        const className = element.getAttribute('class') || '';
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          /accept|agree|allow|save|confirm|continue|close/i.test(`${text} ${label} ${id} ${className}`) &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        );
      });

      if (button instanceof HTMLElement) {
        button.click();
        return true;
      }

      return false;
    });

    if (closed) {
      await this.driver.pause(1000);
    }

    await this.removeCookieOverlays();
  }

  /** Removes cookie overlays that block mobile interactions. */
  async removeCookieOverlays() {
    await this.driver.execute(() => {
      const selectors = [
        '#onetrust-consent-sdk',
        '#onetrust-banner-sdk',
        '#onetrust-pc-sdk',
        '.onetrust-pc-dark-filter',
      ];

      for (const selector of selectors) {
        for (const element of document.querySelectorAll(selector)) {
          if (element instanceof HTMLElement) {
            element.style.setProperty('display', 'none', 'important');
            element.style.setProperty('visibility', 'hidden', 'important');
            element.setAttribute('aria-hidden', 'true');
          }
        }
      }

      document.documentElement.classList.remove('ot-sdk-show-settings');
      document.body.classList.remove('ot-sdk-show-settings');
      document.body.style.removeProperty('overflow');
    });
  }

  /** Dismisses promo popup if present. */
  async dismissPromoPopupIfPresent() {
    await this.acceptCookiesIfVisible();

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      if (await this.tryDismissPromoPopup()) {
        this.logMobileStep('ACTION', 'Dismissed mobile promotional popup');
        await this.driver.pause(500);
        return;
      }

      if (attempt === 1) {
        await this.driver.pause(750);
      }
    }
  }

  /** Dismisses blocking overlays if present. */
  async dismissBlockingOverlaysIfPresent() {
    await this.acceptCookiesIfVisible();
    await this.dismissPromoPopupIfPresent();
  }

  /** Attempts to dismiss a promotional popup. */
  async tryDismissPromoPopup() {
    return this.driver.execute(() => {
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };

      const clickClose = (scope) => {
        const closeSelectors = [
          'button[aria-label*="close" i]',
          'button[class*="close" i]',
          '[aria-label*="close" i]',
          '[class*="close" i]',
          'button:has(svg)',
          'button',
        ];
        const candidates = closeSelectors.flatMap((selector) => Array.from(scope.querySelectorAll(selector)));
        const closeButton = candidates.find((element) => {
          const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
          const label = element.getAttribute('aria-label') || '';
          const className = element.getAttribute('class') || '';

          return isVisible(element) && /close|dismiss|x/i.test(`${text} ${label} ${className}`);
        });

        if (closeButton instanceof HTMLElement) {
          closeButton.click();
          return true;
        }

        return false;
      };

      // 1) National promotion dialog with an explicit close button.
      const nationalClose = Array.from(document.querySelectorAll('button')).find((element) =>
        isVisible(element) && /close national promotion/i.test(element.getAttribute('aria-label') || element.textContent || '')
      );
      if (nationalClose instanceof HTMLElement) {
        nationalClose.click();
        return true;
      }

      const nationalDialog = document.querySelector('[role="dialog"][aria-label*="National promotion" i]');
      if (nationalDialog && isVisible(nationalDialog) && clickClose(nationalDialog)) {
        return true;
      }

      // 2) Generic promo modals/dialogs (no lead form, has media or promo CTA).
      const dialogSelectors = [
        '.ReactModal__Content',
        '[role="dialog"]',
        '[aria-modal="true"]',
        '.ReactModalPortal [class*="modal" i]',
        '.ReactModalPortal [class*="content" i]',
      ];
      const dialogs = dialogSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));

      for (const dialog of dialogs) {
        if (!isVisible(dialog)) {
          continue;
        }

        // Skip lead-capture forms; those are handled elsewhere.
        if (dialog.querySelector('form, input, select, textarea')) {
          continue;
        }

        if (!dialog.querySelector('button, a, img')) {
          continue;
        }

        const dialogText = (dialog.textContent || '').replace(/\s+/g, ' ').trim();
        const hasPromoMedia = Boolean(dialog.querySelector('img, picture, video'));
        const hasPromoCta = Array.from(dialog.querySelectorAll('button, a')).some((element) =>
          /going on now|learn more|view offer|promo|promotion/i.test(element.textContent || '')
        );

        if (
          !/promo|promotion|banner|going on now|special|offer|incentive/i.test(dialogText) &&
          !hasPromoMedia &&
          !hasPromoCta
        ) {
          continue;
        }

        if (clickClose(dialog)) {
          return true;
        }
      }

      return false;
    });
  }

  /** Clicks visible by text. */
  async clickVisibleByText(pattern, selectors = ['button', 'a'], label) {
    const clicked = await this.driver.execute(
      ({ source, flags, selectors }) => {
        const regex = new RegExp(source, flags);
        const elements = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
        const match = elements.find((element) => {
          const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
          const label = element.getAttribute('aria-label') || '';
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return (
            regex.test(`${text} ${label}`) &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            rect.width > 0 &&
            rect.height > 0
          );
        });

        if (!match) {
          return false;
        }

        match.scrollIntoView({ block: 'center', inline: 'center' });
        match.click();
        return true;
      },
      { source: pattern.source, flags: pattern.flags, selectors }
    );

    if (clicked) {
      this.logScriptClick(label || pattern.source);
    }

    return clicked;
  }

  /** Waits for body text. */
  async waitForBodyText(pattern, timeoutMsg, timeout = 20000) {
    await this.driver.waitUntil(
      async () => pattern.test(await this.getBodyText()),
      { timeout, timeoutMsg }
    );
  }

  /** Returns body text. */
  async getBodyText() {
    return this.driver.execute(() => (document.body?.innerText || '').slice(0, 20000));
  }

  /** Returns snapshot. */
  async getSnapshot() {
    return this.driver.execute(() => ({
      bodyText: (document.body?.innerText || document.documentElement?.textContent || '').slice(0, 20000),
      currentUrl: window.location.href,
      isSourceOnly:
        (document.body?.innerText || '').trim().length < 20 &&
        (document.documentElement?.textContent || '').trim().length > 1000,
      readyState: document.readyState,
      title: document.title,
      userAgent: navigator.userAgent,
    }));
  }

  /** Asserts no error page. */
  assertNoErrorPage(snapshot) {
    assert.doesNotMatch(snapshot.bodyText, /404|page not found|server error/i);
  }

  /** Asserts the browser user agent matches the configured mobile platform (Android Chrome / iOS Safari). */
  expectMobileUserAgent(userAgent) {
    const platform = getMobilePlatform();
    const { device, browser } = getUserAgentPatterns();

    assert.match(userAgent, device, `Expected ${platform} device user agent, received: ${userAgent}`);
    assert.match(userAgent, browser, `Expected ${platform} browser user agent, received: ${userAgent}`);
  }

  /** Logs mobile step. */
  logMobileStep(kind, message, status) {
    const cleanMessage = String(message || '').replace(/\s+/g, ' ').trim();

    if (!cleanMessage) {
      return;
    }

    if (typeof globalThis.__mobileSpecStep === 'function') {
      globalThis.__mobileSpecStep(kind, cleanMessage, status);
      return;
    }

    console.log(`${kind} ${cleanMessage}`);
  }

  /* ==========================================================
     READABLE STEP LOG VOCABULARY
     Produces concise action-narrative lines, e.g.:
       Clicked on: 15 Year Loan
       Clicked (script) on: featured quick move-in home card
       15-year term: $2519 → $2854
       Opened QMI detail: https://...
  ========================================================== */

  /** Generic action line. */
  logStep(message) {
    this.logMobileStep('ACTION', message);
  }

  /** "Clicked on: <target>" — a real/native click. */
  logClick(target) {
    this.logMobileStep('ACTION', `Clicked on: ${target}`);
  }

  /** "Clicked (script) on: <target>" — a DOM/script-driven click. */
  logScriptClick(target) {
    this.logMobileStep('ACTION', `Clicked (script) on: ${target}`);
  }

  /** "<label>: <before> → <after>" — a value change. */
  logChange(label, before, after) {
    this.logMobileStep('ACTION', `${label}: ${before} → ${after}`);
  }

  /** "Opened <label>: <target>" — a navigation/open. */
  logOpen(label, target) {
    this.logMobileStep('ACTION', `Opened ${label}: ${target}`);
  }

  /** Confirmed outcome of a validation. */
  logResult(message) {
    this.logMobileStep('RESULT', message);
  }

  /** Validation about to run. */
  logValidate(message) {
    this.logMobileStep('VALIDATION', message);
  }

  /** A section/feature that is absent, so its check is skipped. */
  logSkip(message) {
    this.logMobileStep('SKIP', message);
  }
}

module.exports = { MobileWebBasePage };
