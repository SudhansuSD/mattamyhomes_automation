import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { BasePage } from './BasePage';

type PromoLeadData = {
  community: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  zipPostal: string;
  phone: string;
  questions: string;
};

export class PromoPage extends BasePage {
  private static readonly PAGE_LOAD_TIMEOUT = 30000;
  private static readonly PROMO_PATH = '/florida/orlando/promos/hometown-heroes';

  readonly heroImage: Locator;
  readonly promoHeading: Locator;
  readonly offerHeading: Locator;
  readonly discoverOrlandoSection: Locator;
  readonly formTitle: Locator;
  readonly promoForm: Locator;
  readonly submitButton: Locator;
  readonly successDialogModal: Locator;

  constructor(page: Page) {
    super(page);

    this.heroImage = page.locator('img[alt="Lifestyle"]').first();
    this.promoHeading = page.getByRole('heading', {
      name: /A Special Thank You to Our Hometown Heroes/i
    });
    this.offerHeading = page.getByRole('heading', {
      name: /We are honored to offer you a/i
    });
    this.discoverOrlandoSection = page.getByRole('heading', {
      name: /Discover Mattamy Orlando/i
    });
    this.formTitle = page.getByRole('heading', {
      name: /Request more information/i
    });
    this.promoForm = page.locator('form#Sitecore-ScheduleAVisitPromo-FormInstance0').first();
    this.submitButton = this.promoForm.getByRole('button', { name: /submit/i }).first();
    this.successDialogModal = page.locator('.ReactModal__Content').last();
  }

  async navigateToHometownHeroesPromo(): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const targetUrl = `${baseURL}${PromoPage.PROMO_PATH}?country=USA`;

    console.log(`[NAVIGATE PROMO] ENV=${envName} | COUNTRY=USA | URL=${targetUrl}`);

