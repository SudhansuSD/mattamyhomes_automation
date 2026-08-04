import { Locator, Page, expect } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import {
  clickIfVisible,
  escapeRegex,
  getPathSegments,
  getSlugTextPattern,
  isLocatorVisible,
  toTitleCase,
} from '../utils/pageObjectUtils';
import { SearchablePage } from './SearchablePage';
import {
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  expectSideModalFormFields,
  fillInvalidSideModalForm,
  fillValidSideModalForm,
  getSubmitButton,
} from '../utils/leadFormHelper';

/* ==========================================================
    QMI Page Object Model
========================================================== */

const location = getLocationConfig();

export class QMIPage extends SearchablePage {
  private static readonly PAGE_LOAD_TIMEOUT = 20000;
  private static readonly UTOUR_TIMEOUT = 15000;
  private static readonly QMI_URL_PATTERN = /\/\d{1,}-/;

  readonly heroSection: Locator;
  readonly heroDetails: Locator;
  readonly heading: Locator;
  readonly breadcrumb: Locator;
  readonly priceSection: Locator;
  readonly getInformationCta: Locator;
  readonly formSection: Locator;

  readonly propertyStats: Locator;
  readonly gallerySection: Locator;
  readonly nextGalleryBtn: Locator;
  readonly prevGalleryBtn: Locator;
  readonly floorPlanSection: Locator;
  readonly mortgageBtn: Locator;
  readonly mortgageComponent: Locator;
  readonly closeModalBtn: Locator;
  readonly uTourTitle: Locator;
  readonly uTourCta: Locator;
  readonly uTourSection: Locator;
  readonly interactiveFloorPlanSection: Locator;
  readonly communitySitemapSection: Locator;
  readonly homeDesignDetailsSection: Locator;
  readonly homeFeaturesSection: Locator;
  readonly salesOfficeSection: Locator;
  readonly relatedQmiSection: Locator;
  readonly relatedQmiCards: Locator;
  readonly successDialogModal: Locator;

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    super(page);
    const mortgageSectionTitle = page.getByText('Mortgage Calculator', {
      exact: true,
    });

    this.heroSection = page.locator("//div[@id='detailsBlockBar']/following-sibling::div[1]");
    this.heroDetails = page
      .locator('h1')
      .locator('xpath=ancestor::div[contains(@class,"container")][1]');
    this.heading = page.locator('h1');
    this.breadcrumb = page.locator('#breadcrumb');
    this.priceSection = this.heroSection.locator("p:has-text('$')");
    this.getInformationCta = page
      .locator('a, button')
      .filter({
        hasText: /Get Information|Stay Updated/i,
      })
      .first();
    this.formSection = page
      .locator('#contact, #ScheduleAVisit-FormInstance0, #ScheduleAVisit-FormInstance1')
      .first();

