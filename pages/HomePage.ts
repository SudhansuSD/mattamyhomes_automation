import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

type SearchType = 'market' | 'community' | 'plan' | 'qmi';

export class HomePage extends BasePage {

  readonly heroSection: Locator;
  readonly header: Locator;
  readonly searchBox: Locator;
  readonly searchResults: Locator;
  readonly marketCards: Locator;

  constructor(page: Page) {
    super(page);

    this.heroSection = page.locator('section').first();
    this.header = page.locator('header');
    this.searchBox = page.getByPlaceholder(/Search by City/i);
    // Use CSS :not() to exclude cloned slides from carousel
    this.marketCards = page.locator('#cards .slick-slide:not(.slick-cloned)');

    // Dropdown container (generic, works across variants)
    this.searchResults = page.locator('[data-aos="fade-down"] a[aria-label]');

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
     GENERIC SEARCH ENGINE (CORE)
  ========================================================== */

  private async performSearch(value: string): Promise<void> {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.waitForPageReady();

        // ✅ Step 1: Focus + clear properly
        await this.searchBox.click();
        await this.searchBox.fill('');

        // select all + delete (more reliable than fill(''))
        await this.searchBox.press('Control+A');
        await this.searchBox.press('Backspace');

        // ✅ Step 2: Close any stale dropdown
        await this.page.keyboard.press('Escape');

        // small pause to reset UI
        await this.page.waitForTimeout(300);

        // ✅ Step 3: Type slowly (important for debounce APIs)
        await this.searchBox.type(value, { delay: 1000 });

        // ✅ Step 4: Wait for REAL result (NOT container)
        const result = this.page.locator(`text=${value}`).first();

        await expect(result).toBeVisible({ timeout: 15000 });

        console.log(`✅ Search success on attempt ${attempt}`);
        return;

      } catch (error) {
        console.log(`⚠️ Search attempt ${attempt} failed`);

        if (attempt === maxAttempts) {
          throw new Error(`❌ Search failed after ${maxAttempts} attempts for value: ${value}`);
        }

        // 🔁 Reset before retry
        await this.page.waitForTimeout(1000);
      }
    }
  }
  /* ==========================================================
      SEARCH RESULT SELECTION
    ========================================================== */
  private async selectSearchResult(value: string): Promise<void> {

    const option = this.page.locator('[data-aos="fade-down"] a[aria-label]').filter({
      hasText: value
    }).first();

    await expect(option).toBeVisible({ timeout: 15000 });

    console.log('✅ Clicking:', await option.innerText());

    await option.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    const label = await option.getAttribute('aria-label');
    console.log('✅ Clicking:', label);
    await Promise.all([
      this.waitForPageReady(),
      option.click()
    ]);
  }

  private async search(value: string): Promise<void> {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔁 Full search attempt ${attempt}`);

        await this.performSearch(value);
        await this.selectSearchResult(value);

        console.log(`✅ Full search success on attempt ${attempt}`);
        return;

      } catch (error) {
        console.log(`❌ Full search attempt ${attempt} failed`);

        if (attempt === maxAttempts) {
          throw new Error(`❌ Search failed after ${maxAttempts} attempts for value: ${value}`);
        }

        // 🔁 Reset state before retry
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /* ==========================================================
     MARKET SEARCH
  ========================================================== */

  async searchByMarket(market: string): Promise<void> {
    await this.search(market);
    // await this.waitForMarketRouting();
  }

  async verifySearchByMarket(expectedMarket: string): Promise<void> {

    await this.waitForPageReady();

    const params = new URL(this.page.url()).searchParams;
    const metro = params.get('metro') || '';

    expect(metro.toLowerCase())
      .toContain(expectedMarket.toLowerCase());
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

  async validateMarketCards(): Promise<void> {

    await this.waitForPageReady();

    // Scroll to section
    const section = this.page.locator('text=Explore our locations near you');
    await section.scrollIntoViewIfNeeded();

    // Wait for slider to load
    await this.page.waitForSelector('#cards .slick-slide');

    // Extract all slides data in one go
    const slides = await this.page.$$eval('#cards .slick-slide', (elements) => {
      return elements.map((slide) => {

        const isCloned = slide.classList.contains('slick-cloned');

        const marketName =
          slide.querySelector('h2')?.textContent?.trim() ||
          slide.querySelector('[class*="title"]')?.textContent?.trim() ||
          slide.querySelector('p')?.textContent?.trim() ||
          '';

        const href =
          slide.querySelector('a')?.getAttribute('href') ||
          '';

        return { isCloned, marketName, href };
      });
    });

    console.log(`📊 Total market cards: ${slides.length}`);

    // Filter valid
    const validSlides = slides.filter(
      (s) => !s.isCloned && s.marketName && s.href
    );

    console.log(`✅ Valid market cards after filtering: ${validSlides.length}`);

    const uniqueMarkets = new Map<string, string>();

    for (const slide of validSlides) {

      if (!uniqueMarkets.has(slide.href)) {

        const fullUrl = this.buildFullUrl(slide.href);

        uniqueMarkets.set(fullUrl, slide.marketName);

        console.log(`✅ Market: ${slide.marketName} -> ${fullUrl}`);

        // 🔥 FIX: normalize market name → slug
        const slug = slide.marketName
          .toLowerCase()
          .replace(/[.]/g, '')        // remove dots
          .replace(/\s+/g, '-')       // spaces → hyphen
          .replace(/-+/g, '-');       // clean multiple hyphens

        // ✅ VALIDATIONS
        expect(slide.marketName).not.toBe('');
        expect(fullUrl).toContain('/');
        expect(fullUrl.toLowerCase()).toContain(slug);
      }
    }

    console.log(`🎯 Unique markets found: ${uniqueMarkets.size}`);

    expect(uniqueMarkets.size).toBeGreaterThan(0);
  }

}