import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import {
  fillIfPresent,
  getConsentCheckbox,
  getLeadProfile,
  getValidLeadData,
} from '../utils/leadFormHelper';
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

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.heroImage = page.locator('img[alt="Lifestyle"]').first();
    this.promoHeading = page.getByRole('heading', {
      name: /A Special Thank You to Our Hometown Heroes/i,
    });
    this.offerHeading = page.getByRole('heading', {
      name: /We are honored to offer you a/i,
    });
    this.discoverOrlandoSection = page.getByRole('heading', {
      name: /Discover Mattamy Orlando/i,
    });
    this.formTitle = page.getByRole('heading', {
      name: /Request more information/i,
    });
    this.promoForm = page.locator('form#Sitecore-ScheduleAVisitPromo-FormInstance0').first();
    this.submitButton = this.promoForm.getByRole('button', { name: /submit/i }).first();
    this.successDialogModal = page.locator('.ReactModal__Content').last();
  }

  /** Opens hometown heroes promo. */
  async navigateToHometownHeroesPromo(): Promise<void> {
    await this.step('Navigate to Hometown Heroes promo', async () => {
      const { baseURL, envName } = getEnvConfig();
      const targetUrl = `${baseURL}${PromoPage.PROMO_PATH}?country=USA`;

      await this.reportValue(
        'Navigating to promo',
        `ENV=${envName} | COUNTRY=USA | URL=${targetUrl}`,
      );

      await this.page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });

      await this.dismissBlockingOverlays();
      await this.waitForPageReady();
    });
  }

  /** Checks that the page loaded. */
  async verifyPageLoaded(): Promise<void> {
    await this.step('Verify Hometown Heroes promo page loaded', async () => {
      await this.assertPageUrl(
        /\/florida\/orlando\/promos\/hometown-heroes/i,
        'Hometown Heroes promo URL should match expected route',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await this.assertPageTitle(
        /Hometown Heroes.*Orlando/i,
        'Hometown Heroes promo page title should match',
      );
      await this.assertVisible(
        this.heroImage,
        'Hometown Heroes promo hero image should be visible',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await this.assertVisible(
        this.promoHeading,
        'Hometown Heroes promo heading should be visible',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await this.assertVisible(
        this.offerHeading,
        'Hometown Heroes offer heading should be visible',
      );
      await this.assertVisible(
        this.discoverOrlandoSection,
        'Discover Orlando section should be visible',
      );
    });
  }

  /** Checks the promo form fields. */
  async verifyPromoFormFields(): Promise<void> {
    await this.step('Verify promo form fields', async () => {
      await this.scrollToForm();

      await this.assertVisible(
        this.formTitle,
        'Promo form title should be visible',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await this.assertVisible(
        this.promoForm,
        'Promo lead form should be visible',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await this.assertVisible(
        this.communityField,
        'Community of Interest field should be visible',
      );
      await this.assertVisible(this.firstNameField, 'First name field should be visible');
      await this.assertVisible(this.lastNameField, 'Last name field should be visible');
      await this.assertVisible(this.emailField, 'Email field should be visible');
      await this.assertVisible(this.countryField, 'Country field should be visible');
      await this.assertVisible(this.zipPostalField, 'Zip/Postal Code field should be visible');
      await this.assertVisible(this.phoneField, 'Phone number field should be visible');
      await this.expectFieldIfPresent(this.questionsField);
      await expect(this.termsCheckbox, 'Terms checkbox should be present').toBeAttached({
        timeout: 10000,
      });
      await this.assertVisible(this.submitButton, 'Promo form submit button should be visible');
    });
  }

  /** Checks required field errors. */
  async validateRequiredFieldErrors(): Promise<void> {
    await this.step('Validate required field errors', async () => {
      await this.scrollToForm();
      await this.submitButton.click();

      await expect(this.requiredError(/Community of Interest/i)).toBeVisible({
        timeout: PromoPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.requiredError(/First name/i)).toBeVisible();
      await expect(this.requiredError(/Last name/i)).toBeVisible();
      await expect(this.requiredError(/Email/i)).toBeVisible();
      await expect(this.requiredError(/Country of Residence/i)).toBeVisible();
      await expect(this.requiredError(/Zip\/Postal Code/i)).toBeVisible();
    });
  }

  /** Checks invalid email address error. */
  async validateInvalidEmailError(): Promise<void> {
    await this.step('Validate invalid email error', async () => {
      await this.scrollToForm();
      await this.fillPromoForm({
        ...this.buildValidLeadData(),
        email: 'not-an-email',
      });

      await this.submitButton.click();

      const emailError = this.promoForm
        .locator('div:visible, span:visible, p:visible, label:visible')
        .filter({
          hasText: /Email addresses must contain|valid domain name|valid email|invalid email/i,
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
        'Promo email field should reject invalid email format',
      );
    });
  }

  /** Checks that the form submits successfully. */
  async verifySuccessfulSubmission(): Promise<void> {
    await this.step('Verify successful form submission', async () => {
      await this.scrollToForm();
      await this.fillPromoForm(this.buildValidLeadData());
      await this.submitLeadFormAndCaptureApi({
        formName: 'Promo lead form',
        submitButton: this.submitButton,
        successModal: this.successDialogModal,
        successMessage: this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last(),
        timeout: PromoPage.PAGE_LOAD_TIMEOUT,
      });
    });
  }

  /** Gets the community field locator. */
  private get communityField(): Locator {
    return this.promoForm.getByRole('combobox', { name: /Community of Interest/i }).first();
  }

  /** Gets the first name field locator. */
  private get firstNameField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /First name/i }).first();
  }

  /** Gets the last name field locator. */
  private get lastNameField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Last name/i }).first();
  }

  /** Gets the email field locator. */
  private get emailField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Email/i }).first();
  }

  /** Gets the country field locator. */
  private get countryField(): Locator {
    return this.promoForm.getByRole('combobox', { name: /Country of Residence/i }).first();
  }

  /** Gets the ZIP/postal field locator. */
  private get zipPostalField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Zip\/Postal Code/i }).first();
  }

  /** Gets the phone field locator. */
  private get phoneField(): Locator {
    return this.promoForm.getByRole('textbox', { name: /Phone number/i }).first();
  }

  /** Gets the questions field locator. */
  private get questionsField(): Locator {
    return this.promoForm
      .getByRole('textbox', {
        name: /Additional questions or special requirements/i,
      })
      .first();
  }

  /** Gets the terms checkbox locator. */
  private get termsCheckbox(): Locator {
    return getConsentCheckbox(this.promoForm);
  }

  /** Gets the SMS checkbox locator. */
  private get smsCheckbox(): Locator {
    return this.promoForm
      .getByRole('checkbox', {
        name: /recurring, personalized text messages/i,
      })
      .first();
  }

  /** Scrolls to the lead form section. */
  private async scrollToForm(): Promise<void> {
    await this.promoForm.waitFor({
      state: 'attached',
      timeout: PromoPage.PAGE_LOAD_TIMEOUT,
    });
    await this.promoForm.scrollIntoViewIfNeeded();
  }

  /** Fills the promo form. */
  private async fillPromoForm(leadData: PromoLeadData): Promise<void> {
    await this.communityField.selectOption({ label: leadData.community });
    await this.firstNameField.fill(leadData.firstName);
    await this.lastNameField.fill(leadData.lastName);
    await this.emailField.fill(leadData.email);
    await this.countryField.selectOption({ label: leadData.country });
    await this.zipPostalField.fill(leadData.zipPostal);
    await this.phoneField.fill(leadData.phone);
    await fillIfPresent(this.questionsField, leadData.questions);
    await this.termsCheckbox.check({ force: true });

    if (await this.smsCheckbox.count()) {
      await this.smsCheckbox.check({ force: true });
    }
  }

  /** Builds valid lead data for the promo form. */
  private buildValidLeadData(): PromoLeadData {
    const data = getValidLeadData('promo');
    const profile = getLeadProfile('promo');

    return {
      community: profile.community ?? '',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      country: data.country,
      zipPostal: data.zip,
      phone: data.phone,
      questions: profile.questions ?? '',
    };
  }

  /** Gets the required-field error locator. */
  private requiredError(fieldName: RegExp): Locator {
    return this.promoForm
      .locator('div:visible, span:visible, p:visible, label:visible')
      .filter({
        hasText: new RegExp(`Error:\\s*${fieldName.source} is Required`, 'i'),
      })
      .first();
  }

  /** Expects a form field to be visible when present. */
  private async expectFieldIfPresent(field: Locator): Promise<void> {
    if (await field.count()) {
      await this.assertVisible(field, 'Optional promo form field should be visible when present');
    }
  }

  /** Dismisses blocking overlays. */
  private async dismissBlockingOverlays(): Promise<void> {
    await this.acceptCookiesIfPresent();

    const usaCountryButton = this.page.getByRole('button', { name: /^USA$/i }).last();

    if (await usaCountryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await usaCountryButton.click();
      await this.settle(1000);
    }

    const privacyCloseButton = this.page.locator('#close-pc-btn-handler');

    if (await privacyCloseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await privacyCloseButton.click();
    }
  }
}
