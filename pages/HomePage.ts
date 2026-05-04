import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getLocationConfig } from '../config/locations';
import { getEnvConfig } from '../config/envConfig';

type SearchType = 'market' | 'community' | 'plan' | 'qmi';
type HeroVideoState = {
  autoplayAttribute: boolean;
  autoplayProperty: boolean;
  muted: boolean;
  defaultMuted: boolean;
  playsInlineAttribute: boolean;
  sourceCount: number;
  src: string;
};
type MarketSlide = {
  marketName: string;
  href: string;
};
type RawMarketSlide = MarketSlide & {
  isCloned: boolean;
};
type MarketValidationRow = {
  name: string;
  configUrl: string;
  uiUrl: string;
  status: string;
};
type MissingMarketRow = {
  configName: string;
  configUrl: string;
  status: string;
};
type UnmatchedMarketRow = {
  uiName: string;
  uiUrl: string;
  status: string;
};

export class HomePage extends BasePage {

  readonly heroSection: Locator;
  readonly heroVideo: Locator;
  readonly header: Locator;
  readonly searchBox: Locator;

  readonly marketCards: Locator;

  constructor(page: Page) {
    super(page);

    this.heroSection = page.locator('section').first();
    this.heroVideo = this.heroSection.locator('video').first();
    this.header = page.locator('header');
    this.searchBox = page.locator(
      'input[placeholder*="Search"]:not(#vendor-search-handler)'
    ).first();
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

  async validateHeroVideoAutoplay(): Promise<void> {
    await this.waitForPageReady();
    await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
    await this.heroVideo.waitFor({ state: 'attached', timeout: 15000 });

    await expect(this.heroVideo, 'Hero section video should be visible').toBeVisible();

    const videoState = await this.getHeroVideoState();

    this.expectHeroVideoAutoplayAttributes(videoState);
    await this.expectHeroVideoReadyForPlayback();

    const playbackStartTime = await this.getHeroVideoPlaybackStartTime();
    await this.expectHeroVideoPlaybackProgress(playbackStartTime);
  }

  private async getHeroVideoState(): Promise<HeroVideoState> {
    return this.heroVideo.evaluate((video: HTMLVideoElement) => ({
      autoplayAttribute: video.hasAttribute('autoplay'),
      autoplayProperty: video.autoplay,
      muted: video.muted,
      defaultMuted: video.defaultMuted,
      playsInlineAttribute: video.hasAttribute('playsinline') || video.hasAttribute('webkit-playsinline'),
      sourceCount: video.querySelectorAll('source').length,
      src: video.currentSrc || video.src
    }));
  }

  private expectHeroVideoAutoplayAttributes(videoState: HeroVideoState): void {
    expect(
      videoState.autoplayAttribute || videoState.autoplayProperty,
      'Hero video should have autoplay enabled'
    ).toBeTruthy();

    expect(
      videoState.muted || videoState.defaultMuted,
      'Hero autoplay video should be muted so browsers allow autoplay'
    ).toBeTruthy();

    expect(videoState.playsInlineAttribute, 'Hero autoplay video should include playsinline for mobile playback')
      .toBeTruthy();
    expect(videoState.src || videoState.sourceCount > 0, 'Hero video should have a playable source').toBeTruthy();
  }

  private async expectHeroVideoReadyForPlayback(): Promise<void> {
    await expect
      .poll(
        async () => this.heroVideo.evaluate((video: HTMLVideoElement) => video.readyState >= 2),
        {
          message: 'Hero video should load enough data to start playback',
          timeout: 15000
        }
      )
      .toBeTruthy();
  }

  private async getHeroVideoPlaybackStartTime(): Promise<number> {
    return this.heroVideo.evaluate((video: HTMLVideoElement) => {
      if (video.paused) {
        return video.play()
          .then(() => video.currentTime)
          .catch(() => video.currentTime);
      }

      return video.currentTime;
    });
  }

  private async expectHeroVideoPlaybackProgress(playbackStartTime: number): Promise<void> {
    await expect
      .poll(
        async () => this.heroVideo.evaluate(
          (video: HTMLVideoElement, startTime) => !video.paused && video.currentTime > startTime,
          playbackStartTime
        ),
        {
          message: 'Hero video should autoplay and advance playback time',
          timeout: 10000
        }
      )
      .toBeTruthy();
  }

  /* ==========================================================
     SHARED CONSTANTS
  ========================================================== */

  private readonly SEARCH_MAX_ATTEMPTS = 2;
  private readonly SEARCH_INPUT_TIMEOUT = 10000;
  private readonly SEARCH_RESULTS_TIMEOUT = 15000;
  private readonly SEARCH_INPUT_SELECTOR = 'input[placeholder*="Search"]:not(#vendor-search-handler)';
  private readonly PRIMARY_SEARCH_SUGGESTION_SELECTORS = [
    '[data-aos="fade-down"] a[aria-label]:visible',
    '[data-aos="fade-down"] a[href]:visible',
    'button[href*="/search"][href*="metro="]:not([aria-hidden="true"]):visible',
    '[role="listbox"] a[href]:visible',
    '[role="listbox"] [role="option"]:visible',
    '[role="option"] a[href]:visible',
    '[role="option"]:visible',
    '[aria-live] a[href]:visible',
  ];
  private readonly FALLBACK_SEARCH_SUGGESTION_SELECTORS = [
    '[class*="search"] a[href]:visible',
    '[class*="Search"] a[href]:visible'
  ];

  /* ==========================================================
     SEARCH LOCATORS
  ========================================================== */

  private get primarySearchResults(): Locator {
    return this.page.locator(this.PRIMARY_SEARCH_SUGGESTION_SELECTORS.join(', '));
  }

  private get fallbackSearchResults(): Locator {
    return this.page.locator(this.FALLBACK_SEARCH_SUGGESTION_SELECTORS.join(', '));
  }

  private get visibleSearchBox(): Locator {
    return this.page.locator(`${this.SEARCH_INPUT_SELECTOR}:visible`).first();
  }
  /* ==========================================================
       SEARCH FEATURE
    ========================================================== */

  async search(value: string, searchType?: SearchType): Promise<void> {
    await this.waitForPageReady();
    await this.page.waitForTimeout(1500); // small UI stabilization

    for (let attempt = 1; attempt <= this.SEARCH_MAX_ATTEMPTS + 1; attempt++) {
      console.log(`🔁 Attempt ${attempt} - 🔍 Searching for: ${value}`);

      

      const searchBox = this.visibleSearchBox;

      if (!await this.isSearchBoxVisible(searchBox)) {
        if (searchType === 'market') {
          console.log(`Search input not visible - navigating directly to market search for: ${value}`);
          await this.navigateToMarketSearchResults(value);
          return;
        }

        throw new Error(`Search input not visible for search value: ${value}`);
      }

      await this.prepareSearchBox(searchBox);

      let typedValue = '';

      for (const char of value) {
        typedValue += char;

        await searchBox.type(char, { delay: 300 });
        await this.page.waitForTimeout(500);

        const matchedResult = await this.getSearchResult(value, searchType);

        if (await matchedResult.isVisible().catch(() => false)) {
          console.log(`✅ Match found after typing: ${typedValue}`);
          const previousUrl = this.page.url();
          const href = await matchedResult.getAttribute('href');
          await matchedResult.scrollIntoViewIfNeeded();
          const didClick = await matchedResult.click({ timeout: 5000 })
            .then(() => true)
            .catch(() => false);

          if (!didClick && href) {
            await this.page.goto(this.buildFullUrl(href), {
              waitUntil: 'domcontentloaded',
              timeout: 90_000
            });
            await this.waitForPageReady();
            return;
          }

          const didNavigate = await this.page.waitForURL(
            (url) => url.toString() !== previousUrl,
            { timeout: this.SEARCH_RESULTS_TIMEOUT }
          ).then(() => true).catch(() => false);

          if (!didNavigate && searchType === 'market') {
            await this.navigateToMarketSearchResults(value);
            return;
          }

          if (!didNavigate && href) {
            await this.page.goto(this.buildFullUrl(href), {
              waitUntil: 'domcontentloaded',
              timeout: 90_000
            });
          }
          await this.waitForPageReady();
          return;
        }
      }

      console.log(`⚠️ No match found in attempt ${attempt}`);
      await this.visibleSearchBox.fill('').catch(() => undefined);
      await this.page.waitForTimeout(800);
    }

    if (searchType === 'market') {
      await this.navigateToMarketSearchResults(value);
      return;
    }

    throw new Error(`❌ No matching search result found for: ${value}`);
  }
  private async isSearchBoxVisible(searchBox: Locator): Promise<boolean> {
    return searchBox
      .waitFor({ state: 'visible', timeout: this.SEARCH_INPUT_TIMEOUT })
      .then(() => true)
      .catch(() => false);
  }

  private async prepareSearchBox(searchBox: Locator): Promise<void> {
    await this.scrollTo(searchBox);
    await searchBox.click();
    await searchBox.fill('');
  }

  private async navigateToMarketSearchResults(market: string): Promise<void> {
    const location = getLocationConfig();
    const { baseURL } = getEnvConfig();
    const searchParams = new URLSearchParams({
      productType: 'community',
      metro: market,
      country: location.country,
      community: market,
      hideMap: 'true'
    });

    console.log(`No autocomplete market result found - navigating to search results for: ${market}`);

    await this.page.goto(`${baseURL}/search?${searchParams.toString()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });
    await this.waitForPageReady();
  }

  private async getSearchResult(value: string, searchType?: SearchType): Promise<Locator> {
    const primaryMatch = this.getSearchResultFromLocator(this.primarySearchResults, value, searchType);

    if (await primaryMatch.isVisible().catch(() => false)) {
      return primaryMatch;
    }

    return this.getSearchResultFromLocator(this.fallbackSearchResults, value, searchType);
  }

  private getSearchResultFromLocator(
    searchResults: Locator,
    value: string,
    searchType?: SearchType
  ): Locator {
    const matchedResults = searchResults.filter({
      hasText: new RegExp(this.escapeRegExp(value), 'i')
    });

    if (searchType === 'market') {
      return matchedResults
        .filter({
          hasText: new RegExp(`^\\s*${this.escapeRegExp(value)}\\s*$`, 'i')
        })
        .first()
        .or(matchedResults.first());
    }

    if (searchType !== 'qmi') {
      return matchedResults.first();
    }

    const addressSlug = this.normalizeText(value)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const qmiAddressLink = this.page
      .locator(`a[href*="${addressSlug}"]:visible`)
      .filter({ hasText: new RegExp(this.escapeRegExp(value), 'i') })
      .first();

    return qmiAddressLink.or(matchedResults.first());
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ==========================================================
     HELPERS
  ========================================================== */



  /* ==========================================================
     MARKET SEARCH
  ========================================================== */

  async searchByMarket(market: string): Promise<void> {
    await this.search(market, 'market');
  }

  async verifySearchByMarket(expectedMarket: string): Promise<void> {
    await this.waitForPageReady();

    await this.page.waitForURL(
      (url) => this.normalizeText(url.searchParams.get('metro') || '')
        .includes(this.normalizeText(expectedMarket)),
      { timeout: this.SEARCH_RESULTS_TIMEOUT }
    );

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
    await this.search(address, 'qmi');
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

  private async getMarketSlides(): Promise<RawMarketSlide[]> {
    return this.page.$$eval('#cards .slick-slide', (elements) => {
      return elements.map((slide) => {
        const isCloned = slide.classList.contains('slick-cloned');
        const marketName =
          slide.querySelector('h2')?.textContent?.trim() ||
          slide.querySelector('[class*="title"]')?.textContent?.trim() ||
          slide.querySelector('p')?.textContent?.trim() ||
          '';
        const href = slide.querySelector('a')?.getAttribute('href')?.trim() || '';

        return { isCloned, marketName, href };
      });
    });
  }

  private getUniqueMarketSlides(slides: MarketSlide[]): MarketSlide[] {
    const uniqueMarkets = new Map<string, MarketSlide>();

    for (const slide of slides) {
      if (!uniqueMarkets.has(slide.href)) {
        uniqueMarkets.set(slide.href, {
          marketName: slide.marketName,
          href: slide.href,
        });
      }
    }

    return Array.from(uniqueMarkets.values());
  }

  private doesSlideMatchMarket(slide: MarketSlide, market: { name: string; url: string }): boolean {
    const acceptedNames = this.getAcceptedNames(market.name);
    const normalizedName = this.normalizeText(slide.marketName);
    const normalizedHref = slide.href.toLowerCase().trim();

    return (
      acceptedNames.includes(normalizedName) &&
      normalizedHref === market.url.toLowerCase().trim()
    );
  }

  async validateMarketCards(): Promise<void> {
    await this.waitForPageReady();

    const location = getLocationConfig();

    // Scroll to section
    const section = this.page.locator('text=Explore our locations near you');
    await section.scrollIntoViewIfNeeded();

    // Wait for slider to load
    await this.page.waitForSelector('#cards .slick-slide');

    const slides = await this.getMarketSlides();

    console.log(`📊 Total market cards: ${slides.length}`);

    const validSlides = slides.filter(
      (slide) => !slide.isCloned && slide.marketName && slide.href
    );

    console.log(`✅ Valid market cards after filtering: ${validSlides.length}`);

    const uniqueSlides = this.getUniqueMarketSlides(validSlides);

    console.log(`🎯 Unique markets found: ${uniqueSlides.length}`);

    expect(uniqueSlides.length, '❌ No unique market cards found').toBeGreaterThan(0);

    // Tables (short + readable)
    const matchedMarkets: MarketValidationRow[] = [];
    const missingMarkets: MissingMarketRow[] = [];
    const unmatchedUICards: UnmatchedMarketRow[] = [];

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
      const existsInConfig = location.markets.some((market) => this.doesSlideMatchMarket(slide, market));

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
