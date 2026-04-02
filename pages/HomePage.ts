import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getLocationConfig, LocationKey } from '../config/locations';

type SearchType = 'market' | 'community' | 'plan' | 'qmi';

export class HomePage extends BasePage {

  readonly heroSection: Locator;
  readonly header: Locator;
  readonly searchBox: Locator;

  readonly marketCards: Locator;

  constructor(page: Page) {
    super(page);

    this.heroSection = page.locator('section').first();
    this.header = page.locator('header');
    this.searchBox = page.locator('input[placeholder*="Search"]').first();
    // Use CSS :not() to exclude cloned slides from carousel
    this.marketCards = page.locator('#cards .slick-slide:not(.slick-cloned)');

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
     SHARED CONSTANTS
  ========================================================== */

  private readonly SEARCH_MAX_ATTEMPTS = 2;
  private readonly SEARCH_INPUT_TIMEOUT = 10000;
  private readonly SEARCH_RESULTS_TIMEOUT = 15000;
  private readonly SEARCH_TYPE_DELAY = 1000;

  /* ==========================================================
     SEARCH LOCATORS
  ========================================================== */

  private get searchResults(): Locator {
    // Keep current selector as fallback, but centralize it
    return this.page.locator('[data-aos="fade-down"] a[aria-label]');
  }
  /* ==========================================================
       SEARCH FEATURE
    ========================================================== */

  async search(value: string): Promise<void> {
    await this.waitForPageReady();
    await this.page.waitForTimeout(1500); // small UI stabilization

    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔁 Attempt ${attempt} - 🔍 Searching for: ${value}`);

      

      await this.searchBox.waitFor({ state: 'visible', timeout: 20000 });
      await this.searchBox.scrollIntoViewIfNeeded();
      await this.searchBox.click();
      await this.searchBox.fill('');

      let typedValue = '';

      for (const char of value) {
        typedValue += char;

        await this.searchBox.type(char, { delay: 500 });
        await this.page.waitForTimeout(500);

        const matchedResult = this.searchResults
          .filter({ hasText: value })
          .first();

        if (await matchedResult.isVisible().catch(() => false)) {
          console.log(`✅ Match found after typing: ${typedValue}`);
          await matchedResult.click();
          await this.waitForPageReady();
          return;
        }
      }

      console.log(`⚠️ No match found in attempt ${attempt}`);
      await this.searchBox.fill('');
      await this.page.waitForTimeout(800);
    }

    throw new Error(`❌ No matching search result found for: ${value}`);
  }
  /* ==========================================================
     HELPERS
  ========================================================== */



  /* ==========================================================
     MARKET SEARCH
  ========================================================== */

  async searchByMarket(market: string): Promise<void> {
    await this.search(market);
  }

  async verifySearchByMarket(expectedMarket: string): Promise<void> {
    await this.waitForPageReady();

    const params = new URL(this.page.url()).searchParams;
    const metro = params.get('metro') || '';

    expect(this.normalizeText(metro)).toContain(this.normalizeText(expectedMarket));
  }

  /* ==========================================================
     COMMUNITY SEARCH
  ========================================================== */

  async searchByCommunity(community: string): Promise<void> {
    await this.search(community);
  }

  /* ==========================================================
     QMI SEARCH
  ========================================================== */

  async searchByQMI(address: string): Promise<void> {
    await this.search(address);
  }

  /* ==========================================================
     PLAN SEARCH
  ========================================================== */

  async searchByPlan(planName: string): Promise<void> {
    await this.search(planName);
  }
  /* ==========================================================
      MARKET CARD UI AND LINK VALIDATION
    ========================================================== */

  private getAcceptedNames(name: string): string[] {
    return name
      .split('||')
      .map(part => this.normalizeText(part));
  }

  async validateMarketCards(): Promise<void> {
    await this.waitForPageReady();

    const location = getLocationConfig();

    // Scroll to section
    const section = this.page.locator('text=Explore our locations near you');
    await section.scrollIntoViewIfNeeded();

    // Wait for slider to load
    await this.page.waitForSelector('#cards .slick-slide');

    // Extract all slides data
    const slides = await this.page.$$eval('#cards .slick-slide', (elements) => {
      return elements.map((slide) => {
        const isCloned = slide.classList.contains('slick-cloned');

        const marketName =
          slide.querySelector('h2')?.textContent?.trim() ||
          slide.querySelector('[class*="title"]')?.textContent?.trim() ||
          slide.querySelector('p')?.textContent?.trim() ||
          '';

        const href =
          slide.querySelector('a')?.getAttribute('href')?.trim() ||
          '';

        return { isCloned, marketName, href };
      });
    });

    console.log(`📊 Total market cards: ${slides.length}`);

    // Filter valid non-cloned cards
    const validSlides = slides.filter(
      (slide) => !slide.isCloned && slide.marketName && slide.href
    );

    console.log(`✅ Valid market cards after filtering: ${validSlides.length}`);

    // Remove duplicate cards by href
    const uniqueMarkets = new Map<string, { marketName: string; href: string }>();

    for (const slide of validSlides) {
      if (!uniqueMarkets.has(slide.href)) {
        uniqueMarkets.set(slide.href, {
          marketName: slide.marketName,
          href: slide.href,
        });
      }
    }

    const uniqueSlides = Array.from(uniqueMarkets.values());

    console.log(`🎯 Unique markets found: ${uniqueSlides.length}`);

    expect(uniqueSlides.length, '❌ No unique market cards found').toBeGreaterThan(0);

    // Tables (short + readable)
    const matchedMarkets: {

      name: string;
      configUrl: string;
      uiUrl: string;
      status: string;
    }[] = [];

    const missingMarkets: {
      configName: string;
      configUrl: string;
      status: string;
    }[] = [];

    const unmatchedUICards: {
      uiName: string;
      uiUrl: string;
      status: string;
    }[] = [];

    // Extra logs for full URLs
    const matchedFullUrls: string[] = [];

    // =========================
    // CONFIG → UI COMPARISON
    // =========================
    for (const expectedMarket of location.markets) {
      const acceptedNames = this.getAcceptedNames(expectedMarket.name);

      const matchedCard = uniqueSlides.find((slide) => {
        const normalizedName = this.normalizeText(slide.marketName);
        const normalizedHref = slide.href.toLowerCase().trim();

        // ✅ STRICT COMPARISON:
        // config name must match UI name
        // AND config url must match UI url
        return (
          acceptedNames.includes(normalizedName) &&
          normalizedHref === expectedMarket.url.toLowerCase().trim()
        );
      });

      if (!matchedCard) {
        missingMarkets.push({
          configName: expectedMarket.name,
          configUrl: expectedMarket.url,
          status: 'Missing on UI',
        });
        continue;
      }

      const fullUrl = this.buildFullUrl(matchedCard.href);

      matchedMarkets.push({
        name: matchedCard.marketName,
        configUrl: expectedMarket.url,
        uiUrl: matchedCard.href,
        status: 'Matched',
      });

      console.log(`✅ Market Name: ${matchedCard.marketName} | URL: ${fullUrl}`);
    }

    // =========================
    // UI → CONFIG COMPARISON
    // =========================
    for (const slide of uniqueSlides) {
      const existsInConfig = location.markets.some((market) => {
        const acceptedNames = this.getAcceptedNames(market.name);
        const normalizedName = this.normalizeText(slide.marketName);
        const normalizedHref = slide.href.toLowerCase().trim();

        return (
          acceptedNames.includes(normalizedName) &&
          normalizedHref === market.url.toLowerCase().trim()
        );
      });

      if (!existsInConfig) {
        unmatchedUICards.push({
          uiName: slide.marketName,
          uiUrl: slide.href,
          status: 'Not in Config',
        });
      }
    }

    // =========================
    // SUMMARY TABLES
    // =========================
    console.log('\n========== MARKET CARD VALIDATION SUMMARY ==========\n');

    if (matchedMarkets.length > 0) {
      console.log(`✅ Matched Markets (${matchedMarkets.length})`);
      console.table(matchedMarkets);
    }

    if (missingMarkets.length > 0) {
      console.log(`⚠️ Config Markets Not Available On UI (${missingMarkets.length})`);
      console.table(missingMarkets);
    }

    if (unmatchedUICards.length > 0) {
      console.log(`⚠️ UI Markets Not Present In Config (${unmatchedUICards.length})`);
      console.table(unmatchedUICards);
    }

    console.log('===================================================\n');
  }

}