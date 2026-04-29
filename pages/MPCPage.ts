import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';

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
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  /* ==========================================================
     Navigation
  ========================================================== */

  /** Action: navigate directly to an MPC page using its relative URL. */
  async navigateToMPC(relativeUrl: string): Promise<void> {
    const { baseURL } = getEnvConfig();

    await this.page.goto(`${baseURL}${relativeUrl}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.acceptCookiesIfPresent();
    await this.dismissBlockingOverlays();
    await this.waitForPageReady();
  }

  /* ==========================================================
     Page Load
  ========================================================== */

  /** Verify: MPC page URL, title, and heading match expected configuration. */
  async verifyMPCPage(mpc: MPCConfig): Promise<void> {
    await this.waitForPageReady();

    await expect(this.page).toHaveURL(new RegExp(this.escapeRegex(mpc.url), 'i'));
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
    await this.openTab('Summary');
    await expect(this.summaryTab).toHaveAttribute('aria-selected', 'true');
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
      await expect(this.page.getByRole('heading', { name: detail }).first())
        .toBeVisible({ timeout: 10000 });
    }
  }

  /** Verify: Contact & Hours tab opens and displays sales contact information. */
  async validateContactHoursTab(): Promise<void> {
    await this.openTab('Contact & Hours');

    await expect(this.page.getByRole('heading', { name: /Sales Office|New Home Gallery|Contact/i }).first())
      .toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText(/\d{3}-\d{3}-\d{4}/).first())
      .toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText(/@mattamycorp\.com/i).first())
      .toBeVisible({ timeout: 10000 });
    await expect(this.page.getByRole('heading', { name: /^Hours$/i }).first())
      .toBeVisible({ timeout: 10000 });
  }

  /** Helper: open a named MPC tab when it is not already selected. */
  private async openTab(tabName: MpcTab): Promise<void> {
    await this.dismissBlockingOverlays();

    const tab = this.page.locator(`button[aria-label="${tabName}"]`).first();
    await expect(tab, `${tabName} tab is not available`).toBeVisible({
      timeout: 15000
    });

    if (await tab.getAttribute('aria-selected') === 'true') {
      return;
    }

    await tab.click();
    await this.waitForPageReady();
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

  /* ==========================================================
     Neighborhood Cards
  ========================================================== */

  /** Verify: neighborhood cards are visible and link under the expected MPC path. */
  async validateNeighborhoodCards(mpcName: string, mpcUrl: string): Promise<void> {
    await this.neighborhoodSection.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(this.neighborhoodSection).toBeVisible({ timeout: 15000 });

    const cardLinks = this.getNeighborhoodCardLinks(mpcUrl);
    const count = await cardLinks.count();

    expect(count, 'MPC page should show neighborhood cards').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = cardLinks.nth(i);
      const href = await link.getAttribute('href');
      const cardText = await link.innerText();

      expect(href, `Neighborhood card ${i + 1} href missing`).toBeTruthy();
      expect(href).toContain(mpcUrl);
      expect(
        cardText.trim().length,
        `Neighborhood card ${i + 1} should include visible content for ${mpcName}`
      ).toBeGreaterThan(0);
    }
  }

  /** Verify: first neighborhood card navigates to its detail page. */
  async validateFirstNeighborhoodNavigation(mpcUrl: string): Promise<void> {
    await this.neighborhoodSection.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await this.dismissBlockingOverlays();

    const firstNeighborhoodLink = this.getNeighborhoodCardLinks(mpcUrl).first();
    const href = await firstNeighborhoodLink.getAttribute('href');

    expect(href, 'First neighborhood href missing').toBeTruthy();

    await firstNeighborhoodLink.click({ force: true });
    await this.waitForPageReady();
    await expect(this.page).toHaveURL(new RegExp(this.escapeRegex(href!), 'i'));
  }

  /** Helper: return visible neighborhood card links under the expected MPC path. */
  private getNeighborhoodCardLinks(mpcUrl: string): Locator {
    return this.neighborhoodSection
      .locator(`a[href^="${mpcUrl}/"]:visible, a[href*="${mpcUrl}/"]:visible`);
  }

  /* ==========================================================
     Lead Form
  ========================================================== */

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

  /** Helper: escape dynamic text before creating a regular expression. */
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      await cookieClose.click({ force: true });
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
}
