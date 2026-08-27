import assert from 'node:assert/strict';
import { getMobilePlatform, getUserAgentPatterns } from '../../utils/mobilePlatform';
import { getLocationConfig, type LocationKey } from '../../config/locations/locationConfig';
import { resolveFeature } from '../../config/features/featureExpectations';
import {
  assertLeadFormSubmissionSuccess,
  getLeadFormErrorSnapshot,
} from '../../utils/leadform/mobileLeadFormHelper';

export class MobileWebBasePage {
  driver: MobileBrowser;

  /** Sets up the page object with the locators it needs. */
  constructor(driver: MobileBrowser = browser) {
    this.driver = driver;
  }

  /** Opens the configured home page. */
  async open(path = '/') {
    this.logMobileStep('ACTION', `Open mobile page: ${path}`);
    await this.navigateTo(path);
    await this.waitForPageReady();
    await this.acceptCookiesIfVisible();
    await this.dismissPromoPopupIfPresent();
  }

  /** Checks whether an error means the mobile session was lost. */
  isSessionLostError(error) {
    return /invalid session id|browser has closed the connection|disconnected|chrome not reachable/i.test(
      String(error?.message || error),
    );
  }

  /** Checks whether an error came from a mobile navigation timeout. */
  isNavigationTimeoutError(error) {
    return /timeout|timed out receiving message from renderer|unable to receive message from renderer/i.test(
      String(error?.message || error),
    );
  }

  /** Checks whether Chrome is still on a native or blank startup URL. */
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

  /** Opens the requested URL and waits for a usable page. */
  async navigateTo(path) {
    const beforeUrl = await this.driver.getUrl().catch(() => '');
    const targetUrl = this.resolveNavigationUrl(path);

    try {
      this.logMobileStep('ACTION', `Navigate to ${targetUrl}`);
      await this.driver.url(targetUrl);
      await this.waitForMobileNavigation(targetUrl, beforeUrl);
      const afterUrl = await this.driver.getUrl().catch(() => '');

      if (this.isChromeNativeUrl(afterUrl)) {
        this.logStep(`Mobile Chrome stayed on ${afterUrl}; retrying navigation to ${targetUrl}`);
        await this.driver.url(targetUrl);
        await this.waitForMobileNavigation(targetUrl, afterUrl);
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

  /** Waits until mobile browser navigation leaves native/blank Chrome state and has usable DOM. */
  async waitForMobileNavigation(targetUrl, beforeUrl = '', timeout = 30000) {
    const expectedPath = new URL(targetUrl, 'https://placeholder.local').pathname;

    await this.driver.waitUntil(
      async () => {
        const snapshot = await this.driver
          .execute(() => ({
            bodyTextLength: (document.body?.innerText || '').trim().length,
            currentUrl: window.location.href,
            readyState: document.readyState,
          }))
          .catch(async () => ({
            bodyTextLength: 0,
            currentUrl: await this.driver.getUrl().catch(() => ''),
            readyState: '',
          }));

        if (!snapshot.currentUrl || this.isChromeNativeUrl(snapshot.currentUrl)) {
          return false;
        }

        const currentPath = new URL(snapshot.currentUrl, 'https://placeholder.local').pathname;
        const reachedTargetPath = currentPath === expectedPath;
        const movedFromPreviousUrl = beforeUrl ? snapshot.currentUrl !== beforeUrl : true;
        const hasUsableDom = snapshot.readyState !== 'loading' || snapshot.bodyTextLength > 20;

        return hasUsableDom && (reachedTargetPath || movedFromPreviousUrl);
      },
      {
        timeout,
        timeoutMsg: `Mobile navigation did not settle on ${targetUrl}`,
      },
    );
  }

  /** Reloads the mobile browser session after session loss. */
  async reloadSessionAfterLoss() {
    if (typeof this.driver.reloadSession !== 'function') {
      throw new Error('Mobile Chrome session was lost and this driver cannot reload the session.');
    }

    await this.driver.reloadSession();
  }

  /** Waits until the page is ready for interaction. */
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
      },
    );

    if (sessionLostError) {
      throw sessionLostError;
    }

    await this.dismissBlockingOverlaysIfPresent();
  }

