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
  normalizeComparableText,
} from '../utils/pageObjectUtils';

type SelfHealingLocatorCandidate = {
  locator: Locator;
  selector: string;
};

type SelfHealingLocatorOptions = {
  minimumCount?: number;
  state?: 'attached' | 'visible';
  timeout?: number;
};

// Base Page – Shared Navigation & Common Utilities

export class BasePage {
  protected readonly page: Page;
  private consentHandlersRegistered = false;
  private loadStateWaitedForUrl?: string;

  /**
   * Country this page object is pinned to, if any.
   *
   * Some pages only exist for one country — MPC is USA-only, condo community
   * and condo plan are Canada-only. Those page objects pin their country here
   * so they navigate, select the header country, and read location data for
   * that country no matter which LOCATION the run was launched with.
   * Left undefined, every lookup resolves from LOCATION exactly as before.
   */
  protected readonly locationOverride?: LocationKey;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page, locationOverride?: LocationKey) {
    this.page = page;
    this.locationOverride = locationOverride;
  }

  /** Location data for this page object — its pinned country, else LOCATION. */
  protected get location() {
    return getLocationConfig(this.locationOverride);
  }

  // Navigation

  /** Opens the configured page URL. */
  async navigate(overrideLocation?: LocationKey): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(overrideLocation ?? this.locationOverride);

    const targetUrl = `${baseURL}/?${location.queryParam}`;

    await test.step(`Open Mattamy Homes home page for ${location.country} in ${envName}`, async () => {
      await this.registerConsentDialogHandlers();
      try {
        await this.page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        });
      } catch (_error) {
        const currentUrl = this.page.url();
        const current = new URL(currentUrl);
        const target = new URL(targetUrl);
        const sameHost =
          current.hostname.replace(/^www\./i, '') === target.hostname.replace(/^www\./i, '');
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
            timeout: 90_000,
          });
        } else {
          await this.reportValue('Navigation timed out after render; continuing from', currentUrl);
        }
      }

      await this.acceptCookiesIfPresent();

      // 🔹 Use common load handler instead of inline wait
      await this.waitForPageReady();

      // Recover from the intermittent blank/unhydrated render (empty page where
      // the shell loaded but the SPA never painted) before handing control back.
      await this.ensurePageRendered();

      // Clear the National-promotion overlay here, centrally, rather than in each
      // page object that happens to remember: it renders a beat AFTER navigation
      // as a full-screen dialog and intercepts pointer events, so every flow that
      // navigates and then clicks needs it gone. appearTimeout gives it that beat
      // to show up; when it never appears this costs nothing beyond the wait.
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  /**
   * Guards against the intermittent blank/unhydrated render seen on some
   * navigations: the HTML shell loads (so the title is set and verifyPageLoaded
   * passes) but the SPA never paints, leaving an empty page where every
   * downstream locator times out. Confirms the header actually rendered and
   * reloads a few times if not, re-accepting the cookie banner after a fresh
   * render. Never throws - if it still hasn't rendered after the retries the
   * downstream assertions surface the failure as before.
   */
  protected async ensurePageRendered(): Promise<void> {
    const maxAttempts = 3;
    const header = this.page.locator('header').first();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const rendered = await header
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);

      if (rendered) {
        return;
      }

      if (attempt < maxAttempts) {
        await this.reportValue(
          `Page rendered blank (attempt ${attempt}); reloading`,
          this.page.url(),
        );
        // reload can abort ("net::ERR_ABORTED; maybe frame was detached?") when
        // the SPA kicks off its own navigation mid-reload - swallow it and let
        // the next attempt re-check, rather than failing the whole test.
        await this.page
          .reload({ waitUntil: 'domcontentloaded', timeout: 90_000 })
          .catch(() => undefined);
        await this.acceptCookiesIfPresent().catch(() => undefined);
        await this.waitForPageReady().catch(() => undefined);
      }
    }
  }

  // Common Load Stabilization

  /**
   * Waits until the page has stopped rendering.
   *
   * Was a blind `waitForTimeout(3000)` on every call - roughly 20x per test, so
   * a minute of dead clock per test even on a page that settled instantly. Now
   * waits for the DOM to go quiet, capped at the same 3s, so it returns early on
   * a fast page and behaves exactly as before on a slow one.
   *
   * The quiet window is deliberately longer than `settle`'s 300ms default: this
   * runs right after navigation, where the SPA can pause between fetching and
   * painting, and returning inside that gap would hand control back to a page
   * that has not rendered yet.
   */
  protected async waitForPageReady(): Promise<void> {
    // Arm the overlay auto-dismiss handlers here rather than only in navigate():
    // several pages goto() directly or are reached through the search flow, and
    // those never went through navigate(), so they ran unprotected. Guarded
    // internally, so repeat calls cost a boolean check.
    await this.registerConsentDialogHandlers();

    await this.page.waitForLoadState('domcontentloaded');

    // Wait for 'load' ONCE per document, not on every call. The SPA attaches its
    // handlers around 'load', so this is what stops clicks landing on an
    // unhydrated page - but on pages whose media/analytics never fire 'load' the
    // wait costs its full timeout, and waitForPageReady runs ~20x per test. Paying
    // that repeatedly took the suite from 3.2h to 5.8h. Hydration only needs
    // waiting for once per URL, so remember what we already waited on.
    const currentUrl = this.page.url();

    if (this.loadStateWaitedForUrl !== currentUrl) {
      this.loadStateWaitedForUrl = currentUrl;
      await this.page.waitForLoadState('load', { timeout: 5_000 }).catch(() => undefined);
    }

    await this.settle(3000, this.page, 750);
  }

  /** Waits until the page footer is visible, useful before validating footer-area content. */
  protected async waitForFooterSectionVisible(
    label = 'page footer',
    timeout = 15_000,
  ): Promise<void> {
    // Not every page renders a <footer> tag - the market pages use
    // <div role="contentinfo">, where a tag-only locator never resolves and the
    // scroll below just times out.
    const footer = this.page.locator('footer, [role="contentinfo"]').first();

    await this.waitForPageReady();
    await expect(footer, `Footer should be visible before validating ${label}`).toBeVisible({
      timeout,
    });
    await this.waitForPageReady();
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
   * pause simply caps out at `ms`).
   *
   * `quietWindowMs` is how long the DOM must stay unchanged before this returns;
   * `waitForPageReady` passes a longer one because it runs right after
   * navigation, where the SPA can pause mid-render.
   *
   * The `ms` cap is enforced from Node, not only by the in-page timers: those
   * timers cannot fire while the renderer's main thread is blocked, and
   * `page.evaluate` has no timeout of its own (unlike actions, which get
   * `actionTimeout`). A busy or dying renderer therefore used to hang here for
   * as long as the test had left - one plan-detail run burned its whole 5-minute
   * budget inside a single `settle(3000)`.
   */
  protected async settle(
    ms: number,
    target: Page = this.page,
    quietWindowMs = Math.min(300, ms),
  ): Promise<void> {
    const domQuiet = target
      .evaluate(
        ([maxMs, quietMs]) =>
          new Promise<void>((resolve) => {
            const quietWindow = Math.min(quietMs, maxMs);
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
        [ms, quietWindowMs] as const,
      )
      .catch(() => undefined);

    // Deliberately not awaiting domQuiet on its own: whichever finishes first
    // wins, and the loser is already .catch()-guarded so a still-pending
    // evaluate cannot surface as an unhandled rejection later.
    let deadline: NodeJS.Timeout | undefined;

    await Promise.race([
      domQuiet,
      new Promise<void>((resolve) => {
        deadline = setTimeout(resolve, ms + 2_000);
      }),
    ]);

    if (deadline) {
      clearTimeout(deadline);
    }
  }

  /** Checks that image and video URLs return HTTP 200. */
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
        `${pageName} image/video URL status failures:\n${failures.join('\n')}`,
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

  /** Collects image and video URLs. */
  private async collectImageAndVideoUrls(): Promise<
    Array<{ type: string; label: string; url: string }>
  > {
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

        const section = element.closest(
          'section, article, main, header, footer, [role="region"], [aria-label]',
        );
        const sectionAria = cleanText(section?.getAttribute('aria-label'));

        if (sectionAria) return sectionAria;

        const heading = section?.querySelector('h1, h2, h3, h4, h5, h6');
        const headingText = cleanText(heading?.textContent);

        if (headingText) return headingText;

        const link = element.closest('a');
        const linkLabel =
          cleanText(link?.getAttribute('aria-label')) || cleanText(link?.textContent);

        return linkLabel || 'No alt/section label';
      };
      const addUrl = (type: string, rawUrl: string | null | undefined, element: Element) => {
        if (!rawUrl) return;

        const trimmed = rawUrl.trim();

        if (
          !trimmed ||
          /^(data|blob|javascript|about):/i.test(trimmed) ||
          /\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(
            trimmed,
          )
        ) {
          return;
        }

        try {
          media.push({
            type,
            label: getSectionLabel(element),
            url: new URL(trimmed, window.location.href).href,
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
        addUrl(
          'video',
          mediaElement.currentSrc || mediaElement.src || mediaElement.getAttribute('src'),
          mediaElement,
        );
        addUrl(
          'video-poster',
          mediaElement.poster || mediaElement.getAttribute('poster'),
          mediaElement,
        );
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
    return /\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(
      url,
    );
  }

  /** Gets the HTTP status for a media URL. */
  private async getMediaUrlStatus(url: string): Promise<number | string> {
    const headResponse = await this.page.request
      .head(url, {
        failOnStatusCode: false,
        timeout: 30_000,
      })
      .catch(() => null);

    if (headResponse && ![403, 405, 501].includes(headResponse.status())) {
      return headResponse.status();
    }

    const getResponse = await this.page.request
      .get(url, {
        failOnStatusCode: false,
        timeout: 30_000,
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        return { status: () => `request failed: ${message}` };
      });

    return getResponse.status();
  }

  // Allure Step Reporting Thin instance wrappers over the shared helpers in utils/allureReporter so page objects can call this.step(...) / this.reportValue(...). Specs import the standalone functions directly.

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

  /**
   * Returns the first candidate locator that is currently usable.
   *
   * Self-healing is deliberately limited to explicit fallback selectors. When
   * no fallback matches, the primary locator is returned so the original test
   * failure remains visible.
   */
  protected async healLocator(
    label: string,
    candidates: SelfHealingLocatorCandidate[],
    options: SelfHealingLocatorOptions = {},
  ): Promise<Locator> {
    if (candidates.length === 0) {
      throw new Error(`No self-healing locator candidates provided for ${label}`);
    }

    const minimumCount = options.minimumCount ?? 1;
    const state = options.state ?? 'visible';
    const timeout = options.timeout ?? 750;
    const primary = candidates[0];

    for (const [index, candidate] of candidates.entries()) {
      const locator = candidate.locator;
      const count = await locator.count().catch(() => 0);

      if (count < minimumCount) {
        continue;
      }

      const isUsable = await locator
        .first()
        .waitFor({ state, timeout })
        .then(() => true)
        .catch(() => false);

      if (!isUsable) {
        continue;
      }

      if (index > 0) {
        await this.reportValue(
          `Self-healed locator: ${label}`,
          `Primary failed: ${primary.selector}; fallback used: ${candidate.selector}`,
        );
      }

      return locator;
    }

    await this.reportValue(
      `Self-healing fallback not found: ${label}`,
      `Using primary selector so the test fails normally: ${primary.selector}`,
    );

    return primary.locator;
  }

  // Shared Assertions

  /** Checks that the page loaded. */
  protected async assertPageLoaded(label = 'Page should be loaded'): Promise<void> {
    await test.step(label, async () => {
      await this.waitForPageReady();
      await expect(this.page, label).not.toHaveURL(/about:blank/i);
    });
  }

  /** Checks the page title. */
  protected async assertPageTitle(
    expectedTitle: string | RegExp,
    label = 'Page title should match expected value',
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(this.page, label).toHaveTitle(expectedTitle);
    });
  }

  /** Checks the page URL. */
  protected async assertPageUrl(
    expectedUrl: string | RegExp,
    label = 'Page URL should match expected value',
    timeout = 60_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(this.page, label).toHaveURL(expectedUrl, { timeout });
    });
  }

  /** Checks that the page URL contains the expected value. */
  protected async assertPageUrlContains(
    expectedUrlPart: string,
    label = `Page URL should contain: ${expectedUrlPart}`,
    timeout = 60_000,
  ): Promise<void> {
    await this.assertPageUrl(new RegExp(escapeRegex(expectedUrlPart), 'i'), label, timeout);
  }

  /** Checks that the page URL does not match an unexpected value. */
  protected async assertPageUrlDoesNotMatch(
    unexpectedUrl: string | RegExp,
    label = 'Page URL should not match unexpected value',
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(this.page, label).not.toHaveURL(unexpectedUrl);
    });
  }

  /** Checks that the element is visible. */
  protected async assertVisible(
    locator: Locator,
    label = 'Element should be visible',
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toBeVisible({ timeout });
    });
  }

  /** Checks that the element is attached to the DOM. */
  protected async assertAttached(
    locator: Locator,
    label = 'Element should be attached',
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toBeAttached({ timeout });
    });
  }

  /** Checks that the text contains the expected value. */
  protected async assertTextContains(
    locator: Locator,
    expectedText: string | RegExp,
    label = 'Element should contain expected text',
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toContainText(expectedText, { timeout });
    });
  }

  /** Checks the text exactly. */
  protected async assertText(
    locator: Locator,
    expectedText: string | RegExp,
    label = 'Element text should match expected value',
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toHaveText(expectedText, { timeout });
    });
  }

  /** Checks that the page body contains the expected text. */
  protected async assertBodyContains(
    expectedText: string | RegExp,
    label = 'Page body should contain expected text',
    timeout = 10_000,
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('body'), expectedText, label, timeout);
  }

  /** Checks that the page heading is visible. */
  protected async assertHeadingVisible(
    expectedName?: string | RegExp,
    label = 'Page heading should be visible',
    timeout = 20_000,
  ): Promise<void> {
    const heading = expectedName
      ? this.page.getByRole('heading', { level: 1, name: expectedName }).first()
      : this.page.locator('h1').first();

    await this.assertVisible(heading, label, timeout);
  }

  /** Checks that the page heading contains the expected text. */
  protected async assertHeadingContains(
    expectedText: string | RegExp,
    label = 'Page heading should contain expected text',
    timeout = 20_000,
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('h1').first(), expectedText, label, timeout);
  }

  /** Checks an element attribute. */
  protected async assertAttribute(
    locator: Locator,
    attributeName: string,
    expectedValue: string | RegExp,
    label = `${attributeName} attribute should match expected value`,
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toHaveAttribute(attributeName, expectedValue, { timeout });
    });
  }

  /** Checks the locator count. */
  protected async assertCount(
    locator: Locator,
    expectedCount: number,
    label = `Element count should be ${expectedCount}`,
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toHaveCount(expectedCount, { timeout });
    });
  }

  protected assertTruthy<T>(
    value: T,
    label = 'Expected value should be present',
  ): asserts value is NonNullable<T> {
    expect(value, label).toBeTruthy();
  }

  /** Checks that the actual value is greater than the minimum. */
  protected assertGreaterThan(
    actual: number,
    minimum: number,
    label = `Expected value should be greater than ${minimum}`,
  ): void {
    expect(actual, label).toBeGreaterThan(minimum);
  }

  // Cookie Handling

  /**
   * Registers auto-dismiss handlers for late-appearing consent dialogs.
   *
   * A "Privacy" consent dialog can load a beat after navigation and intercept
   * clicks/navigation - it blocks the About > Careers navigation, leaving the
   * URL on the home page so the route wait times out. addLocatorHandler runs the
   * dismissal whenever the dialog obscures an action and then retries the
   * action, so the navigation proceeds. Registered once per page; safe to call
   * repeatedly.
   */
  private async registerConsentDialogHandlers(): Promise<void> {
    if (this.consentHandlersRegistered) {
      return;
    }
    this.consentHandlersRegistered = true;

    const privacyDialog = this.page.getByRole('dialog', { name: /privacy/i });

    await this.page.addLocatorHandler(privacyDialog, async (dialog) => {
      const dismissButton = dialog
        .getByRole('button', { name: /close|accept|agree|got it|ok/i })
        .first();

      if (await dismissButton.isVisible().catch(() => false)) {
        await dismissButton.click({ force: true }).catch(() => undefined);
      } else {
        await this.page.keyboard.press('Escape').catch(() => undefined);
      }
    });

    // The National-promotion overlay behaves the same way but worse: it renders a
    // beat after navigation AND can come back later (route change, timer), so a
    // one-shot dismissal after navigate() misses it on pages reached through the
    // search flow. A locator handler dismisses it whenever it actually obscures
    // an action and then retries the action, on every page, for the whole test -
    // which is what the scattered dismissPromoPopupIfPresent() calls could not do.
    const promotionOverlay = this.page
      .locator('[role="dialog"][aria-label*="promotion" i], [aria-label="National promotion"]')
      .first();

    await this.page.addLocatorHandler(
      promotionOverlay,
      async (overlay) => {
        await this.closeNationalPromotion(overlay);
      },
      // The overlay can reappear, so this must stay armed for the whole test
      // rather than firing once.
      { noWaitAfter: true },
    );
  }

  /** Accepts the cookie banner when it is visible. */
  async acceptCookiesIfPresent(): Promise<void> {
    const acceptBtn = this.page.locator('#onetrust-accept-btn-handler');

    const isVisible = await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false);

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
      await this.page
        .locator('#onetrust-banner-sdk, .ot-sdk-container')
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
      .locator(
        '[role="dialog"][aria-label*="promotion" i]:visible, [aria-label="National promotion"]:visible',
      )
      .first();

    if (appearTimeout > 0) {
      await nationalPromotionDialog
        .waitFor({ state: 'visible', timeout: appearTimeout })
        .catch(() => undefined);
    }

    if (await nationalPromotionDialog.isVisible().catch(() => false)) {
      await this.closeNationalPromotion(nationalPromotionDialog);
      await this.settle(500);
      await this.clearStaleModalAriaHidden();
      return;
    }

    const dialogs = this.page
      .locator(
        [
          '.ReactModal__Content:visible',
          '[role="dialog"]:visible',
          '[aria-modal="true"]:visible',
          '.ReactModalPortal [class*="modal" i]:visible',
          '.ReactModalPortal [class*="content" i]:visible',
        ].join(', '),
      )
      .filter({
        hasNot: this.page.locator('form, input, select, textarea'),
        has: this.page.locator('button, a, img'),
      });
    const dialogCount = await dialogs.count();

    for (let index = 0; index < dialogCount; index++) {
      const dialog = dialogs.nth(index);

      if (!(await dialog.isVisible({ timeout: 500 }).catch(() => false))) {
        continue;
      }

      const dialogText = await dialog.innerText().catch(() => '');

      const hasPromoMedia = (await dialog.locator('img, picture, video').count()) > 0;
      const hasPromoCta =
        (await dialog
          .locator('button, a')
          .filter({ hasText: /going on now|learn more|view offer|promo|promotion/i })
          .count()) > 0;

      if (
        !/promo|promotion|banner|going on now|special|offer|incentive/i.test(dialogText) &&
        !hasPromoMedia &&
        !hasPromoCta
      ) {
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
            '[class*="close" i]',
          ].join(', '),
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

    await this.clearStaleModalAriaHidden();
  }

  /**
   * Clears react-modal's page-level state when no modal is actually mounted.
   *
   * While a modal is open react-modal marks its app element `aria-hidden="true"`
   * and puts `ReactModal__Body--open` on <body>, and undoes both from its own
   * close handler. Every dismissal in this class closes those overlays the blunt
   * way - force click, dispatchEvent, Escape, and finally `.remove()` on the
   * overlay in closeNationalPromotion - so the modal goes away without that
   * handler ever running and `#root` stays aria-hidden for the rest of the test.
   *
   * That one leftover attribute takes the whole page out of the accessibility
   * tree, so every role-based lookup matches nothing while the page still looks
   * perfectly normal on screen. On the USA community page it drops
   * `getByRole('button', { name: /submit/i })` from 2 matches to 0 and
   * `getByRole('textbox')` from 14 to 0 - which is how an open, visible form
   * ends up reported as "not present on the page".
   *
   * The guard checks for a *visible* promotion/notification overlay rather than
   * for any `.ReactModal__Content`: the promotion overlay is itself a mounted
   * `.ReactModal__Content`, so the broader check skipped exactly when the flag
   * needed clearing. Clearing it can't hide a real dialog either - react-modal
   * portals its overlays outside `#root`, and the Get Information flyout is not
   * a react-modal at all.
   */
  protected async clearStaleModalAriaHidden(): Promise<void> {
    await this.page
      .evaluate(() => {
        const isVisible = (element: Element): boolean => {
          const box = element.getBoundingClientRect();

          return box.width > 0 || box.height > 0;
        };

        const blockingOverlay = Array.from(
          document.querySelectorAll('.ReactModal__Content, [role="dialog"][aria-modal="true"]'),
        ).some(
          (element) =>
            /promotion|notification/i.test(element.getAttribute('aria-label') ?? '') &&
            isVisible(element),
        );

        if (blockingOverlay) {
          return;
        }

        document.body.classList.remove('ReactModal__Body--open');

        document
          .querySelectorAll('#root[aria-hidden="true"]')
          .forEach((element) => element.removeAttribute('aria-hidden'));
      })
      .catch(() => undefined);
  }

  /**
   * Puts the page back in the accessibility tree after the promotion popup has
   * taken it out.
   *
   * `dismissPromoPopupIfPresent` can miss the popup: it renders a beat after
   * navigation, and the wait window is kept short so pages with no promo (the
   * whole CAN site) don't pay for it on every call. A promo that mounts just
   * after that window leaves `#root` aria-hidden for the rest of the test, and
   * from there every role-based lookup quietly matches nothing - which is why
   * this only ever showed up on USA, and only sometimes.
   *
   * Re-checking here is cheaper than waiting longer up front: one attribute
   * lookup when all is well, a dismissal when it isn't. Never throws - if the
   * promo refuses to close, the click it blocks reports it and names the
   * intercepting element.
   */
  protected async ensurePageInAccessibilityTree(): Promise<void> {
    const hiddenRoot = this.page.locator('#root[aria-hidden="true"]');

    if (!(await hiddenRoot.count().catch(() => 0))) {
      return;
    }

    await this.reportValue(
      'Page was aria-hidden by the promotion popup; recovering',
      this.page.url(),
    );

    // Ends with clearStaleModalAriaHidden(), which is what actually drops the
    // leftover attribute when the overlay was removed without react-modal's own
    // close handler running.
    await this.dismissPromoPopupIfPresent();

    await expect
      .poll(() => hiddenRoot.count(), {
        message: 'The page should be back in the accessibility tree (#root not aria-hidden)',
        timeout: 5000,
      })
      .toBe(0)
      .catch(() => undefined);
  }

  /**
   * Closes the National-promotion overlay: click its close button (matching the
   * varying aria-label / class) and press Escape, retrying briefly, then remove
   * the overlay from the DOM as a last resort so a stuck promo cannot sit on top
   * of a lead form and block .fill()/.click() until the action times out.
   */
  private async closeNationalPromotion(dialog: Locator): Promise<void> {
    const closeButton = this.page
      .getByRole('button', {
        name: /close national promotion popup|close national promotion|^close$/i,
      })
      .or(
        dialog.locator(
          'button[aria-label*="close" i], button[class*="close" i], button:has-text("×"), button:has-text("✕")',
        ),
      )
      .first();

    for (let attempt = 0; attempt < 3 && (await dialog.isVisible().catch(() => false)); attempt++) {
      await closeButton.click({ force: true, timeout: 2000 }).catch(async () => {
        await closeButton.dispatchEvent('click').catch(() => undefined);
      });
      await this.page.keyboard.press('Escape').catch(() => undefined);
      await dialog.waitFor({ state: 'hidden', timeout: 1500 }).catch(() => undefined);
    }

    if (await dialog.isVisible().catch(() => false)) {
      await dialog
        .evaluate((element) => {
          const overlay = element.closest(
            '[class*="overlay" i], [class*="ReactModal__Overlay" i], [class*="backdrop" i]',
          );
          (overlay ?? element).remove();
        })
        .catch(() => undefined);
    }

    await this.clearStaleModalAriaHidden();
  }

  /** Ensures the configured header country is selected when the selector is visible. */
  protected async ensureConfiguredCountrySelected(): Promise<void> {
    const expectedCountry = this.location.country === 'USA' ? 'USA' : 'CANADA';
    const countrySelector = this.page.locator('button[aria-label^="Select your country."]').first();

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

    await countrySelector.click();
    await this.settle(500);

    const expectedCountryButton = this.page
      .getByRole('button', { name: new RegExp(`^${expectedCountry}$`, 'i') })
      .last();

    if (await expectedCountryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expectedCountryButton.click();
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
          timeout: 10000,
        },
      )
      .toMatch(new RegExp(`${expectedCountry}(?: country is selected)?`, 'i'));
  }

  // Scroll Handler

  /** Scrolls to the requested page position. */
  protected async scrollTo(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout: 10000 });

    await locator.evaluate((el) => {
      el.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'nearest',
      });
    });

    await this.settle(800);
  }
  // Helper

  /** Builds full URL. */
  protected buildFullUrl(relativeUrl: string | null): string {
    return buildAbsoluteUrl(relativeUrl, this.page.url());
  }

  /** Formats price. */
  protected formatPrice(price: number): string {
    return formatCurrencyPrice(price);
  }

  // Utils (NEW - stable reusable helpers)

  /** Clicks element. */
  protected async clickElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();

    await Promise.all([
      this.waitForPageReady(), // SPA-safe wait
      locator.click(),
    ]);
  }

  /**
   * Scrolls a target to the middle of the viewport before interacting with it.
   *
   * Playwright's own scroll puts the element just inside the viewport, which on
   * these pages can leave it underneath the fixed quick-action bar
   * (#detailsBlockBar) - the bar then intercepts the click. Centering the target
   * keeps it clear of both the sticky header and any sticky footer, so the click
   * lands on the element itself instead of needing `force` to punch through.
   */
  protected async scrollIntoCenter(locator: Locator): Promise<void> {
    await locator
      .evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }))
      .catch(() => undefined);
    await this.settle(300);
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

  /** Normalizes text for reliable comparisons. */
  protected normalizeText(text: string): string {
    return normalizeComparableText(text);
  }

  /** Formats price to ui label. */
  protected formatPriceToUiLabel(price: number): string {
    return formatPriceLabel(price);
  }

  // Get Information Side Modal Lead Form The "Get Information / Stay Updated" CTA opens the same sidebar/modal lead form on the condo plan, plan detail and QMI pages. The flow is identical on all three - only the page label, the container locator and the timeouts differ - so it lives here instead of being copied per page object.

  /** Finds the first visible Get Information / Stay Updated CTA. */
  protected async getVisibleGetInformationCta(pageLabel: string): Promise<Locator> {
    const allCtas = this.page.locator('a:visible, button:visible').filter({
      hasText: /Get Information|Stay Updated/i,
    });
    const count = await allCtas.count();

    for (let i = 0; i < count; i++) {
      const candidate = allCtas.nth(i);

      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }

    throw new Error(`No visible Get Information CTA found on ${pageLabel}`);
  }

  /** Reveals a Get Information CTA by scrolling down until one becomes visible. */
  protected async revealGetInformationCta(pageLabel: string): Promise<void> {
    const initialCta = await this.getVisibleGetInformationCta(pageLabel).catch(() => null);

    if (initialCta && (await initialCta.isVisible({ timeout: 1500 }).catch(() => false))) {
      return;
    }

    for (const position of [450, 900, 1400]) {
      await this.page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), position);
      await this.waitForPageReady();
      await this.settle(400);

      const cta = await this.getVisibleGetInformationCta(pageLabel).catch(() => null);

      if (cta && (await cta.isVisible({ timeout: 1000 }).catch(() => false))) {
        return;
      }
    }
  }

  /** Fails fast when a lead-form flow navigates to Contact instead of showing in-page success. */
  protected async expectNoContactRedirect(previousUrl: string, pageLabel: string): Promise<void> {
    await this.settle(1000);

    const currentUrl = this.page.url();

    expect(
      currentUrl,
      `Expected the ${pageLabel} form flow to stay on page and show success modal, but it navigated from ${previousUrl} to ${currentUrl}`,
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Clicks the Get Information CTA when the sidebar/modal lead form is not already open. */
  protected async openLeadFormFromGetInformationCta(options: {
    leadForms: Locator;
    pageLabel: string;
    ctaTimeout?: number;
    beforeReveal?: () => Promise<void>;
  }): Promise<void> {
    if (await options.leadForms.count()) {
      return;
    }

    await options.beforeReveal?.();

    // The National-promotion overlay is a full-screen dialog that covers the CTA
    // and swallows the click. Dismiss it rather than clicking through it, so a
    // genuinely unreachable CTA still fails instead of failing later elsewhere.
    await this.dismissPromoPopupIfPresent({ appearTimeout: 3000 });

    await this.revealGetInformationCta(options.pageLabel);

    const cta = await this.getVisibleGetInformationCta(options.pageLabel);

    await expect(cta, 'Get Information or Stay Updated CTA should be visible').toBeVisible({
      timeout: options.ctaTimeout ?? 15_000,
    });

    const previousUrl = this.page.url();

    // No force: click() runs the actionability checks, so an overlay-covered CTA
    // reports the blocker instead of registering a click that goes nowhere.
    await cta.click();
    await this.waitForPageReady();
    await this.settle(1000);
    await this.expectNoContactRedirect(previousUrl, options.pageLabel);
  }

  /** Opens the Get Information side modal form and returns the container at the given index. */
  protected async openSideModalFormByIndex(options: {
    leadForms: Locator;
    formName: string;
    pageLabel: string;
    formIndex?: number;
    openTimeout?: number;
    ctaTimeout?: number;
    beforeReveal?: () => Promise<void>;
  }): Promise<Locator> {
    const formIndex = options.formIndex ?? 0;

    await this.openLeadFormFromGetInformationCta({
      leadForms: options.leadForms,
      pageLabel: options.pageLabel,
      ctaTimeout: options.ctaTimeout,
      beforeReveal: options.beforeReveal,
    });

    // The promotion popup can mount after the CTA click and aria-hide the page,
    // which would make the open side modal count as 0 below.
    await this.ensurePageInAccessibilityTree();

    const formCount = await expect
      .poll(() => options.leadForms.count(), {
        message: `${options.formName} sidebar/modal should open after Get Information CTA`,
        timeout: options.openTimeout ?? 15_000,
      })
      .toBeGreaterThan(formIndex)
      .then(() => options.leadForms.count())
      .catch(() => 0);

    if (formCount <= formIndex) {
      throw new Error(`${options.formName} sidebar/modal form did not open`);
    }

    const form = options.leadForms.nth(formIndex);

    await this.waitForPageReady();

    return form;
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

    await expect(
      options.submitButton,
      `${options.formName} submit button should be visible before submit`,
    ).toBeVisible({ timeout: 10_000 });

    // No force: an overlay covering Submit means the form is not submittable.
    await options.submitButton.click({
      noWaitAfter: true,
      timeout: 5_000,
    });

    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);

    if (options.successModal && (await options.successModal.count())) {
      await expect(
        options.successModal.last(),
        `${options.formName} success modal should be displayed`,
      ).toBeVisible({ timeout });
    }

    await expect(
      options.successMessage,
      `${options.formName} success message should be displayed`,
    ).toBeVisible({ timeout });

    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);

    const apiResponse = await apiResponsePromise;
    const responseData = apiResponse ? await this.readResponseData(apiResponse) : '';
    const outputFile = await appendLeadApiCapture({
      capturedAt: new Date().toISOString(),
      pageUrl: this.page.url(),
      formName: options.formName,
      requestMethod: apiResponse?.request().method() ?? '',
      requestUrl: apiResponse?.url() ?? '',
      responseStatus: apiResponse?.status() ?? '',
      responseData,
      notes: apiResponse ? options.notes : 'No matching lead API response captured',
    });

    if (!apiResponse && process.env.REQUIRE_LEAD_API_CAPTURE === 'true') {
      throw new Error(
        `${options.formName} succeeded, but no matching lead API response was captured.`,
      );
    }

    if (options.validateApiResponse) {
      expect(
        apiResponse,
        `${options.formName} should capture a matching lead API response`,
      ).toBeTruthy();
      expect(
        apiResponse!.status(),
        `${options.formName} lead API response should be successful`,
      ).toBeGreaterThanOrEqual(200);
      expect(
        apiResponse!.status(),
        `${options.formName} lead API response should be successful`,
      ).toBeLessThan(400);
    }

    await this.reportValue(`${options.formName} lead API data saved to`, outputFile);
  }

  /** Waits until lead api response. */
  private async waitForLeadApiResponse(timeout: number): Promise<Response | null> {
    return this.page
      .waitForResponse((response) => this.isLeadApiResponse(response), { timeout })
      .catch(() => null);
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

    return /api|lead|form|contact|schedule|sitecore|submit|visitor|salesforce|eloqua|marketo/i.test(
      url,
    );
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
