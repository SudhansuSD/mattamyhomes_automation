import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {

  readonly heroSection: Locator;
  readonly header: Locator;
  readonly searchBox: Locator;

  constructor(page: Page) {
    super(page);

    this.heroSection = page.locator('section').first();
    this.header = page.locator('header');
    this.searchBox = page.getByPlaceholder(/Search by City/i);
  }

  /* ==========================================================
     PAGE LOAD
  ========================================================== */

  async verifyPageLoaded(): Promise<void> {
    await this.waitForPageReady();
    await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.page).toHaveTitle(/Mattamy Homes/i);
  }

  /* ==========================================================
     MARKET SEARCH
  ========================================================== */

  async searchByMarket(market: string): Promise<void> {

    await this.waitForPageReady();
    await this.typeIntoSearch(market);

    const option = this.page.getByText(new RegExp(market, 'i')).first();
    await this.clickSearchResult(option);

    await this.waitForMarketRouting();
  }

  async verifySearchByMarket(expectedMarket: string): Promise<void> {

    await this.waitForPageReady();

    const params = new URL(this.page.url()).searchParams;
    expect(params.get('metro')).toMatch(new RegExp(expectedMarket, 'i'));
  }

  /* ==========================================================
     COMMUNITY SEARCH
  ========================================================== */

  async searchByCommunity(community: string): Promise<void> {

    await this.waitForPageReady();
    await this.typeIntoSearch(community);

    const option = this.page.getByText(new RegExp(community, 'i')).first();
    await this.clickSearchResult(option);
  }

  

  /* ==========================================================
     QMI SEARCH
  ========================================================== */

  async searchByQMI(address: string): Promise<void> {

    await this.waitForPageReady();
    await this.typeIntoSearch(address);

    const option = this.page.getByText(new RegExp(address, 'i')).first();
    await this.clickSearchResult(option);
  }

  /* ==========================================================
     PLAN SEARCH
  ========================================================== */

  async searchByPlan(planName: string): Promise<void> {

    await this.waitForPageReady();
    await this.typeIntoSearch(planName);

    const option = this.page.getByText(new RegExp(planName, 'i')).first();
    await this.clickSearchResult(option);
  }

  async verifyPlanUrl(expectedUrlPart: string): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(expectedUrlPart, 'i')
    );
  }

  /* ==========================================================
     HELPERS
  ========================================================== */

  private async typeIntoSearch(value: string): Promise<void> {

    await this.searchBox.click();
    await this.searchBox.fill('');
    await this.searchBox.pressSequentially(value, { delay: 500 });
  }

  private async clickSearchResult(result: Locator): Promise<void> {

    await expect(result).toBeVisible({ timeout: 15000 });

    await Promise.all([
      await this.waitForPageReady(),
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

    await this.waitForPageReady();
  }
}