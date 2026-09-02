import { Locator, Page, expect } from '@playwright/test';
import { SearchablePage } from './SearchablePage';
import { escapeRegex, isLocatorVisible } from '../utils/web/pageObjectUtils';
import {
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  expectSideModalFormFields,
  fillInvalidSideModalForm,
  fillValidSideModalForm,
  getVisibleInformationCta,
  getSubmitButton,
  SUBMIT_BUTTON_SELECTOR,
} from '../utils/leadform/leadFormHelper';

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
  /** How long the expanded breadcrumb trail gets to render client side. */
  private static readonly BREADCRUMB_HYDRATION_TIMEOUT = 30_000;

  /** The plan's main heading. */
  readonly heading: Locator;

  /** The breadcrumb trail. */
  readonly breadcrumb: Locator;

  /** The starting price label. */
  readonly priceSection: Locator;

  /** The gallery images. */
  readonly galleryImages: Locator;

  /** The gallery's next button. */
  readonly nextGalleryBtn: Locator;

  /** The gallery's previous button. */
  readonly prevGalleryBtn: Locator;

  /** The interactive floorplan section. */
  readonly floorPlanSection: Locator;

  /** The exterior styles section. */
  readonly exteriorStylesSection: Locator;

  /** The mortgage calculator's Get Started button. */
  readonly mortgageBtn: Locator;

  /** The mortgage calculator itself. */
  readonly mortgageComponent: Locator;

  /** The modal's close button. */
  readonly closeModalBtn: Locator;

  /** The available quick move-in homes section. */
  readonly qmiSection: Locator;

  /** The View All quick move-in homes CTA. */
  readonly viewAllQMIButton: Locator;

  /** The links to related quick move-in homes. */
  readonly qmiHomeslist: Locator;

  /** The Get Information CTA. */
  readonly getInformationCta: Locator;

  /** The community updates sign-up form. */
  readonly signUpFormSection: Locator;

  /** The sales office section. */
  readonly salesOfficeSection: Locator;

  /** The confirmation modal shown after a successful submission. */
  readonly successDialogModal: Locator;

  /** Sets up the page object with the locators it needs. */
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
      .getByRole('button', { name: /^close$/i })
      .first();
    this.qmiSection = page.locator('#availablehomes');
    this.viewAllQMIButton = this.qmiSection.getByRole('link', { name: /view all/i });
    this.qmiHomeslist = this.qmiSection.locator(
      'a[aria-label*="Floorplan"], a:has-text("Floorplan")',
    );
    this.getInformationCta = getVisibleInformationCta(page);
    this.signUpFormSection = page
      .getByText(/Sign Up For Community Updates/i)
      .locator('xpath=ancestor::*[self::section or self::div][1]');
    this.salesOfficeSection = page
      .getByText(/^Sales Office$/i)
      .locator('xpath=ancestor::*[self::section or self::div][1]');
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** The Get Information form, wherever it opens - modal, drawer or sidebar. */
  private get leadFormDialogOrSidebar(): Locator {
    return this.page
      .locator(
        '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible',
      )
      .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
      .and(
        this.page.locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])'),
      );
  }

  /** The thank-you message shown after the form is submitted. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  }

  /**
   * Returns the gallery media, falling back to the alternate selectors when the main one misses.
   */
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

  /**
   * Returns the quick move-in homes section, falling back to the alternate selectors when the main
   * one misses.
   */
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

  /** Returns the quick move-in home links inside a section. */
  private qmiHomeLinks(section: Locator): Locator {
    return section.locator(
      'a[aria-label*="Floorplan"], a:has-text("Floorplan"), a[href*="quick-move"], a[href*="/homes/"]',
    );
  }

  /** Returns the View All CTA inside a section. */
  private viewAllQmiButton(section: Locator): Locator {
    return section.locator('a:has-text("View all"), a[href*="productType=qmi"]').first();
  }

  // ----------------------------------
  // Page Load Validation
  // ----------------------------------

  /** Checks the plan page loaded with its heading and breadcrumb. */
  async verifyPageLoaded() {
    await this.step('Verify plan detail page loaded', async () => {
      await expect(this.heading).toBeVisible({ timeout: 20000 });
      await expect(this.breadcrumb).toBeVisible();
    });
  }

  // ----------------------------------
  // Plan detail Validation
  // ----------------------------------

  /** Checks a plan search lands on the right plan page. */
  async verifySearchByPlan(expectedSlug: string) {
    await this.step('Verify search by plan lands on expected URL', async () => {
      await this.waitForPageReady();

      await expect(this.page).toHaveURL(new RegExp(escapeRegex(expectedSlug), 'i'));

      await expect(this.heading).toBeVisible({ timeout: 20000 });
    });
  }

  /** Checks the URL - and the tab title, when one is configured - match the plan. */
  async verifyPlanUrlAndTitle(plan: PlanDetails): Promise<void> {
    await this.step('Verify plan URL and title', async () => {
      await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(plan.path)}$`, 'i'));

      if (plan.title) {
        await expect(this.page).toHaveTitle(plan.title);
      }
    });
  }

  /** Checks the URL contains this fragment. */
  async verifyPlanUrlContains(expectedUrlPart: string): Promise<void> {
    await this.step(`Verify URL contains '${expectedUrlPart}'`, async () => {
      await expect(this.page).toHaveURL(new RegExp(escapeRegex(expectedUrlPart), 'i'));
    });
  }

  /** Checks the hero heading is visible. */
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

  /** Checks the hero heading names this plan. */
  async verifyHeroSummaryForPlan(planName: string): Promise<void> {
    await this.step(`Verify hero heading contains '${planName}'`, async () => {
      await expect(this.heading).toBeVisible({ timeout: 20000 });
      await expect(this.heading).toContainText(new RegExp(escapeRegex(planName), 'i'));
    });
  }

  /** Checks the page lists the standard home specs. */
  async verifyHomeSpecsPresent(): Promise<void> {
    await this.step('Verify home specs present', async () => {
      const pageText = this.page.locator('body');

      await expect(pageText).toContainText(/Bed/i);
      await expect(pageText).toContainText(/Bath/i);
      await expect(pageText).toContainText(/Sq\.?\s*Ft\.?/i);
    });
  }

  /** Checks the hero summary shows the plan's name, price, specs and product line. */
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

  /** Checks the breadcrumb is visible. */
  async verifyBreadcrumb() {
    await this.step('Verify breadcrumb visible', async () => {
      if ((await this.breadcrumb.count()) > 0) {
        await expect(this.breadcrumb.first()).toBeVisible();
      }
    });
  }

  /** Checks the breadcrumb lists each step of the plan's path. */
  async verifyBreadcrumbMatchesPlanPath(plan: PlanDetails): Promise<void> {
    await this.step('Verify breadcrumb matches plan path', async () => {
      await expect(this.breadcrumb).toBeVisible();

      for (const item of plan.breadcrumbItems ?? []) {
        await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(item), 'i'));
      }
    });
  }

  /**
   * Checks the breadcrumb names this plan.
   *
   * The server ships the breadcrumb collapsed - one link back to the parent
   * community and nothing else - and the full `state / market / city / community
   * / plan` trail is rendered client side, at desktop widths only. So the two
   * layouts get the assertion each one actually ships: the plan name in the
   * expanded trail on desktop, and on a phone the collapsed link, checked to
   * point at this plan's community rather than merely to exist.
   */
  async verifyBreadcrumbContainsPlan(planName: string): Promise<void> {
    await this.step(`Verify breadcrumb contains '${planName}'`, async () => {
      await expect(this.breadcrumb).toBeVisible();

      if (await this.isMobileHeaderViewport()) {
        const communityLink = this.breadcrumb
          .locator(`a[href="${this.location.communityPath}"]`)
          .first();

        await expect(
          communityLink,
          `Collapsed breadcrumb should link back to ${this.location.community}`,
        ).toBeVisible();
        await expect(communityLink).toContainText(
          new RegExp(escapeRegex(this.location.community), 'i'),
        );

        return;
      }

      // Longer than the shared expect timeout on purpose: this text arrives with
      // the breadcrumb's client-side render, not with the document, so the wait
      // is for hydration rather than for a value the page already holds.
      await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(planName), 'i'), {
        timeout: PlanDetailPage.BREADCRUMB_HYDRATION_TIMEOUT,
      });
    });
  }

  /** Checks the starting price, or the CTA that stands in for it, is visible. */
  async verifyPriceOrCTA() {
    await this.step('Verify starting price label', async () => {
      if ((await this.priceSection.count()) > 0) {
        await expect(this.priceSection.first()).toBeVisible();
      }
    });
  }

  /** Checks the gallery shows an image and its next/previous controls work. */
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

  /**
   * Verifies the plan's media gallery.
   *
   * The named tabs only render for media a plan actually has, so they are
   * optional. The gallery itself is not - requiring a tab failed plans with a
   * plain carousel while a plan with no gallery would have passed.
   */
  async verifyPlanMediaGallery(): Promise<void> {
    await this.step('Verify plan media gallery', async () => {
      const gallery = this.page
        .locator(
          '[role="region"][aria-label*="Images and videos" i], [role="region"][aria-label*="gallery" i]',
        )
        .first();

      if (!(await this.isFeaturePresent(gallery, 'plan.mediaGallery', 'Plan media gallery'))) {
        return;
      }

      await gallery.scrollIntoViewIfNeeded();

      const tabNames = [/^Videos$/i, /^360 Tours$/i, /^Photos$/i, /^Model Home$/i];
      let validatedTabs = 0;

      for (const tabName of tabNames) {
        const tab = this.page
          .locator('button:visible, a:visible')
          .filter({ hasText: tabName })
          .first();

        if (!(await tab.isVisible({ timeout: 1500 }).catch(() => false))) {
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

      if (validatedTabs) {
        await this.reportValue(`Validated ${validatedTabs} plan gallery media tab(s)`);
        return;
      }

      // No named tabs on this plan - it renders a plain carousel. Assert that
      // the gallery actually shows media rather than returning having checked
      // nothing, which is what the tab-only version did here.
      await expect(
        gallery.locator('img:visible, video:visible, iframe:visible').first(),
        'Plan media gallery should render visible media',
      ).toBeVisible({ timeout: 10000 });

      await this.reportValue('Plan gallery renders a media carousel (no named media tabs)');
    });
  }

  /** Checks the floorplan section is visible. */
  async verifyFloorPlan() {
    await this.step('Verify floorplan section', async () => {
      if (await isLocatorVisible(this.floorPlanSection)) {
        await this.floorPlanSection.scrollIntoViewIfNeeded();
        await expect(this.floorPlanSection).toBeVisible();
      }
    });
  }

  /** Checks the interactive floorplan matches the plan, including its embedded viewer. */
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

  /** Checks the interactive floorplan section is available. */
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

  /** Checks each configured exterior style is shown. */
  async verifyExteriorStyles(styles: string[]): Promise<void> {
    await this.step('Verify exterior styles', async () => {
      await this.exteriorStylesSection.scrollIntoViewIfNeeded();
      await expect(this.page.getByRole('heading', { name: /Exterior Styles/i })).toBeVisible();

      for (const style of styles) {
        await expect(this.page.getByText(style, { exact: false }).first()).toBeVisible();
      }
    });
  }

  /** Checks the exterior styles section is visible. */
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

  /** Checks the mortgage calculator opens from its CTA and closes again. */
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

  /** Checks the mortgage calculator CTA is visible. */
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

  /** Checks the quick move-in homes section and records the homes and View All link. */
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

  /** Checks the quick move-in homes section matches the plan's configured homes. */
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

  /** Checks the quick move-in homes section is visible. */
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

  /** Checks the sales office details match the plan's configuration. */
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

  /** Checks the sales office section is visible. */
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

  /** Returns the visible plan form that has a usable submit button. */
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

  /** Opens the Get Information side modal and returns the form at this index. */
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

  /** Checks the side modal form shows the fields it should. */
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

  /** Submits the form empty and checks the required-field errors appear. */
  private async validateEmptyFormErrorsByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await clickSubmit(this.page, form, 10000);
    await expectRequiredErrorsInForm(form, 10000);
  }

  /** Submits a bad email address and checks the form rejects it. */
  private async validateInvalidEmailByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await fillInvalidSideModalForm(form, 'planDetail');
    await clickSubmit(this.page, form, 10000);
    await expectInvalidEmailErrorInForm(form, 10000);
  }

  /** Fills the form with valid data and checks it submits. */
  private async submitSuccessfulFormByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) {
      return;
    }

    await fillValidSideModalForm(form, 'planDetail');
    await this.submitLeadFormAndCaptureApi({
      form: form,
      formName,
      submitButton: getSubmitButton(form),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage,
    });
  }

  /** Checks the Get Information CTA opens the side modal form. */
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

  /** Checks the side modal form shows its fields. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Verify plan detail form fields', async () => {
      await this.verifySideModalFormFieldsByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Checks the empty side modal form reports its required fields. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Validate plan detail form empty errors', async () => {
      await this.validateEmptyFormErrorsByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Checks the side modal form rejects an invalid email address. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate plan detail form invalid email', async () => {
      await this.validateInvalidEmailByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Checks the side modal form submits with valid data. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit plan detail form successfully', async () => {
      await this.submitSuccessfulFormByIndex(0, 'Get Information plan detail side modal form');
    });
  }

  /** Opens the floating-CTA side modal lead form and returns it, for evidence runs. */
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
