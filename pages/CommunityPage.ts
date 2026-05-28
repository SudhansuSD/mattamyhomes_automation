import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import {
  escapeRegex,
  getLastPathSegment,
  getNormalizedText,
  getPathSegments,
  toSlug,
  toTitleCase
} from '../utils/pageObjectUtils';
import { HomePage } from './HomePage';

/* ==========================================================
   Community Page – Page Object Model
========================================================== */

export class CommunityPage extends HomePage {

  /* ==========================================================
     Constructor
  ========================================================== */

  constructor(page: Page) {
    super(page);
  }

  /* ==========================================================
     LOCATORS
  ========================================================== */

  // ----- Core Page -----

  private get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }
  private get availableHomesSection(): Locator {
    return this.page.locator('#availablehomes');
  }
  private get amenitiesSection(): Locator {
    return this.page.getByRole('heading', { name: /amenities/i });
  }
  private get mapSection(): Locator {
    return this.page.locator('#map');
  }
  private get contactSection(): Locator {
    return this.page.locator('#contact');
  }
  private get productOverviewSection(): Locator {
    return this.page.locator('#ProductOverview');
  }
  private get salesCenterSection(): Locator {
    return this.page.locator('section, div').filter({
      hasText: /showhome|sales|directions|hours/i
    }).first();
  }
  private get navLinks(): Locator {
    return this.page.locator('a');
  }

  // ----- Register Form -----

  private get sitecoreCommunityForms(): Locator {
    return this.page.locator('[id^="Sitecore-ScheduleAVisit-FormInstance"]');
  }
  private get contactForms(): Locator {
    return this.page.locator('#contact form');
  }
  private get scheduleVisitContainers(): Locator {
    return this.page.locator('[id^="ScheduleAVisit-FormInstance"]');
  }
  private get successDialogModal(): Locator {
    return this.page.locator('.ReactModal__Content');
  }
  private get formSuccessMessage(): Locator {
    return this.page.getByText(
      /Thank you for your interest in Mattamy Homes/i
    ).last();
  }

  /* ==========================================================
     PAGE LOAD VALIDATION
  ========================================================== */

  async verifySearchByCommunity(expectedCommunity: string): Promise<void> {

    await this.waitForPageReady();

    await expect(this.heading).toBeVisible({ timeout: 20000 });
    await expect(this.heading)
      .toContainText(new RegExp(expectedCommunity, 'i'));

  }

  /* ==========================================================
     CORE SECTION VALIDATION
  ========================================================== */

  async verifyCoreSections(): Promise<void> {

    await this.verifySectionIfPresent(this.availableHomesSection, 'Available Homes');
    await this.verifySectionIfPresent(this.mapSection, 'Map');
    await this.verifySectionIfPresent(this.contactSection, 'Contact');

  }
  private async verifySectionIfPresent(locator: Locator, name: string): Promise<void> {

    const sectionCount = await locator.count();

    if (!sectionCount) {
      console.warn(`⚠️ ${name} section not present`);
      return;
    }

    // ✅ Scroll safely
    const section = locator.first();
    await section.scrollIntoViewIfNeeded();

    // ✅ Wait for SPA render
    await this.waitForPageReady();

    // ✅ Assert visibility (with retry)
    await expect(section, `${name} section not visible`)
      .toBeVisible({ timeout: 5000 });

    console.log(`✅ ${name} section visible`);
  }


  /* ==========================================================
     ALL NAV LINK VALIDATION
  ========================================================== */

  async verifyAllNavigationLinks(): Promise<void> {

    const linkCount = await this.navLinks.count();

    console.log("Navigation links found:\n");
    for (let i = 0; i < linkCount; i++) {

      const link = this.navLinks.nth(i);
      const href = await link.getAttribute('href');

      if (!href || href.startsWith('#') || href.includes('mailto')) {
        continue;
      }

      expect(href).toBeTruthy();
      console.log(`${href}`);
    }
  }

  /* ==========================================================
     AVAILABLE HOMES NAVIGATION
  ========================================================== */

  async verifyAvailableHomesNavigation(): Promise<void> {

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
  }

  /* ==========================================================
     PLAN NAVIGATION
  ========================================================== */

  async verifyPlansNavigation(): Promise<void> {

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
  }

  /* ==========================================================
     FORM VALIDATION
  ========================================================== */

  private get communityForms(): Locator {
    return this.page.locator('form')
      .filter({ has: this.page.getByRole('button', { name: /submit/i }) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  async verifyOverviewAddressMarketAndAttributes(expectedCommunity: string): Promise<void> {
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
  }

  async verifyQmiCardCommunityNameMatchesCurrentCommunity(expectedCommunity: string): Promise<void> {
    const availableHomesSection = await this.getAvailableHomesSection();

    if (!availableHomesSection) {
      console.log('Available homes section not present - skipping QMI community-name validation');
      return;
    }

    await this.scrollTo(availableHomesSection);
    await this.waitForPageReady();

    if (!(await availableHomesSection.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('Available homes section not visible - skipping QMI community-name validation');
      return;
    }

    const qmiCards = availableHomesSection
      .locator('a[href]:visible')
      .filter({ hasNotText: /view all/i });

    await qmiCards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);

    const qmiCardCount = await qmiCards.count();

    if (!qmiCardCount) {
      console.log('No QMI cards present - skipping QMI community-name validation');
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

      console.log(`QMI card ${i + 1}: href='${href}' | current community segment='${currentCommunitySegment}'`);

      expect(
        hrefSegments,
        `QMI card ${i + 1} href should include the exact current community URL segment`
      ).toContain(currentCommunitySegment);
    }
  }

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

  private get communityFormContainers(): Locator {
    return this.page.locator(
      '[id^="Sitecore-ScheduleAVisit-FormInstance"], [id^="ScheduleAVisit-FormInstance"], #contact'
    )
      .filter({ has: this.page.getByRole('button', { name: /submit/i }) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  private async getFormByIndex(formIndex: number): Promise<Locator | null> {
    const formGroups = (await this.communityForms.count()) > 0
      ? [this.communityForms]
      : [this.sitecoreCommunityForms, this.contactForms, this.scheduleVisitContainers, this.communityFormContainers];

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

  private async getAvailableForm(formIndex = 0, formName = 'Community form'): Promise<Locator | null> {
    const form = await this.getFormByIndex(formIndex);

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

  private async viewFormByIndex(formIndex: number, formName: string): Promise<void> {
    await this.getAvailableForm(formIndex, formName);
  }

  private async validateEmptyFormErrorsByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await form.getByRole('button', { name: /submit/i }).first().click();

    await expect(form.locator('text=/Required|Invalid|Error/i').first())
      .toBeVisible({ timeout: 10000 });
  }

  private async validateInvalidEmailByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await form.getByRole('textbox', { name: /first name/i }).first().fill('Test');
    await form.getByRole('textbox', { name: /last name/i }).first().fill('User');
    await form.getByRole('textbox', { name: /email/i }).first().fill('user@domain.c');
    await form.getByRole('textbox', { name: /phone/i }).first().fill('123456');

    await form.getByRole('button', { name: /submit/i }).first().click();

    await expect(form.locator('text=/valid domain name/i').first())
      .toBeVisible({ timeout: 10000 });
  }

  private async submitSuccessfulFormByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const { envName } = getEnvConfig();

    if (envName === 'PROD') {
      console.log(`${formName} successful submission skipped in PROD`);
      return;
    }

    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await form.getByRole('textbox', { name: /first name/i }).first().fill('Sudhansu');
    await form.getByRole('textbox', { name: /last name/i }).first().fill('Das');
    await form.getByRole('textbox', { name: /email/i }).first().fill(
      `ssdas_${Date.now()}@ex2india.com`
    );
    await form.getByRole('textbox', { name: /phone/i }).first().fill('4488559933');

    const countryOfResidence = form.getByRole('combobox', {
      name: /country of residence/i
    }).first();

    if (await countryOfResidence.count()) {
      await countryOfResidence.selectOption({ label: 'Canada' });
    }

    const zipCode = form.getByRole('textbox', { name: /zip/i }).first();

    if (await zipCode.count()) {
      await zipCode.fill('34293');
    }

    await form.getByRole('button', { name: /submit/i }).first().click();

    if (await this.successDialogModal.count()) {
      await expect(this.successDialogModal.last()).toBeVisible({
        timeout: 10000
      });
    }

    await expect(this.formSuccessMessage).toBeVisible({ timeout: 10000 });
  }

  async viewForm(): Promise<void> {
    await this.viewPrimaryForm();
  }

  async viewPrimaryForm(): Promise<void> {
    await this.viewFormByIndex(0, 'Primary community form');
  }

  async viewFooterForm(): Promise<void> {
    await this.viewFormByIndex(1, 'Footer community form');
  }

  async validateEmptyFormErrors(): Promise<void> {
    await this.validatePrimaryFormEmptyErrors();
  }

  async validatePrimaryFormEmptyErrors(): Promise<void> {
    await this.validateEmptyFormErrorsByIndex(0, 'Primary community form');
  }

  async validateFooterFormEmptyErrors(): Promise<void> {
    await this.validateEmptyFormErrorsByIndex(1, 'Footer community form');
  }

  async validateInvalidEmail(): Promise<void> {
    await this.validatePrimaryFormInvalidEmail();
  }

  async validatePrimaryFormInvalidEmail(): Promise<void> {
    await this.validateInvalidEmailByIndex(0, 'Primary community form');
  }

  async validateFooterFormInvalidEmail(): Promise<void> {
    await this.validateInvalidEmailByIndex(1, 'Footer community form');
  }

  async verifyPrimaryFormSuccessSubmission(): Promise<void> {
    await this.submitSuccessfulFormByIndex(0, 'Primary community form');
  }

  async verifyFooterFormSuccessSubmission(): Promise<void> {
    await this.submitSuccessfulFormByIndex(1, 'Footer community form');
  }

  private getMarketFromCurrentUrl(): string | null {
    const segments = getPathSegments(this.page.url());

    if (segments.length < 3) {
      return null;
    }

    return toTitleCase(segments[1]);
  }

}
