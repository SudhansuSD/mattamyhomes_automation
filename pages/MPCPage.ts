import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { escapeRegex, getLastPathSegment, getMediaSource } from '../utils/web/pageObjectUtils';
import {
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  expectSideModalFormFields,
  fillInvalidSideModalForm,
  fillValidSideModalForm,
  getConsentCheckbox,
  getInvalidLeadData,
  getSubmitButton,
  getValidLeadData,
  LeadFieldData,
} from '../utils/leadform/leadFormHelper';
import { BasePage } from './BasePage';

export interface MPCConfig {
  name: string;
  url: string;
}

type MpcTab = 'Summary' | 'Home Details' | 'Contact & Hours';

export class MPCPage extends BasePage {
  /** The MPC's main heading. */
  readonly heading: Locator;

  /** The hero banner at the top of the page. */
  readonly heroSection: Locator;

  /** The Summary tab. */
  readonly summaryTab: Locator;

  /** The Home Details tab. */
  readonly homeDetailsTab: Locator;

  /** The Contact & Hours tab. */
  readonly contactHoursTab: Locator;

  /** The section holding the neighbourhood cards. */
  readonly neighborhoodSection: Locator;

  /** The community updates form heading. */
  readonly communityUpdateHeading: Locator;

  /** The image gallery section, which not every MPC has. */
  readonly imageGallerySection: Locator;

  /** The images inside the gallery. */
  readonly imageGalleryImages: Locator;

  /** The images and videos inside the gallery. */
  readonly imageGalleryMedia: Locator;

  /** The confirmation modal shown after a successful submission. */
  readonly successDialogModal: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    // Master-Planned Communities are a USA-only offering, so this page always
    // runs against the USA site regardless of the LOCATION the run started with.
    super(page, 'USA');

    this.heading = page.getByRole('heading', { level: 1 });
    this.heroSection = page.locator('main, #root').first();
    this.summaryTab = page.locator('button[aria-label="Summary"]').first();
    this.homeDetailsTab = page.locator('button[aria-label="Home Details"]').first();
    this.contactHoursTab = page.locator('button[aria-label="Contact & Hours"]').first();
    this.neighborhoodSection = page
      .locator('section')
      .filter({
        has: page.getByRole('heading', {
          name: /Explore neighborhoods in this community/i,
        }),
      })
      .first();
    this.communityUpdateHeading = page.getByRole('heading', {
      name: /Sign Up For Community Updates/i,
    });
    this.imageGallerySection = page
      .locator('[role="region"][aria-label*="Images and videos of"]')
      .or(page.locator('#gallery'))
      .filter({ has: page.locator('img, picture, video, iframe') })
      .or(
        page
          .locator('section')
          .filter({ has: page.locator('img, picture, video, iframe') })
          .filter({
            has: page.getByRole('heading', {
              name: /gallery|photos|images/i,
            }),
          }),
      )
      .or(
        page
          .locator('section')
          .filter({ has: page.locator('img, picture, video, iframe') })
          .filter({ hasText: /New Home Gallery|Community Gallery|Photos|Videos/i }),
      )
      .first();
    this.imageGalleryImages = this.imageGallerySection.locator('img');
    this.imageGalleryMedia = this.imageGallerySection.locator('img, video, iframe, picture');
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** The Get Information CTA that opens the lead form. */
  private get getInformationCta(): Locator {
    return this.page
      .locator('button:visible, a:visible')
      .filter({
        hasText: /^\s*Get Information\s*$/i,
      })
      .first();
  }

