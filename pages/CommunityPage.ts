import { Page, Locator, expect } from '@playwright/test';
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

}
