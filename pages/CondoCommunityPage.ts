import { Locator, expect } from '@playwright/test';
import {
    escapeRegex,
    getMediaSource,
    getPathnameFromHref,
    isIgnorableHref,
    isLocatorVisible
} from '../utils/pageObjectUtils';
import { SearchablePage } from './SearchablePage';
import {
    expectSideModalFormFields,
    fillInvalidSideModalForm,
    fillValidSideModalForm,
    expectInvalidEmailErrorInForm,
    expectRequiredErrorsInForm,
    fillLeadFormByFormId,
    fillLeadFormFields,
    getInvalidLeadData,
    getValidLeadData
} from '../utils/leadFormHelper';

const TIMEOUT = {
  short: 10000,
  medium: 15000,
  long: 20000
};

const TEXT = {
  condo: /condo|condominium|suite/i,
  condoHero: /condo|condominium|suite|home/i,
  sectionHeading:
    /suite|floorplan|floor plan|gallery|amenit|location|neighbourhood|neighborhood|contact|sales|register|community/i,
  condoLink:
    /suite|floorplan|floor plan|gallery|amenit|location|contact|register/i,
  availableFloorplansHeading: /Explore available floorplans|Available floorplans|Floorplans/i,
  viewAll: /view all/i,
  cta: /register|contact|request|schedule|book|learn more/i,
  submit: /submit|register|request|send/i,
  requiredError: /Required|Please complete|Invalid|Error/i,
  emailError: /valid domain name|valid email|invalid email/i,
  successMessage: /Thank you for your interest in Mattamy Homes/i
};

const FORM_CONTAINER_SELECTOR = [
  'form',
  '[id^="Sitecore-ScheduleAVisit-FormInstance"]',
  '[id^="ScheduleAVisit-FormInstance"]',
  '[id*="FormInstance"]',
  '[role="group"]'
].join(', ');

export class CondoCommunityPage extends SearchablePage {
  /* ==========================================================
     Page Locators
  ========================================================== */

  /** Locator: main page H1 heading. */
  private get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  /** Locator: full page body content. */
  private get body(): Locator {
    return this.page.locator('body');
  }

  /** Locator: primary hero or app root container. */
  private get hero(): Locator {
    return this.page.locator('main, #root').first();
  }

  /** Locator: all page navigation and CTA links. */
  private get navLinks(): Locator {
    return this.page.locator('a[href]');
  }

  /** Locator: register/contact action buttons and links. */
  private get registerOrContactButtons(): Locator {
    return this.page.locator('a, button').filter({ hasText: TEXT.cta });
  }

  /** Locator: community CTA that opens the lead form sidebar/modal. */
  private get getInformationCta(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first()
      .locator('xpath=ancestor::*[(self::section or self::div) and .//button][1]')
      .locator('button:visible')
      .filter({ hasText: /^\s*(?:Get Information|Stay Updated)\s*$/i })
      .first();
  }

