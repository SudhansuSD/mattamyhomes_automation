import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import {
    escapeRegex,
    getLastPathSegment,
    getMediaSource
} from '../utils/pageObjectUtils';
import { BasePage } from './BasePage';

export interface MPCConfig {
  name: string;
  url: string;
}

type MpcTab = 'Summary' | 'Home Details' | 'Contact & Hours';

export class MPCPage extends BasePage {
  /** Locator: main MPC page heading. */
  readonly heading: Locator;

  /** Locator: primary hero or app root container. */
  readonly heroSection: Locator;

  /** Locator: Summary tab button. */
  readonly summaryTab: Locator;

  /** Locator: Home Details tab button. */
  readonly homeDetailsTab: Locator;

  /** Locator: Contact & Hours tab button. */
  readonly contactHoursTab: Locator;

  /** Locator: neighborhood cards section. */
  readonly neighborhoodSection: Locator;

  /** Locator: community update form heading. */
  readonly communityUpdateHeading: Locator;

  /** Locator: optional MPC image gallery section. */
  readonly imageGallerySection: Locator;

  /** Locator: images inside the optional MPC image gallery. */
  readonly imageGalleryImages: Locator;

  /** Locator: media inside the optional MPC image gallery. */
  readonly imageGalleryMedia: Locator;

  /** Locator: React modal shown after successful form submission. */
  readonly successDialogModal: Locator;

