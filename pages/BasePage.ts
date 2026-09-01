import { expect, Locator, Page, type Response as PlaywrightResponse, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { resolveFeature, type FeatureKey } from '../config/features/featureExpectations';
import { OverlayManager } from '../support/OverlayManager';
import { MediaAuditor } from '../support/MediaAuditor';
import { LeadFormFlow } from '../support/LeadFormFlow';
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
  protected readonly page: Page;
  private loadStateWaitedForUrl?: string;
  private readonly overlays: OverlayManager;
  private readonly media: MediaAuditor;
  private readonly leadForms: LeadFormFlow;

  /**
   * Country this page object is pinned to, if any.
   *
   * Some pages exist in one country only - MPC is USA-only, the condo pages are
   * Canada-only - so they pin it here and ignore whatever LOCATION the run used.
   */
  protected readonly locationOverride?: LocationKey;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page, locationOverride?: LocationKey) {
    this.page = page;
    this.locationOverride = locationOverride;
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

  // Navigation

  /** Opens this page object's URL and clears the usual overlays on arrival. */
  async navigate(overrideLocation?: LocationKey): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(overrideLocation ?? this.locationOverride);

    const targetUrl = `${baseURL}/?${location.queryParam}`;

    await test.step(`Open Mattamy Homes home page for ${location.country} in ${envName}`, async () => {
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
          sameHost &&
          current.pathname === target.pathname &&
          current.searchParams.get('country') === target.searchParams.get('country');
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

      // Checked outside the try: a 4xx/5xx is not a navigation timeout, and
      // letting the catch above swallow it is what turns a server error into a
      // misleading locator failure much later in the test.
      this.expectNavigationServed(response, targetUrl);

      await this.acceptCookiesIfPresent();

      // Use the shared load handler rather than an inline wait.
      await this.waitForPageReady();

      // Recover from a blank render before handing control back.
      await this.ensurePageRendered();

      // Clear the National-promotion overlay centrally, not in each page object: it
      // appears a beat after navigation as a full-screen dialog and swallows clicks.
      // appearTimeout gives it that beat; when it never shows, the wait is all it costs.
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  /**
   * Fails the test when the server did not actually serve the page.
   *
   * A 4xx/5xx still renders a document, so an unchecked navigation leaves the
   * suite hunting for content on the browser's error page and reporting
   * "element(s) not found" 15s later instead of naming the status.
   *
   * A null response means a same-document navigation, which has no response of
   * its own and nothing to check.
   */
  protected expectNavigationServed(response: PlaywrightResponse | null, url: string): void {
    if (!response) {
      return;
    }

    expect(
      response.status(),
      `${url} should be served without a client/server error before its content is validated`,
    ).toBeLessThan(400);
  }

  /**
   * Opens a URL and checks the server served it.
   *
   * The shared entry point for page objects that navigate straight to their own
   * URL instead of going through {@link navigate}.
   */
  protected async gotoAndVerifyResponse(
    url: string,
    options: { waitUntil?: 'domcontentloaded' | 'load' | 'commit'; timeout?: number } = {},
  ): Promise<PlaywrightResponse | null> {
    const response = await this.page.goto(url, {
      waitUntil: options.waitUntil ?? 'domcontentloaded',
      timeout: options.timeout ?? 90_000,
    });

    this.expectNavigationServed(response, url);

    return response;
  }

  /**
   * Reloads the page when the app never painted.
   *
   * The HTML shell can load - so the title is right and the page looks fine -
   * while the SPA renders nothing, leaving every locator to time out. Never
   * throws: if it is still blank after the retries, the normal assertions say so.
   */
  async ensurePageRendered(): Promise<void> {
    const maxAttempts = 3;
    const header = this.page.locator('header').first();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const rendered = await header
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);

      if (rendered) {
        break;
      }

      if (attempt < maxAttempts) {
        await this.reportValue(
          `Page rendered blank (attempt ${attempt}); reloading`,
          this.page.url(),
        );
        // The reload can abort when the SPA starts its own navigation mid-reload.
        // Swallow it and let the next attempt re-check rather than failing the test.
        await this.page
          .reload({ waitUntil: 'domcontentloaded', timeout: 90_000 })
          .catch(() => undefined);
        await this.acceptCookiesIfPresent().catch(() => undefined);
        await this.waitForPageReady().catch(() => undefined);
      }
    }

    // A visible <header> is not enough on its own: the SSR HTML ships a
    // mobile-only header shell that satisfies the check above while the desktop
    // navigation, and the country selector's real value, are still missing. An
    // un-hydrated shell otherwise surfaces as unrelated-looking locator timeouts
    // across the suite rather than as one cause.
    if (!(await this.waitForShellHydrated())) {
      await this.reportValue(
        'Page shell did not hydrate - header is still the mobile SSR shell, so desktop navigation and the country selector are unreliable',
        this.page.url(),
      );
    }
  }

  /**
   * True when the page is narrower than the site's header breakpoint.
   *
   * Read from the page rather than from the project name or `viewportSize()`:
   * the site decides its own layout from `window.innerWidth`, and a headed run
   * configured with `viewport: null` reports no size at all.
   */
  protected async isMobileHeaderViewport(): Promise<boolean> {
    // Falls back to the desktop width, not 0: every desktop project is at least
    // this wide, so an unreadable page is treated as desktop rather than
    // silently skipping the desktop-only checks that depend on this.
    const viewportWidth = await this.page
      .evaluate(() => window.innerWidth)
      .catch(() => DESKTOP_HEADER_MIN_WIDTH);

    return viewportWidth < DESKTOP_HEADER_MIN_WIDTH;
  }

  /**
   * Waits for the header shell to hydrate. Returns whether it did.
   *
   * Deliberately non-throwing: this runs on every navigation, and callers that
   * actually validate the header assert on it themselves. Everything else just
   * gets the cause recorded in the report instead of a downstream locator
   * timeout that names the wrong thing.
   */
  protected async waitForShellHydrated(timeout = 8_000): Promise<boolean> {
    // Below the site's own header breakpoint the mobile toggle IS the header, so
    // there is no desktop navigation to wait for.
    if (await this.isMobileHeaderViewport()) {
      return true;
    }

    // 'hidden' also passes for a detached element, so if the product renames the
    // toggle this degrades to "assume hydrated" rather than stalling every
    // navigation for the full timeout.
    return this.page
      .locator(MOBILE_NAV_TOGGLE_SELECTOR)
      .waitFor({ state: 'hidden', timeout })
      .then(() => true)
      .catch(() => false);
  }

  // Common Load Stabilization

  /** Waits until the page has stopped rendering. */
  async waitForPageReady(): Promise<void> {
    // Arm the overlay handlers here, not just in navigate(): pages reached by a
    // direct goto() or through search never went through navigate(), so they ran
    // unprotected. Guarded inside, so repeat calls cost a boolean check.
    await this.registerConsentDialogHandlers();

    await this.page.waitForLoadState('domcontentloaded');

    // Wait for 'load' once per document, not on every call. The SPA hydrates
    // around 'load', so this is what stops clicks landing on a dead page - but on
    // pages that never fire it the wait costs its full timeout, and this method
    // runs ~20x per test. Paying that every time took the suite from 3.2h to 5.8h.
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

  /**
   * Waits for the page to go quiet after a click or a keystroke, instead of
   * sleeping blindly.
   *
   * Returns as soon as the DOM stops changing for `quietWindowMs`, and never
   * waits longer than `ms`. That cap is enforced from Node as well as in the
   * page, because in-page timers stop firing while the renderer is busy - one
   * run burned its whole 5-minute budget inside a single `settle(3000)`.
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

    // Not awaited on its own: whichever finishes first wins, and the loser is
    // already .catch()-guarded so it cannot surface as an unhandled rejection.
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

  // Allure reporting - thin wrappers over utils/reporting/allureReporter so page
  // objects can call this.step(...). Specs import the standalone functions.

  /** Runs an action as a named Allure step and returns whatever it returns. */
  protected async step<T>(name: string, body: () => Promise<T> | T): Promise<T> {
    return reportStep(name, body);
  }

  /**
   * Records a message, and optionally a value, as its own Allure step. Use this
   * instead of console.log - a diagnostic not worth reporting is not worth keeping.
   */
  protected async reportValue(message: string, value?: unknown): Promise<void> {
    await reportValue(message, value);
  }

  /**
   * Decides what a missing element means, instead of assuming it means "skip".
   *
   * True when the feature is there. False only when it is missing AND declared
   * optional for this location. Anything else fails, naming the key to add.
   */
  protected async isFeaturePresent(
    locator: Locator,
    feature: FeatureKey,
    description: string,
    options: { timeout?: number; state?: 'visible' | 'attached' } = {},
  ): Promise<boolean> {
    const { timeout = 5000, state = 'visible' } = options;

    // waitFor for both states. isVisible() ignores its timeout and answers straight
    // away, so a section still rendering read as absent - and absence is now a hard
    // failure, which turned a slow render into a red test.
    const present = await locator
      .first()
      .waitFor({ state, timeout })
      .then(() => true)
      .catch(() => false);

    return (await this.requireFeature(present || null, feature, description)) !== null;
  }

  /**
   * Same decision as isFeaturePresent, for callers that already resolved the
   * element themselves. Returns the value, or null when declared optional.
   */
  protected async requireFeature<T>(
    value: T | null | undefined,
    feature: FeatureKey,
    description: string,
  ): Promise<T | null> {
    const location = this.locationOverride ?? (this.location.country as LocationKey);
    const { value: resolved, skipMessage } = resolveFeature(
      value,
      feature,
      description,
      location,
      this.page.url(),
    );

    if (skipMessage) {
      await this.reportValue(skipMessage);
    }

    return resolved;
  }

  /**
   * Returns the first candidate locator that works, falling back down the list.
   *
   * When nothing matches, the primary locator comes back so the test still fails
   * on the real selector. Every heal is reported as selector drift: a run kept
   * green by a fallback still means the app changed, and someone has to see that.
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
  protected async ensureConfiguredCountrySelected(): Promise<void> {
    const expectedCountry = this.location.country === 'USA' ? 'USA' : 'CANADA';
    const countrySelector = this.page.locator('button[aria-label^="Select your country."]').first();

    if (!(await countrySelector.isVisible({ timeout: 5000 }).catch(() => false))) {
      return;
    }

    // An unlabelled full-screen modal can sit over this control; without this the
    // click below just burns its 30s timeout against an intercepted pointer.
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

    const expectedCountryButton = this.page
      .getByRole('button', { name: new RegExp(`^${expectedCountry}$`, 'i') })
      .last();

    // Fail here, naming the real cause. This used to skip quietly when the option
    // never rendered, so the poll below reported "selector should show USA" - which
    // reads as the switch not taking, when the dropdown never opened at all.
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

  /**
   * Scrolls a target to the middle of the viewport before clicking it.
   *
   * Playwright's own scroll stops as soon as the element is just inside the
   * viewport, where the sticky quick-action bar can still cover it and swallow
   * the click. Centring keeps it clear of both the sticky header and footer.
   */
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
  protected async revealGetInformationCta(pageLabel: string): Promise<void> {
    await this.leadForms.revealGetInformationCta(pageLabel);
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