  /**
   * Returns the first visible selector from an explicit candidate list.
   *
   * Mobile uses DOM execution heavily, so this helper heals selector strings
   * before those scripts run. If no fallback is usable it returns the primary
   * selector, preserving the original failure behavior.
   */
  async healMobileSelector(
    label,
    candidates,
    options: { minimumCount?: number; requireVisible?: boolean } = {},
  ) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw new Error(`No self-healing selector candidates provided for ${label}`);
    }

    const minimumCount = options.minimumCount ?? 1;
    const requireVisible = options.requireVisible ?? true;
    const primary = candidates[0];

    const match = await this.driver.execute(
      ({ candidates, minimumCount, requireVisible }) => {
        const isVisible = (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            rect.width > 0 &&
            rect.height > 0
          );
        };

        for (let index = 0; index < candidates.length; index += 1) {
          const candidate = candidates[index];
          const elements = Array.from(document.querySelectorAll(candidate.selector));
          const count = requireVisible ? elements.filter(isVisible).length : elements.length;

          if (count >= minimumCount) {
            return { candidate, index };
          }
        }

        return null;
      },
      { candidates, minimumCount, requireVisible },
    );

    if (match?.candidate) {
      if (match.index > 0) {
        this.logMobileStep(
          'RESULT',
          `Self-healed selector: ${label}. Primary failed: ${primary.selector}; fallback used: ${match.candidate.selector}`,
        );
      }

      return match.candidate.selector;
    }

    this.logMobileStep(
      'RESULT',
      `Self-healing fallback not found: ${label}. Using primary selector: ${primary.selector}`,
    );

    return primary.selector;
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
      const elements = selectors.flatMap((selector) =>
        Array.from(document.querySelectorAll(selector)),
      );
      const button = elements.find((element) => {
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        const label = element.getAttribute('aria-label') || '';
        const id = element.id || '';
        const className = element.getAttribute('class') || '';
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          /accept|agree|allow|save|confirm|continue|close/i.test(
            `${text} ${label} ${id} ${className}`,
          ) &&
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
      await this.waitForMobileCondition(
        async () =>
          this.driver.execute(() => {
            const visibleOverlay = Array.from(
              document.querySelectorAll(
                '#onetrust-consent-sdk, #onetrust-banner-sdk, #onetrust-pc-sdk',
              ),
            ).find((element) => {
              if (!(element instanceof HTMLElement)) {
                return false;
              }

              const style = window.getComputedStyle(element);
              const rect = element.getBoundingClientRect();

              return style.visibility !== 'hidden' && style.display !== 'none' && rect.height > 0;
            });

            return !visibleOverlay;
          }),
        'Expected cookie overlay to close on mobile',
        5000,
      ).catch(() => undefined);
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
        await this.waitForMobileCondition(
          async () =>
            this.driver.execute(() => {
              const visibleDialog = Array.from(
                document.querySelectorAll(
                  '.ReactModal__Content, [role="dialog"], [aria-modal="true"]',
                ),
              ).find((element) => {
                if (!(element instanceof HTMLElement)) {
                  return false;
                }

                const style = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                const text = element.textContent || '';

                return (
                  style.visibility !== 'hidden' &&
                  style.display !== 'none' &&
                  rect.width > 0 &&
                  rect.height > 0 &&
                  /promo|promotion|going on now|special|offer|incentive/i.test(text)
                );
              });

              return !visibleDialog;
            }),
          'Expected promotional popup to close on mobile',
          5000,
        ).catch(() => undefined);
        return;
      }

      if (attempt === 1) {
        await this.waitForMobileCondition(
          async () =>
            this.driver.execute(() =>
              Boolean(
                document.querySelector(
                  '.ReactModal__Content, [role="dialog"], [aria-modal="true"]',
                ),
              ),
            ),
          'Optional promotional popup did not appear on first mobile check',
          750,
        ).catch(() => undefined);
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

        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        );
      };

      const clickClose = (scope: ParentNode) => {
        const closeSelectors = [
          'button[aria-label*="close" i]',
          'button[class*="close" i]',
          '[aria-label*="close" i]',
          '[class*="close" i]',
          'button:has(svg)',
          'button',
        ];
        const candidates = closeSelectors.flatMap((selector) =>
          Array.from(scope.querySelectorAll(selector)),
        );
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
      const nationalClose = Array.from(document.querySelectorAll('button')).find(
        (element) =>
          isVisible(element) &&
          /close national promotion/i.test(
            element.getAttribute('aria-label') || element.textContent || '',
          ),
      );
      if (nationalClose instanceof HTMLElement) {
        nationalClose.click();
        return true;
      }

      const nationalDialog = document.querySelector(
        '[role="dialog"][aria-label*="National promotion" i]',
      );
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
      const dialogs = dialogSelectors.flatMap((selector) =>
        Array.from(document.querySelectorAll(selector)),
      );

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
          /going on now|learn more|view offer|promo|promotion/i.test(element.textContent || ''),
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
  async clickVisibleByText(pattern: RegExp, selectors: string[] = ['button', 'a'], label?: string) {
    const clicked = await this.driver.execute(
      ({ source, flags, selectors }) => {
        const regex = new RegExp(source, flags);
        const elements = selectors.flatMap((selector) =>
          Array.from(document.querySelectorAll(selector)),
        );
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
        (match as HTMLElement).click();
        return true;
      },
      { source: pattern.source, flags: pattern.flags, selectors },
    );

    if (clicked) {
      this.logScriptClick(label || pattern.source);
    }

    return clicked;
  }

  /** Waits until the page body contains text. */
  async waitForBodyText(pattern, timeoutMsg, timeout = 20000) {
    await this.driver.waitUntil(async () => pattern.test(await this.getBodyText()), {
      timeout,
      timeoutMsg,
    });
  }

  /** Waits until a short-lived condition after a script-driven interaction. */
  async waitForMobileCondition(condition, timeoutMsg, timeout = 10000) {
    await this.driver.waitUntil(condition, {
      timeout,
      timeoutMsg,
      interval: 250,
    });
  }

  /** Reads the visible body text. */
  async getBodyText() {
    return this.driver.execute(() => (document.body?.innerText || '').slice(0, 20000));
  }

  /** Captures the current mobile page snapshot. */
  async getSnapshot() {
    return this.driver.execute(() => ({
      bodyText: (document.body?.innerText || document.documentElement?.textContent || '').slice(
        0,
        20000,
      ),
      currentUrl: window.location.href,
      isSourceOnly:
        (document.body?.innerText || '').trim().length < 20 &&
        (document.documentElement?.textContent || '').trim().length > 1000,
      readyState: document.readyState,
      title: document.title,
      userAgent: navigator.userAgent,
    }));
  }

  /** Fails fast if the browser landed on an error page. */
  assertNoErrorPage(snapshot) {
    assert.doesNotMatch(snapshot.bodyText, /404|page not found|server error/i);
  }

  /** Checks that the browser user agent matches the configured mobile platform (Android Chrome / iOS Safari). */
  expectMobileUserAgent(userAgent) {
    const platform = getMobilePlatform();
    const { device, browser } = getUserAgentPatterns();

    assert.match(
      userAgent,
      device,
      `Expected ${platform} device user agent, received: ${userAgent}`,
    );
    assert.match(
      userAgent,
      browser,
      `Expected ${platform} browser user agent, received: ${userAgent}`,
    );
  }

  // MEDIA VALIDATION Shared by every mobile page that checks its image/video URLs; the pages differ only in how they open themselves.

  /** Scrolls the full page to trigger lazy-loaded media, then returns to the top. */
  async loadLazyMedia() {
    await this.driver.execute(async () => {
      const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
      const viewportStep = Math.max(window.innerHeight || 800, 600);
      const pageHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );

      for (let y = 0; y <= pageHeight; y += viewportStep) {
        window.scrollTo(0, y);
        await delay(250);
      }

      window.scrollTo(0, 0);
    });

    await this.waitForPageReady();
  }

  /** Collects deduplicated image/video URLs (with labels) from the page. */
  async collectImageAndVideoUrls() {
    const rawUrls = await this.driver.execute(() => {
      const media = [];
      const cleanText = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const addUrl = (type, rawUrl, element) => {
        if (!rawUrl) {
          return;
        }

        const trimmed = rawUrl.trim();

        if (!trimmed || /^(data|blob|javascript|about):/i.test(trimmed)) {
          return;
        }

        try {
          const section = element.closest(
            'section, article, main, header, footer, [role="region"], [aria-label]',
          );
          const heading = section?.querySelector('h1, h2, h3, h4, h5, h6');
          const label =
            cleanText(element.getAttribute('alt')) ||
            cleanText(element.getAttribute('aria-label')) ||
            cleanText(element.getAttribute('title')) ||
            cleanText(section?.getAttribute('aria-label')) ||
            cleanText(heading?.textContent) ||
            'No alt/section label';

          media.push({
            label,
            type,
            url: new URL(trimmed, window.location.href).href,
          });
        } catch {
          // Ignore malformed media URLs.
        }
      };
      const addSrcset = (type, srcset, element) => {
        if (!srcset) {
          return;
        }

        for (const candidate of srcset.split(',')) {
          addUrl(type, candidate.trim().split(/\s+/)[0], element);
        }
      };

      document.querySelectorAll('img').forEach((image) => {
        addUrl('image', image.currentSrc || image.src || image.getAttribute('src'), image);
        addSrcset('image', image.getAttribute('srcset'), image);
      });

      document.querySelectorAll('picture source').forEach((source) => {
        addUrl('image-source', source.getAttribute('src'), source);
        addSrcset('image-source', source.getAttribute('srcset'), source);
      });

      document.querySelectorAll('video').forEach((video) => {
        addUrl('video', video.currentSrc || video.src || video.getAttribute('src'), video);
        addUrl('video-poster', video.poster || video.getAttribute('poster'), video);
      });

      document.querySelectorAll('video source').forEach((source) => {
        addUrl('video-source', source.getAttribute('src'), source);
        addSrcset('video-source', source.getAttribute('srcset'), source);
      });

      return media;
    });

    const unique = new Map();

    for (const item of rawUrls) {
      if (
        /\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(
          item.url,
        )
      ) {
        continue;
      }

      if (!unique.has(item.url)) {
        unique.set(item.url, item);
      }
    }

    return [...unique.values()];
  }

  /** Gets the HTTP status for a media URL (HEAD, falling back to GET). */
  async getMediaUrlStatus(url) {
    const tryRequest = async (method) => {
      try {
        const response = await fetch(url, { method });
        return response.status;
      } catch (error) {
        return `request failed: ${error.message}`;
      }
    };
    const headStatus = await tryRequest('HEAD');

    if (![403, 405, 501].includes(headStatus as number) && typeof headStatus === 'number') {
      return headStatus;
    }

    return tryRequest('GET');
  }

  /** Loads lazy media, then asserts every image/video URL on the current page returns HTTP 200. */
  async assertMediaUrlsReturn200(pageName: string) {
    await this.loadLazyMedia();

    const mediaUrls = await this.collectImageAndVideoUrls();

    assert.ok(mediaUrls.length > 0, `${pageName} should expose image or video URLs`);

    const failures = [];

    for (const media of mediaUrls) {
      const status = await this.getMediaUrlStatus(media.url);
      this.logResult(
        `${pageName} media check | ${media.type} | ${status} | ${media.label} | ${media.url}`,
      );

      if (status !== 200) {
        failures.push(`${media.type} returned ${status} for ${media.label}: ${media.url}`);
      }
    }

    assert.deepEqual(
      failures,
      [],
      `${pageName} image/video URL status failures:\n${failures.join('\n')}`,
    );
  }

  // LEAD FORM SNAPSHOTS & ASSERTIONS

  /** Captures the visible lead form at the requested index. */
  async getVisibleLeadFormSnapshot(globalName: string, formIndex = 0) {
    return this.driver.execute(
      ({ globalName, index }) => {
        const forms = (window as any)[globalName]?.() || [];
        const form = forms[index] || forms[0];

        form?.scrollIntoView({ block: 'center', inline: 'center' });

        return {
          found: Boolean(form),
          hasSubmit: Boolean(
            form?.querySelector('button[type="submit"], input[type="submit"], button'),
          ),
          text: (form?.textContent || '').replace(/\s+/g, ' ').trim(),
        };
      },
      { globalName, index: formIndex },
    );
  }

  /** Captures the lead-form validation state. */
  async getFormErrorSnapshot() {
    return getLeadFormErrorSnapshot(this.driver);
  }

  /** Checks that required/validation errors are present in the lead form. */
  async assertFormErrors(message) {
    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(snapshot.text) ||
        snapshot.invalidFieldCount > 0,
      message,
    );
  }

  /** Checks that an email-format validation message is present in the lead form. */
  async assertEmailError(message) {
    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${snapshot.text} ${snapshot.emailValidationMessage} ${snapshot.emailAriaInvalid}`,
      ),
      message,
    );
  }

  /** Checks that the lead form submission success confirmation is shown. */
  async assertSubmissionSuccess(message, timeout = 30000) {
    await assertLeadFormSubmissionSuccess(this.driver, message, timeout);
  }

  /** Logs mobile step. */
  logMobileStep(kind: string, message: string, status?: unknown) {
    const cleanMessage = String(message || '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanMessage) {
      return;
    }

    if (typeof globalThis.__mobileSpecStep === 'function') {
      globalThis.__mobileSpecStep(kind, cleanMessage, status);
      return;
    }

    console.log(`${kind} ${cleanMessage}`);
  }

  // READABLE STEP LOG VOCABULARY Produces concise action-narrative lines, e.g.: Clicked on: 15 Year Loan Clicked (script) on: featured quick move-in home card 15-year term: $2519 → $2854 Opened QMI detail: https://...

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

  /**
   * Decides what a missing feature means, rather than assuming "skip".
   *
   * Reads the same declarations as BasePage.requireFeature, so a feature
   * required on desktop cannot quietly be optional on mobile.
   */
  async requireFeature(value, feature, description) {
    const { value: resolved, skipMessage } = resolveFeature(
      value,
      feature,
      description,
      getLocationConfig().country as LocationKey,
      await this.driver.getUrl(),
    );

    if (skipMessage) {
      this.logSkip(skipMessage);
    }

    return resolved;
  }
}
