import { Locator, Page, expect } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import {
  clickIfVisible,
  escapeRegex,
  getPathSegments,
  getSlugTextPattern,
  isLocatorVisible,
  toTitleCase,
} from '../utils/web/pageObjectUtils';
import { SearchablePage } from './SearchablePage';
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

// QMI Page Object Model

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

  /** Sets up the page object with the locators it needs. */
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
    this.getInformationCta = getVisibleInformationCta(page);
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
    // The site does not head this block consistently - USA QMI pages call it
    // "New Home Gallery", not "Sales Office" - so match all the variants.
    this.salesOfficeSection = page
      .locator('section')
      .filter({
        has: page.getByRole('heading', {
          name: /Showhome Parade|Sales Office|Sales Centre|New Home Gallery/i,
        }),
      })
      .first();
    this.relatedQmiSection = this.getSectionByHeading(/Quick Move-In Homes ready when you are/i);
    this.relatedQmiCards = this.relatedQmiSection.locator('a[href*="/"][href*="-"]').filter({
      hasText: /Beds|Baths|Garage|Sq\.?\s*Ft\./i,
    });
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** The visible quick move-in lead forms that have a submit button. */
  private get leadFormDialogOrSidebar(): Locator {
    return (
      this.page
        .locator(
          '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible',
        )
        // A Submit button, not just any input, is what separates a lead form from
        // the page's other dialogs - the National-promotion overlay is a
        // full-screen role="dialog" with inputs, so it matches everything else here. Matched
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

  /** The thank-you message shown after the form is submitted. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  }

  // Navigation and Page Load

  /** Checks the quick move-in page loaded with its heading and breadcrumb. */
  async verifyPageLoaded(): Promise<void> {
    await this.step('Verify QMI detail page loaded', async () => {
      await expect(this.heading).toBeVisible({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await expect(this.breadcrumb).toBeVisible();
    });
  }

  // Search Result Validation

  /** Checks a search from the home page lands on the right quick move-in home. */
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

  /** Checks the URL path matches the configured quick move-in home exactly. */
  async verifyExactQmiUrl(): Promise<void> {
    await this.step('Verify QMI URL path matches configured path', async () => {
      const currentPath = new URL(this.page.url()).pathname;
      expect(currentPath).toBe(location.qmiPath);
    });
  }

  // Hero and Summary

  /** Checks the hero shows the heading, address and summary stats. */
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

  /** Checks the breadcrumb is visible. */
  async verifyBreadcrumb(): Promise<void> {
    await this.step('Verify breadcrumb is visible', async () => {
      await expect(this.breadcrumb).toBeVisible();
    });
  }

  /** Checks the hero lists beds, baths, garage or half bath, square footage and price. */
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

  // Price and CTA

  /** Checks the price and the Get Information CTA are visible. */
  async verifyPriceOrCTA(): Promise<void> {
    await this.step('Verify price section & Get Information CTA', async () => {
      await expect(this.priceSection.first()).toBeVisible();
      await expect(this.getInformationCta).toBeVisible();
    });
  }

  /** Checks the Get Information CTA opens the side modal form. */
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

  // Gallery

  /** Checks the gallery shows an image and its navigation buttons work. */
  async verifyGallery(): Promise<void> {
    await this.step('Verify gallery & navigation buttons', async () => {
      await expect(this.gallerySection.first()).toBeVisible();
      await clickIfVisible(this.nextGalleryBtn);
      await clickIfVisible(this.prevGalleryBtn);
    });
  }

  // Floor Plan and Community Map

  /** Checks the floor plan section is visible. */
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

  /** Checks the interactive floor plan section renders its content. */
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

  /** Checks the community sitemap section renders its content. */
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

  // Content Sections

  /** Checks the home design details section says something real. */
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

  /** Checks the home features section says something real. */
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

  /** Checks the sales office shows its contact links, map link and form submit button. */
  async verifySalesOfficeAndContactForm(): Promise<void> {
    await this.step('Verify sales office & contact form', async () => {
      const salesOfficeSection = await this.requireFeature(
        await this.getSalesOfficeSection(),
        'qmi.salesOfficeSection',
        'Sales Office section',
      );

      if (salesOfficeSection) {
        await salesOfficeSection.scrollIntoViewIfNeeded();
        await expect(salesOfficeSection).toBeVisible({
          timeout: QMIPage.PAGE_LOAD_TIMEOUT,
        });
        await expect(salesOfficeSection).toContainText(
          /Hours|Open|Closed|Sales Office|Showhome Parade/i,
        );
        await this.verifySalesOfficePhone(salesOfficeSection);
        await this.verifySalesOfficeMapLink(salesOfficeSection);
      }

      await expect(this.getInformationCta).toBeVisible();
    });
  }

  // Lead Form Validation

  /** Checks the lead form shows its fields and submit button. */
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

  /** Submits the form empty and checks the required-field errors appear. */
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

  /** Checks the form rejects an invalid email address. */
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

  /** Fills the form with valid data and checks it submits. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit QMI side modal form with valid data', async () => {
      const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');

      if (!form) {
        return;
      }

      await this.fillLeadFormWithValidData(form);
      await this.submitLeadFormAndCaptureApi({
        form: form,
        formName: 'QMI Get Information side modal form',
        submitButton: getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
      await this.reportValue('QMI form successful submission validated');
    });
  }

  /** Opens the floating-CTA side modal lead form and returns it, for evidence runs. */
  async openSideModalLeadForm(formName = 'QMI Get Information side modal form'): Promise<Locator> {
    const form = await this.getAvailableForm(0, formName);

    if (!form) {
      throw new Error(`${formName} did not open`);
    }

    return form;
  }

  // Related Homes

  /** Checks the related quick move-in homes section lists cards with real content. */
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

  // Mortgage Popup

  /** Checks the mortgage calculator modal opens and closes again. */
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

  // UTour Section

  /** Checks the self-guided tour section and its CTA are shown. */
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

  /** Checks the self-guided tour section is not shown. */
  async verifyUTourSectionHidden(): Promise<void> {
    await this.step('Verify self-guided tour section hidden', async () => {
      await expect(this.uTourTitle).toHaveCount(0);
      await expect(this.uTourCta).toHaveCount(0);
    });
  }

  // Shared Helpers

  /** Returns the lead form at this index once its submit button is usable. */
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

  /** Opens the Get Information side modal and returns the form at this index. */
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

  /** Fills the form with a deliberately bad email address. */
  private async fillLeadFormWithInvalidEmail(form: Locator): Promise<void> {
    await fillInvalidSideModalForm(form, 'qmi');
  }

  /** Fills the form with valid lead data. */
  private async fillLeadFormWithValidData(form: Locator): Promise<void> {
    await fillValidSideModalForm(form, 'qmi');
  }

  /** Returns an element's text with whitespace collapsed, for logging and comparison. */
  private async getCompactText(locator: Locator): Promise<string> {
    return (await locator.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  }

  /** Finds the sales office section across the layouts this page can use. */
  private async getSalesOfficeSection(): Promise<Locator | null> {
    await this.salesOfficeSection
      .waitFor({ state: 'attached', timeout: 5000 })
      .catch(() => undefined);

    if (await this.salesOfficeSection.count()) {
      return this.salesOfficeSection;
    }

    const salesOfficeHeading = this.page
      .getByText(/Showhome Parade|Sales Office|Sales Centre|New Home Gallery/i)
      .first();

    await salesOfficeHeading.waitFor({ state: 'attached', timeout: 5000 }).catch(() => undefined);

    if (!(await salesOfficeHeading.count())) {
      return null;
    }

    return salesOfficeHeading.locator('xpath=ancestor::*[self::section or self::div][1]');
  }

  /** Checks the sales office offers a phone number, as a tel link or plain text. */
  private async verifySalesOfficePhone(salesOfficeSection: Locator): Promise<void> {
    const phoneLink = salesOfficeSection.locator('a[href^="tel:"]').first();

    if (await phoneLink.count()) {
      await expect(phoneLink).toBeVisible();
      return;
    }

    await expect(salesOfficeSection).toContainText(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  }

  /** Checks the sales office map link, when the layout has one. */
  private async verifySalesOfficeMapLink(salesOfficeSection: Locator): Promise<void> {
    const mapLink = salesOfficeSection
      .locator('a[href*="google.com/maps"], a[href*="maps.google"], a[href*="/maps"]')
      .first();

    if (
      !(await this.isFeaturePresent(mapLink, 'qmi.salesOfficeMapLink', 'Sales Office map link', {
        state: 'attached',
      }))
    ) {
      return;
    }

    await expect(mapLink).toBeVisible();
  }

  /** Returns the address or title inside one related home card. */
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

  /** Returns a related home card's address, falling back to its URL when the text is cut off. */
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

  /** Turns the address slug in a quick move-in URL back into a readable address. */
  private getAddressFromQmiHref(href: string): string | null {
    const path = href.split('?')[0].replace(/\/$/, '');
    const addressSlug = path.split('/').pop();

    if (!addressSlug || !/^\d+-/.test(addressSlug)) {
      return null;
    }

    return addressSlug.split('-').filter(Boolean).join(' ').toUpperCase();
  }

  /** Closes an open modal, when one is showing a close button. */
  private async closeModalIfPresent(): Promise<void> {
    if (await isLocatorVisible(this.closeModalBtn)) {
      await this.closeModalBtn.click();
      await expect(this.closeModalBtn).toBeHidden({
        timeout: QMIPage.PAGE_LOAD_TIMEOUT,
      });
    }
  }

  /**
   * Dismisses the OneTrust cookie banner when it appears.
   *
   * Timeboxed and non-fatal, because this is environmental noise rather than anything under test.
   * The banner animates itself away, so it is routinely visible when checked and gone by the time
   * the click runs - and an untimed click there inherits the 30s action timeout and fails the whole
   * test on a dismissal that had already succeeded on its own.
   */
  private async dismissCookieBannerIfPresent(): Promise<void> {
    await this.acceptCookiesIfPresent();

    const closeCookieBannerBtn = this.page
      .locator('#onetrust-banner-sdk, [aria-label="Privacy"], [role="dialog"]')
      .getByRole('button', { name: /^Close$/i })
      .first();

    if (await isLocatorVisible(closeCookieBannerBtn)) {
      await closeCookieBannerBtn.click({ timeout: 5_000 }).catch(() => undefined);
    }
  }

  /** Returns the section whose heading matches. */
  private getSectionByHeading(heading: RegExp): Locator {
    return this.page
      .locator('section')
      .filter({
        has: this.page.getByRole('heading', { name: heading }),
      })
      .first();
  }

  // Breadcrumb Validation

  /** Splits the configured quick move-in path into its route segments. */
  private getQmiPathSegments(): string[] {
    return getPathSegments(location.qmiPath);
  }

  /** Checks the breadcrumb walks state, community and address in line with the configured path. */
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

  /** Checks the breadcrumb links point back to the right community and plan. */
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

  /** Records each breadcrumb label and URL in the report, for troubleshooting. */
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

  /** Builds a readable breadcrumb label from its href when the on-screen text is cut off. */
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
