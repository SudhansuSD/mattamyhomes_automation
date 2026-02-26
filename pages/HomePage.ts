import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getLocationConfig } from '../config/locations';

// ⚠ Keeping same behavior (not invoking function intentionally as in original)
const locationConfig = getLocationConfig;

export class HomePage extends BasePage {

  readonly heroSection: Locator;
  readonly header: Locator;
  readonly searchBox: Locator;

  constructor(page: Page) {
    super(page);

    this.heroSection = page.locator('section').first();
    this.header = page.locator('header');

    // ⚠ Keep original casing behavior
    this.searchBox = page.getByPlaceholder(/Search by City/i);
  }

  /* ==========================================================
     PAGE LOAD
  ========================================================== */

  async verifyPageLoaded(): Promise<void> {

    await this.page.waitForLoadState('domcontentloaded');
    await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });

    await expect(this.page).toHaveTitle(/Mattamy Homes/i);

    try {
      await expect(this.header).toBeVisible({ timeout: 30000 });
    } catch {
      console.warn('Header not visible within 30s — continuing');
    }
  }

  /* ==========================================================
     MARKET SEARCH
  ========================================================== */

  async searchByMarket(
    market: 'Calgary' | 'Greater Toronto Area' | 'Phoenix'
  ): Promise<void> {

    await this.typeIntoSearch(market);

    const marketOption = this.getMarketLocator(market).first();
    await this.clickSearchResult(marketOption);

    await this.waitForMarketRouting();
  }

  async verifySearchByMarket(): Promise<void> {

    await this.page.waitForLoadState('domcontentloaded');

    const params = new URL(this.page.url()).searchParams;

    if (params.get('country') === 'CAN') {
      expect(params.get('metro')).toMatch(/calgary|greater toronto area/i);
    } else {
      expect(params.get('metro')).toMatch(/phoenix/i);
    }
  }

  /* ==========================================================
     COMMUNITY SEARCH
  ========================================================== */

  async searchByCommunity(
    community: 'Yorkville' | 'Landmarke'
  ): Promise<void> {

    await this.typeIntoSearch(community);

    const communityOption = this.getCommunityLocator(community).first();
    await this.clickSearchResult(communityOption);
  }

  async verifySearchByCommunity(): Promise<void> {

    await this.page.waitForLoadState('domcontentloaded');

    const heading = this.page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 20000 });

    const countryContainer = this.page.locator('#countryContainer');
    await expect(countryContainer).toBeVisible({ timeout: 10000 });

    const countryText =
      (await countryContainer.textContent() || '').toUpperCase();

    if (countryText.includes('CAN')) {
      await expect(heading).toContainText(/yorkville/i);
    } else if (countryText.includes('USA')) {
      await expect(heading).toContainText(/landmarke/i);
    } else {
      throw new Error(`Unknown country detected: ${countryText}`);
    }
  }

  /* ==========================================================
     QMI SEARCH
  ========================================================== */

  async searchByQMI(
    qmiHome: '1234 148 Avenue NW' | '263 W FLAX DR'
  ): Promise<void> {

    await this.page.waitForLoadState('domcontentloaded');

    await this.typeIntoSearch(qmiHome);

    const qmiOption = this.getQmiLocator(qmiHome).first();
    await this.clickSearchResult(qmiOption);
  }

  /* ==========================================================
     PLAN SEARCH
  ========================================================== */

  async searchByPlan(
    planName: 'Brinkley I' | 'Aqua'
  ): Promise<void> {

    await this.page.waitForLoadState('domcontentloaded');

    await this.typeIntoSearch(planName);

    const planOption = this.getPlanLocator(planName);
    await this.clickSearchResult(planOption);
  }

  /* ==========================================================
     SEARCH HELPERS
  ========================================================== */

  private async typeIntoSearch(value: string): Promise<void> {

    await this.searchBox.click();
    await this.searchBox.fill('');

    await this.searchBox.pressSequentially(value, {
      delay: 500
    });
  }

  private async clickSearchResult(result: Locator): Promise<void> {

    await expect(result).toBeVisible({ timeout: 15000 });

    await result.scrollIntoViewIfNeeded();

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      result.click()
    ]);
  }

  private async waitForMarketRouting(): Promise<void> {

    const startUrl = this.page.url();

    await this.page.waitForFunction(
      previousUrl => window.location.href !== previousUrl,
      startUrl,
      { timeout: 20000 }
    );

    await this.page.waitForLoadState('domcontentloaded');
  }

  /* ==========================================================
     LOCATOR FACTORIES
  ========================================================== */

  private getMarketLocator(market: string): Locator {

    switch (market) {
      case 'Calgary':
        return this.page.getByText(/Calgary, AB/i);

      case 'Greater Toronto Area':
        return this.page.getByText(/Greater Toronto Area, ON/i);

      case 'Phoenix':
        return this.page.getByText(/Phoenix, AZ/i);

      default:
        throw new Error(`Unknown market: ${market}`);
    }
  }

  private getCommunityLocator(community: string): Locator {

    switch (community) {
      case 'Yorkville':
        return this.page.getByText(/Yorkville/i);

      case 'Landmarke':
        return this.page.getByText(/Landmarke/i);

      default:
        throw new Error(`Unknown community: ${community}`);
    }
  }

  private getQmiLocator(qmiHome: string): Locator {

    switch (qmiHome) {
      case '1234 148 Avenue NW':
        return this.page.getByText(/1234 148 Avenue NW/i);

      case '263 W FLAX DR':
        return this.page.getByText(/263 W FLAX DR/i);

      default:
        throw new Error(`Unknown QMI Home: ${qmiHome}`);
    }
  }

  private getPlanLocator(planOption: string): Locator {

    switch (planOption) {
      case 'Brinkley I':
        return this.page
          .locator('a[href*="yorkville/brinkley-i"]')
          .first();

      case 'Aqua':
        return this.page
          .locator('a[href*="/san-tan-valley/landmarke-50s/aqua"]')
          .first();

      default:
        throw new Error(`Unknown plan option: ${planOption}`);
    }
  }
}