import { Locator, Page, expect } from '@playwright/test';
import { SearchablePage } from './SearchablePage';
import { escapeRegex, isLocatorVisible } from '../utils/pageObjectUtils';
import {
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  expectSideModalFormFields,
  fillInvalidSideModalForm,
  fillValidSideModalForm,
  getSubmitButton,
  SUBMIT_BUTTON_SELECTOR,
} from '../utils/leadFormHelper';

// Plan Detail Page – Page Object Model

export type PlanDetails = {
  path: string;
  name: string;
  title?: RegExp;
  price?: string;
  community?: string;
  breadcrumbItems?: string[];
  specs?: string[];
  productLine?: string;
  exteriorStyles?: string[];
  floorPlanFrameUrlPart?: string;
  qmiHeadline?: string;
  salesOffice?: {
    address: string;
    cityStateZip: string;
    phone: string;
  };
};

export class PlanDetailPage extends SearchablePage {
  /** Finds main plan detail heading. */
  readonly heading: Locator;

  /** Finds breadcrumb navigation container. */
  readonly breadcrumb: Locator;

  /** Finds starting price label. */
  readonly priceSection: Locator;

  /** Finds gallery images on the plan detail page. */
  readonly galleryImages: Locator;

  /** Finds gallery next button. */
  readonly nextGalleryBtn: Locator;

  /** Finds gallery previous button. */
  readonly prevGalleryBtn: Locator;

  /** Finds interactive floorplan section. */
  readonly floorPlanSection: Locator;

  /** Finds exterior styles section. */
  readonly exteriorStylesSection: Locator;

  /** Finds mortgage calculator Get Started button. */
  readonly mortgageBtn: Locator;

  /** Finds mortgage calculator component. */
  readonly mortgageComponent: Locator;

  /** Finds modal close button. */
  readonly closeModalBtn: Locator;

  /** Finds available quick move-in homes section. */
  readonly qmiSection: Locator;

  /** Finds View All QMI CTA. */
  readonly viewAllQMIButton: Locator;

  /** Finds related QMI home links. */
  readonly qmiHomeslist: Locator;

  /** Finds Get Information CTA. */
  readonly getInformationCta: Locator;

  /** Finds community updates form section. */
  readonly signUpFormSection: Locator;

  /** Finds sales office section. */
  readonly salesOfficeSection: Locator;

  /** Finds React modal shown after successful form submission. */
  readonly successDialogModal: Locator;

  /** Setup: initialize plan detail page locators. */
  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1');
    this.breadcrumb = page.locator('#breadcrumb');
    this.priceSection = page.getByText('Starting from', { exact: true });
    this.galleryImages = page.locator('.slick-slide img, .swiper-slide img, img');
    this.nextGalleryBtn = page.getByLabel('Next slide');
    this.prevGalleryBtn = page.getByLabel('Previous slide');
    this.floorPlanSection = page
      .getByRole('heading', {
        name: /Interactive Floorplan/i,
      })
      .locator('xpath=ancestor::section[1]');
    this.exteriorStylesSection = page
      .getByRole('heading', {
        name: /Exterior Styles/i,
      })
      .locator('xpath=ancestor::section[1]');
    this.mortgageBtn = page.getByRole('button', { name: /Get Started/i });
    this.mortgageComponent = page
      .locator('section, div')
      .filter({
        has: page.getByRole('heading', { name: /Mortgage Calculator/i }),
      })
      .first();
    this.closeModalBtn = page
      .locator('.ReactModal__Content, [role="dialog"]')
      .locator('button[aria-label="Close"], button:has-text("Close"), button:has-text("CLOSE")')
      .first();
    this.qmiSection = page.locator('#availablehomes');
    this.viewAllQMIButton = this.qmiSection.locator('a:has-text("View all")');
    this.qmiHomeslist = this.qmiSection.locator(
      'a[aria-label*="Floorplan"], a:has-text("Floorplan")',
    );
    this.getInformationCta = page
      .locator('a, button')
      .filter({
        hasText: /^\s*(?:Get Information|Stay Updated)\s*$/i,
      })
      .first();
    this.signUpFormSection = page
      .getByText(/Sign Up For Community Updates/i)
      .locator('xpath=ancestor::*[self::section or self::div][1]');
    this.salesOfficeSection = page
      .getByText(/^Sales Office$/i)
      .locator('xpath=ancestor::*[self::section or self::div][1]');
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** Finds Get Information modal form rendered in a modal, drawer, or sidebar. */
  private get leadFormDialogOrSidebar(): Locator {
    return (
      this.page
        .locator(
          '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible',
        )
        // A Submit button, not just any input, is what separates a lead form from
        // the page's other dialogs - the National-promotion overlay is a
        // full-screen role="dialog" with inputs and used to match here. Matched
        // by CSS rather than by role (see SUBMIT_BUTTON_SELECTOR): the promotion
        // popup aria-hides the whole page while it is up, which left this filter
        // matching nothing and an open side modal reporting as "did not open".
        // and(), not filter({ hasNot }): the aria-label sits on the overlay
        // itself, and hasNot only inspects descendants.
        .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
        .and(
          this.page.locator(
            ':not([aria-label*="promotion" i]):not([aria-label*="notification" i])',
          ),
        )
    );
  }