  /** The Get Information form, wherever it opens - modal, drawer or sidebar. */
  private get leadFormDialogOrSidebar(): Locator {
    return (
      this.page
        .locator(
          [
            '#ModalForm',
            '[id*="ModalForm"]',
            '[role="dialog"]',
            '.ReactModal__Content',
            'aside',
            '[class*="modal" i]',
            '[class*="drawer" i]',
            '[class*="sidebar" i]',
          ].join(', '),
        )
        // visible: the page pre-renders hidden ModalForm/drawer shells that also
        // contain inputs, so an unfiltered set reports the modal as already open
        // and hands back a hidden container. and(): excludes the full-screen
        // National-promotion overlay, whose aria-label sits on the element itself
        // (filter({ hasNot }) only inspects descendants).
        .filter({ visible: true })
        .filter({ has: this.page.getByRole('button', { name: /submit|register|request|send/i }) })
        .filter({ has: this.page.locator('input, select, textarea') })
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

  // Navigation

  /** Opens an MPC page straight from its relative URL. */
  async navigateToMPC(relativeUrl: string): Promise<void> {
    await this.step(`Navigate to MPC page: ${relativeUrl}`, async () => {
      const { baseURL, envName } = getEnvConfig();
      const location = this.location;
      const homeUrl = `${baseURL}/?${location.queryParam}`;
      const mpcUrl = `${baseURL}${relativeUrl}`;

      await this.reportValue(
        'MPC navigation',
        `ENV=${envName} | COUNTRY=${location.country} | MPC=${mpcUrl}`,
      );

      await this.page.goto(homeUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });

      await this.acceptCookiesIfPresent();
      await this.dismissBlockingOverlays();
      await this.waitForPageReady();

      await this.page.goto(mpcUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });

      await this.acceptCookiesIfPresent();
      await this.dismissBlockingOverlays();
      await this.ensureConfiguredCountrySelected();
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  // Page Load

  /** Checks the URL, tab title and heading match the MPC we asked for. */
  async verifyMPCPage(mpc: MPCConfig): Promise<void> {
    await this.step(`Verify MPC page: ${mpc.name}`, async () => {
      await this.waitForPageReady();

      await expect
        .poll(
          async () => {
            if (
              await this.heading
                .first()
                .isVisible({ timeout: 1000 })
                .catch(() => false)
            ) {
              return true;
            }

            await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
            return this.heading
              .first()
              .isVisible({ timeout: 1000 })
              .catch(() => false);
          },
          {
            message:
              'MPC heading should become accessible after promotional overlays are dismissed',
            timeout: 30_000,
          },
        )
        .toBeTruthy();

      await this.assertPageUrlContains(
        mpc.url,
        `MPC page URL should contain configured path: ${mpc.url}`,
      );
      await this.assertPageTitle(/Mattamy Homes/i, 'MPC page title should include Mattamy Homes');
      await this.assertTextContains(
        this.heading,
        new RegExp(mpc.name, 'i'),
        `MPC page heading should contain configured name: ${mpc.name}`,
        20_000,
      );
    });
  }

  /** Checks the hero names this MPC and shows real content. */
  async validateHeroContent(mpcName: string): Promise<void> {
    await this.step(`Validate MPC hero content: ${mpcName}`, async () => {
      await this.assertTextContains(
        this.heading,
        new RegExp(mpcName, 'i'),
        `MPC hero heading should contain ${mpcName}`,
      );
      await this.assertVisible(this.heroSection, 'MPC hero section should be visible', 15_000);

      const heroText = await this.heroSection.innerText();
      this.assertGreaterThan(
        heroText.trim().length,
        mpcName.length,
        'MPC hero should include descriptive content',
      );

      const favoriteButton = this.page.getByRole('button', {
        name: /Mark as favorite/i,
      });

      if (await favoriteButton.count()) {
        await this.assertVisible(
          favoriteButton.first(),
          'MPC favorite button should be visible when present',
        );
      }
    });
  }

  // Tabs

  /** Checks the Summary tab opens and shows its community content. */
  async validateSummaryTab(): Promise<void> {
    await this.step('Validate Summary tab', async () => {
      const openedTab = await this.openTab('Summary');
      if (openedTab) {
        await this.assertAttribute(
          this.summaryTab,
          'aria-selected',
          'true',
          'MPC Summary tab should be selected after opening',
        );
      }
      await this.assertBodyContains(
        /community|homes|neighborhood|designed|location/i,
        'MPC Summary tab should display community summary content',
      );
    });
  }

  /** Checks the Home Details tab opens and shows its headings. */
  async validateHomeDetailsTab(): Promise<void> {
    await this.step('Validate Home Details tab', async () => {
      await this.openTab('Home Details');

      const expectedDetails = [
        /Home Types/i,
        /Bedrooms/i,
        /Full Bathrooms/i,
        /SQ\. FT\./i,
        /Stories/i,
        /Garages/i,
      ];

      for (const detail of expectedDetails) {
        await this.assertBodyContains(detail, `MPC Home Details tab should display ${detail}`);
      }
    });
  }

  /** Checks the Contact & Hours tab opens and shows the sales contact details. */
  async validateContactHoursTab(): Promise<void> {
    await this.step('Validate Contact & Hours tab', async () => {
      await this.openTab('Contact & Hours');

      await this.assertBodyContains(
        /Sales Office|New Home Gallery|Contact/i,
        'MPC Contact & Hours tab should display sales contact content',
      );
      await this.assertBodyContains(
        /\d{3}-\d{3}-\d{4}/,
        'MPC Contact & Hours tab should display phone number',
      );
      await this.assertBodyContains(
        /Hours|Open|Closed/i,
        'MPC Contact & Hours tab should display hours',
      );
    });
  }

  /** Opens a tab, unless it is already the selected one. */
  private async openTab(tabName: MpcTab): Promise<boolean> {
    await this.dismissBlockingOverlays();

    const tab = this.page.locator(`button[aria-label="${tabName}"]`).first();
    const hasTab = await tab.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasTab) {
      await this.reportValue(
        `${tabName} tab is not present in the current MPC layout - validating page content instead`,
      );
      return false;
    }

    if ((await tab.getAttribute('aria-selected')) === 'true') {
      return true;
    }

    await tab.click();
    await this.waitForPageReady();
    return true;
  }

  // Content Sections

  /** Checks the page has an amenities or location section. */
  async validateAmenityAndLocationSections(): Promise<void> {
    await this.step('Validate amenity and location sections', async () => {
      const amenityOrLocationHeading = this.page.getByRole('heading', {
        name: /amenit|location|convenient|destination|lifestyle|nearby|explore/i,
      });

      await expect(amenityOrLocationHeading.first()).toBeVisible({ timeout: 15000 });

      const matchingSectionCount = await this.page
        .locator('section')
        .filter({ has: amenityOrLocationHeading.first() })
        .count();

      expect(
        matchingSectionCount,
        'MPC page should include at least one amenity or location section',
      ).toBeGreaterThan(0);
    });
  }

  /** Checks the promo CTA links back into this MPC. */
  async validatePromotionCTA(mpcUrl: string): Promise<void> {
    await this.step('Validate promotion CTA', async () => {
      const promotionButton = this.page.getByRole('button', { name: /View promotions/i }).first();

      if (await promotionButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await promotionButton.scrollIntoViewIfNeeded();
        await expect(promotionButton, 'Promotion CTA should be visible').toBeVisible({
          timeout: 10000,
        });
        return;
      }

      const exploreLink = this.page
        .locator(
          `a[href="${mpcUrl}"]:visible, a[href^="${mpcUrl}/"]:visible, a[href*="${mpcUrl}/"]:visible`,
        )
        .first();

      await expect(
        exploreLink,
        `Expected a visible promotion CTA or community link under ${mpcUrl}`,
      ).toBeVisible({ timeout: 10000 });

      const href = await exploreLink.getAttribute('href');
      expect(href, 'Community CTA href missing').toBeTruthy();
      expect(href).toContain(mpcUrl);
    });
  }

  /** Checks the gallery shows media and its controls move between items. */
  async validateImageGallery(): Promise<void> {
    await this.step('Validate image gallery (if available)', async () => {
      if (
        !(await this.isFeaturePresent(
          this.imageGallerySection,
          'mpc.imageGallery',
          'MPC image gallery',
        ))
      ) {
        return;
      }

      await this.scrollTo(this.imageGallerySection);
      await expect(this.imageGallerySection, 'MPC image gallery should be visible').toBeVisible({
        timeout: 10000,
      });

      await this.showGalleryPhotosIfAvailable();

      // Poll rather than count once: the gallery is a carousel whose slides load
      // lazily, so an immediate count can read 0 on a gallery that does populate a
      // moment later. A gallery that still has no media after this is a genuine
      // finding, not a timing artefact.
      const mediaCount = await expect
        .poll(() => this.imageGalleryMedia.count(), {
          message: 'MPC image gallery should include at least one media item',
          timeout: 15000,
        })
        .toBeGreaterThan(0)
        .then(() => this.imageGalleryMedia.count())
        .catch(() => 0);

      expect(
        mediaCount,
        'MPC image gallery should include at least one media item',
      ).toBeGreaterThan(0);

      const firstMedia = this.getActiveGalleryMedia();
      await expect(firstMedia, 'First MPC gallery media should be visible').toBeVisible({
        timeout: 10000,
      });

      const src = await getMediaSource(firstMedia);
      expect(src, 'First MPC gallery media src missing').toBeTruthy();

      await firstMedia.click();

      await expect(this.galleryModal, 'MPC gallery modal should open').toBeVisible({
        timeout: 10000,
      });
      await expect(
        this.galleryModal.locator('img, video, iframe, picture').first(),
        'MPC gallery modal should show media',
      ).toBeVisible({ timeout: 10000 });

      await this.navigateGalleryModalMediaIfAvailable();
      await this.closeGalleryModal();
    });
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

  /** Returns the media on the active gallery slide, ignoring the carousel and filter icons. */
  private getActiveGalleryMedia(): Locator {
    return this.imageGallerySection
      .locator(
        '.slick-active img:visible, .slick-active video:visible, .slick-active iframe:visible, .slick-active picture:visible',
      )
      .first();
  }

  /** Switches the gallery to photos first, when it offers that filter. */
  private async showGalleryPhotosIfAvailable(): Promise<void> {
    const clickedPhotosFilter = await this.page.evaluate(() => {
      const photosControl = Array.from(document.querySelectorAll<HTMLElement>('[aria-label]')).find(
        (element) => /photos/i.test(element.getAttribute('aria-label') ?? ''),
      );

      photosControl?.click();

      return Boolean(photosControl);
    });

    if (clickedPhotosFilter) {
      await this.settle(1000);
    }
  }

  /** Steps through the gallery modal with its next/previous controls, when it has them. */
  private async navigateGalleryModalMediaIfAvailable(): Promise<void> {
    const nextButton = this.galleryModal.getByRole('button', { name: /next/i }).first();
    const previousButton = this.galleryModal
      .locator(
        'button[aria-label*="Previous" i], button[aria-label*="Prev" i], button:has-text("Previous"), button:has-text("Prev")',
      )
      .first();
    const initialMediaKey = await this.getVisibleGalleryModalMediaKey();

    expect(
      initialMediaKey,
      'MPC gallery modal should expose a visible media source before navigation',
    ).toBeTruthy();

    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await expect(
        this.galleryModal.locator('img, video, iframe, picture').first(),
        'MPC gallery modal media should remain visible after next',
      ).toBeVisible({ timeout: 10000 });
      await expect
        .poll(() => this.getVisibleGalleryModalMediaKey(), {
          message: 'MPC gallery modal next control should navigate or keep visible media stable',
          timeout: 10000,
        })
        .not.toEqual('');
    }

    if (await previousButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previousButton.click();
      await expect(
        this.galleryModal.locator('img, video, iframe, picture').first(),
        'MPC gallery modal media should remain visible after previous',
      ).toBeVisible({ timeout: 10000 });
    }
  }

  /** Closes the gallery modal, falling back to Escape when there is no close button. */
  private async closeGalleryModal(): Promise<void> {
    if (await this.galleryModalCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.galleryModalCloseButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }

    await expect(this.galleryModal, 'MPC gallery modal should close').toBeHidden({
      timeout: 10000,
    });
  }

  /** Returns the source of the first media showing in the gallery modal. */
  private async getVisibleGalleryModalMediaKey(): Promise<string> {
    return getMediaSource(
      this.galleryModal
        .locator('img:visible, video:visible, iframe:visible, picture:visible')
        .first(),
    );
  }

  // Neighborhood Cards

  /** Checks the neighbourhood cards are shown and link back under this MPC. */
  async validateNeighborhoodCards(mpcName: string, _mpcUrl: string): Promise<void> {
    await this.step(`Validate neighborhood cards: ${mpcName}`, async () => {
      await this.scrollTo(this.neighborhoodSection);
      await this.waitForPageReady();
      await expect(this.neighborhoodSection).toBeVisible({ timeout: 15000 });

      const currentMpcSegment = this.getCurrentMpcUrlSegment();
      const cardLinks = this.getNeighborhoodCardLinks();
      const count = await cardLinks.count();

      expect(
        currentMpcSegment,
        `Current MPC URL segment should be available for ${mpcName}`,
      ).toBeTruthy();
      expect(count, 'MPC page should show neighborhood cards').toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const link = cardLinks.nth(i);
        const href = await link.getAttribute('href');
        const hrefSegments = href
          ? new URL(href, this.page.url()).pathname.toLowerCase().split('/').filter(Boolean)
          : [];
        const cardText = await link.innerText();

        expect(href, `Neighborhood card ${i + 1} href missing`).toBeTruthy();
        expect(
          hrefSegments,
          `Neighborhood card ${i + 1} href should include the exact current MPC URL segment`,
        ).toContain(currentMpcSegment);
        expect(
          cardText.trim().length,
          `Neighborhood card ${i + 1} should include visible content for ${mpcName}`,
        ).toBeGreaterThan(0);

        await this.reportValue(`${i + 1}. ${cardText.trim()}`, this.buildFullUrl(href));
      }

      await this.reportValue(`Validated ${count} neighborhood card(s)`);
    });
  }

  /** Clicks the first neighbourhood card and checks it opens that neighbourhood's page. */
  async validateFirstNeighborhoodNavigation(_mpcUrl: string): Promise<void> {
    await this.step('Validate first neighborhood card navigation', async () => {
      await this.scrollTo(this.neighborhoodSection);
      await this.waitForPageReady();
      await this.dismissBlockingOverlays();

      const firstNeighborhoodLink = this.getNeighborhoodCardLinks().first();
      const href = await firstNeighborhoodLink.getAttribute('href');

      expect(href, 'First neighborhood href missing').toBeTruthy();

      await this.reportValue('First neighborhood card', this.buildFullUrl(href));

      await firstNeighborhoodLink.click();
      await this.waitForPageReady();
      await expect(this.page).toHaveURL(new RegExp(escapeRegex(href!), 'i'));
    });
  }

  /** Returns the visible neighbourhood card links that sit under this MPC. */
  private getNeighborhoodCardLinks(): Locator {
    return this.neighborhoodSection.locator('a[href]:visible');
  }

  /** Pulls this MPC's path segment out of the current URL. */
  private getCurrentMpcUrlSegment(): string | undefined {
    return getLastPathSegment(this.page.url());
  }

  // Lead Form

  /** Checks the Get Information CTA opens the side modal form. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await this.step('Verify Get Information CTA opens lead form', async () => {
      await expect(this.getInformationCta, 'Get Information CTA should be visible').toBeVisible({
        timeout: 15000,
      });

      const form = await this.getAvailableGetInformationForm();

      await expect(form, 'Get Information MPC sideModalForm should be visible').toBeVisible({
        timeout: 10000,
      });
    });
  }

  /** Checks the side modal form shows its fields. */
  async verifySideModalFormFields(): Promise<void> {
    await this.step('Validate Get Information sideModalForm fields', async () => {
      const form = await this.getAvailableGetInformationForm();
      await expectSideModalFormFields(form, { timeout: 10000, expectCommunity: true });
    });
  }

  /** Submits the empty side modal form and checks the required-field errors appear. */
  async validateSideModalFormRequiredErrors(): Promise<void> {
    await this.step('Validate Get Information sideModalForm required errors', async () => {
      const form = await this.getAvailableGetInformationForm();
      await this.clickSubmit(form);
      await expectRequiredErrorsInForm(form);
    });
  }

  /** Checks the side modal form rejects an invalid email address. */
  async validateSideModalFormInvalidEmail(): Promise<void> {
    await this.step('Validate Get Information sideModalForm invalid email', async () => {
      const form = await this.getAvailableGetInformationForm();
      await this.fillGetInformationFormWithInvalidEmail(form);
      await this.clickSubmit(form);
      await expectInvalidEmailErrorInForm(form);
    });
  }

  /** Fills the side modal form with valid data and checks it submits. */
  async verifySideModalFormSuccessSubmission(): Promise<void> {
    await this.step('Submit Get Information sideModalForm successfully', async () => {
      const form = await this.getAvailableGetInformationForm();

      await this.fillGetInformationFormWithValidData(form);
      await this.submitLeadFormAndCaptureApi({
        form: form,
        formName: 'Get Information MPC sideModalForm',
        submitButton: getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
      });
    });
  }

  /** Checks the community updates form shows its fields and submit button. */
  async validateCommunityUpdateFormFields(): Promise<void> {
    await this.step('Validate community update form fields', async () => {
      const form = await this.getCommunityUpdateForm();
      const fields = this.getCommunityUpdateFormFields(form);

      for (const field of [
        fields.community,
        fields.firstName,
        fields.lastName,
        fields.email,
        fields.country,
        fields.zip,
        fields.phone,
        fields.submit,
      ]) {
        await expect(field.first()).toBeVisible({ timeout: 10000 });
      }

      await expect(
        fields.terms,
        'Community update consent checkbox should be present',
      ).toBeAttached({
        timeout: 10000,
      });

      const options = await fields.community.locator('option').allTextContents();
      expect(
        options.filter((option) => option.trim().length > 0).length,
        'Community of Interest should include selectable communities',
      ).toBeGreaterThan(0);
    });
  }

  /** Submits the empty community updates form and checks the required-field errors appear. */
  async validateCommunityUpdateRequiredErrors(): Promise<void> {
    await this.step('Validate community update required errors', async () => {
      const form = await this.getCommunityUpdateForm();
      const fields = this.getCommunityUpdateFormFields(form);

      await fields.submit.click();

      await expect(form.locator('text=/Required|Please complete/i').first()).toBeVisible({
        timeout: 10000,
      });
    });
  }

  /** Checks the community updates form rejects an invalid email address. */
  async validateCommunityUpdateInvalidEmail(): Promise<void> {
    await this.step('Validate community update invalid email', async () => {
      const form = await this.getCommunityUpdateForm();
      const fields = this.getCommunityUpdateFormFields(form);

      const invalid = getInvalidLeadData('mpc');

      await this.fillCommunityUpdateFormFields(fields, invalid);

      await fields.submit.click();

      await expect(form.getByText(/Email addresses must contain.*valid domain name/i)).toBeVisible({
        timeout: 10000,
      });
    });
  }

  /** Fills the community updates form with valid data and checks it submits. */
  async submitCommunityUpdateFormSuccessfully(): Promise<void> {
    await this.step('Submit community update form successfully', async () => {
      const form = await this.getCommunityUpdateForm();
      const fields = this.getCommunityUpdateFormFields(form);

      const valid = getValidLeadData('mpc');

      await this.fillCommunityUpdateFormFields(fields, valid);

      await this.submitLeadFormAndCaptureApi({
        form: form,
        formName: 'MPC community update form',
        submitButton: fields.submit,
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
      });
    });
  }

  /** Returns the community updates form, scrolled into view. */
  private async getCommunityUpdateForm(): Promise<Locator> {
    await this.dismissBlockingOverlays();
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.waitForPageReady();

    await expect(this.communityUpdateHeading).toBeVisible({ timeout: 20000 });

    const form = this.page
      .locator('section')
      .filter({
        has: this.communityUpdateHeading,
      })
      .filter({ has: this.page.locator('button[type="submit"]') })
      .first();

    await expect(form, 'Community update form section not found').toBeVisible({ timeout: 10000 });

    return form;
  }

  /** Returns every field of the community updates form in one object. */
  private getCommunityUpdateFormFields(form: Locator) {
    return {
      community: form.getByRole('combobox', { name: /Community of Interest/i }),
      firstName: form.getByRole('textbox', { name: /First name/i }),
      lastName: form.getByRole('textbox', { name: /Last name/i }),
      email: form.getByRole('textbox', { name: /^Email/i }),
      country: form.getByRole('combobox', { name: /Country of Residence/i }),
      zip: form.getByRole('textbox', { name: /Zip|Postal/i }),
      phone: form.getByRole('textbox', { name: /Phone/i }),
      terms: getConsentCheckbox(form),
      submit: form.locator('button[type="submit"]').first(),
    };
  }

  /** Fills the community updates form, including its dropdowns and consent boxes. */
  private async fillCommunityUpdateFormFields(
    fields: ReturnType<MPCPage['getCommunityUpdateFormFields']>,
    leadData: LeadFieldData,
  ): Promise<void> {
    await fields.community.selectOption({ index: 1 });
    await fields.firstName.fill(leadData.firstName);
    await fields.lastName.fill(leadData.lastName);
    await fields.email.fill(leadData.email);
    await fields.country.selectOption({ label: leadData.country });
    await fields.zip.fill(leadData.zip);
    await fields.phone.fill(leadData.phone);
    await fields.terms.check({ force: true }).catch(() => undefined);
  }

  /** Clicks the Get Information CTA, unless the form is already open. */
  private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
    if (await this.leadFormDialogOrSidebar.count()) {
      return;
    }

    await expect(this.getInformationCta, 'Get Information CTA should be visible').toBeVisible({
      timeout: 15000,
    });

    const previousUrl = this.page.url();

    await this.getInformationCta.scrollIntoViewIfNeeded();
    await this.getInformationCta.click();
    await this.waitForPageReady();
    await this.settle(1000);

    expect(
      this.page.url(),
      `Get Information CTA should keep the MPC lead form flow on page, not redirect from ${previousUrl}`,
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Returns the Get Information form once its CTA has opened it. */
  private async getAvailableGetInformationForm(
    formName = 'Get Information MPC form',
  ): Promise<Locator> {
    await this.dismissBlockingOverlays();
    await this.openLeadFormFromGetInformationCtaIfPresent();

    await expect
      .poll(() => this.leadFormDialogOrSidebar.count(), {
        message: `${formName} sidebar/modal should open after Get Information CTA`,
        timeout: 15000,
      })
      .toBeGreaterThan(0);

    const form = this.leadFormDialogOrSidebar.first();

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(
      getSubmitButton(form),
      `${formName} submit button should be visible inside sidebar/modal`,
    ).toBeVisible({ timeout: 10000 });

    return form;
  }

  /** Fills the side modal form with a deliberately bad email address. */
  private async fillGetInformationFormWithInvalidEmail(form: Locator): Promise<void> {
    await fillInvalidSideModalForm(form, 'mpc', { selectCommunity: true });
  }

  /** Fills the side modal form with valid lead data. */
  private async fillGetInformationFormWithValidData(form: Locator): Promise<void> {
    await fillValidSideModalForm(form, 'mpcGetInfo', { selectCommunity: true });
  }

  /** Clicks a form's submit button without waiting on the third-party request behind it. */
  private async clickSubmit(form: Locator): Promise<void> {
    await clickSubmit(this.page, form, 10000, { settle: (ms) => this.settle(ms) });
  }

  /** Returns whether an element turns up within the timeout. */
  private async isVisible(locator: Locator, timeout = 2000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  /** Clears the country picker, cookie banner and modals that can block clicks. */
  private async dismissBlockingOverlays(): Promise<void> {
    const usaCountryButton = this.page
      .locator('.ReactModalPortal')
      .getByRole('button', { name: /^USA$/i })
      .first();

    if (await usaCountryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await usaCountryButton.click({ force: true });
      await this.settle(1000);
    }

    const cookieAccept = this.page.locator('#onetrust-accept-btn-handler');
    if (await cookieAccept.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieAccept.click({ force: true });
    }

    const cookieClose = this.page.locator('.onetrust-close-btn-handler').first();
    if (await cookieClose.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cookieClose.dispatchEvent('click').catch(async () => {
        await cookieClose.click({ force: true });
      });
    }

    const modalCloseButtons = this.page.locator(
      '.ReactModalPortal button[aria-label="Close"], .ReactModalPortal button:has-text("Close Icon")',
    );
    const closeCount = await modalCloseButtons.count();

    for (let i = 0; i < closeCount; i++) {
      const closeButton = modalCloseButtons.nth(i);
      if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeButton.click({ force: true });
      }
    }
  }
}
