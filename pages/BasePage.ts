import { expect, Locator, Page, Response, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { appendLeadApiCapture } from '../utils/leadApiCapture';
import { reportValue, step as reportStep } from '../utils/allureReporter';
import {
  buildFullUrl as buildAbsoluteUrl,
  escapeRegex,
  formatPrice as formatCurrencyPrice,
  formatPriceToUiLabel as formatPriceLabel,
  normalizeComparableText
} from '../utils/pageObjectUtils';

/* ==========================================================
   Base Page – Shared Navigation & Common Utilities
========================================================== */

export class BasePage {

  protected readonly page: Page;

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    this.page = page;
  }

  /* ==========================================================
     Navigation
  ========================================================== */

  /** Navigates to the configured page URL. */
  async navigate(overrideLocation?: LocationKey): Promise<void> {

    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(overrideLocation);

    const targetUrl = `${baseURL}/?${location.queryParam}`;

    await test.step(`Open Mattamy Homes home page for ${location.country} in ${envName}`, async () => {
    try {
      await this.page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000
      });
    } catch (error) {
      const currentUrl = this.page.url();
      const current = new URL(currentUrl);
      const target = new URL(targetUrl);
      const sameHost = current.hostname.replace(/^www\./i, '') === target.hostname.replace(/^www\./i, '');
      const reachedTarget =
        sameHost &&
        current.pathname === target.pathname &&
        current.searchParams.get('country') === target.searchParams.get('country');
      const domIsUsable = await this.page
        .evaluate(() => document.readyState !== 'loading')
        .catch(() => false);

      if (!reachedTarget || !domIsUsable) {
        await this.reportValue('Page not usable after navigation; retrying', targetUrl);
        await this.page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 90_000
        });
      } else {
        await this.reportValue('Navigation timed out after render; continuing from', currentUrl);
      }
    }

    await this.acceptCookiesIfPresent();

    // 🔹 Use common load handler instead of inline wait
    await this.waitForPageReady();
    });
  }

  /* ==========================================================
     Common Load Stabilization
  ========================================================== */

  /** Waits for page ready. */
  protected async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(3000); // same behavior as before
  }

  /**
   * Adaptive settle pause used after discrete actions (clicks, typing, tab
   * switches) where the old code had a blind `waitForTimeout(ms)`.
   *
   * Instead of always sleeping the full duration, it waits until the DOM stops
   * mutating for a short quiet window (SPA-friendly — does not rely on network
   * idle, which this SPA may never reach). It returns as soon as rendering
   * settles, never waits longer than the old fixed pause, and never throws —
   * so call sites behave exactly as before when the page keeps mutating (the
   * pause simply caps out at `ms`). Intentionally NOT used by waitForPageReady,
   * which keeps its original guaranteed pause.
   */
  protected async settle(ms: number, target: Page = this.page): Promise<void> {
    await target
      .evaluate(
        (maxMs) =>
          new Promise<void>((resolve) => {
            const quietWindow = Math.min(300, maxMs);
            let quietTimer = window.setTimeout(finish, quietWindow);
            const capTimer = window.setTimeout(finish, maxMs);
            const observer = new MutationObserver(() => {
              window.clearTimeout(quietTimer);
              quietTimer = window.setTimeout(finish, quietWindow);
            });
            observer.observe(document.documentElement, {
              childList: true,
              subtree: true,
              attributes: true,
              characterData: true,
            });
            function finish() {
              window.clearTimeout(quietTimer);
              window.clearTimeout(capTimer);
              observer.disconnect();
              resolve();
            }
          }),
        ms,
      )
      .catch(() => undefined);
  }

  /** Validates image and video urls return200. */
  async validateImageAndVideoUrlsReturn200(pageName: string): Promise<void> {
    await test.step(`Validate image and video URLs return 200 on ${pageName}`, async () => {
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent();
      await this.loadLazyMedia();
      await this.dismissPromoPopupIfPresent();

      const mediaUrls = await this.collectImageAndVideoUrls();

      expect(mediaUrls.length, `${pageName} should expose image or video URLs`).toBeGreaterThan(0);

      await this.reportValue(`${pageName}: checking ${mediaUrls.length} media URL(s)`);

      const failures: string[] = [];

      for (const media of mediaUrls) {
        const status = await this.getMediaUrlStatus(media.url);

        await this.reportValue(`[${status}] ${media.type} | ${media.label}`, media.url);

        if (status !== 200) {
          failures.push(`${media.type} returned ${status} for ${media.label}: ${media.url}`);
        }
      }

      expect(
        failures,
        `${pageName} image/video URL status failures:\n${failures.join('\n')}`
      ).toHaveLength(0);
    });
  }

  /** Loads lazy media. */
  private async loadLazyMedia(): Promise<void> {
    await this.page.evaluate(async () => {
      const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
      const viewportStep = Math.max(window.innerHeight || 800, 600);
      const pageHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );

      for (let y = 0; y <= pageHeight; y += viewportStep) {
        window.scrollTo(0, y);
        await delay(250);
      }

      window.scrollTo(0, 0);
    });

    await this.waitForPageReady();
  }

  /** Collects image and video urls. */
  private async collectImageAndVideoUrls(): Promise<Array<{ type: string; label: string; url: string }>> {
    const rawUrls = await this.page.evaluate(() => {
      const media: Array<{ type: string; label: string; url: string }> = [];
      const cleanText = (value: string | null | undefined) =>
        (value || '').replace(/\s+/g, ' ').trim();
      const getSectionLabel = (element: Element): string => {
        const directLabel =
          cleanText(element.getAttribute('alt')) ||
          cleanText(element.getAttribute('aria-label')) ||
          cleanText(element.getAttribute('title'));

        if (directLabel) return directLabel;

        const figure = element.closest('figure');
        const caption = figure?.querySelector('figcaption');
        const captionText = cleanText(caption?.textContent);

        if (captionText) return captionText;

        const section = element.closest('section, article, main, header, footer, [role="region"], [aria-label]');
        const sectionAria = cleanText(section?.getAttribute('aria-label'));

        if (sectionAria) return sectionAria;

        const heading = section?.querySelector('h1, h2, h3, h4, h5, h6');
        const headingText = cleanText(heading?.textContent);

        if (headingText) return headingText;

        const link = element.closest('a');
        const linkLabel = cleanText(link?.getAttribute('aria-label')) || cleanText(link?.textContent);

        return linkLabel || 'No alt/section label';
      };
      const addUrl = (type: string, rawUrl: string | null | undefined, element: Element) => {
        if (!rawUrl) return;

        const trimmed = rawUrl.trim();

        if (
          !trimmed ||
          /^(data|blob|javascript|about):/i.test(trimmed) ||
          /\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(trimmed)
        ) {
          return;
        }

        try {
          media.push({
            type,
            label: getSectionLabel(element),
            url: new URL(trimmed, window.location.href).href
          });
        } catch {
          // Ignore malformed media attributes.
        }
      };

      const addSrcset = (type: string, srcset: string | null | undefined, element: Element) => {
        if (!srcset) return;

        for (const candidate of srcset.split(',')) {
          addUrl(type, candidate.trim().split(/\s+/)[0], element);
        }
      };

      document.querySelectorAll('img').forEach((image) => {
        const img = image as HTMLImageElement;
        addUrl('image', img.currentSrc || img.src || img.getAttribute('src'), img);
        addSrcset('image', img.getAttribute('srcset'), img);
      });

      document.querySelectorAll('picture source').forEach((source) => {
        addUrl('image-source', source.getAttribute('src'), source);
        addSrcset('image-source', source.getAttribute('srcset'), source);
      });

      document.querySelectorAll('video').forEach((video) => {
        const mediaElement = video as HTMLVideoElement;
        addUrl('video', mediaElement.currentSrc || mediaElement.src || mediaElement.getAttribute('src'), mediaElement);
        addUrl('video-poster', mediaElement.poster || mediaElement.getAttribute('poster'), mediaElement);
      });

      document.querySelectorAll('video source').forEach((source) => {
        addUrl('video-source', source.getAttribute('src'), source);
        addSrcset('video-source', source.getAttribute('srcset'), source);
      });

      return media;
    });

    const unique = new Map<string, { type: string; label: string; url: string }>();

    for (const item of rawUrls) {
      if (this.isIgnorableMediaUrl(item.url)) {
        continue;
      }

      if (!unique.has(item.url)) {
        unique.set(item.url, item);
      }
    }

    return [...unique.values()];
  }

  /** Checks whether ignorable media URL. */
  private isIgnorableMediaUrl(url: string): boolean {
    return /\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(url);
  }

  /** Returns media URL status. */
  private async getMediaUrlStatus(url: string): Promise<number | string> {
    const headResponse = await this.page.request.head(url, {
      failOnStatusCode: false,
      timeout: 30_000
    }).catch(() => null);

    if (headResponse && ![403, 405, 501].includes(headResponse.status())) {
      return headResponse.status();
    }

    const getResponse = await this.page.request.get(url, {
      failOnStatusCode: false,
      timeout: 30_000
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      return { status: () => `request failed: ${message}` };
    });

    return getResponse.status();
  }

  /* ==========================================================
     Allure Step Reporting

     Thin instance wrappers over the shared helpers in
     utils/allureReporter so page objects can call
     this.step(...) / this.reportValue(...). Specs import the
     standalone functions directly.
  ========================================================== */

  /**
   * Runs an action inside a named Allure step so it shows as a labeled node in
   * the report tree (instead of an unnamed body with a large stdout dump).
   * Returns whatever the wrapped action returns.
   */
  protected async step<T>(name: string, body: () => Promise<T> | T): Promise<T> {
    return reportStep(name, body);
  }

  /**
   * Records an informational message (optionally with a value) as a standalone
   * named Allure step. Use this in place of console.log for diagnostics worth
   * surfacing in the report; drop purely decorative logs entirely.
   */
  protected async reportValue(message: string, value?: unknown): Promise<void> {
    await reportValue(message, value);
  }

  /* ==========================================================
     Shared Assertions
  ========================================================== */

  /** Asserts page loaded. */
  protected async assertPageLoaded(label = 'Page should be loaded'): Promise<void> {
    await test.step(label, async () => {
    await this.waitForPageReady();
    await expect(this.page, label).not.toHaveURL(/about:blank/i);
    });
  }

  /** Asserts page title. */
  protected async assertPageTitle(
    expectedTitle: string | RegExp,
    label = 'Page title should match expected value'
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(this.page, label).toHaveTitle(expectedTitle);
    });
  }

  /** Asserts page URL. */
  protected async assertPageUrl(
    expectedUrl: string | RegExp,
    label = 'Page URL should match expected value',
    timeout = 60_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(this.page, label).toHaveURL(expectedUrl, { timeout });
    });
  }

  /** Asserts page URL contains. */
  protected async assertPageUrlContains(
    expectedUrlPart: string,
    label = `Page URL should contain: ${expectedUrlPart}`,
    timeout = 60_000
  ): Promise<void> {
    await this.assertPageUrl(new RegExp(escapeRegex(expectedUrlPart), 'i'), label, timeout);
  }

  /** Asserts page URL does not match. */
  protected async assertPageUrlDoesNotMatch(
    unexpectedUrl: string | RegExp,
    label = 'Page URL should not match unexpected value'
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(this.page, label).not.toHaveURL(unexpectedUrl);
    });
  }

  /** Asserts visible. */
  protected async assertVisible(
    locator: Locator,
    label = 'Element should be visible',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toBeVisible({ timeout });
    });
  }

  /** Asserts attached. */
  protected async assertAttached(
    locator: Locator,
    label = 'Element should be attached',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toBeAttached({ timeout });
    });
  }

  /** Asserts text contains. */
  protected async assertTextContains(
    locator: Locator,
    expectedText: string | RegExp,
    label = 'Element should contain expected text',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toContainText(expectedText, { timeout });
    });
  }

  /** Asserts text. */
  protected async assertText(
    locator: Locator,
    expectedText: string | RegExp,
    label = 'Element text should match expected value',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toHaveText(expectedText, { timeout });
    });
  }

  /** Asserts body contains. */
  protected async assertBodyContains(
    expectedText: string | RegExp,
    label = 'Page body should contain expected text',
    timeout = 10_000
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('body'), expectedText, label, timeout);
  }

  /** Asserts heading visible. */
  protected async assertHeadingVisible(
    expectedName?: string | RegExp,
    label = 'Page heading should be visible',
    timeout = 20_000
  ): Promise<void> {
    const heading = expectedName
      ? this.page.getByRole('heading', { level: 1, name: expectedName }).first()
      : this.page.locator('h1').first();

    await this.assertVisible(heading, label, timeout);
  }

  /** Asserts heading contains. */
  protected async assertHeadingContains(
    expectedText: string | RegExp,
    label = 'Page heading should contain expected text',
    timeout = 20_000
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('h1').first(), expectedText, label, timeout);
  }

  /** Asserts attribute. */
  protected async assertAttribute(
    locator: Locator,
    attributeName: string,
    expectedValue: string | RegExp,
    label = `${attributeName} attribute should match expected value`,
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toHaveAttribute(attributeName, expectedValue, { timeout });
    });
  }

  /** Asserts count. */
  protected async assertCount(
    locator: Locator,
    expectedCount: number,
    label = `Element count should be ${expectedCount}`,
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toHaveCount(expectedCount, { timeout });
    });
  }

  protected assertTruthy<T>(
    value: T,
    label = 'Expected value should be present'
  ): asserts value is NonNullable<T> {
    expect(value, label).toBeTruthy();
  }

  /** Asserts greater than. */
  protected assertGreaterThan(
    actual: number,
    minimum: number,
    label = `Expected value should be greater than ${minimum}`
  ): void {
    expect(actual, label).toBeGreaterThan(minimum);
  }

  /* ==========================================================
     Cookie Handling
  ========================================================== */

  /** Accepts the cookie banner when it is visible. */
  async acceptCookiesIfPresent(): Promise<void> {

    const acceptBtn = this.page.locator('#onetrust-accept-btn-handler');

    const isVisible = await acceptBtn
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isVisible) {
      await acceptBtn.click({ force: true, timeout: 5000 }).catch(() => undefined);
    }

    const closeBtn = this.page
      .locator('.onetrust-close-btn-handler, #onetrust-close-btn-container button')
      .first();

    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.dispatchEvent('click').catch(async () => {
        await closeBtn.click({ force: true, timeout: 5000 }).catch(() => undefined);
      });
      await this.page.locator('#onetrust-banner-sdk, .ot-sdk-container')
        .first()
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => undefined);
    }
  }

  /**
   * Dismisses the promo popup / National-promotion overlay when present.
   *
   * `appearTimeout` is how long to wait for the National-promotion popup to
   * render before concluding it is absent. The popup renders a beat AFTER
   * navigation, and Playwright's `isVisible()` returns immediately (its
   * `timeout` option is ignored), so a plain check would no-op and leave the
   * promo sitting on top of the lead form where it blocks .fill()/.click().
   * Pass a positive `appearTimeout` right after navigation to wait for it;
   * leave it 0 (default) in tight loops where the popup is already handled so
   * the check does not wait.
   */
  async dismissPromoPopupIfPresent(options: { appearTimeout?: number } = {}): Promise<void> {
    await this.acceptCookiesIfPresent();

    const appearTimeout = options.appearTimeout ?? 0;
    // Case-insensitive / contains match: the aria-label varies across pages
    // ("National promotion", "National Promotion popup", ...).
    const nationalPromotionDialog = this.page
      .locator('[role="dialog"][aria-label*="promotion" i]:visible, [aria-label="National promotion"]:visible')
      .first();

    if (appearTimeout > 0) {
      await nationalPromotionDialog.waitFor({ state: 'visible', timeout: appearTimeout }).catch(() => undefined);
    }

    if (await nationalPromotionDialog.isVisible().catch(() => false)) {
      await this.closeNationalPromotion(nationalPromotionDialog);
      await this.settle(500);
      return;
    }

    const dialogs = this.page
      .locator(
        [
          '.ReactModal__Content:visible',
          '[role="dialog"]:visible',
          '[aria-modal="true"]:visible',
          '.ReactModalPortal [class*="modal" i]:visible',
          '.ReactModalPortal [class*="content" i]:visible'
        ].join(', ')
      )
      .filter({
        hasNot: this.page.locator('form, input, select, textarea'),
        has: this.page.locator('button, a, img')
      });
    const dialogCount = await dialogs.count();

    for (let index = 0; index < dialogCount; index++) {
      const dialog = dialogs.nth(index);

      if (!(await dialog.isVisible({ timeout: 500 }).catch(() => false))) {
        continue;
      }

      const dialogText = await dialog.innerText().catch(() => '');

      const hasPromoMedia = await dialog.locator('img, picture, video').count() > 0;
      const hasPromoCta = await dialog
        .locator('button, a')
        .filter({ hasText: /going on now|learn more|view offer|promo|promotion/i })
        .count() > 0;

      if (!/promo|promotion|banner|going on now|special|offer|incentive/i.test(dialogText) && !hasPromoMedia && !hasPromoCta) {
        continue;
      }

      const closeButton = dialog
        .locator(
          [
            'button[aria-label*="close" i]',
            'button[class*="close" i]',
            'button:has-text("Close")',
            'button:has-text("Close Icon")',
            'button:has(svg)',
            'svg[aria-label*="close" i]',
            '[aria-label*="close" i]',
            '[class*="close" i]'
          ].join(', ')
        )
        .first();

      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click({ force: true }).catch(async () => {
          await closeButton.dispatchEvent('click').catch(() => undefined);
        });
      } else {
        await this.page.keyboard.press('Escape').catch(() => undefined);
      }

      await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    }
  }

  /**
   * Closes the National-promotion overlay: click its close button (matching the
   * varying aria-label / class) and press Escape, retrying briefly, then remove
   * the overlay from the DOM as a last resort so a stuck promo cannot sit on top
   * of a lead form and block .fill()/.click() until the action times out.
   */
  private async closeNationalPromotion(dialog: Locator): Promise<void> {
    const closeButton = this.page
      .getByRole('button', { name: /close national promotion popup|close national promotion|^close$/i })
      .or(dialog.locator('button[aria-label*="close" i], button[class*="close" i], button:has-text("×"), button:has-text("✕")'))
      .first();

    for (let attempt = 0; attempt < 3 && (await dialog.isVisible().catch(() => false)); attempt++) {
      await closeButton.click({ force: true, timeout: 2000 }).catch(async () => {
        await closeButton.dispatchEvent('click').catch(() => undefined);
      });
      await this.page.keyboard.press('Escape').catch(() => undefined);
      await dialog.waitFor({ state: 'hidden', timeout: 1500 }).catch(() => undefined);
    }

    if (await dialog.isVisible().catch(() => false)) {
      await dialog.evaluate((element) => {
        const overlay = element.closest('[class*="overlay" i], [class*="ReactModal__Overlay" i], [class*="backdrop" i]');
        (overlay ?? element).remove();
      }).catch(() => undefined);
    }
  }

  /** Ensures the configured header country is selected when the selector is visible. */
  protected async ensureConfiguredCountrySelected(): Promise<void> {
    const expectedCountry = getLocationConfig().country === 'USA' ? 'USA' : 'CANADA';
    const countrySelector = this.page
      .locator('button[aria-label^="Select your country."]')
      .first();

    if (!(await countrySelector.isVisible({ timeout: 5000 }).catch(() => false))) {
      return;
    }

    const currentLabel = await countrySelector.getAttribute('aria-label').catch(() => '');
    const currentText = await countrySelector.innerText().catch(() => '');

    if (
      new RegExp(`${expectedCountry} country is selected`, 'i').test(currentLabel ?? '') ||
      new RegExp(`^\\s*${expectedCountry}\\s*$`, 'i').test(currentText)
    ) {
      return;
    }

    await countrySelector.click({ force: true });
    await this.settle(500);

    const expectedCountryButton = this.page
      .getByRole('button', { name: new RegExp(`^${expectedCountry}$`, 'i') })
      .last();

    if (await expectedCountryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expectedCountryButton.click({ force: true });
      await this.waitForPageReady();
    }

    await expect
      .poll(
        async () => {
          const label = await countrySelector.getAttribute('aria-label').catch(() => '');
          const text = await countrySelector.innerText().catch(() => '');
          return `${label} ${text}`;
        },
        {
          message: `Header country selector should show ${expectedCountry}`,
          timeout: 10000
        }
      )
      .toMatch(new RegExp(`${expectedCountry}(?: country is selected)?`, 'i'));
  }

  /* ==========================================================
  Scroll Handler 
  ========================================================== */

  /** Scrolls to the requested page position. */
  protected async scrollTo(locator: Locator): Promise<void> {

    await locator.waitFor({ state: 'attached', timeout: 10000 });

    await locator.evaluate((el) => {
      el.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'nearest'
      });
    });

    await this.page.waitForTimeout(800);
  }
  /* ==========================================================
  Helper
  ========================================================== */

  /** Builds full URL. */
  protected buildFullUrl(relativeUrl: string | null): string {
    return buildAbsoluteUrl(relativeUrl, this.page.url());
  }

  /** Formats price. */
  protected formatPrice(price: number): string {
    return formatCurrencyPrice(price);
  }

  /* ==========================================================
     Utils (NEW - stable reusable helpers)
  ========================================================== */

  /** Clicks element. */
  protected async clickElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();

    await Promise.all([
      this.waitForPageReady(), // SPA-safe wait
      locator.click()
    ]);
  }

  /** Checks whether section visible. */
  protected async isSectionVisible(locator: Locator, timeout = 7000): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  /** Normalizes text. */
  protected normalizeText(text: string): string {
    return normalizeComparableText(text);
  }

  /** Formats price to ui label. */
  protected formatPriceToUiLabel(price: number): string {
    return formatPriceLabel(price);
  }

  /** Submits lead form and capture api. */
  protected async submitLeadFormAndCaptureApi(options: {
    formName: string;
    submitButton: Locator;
    successMessage: Locator;
    successModal?: Locator;
    validateApiResponse?: boolean;
    timeout?: number;
    notes?: string;
  }): Promise<void> {
    const timeout = options.timeout ?? 30_000;
    const apiResponsePromise = this.waitForLeadApiResponse(timeout);

    await options.submitButton.scrollIntoViewIfNeeded();
    await expect(options.submitButton, `${options.formName} submit button should be visible before submit`)
      .toBeVisible({ timeout: 10_000 });

    await options.submitButton.click({
      force: true,
      noWaitAfter: true,
      timeout: 5_000
    });

    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);

    if (options.successModal && await options.successModal.count()) {
      await expect(options.successModal.last(), `${options.formName} success modal should be displayed`)
        .toBeVisible({ timeout });
    }

    await expect(options.successMessage, `${options.formName} success message should be displayed`)
      .toBeVisible({ timeout });

    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);

    const apiResponse = await apiResponsePromise;
    const responseData = apiResponse
      ? await this.readResponseData(apiResponse)
      : '';
    const outputFile = await appendLeadApiCapture({
      capturedAt: new Date().toISOString(),
      pageUrl: this.page.url(),
      formName: options.formName,
      requestMethod: apiResponse?.request().method() ?? '',
      requestUrl: apiResponse?.url() ?? '',
      responseStatus: apiResponse?.status() ?? '',
      responseData,
      notes: apiResponse ? options.notes : 'No matching lead API response captured'
    });

    if (!apiResponse && process.env.REQUIRE_LEAD_API_CAPTURE === 'true') {
      throw new Error(`${options.formName} succeeded, but no matching lead API response was captured.`);
    }

    if (options.validateApiResponse) {
      expect(apiResponse, `${options.formName} should capture a matching lead API response`).toBeTruthy();
      expect(apiResponse!.status(), `${options.formName} lead API response should be successful`)
        .toBeGreaterThanOrEqual(200);
      expect(apiResponse!.status(), `${options.formName} lead API response should be successful`)
        .toBeLessThan(400);
    }

    await this.reportValue(`${options.formName} lead API data saved to`, outputFile);
  }

  /** Waits for lead api response. */
  private async waitForLeadApiResponse(timeout: number): Promise<Response | null> {
    return this.page.waitForResponse(
      (response) => this.isLeadApiResponse(response),
      { timeout }
    ).catch(() => null);
  }

  /** Checks whether lead api response. */
  private isLeadApiResponse(response: Response): boolean {
    const request = response.request();
    const method = request.method().toUpperCase();

    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return false;
    }

    const url = response.url();
    const configuredPattern = process.env.LEAD_API_URL_PATTERN;

    if (configuredPattern) {
      return new RegExp(configuredPattern, 'i').test(url);
    }

    if (/google|analytics|doubleclick|facebook|bing|hotjar|onetrust|browserstack/i.test(url)) {
      return false;
    }

    return /api|lead|form|contact|schedule|sitecore|submit|visitor|salesforce|eloqua|marketo/i.test(url);
  }

  /** Reads response data for API validation. */
  private async readResponseData(response: Response): Promise<string> {
    const contentType = response.headers()['content-type'] ?? '';

    try {
      if (/json/i.test(contentType)) {
        return JSON.stringify(await response.json());
      }

      return await response.text();
    } catch (error) {
      return `Unable to read response body: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

}