  /** Finds modal form success confirmation message. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  }

  /** Finds gallery media with approved fallback selectors. */
  private async planGalleryImages(): Promise<Locator> {
    return this.healLocator('plan detail gallery media', [
      {
        locator: this.galleryImages,
        selector: '.slick-slide img, .swiper-slide img, img',
      },
      {
        locator: this.page.locator('#gallery img, [id*="gallery" i] img'),
        selector: '#gallery img, [id*="gallery" i] img',
      },
      {
        locator: this.page.locator('[role="region"][aria-label*="image" i] img'),
        selector: '[role="region"][aria-label*="image" i] img',
      },
    ]);
  }

  /** Finds available quick move-in homes section with approved fallback selectors. */
  private async availableHomesSection(): Promise<Locator> {
    return this.healLocator('plan detail available homes section', [
      {
        locator: this.qmiSection,
        selector: '#availablehomes',
      },
      {
        locator: this.page
          .locator('section, div')
          .filter({ has: this.page.getByRole('heading', { name: /Quick Move-In Homes/i }) })
          .first(),
        selector: 'section/div with Quick Move-In Homes heading',
      },
      {
        locator: this.page
          .locator('section, div')
          .filter({ has: this.page.locator('a[href*="productType=qmi"], a[href*="quick-move"]') })
          .first(),
        selector: 'section/div with QMI links',
      },
    ]);
  }

  /** Finds quick move-in home links inside a section. */
  private qmiHomeLinks(section: Locator): Locator {
    return section.locator(
      'a[aria-label*="Floorplan"], a:has-text("Floorplan"), a[href*="quick-move"], a[href*="/homes/"]',
    );
  }

  /** Finds View All QMI CTA inside a section. */
  private viewAllQmiButton(section: Locator): Locator {
    return section.locator('a:has-text("View all"), a[href*="productType=qmi"]').first();
  }

  // ----------------------------------
  // Page Load Validation
  // ----------------------------------

  /** Checks that plan detail page heading and breadcrumb are visible. */
  async verifyPageLoaded() {
    await this.step('Verify plan detail page loaded', async () => {
      await expect(this.heading).toBeVisible({ timeout: 20000 });
      await expect(this.breadcrumb).toBeVisible();
    });
  }

  // ----------------------------------
  // Plan detail Validation
  // ----------------------------------

  /** Checks that search by plan lands on the expected plan URL and shows a heading. */
  async verifySearchByPlan(expectedSlug: string) {
    await this.step('Verify search by plan lands on expected URL', async () => {
      await this.waitForPageReady();

      await expect(this.page).toHaveURL(new RegExp(escapeRegex(expectedSlug), 'i'));

      await expect(this.heading).toBeVisible({ timeout: 20000 });
    });
  }

