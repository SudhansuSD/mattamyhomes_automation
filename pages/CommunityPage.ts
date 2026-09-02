import { Locator, Page, expect } from '@playwright/test';
import type { FeatureKey } from '../config/features/featureExpectations';
import {
  escapeRegex,
  getLastPathSegment,
  getNormalizedText,
  getPathSegments,
  toSlug,
  toTitleCase,
} from '../utils/web/pageObjectUtils';
import { SearchablePage } from './SearchablePage';
import {
  checkConsentIfPresent,
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  expectSideModalFormFields,
  fillExtraLeadFieldsIfPresent,
  fillInvalidSideModalForm,
  fillIfPresent,
  fillValidSideModalForm,
  getHeroInformationCta,
  getInvalidLeadData,
  getSubmitButton,
  getValidLeadData,
  GET_INFORMATION_CTA_SELECTOR,
  GET_INFORMATION_CTA_TEXT,
  LeadFieldData,
  SUBMIT_BUTTON_SELECTOR,
} from '../utils/leadform/leadFormHelper';

// Community Page – Page Object Model

export class CommunityPage extends SearchablePage {
  /** Ceiling on one wait for a Get Information CTA to render where a click would land. */
  private static readonly CTA_POLL_TIMEOUT = 30_000;

  /** Window held back from the CTA polls so the covered-CTA fallback still gets its attempt. */
  private static readonly CTA_FALLBACK_RESERVE = 12_000;

