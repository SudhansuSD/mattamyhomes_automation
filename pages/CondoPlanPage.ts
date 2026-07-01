import { Locator, Page, expect } from '@playwright/test';
import { SearchablePage } from './SearchablePage';
import { getLocationConfig } from '../config/locations/locationConfig';
import { escapeRegex, isIgnorableHref } from '../utils/pageObjectUtils';
import {
  expectFieldVisibleIfPresent,
  fillLeadFormFields,
  getInvalidLeadData,
  getValidLeadData,
  selectOptionIfPresent
} from '../utils/leadFormHelper';

const TIMEOUT = {
  short: 10000,
  medium: 15000,
  long: 20000
};

const TEXT = {
  pageTitle: /The M2ad plan.*Martha James Condominiums.*Mattamy Homes/i,
  condoPlanDetails: /Condo Plan Details/i,
  mortgageCalculator: /Mortgage Calculator/i,
  supportHeadline: /We're with you all the way to the front door/i,
  availableFloorplans: /Explore available floorplans/i,
  contactUs: /^Contact Us$/i,
  hours: /^Hours$/i,
  communityUpdates: /Sign Up For Community Updates/i,
  submit: /submit/i,
  requiredError: /Required|Please complete|Invalid|Error/i,
  emailError: /valid domain name|valid email|invalid email/i,
  successMessage: /Thank you for your interest in Mattamy Homes/i
};

export type CondoPlanDetails = {
  name: string;
  url: string;
  community: string;
  market: string;
};

const EXPECTED_CONDO_PLAN = {
  city: 'Burlington',
  title: /The M2ad plan.*Martha James Condominiums.*Mattamy Homes/i,
  specs: [
    '2 Beds',
    '2 Baths',
    '946 Sq. Ft.',
    'Floor 5',
    '2 Bedroom + Den'
  ],
  planType: 'Condo',
  descriptionKeywords: [
    /2-bedroom \+ den/i,
    /open-concept kitchen/i,
    /primary bedroom/i,
    /terrace|balcony/i,
    /stacked washer\/dryer/i
  ],
  relatedPlanNames: ['M1bd', 'Mj1b', 'Mj1f'],
  salesOffice: {
    address: '1388 Dundas Street West',
    cityProvincePostal: 'Oakville, ON L6M 4L8',
    phone: '416-630-8282'
  }
} as const;

/* ==========================================================
   Condo Plan Page - Page Object Model

   Automated scenarios covered by this page object:
   - Home page condo plan search, URL, title, H1, and breadcrumb validation
   - Hero/spec summary validation
   - Condo plan details content validation
   - Floorplan image validation
   - Mortgage calculator CTA presence validation
   - Available floorplans cards and View All link validation
   - Contact Us, phone, map, and Hours validation
   - Get Information CTA scroll/anchor behavior without form submission
   - Community updates form field and validation-message checks
   - Footer/navigation href sanity validation

   Form submit scenarios are intentionally left skipped/commented in spec
   because live lead forms must not be submitted.
========================================================== */