  /** Checks that plan URL and optional browser title match expected details. */
  async verifyPlanUrlAndTitle(plan: PlanDetails): Promise<void> {
    await this.step('Verify plan URL and title', async () => {
      await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(plan.path)}$`, 'i'));

      if (plan.title) {
        await expect(this.page).toHaveTitle(plan.title);
      }
    });
  }

  /** Checks that current URL contains an expected plan URL fragment. */
  async verifyPlanUrlContains(expectedUrlPart: string): Promise<void> {
    await this.step(`Verify URL contains '${expectedUrlPart}'`, async () => {
      await expect(this.page).toHaveURL(new RegExp(escapeRegex(expectedUrlPart), 'i'));
    });
  }

  /** Checks that hero heading is visible. */
  async verifyHeroSection() {
    await this.step('Verify hero section heading visible', async () => {
      const headingLoaded = await this.heading
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => true)
        .catch(() => false);

      if (!headingLoaded) {
        await this.reportValue(
          'Plan heading not visible after search navigation; reloading current plan URL',
        );
        await this.page.reload({
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        });
        await this.waitForPageReady();
      }

      await expect(this.heading).toBeVisible({ timeout: 20000 });
    });
  }

  /** Checks that hero heading contains a specific plan name. */
  async verifyHeroSummaryForPlan(planName: string): Promise<void> {
    await this.step(`Verify hero heading contains '${planName}'`, async () => {
      await expect(this.heading).toBeVisible({ timeout: 20000 });
      await expect(this.heading).toContainText(new RegExp(escapeRegex(planName), 'i'));
    });
  }

  /** Checks that page body includes standard home specs. */
  async verifyHomeSpecsPresent(): Promise<void> {
    await this.step('Verify home specs present', async () => {
      const pageText = this.page.locator('body');

      await expect(pageText).toContainText(/Bed/i);
      await expect(pageText).toContainText(/Bath/i);
      await expect(pageText).toContainText(/Sq\.?\s*Ft\.?/i);
    });
  }

  /** Checks that hero summary contains configured plan name, price, specs, and product line. */
  async verifyHeroSummary(plan: PlanDetails): Promise<void> {
    await this.step('Verify hero summary details', async () => {
      await expect(this.heading).toBeVisible({ timeout: 20000 });
      await expect(this.heading).toContainText(new RegExp(escapeRegex(plan.name), 'i'));

      if (plan.price) {
        await expect(this.page.getByText('Starting from', { exact: true })).toBeVisible();
        await expect(this.page.locator('body')).toContainText(plan.price);
      }

      for (const spec of plan.specs ?? []) {
        await expect(this.page.locator('body')).toContainText(spec);
      }

      if (plan.productLine) {
        await expect(this.page.locator('body')).toContainText(plan.productLine);
      }
    });
  }

  /** Checks that breadcrumb is visible when present. */
  async verifyBreadcrumb() {
    await this.step('Verify breadcrumb visible', async () => {
      if ((await this.breadcrumb.count()) > 0) {
        await expect(this.breadcrumb.first()).toBeVisible();
      }
    });
  }

  /** Checks that breadcrumb includes expected items from the configured plan path. */
  async verifyBreadcrumbMatchesPlanPath(plan: PlanDetails): Promise<void> {
    await this.step('Verify breadcrumb matches plan path', async () => {
      await expect(this.breadcrumb).toBeVisible();

      for (const item of plan.breadcrumbItems ?? []) {
        await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(item), 'i'));
      }
    });
  }

  /** Checks that breadcrumb contains the expected plan name. */
  async verifyBreadcrumbContainsPlan(planName: string): Promise<void> {
    await this.step(`Verify breadcrumb contains '${planName}'`, async () => {
      await expect(this.breadcrumb).toBeVisible();
      await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(planName), 'i'));
    });
  }

  /** Checks that starting price label is visible when present. */
  async verifyPriceOrCTA() {
    await this.step('Verify starting price label', async () => {
      if ((await this.priceSection.count()) > 0) {
        await expect(this.priceSection.first()).toBeVisible();
      }
    });
  }

  /** Checks that gallery image is visible and gallery controls work when present. */
  async verifyGallery() {
    await this.step('Verify gallery image and controls', async () => {
      const galleryImages = await this.planGalleryImages();

      await expect(galleryImages.first()).toBeVisible();

      await this.clickGalleryControlIfVisible(this.nextGalleryBtn, 'Next gallery slide');
      await this.clickGalleryControlIfVisible(this.prevGalleryBtn, 'Previous gallery slide');
    });
  }

  /** Clicks a gallery control, falling back to DOM dispatch when overlays intercept pointer events. */
  private async clickGalleryControlIfVisible(control: Locator, label: string): Promise<void> {
    if (!(await control.isVisible({ timeout: 2000 }).catch(() => false))) {
      return;
    }

    await this.dismissPromoPopupIfPresent({ appearTimeout: 1000 });
    await this.scrollIntoCenter(control);
    await control.click({ timeout: 5000 }).catch(async () => {
      await this.reportValue(`${label} native click was intercepted; dispatching DOM click`);
      await control.dispatchEvent('click');
    });
    await this.settle(500);
  }

  /** Checks that optional gallery media tabs render usable media when selected. */
  async verifyGalleryMediaTabsIfAvailable(): Promise<void> {
    await this.step('Verify gallery media tabs when available', async () => {
      const tabNames = [/^Videos$/i, /^360 Tours$/i, /^Photos$/i, /^Model Home$/i];
      let validatedTabs = 0;

      for (const tabName of tabNames) {
        const tab = this.page
          .locator('button:visible, a:visible')
          .filter({ hasText: tabName })
          .first();

        if (!(await tab.isVisible({ timeout: 1500 }).catch(() => false))) {
          await this.reportValue(`${tabName.source} gallery tab not present - skipping`);
          continue;
        }

        await tab.scrollIntoViewIfNeeded();
        await tab.click();
        await this.waitForPageReady();
        await this.settle(500);

        const visibleMedia = this.page
          .locator('img:visible, video:visible, iframe:visible, canvas:visible')
          .first();

        await expect(
          visibleMedia,
          `${tabName.source} gallery tab should render visible media`,
        ).toBeVisible({ timeout: 10000 });
        validatedTabs++;
      }

      if (!validatedTabs) {
        await this.reportValue('No optional plan gallery media tabs present - skipping validation');
      } else {
        await this.reportValue(`Validated ${validatedTabs} plan gallery media tab(s)`);
      }
    });
  }

  /** Checks that floorplan section is visible when present. */
  async verifyFloorPlan() {
    await this.step('Verify floorplan section', async () => {
      if (await isLocatorVisible(this.floorPlanSection)) {
        await this.floorPlanSection.scrollIntoViewIfNeeded();
        await expect(this.floorPlanSection).toBeVisible();
      }
    });
  }

  /** Checks that interactive floorplan section and optional iframe source match expected plan details. */
  async verifyInteractiveFloorPlan(plan: PlanDetails): Promise<void> {
    await this.step('Verify interactive floorplan', async () => {
      await this.floorPlanSection.scrollIntoViewIfNeeded();
      await expect(
        this.page.getByRole('heading', { name: /Interactive Floorplan/i }),
      ).toBeVisible();

      if (plan.floorPlanFrameUrlPart) {
        const iframe = this.page.locator('iframe[title*="Floorplan" i]').first();
        await expect(iframe).toBeVisible();
        await expect(iframe).toHaveAttribute(
          'src',
          new RegExp(escapeRegex(plan.floorPlanFrameUrlPart), 'i'),
        );
      }
    });
  }

  /** Checks that interactive floorplan section is available when present. */
  async verifyInteractiveFloorPlanSection(): Promise<void> {
    await this.step('Verify interactive floorplan section', async () => {
      const floorPlanHeading = this.page
        .getByRole('heading', {
          name: /Interactive Floorplan/i,
        })
        .first();

      if (await isLocatorVisible(floorPlanHeading)) {
        await floorPlanHeading.scrollIntoViewIfNeeded();
        await expect(floorPlanHeading).toBeVisible();
        await expect(this.page.locator('iframe[title*="Floorplan" i]').first()).toBeVisible();
      } else {
        await this.reportValue('Interactive floorplan section not present - skipping validation');
      }
    });
  }

  /** Checks that configured exterior styles are visible. */
  async verifyExteriorStyles(styles: string[]): Promise<void> {
    await this.step('Verify exterior styles', async () => {
      await this.exteriorStylesSection.scrollIntoViewIfNeeded();
      await expect(this.page.getByRole('heading', { name: /Exterior Styles/i })).toBeVisible();

      for (const style of styles) {
        await expect(this.page.getByText(style, { exact: false }).first()).toBeVisible();
      }
    });
  }

  /** Checks that exterior styles section is visible when present. */
  async verifyExteriorStylesSection(): Promise<void> {
    await this.step('Verify exterior styles section', async () => {
      const exteriorHeading = this.page
        .getByRole('heading', {
          name: /Exterior Styles/i,
        })
        .first();

      if (await isLocatorVisible(exteriorHeading)) {
        await exteriorHeading.scrollIntoViewIfNeeded();
        await expect(exteriorHeading).toBeVisible();
      } else {
        await this.reportValue('Exterior Styles section not present - skipping validation');
      }
    });
  }

  /** Checks that mortgage form CTA opens and can be closed when present. */
  async verifyMortgageForm() {
    await this.step('Verify mortgage form CTA', async () => {
      if (await isLocatorVisible(this.mortgageBtn)) {
        await this.mortgageBtn.scrollIntoViewIfNeeded();
        await this.mortgageBtn.click();

        if (await isLocatorVisible(this.closeModalBtn)) {
          await this.closeModalBtn.click();
        }
      }
    });
  }

  /** Checks that mortgage calculator CTA is visible when the section exists. */
  async verifyMortgageCalculatorCta(): Promise<void> {
    await this.step('Verify mortgage calculator CTA', async () => {
      const mortgageTitle = this.page.getByText(/Mortgage Calculator/i).first();

      if (await isLocatorVisible(mortgageTitle)) {
        await mortgageTitle.scrollIntoViewIfNeeded();
        await expect(mortgageTitle).toBeVisible();
        await expect(this.mortgageBtn.first()).toBeVisible();
      } else {
        await this.reportValue('Mortgage Calculator section not present - skipping validation');
      }
    });
  }

  /** Checks the QMI section and logs available homes plus the View All URL when present. */
  async verifyQMISection() {
    await this.step('Verify QMI section', async () => {
      const qmiSection = await this.availableHomesSection();

      if (await isLocatorVisible(qmiSection)) {
        await qmiSection.scrollIntoViewIfNeeded();
        await this.waitForPageReady();

        const qmiHomeslist = this.qmiHomeLinks(qmiSection);
        const viewAllQMIButton = this.viewAllQmiButton(qmiSection);
        const qmiCount = await qmiHomeslist.count();

        await this.reportValue('Number of QMI Homes listed', qmiCount);
        if (qmiCount === 0) {
          await this.reportValue('QMI section has no home cards - skipping card validation');
          return;
        }

        for (let i = 0; i < qmiCount; i++) {
          const homeLink = qmiHomeslist.nth(i);
          const homeHref = await homeLink.getAttribute('href');
          expect(homeHref).toBeTruthy();
          await this.reportValue(`QMI Home ${i + 1}`, this.buildFullUrl(homeHref));
        }

        if ((await viewAllQMIButton.count()) > 0) {
          await expect(viewAllQMIButton).toBeVisible();

          const href = await viewAllQMIButton.getAttribute('href');
          await this.reportValue('View All QMI URL', href);
        } else {
          await this.reportValue('View All link not visible');
        }
      } else {
        await this.reportValue('QMI Section not found');
      }
    });
  }

  /** Checks that configured quick move-in homes section content and links. */
  async verifyQuickMoveInHomes(plan: PlanDetails): Promise<void> {
    await this.step('Verify quick move-in homes section', async () => {
      const qmiSection = await this.availableHomesSection();
      const viewAllQMIButton = this.viewAllQmiButton(qmiSection);
      const qmiHomeslist = this.qmiHomeLinks(qmiSection);

      await expect(qmiSection).toBeVisible();

      if (plan.qmiHeadline) {
        await expect(qmiSection.getByText(plan.qmiHeadline, { exact: false })).toBeVisible();
      }

      await expect(viewAllQMIButton).toBeVisible();
      await expect(viewAllQMIButton).toHaveAttribute('href', /productType=qmi/i);
      expect(await qmiHomeslist.count()).toBeGreaterThan(0);
    });
  }

  /** Checks that quick move-in homes section is visible when present. */
  async verifyQuickMoveInHomesSection(): Promise<void> {
    await this.step('Verify quick move-in homes section present', async () => {
      const qmiSection = await this.availableHomesSection();

      if (await isLocatorVisible(qmiSection)) {
        await qmiSection.scrollIntoViewIfNeeded();
        await expect(qmiSection).toBeVisible();
        await expect(this.viewAllQmiButton(qmiSection)).toBeVisible();

        const qmiCount = await this.qmiHomeLinks(qmiSection).count();
        if (qmiCount === 0) {
          await this.reportValue('QMI section has no home cards - skipping card validation');
          return;
        }

        expect(qmiCount).toBeGreaterThan(0);
      } else {
        await this.reportValue('QMI section not present - skipping validation');
      }
    });
  }

  /** Checks that sales office content matches configured plan details. */
  async verifySalesOffice(plan: PlanDetails): Promise<void> {
    await this.step('Verify sales office details', async () => {
      await expect(this.page.getByText(/^Sales Office$/i)).toBeVisible();

      if (plan.salesOffice) {
        await expect(this.page.getByText(plan.salesOffice.address)).toBeVisible();
        await expect(
          this.page.getByText(plan.salesOffice.cityStateZip, {
            exact: false,
          }),
        ).toBeVisible();
        await expect(this.page.getByText(plan.salesOffice.phone)).toBeVisible();
      }
    });
  }

  /** Checks that sales office section is visible when present. */
  async verifySalesOfficeSection(): Promise<void> {
    await this.step('Verify sales office section', async () => {
      const salesOfficeTitle = this.page.getByText(/^Sales Office$/i).first();

      if (await isLocatorVisible(salesOfficeTitle)) {
        await salesOfficeTitle.scrollIntoViewIfNeeded();
        await expect(salesOfficeTitle).toBeVisible();
        await expect(this.page.locator('body')).toContainText(/Hours|Open|Closed|Office/i);
      } else {
        await this.reportValue('Sales Office section not present - skipping validation');
      }
    });
  }

  /** Get the visible plan modal form with a submit button when available. */
  private async getAvailableForm(
    formIndex = 0,
    formName = 'Get Information plan detail side modal form',
  ): Promise<Locator | null> {
    const form = await this.openSideModalForm(formName, formIndex);
    const submitButton = getSubmitButton(form);

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(
      submitButton,
      `${formName} submit button should be visible inside sidebar/modal`,
    ).toBeVisible({ timeout: 10000 });

    return form;
  }

  /** open the Get Information side modal form and return the visible container by index. */
  private async openSideModalForm(
    formName = 'Get Information plan detail side modal form',
    formIndex = 0,
  ): Promise<Locator> {
    return this.openSideModalFormByIndex({
      leadForms: this.leadFormDialogOrSidebar,
      formName,
      pageLabel: 'plan detail page',
      formIndex,
    });
  }

  /** verify required side modal form fields. */
  private async verifySideModalFormFieldsByIndex(
    formIndex: number,
    formName: string,
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await expectSideModalFormFields(form, { timeout: 10000 });
  }

  /** submit an empty form and verify required-field errors. */
  private async validateEmptyFormErrorsByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await clickSubmit(this.page, form, 10000);
    await expectRequiredErrorsInForm(form, 10000);
  }

  /** submit invalid email address data and verify email validation errors. */
  private async validateInvalidEmailByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await fillInvalidSideModalForm(form, 'planDetail');
    await clickSubmit(this.page, form, 10000);
    await expectInvalidEmailErrorInForm(form, 10000);
  }

  /** fill and submit a valid form selected by index. */
  private async submitSuccessfulFormByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await fillValidSideModalForm(form, 'planDetail');
    await this.submitLeadFormAndCaptureApi({
      formName,
      submitButton: getSubmitButton(form),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage,
    });
  }

  /** Checks that the Get Information CTA opens the plan detail side modal form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      const form = await this.openSideModalForm('Get Information plan detail side modal form');

      if (!form) {
        return;
      }

      await expect(
        form,
        'Get Information plan detail side modal form should be visible',
      ).toBeVisible({ timeout: 10000 });
    });
  }

  /** Checks that plan detail side modal form fields are visible. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Verify plan detail form fields', async () => {
      await this.verifySideModalFormFieldsByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Checks that plan detail side modal form shows empty required-field errors. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Validate plan detail form empty errors', async () => {
      await this.validateEmptyFormErrorsByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Checks that plan detail side modal form rejects invalid email addresses. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate plan detail form invalid email', async () => {
      await this.validateInvalidEmailByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Checks that plan detail side modal form can be submitted successfully. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit plan detail form successfully', async () => {
      await this.submitSuccessfulFormByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Open the floating-CTA side modal lead form and return it (for external evidence capture). */
  async openSideModalLeadForm(
    formName = 'Get Information plan detail side modal form',
  ): Promise<Locator> {
    const form = await this.getAvailableForm(0, formName);

    if (!form) {
      throw new Error(`${formName} did not open`);
    }

    return form;
  }
}
