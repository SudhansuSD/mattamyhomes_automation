const assert = require('node:assert/strict');

class MobileWebBasePage {
  constructor(driver = browser) {
    this.driver = driver;
  }

  async open(path = '/') {
    await this.driver.url(path);
    await this.waitForPageReady();
    await this.acceptCookiesIfVisible();
  }

  async waitForPageReady(timeout = 30000) {
    await this.driver.waitUntil(
      async () => (await this.driver.execute(() => document.readyState)) === 'complete',
      {
        timeout,
        timeoutMsg: 'Mobile web page did not finish loading',
      }
    );
  }

  async acceptCookiesIfVisible() {
    await this.removeCookieOverlays();
  }

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

  async scrollIntoView(selectorOrElement) {
    await this.driver.execute((target) => {
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      element?.scrollIntoView({ block: 'center', inline: 'center' });
    }, selectorOrElement);
    await this.driver.pause(500);
  }

  async clickVisibleByText(pattern, selectors = ['button', 'a']) {
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

    return clicked;
  }

  async waitForBodyText(pattern, timeoutMsg, timeout = 20000) {
    await this.driver.waitUntil(
      async () => pattern.test(await this.getBodyText()),
      { timeout, timeoutMsg }
    );
  }

  async getBodyText() {
    return this.driver.execute(() => document.body?.innerText || '');
  }

  async getSnapshot() {
    return this.driver.execute(() => ({
      bodyText: document.body?.innerText || '',
      currentUrl: window.location.href,
      readyState: document.readyState,
      title: document.title,
      userAgent: navigator.userAgent,
    }));
  }

  assertNoErrorPage(snapshot) {
    assert.doesNotMatch(snapshot.bodyText, /404|page not found|server error/i);
  }
}

module.exports = { MobileWebBasePage };
