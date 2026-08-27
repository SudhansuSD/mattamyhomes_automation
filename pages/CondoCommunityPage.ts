import { Locator, Page, expect } from '@playwright/test';
import {
  escapeRegex,
  getMediaSource,
  getPathnameFromHref,
  isIgnorableHref,
  isLocatorVisible,
} from '../utils/web/pageObjectUtils';
import { SearchablePage } from './SearchablePage';
import {
  clickSubmit,
  expectSideModalFormFields,
  fillInvalidSideModalForm,
  fillValidSideModalForm,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  fillLeadFormByFormId,
  fillLeadFormFields,
  getHeroInformationCta,
  getInvalidLeadData,
  getSubmitButton as getLeadFormSubmitButton,
  getValidLeadData,
  GET_INFORMATION_CTA_TEXT,
  SUBMIT_BUTTON_SELECTOR,
} from '../utils/leadform/leadFormHelper';

const TIMEOUT = {
  short: 10000,
  medium: 15000,
  long: 20000,
};

const TEXT = {
  condo: /condo|condominium|suite/i,
  condoHero: /condo|condominium|suite|home/i,
  sectionHeading:
    /suite|floorplan|floor plan|gallery|amenit|location|neighbourhood|neighborhood|contact|sales|register|community/i,
  condoLink: /suite|floorplan|floor plan|gallery|amenit|location|contact|register/i,
  availableFloorplansHeading: /Explore available floorplans|Available floorplans|Floorplans/i,
  viewAll: /view all/i,
  cta: /register|contact|request|schedule|book|learn more/i,
  submit: /submit|register|request|send/i,
  requiredError: /Required|Please complete|Invalid|Error/i,
  emailError: /valid domain name|valid email|invalid email/i,
  successMessage: /Thank you for your interest in Mattamy Homes/i,
};

const FORM_CONTAINER_SELECTOR = [
  'form',
  '[id^="Sitecore-ScheduleAVisit-FormInstance"]',
  '[id^="ScheduleAVisit-FormInstance"]',
  '[id*="FormInstance"]',
  '[role="group"]',
].join(', ');

export class CondoCommunityPage extends SearchablePage {
  /**
   * Excludes side-modal/dialog content from in-page form lookups so the three
   * condo community form paths stay distinct: side modal, primary, and footer.
   */
  private static readonly NOT_IN_DIALOG =
    ':not([role="dialog"] *):not(.ReactModal__Content *):not([id*="ModalForm"] *)';

  /** Sets up the page object for the Canada-only condo experience. */
  constructor(page: Page) {
    // Condo communities exist only in Canada, so this page always runs against
    // the Canadian site regardless of the LOCATION the run started with.
    super(page, 'CAN');
  }

  // Page Locators

  /** The page's main heading. */
  private get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  /** The whole page body. */
  private get body(): Locator {
    return this.page.locator('body');
  }

  /** The hero banner at the top of the page. */
  private get hero(): Locator {
    return this.page.locator('main, #root').first();
  }

  /** Every navigation and CTA link on the page. */
  private get navLinks(): Locator {
    return this.page.locator('a[href]');
  }

  /** The register and contact buttons and links. */
  private get registerOrContactButtons(): Locator {
    return this.page.locator('a, button').filter({ hasText: TEXT.cta });
  }

  /**
   * Finds community CTA that opens the lead form sidebar/modal.
   *
   * The hero CTA (`#HeaderPlanPage` > `<button aria-label="Stay updated about this community">`) is
   * tried first, since naming that container rules out the off-canvas sticky-bar copies outright.
   * The heading-relative lookup stays as a fallback for layouts without that hero id.
   */
  private get getInformationCta(): Locator {
    const headingScopedCta = this.page
      .getByRole('heading', { level: 1 })
      .first()
      .locator('xpath=ancestor::*[(self::section or self::div) and .//button][1]')
      .locator('button:visible')
      .filter({ hasText: GET_INFORMATION_CTA_TEXT });

    return getHeroInformationCta(this.page).or(headingScopedCta).first();
  }