  /** Locator: possible condo lead forms on the page. */
  private get condoForms(): Locator {
    return this.page.locator('form')
      .filter({ has: this.page.getByRole('button', { name: TEXT.submit }) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** Locator: form containers used when the page does not render form tags. */
  private get condoFormContainers(): Locator {
    return this.page.locator(
      'form, [id^="Sitecore-ScheduleAVisit-FormInstance"], [id^="ScheduleAVisit-FormInstance"]'
    )
      .filter({ has: this.page.getByRole('button', { name: TEXT.submit }) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** Locator: React modal shown after successful form submission. */
  private get successDialogModal(): Locator {
    return this.page.locator('.ReactModal__Content');
  }

  /** Locator: lead form success confirmation message. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(TEXT.successMessage).last();
  }

  /** Locator: Get Information lead form rendered in a modal, drawer, or sidebar. */
  private get leadFormDialogOrSidebar(): Locator {
    return this.page.locator('#ModalForm');
  }

  /** Locator: optional condo community media gallery section. */
  private get gallerySection(): Locator {
    return this.page.locator('#gallery').first();
  }

  /** Locator: button that opens the full gallery modal. */
  private get galleryModalOpenButton(): Locator {
    return this.gallerySection.locator('button[aria-label="Community Gallery"]').first();
  }

  /** Locator: visible gallery modal/dialog after opening media. */
  private get galleryModal(): Locator {
    return this.page.locator('.ReactModal__Content:visible, [role="dialog"]:visible')
      .filter({ has: this.page.locator('img, video, iframe, picture') })
      .last();
  }

  /** Locator: close button inside the visible gallery modal. */
  private get galleryModalCloseButton(): Locator {
    return this.galleryModal
      .locator('button[aria-label*="Close" i], button:has-text("Close"), button:has-text("Close Icon")')
      .first();
  }

  /** Locator: in-page gallery next button. */
  private get galleryNextButton(): Locator {
    return this.gallerySection.locator('button[aria-label*="Next slide" i]').first();
  }

  /** Locator: in-page gallery previous button. */
  private get galleryPreviousButton(): Locator {
    return this.gallerySection.locator('button[aria-label*="Previous slide" i]').first();
  }

  /* ==========================================================
     Search and Page Load
  ========================================================== */

  /** Action: search for a condo community from the home page search box. */
  async searchByCondoCommunity(condoCommunity: string): Promise<void> {
    await super.searchByCondoCommunity(condoCommunity);
  }

  /** Verify: condo community search redirects to the expected community page. */
  async verifySearchByCondoCommunity(expectedCommunity: string): Promise<void> {
    await this.step(`Verify condo community search redirects to ${expectedCommunity}`, async () => {
      await this.waitForPageReady();

      await expect(this.heading).toBeVisible({ timeout: TIMEOUT.long });
      await this.expectHeadingContains(expectedCommunity);
      await expect(this.page).not.toHaveURL(/\?country=/i);
    });
  }

  /* ==========================================================
     Page Content Validation
  ========================================================== */

  /** Verify: hero area contains expected community and condo-related content. */
  async verifyHeroContent(expectedCommunity: string): Promise<void> {
    await this.step(`Verify hero content for ${expectedCommunity}`, async () => {
      await this.expectHeadingContains(expectedCommunity);
      await expect(this.hero).toBeVisible({ timeout: TIMEOUT.medium });
      await expect(this.body).toContainText(TEXT.condoHero, { timeout: TIMEOUT.medium });
    });
  }

  /** Verify: page includes visible condo community content section headings. */
  async verifyCondoPageSections(): Promise<void> {
    await this.step('Verify condo community section headings', async () => {
      const sectionHeadings = this.page.getByRole('heading', {
        name: TEXT.sectionHeading
      });

      const count = await sectionHeadings.count();

      expect(count, 'Condo community page should include content section headings')
        .toBeGreaterThan(0);

      for (let i = 0; i < Math.min(count, 8); i++) {
        await expect(sectionHeadings.nth(i)).toBeVisible({ timeout: TIMEOUT.short });
      }
    });
  }

  /** Verify: page includes condo-specific copy and condo-related navigation. */
  async verifyCondoSpecificContent(): Promise<void> {
    await this.step('Verify condo-specific content and navigation', async () => {
      await expect(this.body).toContainText(TEXT.condo, { timeout: TIMEOUT.short });

      const condoRelatedLinks = this.navLinks.filter({
        hasText: TEXT.condoLink
      });

      expect(
        await condoRelatedLinks.count(),
        'Condo community page should include condo-related navigation or CTAs'
      ).toBeGreaterThan(0);
    });
  }

  /** Verify: all navigation links have usable href values. */
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
        expect(href, `Navigation link ${i + 1} should not be javascript`)
          .not.toMatch(/^javascript:/i);

        validatedLinks++;
        await this.reportValue(`Nav link ${validatedLinks}`, this.buildFullUrl(href));
      }
    });
  }

  /** Verify: primary register/contact CTA is present and visible. */
  async verifyPrimaryCtas(): Promise<void> {
    await this.step('Verify primary register/contact CTA', async () => {
      const ctaCount = await this.registerOrContactButtons.count();

      expect(ctaCount, 'Condo community page should include register/contact CTAs')
        .toBeGreaterThan(0);

      await expect(this.registerOrContactButtons.first()).toBeVisible({
        timeout: TIMEOUT.short
      });
    });
  }

  /** Verify: page includes suite or floorplan-related content. */
  async verifySuiteOrFloorplanContent(): Promise<void> {
    await this.step('Verify suite or floorplan content', async () => {
      const suiteContent = this.page.locator('section, div').filter({
        hasText: /suite|floorplan|floor plan|bedroom|bath|sq\.?\s*ft/i
      });

      expect(
        await suiteContent.count(),
        'Condo community page should include suite or floorplan content'
      ).toBeGreaterThan(0);
    });
  }

  /** Verify: available floorplans section contains floorplan links and a working View All CTA. */
  async verifyAvailableFloorplansSection(expectedCommunity: string): Promise<void> {
    await this.step('Verify available floorplans section', async () => {
      await this.waitForPageReady();

      const section = await this.getAvailableFloorplansSectionIfAvailable();

      if (!section) {
        await this.reportValue('Explore available floorplans section not present after DOM load - skipping validation');
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

  /** Verify: optional gallery modal opens, navigates media, and closes correctly. */
  async verifyGalleryModalIfAvailable(): Promise<void> {
    await this.step('Verify gallery modal if available', async () => {
      if (!(await isLocatorVisible(this.gallerySection, 5000))) {
        await this.reportValue('Condo community gallery not present - skipping modal validation');
        return;
      }

      await this.gallerySection.scrollIntoViewIfNeeded();
      await expect(this.gallerySection, 'Condo community gallery should be visible')
        .toBeVisible({ timeout: TIMEOUT.short });

      const galleryImages = this.gallerySection.locator('img');
      const galleryImageCount = await galleryImages.count();

      expect(galleryImageCount, 'Condo community gallery should include media')
        .toBeGreaterThan(0);

      const firstImage = galleryImages.first();
      await expect(firstImage, 'First condo community gallery image should be visible')
        .toBeVisible({ timeout: TIMEOUT.short });
      expect(await firstImage.getAttribute('src'), 'First condo community gallery image src missing')
        .toBeTruthy();

      if (!(await isLocatorVisible(this.galleryModalOpenButton, 5000))) {
        await this.reportValue('Condo community gallery modal open button not present - skipping modal open validation');
        return;
      }

      await this.galleryModalOpenButton.click({ force: true });

      if (!(await isLocatorVisible(this.galleryModal, 5000))) {
        await this.reportValue('Condo community gallery is available as an in-page carousel; modal not present - validating carousel navigation only');
        await this.navigateInPageGalleryMediaIfAvailable();
        return;
      }

      await expect(this.galleryModal, 'Condo community gallery modal should open')
        .toBeVisible({ timeout: TIMEOUT.short });
      await expect(this.galleryModal.locator('img, video, iframe, picture').first(), 'Gallery modal should show media')
        .toBeVisible({ timeout: TIMEOUT.short });

      await this.navigateGalleryModalMediaIfAvailable();
      await this.closeGalleryModal();
    });
  }

  /* ==========================================================
     Public Form Validation
  ========================================================== */

  /** Verify: primary condo form fields and submit button are visible. */
  async validatePrimaryFormFields(): Promise<void> {
    await this.step('Validate primary condo form fields', async () => {
      await this.validateFormFieldsByIndex(0, 'Primary condo form');
    });
  }

  /** Verify: footer condo form fields and submit button are visible. */
  async validateFooterFormFields(): Promise<void> {
    await this.step('Validate footer condo form fields', async () => {
      await this.validateFormFieldsByIndex(1, 'Footer condo form');
    });
  }

  /** Verify: Get Information CTA opens the condo sideModalForm sidebar/modal. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      await expect(this.getInformationCta, 'Get Information or Stay Updated CTA should be visible')
        .toBeVisible({ timeout: TIMEOUT.medium });

      const form = await this.getAvailableGetInformationForm();
      await expect(form, 'Get Information condo sideModalForm should be visible')
        .toBeVisible({ timeout: TIMEOUT.short });
    });
  }

  /** Verify: Get Information condo sideModalForm fields are visible. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Validate Get Information sideModalForm fields', async () => {
      const form = await this.getAvailableGetInformationForm();
      await expectSideModalFormFields(form, {
        timeout: TIMEOUT.short,
        expectCommunity: true,
        expectPlan: true
      });
    });
  }

  /** Verify: Get Information condo sideModalForm shows required-field validation errors. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Validate Get Information sideModalForm empty errors', async () => {
      const form = await this.getAvailableGetInformationForm();
      await this.clickSubmit(form);
      await this.expectRequiredErrorsInForm(form);
    });
  }

  /** Verify: Get Information condo sideModalForm rejects invalid email addresses. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate Get Information sideModalForm invalid email', async () => {
      const form = await this.getAvailableGetInformationForm();
      await fillInvalidSideModalForm(form, 'condoCommunity', { emailName: /email/i });
      await this.clickSubmit(form);
      await this.expectInvalidEmailErrorInForm(form);
    });
  }

  /** Verify: Get Information condo sideModalForm can be submitted successfully. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit Get Information condo sideModalForm successfully', async () => {
      const form = await this.getAvailableGetInformationForm();
      await fillValidSideModalForm(form, 'condoCommunity', {
        emailName: /email/i,
        selectCommunity: true,
        selectPlan: true
      });
      await this.submitLeadFormAndCaptureApi({
        formName: 'Get Information condo sideModalForm',
        submitButton: this.getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        timeout: TIMEOUT.long
      });
    });
  }

  /** Verify: default required-field validation errors on the primary condo form. */
  async validateRequiredFieldErrors(): Promise<void> {
    await this.validatePrimaryFormRequiredErrors();
  }

  /** Verify: primary condo form shows required-field validation errors. */
  async validatePrimaryFormRequiredErrors(): Promise<void> {
    await this.step('Validate primary condo form required errors', async () => {
      await this.validateRequiredFieldErrorsByIndex(0, 'Primary condo form');
    });
  }

  /** Verify: footer condo form shows required-field validation errors. */
  async validateFooterFormRequiredErrors(): Promise<void> {
    await this.step('Validate footer condo form required errors', async () => {
      await this.validateRequiredFieldErrorsByIndex(1, 'Footer condo form');
    });
  }

  /** Verify: default invalid-email validation on the primary condo form. */
  async validateInvalidEmailError(): Promise<void> {
    await this.validatePrimaryFormInvalidEmailError();
  }

  /** Verify: primary condo form rejects invalid email addresses. */
  async validatePrimaryFormInvalidEmailError(): Promise<void> {
    await this.step('Validate primary condo form invalid email', async () => {
      await this.validateInvalidEmailErrorByIndex(0, 'Primary condo form');
    });
  }

  /** Verify: footer condo form rejects invalid email addresses. */
  async validateFooterFormInvalidEmailError(): Promise<void> {
    await this.step('Validate footer condo form invalid email', async () => {
      await this.validateInvalidEmailErrorByIndex(1, 'Footer condo form');
    });
  }

  /** Verify: primary condo form can be submitted successfully. */
  async verifyPrimaryFormSuccessSubmission(): Promise<void> {
    await this.step('Submit primary condo form successfully', async () => {
      await this.submitSuccessfulFormByIndex(0, 'Primary condo form');
    });
  }

  /** Verify: footer condo form can be submitted successfully. */
  async verifyFooterFormSuccessSubmission(): Promise<void> {
    await this.step('Submit footer condo form successfully', async () => {
      await this.submitSuccessfulFormByIndex(1, 'Footer condo form');
    });
  }

  /* ==========================================================
     Private Form Validation Helpers
  ========================================================== */

  /** Helper: validate visible fields for a form selected by index. */
  private async validateFormFieldsByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /first name/i }), 'First name');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /email/i }), 'Email');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone');