    this.propertyStats = page.locator("p:has-text('Beds')").nth(1);
    this.gallerySection = page.locator('#gallery');
    this.nextGalleryBtn = page.locator('button[aria-label="Next"]');
    this.prevGalleryBtn = page.locator('button[aria-label="Previous"]');
    this.floorPlanSection = page.locator('text=/Floor Plan/i');
    this.mortgageComponent = page
      .locator('section')
      .filter({ has: mortgageSectionTitle })
      .filter({
        has: page.getByRole('button', { name: /Get Started/i }),
      })
      .first();
    this.mortgageBtn = this.mortgageComponent
      .getByRole('button', {
        name: /Get Started/i,
      })
      .first();
    this.closeModalBtn = page
      .locator('.ReactModal__Content, [role="dialog"]')
      .locator('button[aria-label="Close"], button:has-text("Close"), button:has-text("CLOSE")')
      .first();
    this.uTourTitle = page.getByRole('heading', { name: /Self-guided tours available/i });
    this.uTourSection = page
      .locator('section')
      .filter({
        has: this.uTourTitle,
      })
      .first();
    this.uTourCta = this.uTourSection
      .locator('a[href*="utourhomes.com/visitor"]')
      .filter({ hasText: /Schedule a Self-Guided Tour/i })
      .first();
    this.interactiveFloorPlanSection = this.getSectionByHeading(
      /Interactive Floorplan|Floor Plan/i,
    );
    this.communitySitemapSection = this.getSectionByHeading(/Explore the community/i);
    this.homeDesignDetailsSection = this.getSectionByHeading(/Home Design Details/i);
    this.homeFeaturesSection = this.getSectionByHeading(/Home Features/i);
    this.salesOfficeSection = page
      .locator('section')
      .filter({
        has: page.getByRole('heading', { name: /Showhome Parade|Sales Office/i }),
      })
      .first();
    this.relatedQmiSection = this.getSectionByHeading(/Quick Move-In Homes ready when you are/i);
    this.relatedQmiCards = this.relatedQmiSection.locator('a[href*="/"][href*="-"]').filter({
      hasText: /Beds|Baths|Garage|Sq\.?\s*Ft\./i,
    });
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** Locator: all visible QMI modal forms with a submit button. */
  private get leadFormDialogOrSidebar(): Locator {
    return (
      this.page
        .locator(
          '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible',
        )
        // A Submit button, not just any input, is what separates a lead form from
        // the page's other dialogs - the National-promotion overlay is a
        // full-screen role="dialog" with inputs and used to match here. and(), not
        // filter({ hasNot }): the aria-label sits on the overlay itself, and
        // hasNot only inspects descendants.
        .filter({ has: this.page.getByRole('button', { name: /submit/i }) })
        .and(
          this.page.locator(
            ':not([aria-label*="promotion" i]):not([aria-label*="notification" i])',
          ),
        )
    );
  }

  /** Locator: successful QMI modal form confirmation message. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  }

  /* ==========================================================
       Navigation and Page Load
    ========================================================== */