    await this.page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.dismissBlockingOverlays();
    await this.waitForPageReady();
  }

  async verifyPageLoaded(): Promise<void> {
    await this.assertPageUrl(
      /\/florida\/orlando\/promos\/hometown-heroes/i,
      'Hometown Heroes promo URL should match expected route',
      PromoPage.PAGE_LOAD_TIMEOUT
    );
    await this.assertPageTitle(
      /Hometown Heroes.*Orlando/i,
      'Hometown Heroes promo page title should match'
    );
    await this.assertVisible(this.heroImage, 'Hometown Heroes promo hero image should be visible', PromoPage.PAGE_LOAD_TIMEOUT);
    await this.assertVisible(this.promoHeading, 'Hometown Heroes promo heading should be visible', PromoPage.PAGE_LOAD_TIMEOUT);
    await this.assertVisible(this.offerHeading, 'Hometown Heroes offer heading should be visible');
    await this.assertVisible(this.discoverOrlandoSection, 'Discover Orlando section should be visible');
  }

  async verifyPromoFormFields(): Promise<void> {
    await this.scrollToForm();

    await this.assertVisible(this.formTitle, 'Promo form title should be visible', PromoPage.PAGE_LOAD_TIMEOUT);
    await this.assertVisible(this.promoForm, 'Promo lead form should be visible', PromoPage.PAGE_LOAD_TIMEOUT);
    await this.assertVisible(this.communityField, 'Community of Interest field should be visible');
    await this.assertVisible(this.firstNameField, 'First name field should be visible');
    await this.assertVisible(this.lastNameField, 'Last name field should be visible');
    await this.assertVisible(this.emailField, 'Email field should be visible');
    await this.assertVisible(this.countryField, 'Country field should be visible');
    await this.assertVisible(this.zipPostalField, 'Zip/Postal Code field should be visible');
    await this.assertVisible(this.phoneField, 'Phone number field should be visible');
    await this.expectFieldIfPresent(this.questionsField);
    await this.assertVisible(this.termsCheckbox, 'Terms checkbox should be visible');
    await this.assertVisible(this.submitButton, 'Promo form submit button should be visible');
  }

  async validateRequiredFieldErrors(): Promise<void> {
    await this.scrollToForm();
    await this.submitButton.click();

    await expect(this.requiredError(/Community of Interest/i)).toBeVisible({
      timeout: PromoPage.PAGE_LOAD_TIMEOUT
    });
    await expect(this.requiredError(/First name/i)).toBeVisible();
    await expect(this.requiredError(/Last name/i)).toBeVisible();
    await expect(this.requiredError(/Email/i)).toBeVisible();
    await expect(this.requiredError(/Country of Residence/i)).toBeVisible();
    await expect(this.requiredError(/Zip\/Postal Code/i)).toBeVisible();
  }

  async validateInvalidEmailError(): Promise<void> {
    await this.scrollToForm();
    await this.fillPromoForm({
      ...this.buildValidLeadData(),
      email: 'not-an-email'
    });

    await this.submitButton.click();

    const emailError = this.promoForm
      .locator('div:visible, span:visible, p:visible, label:visible')
      .filter({
        hasText: /Email addresses must contain|valid domain name|valid email|invalid email/i
      })
      .first();

    if (await emailError.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.assertVisible(emailError, 'Invalid email error should be visible');
      return;
    }

    const nativeValidationMessage = await this.emailField.evaluate((element) => {
      const input = element as HTMLInputElement;
      return input.validationMessage;
    });

    this.assertTruthy(
      nativeValidationMessage,
      'Promo email field should reject invalid email format'
    );
  }

  async verifySuccessfulSubmission(): Promise<void> {
    await this.scrollToForm();
    await this.fillPromoForm(this.buildValidLeadData());
    await this.submitButton.click();

    if (await this.successDialogModal.isVisible({ timeout: 10000 }).catch(() => false)) {
      await this.assertVisible(this.successDialogModal, 'Promo success dialog should be visible');
    }

    await this.assertVisible(
      this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last(),
      'Promo success thank-you message should be visible',
      PromoPage.PAGE_LOAD_TIMEOUT
    );
  }

  private get communityField(): Locator {
    return this.promoForm.getByRole('combobox', { name: /Community of Interest/i }).first();
  }

  private get firstNameField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /First name/i }).first();
  }

  private get lastNameField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Last name/i }).first();
  }

  private get emailField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Email/i }).first();
  }

  private get countryField(): Locator {
    return this.promoForm.getByRole('combobox', { name: /Country of Residence/i }).first();
  }

  private get zipPostalField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Zip\/Postal Code/i }).first();
  }

  private get phoneField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Phone number/i }).first();
  }

  private get questionsField(): Locator {
    return this.promoForm.getByRole('textbox', {
      name: /Additional questions or special requirements/i
    }).first();
  }

  private get termsCheckbox(): Locator {
    return this.promoForm.getByRole('checkbox', {
      name: /entering my contact information/i
    }).first();
  }

  private get smsCheckbox(): Locator {
    return this.promoForm.getByRole('checkbox', {
      name: /recurring, personalized text messages/i
    }).first();
  }

  private async scrollToForm(): Promise<void> {
    await this.promoForm.waitFor({
      state: 'attached',
      timeout: PromoPage.PAGE_LOAD_TIMEOUT
    });
    await this.promoForm.scrollIntoViewIfNeeded();
  }

  private async fillPromoForm(leadData: PromoLeadData): Promise<void> {
    await this.communityField.selectOption({ label: leadData.community });
    await this.firstNameField.fill(leadData.firstName);
    await this.lastNameField.fill(leadData.lastName);
    await this.emailField.fill(leadData.email);
    await this.countryField.selectOption({ label: leadData.country });
    await this.zipPostalField.fill(leadData.zipPostal);
    await this.phoneField.fill(leadData.phone);
    await this.fillIfPresent(this.questionsField, leadData.questions);
    await this.termsCheckbox.check({ force: true });

    if (await this.smsCheckbox.count()) {
      await this.smsCheckbox.check({ force: true });
    }
  }

  private buildValidLeadData(): PromoLeadData {
    return {
      community: 'Celebration - Island Village',
      firstName: 'Sudhansu',
      lastName: 'Das',
      email: `ssdas_promo_${Date.now()}@ex2india.com`,
      country: 'United States',
      zipPostal: '32801',
      phone: '4075551212',
      questions: 'Automation validation for Hometown Heroes promo page.'
    };
  }

  private requiredError(fieldName: RegExp): Locator {
    return this.promoForm
      .locator('div:visible, span:visible, p:visible, label:visible')
      .filter({
        hasText: new RegExp(`Error:\\s*${fieldName.source} is Required`, 'i')
      })
      .first();
  }

  private async expectFieldIfPresent(field: Locator): Promise<void> {
    if (await field.count()) {
      await this.assertVisible(field, 'Optional promo form field should be visible when present');
    }
  }

  private async fillIfPresent(field: Locator, value: string): Promise<void> {
    if (await field.count()) {
      await field.fill(value);
    }
  }

  private async dismissBlockingOverlays(): Promise<void> {
    await this.acceptCookiesIfPresent();

    const usaCountryButton = this.page.getByRole('button', { name: /^USA$/i }).last();

    if (await usaCountryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await usaCountryButton.click();
      await this.page.waitForTimeout(1000);
    }

    const privacyCloseButton = this.page.locator('#close-pc-btn-handler');

    if (await privacyCloseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await privacyCloseButton.click();
    }
  }
}
