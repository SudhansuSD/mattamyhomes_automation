import { Locator, Page, expect } from '@playwright/test';
import type { FeatureKey } from '../config/features/featureExpectations';
import {
  escapeRegex,
  getLastPathSegment,
  getNormalizedText,
  getPathSegments,
  scrollToUncoveredSpot,
  toSlug,
  toTitleCase,
} from '../utils/web/pageObjectUtils';
import { SearchablePage } from './SearchablePage';
import { HomeTypeTabs } from '../support/HomeTypeTabs';
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
  /** Max time one poll waits for a clickable Get Information CTA. */
  private static readonly CTA_POLL_TIMEOUT = 30_000;

  /** Time kept back from CTA polls so the covered-CTA fallback still gets a try. */
  private static readonly CTA_FALLBACK_RESERVE = 12_000;

  /** The Quick Move-In Homes / Floorplans tabs in the Available Homes section. */
  private readonly homeTypeTabs: HomeTypeTabs;

  // Constructor

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);
    this.homeTypeTabs = new HomeTypeTabs(page, {
      report: (message, value) => this.reportValue(message, value),
      waitForPageReady: () => this.waitForPageReady(),
    });
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
    // Most pages put the map under "Explore the community"; #map covers the rest.
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

  /** The real hero CTA button; excludes role="link" to skip the off-canvas sticky-bar duplicate. */
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

  /** Returns a clickable Get Information CTA, or null so the caller can clear overlays and retry. */
  private async resolveGetInformationCta(
    allowCoveredFallback = false,
    deadline?: number,
  ): Promise<Locator | null> {
    // Hero CTA first, so the off-canvas sticky-bar copies cannot win on ordering.
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

    // Last resort: return a covered CTA so the click fails with a log naming what covers it.
    // Falls back to the unfiltered set because every copy is briefly hidden during re-hydration.
    if (allowCoveredFallback) {
      const fallback = (await candidates.count()) ? candidates : this.getInformationButtonCta;

      if (await fallback.count()) {
        return fallback.first();
      }
    }

    return null;
  }

  /** Waits for a clickable CTA and returns its index, or -1; capped so the caller can still retry. */
  private async pollForInViewportCtaIndex(cta: Locator, deadline?: number): Promise<number> {
    let index = -1;

    await expect
      .poll(
        async () => {
          // Re-center every pass: a re-render can push the CTA under the consent bar on phones.
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

  /** Returns the first CTA a click would land on, or -1; a center hit-test skips covered CTAs. */
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
  /** The open lead form dialog or sidebar: visible, with a submit button, and not a promo overlay. */
  private get leadFormDialogOrSidebar(): Locator {
    return (
      this.page
        .locator(
          '#ModalForm, [id*="ModalForm"], .ReactModal__Content, [role="dialog"], aside, [class*="drawer" i], [class*="sidebar" i]',
        )
        .filter({ visible: true })
        .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
        // and(), not hasNot: the aria-label is on the overlay itself, not a descendant.
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

      // The page can load blank on the right URL; recover before asserting content.
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
      // No inventory at all means no Available Homes section, which is checked as its own state.
      if (await this.homeTypeTabs.hasSection()) {
        await this.verifySection(
          this.availableHomesSection,
          'Available Homes',
          'community.availableHomesSection',
        );
      } else {
        await this.homeTypeTabs.verifyNoInventory();
      }

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

    const section = locator.first();
    await section.scrollIntoViewIfNeeded();

    await this.waitForPageReady();

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

  // HOME TYPE TABS

  /** Checks the Quick Move-In Homes / Floorplans tabs match what the community has for sale. */
  async verifyHomeTypeTabsMatchInventory(): Promise<void> {
    await this.step('Verify Quick Move-In Homes / Floorplans tabs match inventory', async () => {
      await this.homeTypeTabs.verifyTabsMatchInventory();
    });
  }

  // AVAILABLE HOMES NAVIGATION

  /** Checks the first visible quick move-in card opens its home page. */
  async verifyAvailableHomesNavigation(): Promise<void> {
    await this.step('Verify available homes navigation', async () => {
      // No quick move-in homes is checked by verifyHomeTypeTabsMatchInventory.
      if (!(await this.homeTypeTabs.showQuickMoveIns())) {
        return;
      }

      await this.openFirstVisibleCard('qmi', 'QMI link');
    });
  }

  // PLAN NAVIGATION

  /** Checks the first visible floorplan card opens its plan page. */
  async verifyPlansNavigation(): Promise<void> {
    await this.step('Verify plans navigation', async () => {
      // No inventory at all is checked by verifyHomeTypeTabsMatchInventory.
      if (!(await this.homeTypeTabs.showFloorplans())) {
        return;
      }

      await this.openFirstVisibleCard('floorplans', 'Plan link');
    });
  }

  /** Opens the first visible card of one home type, checks where it lands, then comes back. */
  private async openFirstVisibleCard(type: 'qmi' | 'floorplans', label: string): Promise<void> {
    // Hidden tabs and carousel slides keep their cards in the DOM, so pick a visible one.
    let href: string | undefined;
    await expect
      .poll(async () => (href = (await this.homeTypeTabs.visibleCardHrefs(type))[0]), {
        message: `No visible ${type === 'qmi' ? 'quick move-in' : 'floorplan'} card on the community page`,
        timeout: 10000,
      })
      .toBeTruthy();

    const cardLink = this.availableHomesSection
      .locator(`a[href="${href}"]`)
      .filter({ visible: true })
      .first();
    await this.reportValue(label, this.buildFullUrl(href!));

    // On a phone the card otherwise ends up under the pinned banners or sticky bars.
    await scrollToUncoveredSpot(cardLink);
    await cardLink.click();

    await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(href!)}/?$`, 'i'));

    await this.page.goBack();
    await this.waitForPageReady();
  }

  /** Checks the Hours, Directions and Schedule an Appointment CTAs, where the community has them. */
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

    // Close the Hours panel, or it covers the CTAs checked next.
    await this.closeOpenDialogIfPresent('Sales center hours');
  }

  /** Closes this dialog if it is still open, so the next CTA check starts clean. */
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
    // By accessible name: the link wraps an icon, so its raw text has extra whitespace.
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

    // Visible dialogs only: hidden ones (hours panel, privacy dialogs) stay in the DOM.
    const schedulingModal = this.page
      .locator(
        '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible',
      )
      .filter({ hasText: /Schedule|Appointment|Visit|Tour|First Name|Last Name|Email/i })
      .first();

    // The first click sometimes does nothing, so retry; a CTA that never opens it still fails below.
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

  /** Keeps in-page form lookups from matching forms inside the side modal or other dialogs. */
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
      // No quick move-in homes is checked by verifyHomeTypeTabsMatchInventory.
      if (!(await this.homeTypeTabs.showQuickMoveIns())) {
        return;
      }

      // Not pre-filtered by path, so a card for another community is caught below.
      const qmiCards = this.availableHomesSection
        .locator('a[href]:visible')
        .filter({ hasNotText: /view all/i });

      await expect(qmiCards.first(), 'Quick Move-In Homes tab should show a card').toBeVisible({
        timeout: 10000,
      });

      const qmiCardCount = await qmiCards.count();

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

  /** Checks the address and market shown match this community. */
  private async verifyAddressAndMarketDetails(expectedCommunity: string): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.waitForPageReady();

    // Match by text, not heading tag: the address can sit in the Sales center strip as plain text.
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

  /** In-page lead form wrappers for pages that render no <form> tag. */
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

  /** Returns the in-page lead forms (never dialogs), falling back to form wrappers. */
  private async inPageForms(): Promise<Locator> {
    const forms = this.communityForms;

    return (await forms.count()) ? forms : this.communityFormContainers;
  }

  /** Returns the top-most in-page community form. */
  private async primaryForm(): Promise<Locator> {
    return (await this.inPageForms()).first();
  }

  // The community page renders no footer lead form; restore this with the footer
  // methods and tests if it returns.
  //
  // /** Returns the second in-page lead form; not `.last()`, as newsletter forms can follow it. */
  // private async footerForm(): Promise<Locator> {
  //   const forms = await this.inPageForms();
  //
  //   if ((await forms.count()) < 2) {
  //     throw new Error('Footer community form not present - page rendered only one in-page form');
  //   }
  //
  //   return forms.nth(1);
  // }

  /** Clicks the Get Information CTA, unless the form is already open. */
  private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
    const cta = await this.resolveGetInformationCta();

    if (!cta || !(await cta.isVisible({ timeout: 5000 }).catch(() => false))) {
      return;
    }

    const previousUrl = this.page.url();

    // No separate scroll: click() auto-scrolls, and an extra scroll throws if the page re-renders.
    await cta.click();
    await this.waitForPageReady();

    await this.settle(1000);
    expect(
      this.page.url(),
      `Community lead-form CTA should keep the flow on page, not redirect from ${previousUrl}`,
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Returns a named in-page form once it is usable; throws if it is missing. */
  private async getAvailableForm(
    resolveForm: () => Promise<Locator>,
    formName: string,
  ): Promise<Locator> {
    await this.dismissPromoPopupIfPresent({ appearTimeout: 3000 });
    // A late promo leaves #root aria-hidden, which hides the forms from the lookups below.
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

    // Forms far down the page only hydrate once scrolled into view; before that, submit does nothing.
    await form.scrollIntoViewIfNeeded({ timeout: 10_000 });
    await this.settle(1000);

    await expect(getSubmitButton(form), `${formName} submit button should be visible`).toBeVisible({
      timeout: 10000,
    });

    return form;
  }

  /** Clicks the CTA that opens the side modal form; fails if it cannot, unless one is already open. */
  private async openSideModalFromGetInformationCta(formName: string): Promise<void> {
    if (await this.leadFormDialogOrSidebar.count()) {
      return;
    }

    // Dismiss the promo overlay rather than force-clicking, so an unreachable CTA still fails.
    await this.dismissPromoPopupIfPresent({ appearTimeout: 3000 });

    const previousUrl = this.page.url();
    const deadline = Date.now() + 45_000;
    const lastResortAfter = Date.now() + 35_000;
    const reloadAfter = Date.now() + 25_000;
    let lastClickError: unknown = null;
    let sawCandidate = false;
    let reloaded = false;

    // Re-resolve each attempt: a re-render can detach a CTA resolved a moment earlier.
    while (Date.now() < deadline) {
      const cta = await this.resolveGetInformationCta(Date.now() > lastResortAfter, deadline);

      if (!cta) {
        // Nothing reachable: clear the promo banners that cover the hero CTA on phones.
        await this.dismissPromoPopupIfPresent({ appearTimeout: 1000 });

        // No CTA ever visible means hydration died, leaving a dead page shell; only a reload fixes it.
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

      // Center it first, clear of the promo banners that re-mount over the top of the page.
      await cta
        .evaluate((element) => element.scrollIntoView({ block: 'center' }))
        .catch(() => undefined);
      await this.settle(300);

      // No force, so a covered CTA fails here with a call log instead of a silent miss.
      const clicked = await cta
        .click({ timeout: 10_000 })
        .then(() => true)
        .catch((error: unknown) => {
          lastClickError = error;
          return false;
        });

      if (!clicked) {
        // Promo banners re-mount on a timer and may now cover the CTA; clear them before retrying.
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
    // The four extra dropdowns are required on Canada forms, optional elsewhere; fill when present.
    await fillExtraLeadFieldsIfPresent(form);
    await this.checkConsentIfPresent(form);
  }

  /** Checks the Get Information CTA opens a lead form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      // getAvailableGetInformationForm already finds and clicks the CTA; don't resolve it twice.
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
    leadData: Partial<LeadFieldData> = {},
  ): Promise<void> {
    const form = await this.getAvailableForm(resolveForm, formName);

    const valid = { ...getValidLeadData('community'), ...leadData };

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
  private async submitSuccessfulSideModalForm(
    formName: string,
    leadData: Partial<LeadFieldData> = {},
  ): Promise<void> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      return;
    }

    await fillValidSideModalForm(form, 'communityGetInfo', {}, leadData);

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

  // The community page renders no footer lead form, so the footer methods below
  // (and footerForm) are commented out alongside their tests in communityPage.spec.ts.

  // /** Opens the footer community form and checks it is usable. */
  // async viewFooterForm(): Promise<void> {
  //   await this.step('View footer community form', async () => {
  //     await this.viewNamedForm(() => this.footerForm(), 'Footer community form');
  //   });
  // }

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

  // /** Submits the footer form empty and checks the required-field errors appear. */
  // async validateFooterFormEmptyErrors(): Promise<void> {
  //   await this.step('Validate footer form empty errors', async () => {
  //     await this.validateEmptyFormErrorsFor(() => this.footerForm(), 'Footer community form');
  //   });
  // }

  /** Checks the side modal form shows its fields. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Verify Get Information sideModalForm fields', async () => {
      const form = await this.getAvailableGetInformationForm(
        'Get Information community sideModalForm',
      );

      if (!form) {
        return;
      }

      await expectSideModalFormFields(form, {
        formName: 'Get Information community sideModalForm',
        location: this.locationKey,
      });
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

  // /** Checks the footer form rejects an invalid email address. */
  // async validateFooterFormInvalidEmail(): Promise<void> {
  //   await this.step('Validate footer form invalid email', async () => {
  //     await this.validateInvalidEmailFor(() => this.footerForm(), 'Footer community form');
  //   });
  // }

  /** Checks the side modal form rejects an invalid email address. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate Get Information sideModalForm invalid email', async () => {
      await this.validateSideModalFormInvalidEmailByName('Get Information community sideModalForm');
    });
  }

  /** Fills the primary form with valid data and checks it submits. */
  async verifyPrimaryFormSuccessSubmission(leadData: Partial<LeadFieldData> = {}): Promise<void> {
    await this.step('Submit primary community form successfully', async () => {
      await this.submitSuccessfulFormFor(
        () => this.primaryForm(),
        'Primary community form',
        leadData,
      );
    });
  }

  // /** Fills the footer form with valid data and checks it submits. */
  // async verifyFooterFormSuccessSubmission(): Promise<void> {
  //   await this.step('Submit footer community form successfully', async () => {
  //     await this.submitSuccessfulFormFor(() => this.footerForm(), 'Footer community form');
  //   });
  // }

  /** Opens the Get Information side modal lead form and returns it, for evidence runs. */
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
  async verifySideModalFormSuccessSubmission(leadData: Partial<LeadFieldData> = {}): Promise<void> {
    await this.step('Submit Get Information community sideModalForm successfully', async () => {
      await this.submitSuccessfulSideModalForm('Get Information community sideModalForm', leadData);
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