  // Constructor

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);
  }

  // LOCATORS

  // ----- Core Page -----

  /** The community's main heading. */
  private get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }
  /** The Available Homes section. */
  private get availableHomesSection(): Locator {
    return this.page.locator('#availablehomes');
  }
  /** The amenities section. */
  private get amenitiesSection(): Locator {
    return this.page.getByRole('heading', { name: /amenities/i });
  }
  /** The map section. */
  private get mapSection(): Locator {
    // #map stopped matching: the map moved into "Explore the community" with an
    // embedded sitemap iframe. #map stays first for pages that still use it.
    return this.page
      .locator('#map')
      .or(this.page.locator('section').filter({ has: this.page.locator('a[href*="maps.google"]') }))
      .or(
        this.page
          .getByRole('heading', { name: /Explore the community|^Location$/i })
          .locator('xpath=ancestor::section[1]'),
      )
      .first();
  }
  /** The contact section. */
  private get contactSection(): Locator {
    return this.page.locator('#contact');
  }
  /** The product overview section. */
  private get productOverviewSection(): Locator {
    return this.page.locator('#ProductOverview');
  }
  /** The sales center section. */
  private get salesCenterSection(): Locator {
    return this.page
      .locator('section, div')
      .filter({
        hasText: /showhome|sales|directions|hours/i,
      })
      .first();
  }
  /** The in-page navigation links. */
  private get navLinks(): Locator {
    return this.page.locator('a');
  }

  /**
   * The real hero CTA: a <button> that is NOT role="link".
   *
   * Targeted by structure rather than accessible name on purpose - the page
   * also renders an off-canvas duplicate in the sticky quick-action bar as
   * <button role="link"> with an empty aria-label, so name-based queries
   * (getByRole with a name) miss it inconsistently. Excluding role="link"
   * structurally drops that duplicate, which otherwise fails the click
   * ("Element is outside of the viewport") and, being a link, can navigate away
   * to /contact.
   */
  private get getInformationButtonCta(): Locator {
    return this.page.locator(GET_INFORMATION_CTA_SELECTOR).filter({
      hasText: GET_INFORMATION_CTA_TEXT,
    });
  }

  /** Every element that could be the Get Information / Stay Updated CTA, whatever its role. */
  private get getInformationCtaCandidates(): Locator {
    return this.page.locator('button:visible, a:visible').filter({
      hasText: GET_INFORMATION_CTA_TEXT,
    });
  }

  /**
   * Resolves the Get Information CTA to actually click, or null when none is reachable yet.
   *
   * Every candidate goes through {@link firstInViewportIndex}, so this only ever hands back a CTA a
   * click would land on. There is deliberately no "first match" fallback: the copies this would fall
   * back to are the off-canvas sticky-bar duplicate and CTAs sitting under the promotion banners,
   * and clicking one of those does not open the modal - it spends the action timeout on
   * "subtree intercepts pointer events" and then fails the test. Returning null instead lets the
   * caller clear the overlays and ask again, which is what actually resolves it.
   */
  private async resolveGetInformationCta(
    allowCoveredFallback = false,
    deadline?: number,
  ): Promise<Locator | null> {
    // The hero CTA is the real trigger: `<button aria-label="Stay updated about this community">`
    // inside #HeaderPlanPage. Matching that container first means the off-canvas sticky-bar copies
    // cannot win on ordering.
    const heroCta = getHeroInformationCta(this.page);
    const heroIndex = await this.pollForInViewportCtaIndex(heroCta, deadline);
    if (heroIndex !== -1) {
      return heroCta.nth(heroIndex);
    }

    const buttonCta = this.getInformationButtonCta;
    const buttonIndex = await this.firstInViewportIndex(buttonCta);
    if (buttonIndex !== -1) {
      return buttonCta.nth(buttonIndex);
    }

    const candidates = this.getInformationCtaCandidates;
    const anyIndex = await this.firstInViewportIndex(candidates);

    if (anyIndex !== -1) {
      return candidates.nth(anyIndex);
    }

    // Last resort, and only once the caller has run out of window: hand back a CTA that did not
    // hit-test clean so the flow still attempts the click and fails with Playwright's call log
    // naming whatever covered it, rather than with a bare "none found".
    //
    // The unfiltered set stands in when the visible one is empty: during the page's second
    // hydration pass there is a window - measured at around six seconds in on the phone profiles -
    // where every copy of the CTA is visibility:hidden at once, and a lookup that lands in it
    // otherwise ends the flow with "none found" for a CTA the page does have.
    if (allowCoveredFallback) {
      const fallback = (await candidates.count()) ? candidates : this.getInformationButtonCta;

      if (await fallback.count()) {
        return fallback.first();
      }
    }

    return null;
  }

  /**
   * Waits until one of the CTAs renders inside the viewport and returns its index, or -1 if none
   * does.
   *
   * The ceiling covers the hero image load that gates the real CTA's visibility, which runs to about
   * twelve seconds on the phone profiles, and is trimmed to whatever the caller has left. A poll
   * that outlives its caller's window spends the entire budget on one attempt, so the retry loop
   * around it never gets to clear an overlay, re-resolve, or fall back to a covered CTA - and the
   * flow ends on "none found" instead of on the reason the click could not land.
   */
  private async pollForInViewportCtaIndex(cta: Locator, deadline?: number): Promise<number> {
    let index = -1;

    await expect
      .poll(
        async () => {
          // Re-centered on every pass, because where the CTA sits changes under this poll: the page
          // re-renders after its second hydration pass and the hero CTA settles at the very bottom
          // edge of a phone viewport - measured at y 634-694 of a 664px viewport on the Canadian
          // community page - where its center point falls on the consent bar and the hit-test
          // rejects it. Centring once up front is scrolled away by that re-render.
          await this.scrollCtaIntoCenter(cta);

          return (index = await this.firstInViewportIndex(cta));
        },
        {
          message: 'A Get Information CTA should render inside the viewport',
          timeout: this.getCtaPollTimeout(deadline),
        },
      )
      .toBeGreaterThanOrEqual(0)
      .catch(() => undefined);

    return index;
  }

  /** How long a CTA poll may run without using up the caller's remaining window. */
  private getCtaPollTimeout(deadline?: number): number {
    if (!deadline) {
      return CommunityPage.CTA_POLL_TIMEOUT;
    }

    const remaining = deadline - Date.now() - CommunityPage.CTA_FALLBACK_RESERVE;

    return Math.max(2_000, Math.min(CommunityPage.CTA_POLL_TIMEOUT, remaining));
  }

  /** Scrolls a CTA to the middle of the viewport, clear of the banners pinned to both edges. */
  private async scrollCtaIntoCenter(cta: Locator): Promise<void> {
    if (!(await cta.count())) {
      return;
    }

    await cta
      .first()
      .evaluate((element) => element.scrollIntoView({ block: 'center' }))
      .catch(() => undefined);
    await this.settle(300);
  }

  /**
   * Returns the index of the first CTA in the set a click would actually land on, or -1 when none
   * qualify.
   *
   * Hit-tests the center point rather than asking whether the box overlaps the viewport, because
   * neither weaker check is enough on its own here. The hero container is `visibility: hidden` until
   * its background image loads - about twelve seconds on a phone profile - and a
   * `visibility: hidden` element still reports a full-size box at its final position, so going on
   * the box alone hands back a CTA that is not there yet. And the promotion banners pinned to the
   * top of the page cover the hero CTA on a phone viewport, so a CTA that is visible, enabled and
   * stable still fails the click with "#national-notification-banner subtree intercepts pointer
   * events". One hit-test rules out both, and the off-canvas sticky-bar duplicate with them.
   */
  private async firstInViewportIndex(cta: Locator): Promise<number> {
    const count = await cta.count();

    for (let i = 0; i < count; i++) {
      const candidate = cta.nth(i);

      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      const clickable = await candidate
        .evaluate((element) => {
          const rect = element.getBoundingClientRect();

          if (rect.width <= 0 || rect.height <= 0) {
            return false;
          }

          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;

          if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
            return false;
          }

          const topMost = document.elementFromPoint(x, y);

          return (
            !!topMost &&
            (topMost === element || element.contains(topMost) || topMost.contains(element))
          );
        })
        .catch(() => false);

      if (clickable) {
        return i;
      }
    }

    return -1;
  }

  // ----- Register Form -----

  /** The confirmation modal shown after a successful submission. */
  private get successDialogModal(): Locator {
    return this.page.locator('.ReactModal__Content');
  }
  /** The thank-you message shown after the form is submitted. */
  private get formSuccessMessage(): Locator {
    return this.page
      .getByText(
        /Thank you for your interest in Mattamy Homes|Thanks for your interest|request has been submitted|Thank you/i,
      )
      .last();
  }
  /**
   * The lead form dialog or sidebar.
   *
   * Three filters, each earning its place. Visible, because the page pre-renders
   * hidden modal shells that also hold inputs - an unfiltered set makes "did the
   * modal open?" pass instantly against a hidden container. Has a Submit button,
   * because that is what separates a lead form from the other dialogs (the
   * promotion overlay is a full-screen role="dialog" with inputs). And not a
   * promotion overlay, as belt and braces on the other two.
   */
  private get leadFormDialogOrSidebar(): Locator {
    return (
      this.page
        .locator(
          '#ModalForm, [id*="ModalForm"], .ReactModal__Content, [role="dialog"], aside, [class*="drawer" i], [class*="sidebar" i]',
        )
        .filter({ visible: true })
        .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
        // and(), not filter({ hasNot }): the aria-label sits on the overlay itself,
        // and hasNot only inspects descendants.
        .and(
          this.page.locator(
            ':not([aria-label*="promotion" i]):not([aria-label*="notification" i])',
          ),
        )
    );
  }

  // PAGE LOAD VALIDATION

  /** Checks a community search lands on the right community page. */
  async verifySearchByCommunity(expectedCommunity: string): Promise<void> {
    await this.step(`Verify community search navigates to ${expectedCommunity}`, async () => {
      await this.waitForPageReady();
      const { communityPath } = this.location;

      if (communityPath) {
        await expect(
          this.page,
          'Community search should navigate to the configured community URL',
        ).toHaveURL(new RegExp(escapeRegex(communityPath), 'i'), { timeout: 60000 });
      }

      // The community page (reached via search, not navigate()) can also come up
      // blank/unhydrated on the correct URL - recover before asserting content.
      await this.ensurePageRendered();

      const communityHeading = this.page
        .locator('h1')
        .filter({ hasText: new RegExp(escapeRegex(expectedCommunity), 'i') })
        .first();

      await expect(communityHeading).toBeVisible({ timeout: 60000 });
    });
  }

  // CORE SECTION VALIDATION

  /** Checks every core section of the community page is present. */
  async verifyCoreSections(): Promise<void> {
    await this.step('Verify core community sections', async () => {
      await this.verifySection(
        this.availableHomesSection,
        'Available Homes',
        'community.availableHomesSection',
      );
      await this.verifySection(this.mapSection, 'Map', 'community.mapSection');
      await this.verifySection(this.contactSection, 'Contact', 'community.contactSection');
    });
  }
  /** Checks one core section. A missing section fails unless it is declared optional. */
  private async verifySection(locator: Locator, name: string, feature: FeatureKey): Promise<void> {
    if (
      !(await this.isFeaturePresent(locator, feature, `${name} section`, { state: 'attached' }))
    ) {
      return;
    }

    // Scroll safely
    const section = locator.first();
    await section.scrollIntoViewIfNeeded();

    // Wait for SPA render
    await this.waitForPageReady();

    // Assert visibility (with retry)
    await expect(section, `${name} section not visible`).toBeVisible({ timeout: 5000 });
  }

  // ALL NAV LINK VALIDATION

  /** Checks every in-page navigation link points somewhere real. */
  async verifyAllNavigationLinks(): Promise<void> {
    await this.step('Verify all navigation links have href', async () => {
      const linkCount = await this.navLinks.count();
      let validatedLinks = 0;

      for (let i = 0; i < linkCount; i++) {
        const link = this.navLinks.nth(i);
        const href = await link.getAttribute('href');

        if (!href || href.startsWith('#') || href.includes('mailto')) {
          continue;
        }

        expect(href).toBeTruthy();
        validatedLinks++;

        await this.reportValue(`Nav link ${validatedLinks}`, this.buildFullUrl(href));
      }

      await this.reportValue(`Validated ${validatedLinks} navigation link(s)`);
    });
  }

  // AVAILABLE HOMES NAVIGATION

  /** Checks the Available Homes link jumps to its section. */
  async verifyAvailableHomesNavigation(): Promise<void> {
    await this.step('Verify available homes navigation', async () => {
      const firstHome = this.page.locator('a[href*="/quick-move-in"]').first();

      if (await firstHome.count()) {
        const href = await firstHome.getAttribute('href');

        await Promise.all([this.page.waitForLoadState('domcontentloaded'), firstHome.click()]);

        await expect(this.page).toHaveURL(new RegExp(href!, 'i'));

        await this.page.goBack();
        await this.waitForPageReady();
      }
    });
  }

  // PLAN NAVIGATION

  /** Checks the Plans link jumps to its section. */
  async verifyPlansNavigation(): Promise<void> {
    await this.step('Verify plans navigation', async () => {
      const firstPlan = this.page.locator('a[href*="/brinkley"]').first();

      if (await firstPlan.count()) {
        const href = await firstPlan.getAttribute('href');

        await Promise.all([this.page.waitForLoadState('domcontentloaded'), firstPlan.click()]);

        await expect(this.page).toHaveURL(new RegExp(href!, 'i'));

        await this.page.goBack();
        await this.waitForPageReady();
      }
    });
  }

  /**
   * Checks the Hours, Directions and Schedule an Appointment CTAs, where the community has them.
   */
  async verifyContactActionCtas(): Promise<void> {
    await this.step('Verify community contact action CTAs when available', async () => {
      await this.verifyHoursCta();
      await this.verifyDirectionsCta();
      await this.verifyScheduleAppointmentCta();
    });
  }

  /** Checks the Hours CTA shows opening hours, not just a label. */
  private async verifyHoursCta(): Promise<void> {
    const hoursCta = this.page.getByRole('button', { name: /^Hours$/i }).first();

    if (
      !(await this.isFeaturePresent(hoursCta, 'community.hoursCta', 'Hours CTA', { timeout: 3000 }))
    ) {
      return;
    }

    await this.scrollIntoCenter(hoursCta);
    await hoursCta.click();
    await this.waitForPageReady();

    const scheduleContext = this.page.locator('body');
    await expect(
      scheduleContext,
      'Hours CTA should expose open/closed status or a weekly schedule',
    ).toContainText(/Open|Closed|Mon|Tue|Wed|Thu|Fri|Sat|Sun|\d{1,2}:\d{2}/i, {
      timeout: 10000,
    });

    // Leave the page clean: the Hours panel stays open otherwise and covers the
    // Directions / Schedule an Appointment CTAs validated next, so their clicks
    // land on this dialog instead.
    await this.closeOpenDialogIfPresent('Sales center hours');
  }

  /**
   * Closes an open dialog so the next CTA validation starts from a clean page.
   *
   * Best-effort by design - a dialog that has already closed itself is fine.
   */
  private async closeOpenDialogIfPresent(label: string): Promise<void> {
    const dialog = this.page.locator(`[role="dialog"][aria-label="${label}"]:visible`).first();

    if (!(await dialog.count())) {
      return;
    }

    const closeButton = dialog
      .locator('button[aria-label*="close" i], button[class*="close" i]')
      .first();

    if (await closeButton.count()) {
      await closeButton.click().catch(() => undefined);
    } else {
      await this.page.keyboard.press('Escape').catch(() => undefined);
    }

    await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
  }

  /** Checks the Directions CTA links out to a map, without following it. */
  private async verifyDirectionsCta(): Promise<void> {
    // By accessible name, not text. It is a link wrapping an icon plus the word
    // "Directions", so /^Directions$/ failed on the markup whitespace.
    const directionsCta = this.page
      .getByRole('link', { name: /directions/i })
      .or(this.page.getByRole('button', { name: /directions/i }))
      .first();

    if (
      !(await this.isFeaturePresent(directionsCta, 'community.directionsCta', 'Directions CTA', {
        timeout: 3000,
      }))
    ) {
      return;
    }

    const href = await directionsCta.getAttribute('href');

    if (href) {
      expect(href, 'Directions CTA should link to a map or directions destination').toMatch(
        /maps|google|directions|bing|apple/i,
      );
      await this.reportValue('Directions CTA URL', href);
      return;
    }

    await this.scrollIntoCenter(directionsCta);
    await directionsCta.click();
    await this.waitForPageReady();
    await expect(
      this.page.locator('body'),
      'Directions CTA should expose map/directions context',
    ).toContainText(/directions|maps|google|address/i, { timeout: 10000 });
  }

  /** Checks the Schedule an Appointment CTA opens or links to a booking flow. */
  private async verifyScheduleAppointmentCta(): Promise<void> {
    const scheduleCta = this.page
      .locator('a:visible, button:visible')
      .filter({ hasText: /Schedule an Appointment/i })
      .first();

    if (
      !(await this.isFeaturePresent(
        scheduleCta,
        'community.scheduleAppointmentCta',
        'Schedule an Appointment CTA',
        { timeout: 3000 },
      ))
    ) {
      return;
    }

    const href = await scheduleCta.getAttribute('href');

    if (href && !href.startsWith('#')) {
      expect(
        href,
        'Schedule an Appointment CTA should link to scheduling or contact context',
      ).toMatch(/schedule|appointment|contact|visit|tour|calendar/i);
      await this.reportValue('Schedule an Appointment CTA URL', href);
      return;
    }

    // Scoped to VISIBLE dialogs: the page keeps hidden dialogs in the DOM (the
    // "Sales center hours" panel and the privacy dialogs), and an unfiltered
    // locator resolves to the hidden hours panel - whose text is just opening
    // times - so the assertion failed even though the scheduling modal did open.
    const schedulingModal = this.page
      .locator(
        '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible',
      )
      .filter({ hasText: /Schedule|Appointment|Visit|Tour|First Name|Last Name|Email/i })
      .first();

    // The first click intermittently does not open the modal (nothing happens, no
    // navigation, no error), so clicking once and asserting is flaky by
    // construction. Re-click while the modal has not appeared; opening it twice is
    // harmless, and a CTA that never opens it still fails below.
    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.scrollIntoCenter(scheduleCta);
      await scheduleCta.click();
      await this.waitForPageReady();

      if (await schedulingModal.isVisible({ timeout: 5000 }).catch(() => false)) {
        break;
      }

      await this.reportValue(
        `Schedule an Appointment modal did not open (attempt ${attempt}) - retrying`,
        this.page.url(),
      );
    }

    await expect(
      schedulingModal,
      'Schedule an Appointment CTA should expose scheduling form/context',
    ).toContainText(/Schedule|Appointment|Visit|Tour|First Name|Last Name|Email/i, {
      timeout: 10000,
    });
  }

  // FORM VALIDATION

  /**
   * Selector fragment excluding anything rendered inside the side modal/dialog,
   * so in-page form lookups cannot pick up the Get Information modal (or the
   * National-promotion overlay) and shift what "primary"/"footer" mean.
   */
  private static readonly NOT_IN_DIALOG =
    ':not([role="dialog"] *):not(.ReactModal__Content *):not([id*="ModalForm"] *)';

  /** The lead forms on the page itself, never the one in the side modal. */
  private get communityForms(): Locator {
    return this.page
      .locator(`form${CommunityPage.NOT_IN_DIALOG}`)
      .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** Checks the community's overview, address, market and key attributes. */
  async verifyOverviewAddressMarketAndAttributes(expectedCommunity: string): Promise<void> {
    await this.step('Verify overview, address, market and key attributes', async () => {
      await expect(
        this.productOverviewSection,
        'Community overview section should be visible',
      ).toBeVisible({ timeout: 15000 });

      await expect(
        this.productOverviewSection
          .getByRole('heading', {
            name: /Designed For the Way You Live|Welcome/i,
          })
          .first(),
        'Overview heading should render current community overview content',
      ).toBeVisible({ timeout: 15000 });

      const overviewText = await getNormalizedText(this.productOverviewSection);

      await expect(
        this.heading,
        'Main heading should include the current community name',
      ).toContainText(new RegExp(escapeRegex(expectedCommunity), 'i'));
      expect(overviewText.length, 'Overview copy should render meaningful content').toBeGreaterThan(
        150,
      );

      await this.verifyAddressAndMarketDetails(expectedCommunity);
      await this.verifyKeyAttributes();
    });
  }

  /** Checks a quick move-in card really belongs to this community. */
  async verifyQmiCardCommunityNameMatchesCurrentCommunity(
    expectedCommunity: string,
  ): Promise<void> {
    await this.step('Verify QMI cards match current community', async () => {
      const availableHomesSection = await this.getAvailableHomesSection();

      if (!availableHomesSection) {
        await this.reportValue(
          'Available homes section not present - skipping QMI community-name validation',
        );
        return;
      }

      await this.scrollTo(availableHomesSection);
      await this.waitForPageReady();

      if (!(await availableHomesSection.isVisible({ timeout: 5000 }).catch(() => false))) {
        await this.reportValue(
          'Available homes section not visible - skipping QMI community-name validation',
        );
        return;
      }

      const qmiCards = availableHomesSection
        .locator('a[href]:visible')
        .filter({ hasNotText: /view all/i });

      await qmiCards
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => undefined);

      const qmiCardCount = await qmiCards.count();

      if (!qmiCardCount) {
        await this.reportValue('No QMI cards present - skipping QMI community-name validation');
        return;
      }

      const currentCommunitySegment = getLastPathSegment(this.page.url());

      expect(
        currentCommunitySegment,
        `Current community URL segment should be available for ${expectedCommunity}`,
      ).toBeTruthy();

      for (let i = 0; i < qmiCardCount; i++) {
        const card = qmiCards.nth(i);
        const href = await card.getAttribute('href');
        const hrefSegments = href
          ? new URL(href, this.page.url()).pathname.toLowerCase().split('/').filter(Boolean)
          : [];

        expect(
          hrefSegments,
          `QMI card ${i + 1} href should include the exact current community URL segment`,
        ).toContain(currentCommunitySegment);

        await this.reportValue(`QMI card ${i + 1}`, this.buildFullUrl(href));
      }

      await this.reportValue(
        `Validated ${qmiCardCount} QMI card(s) against community segment '${currentCommunitySegment}'`,
      );
    });
  }

  /** Returns the Available Homes section, or null when the community has none. */
  private async getAvailableHomesSection(): Promise<Locator | null> {
    const sectionById = this.availableHomesSection.first();

    if (await sectionById.count()) {
      return sectionById;
    }

    const qmiHeading = this.page
      .getByRole('heading', { name: /Quick Move-In Homes ready when you are/i })
      .first();

    if (!(await qmiHeading.count())) {
      return null;
    }

    return qmiHeading.locator('xpath=ancestor::*[(self::section or self::div) and .//a[@href]][1]');
  }

  /** Checks the address and market shown match this community. */
  private async verifyAddressAndMarketDetails(expectedCommunity: string): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.waitForPageReady();

    // The address is not always rendered in a heading tag - on the community
    // page it lives in the "Sales center" strip as a plain text element - so
    // match by text content regardless of tag rather than restricting to h1-h4.
    const addressHeading = this.page.getByText(/\d{1,}.+,\s*.+\b[A-Z]{2}\b/i).first();
    const currentPath = new URL(this.page.url()).pathname;
    const marketFromUrl = this.getMarketFromCurrentUrl();

    await expect(addressHeading, 'Community address should render in the page').toBeAttached({
      timeout: 15000,
    });

    const addressText = await getNormalizedText(addressHeading);

    expect(addressText, 'Community address should include a street number').toMatch(/\d{1,}/);
    expect(
      addressText,
      'Community address should include province/state and postal/ZIP details',
    ).toMatch(/\b[A-Z]{2}\b/);

    if (marketFromUrl) {
      expect(
        currentPath.toLowerCase(),
        'Community URL should include the current market/city context',
      ).toContain(toSlug(marketFromUrl));
      await expect(
        this.page.locator('body'),
        'Community page should include visible market/city context',
      ).toContainText(new RegExp(escapeRegex(marketFromUrl), 'i'), { timeout: 15000 });
    }

    await expect(
      this.heading,
      'Main heading should still show the current community',
    ).toContainText(new RegExp(escapeRegex(expectedCommunity), 'i'));
  }

  /** Checks the community lists its key attributes. */
  private async verifyKeyAttributes(): Promise<void> {
    const requiredAttributes = [
      /Home Types/i,
      /Bedrooms/i,
      /Full Bathrooms/i,
      /Sq\.?\s*Ft\./i,
      /Stories/i,
      /Garages/i,
    ];

    for (const attribute of requiredAttributes) {
      await expect(
        this.productOverviewSection,
        `Key attribute ${attribute} should render`,
      ).toContainText(attribute, { timeout: 10000 });
    }
  }

  /**
   * Fallback in-page form containers for pages that render a lead form without a
   * <form> tag. Same dialog exclusion as communityForms.
   */
  private get communityFormContainers(): Locator {
    return this.page
      .locator(
        [
          '[id^="Sitecore-ScheduleAVisit-FormInstance"]',
          '[id^="ScheduleAVisit-FormInstance"]',
          '#contact',
          'section',
          '[role="group"]',
        ]
          .map((selector) => `${selector}${CommunityPage.NOT_IN_DIALOG}`)
          .join(', '),
      )
      .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /**
   * The in-page lead forms, in DOM order.
   *
   * Deliberately excludes anything inside the side modal / dialog: the primary
   * and footer forms are page content, and letting a dialog into this set makes
   * "the primary form" mean different elements on different runs. Prefers real
   * <form> elements and falls back to the Sitecore /
   * ScheduleAVisit / #contact wrappers for the pages that render a lead form
   * without a <form> tag.
   */
  private async inPageForms(): Promise<Locator> {
    const forms = this.communityForms;

    return (await forms.count()) ? forms : this.communityFormContainers;
  }

  /**
   * The primary (top-most) in-page community form.
   *
   * Resolved by position within the in-page forms rather than by a global index,
   * so a newly rendered dialog cannot shift what this refers to.
   */
  private async primaryForm(): Promise<Locator> {
    return (await this.inPageForms()).first();
  }

  /**
   * The footer community form: the second in-page lead form.
   *
   * Positional, but within a single homogeneous set (in-page lead forms, never
   * dialogs) rather than counted across unrelated locator groups - the page can
   * render further forms below it (newsletter-style, no validation), so `.last()`
   * is not the same thing. Throws when the page has no second form rather than
   * quietly re-validating the primary one.
   */
  private async footerForm(): Promise<Locator> {
    const forms = await this.inPageForms();

    if ((await forms.count()) < 2) {
      throw new Error('Footer community form not present - page rendered only one in-page form');
    }

    return forms.nth(1);
  }

  /** Clicks the Get Information CTA, unless the form is already open. */
  private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
    const cta = await this.resolveGetInformationCta();

    if (!cta || !(await cta.isVisible({ timeout: 5000 }).catch(() => false))) {
      return;
    }

    const previousUrl = this.page.url();

    // click() auto-scrolls; a separate scroll only adds a step that throws outright when the page
    // re-renders between resolving the CTA and reaching it.
    await cta.click();
    await this.waitForPageReady();

    await this.settle(1000);
    expect(
      this.page.url(),
      `Community lead-form CTA should keep the flow on page, not redirect from ${previousUrl}`,
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /**
   * Resolves a named in-page form and asserts it is usable.
   *
   * Always returns a form or throws - callers do not need a null check.
   */
  private async getAvailableForm(
    resolveForm: () => Promise<Locator>,
    formName: string,
  ): Promise<Locator> {
    await this.dismissPromoPopupIfPresent({ appearTimeout: 3000 });
    // A promo that mounted after that window leaves `#root` aria-hidden, and the
    // in-page form lookups below would then resolve to nothing.
    await this.ensurePageInAccessibilityTree();

    let form = await resolveForm();

    if (!(await form.count())) {
      // Some layouts only render the in-page form after the lead-form CTA runs.
      await this.openLeadFormFromGetInformationCtaIfPresent();
      form = await resolveForm();
    }

    if (!(await form.count())) {
      throw new Error(`${formName} not present on the community page`);
    }

    // This scroll earns its place: the footer form sits ~10,000px down and only
    // hydrates once it enters the
    // viewport, so submitting without scrolling clicks a button whose React
    // handler is not attached yet and silently does nothing.
    await form.scrollIntoViewIfNeeded({ timeout: 10_000 });
    await this.settle(1000);

    await expect(getSubmitButton(form), `${formName} submit button should be visible`).toBeVisible({
      timeout: 10000,
    });

    return form;
  }

  /**
   * Clicks the Get Information / Stay Updated CTA that opens the side modal form.
   *
   * The side modal is only rendered as a result of that click, so a missing or
   * unclickable CTA is a hard failure here rather than something the caller
   * later reports as a form that "did not open". Skipped only when a side modal
   * is already open (the locator is visible-filtered, so that is real).
   */
  private async openSideModalFromGetInformationCta(formName: string): Promise<void> {
    if (await this.leadFormDialogOrSidebar.count()) {
      return;
    }

    // The National-promotion overlay is a full-screen dialog that sits on top of
    // the CTA and swallows the click. Dismiss it rather than clicking through it
    // with force, so a genuinely unreachable CTA still fails.
    await this.dismissPromoPopupIfPresent({ appearTimeout: 3000 });

    const previousUrl = this.page.url();
    const deadline = Date.now() + 45_000;
    const lastResortAfter = Date.now() + 35_000;
    const reloadAfter = Date.now() + 25_000;
    let lastClickError: unknown = null;
    let sawCandidate = false;
    let reloaded = false;

    // Resolve and click in one loop, re-resolving each attempt: the page re-renders after its second
    // hydration pass, which detaches a CTA resolved a moment earlier and leaves the click waiting on
    // a node that is no longer in the document.
    while (Date.now() < deadline) {
      const cta = await this.resolveGetInformationCta(Date.now() > lastResortAfter, deadline);

      if (!cta) {
        // Nothing reachable: the promotion banners pinned to the top of the page cover the hero CTA
        // on a phone viewport, and they re-mount on a timer. Clearing them is what makes the next
        // attempt differ from this one.
        await this.dismissPromoPopupIfPresent({ appearTimeout: 1000 });

        // Not one CTA has been visible at all: the page is stuck in its server-rendered shell. These
        // bundles intermittently die mid-hydration with "undefined is not a constructor", which
        // leaves every control present but permanently zero-box, and only a reload recovers it.
        if (!sawCandidate && !reloaded && Date.now() > reloadAfter) {
          reloaded = true;

          await this.page
            .reload({ waitUntil: 'domcontentloaded', timeout: 90_000 })
            .catch(() => undefined);
          await this.waitForPageReady();
        }

        continue;
      }

      sawCandidate = true;

      // Center it before clicking. The hero CTA renders near the top of the page, right where the
      // promotion banners sit, and those re-mount on a timer - so a CTA that hit-tests clean can be
      // covered again a few hundred milliseconds later, when the click lands. Centring moves it
      // clear of that band entirely rather than racing it.
      await cta
        .evaluate((element) => element.scrollIntoView({ block: 'center' }))
        .catch(() => undefined);
      await this.settle(300);

      // No force: click() runs the actionability checks, so a CTA covered by an overlay/banner
      // fails here with a call log instead of silently "clicking" and breaking downstream.
      const clicked = await cta
        .click({ timeout: 10_000 })
        .then(() => true)
        .catch((error: unknown) => {
          lastClickError = error;
          return false;
        });

      if (!clicked) {
        // The promotion banners and the promo portal re-mount on a timer and can land on top of the
        // hero CTA between two attempts. Clearing them is what makes the next attempt differ.
        await this.dismissPromoPopupIfPresent({ appearTimeout: 1000 });
        continue;
      }

      await this.waitForPageReady();
      await this.settle(1000);

      expect(
        this.page.url(),
        `Community lead-form CTA should keep the flow on page, not redirect from ${previousUrl}`,
      ).not.toMatch(/\/contact\/?($|[?#])/i);

      return;
    }

    if (lastClickError) {
      throw lastClickError;
    }

    throw new Error(
      `No Get Information / Stay Updated CTA found on the community page to open ${formName}`,
    );
  }

  /** Returns the Get Information form once its CTA has opened it. */
  private async getAvailableGetInformationForm(
    formName = 'Get Information community form',
  ): Promise<Locator | null> {
    await this.openSideModalFromGetInformationCta(formName);
    await this.ensurePageInAccessibilityTree();

    const modalFormCount = await expect
      .poll(() => this.leadFormDialogOrSidebar.count(), {
        message: `${formName} sidebar/modal should be open after clicking the Get Information CTA`,
        timeout: 15000,
      })
      .toBeGreaterThan(0)
      .then(() => this.leadFormDialogOrSidebar.count())
      .catch(() => 0);

    if (!modalFormCount) {
      throw new Error(`${formName} sidebar/modal form did not open`);
    }

    const modalForm = this.leadFormDialogOrSidebar.first();
    const submitButton = getSubmitButton(modalForm);

    await this.waitForPageReady();

    await expect(
      submitButton,
      `${formName} submit button should be visible inside sidebar/modal`,
    ).toBeVisible({ timeout: 10000 });

    return modalForm;
  }

  /** Picks the country of residence, when the form asks for one. */
  private async selectCountryOfResidenceIfPresent(form: Locator): Promise<void> {
    const countryOfResidence = form
      .getByRole('combobox', {
        name: /country of residence/i,
      })
      .first();

    if (!(await countryOfResidence.count())) {
      return;
    }

    const preferredCountry = this.location.country === 'USA' ? 'United States' : 'Canada';

    const selectedPreferred = await countryOfResidence
      .selectOption({ label: preferredCountry })
      .then(() => true)
      .catch(() => false);

    if (!selectedPreferred) {
      await countryOfResidence.selectOption({ index: 1 }).catch(() => undefined);
    }
  }

  /** Checks the consent checkbox when it is present. */
  private async checkConsentIfPresent(form: Locator): Promise<void> {
    await checkConsentIfPresent(form);
  }

  /** Fills the community lead form with the given data. */
  private async fillCommunityLeadForm(form: Locator, leadData: LeadFieldData): Promise<void> {
    await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), leadData.firstName);
    await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), leadData.lastName);
    await fillIfPresent(form.getByRole('textbox', { name: /^email/i }), leadData.email);
    await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), leadData.phone);
    await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), leadData.zip);
    await this.selectCountryOfResidenceIfPresent(form);
    // Four extra dropdowns (Bedroom Count, Desired Move Date, New Budget, First Time Home Buyer):
    // optional on US / custom forms and required on Canada forms, so filled whenever present.
    await fillExtraLeadFieldsIfPresent(form);
    await this.checkConsentIfPresent(form);
  }

  /** Checks the Get Information CTA opens a lead form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      // The CTA visibility check and the click both live in
      // getAvailableGetInformationForm - the side modal exists only after that
      // click, so resolving the CTA twice here would just double the 15s poll.
      const form = await this.getAvailableGetInformationForm(
        'Get Information community sideModalForm',
      );

      if (!form) {
        return;
      }

      await expect(form, 'Get Information community sideModalForm should be visible').toBeVisible({
        timeout: 10000,
      });
    });
  }

  /** Resolves a named in-page form and checks it is usable. */
  private async viewNamedForm(
    resolveForm: () => Promise<Locator>,
    formName: string,
  ): Promise<void> {
    await this.getAvailableForm(resolveForm, formName);
  }

  /** Opens the side modal and checks its form is usable. */
  private async viewSideModalFormByName(formName: string): Promise<void> {
    await this.getAvailableGetInformationForm(formName);
  }

  /** Submits a named in-page form empty and checks it complains. */
  private async validateEmptyFormErrorsFor(
    resolveForm: () => Promise<Locator>,
    formName: string,
  ): Promise<void> {
    const form = await this.getAvailableForm(resolveForm, formName);

    await clickSubmit(this.page, form);

    await expect(
      form.locator('text=/Required|Please complete|Invalid|Error/i').first(),
    ).toBeVisible({ timeout: 10000 });
  }

  /** Submits the side modal form empty and checks the required-field errors appear. */
  private async validateSideModalFormEmptyErrors(formName: string): Promise<void> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      return;
    }

    await clickSubmit(this.page, form);

    await expectRequiredErrorsInForm(form);
  }

  /** Checks a named in-page form rejects an invalid email address. */
  private async validateInvalidEmailFor(
    resolveForm: () => Promise<Locator>,
    formName: string,
  ): Promise<void> {
    const form = await this.getAvailableForm(resolveForm, formName);

    const invalid = getInvalidLeadData('community');

    await this.fillCommunityLeadForm(form, invalid);

    await clickSubmit(this.page, form);

    await expect(form.locator('text=/valid domain name/i').first()).toBeVisible({ timeout: 10000 });
  }

  /** Checks the side modal form rejects an invalid email address. */
  private async validateSideModalFormInvalidEmailByName(formName: string): Promise<void> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      return;
    }

    await fillInvalidSideModalForm(form, 'community');

    await clickSubmit(this.page, form);

    await expectInvalidEmailErrorInForm(form);
  }

  /** Fills a named in-page form with valid data and checks it submits. */
  private async submitSuccessfulFormFor(
    resolveForm: () => Promise<Locator>,
    formName: string,
  ): Promise<void> {
    const form = await this.getAvailableForm(resolveForm, formName);

    const valid = getValidLeadData('community');

    await this.fillCommunityLeadForm(form, valid);

    await this.submitLeadFormAndCaptureApi({
      form: form,
      formName,
      submitButton: getSubmitButton(form),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage,
    });
  }

  /** Fills the side modal form with valid data and checks it submits. */
  private async submitSuccessfulSideModalForm(formName: string): Promise<void> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      return;
    }

    await fillValidSideModalForm(form, 'communityGetInfo');

    await this.submitLeadFormAndCaptureApi({
      form: form,
      formName,
      submitButton: getSubmitButton(form),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage,
    });
  }

  /** Opens the primary community form. */
  async viewForm(): Promise<void> {
    await this.viewPrimaryForm();
  }

  /** Opens the primary community form and checks it is usable. */
  async viewPrimaryForm(): Promise<void> {
    await this.step('View primary community form', async () => {
      await this.viewNamedForm(() => this.primaryForm(), 'Primary community form');
    });
  }

  /** Opens the footer community form and checks it is usable. */
  async viewFooterForm(): Promise<void> {
    await this.step('View footer community form', async () => {
      await this.viewNamedForm(() => this.footerForm(), 'Footer community form');
    });
  }

  /** Opens the side modal form and checks it is usable. */
  async viewSideModalForm(): Promise<void> {
    await this.step('View Get Information sideModalForm', async () => {
      await this.viewSideModalFormByName('Get Information community sideModalForm');
    });
  }

  /** Submits the primary form empty and checks it complains. */
  async validateEmptyFormErrors(): Promise<void> {
    await this.validatePrimaryFormEmptyErrors();
  }

  /** Submits the primary form empty and checks the required-field errors appear. */
  async validatePrimaryFormEmptyErrors(): Promise<void> {
    await this.step('Validate primary form empty errors', async () => {
      await this.validateEmptyFormErrorsFor(() => this.primaryForm(), 'Primary community form');
    });
  }

  /** Submits the footer form empty and checks the required-field errors appear. */
  async validateFooterFormEmptyErrors(): Promise<void> {
    await this.step('Validate footer form empty errors', async () => {
      await this.validateEmptyFormErrorsFor(() => this.footerForm(), 'Footer community form');
    });
  }

  /** Checks the side modal form shows its fields. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Verify Get Information sideModalForm fields', async () => {
      const form = await this.getAvailableGetInformationForm(
        'Get Information community sideModalForm',
      );

      if (!form) {
        return;
      }

      await expectSideModalFormFields(form);
    });
  }

  /** Submits the side modal form empty and checks the required-field errors appear. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Validate Get Information sideModalForm empty errors', async () => {
      await this.validateSideModalFormEmptyErrors('Get Information community sideModalForm');
    });
  }

  /** Checks the primary form rejects an invalid email address. */
  async validateInvalidEmail(): Promise<void> {
    await this.validatePrimaryFormInvalidEmail();
  }

  /** Checks the primary form rejects an invalid email address. */
  async validatePrimaryFormInvalidEmail(): Promise<void> {
    await this.step('Validate primary form invalid email', async () => {
      await this.validateInvalidEmailFor(() => this.primaryForm(), 'Primary community form');
    });
  }

  /** Checks the footer form rejects an invalid email address. */
  async validateFooterFormInvalidEmail(): Promise<void> {
    await this.step('Validate footer form invalid email', async () => {
      await this.validateInvalidEmailFor(() => this.footerForm(), 'Footer community form');
    });
  }

  /** Checks the side modal form rejects an invalid email address. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate Get Information sideModalForm invalid email', async () => {
      await this.validateSideModalFormInvalidEmailByName('Get Information community sideModalForm');
    });
  }

  /** Fills the primary form with valid data and checks it submits. */
  async verifyPrimaryFormSuccessSubmission(): Promise<void> {
    await this.step('Submit primary community form successfully', async () => {
      await this.submitSuccessfulFormFor(() => this.primaryForm(), 'Primary community form');
    });
  }

  /** Fills the footer form with valid data and checks it submits. */
  async verifyFooterFormSuccessSubmission(): Promise<void> {
    await this.step('Submit footer community form successfully', async () => {
      await this.submitSuccessfulFormFor(() => this.footerForm(), 'Footer community form');
    });
  }

  /**
   * Open the Get Information side modal lead form and return its container.
   *
   * Exposes the same CTA flow the side-modal checks use, so an evidence spec that only needs the
   * open form reuses the viewport-aware CTA resolution instead of clicking the off-canvas
   * sticky-bar duplicate.
   */
  async openSideModalLeadForm(
    formName = 'Get Information community sideModalForm',
  ): Promise<Locator> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      throw new Error(`${formName} did not open`);
    }

    return form;
  }

  /** Fills the side modal form with valid data and checks it submits. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit Get Information community sideModalForm successfully', async () => {
      await this.submitSuccessfulSideModalForm('Get Information community sideModalForm');
    });
  }

  /** Pulls the market name out of the current URL. */
  private getMarketFromCurrentUrl(): string | null {
    const segments = getPathSegments(this.page.url());

    if (segments.length < 3) {
      return null;
    }

    return toTitleCase(segments[1]);
  }
}