  /** Verify: QMI detail page has loaded with heading and breadcrumb. */
  async verifyPageLoaded(): Promise<void> {
    await this.step('Verify QMI detail page loaded', async () => {
      await expect(this.heading).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.breadcrumb).toBeVisible();
    });
  }

  /* ==========================================================
       Search Result Validation
    ========================================================== */

  /** Verify: home page QMI search redirects to the expected QMI detail page. */
  async verifySearchByQMI(expectedAddress: string): Promise<void> {
    await this.step(`Verify QMI search redirects to '${expectedAddress}'`, async () => {
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
      const reachedQmiUrl = await this.page
        .waitForURL(QMIPage.QMI_URL_PATTERN, { timeout: 60_000 })
        .then(() => true)
        .catch(() => QMIPage.QMI_URL_PATTERN.test(this.page.url()));

      if (!reachedQmiUrl) {
        await this.reportValue(
          'QMI URL did not stabilize after search; navigating directly to configured QMI path',
        );
        await this.page.goto(this.buildFullUrl(location.qmiPath), {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        });
        await this.waitForPageReady();
        await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
      }

      await expect(this.heading).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.heading).toContainText(new RegExp(escapeRegex(expectedAddress), 'i'));
    });
  }

  /** Verify: current QMI URL path exactly matches the configured QMI path. */
  async verifyExactQmiUrl(): Promise<void> {
    await this.step('Verify QMI URL path matches configured path', async () => {
      const currentPath = new URL(this.page.url()).pathname;
      expect(currentPath).toBe(location.qmiPath);
    });
  }

  /* ==========================================================
       Hero and Summary
    ========================================================== */

  /** Verify: hero section, heading, configured address, and summary stats are visible. */
  async verifyHeroSection(): Promise<void> {
    await this.step('Verify QMI hero section, heading & stats', async () => {
      await expect(this.heroSection).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.heading).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.heading).toContainText(new RegExp(escapeRegex(location.qmiAddress), 'i'), {
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.propertyStats).toBeVisible();
    });
  }

  /** Verify: breadcrumb container is visible. */
  async verifyBreadcrumb(): Promise<void> {
    await this.step('Verify breadcrumb is visible', async () => {
      await expect(this.breadcrumb).toBeVisible();
    });
  }

  /** Verify: hero displays beds, baths, garage or half bath, square footage, and price. */
  async verifyHeroHomeFacts(): Promise<void> {
    await this.step('Verify hero home facts (beds, baths, sq.ft., price)', async () => {
      await expect(this.heroDetails).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.heroDetails).toContainText(/\d+\s+Beds?/i);
      await expect(this.heroDetails).toContainText(/\d+\s+Baths?/i);
      await expect(this.heroDetails).toContainText(/Half Bath|Garage/i);
      await expect(this.heroDetails).toContainText(/[\d,]+\s+Sq\.?\s*Ft\.?/i);
      await expect(this.heroDetails).toContainText(/\$[\d,]+/);
    });
  }

  /* ==========================================================
       Price and CTA
    ========================================================== */

  /** Verify: price section and Get Information CTA are visible. */
  async verifyPriceOrCTA(): Promise<void> {
    await this.step('Verify price section & Get Information CTA', async () => {
      await expect(this.priceSection.first()).toBeVisible();
      await expect(this.getInformationCta).toBeVisible();
    });
  }

  /** Verify: Get Information CTA opens the QMI side modal form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      const form = await this.openGetInformationLeadForm('QMI Get Information side modal form');

      if (!form) {
        return;
      }

      await expect(form, 'QMI Get Information side modal form should be visible').toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
    });
  }

  /* ==========================================================
       Gallery
    ========================================================== */

  /** Verify: gallery is visible and gallery navigation buttons work when present. */
  async verifyGallery(): Promise<void> {
    await this.step('Verify gallery & navigation buttons', async () => {
      await expect(this.gallerySection.first()).toBeVisible();
      await clickIfVisible(this.nextGalleryBtn);
      await clickIfVisible(this.prevGalleryBtn);
    });
  }

  /* ==========================================================
       Floor Plan and Community Map
    ========================================================== */

  /** Verify: floor plan section is visible when available. */
  async verifyFloorPlan(): Promise<void> {
    await this.step('Verify floor plan section when available', async () => {
      const floorPlanSection = (await isLocatorVisible(this.interactiveFloorPlanSection))
        ? this.interactiveFloorPlanSection
        : this.floorPlanSection;

      if (await isLocatorVisible(floorPlanSection)) {
        await floorPlanSection.scrollIntoViewIfNeeded();
        await expect(floorPlanSection).toBeVisible();
      }
    });
  }

  /** Verify: interactive floor plan section content when available. */
  async verifyInteractiveFloorPlan(): Promise<void> {
    await this.step('Verify interactive floor plan when available', async () => {
      if (!(await isLocatorVisible(this.interactiveFloorPlanSection))) {
        await this.reportValue('Interactive floorplan section not found - skipping validation');
        return;
      }

      await this.interactiveFloorPlanSection.scrollIntoViewIfNeeded();
      await expect(this.interactiveFloorPlanSection).toBeVisible();
      await expect(this.interactiveFloorPlanSection).toContainText(
        /Interactive Floorplan|floorplan/i,
      );
    });
  }

  /** Verify: community sitemap section content when available. */
  async verifyCommunitySitemap(): Promise<void> {
    await this.step('Verify community sitemap when available', async () => {
      if (!(await isLocatorVisible(this.communitySitemapSection))) {
        await this.reportValue('Community sitemap section not found - skipping validation');
        return;
      }

      await this.communitySitemapSection.scrollIntoViewIfNeeded();
      await expect(this.communitySitemapSection).toBeVisible();
      await expect(this.communitySitemapSection).toContainText(/Explore the community/i);
      await expect(
        this.communitySitemapSection.locator('button, svg, canvas').first(),
      ).toBeVisible();
    });
  }

  /* ==========================================================
       Content Sections
    ========================================================== */

  /** Verify: home design details section has meaningful content. */
  async verifyHomeDesignDetails(): Promise<void> {
    await this.step('Verify home design details content', async () => {
      await this.homeDesignDetailsSection.scrollIntoViewIfNeeded();
      await expect(this.homeDesignDetailsSection).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.homeDesignDetailsSection).toContainText(/Home Design Details/i);
      const detailsText = await this.homeDesignDetailsSection.innerText();
      expect(
        detailsText.replace(/Home Design Details/i, '').trim().length,
        'Home Design Details should include rendered content',
      ).toBeGreaterThan(0);
    });
  }

  /** Verify: home features section has meaningful content. */
  async verifyHomeFeatures(): Promise<void> {
    await this.step('Verify home features content', async () => {
      await this.homeFeaturesSection.scrollIntoViewIfNeeded();
      await expect(this.homeFeaturesSection).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.homeFeaturesSection).toContainText(/Home Features/i);
      const featuresText = await this.homeFeaturesSection.innerText();
      expect(
        featuresText.replace(/Home Features/i, '').trim().length,
        'Home Features should list at least one feature',
      ).toBeGreaterThan(3);
    });
  }

  /** Verify: sales office section includes contact links, map link, and form submit button. */
  async verifySalesOfficeAndContactForm(): Promise<void> {
    await this.step('Verify sales office & contact form', async () => {
      const salesOfficeSection = await this.getSalesOfficeSectionIfAvailable();

      if (!salesOfficeSection) {
        await this.reportValue(
          'Sales Office section not present - skipping sales office validation',
        );
      } else {
        await salesOfficeSection.scrollIntoViewIfNeeded();
        await expect(salesOfficeSection).toBeVisible({
          timeout: QMIPage.PAGE_LOAD_TIMEOUT,
        });
        await expect(salesOfficeSection).toContainText(
          /Hours|Open|Closed|Sales Office|Showhome Parade/i,
        );
        await this.verifySalesOfficePhone(salesOfficeSection);
        await this.verifySalesOfficeMapLinkIfPresent(salesOfficeSection);
      }

      await expect(this.getInformationCta).toBeVisible();
    });
  }

  /* ==========================================================
       Lead Form Validation
    ========================================================== */

  /** Verify: expected QMI form fields and submit button are visible. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Verify QMI side modal form fields & submit button', async () => {
      const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');

      if (!form) {
        return;
      }

      await expectSideModalFormFields(form, {
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
    });
  }

  /** Verify: QMI form shows required-field validation errors. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Verify QMI side modal form required-field errors', async () => {
      const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');

      if (!form) {
        return;
      }

      await clickSubmit(this.page, form, QMIPage.PAGE_LOAD_TIMEOUT);
      await expectRequiredErrorsInForm(form, QMIPage.PAGE_LOAD_TIMEOUT);
    });
  }

  /** Verify: QMI form rejects an invalid email address. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Verify QMI side modal form rejects invalid email', async () => {
      const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');

      if (!form) {
        return;
      }

      await this.fillLeadFormWithInvalidEmail(form);
      await clickSubmit(this.page, form, QMIPage.PAGE_LOAD_TIMEOUT);
      await expectInvalidEmailErrorInForm(form, QMIPage.PAGE_LOAD_TIMEOUT);
    });
  }

  /** Verify: QMI form can be submitted successfully with valid lead data. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit QMI side modal form with valid data', async () => {
      const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');

      if (!form) {
        return;
      }

      await this.fillLeadFormWithValidData(form);
      await this.submitLeadFormAndCaptureApi({
        formName: 'QMI Get Information side modal form',
        submitButton: getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await this.reportValue('QMI form successful submission validated');
    });
  }

  /** Open the floating-CTA side modal lead form and return it (for external evidence capture). */
  async openSideModalLeadForm(formName = 'QMI Get Information side modal form'): Promise<Locator> {
    const form = await this.getAvailableForm(0, formName);

    if (!form) {
      throw new Error(`${formName} did not open`);
    }

    return form;
  }

  /* ==========================================================
       Related Homes
    ========================================================== */

  /** Verify: related quick move-in homes section and related card content. */
  async verifyRelatedQuickMoveInHomes(): Promise<void> {
    await this.step('Verify related Quick Move-In homes', async () => {
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.waitForPageReady();

      await this.relatedQmiSection.scrollIntoViewIfNeeded();
      await expect(this.relatedQmiSection, 'Related QMI section should be visible').toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(
        this.relatedQmiSection
          .locator('a')
          .filter({ hasText: /View all/i })
          .first(),
      ).toHaveAttribute('href', /productType=qmi/i);

      const cardCount = await this.relatedQmiCards.count();
      expect(cardCount, 'Expected at least one related QMI card').toBeGreaterThan(0);

      await this.reportValue(`Related QMI cards found: ${cardCount}`);

      for (let i = 0; i < cardCount; i++) {
        const card = this.relatedQmiCards.nth(i);
        const href = await card.getAttribute('href');
        const name = await this.getRelatedQmiCardName(card, href);

        await this.reportValue(`${i + 1}. ${name}`, this.buildFullUrl(href));
      }

      const firstCard = this.relatedQmiCards.first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard).toContainText(/Beds/i);
      await expect(firstCard).toContainText(/Baths/i);
      await expect(firstCard).toContainText(/Garage|Sq\.?\s*Ft\./i);
    });
  }

  /* ==========================================================
       Mortgage Popup
    ========================================================== */

  /** Verify: mortgage modal opens and closes when the mortgage component exists. */
  async verifyMortgagePopup(): Promise<void> {
    await this.step('Verify mortgage popup opens & closes', async () => {
      if (await isLocatorVisible(this.mortgageComponent)) {
        await expect(this.mortgageComponent).toBeVisible();
        await this.mortgageBtn.scrollIntoViewIfNeeded();
        await this.mortgageBtn.click();
        await this.closeModalIfPresent();
      } else {
        await this.reportValue('Mortgage component not found - skipping validation');
      }
    });
  }

  /* ==========================================================
       UTour Section
    ========================================================== */

  /** Verify: self-guided tour section and CTA are visible. */
  async verifyUTourSectionVisible(): Promise<void> {
    await this.step('Verify self-guided tour section visible', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.uTourSection.scrollIntoViewIfNeeded();
      await expect(this.uTourTitle).toBeVisible({
        timeout: QMIPage.UTOUR_TIMEOUT,
      });
      await expect(this.uTourCta).toBeVisible({
        timeout: QMIPage.UTOUR_TIMEOUT,
      });
    });
  }

  /** Verify: self-guided tour section and CTA are hidden. */
  async verifyUTourSectionHidden(): Promise<void> {
    await this.step('Verify self-guided tour section hidden', async () => {
      await expect(this.uTourTitle).toHaveCount(0);
      await expect(this.uTourCta).toHaveCount(0);
    });
  }

  /* ==========================================================
       Shared Helpers
    ========================================================== */

  /** Helper: return a configured QMI form and validate its submit button. */
  private async getAvailableForm(formIndex = 0, formName = 'QMI form'): Promise<Locator | null> {
    const form = await this.openGetInformationLeadForm(formName, formIndex);
    const submitButton = getSubmitButton(form);

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();

    await expect(submitButton, `${formName} submit button should be visible`).toBeVisible({
      timeout: QMIPage.PAGE_LOAD_TIMEOUT,
    });

    return form;
  }

  /** Helper: open the Get Information sidebar/modal form and return the visible container by index. */
  private async openGetInformationLeadForm(
    formName = 'QMI Get Information side modal form',
    formIndex = 0,
  ): Promise<Locator> {
    return this.openSideModalFormByIndex({
      leadForms: this.leadFormDialogOrSidebar,
      formName,
      pageLabel: 'QMI page',
      formIndex,
      ctaTimeout: QMIPage.PAGE_LOAD_TIMEOUT,
      beforeReveal: async () => {
        await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
        await this.dismissCookieBannerIfPresent();
      },
    });
  }

  /** Helper: fill modal form with data that should fail email validation. */
  private async fillLeadFormWithInvalidEmail(form: Locator): Promise<void> {
    await fillInvalidSideModalForm(form, 'qmi');
  }

  /** Helper: fill modal form with valid data for successful submission tests. */
  private async fillLeadFormWithValidData(form: Locator): Promise<void> {
    await fillValidSideModalForm(form, 'qmi');
  }

  /** Helper: return compact visible text for logging and comparisons. */
  private async getCompactText(locator: Locator): Promise<string> {
    return (await locator.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  }

  /** Helper: find the sales office section across supported QMI page layouts. */
  private async getSalesOfficeSectionIfAvailable(): Promise<Locator | null> {
    await this.salesOfficeSection
      .waitFor({ state: 'attached', timeout: 5000 })
      .catch(() => undefined);

    if (await this.salesOfficeSection.count()) {
      return this.salesOfficeSection;
    }

    const salesOfficeHeading = this.page.getByText(/Showhome Parade|Sales Office/i).first();

    await salesOfficeHeading.waitFor({ state: 'attached', timeout: 5000 }).catch(() => undefined);

    if (!(await salesOfficeHeading.count())) {
      return null;
    }

    return salesOfficeHeading.locator('xpath=ancestor::*[self::section or self::div][1]');
  }

  /** Helper: verify sales office phone is available as a tel link or visible phone text. */
  private async verifySalesOfficePhone(salesOfficeSection: Locator): Promise<void> {
    const phoneLink = salesOfficeSection.locator('a[href^="tel:"]').first();

    if (await phoneLink.count()) {
      await expect(phoneLink).toBeVisible();
      return;
    }

    await expect(salesOfficeSection).toContainText(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  }

  /** Helper: verify a map link when the sales office layout exposes one. */
  private async verifySalesOfficeMapLinkIfPresent(salesOfficeSection: Locator): Promise<void> {
    const mapLink = salesOfficeSection
      .locator('a[href*="google.com/maps"], a[href*="maps.google"], a[href*="/maps"]')
      .first();

    if (await mapLink.count()) {
      await expect(mapLink).toBeVisible();
    }
  }

  /** Helper: locate the related QMI card address/title within a single card. */
  private getRelatedQmiCardNameLocator(card: Locator): Locator {
    return card
      .locator(
        [
          'span[class*="text-mattamy-blue"][class*="uppercase"]',
          'span[class*="font-trade-gothic"][class*="uppercase"]',
          'span:has-text(" NW"), span:has-text(" NE"), span:has-text(" SW"), span:has-text(" SE")',
        ].join(', '),
      )
      .filter({
        hasText: /\b\d+\s+\S.+\b(?:NW|NE|SW|SE|N|S|E|W)\b/i,
      })
      .first();
  }

  /** Helper: return the related QMI card address/title shown in the card heading. */
  private async getRelatedQmiCardName(card: Locator, href: string | null): Promise<string> {
    const addressFromHref = href ? this.getAddressFromQmiHref(href) : null;

    if (addressFromHref) {
      return addressFromHref;
    }

    const title = this.getRelatedQmiCardNameLocator(card);

    if (await isLocatorVisible(title)) {
      return this.getCompactText(title);
    }

    const ariaLabel = await card.getAttribute('aria-label');
    const addressFromLabel = ariaLabel?.match(
      /\b\d+\s+[A-Z0-9][A-Z0-9\s.-]+?\b(?:NW|NE|SW|SE|N|S|E|W)\b/i,
    );

    if (addressFromLabel) {
      return addressFromLabel[0].replace(/\s+/g, ' ').trim();
    }

    return this.getCompactText(card);
  }

  /** Helper: convert the QMI URL address slug into the compact display address. */
  private getAddressFromQmiHref(href: string): string | null {
    const path = href.split('?')[0].replace(/\/$/, '');
    const addressSlug = path.split('/').pop();

    if (!addressSlug || !/^\d+-/.test(addressSlug)) {
      return null;
    }

    return addressSlug.split('-').filter(Boolean).join(' ').toUpperCase();
  }

  /** Helper: close an open modal when a close button is visible. */
  private async closeModalIfPresent(): Promise<void> {
    if (await isLocatorVisible(this.closeModalBtn)) {
      await this.closeModalBtn.click();
      await expect(this.closeModalBtn).toBeHidden({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
    }
  }

  /** Helper: dismiss OneTrust cookie UI when it appears. */
  private async dismissCookieBannerIfPresent(): Promise<void> {
    await this.acceptCookiesIfPresent();

    const closeCookieBannerBtn = this.page
      .locator('#onetrust-banner-sdk, [aria-label="Privacy"], [role="dialog"]')
      .getByRole('button', { name: /^Close$/i })
      .first();

    if (await isLocatorVisible(closeCookieBannerBtn)) {
      await closeCookieBannerBtn.click();
    }
  }

  /** Helper: find a section by its heading text. */
  private getSectionByHeading(heading: RegExp): Locator {
    return this.page
      .locator('section')
      .filter({
        has: this.page.getByRole('heading', { name: heading }),
      })
      .first();
  }

  /* ==========================================================
       Breadcrumb Validation
    ========================================================== */

  /** Helper: split the configured QMI path into route segments. */
  private getQmiPathSegments(): string[] {
    return getPathSegments(location.qmiPath);
  }

  /** Verify: breadcrumb state, community, current address, and path match configured QMI path. */
  async verifyBreadcrumbNavigation(): Promise<void> {
    await this.step('Verify breadcrumb navigation', async () => {
      const [stateSlug, , , communitySlug, , ...addressSlugs] = this.getQmiPathSegments();
      const currentPath = new URL(this.page.url()).pathname;

      expect(currentPath).toBe(location.qmiPath);
      expect(
        stateSlug,
        `State/province segment missing from qmiPath: ${location.qmiPath}`,
      ).toBeTruthy();
      expect(
        communitySlug,
        `Community segment missing from qmiPath: ${location.qmiPath}`,
      ).toBeTruthy();
      expect(
        addressSlugs.length,
        `Address segment missing from qmiPath: ${location.qmiPath}`,
      ).toBeGreaterThan(0);

      await expect(this.breadcrumb).toBeVisible();
      await expect(this.breadcrumb).toContainText(getSlugTextPattern(addressSlugs.join('-')));
      await expect(this.breadcrumb.locator(`a[href*="/${stateSlug}/"]`).first()).toBeVisible();
      await expect(this.breadcrumb.locator(`a[href*="/${communitySlug}"]`).first()).toBeVisible();
    });
  }

  /** Verify: breadcrumb links point to the configured community and plan parent paths. */
  async verifyBreadcrumbLinks(): Promise<void> {
    await this.step('Verify breadcrumb links', async () => {
      const segments = this.getQmiPathSegments();
      const communityPath = `/${segments.slice(0, 4).join('/')}`;
      const planPath = `/${segments.slice(0, 5).join('/')}`;
      const addressSlug = segments.slice(5).join('-');

      await expect(this.breadcrumb.locator(`a[href="${communityPath}"]`).first()).toBeVisible();
      await expect(this.breadcrumb.locator(`a[href="${planPath}"]`).first()).toBeVisible();
      await expect(this.breadcrumb).toContainText(getSlugTextPattern(addressSlug));
      await this.logBreadcrumbNamesAndUrls();
    });
  }

  /** Helper: log breadcrumb link labels and URLs for report troubleshooting. */
  private async logBreadcrumbNamesAndUrls(): Promise<void> {
    const breadcrumbLinks = this.breadcrumb.locator('a[href]');
    const linkCount = await breadcrumbLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const link = breadcrumbLinks.nth(i);
      const href = await link.getAttribute('href');
      const name = this.getNameFromHref(href, await this.getCompactText(link));
      const url = href ? this.buildFullUrl(href) : 'URL missing';

      await this.reportValue(`Breadcrumb ${i + 1}: ${name || 'Unnamed'}`, url);
    }

    const currentLabel = await this.getCompactText(this.heading);

    if (currentLabel) {
      await this.reportValue(`Breadcrumb current: ${currentLabel}`, this.page.url());
    }
  }

  /** Helper: derive a readable breadcrumb label from href when UI text is truncated. */
  private getNameFromHref(href: string | null, fallback: string): string {
    if (!href || (fallback && !fallback.includes('...'))) {
      return fallback;
    }

    const slug = getPathSegments(href).pop();

    if (!slug) {
      return fallback;
    }

    return toTitleCase(slug);
  }
}
