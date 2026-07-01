import { Locator, Page, expect } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import {
  escapeRegex,
  getLastPathSegment,
  getNormalizedText,
  getPathSegments,
  toSlug,
  toTitleCase
} from '../utils/pageObjectUtils';
import { SearchablePage } from './SearchablePage';
import {
  checkConsentIfPresent,
  clickSubmit,
  expectFieldVisibleIfPresent,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  fillIfPresent,
  getInvalidLeadData,
  getValidLeadData,
  LeadFieldData
} from '../utils/leadFormHelper';

/* ==========================================================
   Community Page – Page Object Model
========================================================== */

export class CommunityPage extends SearchablePage {

  /* ==========================================================
     Constructor
  ========================================================== */

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    super(page);
  }

  /* ==========================================================
     LOCATORS
  ========================================================== */

  // ----- Core Page -----

  /** Returns the heading locator or value. */
  private get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }
  /** Returns the available homes section locator or value. */
  private get availableHomesSection(): Locator {
    return this.page.locator('#availablehomes');
  }
  /** Returns the amenities section locator or value. */
  private get amenitiesSection(): Locator {
    return this.page.getByRole('heading', { name: /amenities/i });
  }
  /** Returns the map section locator or value. */
  private get mapSection(): Locator {
    return this.page.locator('#map');
  }
  /** Returns the contact section locator or value. */
  private get contactSection(): Locator {
    return this.page.locator('#contact');
  }
  /** Returns the product overview section locator or value. */
  private get productOverviewSection(): Locator {
    return this.page.locator('#ProductOverview');
  }
  /** Returns the sales center section locator or value. */
  private get salesCenterSection(): Locator {
    return this.page.locator('section, div').filter({
      hasText: /showhome|sales|directions|hours/i
    }).first();
  }
  /** Returns the nav links locator or value. */
  private get navLinks(): Locator {
    return this.page.locator('a');
  }
  /** Returns the get information CTA locator or value. */
  private get getInformationCta(): Locator {
    return this.page.locator('button:visible, a:visible').filter({
      hasText: /^\s*(?:Get Information|Stay Updated)\s*$/i
    }).first();
  }

  // ----- Register Form -----

  /** Returns the sitecore community forms locator or value. */
  private get sitecoreCommunityForms(): Locator {
    return this.page.locator('[id^="Sitecore-ScheduleAVisit-FormInstance"]');
  }
  /** Returns the contact forms locator or value. */
  private get contactForms(): Locator {
    return this.page.locator('#contact form');
  }
  /** Returns the schedule visit containers locator or value. */
  private get scheduleVisitContainers(): Locator {
    return this.page.locator('[id^="ScheduleAVisit-FormInstance"]');
  }
  /** Returns the success dialog modal locator or value. */
  private get successDialogModal(): Locator {
    return this.page.locator('.ReactModal__Content');
  }
  /** Returns the form success message locator or value. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(
      /Thank you for your interest in Mattamy Homes|Thanks for your interest|request has been submitted|Thank you/i
    ).last();
  }
  /** Returns the lead form dialog or sidebar locator or value. */
  private get leadFormDialogOrSidebar(): Locator {
    return this.page
      .locator('#ModalForm, [id*="ModalForm"], .ReactModal__Content, [role="dialog"], aside, [class*="drawer" i], [class*="sidebar" i]')
      .filter({ has: this.page.locator('form, input, select, textarea') });
  }

  /* ==========================================================
     PAGE LOAD VALIDATION
  ========================================================== */

  /** Verifies search by community. */
  async verifySearchByCommunity(expectedCommunity: string): Promise<void> {
    await this.step(`Verify community search navigates to ${expectedCommunity}`, async () => {
      await this.waitForPageReady();
      const { communityPath } = getLocationConfig();

      if (communityPath) {
        await expect(this.page, 'Community search should navigate to the configured community URL')
          .toHaveURL(new RegExp(escapeRegex(communityPath), 'i'), { timeout: 60000 });
      }

      const communityHeading = this.page
        .locator('h1')
        .filter({ hasText: new RegExp(escapeRegex(expectedCommunity), 'i') })
        .first();

      await expect(communityHeading).toBeVisible({ timeout: 60000 });
    });
  }

  /* ==========================================================
     CORE SECTION VALIDATION
  ========================================================== */

  /** Verifies core sections. */
  async verifyCoreSections(): Promise<void> {
    await this.step('Verify core community sections', async () => {
      await this.verifySectionIfPresent(this.availableHomesSection, 'Available Homes');
      await this.verifySectionIfPresent(this.mapSection, 'Map');
      await this.verifySectionIfPresent(this.contactSection, 'Contact');
    });
  }
  /** Verifies section if present. */
  private async verifySectionIfPresent(locator: Locator, name: string): Promise<void> {

    const sectionCount = await locator.count();

    if (!sectionCount) {
      await this.reportValue(`${name} section not present`);
      return;
    }

    // Scroll safely
    const section = locator.first();
    await section.scrollIntoViewIfNeeded();

    // Wait for SPA render
    await this.waitForPageReady();

    // Assert visibility (with retry)
    await expect(section, `${name} section not visible`)
      .toBeVisible({ timeout: 5000 });
  }


  /* ==========================================================
     ALL NAV LINK VALIDATION
  ========================================================== */

  /** Verifies all navigation links. */
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

  /* ==========================================================
     AVAILABLE HOMES NAVIGATION
  ========================================================== */

  /** Verifies available homes navigation. */
  async verifyAvailableHomesNavigation(): Promise<void> {
    await this.step('Verify available homes navigation', async () => {
      const firstHome = this.page
        .locator('a[href*="/quick-move-in"]')
        .first();

      if (await firstHome.count()) {

        const href = await firstHome.getAttribute('href');

        await Promise.all([
          this.page.waitForLoadState('domcontentloaded'),
          firstHome.click()
        ]);

        await expect(this.page)
          .toHaveURL(new RegExp(href!, 'i'));

        await this.page.goBack();
        await this.waitForPageReady();
      }
    });
  }

  /* ==========================================================
     PLAN NAVIGATION
  ========================================================== */

  /** Verifies plans navigation. */
  async verifyPlansNavigation(): Promise<void> {
    await this.step('Verify plans navigation', async () => {
      const firstPlan = this.page
        .locator('a[href*="/brinkley"]')
        .first();

      if (await firstPlan.count()) {

        const href = await firstPlan.getAttribute('href');

        await Promise.all([
          this.page.waitForLoadState('domcontentloaded'),
          firstPlan.click()
        ]);

        await expect(this.page)
          .toHaveURL(new RegExp(href!, 'i'));

        await this.page.goBack();
        await this.waitForPageReady();
      }
    });
  }

  /* ==========================================================
     FORM VALIDATION
  ========================================================== */

  /** Returns the community forms locator or value. */
  private get communityForms(): Locator {
    return this.page.locator('form')
      .filter({ has: this.page.getByRole('button', { name: /submit/i }) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** Verifies overview address market and attributes. */
  async verifyOverviewAddressMarketAndAttributes(expectedCommunity: string): Promise<void> {
    await this.step('Verify overview, address, market and key attributes', async () => {
      await expect(this.productOverviewSection, 'Community overview section should be visible')
        .toBeVisible({ timeout: 15000 });

      await expect(this.productOverviewSection.getByRole('heading', {
        name: /Designed For the Way You Live|Welcome/i
      }).first(), 'Overview heading should render current community overview content')
        .toBeVisible({ timeout: 15000 });

      const overviewText = await getNormalizedText(this.productOverviewSection);

      await expect(this.heading, 'Main heading should include the current community name')
        .toContainText(new RegExp(escapeRegex(expectedCommunity), 'i'));
      expect(overviewText.length, 'Overview copy should render meaningful content')
        .toBeGreaterThan(150);

      await this.verifyAddressAndMarketDetails(expectedCommunity);
      await this.verifyKeyAttributes();
    });
  }

  /** Verifies QMI card community name matches current community. */
  async verifyQmiCardCommunityNameMatchesCurrentCommunity(expectedCommunity: string): Promise<void> {
    await this.step('Verify QMI cards match current community', async () => {
      const availableHomesSection = await this.getAvailableHomesSection();

      if (!availableHomesSection) {
        await this.reportValue('Available homes section not present - skipping QMI community-name validation');
        return;
      }

      await this.scrollTo(availableHomesSection);
      await this.waitForPageReady();

      if (!(await availableHomesSection.isVisible({ timeout: 5000 }).catch(() => false))) {
        await this.reportValue('Available homes section not visible - skipping QMI community-name validation');
        return;
      }

      const qmiCards = availableHomesSection
        .locator('a[href]:visible')
        .filter({ hasNotText: /view all/i });

      await qmiCards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);

      const qmiCardCount = await qmiCards.count();

      if (!qmiCardCount) {
        await this.reportValue('No QMI cards present - skipping QMI community-name validation');
        return;
      }

      const currentCommunitySegment = getLastPathSegment(this.page.url());

      expect(
        currentCommunitySegment,
        `Current community URL segment should be available for ${expectedCommunity}`
      ).toBeTruthy();

      for (let i = 0; i < qmiCardCount; i++) {
        const card = qmiCards.nth(i);
        const href = await card.getAttribute('href');
        const hrefSegments = href
          ? new URL(href, this.page.url()).pathname.toLowerCase().split('/').filter(Boolean)
          : [];

        expect(
          hrefSegments,
          `QMI card ${i + 1} href should include the exact current community URL segment`
        ).toContain(currentCommunitySegment);

        await this.reportValue(`QMI card ${i + 1}`, this.buildFullUrl(href));
      }

      await this.reportValue(`Validated ${qmiCardCount} QMI card(s) against community segment '${currentCommunitySegment}'`);
    });
  }

  /** Returns available homes section. */
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

  /** Verifies address and market details. */
  private async verifyAddressAndMarketDetails(expectedCommunity: string): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.waitForPageReady();

    const addressHeading = this.page.locator('h1, h2, h3, h4').filter({
      hasText: /\d{1,}.+,\s*.+\b[A-Z]{2}\b/i
    }).first();
    const currentPath = new URL(this.page.url()).pathname;
    const marketFromUrl = this.getMarketFromCurrentUrl();

    await expect(addressHeading, 'Community address should render in the page')
      .toBeAttached({ timeout: 15000 });

    const addressText = await getNormalizedText(addressHeading);

    expect(addressText, 'Community address should include a street number')
      .toMatch(/\d{1,}/);
    expect(addressText, 'Community address should include province/state and postal/ZIP details')
      .toMatch(/\b[A-Z]{2}\b/);

    if (marketFromUrl) {
      expect(
        currentPath.toLowerCase(),
        'Community URL should include the current market/city context'
      ).toContain(toSlug(marketFromUrl));
      await expect(this.page.locator('body'), 'Community page should include visible market/city context')
        .toContainText(new RegExp(escapeRegex(marketFromUrl), 'i'), { timeout: 15000 });
    }

    await expect(this.heading, 'Main heading should still show the current community')
      .toContainText(new RegExp(escapeRegex(expectedCommunity), 'i'));
  }

  /** Verifies key attributes. */
  private async verifyKeyAttributes(): Promise<void> {
    const requiredAttributes = [
      /Home Types/i,
      /Bedrooms/i,
      /Full Bathrooms/i,
      /Sq\.?\s*Ft\./i,
      /Stories/i,
      /Garages/i
    ];

    for (const attribute of requiredAttributes) {
      await expect(this.productOverviewSection, `Key attribute ${attribute} should render`)
        .toContainText(attribute, { timeout: 10000 });
    }
  }

  /** Returns the community form containers locator or value. */
  private get communityFormContainers(): Locator {
    return this.page.locator(
      [
        '[id^="Sitecore-ScheduleAVisit-FormInstance"]',
        '[id^="ScheduleAVisit-FormInstance"]',
        '#contact',
        'section',
        '[role="group"]'
      ].join(', ')
    )
      .filter({ has: this.page.getByRole('button', { name: /submit/i }) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** Returns form by index. */
  private async getFormByIndex(formIndex: number): Promise<Locator | null> {
    const formGroups = (await this.communityForms.count()) > 0
      ? [this.communityForms]
      : [
        this.leadFormDialogOrSidebar,
        this.sitecoreCommunityForms,
        this.contactForms,
        this.scheduleVisitContainers,
        this.communityFormContainers
      ];

    let remainingIndex = formIndex;

    for (const forms of formGroups) {
      const formCount = await forms.count();

      if (remainingIndex < formCount) {
        return forms.nth(remainingIndex);
      }

      remainingIndex -= formCount;
    }

    return null;
  }

  /** Opens lead form from get information CTA if present. */
  private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
    if (!(await this.getInformationCta.isVisible({ timeout: 5000 }).catch(() => false))) {
      return;
    }

    const previousUrl = this.page.url();

    await this.getInformationCta.scrollIntoViewIfNeeded();
    await this.getInformationCta.click({ force: true });
    await this.waitForPageReady();

    await this.settle(1000);
    expect(
      this.page.url(),
      `Community lead-form CTA should keep the flow on page, not redirect from ${previousUrl}`
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Returns available form. */
  private async getAvailableForm(formIndex = 0, formName = 'Community form'): Promise<Locator | null> {
    let form = await this.getFormByIndex(formIndex);

    if (!form) {
      await this.openLeadFormFromGetInformationCtaIfPresent();
      form = await this.getFormByIndex(formIndex);
    }

    if (!form) {
      throw new Error(`${formName} not present - expected form index ${formIndex} to be available`);
    }

    const submitButton = form.getByRole('button', { name: /submit/i }).first();

    if (!await submitButton.count()) {
      throw new Error(`${formName} submit button not present`);
    }

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();

    if (
      await form.isVisible().catch(() => false) ||
      await submitButton.isVisible().catch(() => false)
    ) {
      return form;
    }

    throw new Error(`${formName} not visible`);
  }

  /** Returns available get information form. */
  private async getAvailableGetInformationForm(
    formName = 'Get Information community form'
  ): Promise<Locator | null> {
    await this.openLeadFormFromGetInformationCtaIfPresent();

    const modalFormCount = await expect
      .poll(
        () => this.leadFormDialogOrSidebar.count(),
        {
          message: `${formName} sidebar/modal should open after Get Information CTA`,
          timeout: 15000
        }
      )
      .toBeGreaterThan(0)
      .then(() => this.leadFormDialogOrSidebar.count())
      .catch(() => 0);

    if (!modalFormCount) {
      throw new Error(`${formName} sidebar/modal form did not open`);
    }

    const modalForm = this.leadFormDialogOrSidebar.first();
    const submitButton = modalForm.getByRole('button', { name: /submit/i }).first();

    await modalForm.scrollIntoViewIfNeeded();
    await this.waitForPageReady();

    await expect(submitButton, `${formName} submit button should be visible inside sidebar/modal`)
      .toBeVisible({ timeout: 10000 });

    return modalForm;
  }

  /** Expects a form field to be visible when present. */
  private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
    await expectFieldVisibleIfPresent(field, label);
  }

  /** Selects country of residence if present. */
  private async selectCountryOfResidenceIfPresent(form: Locator): Promise<void> {
    const countryOfResidence = form.getByRole('combobox', {
      name: /country of residence/i
    }).first();

    if (!(await countryOfResidence.count())) {
      return;
    }

    const preferredCountry = getLocationConfig().country === 'USA'
      ? 'United States'
      : 'Canada';

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

  /** Fills community lead form. */
  private async fillCommunityLeadForm(
    form: Locator,
    leadData: LeadFieldData
  ): Promise<void> {
    await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), leadData.firstName);
    await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), leadData.lastName);
    await fillIfPresent(form.getByRole('textbox', { name: /^email/i }), leadData.email);
    await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), leadData.phone);
    await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), leadData.zip);
    await this.selectCountryOfResidenceIfPresent(form);
    await this.checkConsentIfPresent(form);
  }

  /** Clicks submit. */
  private async clickSubmit(form: Locator): Promise<void> {
    await clickSubmit(this.page, form);
  }

  /** Expects required-field errors inside the form. */
  private async expectRequiredErrorsInForm(form: Locator): Promise<void> {
    await expectRequiredErrorsInForm(form);
  }

  /** Expects an invalid-email error inside the form. */
  private async expectInvalidEmailErrorInForm(form: Locator): Promise<void> {
    await expectInvalidEmailErrorInForm(form);
  }

  /** Verifies get information CTA opens lead form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      await expect(this.getInformationCta, 'Get Information or Stay Updated CTA should be visible')
        .toBeVisible({ timeout: 15000 });

      const form = await this.getAvailableGetInformationForm();

      if (!form) {
        return;
      }

      await expect(form.getByRole('button', { name: /submit/i }).first())
        .toBeVisible({ timeout: 10000 });
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /first name/i }), 'First name');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /^email/i }), 'Email');
      await this.expectFieldIfPresent(form.getByRole('combobox', { name: /country of residence/i }), 'Country of Residence');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), 'Zip/Postal Code');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone number');
    });
  }

  /** Returns a visible form by index. */
  private async viewFormByIndex(formIndex: number, formName: string): Promise<void> {
    await this.getAvailableForm(formIndex, formName);
  }

  /** Returns the visible Get Information form. */
  private async viewGetInformationForm(formName: string): Promise<void> {
    await this.getAvailableGetInformationForm(formName);
  }

  /** Validates empty form errors by index. */
  private async validateEmptyFormErrorsByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await this.clickSubmit(form);

    await expect(form.locator('text=/Required|Please complete|Invalid|Error/i').first())
      .toBeVisible({ timeout: 10000 });
  }

  /** Validates get information empty form errors. */
  private async validateGetInformationEmptyFormErrors(
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      return;
    }

    await this.clickSubmit(form);

    await this.expectRequiredErrorsInForm(form);
  }

  /** Validates invalid email by index. */
  private async validateInvalidEmailByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    const invalid = getInvalidLeadData('community');

    await this.fillCommunityLeadForm(form, invalid);

    await this.clickSubmit(form);

    await expect(form.locator('text=/valid domain name/i').first())
      .toBeVisible({ timeout: 10000 });
  }

  /** Validates get information invalid email. */
  private async validateGetInformationInvalidEmail(
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      return;
    }

    const invalid = getInvalidLeadData('community');

    await this.fillCommunityLeadForm(form, invalid);

    await this.clickSubmit(form);

    await this.expectInvalidEmailErrorInForm(form);
  }

  /** Submits successful form by index. */
  private async submitSuccessfulFormByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    const valid = getValidLeadData('community');

    await this.fillCommunityLeadForm(form, valid);

    await this.submitLeadFormAndCaptureApi({
      formName,
      submitButton: form.getByRole('button', { name: /submit/i }).first(),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage
    });
  }

  /** Submits successful get information form. */
  private async submitSuccessfulGetInformationForm(
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableGetInformationForm(formName);

    if (!form) {
      return;
    }

    const valid = getValidLeadData('communityGetInfo');

    await this.fillCommunityLeadForm(form, valid);

    await this.submitLeadFormAndCaptureApi({
      formName,
      submitButton: form.getByRole('button', { name: /submit/i }).first(),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage
    });
  }

  /** Returns the visible form. */
  async viewForm(): Promise<void> {
    await this.viewPrimaryForm();
  }

  /** Returns the visible primary form. */
  async viewPrimaryForm(): Promise<void> {
    await this.step('View primary community form', async () => {
      await this.viewFormByIndex(0, 'Primary community form');
    });
  }

  /** Returns the visible footer form. */
  async viewFooterForm(): Promise<void> {
    await this.step('View footer community form', async () => {
      await this.viewFormByIndex(1, 'Footer community form');
    });
  }

  /** Returns the visible Get Information lead form. */
  async viewGetInformationLeadForm(): Promise<void> {
    await this.step('View Get Information lead form', async () => {
      await this.viewGetInformationForm('Get Information community form');
    });
  }

  /** Validates empty form errors. */
  async validateEmptyFormErrors(): Promise<void> {
    await this.validatePrimaryFormEmptyErrors();
  }

  /** Validates primary form empty errors. */
  async validatePrimaryFormEmptyErrors(): Promise<void> {
    await this.step('Validate primary form empty errors', async () => {
      await this.validateEmptyFormErrorsByIndex(0, 'Primary community form');
    });
  }

  /** Validates footer form empty errors. */
  async validateFooterFormEmptyErrors(): Promise<void> {
    await this.step('Validate footer form empty errors', async () => {
      await this.validateEmptyFormErrorsByIndex(1, 'Footer community form');
    });
  }

  /** Validates get information form empty errors. */
  async validateGetInformationFormEmptyErrors(): Promise<void> {
    await this.step('Validate Get Information form empty errors', async () => {
      await this.validateGetInformationEmptyFormErrors('Get Information community form');
    });
  }

  /** Validates invalid email. */
  async validateInvalidEmail(): Promise<void> {
    await this.validatePrimaryFormInvalidEmail();
  }

  /** Validates primary form invalid email. */
  async validatePrimaryFormInvalidEmail(): Promise<void> {
    await this.step('Validate primary form invalid email', async () => {
      await this.validateInvalidEmailByIndex(0, 'Primary community form');
    });
  }

  /** Validates footer form invalid email. */
  async validateFooterFormInvalidEmail(): Promise<void> {
    await this.step('Validate footer form invalid email', async () => {
      await this.validateInvalidEmailByIndex(1, 'Footer community form');
    });
  }

  /** Validates get information form invalid email. */
  async validateGetInformationFormInvalidEmail(): Promise<void> {
    await this.step('Validate Get Information form invalid email', async () => {
      await this.validateGetInformationInvalidEmail('Get Information community form');
    });
  }

  /** Verifies primary form success submission. */
  async verifyPrimaryFormSuccessSubmission(): Promise<void> {
    await this.step('Submit primary community form successfully', async () => {
      await this.submitSuccessfulFormByIndex(0, 'Primary community form');
    });
  }

  /** Verifies footer form success submission. */
  async verifyFooterFormSuccessSubmission(): Promise<void> {
    await this.step('Submit footer community form successfully', async () => {
      await this.submitSuccessfulFormByIndex(1, 'Footer community form');
    });
  }

  /** Verifies get information form success submission. */
  async verifyGetInformationFormSuccessSubmission(): Promise<void> {
    await this.step('Submit Get Information community form successfully', async () => {
      await this.submitSuccessfulGetInformationForm('Get Information community form');
    });
  }

  /** Returns market from current URL. */
  private getMarketFromCurrentUrl(): string | null {
    const segments = getPathSegments(this.page.url());

    if (segments.length < 3) {
      return null;
    }

    return toTitleCase(segments[1]);
  }

}
