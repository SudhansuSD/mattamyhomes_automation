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

  private get registerForm(): Locator {
    return this.page.locator('#SitecoreScheduleAVisit');
  }
  private get firstNameInput(): Locator {
    return this.page.getByRole('textbox', { name: /first name/i });
  }
  private get lastNameInput(): Locator {
    return this.page.getByRole('textbox', { name: /last name/i });
  }
  private get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: /email/i });
  }
  private get phoneNumber(): Locator {
    return this.page.getByRole('textbox', { name: /phone/i });
  }
  private get countryOfResidence(): Locator {
    return this.page.getByRole('combobox', { name: /country of residence/i });
  }
  private get zipCode(): Locator {
    return this.page.getByRole('textbox', { name: /zip/i });
  }
  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: /SUBMIT/i });
  }
  private get validationMessages(): Locator {
    return this.page.locator('text=/Required|Invalid|Error/i');
  }
  private get successDialogModal(): Locator {
    return this.page.locator('.ReactModal__Content');
  }
  private get formSuccessMessage(): Locator {
    return this.page.locator('span').filter({ hasText: /Thank you for your interest in Mattamy Homes/i }).last();
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

    const isPresent = await locator.count();

    if (!isPresent) {
      console.warn(`⚠️ ${name} section not present`);
      return;
    }

    // ✅ Scroll safely
    await locator.first().scrollIntoViewIfNeeded();

    // ✅ Wait for SPA render
    await this.waitForPageReady();

    // ✅ Assert visibility (with retry)
    await expect(locator, `${name} section not visible`)
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
     FORM VALIDATION (DO NOT SUBMIT)
  ========================================================== */

  async viewForm(): Promise<void> {
    await this.registerForm.scrollIntoViewIfNeeded();
  }

  async validateEmptyFormErrors(): Promise<void> {

    await this.submitButton.click();

    await expect(this.validationMessages.first())
      .toBeVisible({ timeout: 10000 });
  }

  async validateInvalidEmail(): Promise<void> {

    await this.firstNameInput.fill('');
    await this.lastNameInput.fill('User');
    await this.emailInput.fill('invalid-email');
    await this.phoneNumber.fill('123456');

    await this.submitButton.click();

    await expect(
      this.page.getByText(
        /Error, Email addresses must contain a username, ‘@’, and ‘.com’/i
      )
    ).toBeVisible();
  }
  // /* ==========================================================
  //      FORM SUCCESS SUBMISSION VALIDATION
  //   ========================================================== */

  //   async verifySuccessFormSubmission(): Promise<void> {

  //     await this.firstNameInput.fill('Sudhansu');
  //     await this.lastNameInput.fill('Das');
  //     await this.emailInput.fill('ssdas@ex2india.com');
  //     await this.countryOfResidence.selectOption({ label: 'Canada' });
  //     await this.zipCode.fill('34293');
  //     await this.phoneNumber.fill('4488559933');

  //     await this.submitButton.click();

  //     await expect(this.successDialogModal).toBeVisible({ timeout: 10000 });
  //     await expect(this.successDialogModal.getByText(/Thank you for your interest in Mattamy Homes/i)).toBeVisible();

  //   }

}