  /** Setup: initialize MPC page locators. */
  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { level: 1 });
    this.heroSection = page.locator('main, #root').first();
    this.summaryTab = page.locator('button[aria-label="Summary"]').first();
    this.homeDetailsTab = page.locator('button[aria-label="Home Details"]').first();
    this.contactHoursTab = page.locator('button[aria-label="Contact & Hours"]').first();
    this.neighborhoodSection = page
      .locator('section')
      .filter({
        has: page.getByRole('heading', {
          name: /Explore neighborhoods in this community/i
        })
      })
      .first();
    this.communityUpdateHeading = page.getByRole('heading', {
      name: /Sign Up For Community Updates/i
    });
    this.imageGallerySection = page
      .locator('[role="region"][aria-label*="Images and videos of"]')
      .or(page.locator('#gallery'))
      .filter({ has: page.locator('img, picture, video, iframe, button') })
      .or(
        page.locator('section')
          .filter({ has: page.locator('img, picture, video, iframe, button') })
          .filter({
            has: page.getByRole('heading', {
              name: /gallery|photos|images/i
            })
          })
      )
      .or(
        page.locator('section')
          .filter({ has: page.locator('img, picture, video, iframe, button') })
          .filter({ hasText: /New Home Gallery|Community Gallery|Photos|Videos/i })
      )
      .first();
    this.imageGalleryImages = this.imageGallerySection.locator('img');
    this.imageGalleryMedia = this.imageGallerySection.locator('img, video, iframe, picture');
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /** Locator: Get Information CTA that opens the lead form sidebar/modal. */
  private get getInformationCta(): Locator {
    return this.page.locator('button:visible, a:visible').filter({
      hasText: /^\s*Get Information\s*$/i
    }).first();
  }

  /** Locator: Get Information lead form rendered in a modal, drawer, or sidebar. */
  private get leadFormDialogOrSidebar(): Locator {
    return this.page.locator(
      [
        '#ModalForm',
        '[id*="ModalForm"]',
        '[role="dialog"]',
        '.ReactModal__Content',
        'aside',
        '[class*="modal" i]',
        '[class*="drawer" i]',
        '[class*="sidebar" i]'
      ].join(', ')
    )
      .filter({ has: this.page.getByRole('button', { name: /submit|register|request|send/i }) })
      .filter({ has: this.page.locator('input, select, textarea') });
  }

  /** Locator: lead form success confirmation message. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  }

  /* ==========================================================
     Navigation
  ========================================================== */

  /** Action: navigate directly to an MPC page using its relative URL. */
  async navigateToMPC(relativeUrl: string): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig();
    const homeUrl = `${baseURL}/?${location.queryParam}`;
    const mpcUrl = `${baseURL}${relativeUrl}`;

    console.log(
      `[NAVIGATE MPC] ENV=${envName} | COUNTRY=${location.country} | HOME=${homeUrl} | MPC=${mpcUrl}`
    );

    await this.page.goto(homeUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.acceptCookiesIfPresent();
    await this.dismissBlockingOverlays();
    await this.waitForPageReady();

    await this.page.goto(mpcUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.acceptCookiesIfPresent();
    await this.dismissBlockingOverlays();
    await this.ensureConfiguredCountrySelected();
    await this.waitForPageReady();
  }

  /* ==========================================================
     Page Load
  ========================================================== */

  /** Verify: MPC page URL, title, and heading match expected configuration. */
  async verifyMPCPage(mpc: MPCConfig): Promise<void> {
    await this.waitForPageReady();

    await expect(this.page).toHaveURL(new RegExp(escapeRegex(mpc.url), 'i'));
    await expect(this.page).toHaveTitle(/Mattamy Homes/i);
    await expect(this.heading).toContainText(new RegExp(mpc.name, 'i'), {
      timeout: 20000
    });
  }

  /** Verify: MPC hero contains the expected community name and visible content. */
  async validateHeroContent(mpcName: string): Promise<void> {
    await expect(this.heading).toContainText(new RegExp(mpcName, 'i'));
    await expect(this.heroSection).toBeVisible({ timeout: 15000 });

    const heroText = await this.heroSection.innerText();
    expect(heroText.trim().length, 'MPC hero should include descriptive content')
      .toBeGreaterThan(mpcName.length);

    const favoriteButton = this.page.getByRole('button', {
      name: /Mark as favorite/i
    });

    if (await favoriteButton.count()) {
      await expect(favoriteButton.first()).toBeVisible();
    }
  }

  /* ==========================================================
     Tabs
  ========================================================== */

  /** Verify: Summary tab opens and displays expected community summary content. */
  async validateSummaryTab(): Promise<void> {
    const openedTab = await this.openTab('Summary');
    if (openedTab) {
      await expect(this.summaryTab).toHaveAttribute('aria-selected', 'true');
    }
    await expect(this.page.locator('body')).toContainText(
      /community|homes|neighborhood|designed|location/i,
      { timeout: 10000 }
    );
  }

  /** Verify: Home Details tab opens and displays expected detail headings. */
  async validateHomeDetailsTab(): Promise<void> {
    await this.openTab('Home Details');

    const expectedDetails = [
      /Home Types/i,
      /Bedrooms/i,
      /Full Bathrooms/i,
      /SQ\. FT\./i,
      /Stories/i,
      /Garages/i
    ];

    for (const detail of expectedDetails) {
      await expect(this.page.locator('body')).toContainText(detail, { timeout: 10000 });
    }
  }

  /** Verify: Contact & Hours tab opens and displays sales contact information. */
  async validateContactHoursTab(): Promise<void> {
    await this.openTab('Contact & Hours');

    await expect(this.page.locator('body')).toContainText(
      /Sales Office|New Home Gallery|Contact/i,
      { timeout: 10000 }
    );
    await expect(this.page.locator('body')).toContainText(/\d{3}-\d{3}-\d{4}/, { timeout: 10000 });
    await expect(this.page.locator('body')).toContainText(/Hours|Open|Closed/i, { timeout: 10000 });
  }

  /** Helper: open a named MPC tab when it is not already selected. */
  private async openTab(tabName: MpcTab): Promise<boolean> {
    await this.dismissBlockingOverlays();

    const tab = this.page.locator(`button[aria-label="${tabName}"]`).first();
    const hasTab = await tab.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasTab) {
      console.log(`${tabName} tab is not present in the current MPC layout - validating page content instead`);
      return false;
    }

    if (await tab.getAttribute('aria-selected') === 'true') {
      return true;
    }

    await tab.click();
    await this.waitForPageReady();
    return true;
  }

  /* ==========================================================
     Content Sections
  ========================================================== */

  /** Verify: MPC page includes at least one amenity or location section. */
  async validateAmenityAndLocationSections(): Promise<void> {
    const amenityOrLocationHeading = this.page.getByRole('heading', {
      name: /amenit|location|convenient|destination|lifestyle|nearby|explore/i
    });

    await expect(amenityOrLocationHeading.first()).toBeVisible({ timeout: 15000 });

    const matchingSectionCount = await this.page
      .locator('section')
      .filter({ has: amenityOrLocationHeading.first() })
      .count();

    expect(
      matchingSectionCount,
      'MPC page should include at least one amenity or location section'
    ).toBeGreaterThan(0);
  }

  /** Verify: promotional CTA points into the expected MPC URL path. */
  async validatePromotionCTA(mpcUrl: string): Promise<void> {
    const promotionButton = this.page
      .getByRole('button', { name: /View promotions/i })
      .first();

    if (await promotionButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await promotionButton.scrollIntoViewIfNeeded();
      await expect(promotionButton, 'Promotion CTA should be visible')
        .toBeVisible({ timeout: 10000 });
      return;
    }

    const exploreLink = this.page
      .locator(
        `a[href="${mpcUrl}"]:visible, a[href^="${mpcUrl}/"]:visible, a[href*="${mpcUrl}/"]:visible`
      )
      .first();

    await expect(
      exploreLink,
      `Expected a visible promotion CTA or community link under ${mpcUrl}`
    ).toBeVisible({ timeout: 10000 });

    const href = await exploreLink.getAttribute('href');
    expect(href, 'Community CTA href missing').toBeTruthy();
    expect(href).toContain(mpcUrl);
  }

  /** Verify: image gallery content and navigation when the optional gallery is available. */
  async validateImageGalleryIfAvailable(): Promise<void> {
    if (!(await this.isVisible(this.imageGallerySection, 5000))) {
      console.log('MPC image gallery not present - skipping validation');
      return;
    }

    await this.scrollTo(this.imageGallerySection);
    await expect(this.imageGallerySection, 'MPC image gallery should be visible')
      .toBeVisible({ timeout: 10000 });

    await this.showGalleryPhotosIfAvailable();

    const mediaCount = await this.imageGalleryMedia.count();
    expect(mediaCount, 'MPC image gallery should include at least one media item')
      .toBeGreaterThan(0);

    const firstMedia = this.getActiveGalleryMedia();
    await expect(firstMedia, 'First MPC gallery media should be visible')
      .toBeVisible({ timeout: 10000 });

    const src = await getMediaSource(firstMedia);
    expect(src, 'First MPC gallery media src missing').toBeTruthy();

    await firstMedia.click({ force: true });

    await expect(this.galleryModal, 'MPC gallery modal should open')
      .toBeVisible({ timeout: 10000 });
    await expect(this.galleryModal.locator('img, video, iframe, picture').first(), 'MPC gallery modal should show media')
      .toBeVisible({ timeout: 10000 });

    await this.navigateGalleryModalMediaIfAvailable();
    await this.closeGalleryModal();
  }

  /** Locator: visible MPC gallery modal/dialog after opening media. */
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

  /** Helper: return the currently active gallery slide media, excluding carousel/filter icons. */
  private getActiveGalleryMedia(): Locator {
    return this.imageGallerySection
      .locator(
        '.slick-active img:visible, .slick-active video:visible, .slick-active iframe:visible, .slick-active picture:visible'
      )
      .first();
  }

  /** Helper: switch the MPC gallery to photos before opening the modal when the filter exists. */
  private async showGalleryPhotosIfAvailable(): Promise<void> {
    const clickedPhotosFilter = await this.page.evaluate(() => {
      const photosControl = Array.from(document.querySelectorAll<HTMLElement>('[aria-label]'))
        .find((element) => /photos/i.test(element.getAttribute('aria-label') ?? ''));

      photosControl?.click();

      return Boolean(photosControl);
    });

    if (clickedPhotosFilter) {
      await this.page.waitForTimeout(1000);
    }
  }

  /** Helper: navigate gallery modal media when next/previous controls are available. */
  private async navigateGalleryModalMediaIfAvailable(): Promise<void> {
    const nextButton = this.galleryModal
      .locator('button[aria-label*="Next" i], button:has-text("Next")')
      .first();
    const previousButton = this.galleryModal
      .locator('button[aria-label*="Previous" i], button[aria-label*="Prev" i], button:has-text("Previous"), button:has-text("Prev")')
      .first();
    const initialMediaKey = await this.getVisibleGalleryModalMediaKey();

    expect(initialMediaKey, 'MPC gallery modal should expose a visible media source before navigation')
      .toBeTruthy();

    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click({ force: true });
      await expect(this.galleryModal.locator('img, video, iframe, picture').first(), 'MPC gallery modal media should remain visible after next')
        .toBeVisible({ timeout: 10000 });
      await expect
        .poll(
          () => this.getVisibleGalleryModalMediaKey(),
          {
            message: 'MPC gallery modal next control should navigate or keep visible media stable',
            timeout: 10000
          }
        )
        .not.toEqual('');
    }

    if (await previousButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previousButton.click({ force: true });
      await expect(this.galleryModal.locator('img, video, iframe, picture').first(), 'MPC gallery modal media should remain visible after previous')
        .toBeVisible({ timeout: 10000 });
    }
  }

  /** Helper: close the gallery modal with its close button or Escape fallback. */
  private async closeGalleryModal(): Promise<void> {
    if (await this.galleryModalCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.galleryModalCloseButton.click({ force: true });
    } else {
      await this.page.keyboard.press('Escape');
    }

    await expect(this.galleryModal, 'MPC gallery modal should close')
      .toBeHidden({ timeout: 10000 });
  }

  /** Helper: return the first visible media source rendered in the gallery modal. */
  private async getVisibleGalleryModalMediaKey(): Promise<string> {
    return getMediaSource(
      this.galleryModal
        .locator('img:visible, video:visible, iframe:visible, picture:visible')
        .first()
    );
  }

  /* ==========================================================
     Neighborhood Cards
  ========================================================== */

  /** Verify: neighborhood cards are visible and link under the expected MPC path. */
  async validateNeighborhoodCards(mpcName: string, mpcUrl: string): Promise<void> {
    await this.scrollTo(this.neighborhoodSection);
    await this.waitForPageReady();
    await expect(this.neighborhoodSection).toBeVisible({ timeout: 15000 });

    const currentMpcSegment = this.getCurrentMpcUrlSegment();
    const cardLinks = this.getNeighborhoodCardLinks();
    const count = await cardLinks.count();

    expect(
      currentMpcSegment,
      `Current MPC URL segment should be available for ${mpcName}`
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
      console.log(`Neighborhood card ${i + 1}: href='${href}' | current MPC segment='${currentMpcSegment}'`);
      expect(
        hrefSegments,
        `Neighborhood card ${i + 1} href should include the exact current MPC URL segment`
      ).toContain(currentMpcSegment);
      expect(
        cardText.trim().length,
        `Neighborhood card ${i + 1} should include visible content for ${mpcName}`
      ).toBeGreaterThan(0);
    }
  }

  /** Verify: first neighborhood card navigates to its detail page. */
  async validateFirstNeighborhoodNavigation(mpcUrl: string): Promise<void> {
    await this.scrollTo(this.neighborhoodSection);
    await this.waitForPageReady();
    await this.dismissBlockingOverlays();

    const firstNeighborhoodLink = this.getNeighborhoodCardLinks().first();
    const href = await firstNeighborhoodLink.getAttribute('href');

    expect(href, 'First neighborhood href missing').toBeTruthy();

    await firstNeighborhoodLink.click({ force: true });
    await this.waitForPageReady();
    await expect(this.page).toHaveURL(new RegExp(escapeRegex(href!), 'i'));
  }

  /** Helper: return visible neighborhood card links under the expected MPC path. */
  private getNeighborhoodCardLinks(): Locator {
    return this.neighborhoodSection
      .locator('a[href]:visible');
  }

  /** Helper: return the exact MPC path segment from the current page URL. */
  private getCurrentMpcUrlSegment(): string | undefined {
    return getLastPathSegment(this.page.url());
  }

  /* ==========================================================
     Lead Form
  ========================================================== */

  /** Verify: Get Information CTA opens the MPC lead form sidebar/modal. */
  async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
    await expect(this.getInformationCta, 'Get Information CTA should be visible')
      .toBeVisible({ timeout: 15000 });

    const form = await this.getAvailableGetInformationForm();

    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /first name/i }), 'First name');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /^email/i }), 'Email');
    await this.expectFieldIfPresent(form.getByRole('combobox', { name: /country of residence/i }), 'Country of Residence');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), 'Zip/Postal Code');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone');
    await expect(this.getSubmitButton(form), 'Get Information MPC form submit button should be visible')
      .toBeVisible({ timeout: 10000 });
  }

  /** Verify: Get Information MPC form shows required-field validation errors. */
  async validateGetInformationFormEmptyErrors(): Promise<void> {
    const form = await this.getAvailableGetInformationForm();

    await this.clickSubmit(form);
    await this.expectRequiredErrorsInForm(form);
  }

  /** Verify: Get Information MPC form rejects invalid email addresses. */
  async validateGetInformationFormInvalidEmail(): Promise<void> {
    const form = await this.getAvailableGetInformationForm();

    await this.fillGetInformationFormWithInvalidEmail(form);
    await this.clickSubmit(form);

    await this.expectInvalidEmailErrorInForm(form);
  }

  /** Verify: Get Information MPC form can be submitted successfully. */
  async verifyGetInformationFormSuccessSubmission(): Promise<void> {
    const form = await this.getAvailableGetInformationForm();

    await this.fillGetInformationFormWithValidData(form);
    await this.clickSubmit(form);

    if (await this.successDialogModal.count()) {
      await expect(this.successDialogModal.last()).toBeVisible({
        timeout: 10000
      });
    }

    await expect(this.formSuccessMessage).toBeVisible({ timeout: 10000 });
  }

  /** Verify: community update form fields and submit button are visible. */
  async validateCommunityUpdateFormFields(): Promise<void> {
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
      fields.terms,
      fields.submit
    ]) {
      await expect(field.first()).toBeVisible({ timeout: 10000 });
    }

    const options = await fields.community.locator('option').allTextContents();
    expect(
      options.filter((option) => option.trim().length > 0).length,
      'Community of Interest should include selectable communities'
    ).toBeGreaterThan(0);
  }

  /** Verify: community update form shows required-field validation errors. */
  async validateCommunityUpdateRequiredErrors(): Promise<void> {
    const form = await this.getCommunityUpdateForm();
    const fields = this.getCommunityUpdateFormFields(form);

    await fields.submit.click();

    await expect(form.locator('text=/Required|Please complete/i').first())
      .toBeVisible({ timeout: 10000 });
  }

  /** Verify: community update form rejects an invalid email address. */
  async validateCommunityUpdateInvalidEmail(): Promise<void> {
    const form = await this.getCommunityUpdateForm();
    const fields = this.getCommunityUpdateFormFields(form);

    await fields.community.selectOption({ index: 1 });
    await fields.firstName.fill('Test');
    await fields.lastName.fill('User');
    await fields.email.fill('user@domain.c');
    await fields.country.selectOption({ label: 'United States' });
    await fields.zip.fill('33545');
    await fields.phone.fill('8135551212');
    await fields.terms.check({ force: true });

    await fields.submit.click();

    await expect(form.getByText(/Email addresses must contain.*valid domain name/i))
      .toBeVisible({ timeout: 10000 });
  }

  /** Verify: community update form can be submitted successfully. */
  async submitCommunityUpdateFormSuccessfully(): Promise<void> {
    const form = await this.getCommunityUpdateForm();
    const fields = this.getCommunityUpdateFormFields(form);

    await fields.community.selectOption({ index: 1 });
    await fields.firstName.fill('Sudhansu');
    await fields.lastName.fill('Das');
    await fields.email.fill(`ssdas+mpc${Date.now()}@ex2india.com`);
    await fields.country.selectOption({ label: 'United States' });
    await fields.zip.fill('33545');
    await fields.phone.fill('8135551212');
    await fields.terms.check({ force: true });

    await fields.submit.click();

    if (await this.successDialogModal.count()) {
      await expect(this.successDialogModal.last()).toBeVisible({
        timeout: 10000
      });
    }

    await expect(
      this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last()
    ).toBeVisible({ timeout: 10000 });
  }

  /** Helper: find and return the community update form section. */
  private async getCommunityUpdateForm(): Promise<Locator> {
    await this.dismissBlockingOverlays();
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.waitForPageReady();

    await expect(this.communityUpdateHeading).toBeVisible({ timeout: 20000 });

    const form = this.page
      .locator('section')
      .filter({
        has: this.communityUpdateHeading
      })
      .filter({ has: this.page.locator('button[type="submit"]') })
      .first();

    await expect(form, 'Community update form section not found')
      .toBeVisible({ timeout: 10000 });

    return form;
  }

  /** Helper: return all fields used by the community update form. */
  private getCommunityUpdateFormFields(form: Locator) {
    return {
      community: form.getByRole('combobox', { name: /Community of Interest/i }),
      firstName: form.getByRole('textbox', { name: /First name/i }),
      lastName: form.getByRole('textbox', { name: /Last name/i }),
      email: form.getByRole('textbox', { name: /^Email/i }),
      country: form.getByRole('combobox', { name: /Country of Residence/i }),
      zip: form.getByRole('textbox', { name: /Zip|Postal/i }),
      phone: form.getByRole('textbox', { name: /Phone/i }),
      terms: form.getByRole('checkbox', {
        name: /I am providing express consent/i
      }),
      submit: form.locator('button[type="submit"]').first()
    };
  }

  /** Helper: click the Get Information CTA when the sidebar/modal form is not already open. */
  private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
    if (await this.leadFormDialogOrSidebar.count()) {
      return;
    }

    await expect(this.getInformationCta, 'Get Information CTA should be visible')
      .toBeVisible({ timeout: 15000 });

    const previousUrl = this.page.url();

    await this.getInformationCta.scrollIntoViewIfNeeded();
    await this.getInformationCta.click({ force: true });
    await this.waitForPageReady();
    await this.page.waitForTimeout(1000);

    expect(
      this.page.url(),
      `Get Information CTA should keep the MPC lead form flow on page, not redirect from ${previousUrl}`
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Helper: find the Get Information lead form after opening its CTA. */
  private async getAvailableGetInformationForm(
    formName = 'Get Information MPC form'
  ): Promise<Locator> {
    await this.dismissBlockingOverlays();
    await this.openLeadFormFromGetInformationCtaIfPresent();

    await expect
      .poll(
        () => this.leadFormDialogOrSidebar.count(),
        {
          message: `${formName} sidebar/modal should open after Get Information CTA`,
          timeout: 15000
        }
      )
      .toBeGreaterThan(0);

    const form = this.leadFormDialogOrSidebar.first();

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(this.getSubmitButton(form), `${formName} submit button should be visible inside sidebar/modal`)
      .toBeVisible({ timeout: 10000 });

    return form;
  }

  /** Helper: fill Get Information lead form with data that should fail email validation. */
  private async fillGetInformationFormWithInvalidEmail(form: Locator): Promise<void> {
    await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Test');
    await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'User');
    await this.fillIfPresent(form.getByRole('textbox', { name: /^email/i }), 'user@domain.c');
    await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '8135551212');
    await this.fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), '33545');

    await this.selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community of interest/i }).first());
    await this.selectCountryOfResidenceIfPresent(form);
    await this.checkConsentIfPresent(form);
  }

  /** Helper: fill Get Information lead form with valid data for successful submission. */
  private async fillGetInformationFormWithValidData(form: Locator): Promise<void> {
    await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Sudhansu');
    await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Das');
    await this.fillIfPresent(
      form.getByRole('textbox', { name: /^email/i }),
      `ssdas_mpc_getinfo_${Date.now()}@ex2india.com`
    );
    await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '8135551212');
    await this.fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), '33545');

    await this.selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community of interest/i }).first());
    await this.selectCountryOfResidenceIfPresent(form);
    await this.checkConsentIfPresent(form);
  }

  /** Helper: locate submit button inside a specific lead form. */
  private getSubmitButton(form: Locator): Locator {
    return form.getByRole('button', { name: /submit|register|request|send/i }).first();
  }

  /** Helper: click a form submit button without waiting on third-party submit requests. */
  private async clickSubmit(form: Locator): Promise<void> {
    const submitButton = this.getSubmitButton(form);

    await submitButton.scrollIntoViewIfNeeded();
    await expect(submitButton, 'Submit button should be visible before clicking')
      .toBeVisible({ timeout: 10000 });
    await submitButton.click({
      force: true,
      noWaitAfter: true,
      timeout: 5000
    });
    await this.page.waitForTimeout(800);
  }

  /** Helper: assert expected required-field messages within a lead form. */
  private async expectRequiredErrorsInForm(form: Locator): Promise<void> {
    await expect(form.locator('text=/Error:\\s*First name is Required|First name.*Required/i').first())
      .toBeVisible({ timeout: 10000 });
    await expect(form.locator('text=/Error:\\s*Last name is Required|Last name.*Required/i').first())
      .toBeVisible({ timeout: 10000 });
    await expect(form.locator('text=/Error:\\s*Email is Required|Email.*Required/i').first())
      .toBeVisible({ timeout: 10000 });
    await expect(form.locator('text=/Error:\\s*Country of Residence is Required|Country of Residence.*Required/i').first())
      .toBeVisible({ timeout: 10000 });
    await expect(form.locator('text=/Error:\\s*Zip\\/Postal Code is Required|Zip\\/Postal Code.*Required|Postal.*Required/i').first())
      .toBeVisible({ timeout: 10000 });
  }

  /** Helper: assert invalid-email validation within a lead form. */
  private async expectInvalidEmailErrorInForm(form: Locator): Promise<void> {
    await expect(form.locator(
      'text=/valid domain name|valid email|invalid email|Error:.*Email|Email.*Invalid/i'
    ).first()).toBeVisible({ timeout: 10000 });
  }

  /** Helper: assert a field is visible only when present in the form. */
  private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
    if (await field.count()) {
      await expect(field.first(), `${label} field should be visible`)
        .toBeVisible({ timeout: 10000 });
    }
  }

  /** Helper: fill a field only when it exists. */
  private async fillIfPresent(field: Locator, value: string): Promise<void> {
    if (await field.count()) {
      await field.first().fill(value);
    }
  }

  /** Helper: select the first non-placeholder option when a dropdown exists. */
  private async selectFirstOptionIfPresent(field: Locator): Promise<void> {
    if (!(await field.count())) {
      return;
    }

    await field.selectOption({ index: 1 }).catch(() => undefined);
  }

  /** Helper: select country of residence when the field exists. */
  private async selectCountryOfResidenceIfPresent(form: Locator): Promise<void> {
    const countryOfResidence = form.getByRole('combobox', {
      name: /country of residence/i
    }).first();

    if (!(await countryOfResidence.count())) {
      return;
    }

    const selectedPreferred = await countryOfResidence
      .selectOption({ label: 'United States' })
      .then(() => true)
      .catch(() => false);

    if (!selectedPreferred) {
      await countryOfResidence.selectOption({ index: 1 }).catch(() => undefined);
    }
  }

  /** Helper: check the first consent checkbox when present. */
  private async checkConsentIfPresent(form: Locator): Promise<void> {
    const checkbox = form.getByRole('checkbox', {
      name: /express consent|providing consent|privacy policy/i
    }).first();

    if (await checkbox.count()) {
      await checkbox.check({ force: true }).catch(() => undefined);
      return;
    }

    const fallbackCheckboxes = form.getByRole('checkbox');
    const count = await fallbackCheckboxes.count();

    for (let i = 0; i < count; i++) {
      const candidate = fallbackCheckboxes.nth(i);
      const label = await candidate.getAttribute('aria-label').catch(() => null);

      if (label && /real estate agent/i.test(label)) {
        continue;
      }

      await candidate.check({ force: true }).catch(() => undefined);
      return;
    }
  }

  /** Helper: return true when a locator becomes visible within the timeout. */
  private async isVisible(locator: Locator, timeout = 2000): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false);
  }

  /** Helper: dismiss country, cookie, and modal overlays that can block interactions. */
  private async dismissBlockingOverlays(): Promise<void> {
    const usaCountryButton = this.page
      .locator('.ReactModalPortal')
      .getByRole('button', { name: /^USA$/i })
      .first();

    if (await usaCountryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await usaCountryButton.click({ force: true });
      await this.page.waitForTimeout(1000);
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
      '.ReactModalPortal button[aria-label="Close"], .ReactModalPortal button:has-text("Close Icon")'
    );
    const closeCount = await modalCloseButtons.count();

    for (let i = 0; i < closeCount; i++) {
      const closeButton = modalCloseButtons.nth(i);
      if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeButton.click({ force: true });
      }
    }
  }

  /** Helper: select the configured country from the header country selector when needed. */
  private async ensureConfiguredCountrySelected(): Promise<void> {
    const expectedCountry = getLocationConfig().country === 'USA' ? 'USA' : 'CANADA';
    const countrySelector = this.page
      .locator('button[aria-label^="Select your country."]')
      .first();

    if (!(await countrySelector.isVisible({ timeout: 5000 }).catch(() => false))) {
      return;
    }

    const currentLabel = await countrySelector.getAttribute('aria-label').catch(() => '');

    if (currentLabel && new RegExp(`${expectedCountry} country is selected`, 'i').test(currentLabel)) {
      return;
    }

    await countrySelector.click({ force: true });
    await this.page.waitForTimeout(500);

    const expectedCountryButton = this.page
      .getByRole('button', { name: new RegExp(`^${expectedCountry}$`, 'i') })
      .last();

    if (await expectedCountryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expectedCountryButton.click({ force: true });
      await this.waitForPageReady();
    }
  }
}
