import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';

export interface MPCConfig {
  name: string;
  url: string;
}

type MpcTab = 'Summary' | 'Home Details' | 'Contact & Hours';

export class MPCPage extends BasePage {
  readonly heading: Locator;
  readonly heroSection: Locator;
  readonly summaryTab: Locator;
  readonly homeDetailsTab: Locator;
  readonly contactHoursTab: Locator;
  readonly neighborhoodSection: Locator;
  readonly communityUpdateHeading: Locator;
  readonly successDialogModal: Locator;

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

  async verifyMPCPage(mpc: MPCConfig): Promise<void> {
    await this.waitForPageReady();

    await expect(this.page).toHaveURL(new RegExp(this.escapeRegex(mpc.url), 'i'));
    await expect(this.page).toHaveTitle(/Mattamy Homes/i);
    await expect(this.heading).toContainText(new RegExp(mpc.name, 'i'), {
      timeout: 20000
    });
  }

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

  async validateSummaryTab(): Promise<void> {
    await this.openTab('Summary');
    await expect(this.summaryTab).toHaveAttribute('aria-selected', 'true');
    await expect(this.page.locator('body')).toContainText(
      /community|homes|neighborhood|designed|location/i,
      { timeout: 10000 }
    );
  }

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

  async validateContactHoursTab(): Promise<void> {
    await this.openTab('Contact & Hours');

    await expect(this.page.getByRole('heading', { name: /Sales Office|New Home Gallery|Contact/i }).first())
      .toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText(/\d{3}-\d{3}-\d{4}/).first())
      .toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText(/@mattamycorp\.com/i).first())
      .toBeVisible({ timeout: 10000 });
    await expect(this.page.getByRole('heading', { name: /Hours/i }))
      .toBeVisible({ timeout: 10000 });
  }

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

  async validatePromotionCTA(mpcUrl: string): Promise<void> {
    const exploreLink = this.page
      .locator(`a[href^="${mpcUrl}/"], a[href*="${mpcUrl}/"]`)
      .filter({ hasText: /Explore|View|Learn More|Details/i })
      .first();

    await expect(exploreLink).toBeVisible({ timeout: 10000 });

    const href = await exploreLink.getAttribute('href');
    expect(href, 'Community CTA href missing').toBeTruthy();
    expect(href).toContain(mpcUrl);
  }

  /* ==========================================================
     Neighborhood Cards
  ========================================================== */

  async validateNeighborhoodCards(mpcName: string, mpcUrl: string): Promise<void> {
    await this.neighborhoodSection.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(this.neighborhoodSection).toBeVisible({ timeout: 15000 });

    const cards = this.getNeighborhoodCards();
    const count = await cards.count();

    expect(count, 'MPC page should show neighborhood cards').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const link = card.locator(`a[href^="${mpcUrl}/"], a[href*="${mpcUrl}/"]`).last();
      const href = await link.getAttribute('href');
      const cardText = await card.innerText();

      expect(href, `Neighborhood card ${i + 1} href missing`).toBeTruthy();
      expect(href).toContain(mpcUrl);
      expect(
        cardText.trim().length,
        `Neighborhood card ${i + 1} should include visible content for ${mpcName}`
      ).toBeGreaterThan(0);
    }
  }

  async validateFirstNeighborhoodNavigation(mpcUrl: string): Promise<void> {
    await this.neighborhoodSection.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await this.dismissBlockingOverlays();

    const firstNeighborhoodLink = this.getNeighborhoodCards()
      .first()
      .locator(`a[href^="${mpcUrl}/"], a[href*="${mpcUrl}/"]`)
      .first();
    const href = await firstNeighborhoodLink.getAttribute('href');

    expect(href, 'First neighborhood href missing').toBeTruthy();

    await firstNeighborhoodLink.click({ force: true });
    await this.waitForPageReady();
    await expect(this.page).toHaveURL(new RegExp(this.escapeRegex(href!), 'i'));
  }

  private getNeighborhoodCards(): Locator {
    return this.neighborhoodSection
      .locator('li')
      .filter({ has: this.page.locator('a[href]') });
  }

  /* ==========================================================
     Lead Form
  ========================================================== */

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

  async validateCommunityUpdateRequiredErrors(): Promise<void> {
    const form = await this.getCommunityUpdateForm();
    const fields = this.getCommunityUpdateFormFields(form);

    await fields.submit.click();

    await expect(form.locator('text=/Required|Please complete/i').first())
      .toBeVisible({ timeout: 10000 });
  }

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

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

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
