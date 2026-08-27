import { expect, Locator, Page, test } from '@playwright/test';
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
  escapeRegex,
  formatPrice as formatCurrencyPrice,
  formatPriceToUiLabel as formatPriceLabel,
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
  async ensurePageRendered(): Promise<void> {
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
   */
  async waitForPageReady(): Promise<void> {
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
  /** Checks that every image and video URL on the page returns a 200. */
  async validateImageAndVideoUrlsReturn200(pageName: string): Promise<void> {
    await this.media.validateAllMediaReturns200(pageName);
  }

  // Allure Step Reporting Thin instance wrappers over the shared helpers in utils/reporting/allureReporter so page objects can call this.step(...) / this.reportValue(...). Specs import the standalone functions directly.

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

    // waitFor for both states. isVisible() ignores its timeout option and answers
    // immediately, so the visible branch used to sample the DOM the instant it
    // was called - a section still rendering read as absent and, now that absence
    // is a hard failure, that turned a slow render into a red test.
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
   * Returns the first candidate locator that is currently usable.
   *
   * Self-healing is deliberately limited to explicit fallback selectors. When
   * no fallback matches, the primary locator is returned so the original test
   * failure remains visible.
   *
   * Every heal is reported as selector drift: healing keeps the run green, but
   * it means the app changed, and that has to end up somewhere a human looks.
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

    // Fail here, naming the real cause. This used to skip silently when the
    // option never rendered, so the run fell through to the poll below and
    // reported "Header country selector should show USA" - which reads as the
    // switch not taking effect, when in fact the dropdown never opened.
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