  /** The condo lead forms on the page. */
  private get condoForms(): Locator {
    return this.page
      .locator(`form${CondoCommunityPage.NOT_IN_DIALOG}`)
      .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** The form wrappers used on pages that render no <form> tag. */
  private get condoFormContainers(): Locator {
    return this.page
      .locator(
        [
          'form',
          '[id^="Sitecore-ScheduleAVisit-FormInstance"]',
          '[id^="ScheduleAVisit-FormInstance"]',
          '[id*="FormInstance"]',
          '[role="group"]',
        ]
          .map((selector) => `${selector}${CondoCommunityPage.NOT_IN_DIALOG}`)
          .join(', '),
      )
      .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** The confirmation modal shown after a successful submission. */
  private get successDialogModal(): Locator {
    return this.page.locator('.ReactModal__Content');
  }

  /** The thank-you message shown after the form is submitted. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(TEXT.successMessage).last();
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

  /** The media gallery section, which not every condo community has. */
  private get gallerySection(): Locator {
    return this.page.locator('#gallery').first();
  }

  /** The button that opens the full gallery modal. */
  private get galleryModalOpenButton(): Locator {
    return this.gallerySection.locator('button[aria-label="Community Gallery"]').first();
  }

  /** The gallery modal, once media has been opened. */
  private get galleryModal(): Locator {
    return this.page
      .locator('.ReactModal__Content:visible, [role="dialog"]:visible')
      .filter({ has: this.page.locator('img, video, iframe, picture') })
      .last();
  }

  /** The gallery modal's close button. */
  private get galleryModalCloseButton(): Locator {
    return this.galleryModal
      .locator(
        'button[aria-label*="Close" i], button:has-text("Close"), button:has-text("Close Icon")',
      )
      .first();
  }

  /** The in-page gallery's next button. */
  private get galleryNextButton(): Locator {
    return this.gallerySection.locator('button[aria-label*="Next slide" i]').first();
  }

  /** The in-page gallery's previous button. */
  private get galleryPreviousButton(): Locator {
    return this.gallerySection.locator('button[aria-label*="Previous slide" i]').first();
  }

  // Search and Page Load

  /** Searches for a condo community from the home page search box. */
  async searchByCondoCommunity(condoCommunity: string): Promise<void> {
    await super.searchByCondoCommunity(condoCommunity);
  }

  /** Checks the search lands on the right condo community page. */
  async verifySearchByCondoCommunity(expectedCommunity: string): Promise<void> {
    await this.step(`Verify condo community search redirects to ${expectedCommunity}`, async () => {
      await this.waitForPageReady();

      await expect(this.heading).toBeVisible({ timeout: TIMEOUT.long });
      await this.expectHeadingContains(expectedCommunity);
      await expect(this.page).not.toHaveURL(/\?country=/i);
    });
  }

  // Page Content Validation

  /** Checks the hero names this community and reads as condo content. */
  async verifyHeroContent(expectedCommunity: string): Promise<void> {
    await this.step(`Verify hero content for ${expectedCommunity}`, async () => {
      await this.expectHeadingContains(expectedCommunity);
      await expect(this.hero).toBeVisible({ timeout: TIMEOUT.medium });
      await expect(this.body).toContainText(TEXT.condoHero, { timeout: TIMEOUT.medium });
    });
  }

  /** Checks the page shows its content section headings. */
  async verifyCondoPageSections(): Promise<void> {
    await this.step('Verify condo community section headings', async () => {
      const sectionHeadings = this.page.getByRole('heading', {
        name: TEXT.sectionHeading,
      });

      const count = await sectionHeadings.count();

      expect(count, 'Condo community page should include content section headings').toBeGreaterThan(
        0,
      );

      for (let i = 0; i < Math.min(count, 8); i++) {
        await expect(sectionHeadings.nth(i)).toBeVisible({ timeout: TIMEOUT.short });
      }
    });
  }

  /** Checks the page carries condo-specific copy and navigation. */
  async verifyCondoSpecificContent(): Promise<void> {
    await this.step('Verify condo-specific content and navigation', async () => {
      await expect(this.body).toContainText(TEXT.condo, { timeout: TIMEOUT.short });

      const condoRelatedLinks = this.navLinks.filter({
        hasText: TEXT.condoLink,
      });

      expect(
        await condoRelatedLinks.count(),
        'Condo community page should include condo-related navigation or CTAs',
      ).toBeGreaterThan(0);
    });
  }

  /** Checks every navigation link points somewhere real. */
  async verifyAllNavigationLinks(): Promise<void> {
    await this.step('Verify all navigation links have usable href', async () => {
      const linkCount = await this.navLinks.count();

      expect(linkCount, 'Condo community page should contain links').toBeGreaterThan(0);

      let validatedLinks = 0;

      for (let i = 0; i < linkCount; i++) {
        const href = await this.navLinks.nth(i).getAttribute('href');

        if (isIgnorableHref(href)) {
          continue;
        }

        expect(href, `Navigation link ${i + 1} href missing`).toBeTruthy();
        expect(href, `Navigation link ${i + 1} should not be javascript`).not.toMatch(
          /^javascript:/i,
        );

        validatedLinks++;
        await this.reportValue(`Nav link ${validatedLinks}`, this.buildFullUrl(href));
      }
    });
  }

  /** Checks the main register or contact CTA is on screen. */
  async verifyPrimaryCtas(): Promise<void> {
    await this.step('Verify primary register/contact CTA', async () => {
      const ctaCount = await this.registerOrContactButtons.count();

      expect(ctaCount, 'Condo community page should include register/contact CTAs').toBeGreaterThan(
        0,
      );

      await expect(this.registerOrContactButtons.first()).toBeVisible({
        timeout: TIMEOUT.short,
      });
    });
  }

  /** Checks the page talks about suites or floorplans. */
  async verifySuiteOrFloorplanContent(): Promise<void> {
    await this.step('Verify suite or floorplan content', async () => {
      const suiteContent = this.page.locator('section, div').filter({
        hasText: /suite|floorplan|floor plan|bedroom|bath|sq\.?\s*ft/i,
      });

      expect(
        await suiteContent.count(),
        'Condo community page should include suite or floorplan content',
      ).toBeGreaterThan(0);
    });
  }

  /** Checks the floorplans section lists plans and its View All link works. */
  async verifyAvailableFloorplansSection(expectedCommunity: string): Promise<void> {
    await this.step('Verify available floorplans section', async () => {
      await this.waitForPageReady();

      const section = await this.requireFeature(
        await this.getAvailableFloorplansSection(),
        'condoCommunity.availableFloorplansSection',
        'Explore available floorplans section',
      );

      if (!section) {
        return;
      }

      await section.scrollIntoViewIfNeeded();
      await this.waitForPageReady();
      await expect(section).toBeVisible({ timeout: TIMEOUT.short });

      const condoCommunityPath = getPathnameFromHref(this.page.url());

      await this.verifyAvailableFloorplanLinks(section, condoCommunityPath);
      await this.verifyAvailableFloorplansViewAll(section, expectedCommunity);
    });
  }

  /** Checks the gallery opens, moves between media and closes again. */
  async verifyGalleryModal(): Promise<void> {
    await this.step('Verify gallery modal if available', async () => {
      if (
        !(await this.isFeaturePresent(
          this.gallerySection,
          'condoCommunity.galleryModal',
          'Condo community gallery',
        ))
      ) {
        return;
      }

      await this.gallerySection.scrollIntoViewIfNeeded();
      await expect(this.gallerySection, 'Condo community gallery should be visible').toBeVisible({
        timeout: TIMEOUT.short,
      });

      const galleryImages = this.gallerySection.locator('img');
      const galleryImageCount = await galleryImages.count();

      expect(galleryImageCount, 'Condo community gallery should include media').toBeGreaterThan(0);

      const firstImage = galleryImages.first();
      await expect(firstImage, 'First condo community gallery image should be visible').toBeVisible(
        { timeout: TIMEOUT.short },
      );
      expect(
        await firstImage.getAttribute('src'),
        'First condo community gallery image src missing',
      ).toBeTruthy();

      if (!(await isLocatorVisible(this.galleryModalOpenButton, 5000))) {
        await this.reportValue(
          'Condo community gallery modal open button not present - skipping modal open validation',
        );
        return;
      }

      await this.galleryModalOpenButton.click();

      if (!(await isLocatorVisible(this.galleryModal, 5000))) {
        await this.reportValue(
          'Condo community gallery is available as an in-page carousel; modal not present - validating carousel navigation only',
        );
        await this.navigateInPageGalleryMediaIfAvailable();
        return;
      }

      await expect(this.galleryModal, 'Condo community gallery modal should open').toBeVisible({
        timeout: TIMEOUT.short,
      });
      await expect(
        this.galleryModal.locator('img, video, iframe, picture').first(),
        'Gallery modal should show media',
      ).toBeVisible({ timeout: TIMEOUT.short });

      await this.navigateGalleryModalMediaIfAvailable();
      await this.closeGalleryModal();
    });
  }

  // Public Form Validation

  /** Checks the primary condo form shows its fields and submit button. */
  async validatePrimaryFormFields(): Promise<void> {
    await this.step('Validate primary condo form fields', async () => {
      await this.validateFormFieldsByIndex(0, 'Primary condo form');
    });
  }

  /** Checks the footer condo form shows its fields and submit button. */
  async validateFooterFormFields(): Promise<void> {
    await this.step('Validate footer condo form fields', async () => {
      await this.validateFormFieldsByIndex(1, 'Footer condo form');
    });
  }

  /** Checks the Get Information CTA opens the side modal form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      await expect(
        this.getInformationCta,
        'Get Information or Stay Updated CTA should be visible',
      ).toBeVisible({ timeout: TIMEOUT.medium });

      const form = await this.getAvailableGetInformationForm();
      await expect(form, 'Get Information condo sideModalForm should be visible').toBeVisible({
        timeout: TIMEOUT.short,
      });
    });
  }

  /** Checks the side modal form shows its fields. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Validate Get Information sideModalForm fields', async () => {
      const form = await this.getAvailableGetInformationForm();
      await expectSideModalFormFields(form, {
        timeout: TIMEOUT.short,
        expectCommunity: true,
        expectPlan: true,
      });
    });
  }

  /** Submits the empty side modal form and checks the required-field errors appear. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Validate Get Information sideModalForm empty errors', async () => {
      const form = await this.getAvailableGetInformationForm();
      await this.clickSubmit(form);
      await expectRequiredErrorsInForm(form, TIMEOUT.short);
    });
  }

  /** Checks the side modal form rejects an invalid email address. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate Get Information sideModalForm invalid email', async () => {
      const form = await this.getAvailableGetInformationForm();
      await fillInvalidSideModalForm(form, 'condoCommunity', { emailName: /email/i });
      await this.clickSubmit(form);
      await expectInvalidEmailErrorInForm(form, TIMEOUT.short);
    });
  }

  /** Fills the side modal form with valid data and checks it submits. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit Get Information condo sideModalForm successfully', async () => {
      const form = await this.getAvailableGetInformationForm();
      await fillValidSideModalForm(form, 'condoCommunity', {
        emailName: /email/i,
        selectCommunity: true,
        selectPlan: true,
      });
      await this.submitLeadFormAndCaptureApi({
        form: form,
        formName: 'Get Information condo sideModalForm',
        submitButton: this.getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        timeout: TIMEOUT.long,
      });
    });
  }

  /** Submits the primary condo form empty and checks the required-field errors appear. */
  async validateRequiredFieldErrors(): Promise<void> {
    await this.validatePrimaryFormRequiredErrors();
  }

  /** Submits the primary condo form empty and checks the required-field errors appear. */
  async validatePrimaryFormRequiredErrors(): Promise<void> {
    await this.step('Validate primary condo form required errors', async () => {
      await this.validateRequiredFieldErrorsByIndex(0, 'Primary condo form');
    });
  }

  /** Submits the footer condo form empty and checks the required-field errors appear. */
  async validateFooterFormRequiredErrors(): Promise<void> {
    await this.step('Validate footer condo form required errors', async () => {
      await this.validateRequiredFieldErrorsByIndex(1, 'Footer condo form');
    });
  }

  /** Checks the primary condo form rejects an invalid email address. */
  async validateInvalidEmailError(): Promise<void> {
    await this.validatePrimaryFormInvalidEmailError();
  }

  /** Checks the primary condo form rejects an invalid email address. */
  async validatePrimaryFormInvalidEmailError(): Promise<void> {
    await this.step('Validate primary condo form invalid email', async () => {
      await this.validateInvalidEmailErrorByIndex(0, 'Primary condo form');
    });
  }

  /** Checks the footer condo form rejects an invalid email address. */
  async validateFooterFormInvalidEmailError(): Promise<void> {
    await this.step('Validate footer condo form invalid email', async () => {
      await this.validateInvalidEmailErrorByIndex(1, 'Footer condo form');
    });
  }

  /** Fills the primary condo form with valid data and checks it submits. */
  async verifyPrimaryFormSuccessSubmission(): Promise<void> {
    await this.step('Submit primary condo form successfully', async () => {
      await this.submitSuccessfulFormByIndex(0, 'Primary condo form');
    });
  }

  /** Fills the footer condo form with valid data and checks it submits. */
  async verifyFooterFormSuccessSubmission(): Promise<void> {
    await this.step('Submit footer condo form successfully', async () => {
      await this.submitSuccessfulFormByIndex(1, 'Footer condo form');
    });
  }

  // Private Form Validation Helpers

  /** Checks the form at this index shows its fields. */
  private async validateFormFieldsByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.expectFieldIfPresent(
      form.getByRole('textbox', { name: /first name/i }),
      'First name',
    );
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /email/i }), 'Email');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone');

    await expect(this.getSubmitButton(form)).toBeVisible({ timeout: TIMEOUT.short });
  }

  /** Submits the form at this index empty and checks the required-field errors appear. */
  private async validateRequiredFieldErrorsByIndex(
    formIndex: number,
    formName: string,
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.clickSubmit(form);

    await expect(form.locator(`text=${TEXT.requiredError}`).first()).toBeVisible({
      timeout: TIMEOUT.short,
    });
  }

  /** Checks the form at this index rejects an invalid email address. */
  private async validateInvalidEmailErrorByIndex(
    formIndex: number,
    formName: string,
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.fillLeadFormWithInvalidEmail(form);
    await this.clickSubmit(form);

    await expect(form.locator(`text=${TEXT.emailError}`).first()).toBeVisible({
      timeout: TIMEOUT.short,
    });
  }

  /** Fills the form at this index with valid data and checks it submits. */
  private async submitSuccessfulFormByIndex(formIndex: number, formName: string): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.fillLeadFormWithValidData(form);
    await this.submitLeadFormAndCaptureApi({
      form: form,
      formName,
      submitButton: this.getSubmitButton(form),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage,
      timeout: TIMEOUT.long,
    });
    await this.reportValue(`${formName} successful submission validated`);
  }

  /** Clicks the lead form CTA, unless the form is already open. */
  private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
    if (await this.hasVisibleFields(this.leadFormDialogOrSidebar.first())) {
      return;
    }

    // The hero CTA is only rendered once the hero scrolls into view, so counting straight after
    // navigation finds nothing. The sticky quick-action bar duplicate is excluded by the shared CTA
    // selector, so it can no longer stand in for the real one here.
    await this.revealGetInformationCta('condo community page');

    const getInformationCtas = this.getInformationCta;
    const previousUrl = this.page.url();
    const ctaCount = await getInformationCtas.count();

    expect(ctaCount, 'Get Information or Stay Updated CTA should be present').toBeGreaterThan(0);

    for (let i = 0; i < ctaCount; i++) {
      const cta = getInformationCtas.nth(i);

      if (!(await cta.isVisible().catch(() => false))) {
        continue;
      }

      if (await this.isInsideFormContainer(cta)) {
        continue;
      }

      await cta.scrollIntoViewIfNeeded();
      let didClick = await cta
        .click()
        .then(() => true)
        .catch(() => false);

      if (!didClick) {
        didClick = await cta
          .evaluate((element) => {
            (element as HTMLElement).click();
            return true;
          })
          .catch(() => false);
      }

      if (!didClick) {
        continue;
      }

      await this.waitForPageReady();
      await this.settle(1000);

      expect(
        this.page.url(),
        `Condo lead-form CTA should keep the flow on page, not redirect from ${previousUrl}`,
      ).not.toMatch(/\/contact\/?($|[?#])/i);

      if (await this.hasVisibleFields(this.leadFormDialogOrSidebar.first())) {
        return;
      }

      await this.page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
    }
  }

  /**
   * Open the Get Information side modal lead form and return its container.
   *
   * Exposes the same CTA flow the side-modal checks use, so an evidence spec that only needs the
   * open form reuses the click-with-DOM-fallback CTA handling instead of its own clicker.
   */
  async openSideModalLeadForm(formName = 'Get Information condo sideModalForm'): Promise<Locator> {
    return this.getAvailableGetInformationForm(formName);
  }

  /** Returns the Get Information form once its CTA has opened it. */
  private async getAvailableGetInformationForm(
    formName = 'Get Information condo form',
  ): Promise<Locator> {
    await this.openLeadFormFromGetInformationCtaIfPresent();

    await expect
      .poll(
        async () => ((await this.hasVisibleFields(this.leadFormDialogOrSidebar.first())) ? 1 : 0),
        {
          message: `${formName} sidebar/modal should open after Get Information CTA`,
          timeout: TIMEOUT.medium,
        },
      )
      .toBe(1);

    const form = this.leadFormDialogOrSidebar.first();

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(
      this.getSubmitButton(form),
      `${formName} submit button should be visible inside sidebar/modal`,
    ).toBeVisible({ timeout: TIMEOUT.short });

    return form;
  }

  /** Steps through the gallery modal with its next/previous controls, when it has them. */
  private async navigateGalleryModalMediaIfAvailable(): Promise<void> {
    const nextButton = this.galleryModal.getByRole('button', { name: /next/i }).first();
    const previousButton = this.galleryModal.getByRole('button', { name: /previous/i }).first();
    const initialMediaKey = await this.getVisibleGalleryModalMediaKey();

    if (await isLocatorVisible(nextButton, 3000)) {
      await nextButton.click();
      await expect(
        this.galleryModal.locator('img, video, iframe, picture').first(),
        'Gallery modal media should remain visible after next',
      ).toBeVisible({ timeout: TIMEOUT.short });
      await expect
        .poll(() => this.getVisibleGalleryModalMediaKey(), {
          message: 'Gallery modal next control should navigate or keep visible media stable',
          timeout: TIMEOUT.short,
        })
        .not.toEqual('');
    }

    if (await isLocatorVisible(previousButton, 3000)) {
      await previousButton.click();
      await expect(
        this.galleryModal.locator('img, video, iframe, picture').first(),
        'Gallery modal media should remain visible after previous',
      ).toBeVisible({ timeout: TIMEOUT.short });
    }

    expect(
      initialMediaKey,
      'Gallery modal should expose a visible media source before navigation',
    ).toBeTruthy();
  }

  /** Steps through the in-page carousel when there is no gallery modal. */
  private async navigateInPageGalleryMediaIfAvailable(): Promise<void> {
    const initialMediaKey = await this.getVisibleInPageGalleryMediaKey();

    if (await isLocatorVisible(this.galleryNextButton, 3000)) {
      await this.galleryNextButton.click();
      await expect(
        this.gallerySection.locator('img').first(),
        'Gallery media should remain visible after next',
      ).toBeVisible({ timeout: TIMEOUT.short });
    }

    if (await isLocatorVisible(this.galleryPreviousButton, 3000)) {
      await this.galleryPreviousButton.click();
      await expect(
        this.gallerySection.locator('img').first(),
        'Gallery media should remain visible after previous',
      ).toBeVisible({ timeout: TIMEOUT.short });
    }

    expect(
      initialMediaKey,
      'Condo community gallery should expose visible media before navigation',
    ).toBeTruthy();
  }

  /** Closes the gallery modal, falling back to Escape when there is no close button. */
  private async closeGalleryModal(): Promise<void> {
    if (await isLocatorVisible(this.galleryModalCloseButton, 3000)) {
      await this.galleryModalCloseButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }

    await expect(this.galleryModal, 'Condo community gallery modal should close').toBeHidden({
      timeout: TIMEOUT.short,
    });
  }

  /** Returns the source of the first media showing in the gallery modal. */
  private async getVisibleGalleryModalMediaKey(): Promise<string> {
    const media = this.galleryModal
      .locator('img:visible, video:visible, iframe:visible, picture:visible')
      .first();

    return (await isLocatorVisible(media, 3000)) ? getMediaSource(media) : '';
  }

  /** Returns the source of the first media showing in the in-page gallery. */
  private async getVisibleInPageGalleryMediaKey(): Promise<string> {
    const media = this.gallerySection.locator('img:visible').first();

    return (await isLocatorVisible(media, 3000)) ? getMediaSource(media) : '';
  }

  /** Fills the form with a deliberately bad email address. */
  private async fillLeadFormWithInvalidEmail(form: Locator): Promise<void> {
    await fillLeadFormFields(form, getInvalidLeadData('condoCommunity'), { emailName: /email/i });
  }

  /** Returns whether a container holds at least one visible form field. */
  private async hasVisibleFields(container: Locator): Promise<boolean> {
    if (!(await container.isVisible().catch(() => false))) {
      return false;
    }

    const fields = container.locator('input, select, textarea');
    const fieldCount = await fields.count();

    for (let i = 0; i < fieldCount; i++) {
      if (
        await fields
          .nth(i)
          .isVisible()
          .catch(() => false)
      ) {
        return true;
      }
    }

    return false;
  }

  /** Returns the CTA buttons that sit inside a lead form. */
  private async isInsideFormContainer(locator: Locator): Promise<boolean> {
    return locator
      .evaluate((element, selector) => Boolean(element.closest(selector)), FORM_CONTAINER_SELECTOR)
      .catch(() => false);
  }

  /** Fills the form with valid lead data. */
  private async fillLeadFormWithValidData(form: Locator): Promise<void> {
    // Check the form id first, then fill: Canada forms also get the four extra fields.
    await fillLeadFormByFormId(form, getValidLeadData('condoCommunity'), {
      emailName: /email/i,
      selectCommunity: true,
      selectPlan: true,
    });
  }

  /** Returns the condo form at this index once it is usable. */
  private async getAvailableForm(formIndex: number, formName: string): Promise<Locator | null> {
    const matchingForms =
      (await this.condoForms.count()) > 0 ? this.condoForms : this.condoFormContainers;

    const count = await matchingForms.count();

    if (count === 0) {
      throw new Error(`${formName} not present - no condo lead forms found`);
    }

    if (formIndex >= count) {
      throw new Error(`${formName} not present - only ${count} condo form(s) found`);
    }

    const form = matchingForms.nth(formIndex);

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(form, `${formName} should be visible`).toBeVisible({
      timeout: TIMEOUT.short,
    });

    return form;
  }

  /** Returns a condo form's submit button. */
  private getSubmitButton(form: Locator): Locator {
    return getLeadFormSubmitButton(form);
  }

  /**
   * Clicks this page's submit button - it takes a looser label - without waiting on the third-party
   * request behind it.
   */
  private async clickSubmit(form: Locator): Promise<void> {
    await clickSubmit(this.page, form, TIMEOUT.short, {
      submitButton: this.getSubmitButton(form),
      settle: (ms) => this.settle(ms),
    });
  }

  // Floorplan Section Helpers

  /** Returns the available floorplans section, or null when the page has none. */
  private async getAvailableFloorplansSection(): Promise<Locator | null> {
    const heading = this.page
      .getByRole('heading', {
        name: TEXT.availableFloorplansHeading,
      })
      .first();

    await heading.waitFor({ state: 'attached', timeout: TIMEOUT.medium }).catch(() => undefined);

    if (!(await heading.count())) {
      return null;
    }

    const section = this.page.locator('section').filter({ has: heading }).first();

    if (await section.count()) {
      return section;
    }

    return heading.locator('xpath=ancestor::div[1]');
  }

  /** Checks the floorplan links in a section and records them in the report. */
  private async verifyAvailableFloorplanLinks(
    section: Locator,
    condoCommunityPath: string,
  ): Promise<void> {
    const links = section.locator('a[href]');
    const linkCount = await links.count();
    const loggedHrefs = new Set<string>();
    let floorplanLinkCount = 0;

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const linkText = (await link.innerText().catch(() => '')).trim();
      const href = await link.getAttribute('href');

      if (TEXT.viewAll.test(linkText) || isIgnorableHref(href)) {
        continue;
      }

      const pathname = getPathnameFromHref(href!, this.page.url());

      if (loggedHrefs.has(pathname)) {
        continue;
      }

      loggedHrefs.add(pathname);
      floorplanLinkCount++;

      // Attached, not visible: this section renders as a horizontally scrolling
      // carousel once the community has more floorplans than fit the track, and
      // its off-track slides are legitimately hidden. Requiring every slide to be
      // visible failed on exactly that (link 3 resolved, reported hidden, retried
      // 13x). Visibility of the module itself is asserted once, below.
      await expect(link, `Floorplan link ${floorplanLinkCount} should be attached`).toBeAttached({
        timeout: TIMEOUT.short,
      });
      expect(href, `Floorplan link ${floorplanLinkCount} href missing`).toBeTruthy();
      expect(
        pathname,
        `Floorplan link ${floorplanLinkCount} should contain condo community path`,
      ).toContain(condoCommunityPath);

      const planName = this.getPlanNameFromHref(href!);

      await this.reportValue(`${floorplanLinkCount}. ${planName}`, this.buildFullUrl(href!));
    }

    expect(
      floorplanLinkCount,
      'Explore available floorplans should include at least one floorplan link',
    ).toBeGreaterThan(0);

    // The module has to be on screen, not just in the DOM - asserted on the first
    // floorplan link, which the carousel always keeps on its visible track.
    await expect(
      links.filter({ hasNotText: TEXT.viewAll }).first(),
      'Explore available floorplans should render at least one visible floorplan link',
    ).toBeVisible({ timeout: TIMEOUT.short });

    await this.reportValue(`Validated ${floorplanLinkCount} condo floorplan link(s)`);
  }

  /** Follows the floorplans View All link and checks where it lands. */
  private async verifyAvailableFloorplansViewAll(
    section: Locator,
    expectedCommunity: string,
  ): Promise<void> {
    const viewAllLink = section
      .locator('a[href]')
      .filter({
        hasText: TEXT.viewAll,
      })
      .first();

    await expect(viewAllLink, 'Explore available floorplans View All link missing').toBeVisible({
      timeout: TIMEOUT.short,
    });

    const href = await viewAllLink.getAttribute('href');

    expect(href, 'Explore available floorplans View All href missing').toBeTruthy();
    expect(
      href,
      'Explore available floorplans View All should not be an anchor/contact link',
    ).not.toMatch(/^(#|mailto:|tel:|javascript:)/i);

    await this.reportValue('View All floorplans CTA URL', href);

    await Promise.all([this.page.waitForLoadState('domcontentloaded'), viewAllLink.click()]);

    await this.waitForPageReady();
    await expect(this.page, 'View All should redirect to Find Your Home/search page').toHaveURL(
      /\/search|find-your-home/i,
    );

    const decodedUrl = decodeURIComponent(this.page.url()).toLowerCase();
    const expectedCommunityText = expectedCommunity.toLowerCase();

    if (decodedUrl.includes(expectedCommunityText)) {
      return;
    }

    await expect(this.body, 'FYH page should contain the condo community name').toContainText(
      new RegExp(escapeRegex(expectedCommunity), 'i'),
      {
        timeout: TIMEOUT.long,
      },
    );
  }

  // Shared Helpers

  /** Checks a field is visible, but only when the form renders it. */
  private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
    if (await field.count()) {
      await expect(field.first(), `${label} field should be visible`).toBeVisible({
        timeout: TIMEOUT.short,
      });
    }
  }

  /** Checks the main heading contains this text. */
  private async expectHeadingContains(expectedText: string): Promise<void> {
    await expect(this.heading).toContainText(new RegExp(escapeRegex(expectedText), 'i'));
  }

  /** Builds a readable plan name from a floorplan URL. */
  private getPlanNameFromHref(href: string): string {
    const pathname = getPathnameFromHref(href, this.page.url());
    const slug = pathname.split('/').filter(Boolean).pop();

    return slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Condo plan';
  }
}
