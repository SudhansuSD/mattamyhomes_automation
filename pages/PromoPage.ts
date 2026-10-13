import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import {
  clickSubmit,
  fillIfPresent,
  getConsentCheckbox,
  getLeadProfile,
  getValidLeadData,
} from '../utils/leadform/leadFormHelper';
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

  private offerDisclaimerHandlerRegistered = false;
  private promoFormPresent: boolean | null = null;

  readonly formTitle: Locator;
  readonly promoForm: Locator;
  readonly submitButton: Locator;
  readonly successDialogModal: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.formTitle = page.getByRole('heading', {
      name: /Request more information/i,
    });
    this.promoForm = page.locator('form#Sitecore-ScheduleAVisitPromo-FormInstance0').first();
    this.submitButton = this.promoForm.getByRole('button', { name: /submit/i }).first();
    this.successDialogModal = page.locator('.ReactModal__Content').last();
  }

  /** Opens the country home page, then the country's configured promo page. */
  async navigateToPromo(): Promise<void> {
    await this.step(`Navigate to ${this.location.country} promo page`, async () => {
      await this.navigate();

      const { baseURL, envName } = getEnvConfig();
      const targetUrl = `${baseURL}${this.promoPath}`;

      await this.reportValue(
        'Navigating to promo',
        `ENV=${envName} | COUNTRY=${this.location.country} | URL=${targetUrl}`,
      );

      await this.gotoAndVerifyResponse(targetUrl);

      await this.dismissBlockingOverlays();
      await this.waitForPageReady();
    });
  }

  /**
   * Checks the configured promo page loaded with real content.
   *
   * Every check is structural - no promo's wording is assumed - so pointing `promoURL` at a
   * different promotion needs no code change. The one content check is the market: promo routes
   * are `/<region>/<market>/promos/<slug>` and each promo's title names that market.
   */
  async verifyPageLoaded(): Promise<void> {
    await this.step(`Verify ${this.location.country} promo page loaded`, async () => {
      await this.assertPageUrl(
        new RegExp(this.promoPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
        'Promo URL should match the configured route',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await this.assertPageTitle(/^(?!.*Page Not Found).*\S/i, 'Promo page should have a title');
      await this.reportValue('Promo page title', await this.page.title());

      const market = this.promoMarket;

      if (market) {
        await this.assertPageTitle(
          new RegExp(market.replace(/[-\s]+/g, '[-\\s]+'), 'i'),
          `Promo page title should name the ${market} market`,
        );
      }

      const heroImage = this.page.locator('main img:visible').first();

      await this.assertVisible(
        heroImage,
        'Promo hero image should be visible',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await expect
        .poll(() => heroImage.evaluate((img) => (img as HTMLImageElement).naturalWidth), {
          message: 'Promo hero image should load',
          timeout: PromoPage.PAGE_LOAD_TIMEOUT,
        })
        .toBeGreaterThan(0);

      const promoHeading = this.page.locator('main h2:visible').filter({ hasText: /\S/ }).first();

      await this.assertVisible(
        promoHeading,
        'Promo heading should be visible',
        PromoPage.PAGE_LOAD_TIMEOUT,
      );
      await this.reportValue('Promo heading', (await promoHeading.innerText()).trim());
    });
  }

  /** Reports whether this promo carries a lead form; absence is declared in featureExpectations. */
  async hasPromoForm(): Promise<boolean> {
    if (this.promoFormPresent === null) {
      this.promoFormPresent = await this.isFeaturePresent(
        this.promoForm,
        'promo.leadForm',
        'Promo lead form',
        { state: 'attached', timeout: 10000 },
      );
    }

    return this.promoFormPresent;
  }

  /** Checks every field the promo form should offer is on screen. */
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

  /** Submits the empty form and checks each required field reports its error. */
  async validateRequiredFieldErrors(): Promise<void> {
    await this.step('Validate required field errors', async () => {
      await this.scrollToForm();
      await clickSubmit(this.page, this.promoForm, PromoPage.PAGE_LOAD_TIMEOUT, {
        submitButton: this.submitButton,
      });

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

  /** Submits a bad email and checks either the page or the browser rejects it. */
  async validateInvalidEmailError(): Promise<void> {
    await this.step('Validate invalid email error', async () => {
      await this.scrollToForm();
      await this.fillPromoForm({
        ...this.buildValidLeadData(),
        email: 'not-an-email',
      });

      await clickSubmit(this.page, this.promoForm, PromoPage.PAGE_LOAD_TIMEOUT, {
        submitButton: this.submitButton,
      });

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

  /** Fills the form with valid data, submits it, and checks the confirmation. */
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

  /** Gets the promo path configured for this location. */
  private get promoPath(): string {
    const { promoURL } = this.location;

    if (!promoURL) {
      throw new Error(`No promoURL configured for ${this.location.country} in locationConfig`);
    }

    return promoURL;
  }

  /** Gets the market named in the promo route, or null when the route has no market segment. */
  private get promoMarket(): string | null {
    const segments = this.promoPath.split('/').filter(Boolean);
    const promosIndex = segments.indexOf('promos');

    return promosIndex > 0 ? segments[promosIndex - 1].replace(/-/g, ' ') : null;
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

  /** Waits for the promo form and scrolls it into view. */
  private async scrollToForm(): Promise<void> {
    await this.promoForm.waitFor({
      state: 'attached',
      timeout: PromoPage.PAGE_LOAD_TIMEOUT,
    });
    await this.promoForm.scrollIntoViewIfNeeded();
  }

  /**
   * Selects the test-data community, or the first real option when this promo does not list it.
   *
   * Each promo scopes the dropdown to its own market, so a community from another market is
   * never on offer; falling back keeps the form checks working for whatever `promoURL` points at.
   */
  private async selectCommunity(preferred: string): Promise<void> {
    await expect
      .poll(() => this.communityField.locator('option').count(), {
        message: 'Community of Interest options should load',
        timeout: PromoPage.PAGE_LOAD_TIMEOUT,
      })
      .toBeGreaterThan(1);

    const labels = (await this.communityField.locator('option').allInnerTexts()).map((label) =>
      label.trim(),
    );
    const realOptions = labels.filter((label, index) => index > 0 && label);
    const community = realOptions.includes(preferred) ? preferred : realOptions[0];

    await this.reportValue('Community of Interest', community);
    await this.communityField.selectOption({ label: community });
  }

  /** Fills every promo field and ticks the consent boxes. */
  private async fillPromoForm(leadData: PromoLeadData): Promise<void> {
    await this.selectCommunity(leadData.community);
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

  /** Builds a valid set of promo lead data from the shared test data. */
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

  /** Returns the "<field> is Required" message for one field. */
  private requiredError(fieldName: RegExp): Locator {
    return this.promoForm
      .locator('div:visible, span:visible, p:visible, label:visible')
      .filter({
        hasText: new RegExp(`Error:\\s*${fieldName.source} is Required`, 'i'),
      })
      .first();
  }

  /** Checks an optional field is visible, but only when the form renders it. */
  private async expectFieldIfPresent(field: Locator): Promise<void> {
    if (await field.count()) {
      await this.assertVisible(field, 'Optional promo form field should be visible when present');
    }
  }

  /**
   * Arms a handler that closes the offer disclaimer modal whenever it covers the page.
   *
   * The Hometown Heroes page opens its "*Offer available on select homes..." disclaimer as a
   * react-modal on its own after hydration, not only from the asterisk link. While it is open
   * react-modal marks `#root` `aria-hidden`, so every role-based lookup on the page - the promo
   * heading, the country button - reports "element(s) not found" even though the content is
   * rendered behind it. It opens anywhere from a few seconds to well after `domcontentloaded`, so
   * a one-off check right after navigation misses it; a locator handler closes it whenever it is
   * on screen during an action or assertion.
   */
  private async registerOfferDisclaimerHandler(): Promise<void> {
    if (this.offerDisclaimerHandlerRegistered) {
      return;
    }

    const closeButton = this.page.getByRole('button', { name: /close disclaimer/i }).first();

    await this.page.addLocatorHandler(closeButton, async (button) => {
      await this.reportValue('Offer disclaimer modal covered the page', 'closed');
      await button.click();
      await this.clearStaleModalAriaHidden();
    });
    this.offerDisclaimerHandlerRegistered = true;
  }

  /** Clears the disclaimer, cookie banner, country picker and privacy panel over the form. */
  private async dismissBlockingOverlays(): Promise<void> {
    await this.registerOfferDisclaimerHandler();
    await this.acceptCookiesIfPresent();

    const countryName = this.locationKey === 'CAN' ? /^(Canada|CAN)$/i : /^USA$/i;
    const countryButton = this.page.getByRole('button', { name: countryName }).last();

    if (await countryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await countryButton.click();
      await this.settle(1000);
    }

    const privacyCloseButton = this.page.locator('#close-pc-btn-handler');

    if (await privacyCloseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await privacyCloseButton.click();
    }
  }
}