export class CondoPlanPage extends SearchablePage {
  readonly heading: Locator;
  readonly breadcrumb: Locator;
  readonly body: Locator;
  readonly floorplanImage: Locator;
  readonly getInformationCta: Locator;
  readonly mortgageCalculatorSection: Locator;
  readonly mortgageCalculatorCta: Locator;
  readonly availableFloorplansSection: Locator;
  readonly contactSection: Locator;
  readonly hoursSection: Locator;
  readonly communityUpdatesSection: Locator;
  readonly successDialogModal: Locator;

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { level: 1 });
    this.breadcrumb = page.locator('#breadcrumb, nav[aria-label*="breadcrumb" i]').first();
    this.body = page.locator('body');
    this.floorplanImage = page.locator('img[alt*="Floorplan" i], img[alt*="M2AD" i]').first();
    this.getInformationCta = page.locator('button, a').filter({
      hasText: /^\s*Get Information\s*$/i
    }).first();
    this.mortgageCalculatorSection = page.locator('section, div').filter({
      hasText: TEXT.mortgageCalculator
    }).first();
    this.mortgageCalculatorCta = this.mortgageCalculatorSection.getByRole('button', {
      name: /Get Started/i
    }).first();
    this.availableFloorplansSection = page.locator('section, div').filter({
      has: page.getByRole('heading', { name: TEXT.availableFloorplans })
    }).first();
    this.contactSection = page.locator('section, div').filter({
      has: page.getByRole('heading', { name: TEXT.contactUs })
    }).first();
    this.hoursSection = page.locator('section, div').filter({
      has: page.getByRole('heading', { name: TEXT.hours })
    }).first();
    this.communityUpdatesSection = page.locator('section, div').filter({
      has: page.getByRole('heading', { name: TEXT.communityUpdates })
    }).last();
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** Locator: all visible navigation and content links. */
  private get navLinks(): Locator {
    return this.page.locator('a[href]');
  }

  /** Locator: community update forms. */
  private get communityUpdateForms(): Locator {
    return this.page.locator(
      'form, [role="group"], [id^="Sitecore-ScheduleAVisit-FormInstance"], [id^="ScheduleAVisit-FormInstance"], [id*="FormInstance"], [id*="form" i], [class*="form" i]'
    ).filter({
      has: this.page.getByRole('button', { name: TEXT.submit })
    }).filter({
      has: this.page.locator('input, select, textarea')
    });
  }

  /** Locator: lead form success message. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(TEXT.successMessage).last();
  }

  /** Verify: condo plan search lands on the configured condo plan URL with a visible H1. */
  async verifySearchByCondoPlan(): Promise<void> {
    await this.step('Verify search lands on condo plan URL', async () => {
      const location = getLocationConfig() as ReturnType<typeof getLocationConfig> & {
        condoPlan?: { url?: string };
      };

      if (!location.condoPlan?.url) {
        throw new Error('Condo plan URL is not configured in location config');
      }

      await this.waitForPageReady();
      await this.assertPageUrlContains(
        location.condoPlan.url,
        `Condo plan URL should contain configured path: ${location.condoPlan.url}`
      );
      await this.assertHeadingVisible(undefined, 'Condo plan detail page should expose a visible H1');
    });
  }

  /** Verify: condo plan page has loaded with the expected heading. */
  async verifyPageLoaded(expectedPlanName = 'M2ad'): Promise<void> {
    await this.step(`Verify condo plan page loaded ('${expectedPlanName}')`, async () => {
      await expect(this.heading).toBeVisible({ timeout: TIMEOUT.long });
      await expect(this.heading).toContainText(new RegExp(escapeRegex(expectedPlanName), 'i'));
    });
  }

  /** Verify: current URL and browser title match the expected condo plan details. */
  async verifyUrlAndTitle(plan: CondoPlanDetails): Promise<void> {
    await this.step('Verify URL and title', async () => {
      await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(plan.url)}\\/?$`, 'i'));
      await expect(this.page).toHaveTitle(EXPECTED_CONDO_PLAN.title);
    });
  }

  /** Verify: breadcrumb contains market, city, community, and plan context. */
  async verifyBreadcrumb(plan: CondoPlanDetails): Promise<void> {
    await this.step('Verify breadcrumb context', async () => {
      if (await this.breadcrumb.count()) {
        await expect(this.breadcrumb).toBeVisible({ timeout: TIMEOUT.short });
        await expect(this.breadcrumb.getByRole('link', { name: /Greater To|Greater Toronto Area/i }).first())
          .toHaveAttribute('href', /\/ontario\/gta$/i);
        await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(EXPECTED_CONDO_PLAN.city), 'i'));
        await expect(this.breadcrumb.getByRole('link', { name: /Martha Jam|Martha James Condominiums/i }).first())
          .toHaveAttribute('href', /\/ontario\/gta\/burlington\/martha-james-condominiums$/i);
        await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(plan.name), 'i'));
        return;
      }

      await expect(this.body).toContainText(new RegExp(escapeRegex(plan.community), 'i'));
      await expect(this.body).toContainText(new RegExp(escapeRegex(plan.name), 'i'));
    });
  }

  /** Verify: hero summary contains plan name, specs, and plan type. */
  async verifyHeroSummary(plan: CondoPlanDetails): Promise<void> {
    await this.step('Verify hero summary', async () => {
      await expect(this.heading).toContainText(new RegExp(escapeRegex(plan.name), 'i'));

      for (const spec of EXPECTED_CONDO_PLAN.specs) {
        await expect(this.body).toContainText(new RegExp(escapeRegex(spec), 'i'));
      }

      await expect(this.body).toContainText(new RegExp(escapeRegex(EXPECTED_CONDO_PLAN.planType), 'i'));
    });
  }

  /** Verify: main Condo Plan Details copy is present and meaningful. */
  async verifyCondoPlanDetailsContent(): Promise<void> {
    await this.step('Verify condo plan details content', async () => {
      await expect(this.page.getByRole('heading', { name: TEXT.condoPlanDetails }))
        .toBeVisible({ timeout: TIMEOUT.short });

      for (const keyword of EXPECTED_CONDO_PLAN.descriptionKeywords) {
        await expect(this.body).toContainText(keyword);
      }
    });
  }

  /** Verify: floorplan image exists and has a non-empty source. */
  async verifyFloorplanImage(): Promise<void> {
    await this.step('Verify floorplan image', async () => {
      await expect(this.floorplanImage).toBeVisible({ timeout: TIMEOUT.medium });
      await expect(this.floorplanImage).toHaveAttribute('src', /.+/);
    });
  }

  /** Verify: mortgage calculator section and CTA are visible, without opening/submitting any form. */
  async verifyMortgageCalculatorCta(): Promise<void> {
    await this.step('Verify mortgage calculator CTA', async () => {
      await expect(this.mortgageCalculatorSection).toBeVisible({ timeout: TIMEOUT.short });
      await expect(this.mortgageCalculatorCta).toBeVisible({ timeout: TIMEOUT.short });
    });
  }

  /** Verify: support headline below mortgage calculator is visible. */
  async verifySupportHeadline(): Promise<void> {
    await this.step('Verify support headline', async () => {
      await expect(this.body).toContainText(TEXT.supportHeadline, { timeout: TIMEOUT.short });
    });
  }

  /** Verify: related floorplans and View All CTA are present and valid. */
  async verifyAvailableFloorplans(plan: CondoPlanDetails): Promise<void> {
    await this.step('Verify available floorplans', async () => {
      await expect(this.availableFloorplansSection).toBeVisible({ timeout: TIMEOUT.medium });
      await expect(this.availableFloorplansSection).toContainText(TEXT.availableFloorplans);

      const viewAllLink = this.page
        .locator('a[href*="productType=plan"][href*="Martha%20James%20Condominiums"], a[href*="productType=plan"][href*="Martha James Condominiums"]')
        .first();

      await expect(viewAllLink).toBeVisible({ timeout: TIMEOUT.short });
      await expect(viewAllLink).toHaveAttribute(
        'href',
        /\/search\?productType=plan.*community=Martha(\+|%20| )James(\+|%20| )Condominiums/i
      );

      for (const planName of EXPECTED_CONDO_PLAN.relatedPlanNames) {
        const relatedPlanLink = this.page
          .locator(`a[href$="/martha-james-condominiums/${planName.toLowerCase()}"]`)
          .first();

        await expect(relatedPlanLink, `${planName} related floorplan should be visible`)
          .toBeVisible({ timeout: TIMEOUT.short });
        await expect(relatedPlanLink).toHaveAttribute(
          'href',
          new RegExp(`/martha-james-condominiums/${escapeRegex(planName.toLowerCase())}`, 'i')
        );

        const relatedPlanHref = await relatedPlanLink.getAttribute('href');
        await this.reportValue(`Floorplan: ${planName}`, this.buildFullUrl(relatedPlanHref));
      }
    });
  }

  /** Verify: Show More button is safe to use when available and keeps user on the same page. */
  async verifyShowMoreFloorplansIfPresent(): Promise<void> {
    await this.step('Verify Show More floorplans', async () => {
      const showMore = this.page.getByRole('button', {
        name: /show more/i
      }).first();

      if (!(await showMore.isVisible().catch(() => false))) {
        await this.reportValue('Show More floorplans button not present - skipping validation');
        return;
      }

      const currentUrl = this.page.url();
      await showMore.click();
      await this.waitForPageReady();
      await expect(this.page).toHaveURL(currentUrl);
    });
  }

  /** Verify: sales/contact office content, map link, and phone link are valid. */
  async verifyContactUsSection(): Promise<void> {
    await this.step('Verify Contact Us section', async () => {
      await expect(this.contactSection).toBeVisible({ timeout: TIMEOUT.short });
      await expect(this.contactSection).toContainText(EXPECTED_CONDO_PLAN.salesOffice.address);
      await expect(this.contactSection).toContainText(EXPECTED_CONDO_PLAN.salesOffice.cityProvincePostal);
      await expect(this.contactSection).toContainText(EXPECTED_CONDO_PLAN.salesOffice.phone);

      await expect(this.contactSection.locator('a[href^="tel:"]').first())
        .toHaveAttribute('href', new RegExp(EXPECTED_CONDO_PLAN.salesOffice.phone.replace(/-/g, '\\-')));
      await expect(this.contactSection.locator('a[href*="maps.google.com"]').first())
        .toHaveAttribute('href', /maps\.google\.com\/maps\?q=/i);
    });
  }

  /** Verify: Hours section is available and shows an open/closed state. */
  async verifyHoursSection(): Promise<void> {
    await this.step('Verify Hours section', async () => {
      await expect(this.hoursSection).toBeVisible({ timeout: TIMEOUT.short });
      await expect(this.hoursSection).toContainText(/Open|Closed|Hours/i);
    });
  }

  /** Verify: Get Information CTA moves focus/viewport toward the form section without submitting it. */
  async verifyGetInformationCtaScrollsToForm(): Promise<void> {
    await this.step('Verify Get Information CTA scrolls to form', async () => {
      await expect(this.getInformationCta).toBeVisible({ timeout: TIMEOUT.short });
      await this.getInformationCta.click();
      await this.waitForPageReady();
      await expect(this.communityUpdatesSection).toBeVisible({ timeout: TIMEOUT.medium });
    });
  }

  /** Verify: community update form fields are present without submitting the form. */
  async verifyCommunityUpdateFormFields(): Promise<void> {
    await this.step('Verify community update form fields', async () => {
      const form = await this.getAvailableCommunityUpdateForm();

      if (!form) {
        return;
      }

      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /first name/i }), 'First name');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /^email/i }), 'Email');
      await this.expectFieldIfPresent(form.getByRole('combobox', { name: /country of residence/i }), 'Country of Residence');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), 'Zip/Postal Code');
      await this.expectFieldIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone number');

      await expect(form.getByRole('button', { name: TEXT.submit }).first())
        .toBeVisible({ timeout: TIMEOUT.short });
    });
  }

  /** Verify: visible page links have usable href values. */
  async verifyNavigationLinks(): Promise<void> {
    await this.step('Verify navigation links have usable hrefs', async () => {
      const linkCount = await this.navLinks.count();

      expect(linkCount, 'Condo plan page should contain links').toBeGreaterThan(0);

      for (let i = 0; i < linkCount; i++) {
        const href = await this.navLinks.nth(i).getAttribute('href');

        if (isIgnorableHref(href)) {
          continue;
        }

        expect(href, `Navigation link ${i + 1} href missing`).toBeTruthy();
        expect(href, `Navigation link ${i + 1} should not be javascript`)
          .not.toMatch(/^javascript:/i);

        await this.reportValue(`Navigation link ${i + 1}`, this.buildFullUrl(href));
      }
    });
  }

  /** Verify: an empty community update form shows required-field validation. */
  async validateCommunityUpdateRequiredErrors(): Promise<void> {
    await this.step('Validate community update required errors', async () => {
      const form = await this.getAvailableCommunityUpdateForm();

      if (!form) {
        throw new Error('Community updates form not found; required-field validation cannot be verified');
      }

      const submitButton = form.getByRole('button', { name: TEXT.submit }).first();
      await expect(submitButton, 'Community updates form submit button should be visible')
        .toBeVisible({ timeout: TIMEOUT.short });
      await submitButton.click();

      const renderedErrors = form
        .locator('[role="alert"]:visible, [aria-live]:visible, .field-validation-error:visible, .error:visible, div:visible, span:visible, p:visible, label:visible')
        .filter({ hasText: TEXT.requiredError });

      await expect.poll(async () => {
        const renderedErrorCount = await renderedErrors.count();
        const invalidFields = await form.locator('input, select, textarea').evaluateAll((fields) =>
          fields.filter((field) => {
            const control = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            return !control.disabled && !control.validity.valid;
          }).length
        );

        return renderedErrorCount + invalidFields;
      }, {
        message: 'Submitting the empty community updates form should expose required-field validation',
        timeout: TIMEOUT.short
      }).toBeGreaterThan(0);
    });
  }

  /** Skipped by spec: this would click SUBMIT after entering invalid email data. */
  async validateCommunityUpdateInvalidEmail(): Promise<void> {
    await this.step('Validate community update invalid email', async () => {
      const form = await this.getAvailableCommunityUpdateForm();

      if (!form) {
        return;
      }

      await fillLeadFormFields(form, getInvalidLeadData('condoPlan'), {
        selectCountry: false,
        checkConsent: false
      });

      await form.getByRole('button', { name: TEXT.submit }).first().click();
      await expect(form.locator(`text=${TEXT.emailError}`).first())
        .toBeVisible({ timeout: TIMEOUT.short });
    });
  }

  /** Skipped by spec: this would create a live lead submission. */
  async verifyCommunityUpdateSuccessfulSubmission(): Promise<void> {
    await this.step('Submit community update form successfully', async () => {
      const form = await this.getAvailableCommunityUpdateForm();

      if (!form) {
        return;
      }

      await fillLeadFormFields(form, getValidLeadData('condoPlan'), {
        selectCommunity: true,
        selectPlan: true
      });
      await selectOptionIfPresent(form.getByRole('combobox', { name: /^country$/i }), 'Canada');

      const formUrl = this.page.url();

      await this.submitLeadFormAndCaptureApi({
        formName: 'Condo plan community update form',
        submitButton: form.getByRole('button', { name: TEXT.submit }).first(),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        timeout: TIMEOUT.long
      });
      await this.expectNoContactRedirect(formUrl);
    });
  }

  /** Helper: return the visible community update form when available. */
  private async getAvailableCommunityUpdateForm(): Promise<Locator | null> {
    let count = await this.communityUpdateForms.count();

    if (count === 0) {
      await this.openCommunityUpdateFormIfPresent();
      count = await this.communityUpdateForms.count();
    }

    if (count === 0) {
      await this.reportValue('Community updates form not present - skipping form validation');
      return null;
    }

    const form = this.communityUpdateForms.first();
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible({ timeout: TIMEOUT.short });

    return form;
  }

  /** Helper: open or scroll to the community update form when the CTA controls it. */
  private async openCommunityUpdateFormIfPresent(): Promise<void> {
    const currentUrl = this.page.url();
    const cta = this.page.locator('button, a').filter({
      hasText: /^\s*Get Information\s*$/i
    }).first();

    if (await cta.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cta.click({ force: true });
      await this.waitForPageReady();
      await this.expectNoContactRedirect(currentUrl);
    }
  }

  /** Helper: fail fast when the flow navigates to Contact instead of showing in-page form success. */
  private async expectNoContactRedirect(previousUrl: string): Promise<void> {
    await this.settle(1000);

    const currentUrl = this.page.url();

    expect(
      currentUrl,
      `Expected condo plan form flow to stay on page and show success modal, but it navigated from ${previousUrl} to ${currentUrl}`
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Helper: assert a field is visible only when present. */
  private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
    await expectFieldVisibleIfPresent(field, label, TIMEOUT.short);
  }

}
