import { expect, Locator, Page, type Response as PlaywrightResponse, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { installTrackerBlocking } from '../config/environments/thirdPartyTrackers';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { resolveFeature, type FeatureKey } from '../config/features/featureExpectations';
import { OverlayManager } from '../support/OverlayManager';
import { MediaAuditor } from '../support/MediaAuditor';
import { LeadFormFlow } from '../support/LeadFormFlow';
import { installProdSubmissionGuard } from '../utils/leadform/prodSubmissionGuard';
import {
  reportSelectorDrift,
  reportValue,
  step as reportStep,
} from '../utils/reporting/allureReporter';
import {
  buildFullUrl as buildAbsoluteUrl,
  DESKTOP_HEADER_MIN_WIDTH,
  escapeRegex,
  formatPrice as formatCurrencyPrice,
  formatPriceToUiLabel as formatPriceLabel,
  getFooter,
  MOBILE_NAV_TOGGLE_SELECTOR,
  normalizeComparableText,
} from '../utils/web/pageObjectUtils';

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
  /** Time allowed for the app to paint; well above the 10-17s seen on STAGE, since it waits on window.onload. */
  protected static readonly APP_PAINT_TIMEOUT = 45_000;

  protected readonly page: Page;
  private loadStateWaitedForUrl?: string;
  private readonly overlays: OverlayManager;
  private readonly media: MediaAuditor;
  private readonly leadForms: LeadFormFlow;
  private readonly prodSubmissionGuard: Promise<void>;
  private readonly trackerBlocking: Promise<void>;

  /** Country this page object is pinned to (e.g. MPC is USA-only), overriding LOCATION. */
  protected readonly locationOverride?: LocationKey;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page, locationOverride?: LocationKey) {
    this.page = page;
    this.locationOverride = locationOverride;
    // Started here so they cover every page object; awaited before each navigation.
    this.prodSubmissionGuard = installProdSubmissionGuard(page);
    this.trackerBlocking = installTrackerBlocking(page);
    this.overlays = new OverlayManager(page, {
      settle: (ms) => this.settle(ms),
      report: (message, value) => this.reportValue(message, value),
    });
    this.leadForms = new LeadFormFlow(page, {
      neutralizeChatWidget: () => this.overlays.neutralizeChatWidget(),
      report: (message, value) => this.reportValue(message, value),
      settle: (ms) => this.settle(ms),
      waitForPageReady: () => this.waitForPageReady(),
      dismissPromoPopup: (options) => this.dismissPromoPopupIfPresent(options),
      ensureInAccessibilityTree: () => this.ensurePageInAccessibilityTree(),
    });
    this.media = new MediaAuditor(page, {
      report: (message, value) => this.reportValue(message, value),
      waitForPageReady: () => this.waitForPageReady(),
      dismissPromoPopup: (options) => this.dismissPromoPopupIfPresent(options),
    });
  }

  /** Location data for this page object — its pinned country, else LOCATION. */
  protected get location() {
    return getLocationConfig(this.locationOverride);
  }

  /** Country key this page object should use for country-specific expectations. */
  protected get locationKey(): LocationKey {
    return this.locationOverride ?? (this.location.country as LocationKey);
  }

  // Navigation

  /** Opens this page object's URL and clears the usual overlays on arrival. */
  async navigate(overrideLocation?: LocationKey): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(overrideLocation ?? this.locationOverride);

    const targetUrl = `${baseURL}${location.homeURL}`;

    await test.step(`Open Mattamy Homes home page for ${location.country} in ${envName}`, async () => {
      await this.prodSubmissionGuard;
      await this.trackerBlocking;
      await this.registerConsentDialogHandlers();
      let response: PlaywrightResponse | null = null;
      try {
        response = await this.page.goto(targetUrl, {
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
          sameHost && current.pathname.replace(/\/$/, '') === target.pathname.replace(/\/$/, '');
        const domIsUsable = await this.page
          .evaluate(() => document.readyState !== 'loading')
          .catch(() => false);

        if (!reachedTarget || !domIsUsable) {
          await this.reportValue('Page not usable after navigation; retrying', targetUrl);
          response = await this.page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 90_000,
          });
        } else {
          await this.reportValue('Navigation timed out after render; continuing from', currentUrl);
        }
      }

      // Checked outside the try so a 4xx/5xx fails here, not as a misleading locator error later.
      this.expectNavigationServed(response, targetUrl);

      await this.acceptCookiesIfPresent();

      await this.waitForPageReady();

      await this.ensurePageRendered();

      // The promo overlay appears a moment after load and swallows clicks, so give it time to show.
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  /** Fails the test when the server answered with a 4xx/5xx status. */
  protected expectNavigationServed(response: PlaywrightResponse | null, url: string): void {
    // A null response is a same-document navigation, so there is nothing to check.
    if (!response) {
      return;
    }

    expect(
      response.status(),
      `${url} should be served without a client/server error before its content is validated`,
    ).toBeLessThan(400);
  }

  /** Opens a URL directly (without {@link navigate}) and checks the server served it. */
  protected async gotoAndVerifyResponse(
    url: string,
    options: { waitUntil?: 'domcontentloaded' | 'load' | 'commit'; timeout?: number } = {},
  ): Promise<PlaywrightResponse | null> {
    await this.prodSubmissionGuard;
    await this.trackerBlocking;

    const response = await this.page.goto(url, {
      waitUntil: options.waitUntil ?? 'domcontentloaded',
      timeout: options.timeout ?? 90_000,
    });

    this.expectNavigationServed(response, url);

    return response;
  }

  /** Waits for the site to unhide <body> (it stays hidden until window.onload); returns whether it did. */
  protected async waitForAppPainted(timeout = BasePage.APP_PAINT_TIMEOUT): Promise<boolean> {
    if (await this.pollBodyVisible(timeout)) {
      return true;
    }

    // Still hidden after the full wait: clear the site's inline style and check once more.
    if (!(await this.clearAppPaintGuardIfStuck())) {
      return false;
    }

    return this.pollBodyVisible(5_000);
  }

  /** Waits for the site to stop rendering <body> with visibility:hidden. */
  private async pollBodyVisible(timeout: number): Promise<boolean> {
    return this.page
      .waitForFunction(
        () => !!document.body && getComputedStyle(document.body).visibility !== 'hidden',
        null,
        {
          timeout,
          polling: 250,
        },
      )
      .then(() => true)
      .catch(() => false);
  }

  /** Removes the inline visibility:hidden on <body> when WebKit never fires window.onload; returns whether it cleared. */
  protected async clearAppPaintGuardIfStuck(): Promise<boolean> {
    const cleared = await this.page
      .evaluate(() => {
        const body = document.body;

        // Only the inline style on a non-empty body, so a genuinely blank page still fails.
        if (!body || body.style.visibility !== 'hidden' || body.childElementCount === 0) {
          return false;
        }

        body.style.removeProperty('visibility');

        return getComputedStyle(body).visibility !== 'hidden';
      })
      .catch(() => false);

    if (cleared) {
      await this.reportValue(
        "Cleared the site's window.onload flicker guard - the load event never fired, so <body> stayed hidden over a rendered DOM",
        this.page.url(),
      );
    }

    return cleared;
  }

  /** Reloads the page once when the app never painted or rendered no header; never throws. */
  async ensurePageRendered(): Promise<void> {
    // One reload only: reloading restarts a slow load, so retries just make slow pages slower.
    const maxAttempts = 2;
    const header = this.page.locator('header').first();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const painted = await this.waitForAppPainted();
      const rendered =
        painted &&
        (await header
          .waitFor({ state: 'visible', timeout: 15000 })
          .then(() => true)
          .catch(() => false));

      if (rendered) {
        break;
      }

      const cause = painted
        ? 'Page painted but rendered no header'
        : "Page never painted - <body> is still hidden behind the site's window.onload flicker guard";

      if (attempt < maxAttempts) {
        await this.reportValue(`${cause} (attempt ${attempt}); reloading`, this.page.url());
        // The reload can abort if the SPA navigates mid-reload; the next attempt re-checks.
        await this.page
          .reload({ waitUntil: 'domcontentloaded', timeout: 90_000 })
          .catch(() => undefined);
        await this.acceptCookiesIfPresent().catch(() => undefined);
        await this.waitForPageReady().catch(() => undefined);

        continue;
      }

      await this.reportValue(cause, this.page.url());
    }

    // A visible <header> may still be the mobile SSR shell, without desktop nav or country selector.
    if (!(await this.waitForShellHydrated())) {
      await this.reportValue(
        'Page shell did not hydrate - header is still the mobile SSR shell, so desktop navigation and the country selector are unreliable',
        this.page.url(),
      );
    }
  }

  /** True when window.innerWidth is below the site's header breakpoint (the site's own layout signal). */
  protected async isMobileHeaderViewport(): Promise<boolean> {
    // Defaults to desktop so an unreadable page never silently skips desktop-only checks.
    const viewportWidth = await this.page
      .evaluate(() => window.innerWidth)
      .catch(() => DESKTOP_HEADER_MIN_WIDTH);

    return viewportWidth < DESKTOP_HEADER_MIN_WIDTH;
  }

  /** Waits for the desktop header to hydrate; returns whether it did, without throwing. */
  protected async waitForShellHydrated(timeout = 8_000): Promise<boolean> {
    // On mobile the toggle is the real header, so there is nothing to wait for.
    if (await this.isMobileHeaderViewport()) {
      return true;
    }

    // 'hidden' also passes when the toggle is missing, so a renamed toggle never stalls navigation.
    return this.page
      .locator(MOBILE_NAV_TOGGLE_SELECTOR)
      .waitFor({ state: 'hidden', timeout })
      .then(() => true)
      .catch(() => false);
  }

  /** Waits for the document title to change after a client-side route change (the URL updates before the content). */
  protected async waitForRouteContent(previousTitle: string, timeout = 30_000): Promise<void> {
    if (!previousTitle) {
      return;
    }

    const swapped = await this.page
      .waitForFunction((title) => document.title !== title, previousTitle, {
        timeout,
        polling: 250,
      })
      .then(() => true)
      .catch(() => false);

    if (!swapped) {
      await this.reportValue(
        'Client-side route transition did not swap the page content',
        this.page.url(),
      );
    }
  }

  // Common Load Stabilization

  /** Waits until the page has stopped rendering. */
  async waitForPageReady(): Promise<void> {
    // Also armed here for pages reached by direct goto() or search; repeat calls are cheap.
    await this.registerConsentDialogHandlers();

    await this.page.waitForLoadState('domcontentloaded');

    // Wait for 'load' once per URL only: pages that never fire it would pay the full timeout every call.
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
    const footer = getFooter(this.page);

    await this.waitForPageReady();
    await expect(footer, `Footer should be visible before validating ${label}`).toBeVisible({
      timeout,
    });
    await this.waitForPageReady();
  }

  /** Waits until the DOM stops changing for `quietWindowMs`, capped at roughly `ms`. */
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

    // Cap from Node too: in-page timers stop firing while the renderer is busy.
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
  /** Checks that every image and video URL on the page returns a 200. */
  async validateImageAndVideoUrlsReturn200(pageName: string): Promise<void> {
    await this.media.validateAllMediaReturns200(pageName);
  }

  // Allure reporting wrappers over utils/reporting/allureReporter

  /** Runs an action as a named Allure step and returns whatever it returns. */
  protected async step<T>(name: string, body: () => Promise<T> | T): Promise<T> {
    return reportStep(name, body);
  }

  /** Records a message and optional value as an Allure step (use instead of console.log). */
  protected async reportValue(message: string, value?: unknown): Promise<void> {
    await reportValue(message, value);
  }

  /** True when present, false when absent but declared optional for this location; otherwise fails. */
  protected async isFeaturePresent(
    locator: Locator,
    feature: FeatureKey,
    description: string,
    options: { timeout?: number; state?: 'visible' | 'attached' } = {},
  ): Promise<boolean> {
    const { timeout = 5000, state = 'visible' } = options;

    // waitFor, not isVisible(): isVisible() ignores its timeout, so a slow section would read as absent.
    const present = await locator
      .first()
      .waitFor({ state, timeout })
      .then(() => true)
      .catch(() => false);

    return (await this.requireFeature(present || null, feature, description)) !== null;
  }

  /** Like isFeaturePresent for an already-resolved value; returns it, or null when declared optional. */
  protected async requireFeature<T>(
    value: T | null | undefined,
    feature: FeatureKey,
    description: string,
  ): Promise<T | null> {
    const { value: resolved, skipMessage } = resolveFeature(
      value,
      feature,
      description,
      this.locationKey,
      this.page.url(),
    );

    if (skipMessage) {
      await this.reportValue(skipMessage);
    }

    return resolved;
  }

  /** Returns the first usable candidate locator, reporting any fallback as selector drift; else the primary. */
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
        await reportSelectorDrift(label, primary.selector, candidate.selector);
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

  /** Checks we actually landed on a page and not about:blank. */
  protected async assertPageLoaded(label = 'Page should be loaded'): Promise<void> {
    await test.step(label, async () => {
      await this.waitForPageReady();
      await expect(this.page, label).not.toHaveURL(/about:blank/i);
    });
  }

  /** Checks the browser tab title. */
  protected async assertPageTitle(
    expectedTitle: string | RegExp,
    label = 'Page title should match expected value',
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(this.page, label).toHaveTitle(expectedTitle);
    });
  }

  /** Checks the current URL. */
  protected async assertPageUrl(
    expectedUrl: string | RegExp,
    label = 'Page URL should match expected value',
    timeout = 60_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(this.page, label).toHaveURL(expectedUrl, { timeout });
    });
  }

  /** Checks the current URL contains this fragment. */
  protected async assertPageUrlContains(
    expectedUrlPart: string,
    label = `Page URL should contain: ${expectedUrlPart}`,
    timeout = 60_000,
  ): Promise<void> {
    await this.assertPageUrl(new RegExp(escapeRegex(expectedUrlPart), 'i'), label, timeout);
  }

  /** Checks we did not end up on an unexpected URL. */
  protected async assertPageUrlDoesNotMatch(
    unexpectedUrl: string | RegExp,
    label = 'Page URL should not match unexpected value',
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(this.page, label).not.toHaveURL(unexpectedUrl);
    });
  }

  /** Checks an element is visible on screen. */
  protected async assertVisible(
    locator: Locator,
    label = 'Element should be visible',
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toBeVisible({ timeout });
    });
  }

  /** Checks an element is in the DOM, whether or not it is on screen. */
  protected async assertAttached(
    locator: Locator,
    label = 'Element should be attached',
    timeout = 10_000,
  ): Promise<void> {
    await test.step(label, async () => {
      await expect(locator, label).toBeAttached({ timeout });
    });
  }

  /** Checks an element's text contains what we expect. */
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

  /** Checks an element's text matches exactly. */
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

  /** Checks the text appears somewhere on the page. */
  protected async assertBodyContains(
    expectedText: string | RegExp,
    label = 'Page body should contain expected text',
    timeout = 10_000,
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('body'), expectedText, label, timeout);
  }

  /** Checks the page shows an H1. */
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

  /** Checks the H1 says what we expect. */
  protected async assertHeadingContains(
    expectedText: string | RegExp,
    label = 'Page heading should contain expected text',
    timeout = 20_000,
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('h1').first(), expectedText, label, timeout);
  }

  /** Checks an element's attribute value. */
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

  /** Checks how many elements the locator matches. */
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

  /** Checks a value is present (truthy). */
  protected assertTruthy<T>(
    value: T,
    label = 'Expected value should be present',
  ): asserts value is NonNullable<T> {
    expect(value, label).toBeTruthy();
  }

  /** Checks a number is above the minimum we expect. */
  protected assertGreaterThan(
    actual: number,
    minimum: number,
    label = `Expected value should be greater than ${minimum}`,
  ): void {
    expect(actual, label).toBeGreaterThan(minimum);
  }

  // Cookie Handling — implemented by support/OverlayManager

  /** Registers auto-dismiss handlers for late-appearing consent dialogs. */
  private async registerConsentDialogHandlers(): Promise<void> {
    await this.overlays.registerHandlers();
  }

  /** Accepts the cookie banner when it is visible. */
  async acceptCookiesIfPresent(): Promise<void> {
    await this.overlays.acceptCookies();
  }

  /** Dismisses the promo popup / National-promotion overlay when present. */
  async dismissPromoPopupIfPresent(options: { appearTimeout?: number } = {}): Promise<void> {
    await this.overlays.dismissPromoPopup(options);
  }

  /** Clears aria-hidden left behind by a closed modal so the page stays reachable. */
  protected async clearStaleModalAriaHidden(): Promise<void> {
    await this.overlays.clearStaleModalAriaHidden();
  }

  /** Ensures the page is reachable in the accessibility tree. */
  protected async ensurePageInAccessibilityTree(): Promise<void> {
    await this.overlays.ensurePageInAccessibilityTree();
  }

  /** Stops the third-party chat widget intercepting clicks. */
  protected async neutralizeChatWidget(): Promise<void> {
    await this.overlays.neutralizeChatWidget();
  }

  /** Ensures the configured header country is selected when the selector is visible. */
  protected async ensureConfiguredCountrySelected(overrideLocation?: LocationKey): Promise<void> {
    const location = getLocationConfig(overrideLocation ?? this.locationOverride);
    const expectedCountry = location.country === 'USA' ? 'USA' : 'CANADA';
    const countrySelector = this.page.locator('button[aria-label^="Select your country."]').first();

    if (!(await countrySelector.isVisible({ timeout: 5000 }).catch(() => false))) {
      return;
    }

    // A full-screen modal can cover this control and intercept the click.
    await this.overlays.dismissBlockingModalIfPresent();

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

    // Options are named by aria-label ("Country selector. USA"), not their visible text.
    const expectedCountryButton = this.page
      .getByRole('button', { name: new RegExp(`^Country selector\\.\\s*${expectedCountry}$`, 'i') })
      .last();

    // Fail here if the dropdown never opened, rather than as a confusing poll failure below.
    await expect(
      expectedCountryButton,
      `${expectedCountry} option should appear in the country selector after opening it ` +
        `(selector currently reads "${currentLabel ?? currentText}")`,
    ).toBeVisible({ timeout: 5000 });

    await expectedCountryButton.click();
    await this.waitForPageReady();

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

  /** Scrolls an element to the middle of the screen and lets the page settle. */
  protected async scrollTo(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout: 10000 });

    // Twice: on phones the notification banner collapses on first scroll, shifting the target under it.
    for (let pass = 0; pass < 2; pass++) {
      await locator.evaluate((el) => {
        el.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'nearest',
        });
      });

      await this.settle(pass === 0 ? 400 : 800);
    }
  }
  // Helper

  /** Turns a relative href into a full URL against the current page. */
  protected buildFullUrl(relativeUrl: string | null): string {
    return buildAbsoluteUrl(relativeUrl, this.page.url());
  }

  /** Formats a number as a currency price. */
  protected formatPrice(price: number): string {
    return formatCurrencyPrice(price);
  }

  // Utils

  /** Scrolls an element into view, clicks it, and waits for the page to settle. */
  protected async clickElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();

    await Promise.all([
      this.waitForPageReady(), // SPA-safe wait
      locator.click(),
    ]);
  }

  /** Scrolls an element to the viewport centre so sticky bars cannot cover it before a click. */
  protected async scrollIntoCenter(locator: Locator): Promise<void> {
    await locator
      .evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }))
      .catch(() => undefined);
    await this.settle(300);
  }

  /** Returns whether a section is visible, without failing when it is not. */
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

  /** Formats a price the way the site labels it. */
  protected formatPriceToUiLabel(price: number): string {
    return formatPriceLabel(price);
  }
  // Lead forms — implemented by support/LeadFormFlow

  /** Returns the Get Information CTA that is actually clickable. */
  protected async getVisibleGetInformationCta(pageLabel: string): Promise<Locator> {
    return this.leadForms.getVisibleGetInformationCta(pageLabel);
  }

  /** Scrolls the Get Information CTA into view. */
  protected async revealGetInformationCta(): Promise<void> {
    await this.leadForms.revealGetInformationCta();
  }

  /** Fails if the CTA navigated to the contact page instead of opening the form. */
  protected async expectNoContactRedirect(previousUrl: string, pageLabel: string): Promise<void> {
    await this.leadForms.expectNoContactRedirect(previousUrl, pageLabel);
  }

  /** Opens the lead form from the Get Information CTA. */
  protected async openLeadFormFromGetInformationCta(options: {
    leadForms: Locator;
    pageLabel: string;
    ctaTimeout?: number;
    beforeReveal?: () => Promise<void>;
  }): Promise<void> {
    await this.leadForms.openLeadFormFromGetInformationCta(options);
  }

  /** Opens the side-modal lead form at the given index. */
  protected async openSideModalFormByIndex(options: {
    leadForms: Locator;
    formName: string;
    pageLabel: string;
    formIndex?: number;
    openTimeout?: number;
    ctaTimeout?: number;
    beforeReveal?: () => Promise<void>;
  }): Promise<Locator> {
    return this.leadForms.openSideModalFormByIndex(options);
  }

  /** Submits the lead form and records the API call as evidence. */
  protected async submitLeadFormAndCaptureApi(options: {
    formName: string;
    form?: Locator;
    submitButton: Locator;
    successMessage: Locator;
    successModal?: Locator;
    validateApiResponse?: boolean;
    timeout?: number;
    notes?: string;
  }): Promise<void> {
    await this.leadForms.submitLeadFormAndCaptureApi(options);
  }
}
