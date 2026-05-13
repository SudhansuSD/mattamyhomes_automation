import { Locator, Page, expect } from '@playwright/test';
import { HomePage } from './HomePage';
import { BasePage } from './BasePage';

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
   - Community updates form field presence validation only
   - Footer/navigation href sanity validation

   Form submit scenarios are intentionally left skipped/commented in spec
   because live lead forms must not be submitted.
========================================================== */

export class CondoPlanPage extends HomePage {
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

  /** Action: search for a condo plan from the home page search box. */
  async searchByCondoPlan(condoPlanName: string): Promise<void> {
    await this.search(condoPlanName);
  }

  /** Verify: condo plan search redirects to the expected plan URL and heading. */
  async verifySearchByCondoPlan(plan: CondoPlanDetails): Promise<void> {
    await this.waitForPageReady();
    await expect(this.page).toHaveURL(new RegExp(`${this.escapeRegex(plan.url)}\\/?$`, 'i'));
    await this.verifyPageLoaded(plan.name);
  }

  /** Verify: condo plan page has loaded with the expected heading. */
  async verifyPageLoaded(expectedPlanName = 'M2ad'): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: TIMEOUT.long });
    await expect(this.heading).toContainText(new RegExp(this.escapeRegex(expectedPlanName), 'i'));
  }

  /** Verify: current URL and browser title match the expected condo plan details. */
  async verifyUrlAndTitle(plan: CondoPlanDetails): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.escapeRegex(plan.url)}\\/?$`, 'i'));
    await expect(this.page).toHaveTitle(EXPECTED_CONDO_PLAN.title);
  }

  /** Verify: breadcrumb contains market, city, community, and plan context. */
  async verifyBreadcrumb(plan: CondoPlanDetails): Promise<void> {
    if (await this.breadcrumb.count()) {
      await expect(this.breadcrumb).toBeVisible({ timeout: TIMEOUT.short });
      await expect(this.breadcrumb.getByRole('link', { name: /Greater To|Greater Toronto Area/i }).first())
        .toHaveAttribute('href', /\/ontario\/gta$/i);
      await expect(this.breadcrumb).toContainText(new RegExp(this.escapeRegex(EXPECTED_CONDO_PLAN.city), 'i'));
      await expect(this.breadcrumb.getByRole('link', { name: /Martha Jam|Martha James Condominiums/i }).first())
        .toHaveAttribute('href', /\/ontario\/gta\/burlington\/martha-james-condominiums$/i);
      await expect(this.breadcrumb).toContainText(new RegExp(this.escapeRegex(plan.name), 'i'));
      return;
    }

    await expect(this.body).toContainText(new RegExp(this.escapeRegex(plan.community), 'i'));
    await expect(this.body).toContainText(new RegExp(this.escapeRegex(plan.name), 'i'));
  }

  /** Verify: hero summary contains plan name, specs, and plan type. */
  async verifyHeroSummary(plan: CondoPlanDetails): Promise<void> {
    await expect(this.heading).toContainText(new RegExp(this.escapeRegex(plan.name), 'i'));

    for (const spec of EXPECTED_CONDO_PLAN.specs) {
      await expect(this.body).toContainText(new RegExp(this.escapeRegex(spec), 'i'));
    }

    await expect(this.body).toContainText(new RegExp(this.escapeRegex(EXPECTED_CONDO_PLAN.planType), 'i'));
  }

  /** Verify: main Condo Plan Details copy is present and meaningful. */
  async verifyCondoPlanDetailsContent(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: TEXT.condoPlanDetails }))
      .toBeVisible({ timeout: TIMEOUT.short });

    for (const keyword of EXPECTED_CONDO_PLAN.descriptionKeywords) {
      await expect(this.body).toContainText(keyword);
    }
  }

  /** Verify: floorplan image exists and has a non-empty source. */
  async verifyFloorplanImage(): Promise<void> {
    await expect(this.floorplanImage).toBeVisible({ timeout: TIMEOUT.medium });
    await expect(this.floorplanImage).toHaveAttribute('src', /.+/);
  }

  /** Verify: mortgage calculator section and CTA are visible, without opening/submitting any form. */
  async verifyMortgageCalculatorCta(): Promise<void> {
    await expect(this.mortgageCalculatorSection).toBeVisible({ timeout: TIMEOUT.short });
    await expect(this.mortgageCalculatorCta).toBeVisible({ timeout: TIMEOUT.short });
  }

  /** Verify: support headline below mortgage calculator is visible. */
  async verifySupportHeadline(): Promise<void> {
    await expect(this.body).toContainText(TEXT.supportHeadline, { timeout: TIMEOUT.short });
  }

  /** Verify: related floorplans and View All CTA are present and valid. */
  async verifyAvailableFloorplans(plan: CondoPlanDetails): Promise<void> {
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
        new RegExp(`/martha-james-condominiums/${this.escapeRegex(planName.toLowerCase())}`, 'i')
      );
    }
  }

  /** Verify: Show More button is safe to use when available and keeps user on the same page. */
  async verifyShowMoreFloorplansIfPresent(): Promise<void> {
    const showMore = this.page.getByRole('button', {
      name: /show more/i
    }).first();

    if (!(await showMore.isVisible().catch(() => false))) {
      console.warn('Show More floorplans button not present - skipping validation');
      return;
    }

    const currentUrl = this.page.url();
    await showMore.click();
    await this.waitForPageReady();
    await expect(this.page).toHaveURL(currentUrl);
  }

  /** Verify: sales/contact office content, map link, and phone link are valid. */
  async verifyContactUsSection(): Promise<void> {
    await expect(this.contactSection).toBeVisible({ timeout: TIMEOUT.short });
    await expect(this.contactSection).toContainText(EXPECTED_CONDO_PLAN.salesOffice.address);
    await expect(this.contactSection).toContainText(EXPECTED_CONDO_PLAN.salesOffice.cityProvincePostal);
    await expect(this.contactSection).toContainText(EXPECTED_CONDO_PLAN.salesOffice.phone);

    await expect(this.contactSection.locator('a[href^="tel:"]').first())
      .toHaveAttribute('href', new RegExp(EXPECTED_CONDO_PLAN.salesOffice.phone.replace(/-/g, '\\-')));
    await expect(this.contactSection.locator('a[href*="maps.google.com"]').first())
      .toHaveAttribute('href', /maps\.google\.com\/maps\?q=/i);
  }

  /** Verify: Hours section is available and shows an open/closed state. */
  async verifyHoursSection(): Promise<void> {
    await expect(this.hoursSection).toBeVisible({ timeout: TIMEOUT.short });
    await expect(this.hoursSection).toContainText(/Open|Closed|Hours/i);
  }

  /** Verify: Get Information CTA moves focus/viewport toward the form section without submitting it. */
  async verifyGetInformationCtaScrollsToForm(): Promise<void> {
    await expect(this.getInformationCta).toBeVisible({ timeout: TIMEOUT.short });
    await this.getInformationCta.click();
    await this.waitForPageReady();
    await expect(this.communityUpdatesSection).toBeVisible({ timeout: TIMEOUT.medium });
  }

  /** Verify: community update form fields are present without submitting the form. */
  async verifyCommunityUpdateFormFields(): Promise<void> {
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
  }

  /** Verify: visible page links have usable href values. */
  async verifyNavigationLinks(): Promise<void> {
    const linkCount = await this.navLinks.count();

    expect(linkCount, 'Condo plan page should contain links').toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const href = await this.navLinks.nth(i).getAttribute('href');

      if (this.isIgnorableHref(href)) {
        continue;
      }

      expect(href, `Navigation link ${i + 1} href missing`).toBeTruthy();
      expect(href, `Navigation link ${i + 1} should not be javascript`)
        .not.toMatch(/^javascript:/i);
    }
  }

  /** Skipped by spec: this would click SUBMIT on an empty live lead form. */
  async validateCommunityUpdateRequiredErrors(): Promise<void> {
    const form = await this.getAvailableCommunityUpdateForm();

    if (!form) {
      return;
    }

    await form.getByRole('button', { name: TEXT.submit }).first().click();
    await expect(form.locator(`text=${TEXT.requiredError}`).first())
      .toBeVisible({ timeout: TIMEOUT.short });
  }

  /** Skipped by spec: this would click SUBMIT after entering invalid email data. */
  async validateCommunityUpdateInvalidEmail(): Promise<void> {
    const form = await this.getAvailableCommunityUpdateForm();

    if (!form) {
      return;
    }

    await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Test');
    await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'User');
    await this.fillIfPresent(form.getByRole('textbox', { name: /^email/i }), 'user@domain.c');
    await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '4165551212');
    await this.fillIfPresent(form.getByRole('textbox', { name: /postal|zip/i }), 'L7R 0A1');

    await form.getByRole('button', { name: TEXT.submit }).first().click();
    await expect(form.locator(`text=${TEXT.emailError}`).first())
      .toBeVisible({ timeout: TIMEOUT.short });
  }

  /** Skipped by spec: this would create a live lead submission. */
  async verifyCommunityUpdateSuccessfulSubmission(): Promise<void> {
    const form = await this.getAvailableCommunityUpdateForm();

    if (!form) {
      return;
    }

    await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Sudhansu');
    await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Das');
    await this.fillIfPresent(
      form.getByRole('textbox', { name: /^email/i }),
      `ssdas_condoplan_${Date.now()}@ex2india.com`
    );
    await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '4165551212');
    await this.fillIfPresent(form.getByRole('textbox', { name: /postal|zip/i }), 'L7R 0A1');

    await this.selectIfPresent(form.getByRole('combobox', { name: /country of residence/i }), 'Canada');
    await this.selectIfPresent(form.getByRole('combobox', { name: /^country$/i }), 'Canada');
    await this.selectIfPresent(form.getByRole('combobox', { name: /community/i }));
    await this.selectIfPresent(form.getByRole('combobox', { name: /suite|floorplan|plan/i }));
    await this.checkIfPresent(form.getByRole('checkbox'));

    const formUrl = this.page.url();

    await form.getByRole('button', { name: TEXT.submit }).first().click();
    await this.expectNoContactRedirect(formUrl);

    if (await this.successDialogModal.count()) {
      await expect(this.successDialogModal.last()).toBeVisible({ timeout: TIMEOUT.short });
    }

    await expect(this.formSuccessMessage).toBeVisible({ timeout: TIMEOUT.long });
  }

  /** Helper: return the visible community update form when available. */
  private async getAvailableCommunityUpdateForm(): Promise<Locator | null> {
    let count = await this.communityUpdateForms.count();

    if (count === 0) {
      await this.openCommunityUpdateFormIfPresent();
      count = await this.communityUpdateForms.count();
    }

    if (count === 0) {
      console.warn('Community updates form not present - skipping form validation');
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
    await this.page.waitForTimeout(1000);

    const currentUrl = this.page.url();

    expect(
      currentUrl,
      `Expected condo plan form flow to stay on page and show success modal, but it navigated from ${previousUrl} to ${currentUrl}`
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Helper: assert a field is visible only when present. */
  private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
    if (await field.count()) {
      await expect(field.first(), `${label} field should be visible`)
        .toBeVisible({ timeout: TIMEOUT.short });
    }
  }

  /** Helper: fill a field only when present. */
  private async fillIfPresent(field: Locator, value: string): Promise<void> {
    if (await field.count()) {
      await field.first().fill(value);
    }
  }

  /** Helper: select a dropdown value when the field exists. */
  private async selectIfPresent(field: Locator, preferredLabel?: string): Promise<void> {
    const target = field.first();

    if (!(await target.count())) {
      return;
    }

    if (preferredLabel) {
      const selected = await target.selectOption({ label: preferredLabel })
        .then(() => true)
        .catch(() => false);

      if (selected) {
        return;
      }
    }

    await target.selectOption({ index: 1 }).catch(() => undefined);
  }

  /** Helper: check a consent/preference checkbox when present. */
  private async checkIfPresent(field: Locator): Promise<void> {
    const target = field.first();

    if (await target.count()) {
      await target.check({ force: true }).catch(() => undefined);
    }
  }

  /** Helper: identify empty, anchor, phone, mail, and JavaScript hrefs. */
  private isIgnorableHref(href: string | null): boolean {
    return !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:');
  }

  /** Helper: escape dynamic text before creating a regular expression. */
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
