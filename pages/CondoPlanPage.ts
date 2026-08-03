import { Locator, Page, expect } from '@playwright/test';
import { SearchablePage } from './SearchablePage';
import { getLocationConfig } from '../config/locations/locationConfig';
import { escapeRegex, isIgnorableHref } from '../utils/pageObjectUtils';
import {
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  expectSideModalFormFields,
  fillInvalidSideModalForm,
  fillValidSideModalForm,
  getSubmitButton,
  selectOptionIfPresent,
} from '../utils/leadFormHelper';

const TIMEOUT = {
  short: 10000,
  medium: 15000,
  long: 20000,
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
  successMessage: /Thank you for your interest in Mattamy Homes/i,
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
  specs: ['2 Beds', '2 Baths', '946 Sq. Ft.', 'Floor 5', '2 Bedroom + Den'],
  planType: 'Condo',
  descriptionKeywords: [
    /2-bedroom \+ den/i,
    /open-concept kitchen/i,
    /primary bedroom/i,
    /terrace|balcony/i,
    /stacked washer\/dryer/i,
  ],
  relatedPlanNames: ['M1bd', 'Mj1b', 'Mj1f'],
  salesOffice: {
    address: '1388 Dundas Street West',
    cityProvincePostal: 'Oakville, ON L6M 4L8',
    phone: '416-630-8282',
  },
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
   - Floating Get Information CTA opens sidebar/modal form
   - Sidebar/modal form field and validation-message checks
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
    this.getInformationCta = page
      .locator('button, a')
      .filter({
        hasText: /^\s*(?:Get Information|Stay Updated)\s*$/i,
      })
      .first();
    this.mortgageCalculatorSection = page
      .locator('section, div')
      .filter({
        hasText: TEXT.mortgageCalculator,
      })
      .first();
    this.mortgageCalculatorCta = this.mortgageCalculatorSection
      .getByRole('button', {
        name: /Get Started/i,
      })
      .first();
    this.availableFloorplansSection = page
      .locator('section, div')
      .filter({
        has: page.getByRole('heading', { name: TEXT.availableFloorplans }),
      })
      .first();
    this.contactSection = page
      .locator('section, div')
      .filter({
        has: page.getByRole('heading', { name: TEXT.contactUs }),
      })
      .first();
    this.hoursSection = page
      .locator('section, div')
      .filter({
        has: page.getByRole('heading', { name: TEXT.hours }),
      })
      .first();
    this.communityUpdatesSection = page
      .locator('section, div')
      .filter({
        has: page.getByRole('heading', { name: TEXT.communityUpdates }),
      })
      .last();
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** Locator: all visible navigation and content links. */
  private get navLinks(): Locator {
    return this.page.locator('a[href]');
  }

  /** Locator: Get Information modal form rendered in a modal, drawer, or sidebar. */
  private get leadFormDialogOrSidebar(): Locator {
    return this.page
      .locator(
        '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible',
      )
      .filter({ has: this.page.locator('form, input, select, textarea') });
  }

  /** Locator: modal form success message. */
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
        `Condo plan URL should contain configured path: ${location.condoPlan.url}`,
      );
      await this.assertHeadingVisible(
        undefined,
        'Condo plan detail page should expose a visible H1',
      );
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
        await expect(
          this.breadcrumb.getByRole('link', { name: /Greater To|Greater Toronto Area/i }).first(),
        ).toHaveAttribute('href', /\/ontario\/gta$/i);
        await expect(this.breadcrumb).toContainText(
          new RegExp(escapeRegex(EXPECTED_CONDO_PLAN.city), 'i'),
        );
        await expect(
          this.breadcrumb
            .getByRole('link', { name: /Martha Jam|Martha James Condominiums/i })
            .first(),
        ).toHaveAttribute('href', /\/ontario\/gta\/burlington\/martha-james-condominiums$/i);
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

      await expect(this.body).toContainText(
        new RegExp(escapeRegex(EXPECTED_CONDO_PLAN.planType), 'i'),
      );
    });
  }

  /** Verify: main Condo Plan Details copy is present and meaningful. */
  async verifyCondoPlanDetailsContent(): Promise<void> {
    await this.step('Verify condo plan details content', async () => {
      await expect(this.page.getByRole('heading', { name: TEXT.condoPlanDetails })).toBeVisible({
        timeout: TIMEOUT.short,
      });

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
  async verifyAvailableFloorplans(_plan: CondoPlanDetails): Promise<void> {
    await this.step('Verify available floorplans', async () => {
      await expect(this.availableFloorplansSection).toBeVisible({ timeout: TIMEOUT.medium });
      await expect(this.availableFloorplansSection).toContainText(TEXT.availableFloorplans);

      const viewAllLink = this.page
        .locator(
          'a[href*="productType=plan"][href*="Martha%20James%20Condominiums"], a[href*="productType=plan"][href*="Martha James Condominiums"]',
        )
        .first();

      await expect(viewAllLink).toBeVisible({ timeout: TIMEOUT.short });
      await expect(viewAllLink).toHaveAttribute(
        'href',
        /\/search\?productType=plan.*community=Martha(\+|%20| )James(\+|%20| )Condominiums/i,
      );

      for (const planName of EXPECTED_CONDO_PLAN.relatedPlanNames) {
        const relatedPlanLink = this.page
          .locator(`a[href$="/martha-james-condominiums/${planName.toLowerCase()}"]`)
          .first();

        await expect(
          relatedPlanLink,
          `${planName} related floorplan should be visible`,
        ).toBeVisible({ timeout: TIMEOUT.short });
        await expect(relatedPlanLink).toHaveAttribute(
          'href',
          new RegExp(`/martha-james-condominiums/${escapeRegex(planName.toLowerCase())}`, 'i'),
        );

        const relatedPlanHref = await relatedPlanLink.getAttribute('href');
        await this.reportValue(`Floorplan: ${planName}`, this.buildFullUrl(relatedPlanHref));
      }
    });
  }

  /** Verify: Show More button is safe to use when available and keeps user on the same page. */
  async verifyShowMoreFloorplansIfPresent(): Promise<void> {
    await this.step('Verify Show More floorplans', async () => {
      const showMore = this.page
        .getByRole('button', {
          name: /show more/i,
        })
        .first();

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
      await expect(this.contactSection).toContainText(
        EXPECTED_CONDO_PLAN.salesOffice.cityProvincePostal,
      );
      await expect(this.contactSection).toContainText(EXPECTED_CONDO_PLAN.salesOffice.phone);

      await expect(this.contactSection.locator('a[href^="tel:"]').first()).toHaveAttribute(
        'href',
        new RegExp(EXPECTED_CONDO_PLAN.salesOffice.phone.replace(/-/g, '\\-')),
      );
      await expect(
        this.contactSection.locator('a[href*="maps.google.com"]').first(),
      ).toHaveAttribute('href', /maps\.google\.com\/maps\?q=/i);
    });
  }

  /** Verify: Hours section is available and shows an open/closed state. */
  async verifyHoursSection(): Promise<void> {
    await this.step('Verify Hours section', async () => {
      await expect(this.hoursSection).toBeVisible({ timeout: TIMEOUT.short });
      await expect(this.hoursSection).toContainText(/Open|Closed|Hours/i);
    });
  }

  /** Verify: Get Information CTA opens the condo plan side modal form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      const form = await this.openSideModalForm();
      await expect(
        form,
        'Get Information condo plan side modal form should be visible',
      ).toBeVisible({ timeout: TIMEOUT.short });
    });
  }

  /** Verify: condo plan side modal form fields are present without submitting the form. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Verify Get Information side modal form fields', async () => {
      const form = await this.getAvailableSideModalForm();
      await expectSideModalFormFields(form, {
        timeout: TIMEOUT.short,
        expectCommunity: true,
        expectPlan: true,
      });
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
        expect(href, `Navigation link ${i + 1} should not be javascript`).not.toMatch(
          /^javascript:/i,
        );

        await this.reportValue(`Navigation link ${i + 1}`, this.buildFullUrl(href));
      }
    });
  }

  /** Verify: an empty condo plan side modal form shows required-field validation. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Validate Get Information side modal form required errors', async () => {
      const form = await this.getAvailableSideModalForm();
      await clickSubmit(this.page, form, TIMEOUT.short);
      await expectRequiredErrorsInForm(form, TIMEOUT.short);
    });
  }

  /** Verify: condo plan side modal form rejects invalid email addresses. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate Get Information side modal form invalid email', async () => {
      const form = await this.getAvailableSideModalForm();
      await fillInvalidSideModalForm(form, 'condoPlan', {
        selectCountry: false,
        checkConsent: false,
      });
      await clickSubmit(this.page, form, TIMEOUT.short);
      await expectInvalidEmailErrorInForm(form, TIMEOUT.short);
    });
  }

  /** Verify: condo plan Get Information side modal form can be submitted successfully. */
  async verifySideModalFormSuccessfulSubmission(): Promise<void> {
    await this.step('Submit Get Information side modal form successfully', async () => {
      const form = await this.getAvailableSideModalForm();
      await fillValidSideModalForm(form, 'condoPlan', {
        selectCommunity: true,
        selectPlan: true,
      });
      await selectOptionIfPresent(form.getByRole('combobox', { name: /^country$/i }), 'Canada');

      const formUrl = this.page.url();

      await this.submitLeadFormAndCaptureApi({
        formName: 'Get Information condo plan side modal form',
        submitButton: getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        timeout: TIMEOUT.long,
      });
      await this.expectNoContactRedirect(formUrl, 'condo plan page');
    });
  }

  /** Open the side modal lead form and return it (for external evidence capture). */
  async openSideModalLeadForm(
    formName = 'Get Information condo plan side modal form',
  ): Promise<Locator> {
    return this.getAvailableSideModalForm(formName);
  }

  /** Helper: return the visible Get Information side modal form, asserting its submit button is usable. */
  private async getAvailableSideModalForm(
    formName = 'Get Information condo plan side modal form',
  ): Promise<Locator> {
    const form = await this.openSideModalForm(formName);

    await expect(
      getSubmitButton(form),
      `${formName} submit button should be visible inside sidebar/modal`,
    ).toBeVisible({ timeout: TIMEOUT.short });

    return form;
  }

  /** Helper: open the Get Information side modal form and return the visible container. */
  private async openSideModalForm(
    formName = 'Get Information condo plan side modal form',
  ): Promise<Locator> {
    return this.openSideModalFormByIndex({
      leadForms: this.leadFormDialogOrSidebar,
      formName,
      pageLabel: 'condo plan page',
      ctaTimeout: TIMEOUT.medium,
      openTimeout: TIMEOUT.medium,
    });
  }
}