    await expect(this.getSubmitButton(form)).toBeVisible({ timeout: TIMEOUT.short });
  }

  /** Helper: trigger and validate required-field errors for a form selected by index. */
  private async validateRequiredFieldErrorsByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.clickSubmit(form);

    await expect(form.locator(`text=${TEXT.requiredError}`).first()).toBeVisible({
      timeout: TIMEOUT.short
    });
  }

  /** Helper: trigger and validate invalid-email errors for a form selected by index. */
  private async validateInvalidEmailErrorByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.fillLeadFormWithInvalidEmail(form);
    await this.clickSubmit(form);

    await expect(form.locator(`text=${TEXT.emailError}`).first()).toBeVisible({
      timeout: TIMEOUT.short
    });
  }

  /** Helper: submit a form selected by index with valid lead data. */
  private async submitSuccessfulFormByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.fillLeadFormWithValidData(form);
    await this.submitLeadFormAndCaptureApi({
      formName,
      submitButton: this.getSubmitButton(form),
      successModal: this.successDialogModal,
      successMessage: this.formSuccessMessage,
      timeout: TIMEOUT.long
    });
    await this.reportValue(`${formName} successful submission validated`);
  }

  /** Helper: click the available lead-form CTA when the sidebar/modal is not already open. */
  private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
    if (await this.hasVisibleFields(this.leadFormDialogOrSidebar.first())) {
      return;
    }

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
      let didClick = await cta.click({ force: true })
        .then(() => true)
        .catch(() => false);

      if (!didClick) {
        didClick = await cta.evaluate((element) => {
          (element as HTMLElement).click();
          return true;
        }).catch(() => false);
      }

      if (!didClick) {
        continue;
      }

      await this.waitForPageReady();
      await this.settle(1000);

      expect(
        this.page.url(),
        `Condo lead-form CTA should keep the flow on page, not redirect from ${previousUrl}`
      ).not.toMatch(/\/contact\/?($|[?#])/i);

      if (await this.hasVisibleFields(this.leadFormDialogOrSidebar.first())) {
        return;
      }

      await this.page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
    }
  }

  /** Helper: find the Get Information lead form after opening its CTA. */
  private async getAvailableGetInformationForm(
    formName = 'Get Information condo form'
  ): Promise<Locator> {
    await this.openLeadFormFromGetInformationCtaIfPresent();

    await expect
      .poll(
        async () => await this.hasVisibleFields(this.leadFormDialogOrSidebar.first()) ? 1 : 0,
        {
          message: `${formName} sidebar/modal should open after Get Information CTA`,
          timeout: TIMEOUT.medium
        }
      )
      .toBe(1);

    const form = this.leadFormDialogOrSidebar.first();

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(this.getSubmitButton(form), `${formName} submit button should be visible inside sidebar/modal`)
      .toBeVisible({ timeout: TIMEOUT.short });

    return form;
  }

  /** Helper: navigate gallery modal media when next/previous controls are available. */
  private async navigateGalleryModalMediaIfAvailable(): Promise<void> {
    const nextButton = this.galleryModal
      .locator('button[aria-label*="Next" i], button:has-text("Next")')
      .first();
    const previousButton = this.galleryModal
      .locator('button[aria-label*="Previous" i], button:has-text("Previous")')
      .first();
    const initialMediaKey = await this.getVisibleGalleryModalMediaKey();

    if (await isLocatorVisible(nextButton, 3000)) {
      await nextButton.click({ force: true });
      await expect(this.galleryModal.locator('img, video, iframe, picture').first(), 'Gallery modal media should remain visible after next')
        .toBeVisible({ timeout: TIMEOUT.short });
      await expect
        .poll(
          () => this.getVisibleGalleryModalMediaKey(),
          {
            message: 'Gallery modal next control should navigate or keep visible media stable',
            timeout: TIMEOUT.short
          }
        )
        .not.toEqual('');
    }

    if (await isLocatorVisible(previousButton, 3000)) {
      await previousButton.click({ force: true });
      await expect(this.galleryModal.locator('img, video, iframe, picture').first(), 'Gallery modal media should remain visible after previous')
        .toBeVisible({ timeout: TIMEOUT.short });
    }

    expect(initialMediaKey, 'Gallery modal should expose a visible media source before navigation')
      .toBeTruthy();
  }

  /** Helper: navigate the in-page gallery carousel when a modal is not available. */
  private async navigateInPageGalleryMediaIfAvailable(): Promise<void> {
    const initialMediaKey = await this.getVisibleInPageGalleryMediaKey();

    if (await isLocatorVisible(this.galleryNextButton, 3000)) {
      await this.galleryNextButton.click({ force: true });
      await expect(this.gallerySection.locator('img').first(), 'Gallery media should remain visible after next')
        .toBeVisible({ timeout: TIMEOUT.short });
    }

    if (await isLocatorVisible(this.galleryPreviousButton, 3000)) {
      await this.galleryPreviousButton.click({ force: true });
      await expect(this.gallerySection.locator('img').first(), 'Gallery media should remain visible after previous')
        .toBeVisible({ timeout: TIMEOUT.short });
    }

    expect(initialMediaKey, 'Condo community gallery should expose visible media before navigation')
      .toBeTruthy();
  }

  /** Helper: close the gallery modal with its close button or Escape fallback. */
  private async closeGalleryModal(): Promise<void> {
    if (await isLocatorVisible(this.galleryModalCloseButton, 3000)) {
      await this.galleryModalCloseButton.click({ force: true });
    } else {
      await this.page.keyboard.press('Escape');
    }

    await expect(this.galleryModal, 'Condo community gallery modal should close')
      .toBeHidden({ timeout: TIMEOUT.short });
  }

  /** Helper: return the first visible media source rendered in the gallery modal. */
  private async getVisibleGalleryModalMediaKey(): Promise<string> {
    const media = this.galleryModal.locator('img:visible, video:visible, iframe:visible, picture:visible').first();

    return await isLocatorVisible(media, 3000) ? getMediaSource(media) : '';
  }

  /** Helper: return the first visible media source rendered in the in-page gallery. */
  private async getVisibleInPageGalleryMediaKey(): Promise<string> {
    const media = this.gallerySection.locator('img:visible').first();

    return await isLocatorVisible(media, 3000) ? getMediaSource(media) : '';
  }

  /** Helper: fill lead form with data that should fail email validation. */
  private async fillLeadFormWithInvalidEmail(form: Locator): Promise<void> {
    await fillLeadFormFields(form, getInvalidLeadData('condoCommunity'), { emailName: /email/i });
  }

  /** Helper: return true when a container has at least one visible form field. */
  private async hasVisibleFields(container: Locator): Promise<boolean> {
    if (!(await container.isVisible().catch(() => false))) {
      return false;
    }

    const fields = container.locator('input, select, textarea');
    const fieldCount = await fields.count();

    for (let i = 0; i < fieldCount; i++) {
      if (await fields.nth(i).isVisible().catch(() => false)) {
        return true;
      }
    }

    return false;
  }

  /** Helper: identify CTA buttons rendered inside an existing lead form. */
  private async isInsideFormContainer(locator: Locator): Promise<boolean> {
    return locator
      .evaluate((element, selector) => Boolean(element.closest(selector)), FORM_CONTAINER_SELECTOR)
      .catch(() => false);
  }

  /** Helper: fill lead form with valid data for successful submission. */
  private async fillLeadFormWithValidData(form: Locator): Promise<void> {
    // Check the form id first, then fill: Canada forms also get the four extra fields.
    await fillLeadFormByFormId(form, getValidLeadData('condoCommunity'), {
      emailName: /email/i,
      selectCommunity: true,
      selectPlan: true
    });
  }

  /** Helper: find an available condo form by index. */
  private async getAvailableForm(
    formIndex: number,
    formName: string
  ): Promise<Locator | null> {
    const matchingForms = (await this.condoForms.count()) > 0
      ? this.condoForms
      : this.condoFormContainers;

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
      timeout: TIMEOUT.short
    });

    return form;
  }

  /** Helper: locate submit button inside a specific condo form. */
  private getSubmitButton(form: Locator): Locator {
    return form.getByRole('button', { name: TEXT.submit }).first();
  }

  /** Helper: click a form submit button without waiting on third-party submit requests. */
  private async clickSubmit(form: Locator): Promise<void> {
    const submitButton = this.getSubmitButton(form);

    await submitButton.scrollIntoViewIfNeeded();
    await expect(submitButton, 'Submit button should be visible before clicking')
      .toBeVisible({ timeout: TIMEOUT.short });
    await submitButton.click({
      force: true,
      noWaitAfter: true,
      timeout: 5000
    });
    await this.settle(800);
  }

  /** Helper: assert expected required-field messages within a lead form. */
  private async expectRequiredErrorsInForm(form: Locator): Promise<void> {
    await expectRequiredErrorsInForm(form, TIMEOUT.short);
  }

  /** Helper: assert invalid-email validation within a lead form. */
  private async expectInvalidEmailErrorInForm(form: Locator): Promise<void> {
    await expectInvalidEmailErrorInForm(form, TIMEOUT.short);
  }

  /* ==========================================================
     Floorplan Section Helpers
  ========================================================== */

  /** Helper: find the available floorplans section when it exists. */
  private async getAvailableFloorplansSectionIfAvailable(): Promise<Locator | null> {
    const heading = this.page.getByRole('heading', {
      name: TEXT.availableFloorplansHeading
    }).first();

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

  /** Helper: validate and log available floorplan links inside a section. */
  private async verifyAvailableFloorplanLinks(
    section: Locator,
    condoCommunityPath: string
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
      await expect(link, `Floorplan link ${floorplanLinkCount} should be visible`)
        .toBeVisible({ timeout: TIMEOUT.short });
      expect(href, `Floorplan link ${floorplanLinkCount} href missing`).toBeTruthy();
      expect(
        pathname,
        `Floorplan link ${floorplanLinkCount} should contain condo community path`
      ).toContain(condoCommunityPath);

      const planName = this.getPlanNameFromHref(href!);

      await this.reportValue(`${floorplanLinkCount}. ${planName}`, this.buildFullUrl(href!));
    }

    expect(
      floorplanLinkCount,
      'Explore available floorplans should include at least one floorplan link'
    ).toBeGreaterThan(0);

    await this.reportValue(`Validated ${floorplanLinkCount} condo floorplan link(s)`);
  }

  /** Helper: validate and follow the available floorplans View All link. */
  private async verifyAvailableFloorplansViewAll(
    section: Locator,
    expectedCommunity: string
  ): Promise<void> {
    const viewAllLink = section.locator('a[href]').filter({
      hasText: TEXT.viewAll
    }).first();

    await expect(viewAllLink, 'Explore available floorplans View All link missing')
      .toBeVisible({ timeout: TIMEOUT.short });

    const href = await viewAllLink.getAttribute('href');

    expect(href, 'Explore available floorplans View All href missing').toBeTruthy();
    expect(href, 'Explore available floorplans View All should not be an anchor/contact link')
      .not.toMatch(/^(#|mailto:|tel:|javascript:)/i);

    await this.reportValue('View All floorplans CTA URL', href);

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      viewAllLink.click()
    ]);

    await this.waitForPageReady();
    await expect(this.page, 'View All should redirect to Find Your Home/search page')
      .toHaveURL(/\/search|find-your-home/i);

    const decodedUrl = decodeURIComponent(this.page.url()).toLowerCase();
    const expectedCommunityText = expectedCommunity.toLowerCase();

    if (decodedUrl.includes(expectedCommunityText)) {
      return;
    }

    await expect(this.body, 'FYH page should contain the condo community name')
      .toContainText(new RegExp(escapeRegex(expectedCommunity), 'i'), {
        timeout: TIMEOUT.long
      });
  }

  /* ==========================================================
     Shared Helpers
  ========================================================== */

  /** Helper: assert a field is visible only when present in the form. */
  private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
    if (await field.count()) {
      await expect(field.first(), `${label} field should be visible`)
        .toBeVisible({ timeout: TIMEOUT.short });
    }
  }

  /** Helper: assert the H1 contains expected text. */
  private async expectHeadingContains(expectedText: string): Promise<void> {
    await expect(this.heading).toContainText(
      new RegExp(escapeRegex(expectedText), 'i')
    );
  }

  /** Helper: derive a readable plan name from a floorplan URL. */
  private getPlanNameFromHref(href: string): string {
    const pathname = getPathnameFromHref(href, this.page.url());
    const slug = pathname.split('/').filter(Boolean).pop();

    return slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Condo plan';
  }
}
