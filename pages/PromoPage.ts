import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';

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
    await expect(this.page).toHaveURL(/\/florida\/orlando\/promos\/hometown-heroes/i);
    await expect(this.page).toHaveTitle(/Hometown Heroes.*Orlando/i);
    await expect(this.heroImage).toBeVisible({ timeout: PromoPage.PAGE_LOAD_TIMEOUT });
    await expect(this.promoHeading).toBeVisible({ timeout: PromoPage.PAGE_LOAD_TIMEOUT });
    await expect(this.offerHeading).toBeVisible();
    await expect(this.discoverOrlandoSection).toBeVisible();
  }

  async verifyPromoFormFields(): Promise<void> {
    await this.scrollToForm();

    await expect(this.formTitle).toBeVisible({ timeout: PromoPage.PAGE_LOAD_TIMEOUT });
    await expect(this.promoForm).toBeVisible({ timeout: PromoPage.PAGE_LOAD_TIMEOUT });
    await expect(this.communityField).toBeVisible();
    await expect(this.firstNameField).toBeVisible();
    await expect(this.lastNameField).toBeVisible();
    await expect(this.emailField).toBeVisible();
    await expect(this.countryField).toBeVisible();
    await expect(this.zipPostalField).toBeVisible();
    await expect(this.phoneField).toBeVisible();
    await this.expectFieldIfPresent(this.questionsField);
    await expect(this.termsCheckbox).toBeVisible();
    await expect(this.submitButton).toBeVisible();
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
      await expect(emailError).toBeVisible();
      return;
    }

    const nativeValidationMessage = await this.emailField.evaluate((element) => {
      const input = element as HTMLInputElement;
      return input.validationMessage;
    });

    expect(
      nativeValidationMessage,
      'Promo email field should reject invalid email format'
    ).toBeTruthy();
  }

  async verifySuccessfulSubmission(): Promise<void> {
    await this.scrollToForm();
    await this.fillPromoForm(this.buildValidLeadData());
    await this.submitButton.click();

    if (await this.successDialogModal.isVisible({ timeout: 10000 }).catch(() => false)) {
      await expect(this.successDialogModal).toBeVisible();
    }

    await expect(this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last())
      .toBeVisible({ timeout: PromoPage.PAGE_LOAD_TIMEOUT });
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
      await expect(field).toBeVisible();
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
