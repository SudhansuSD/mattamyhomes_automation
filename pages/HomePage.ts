import { Locator, Page, expect } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { SearchablePage } from './SearchablePage';


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

export class HomePage extends SearchablePage {
   readonly heroSection: Locator;
  readonly heroVideo: Locator;
  readonly header: Locator;
  readonly marketCards: Locator;

  // Initializes the home page and its hero, header, and market-card locators.
  constructor(page: Page) {
    super(page);

    this.heroSection = page.locator('section').first();
    this.heroVideo = this.heroSection.locator('video').first();
    this.header = page.locator('header');

    this.marketCards = page.locator('#cards .slick-slide:not(.slick-cloned)');
  }

  /* ==========================================================
     PAGE LOAD
  ========================================================== */

  // Confirms the home page finished loading and shows the expected title.
  async verifyPageLoaded(): Promise<void> {
    await this.step('Verify home page loaded', async () => {
      await this.assertPageLoaded('Home page should finish loading');
      await this.assertPageTitle(/Mattamy Homes/i, 'Home page title should include Mattamy Homes');
    });
  }

  // Verifies the hero video is configured for and actually performs muted inline autoplay.
  async validateHeroVideoAutoplay(): Promise<void> {
    await this.step('Validate hero video autoplay', async () => {
      await this.waitForPageReady();
      await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
      await this.heroVideo.waitFor({ state: 'attached', timeout: 15000 });

      await this.assertVisible(this.heroVideo, 'Hero section video should be visible');

      const videoState = await this.getHeroVideoState();

      this.expectHeroVideoAutoplayAttributes(videoState);
      await this.expectHeroVideoReadyForPlayback();

      const playbackStartTime = await this.getHeroVideoPlaybackStartTime();
      await this.expectHeroVideoPlaybackProgress(playbackStartTime);
    });
  }

  // Reads the hero video element's autoplay-related attributes and source info from the DOM.
  private async getHeroVideoState(): Promise<HeroVideoState> {
    return this.heroVideo.evaluate((video: HTMLVideoElement) => ({
      autoplayAttribute: video.hasAttribute('autoplay'),
      autoplayProperty: video.autoplay,
      muted: video.muted,
      defaultMuted: video.defaultMuted,
      playsInlineAttribute:
        video.hasAttribute('playsinline') ||
        video.hasAttribute('webkit-playsinline'),
      sourceCount: video.querySelectorAll('source').length,
      src: video.currentSrc || video.src
    }));
  }

  // Asserts the captured video state has autoplay, muted, playsinline, and a playable source.
  private expectHeroVideoAutoplayAttributes(videoState: HeroVideoState): void {
    expect(
      videoState.autoplayAttribute || videoState.autoplayProperty,
      'Hero video should have autoplay enabled'
    ).toBeTruthy();

    expect(
      videoState.muted || videoState.defaultMuted,
      'Hero autoplay video should be muted so browsers allow autoplay'
    ).toBeTruthy();

    expect(
      videoState.playsInlineAttribute,
      'Hero autoplay video should include playsinline for mobile playback'
    ).toBeTruthy();

    expect(
      videoState.src || videoState.sourceCount > 0,
      'Hero video should have a playable source'
    ).toBeTruthy();
  }

  // Waits until the hero video has buffered enough data to begin playback.
  private async expectHeroVideoReadyForPlayback(): Promise<void> {
    await expect
      .poll(
        async () =>
          this.heroVideo.evaluate(
            (video: HTMLVideoElement) => video.readyState >= 2
          ),
        {
          message: 'Hero video should load enough data to start playback',
          timeout: 15000
        }
      )
      .toBeTruthy();
  }

  // Starts the hero video if paused and returns its current playback time as a baseline.
  private async getHeroVideoPlaybackStartTime(): Promise<number> {
    return this.heroVideo.evaluate((video: HTMLVideoElement) => {
      if (video.paused) {
        return video
          .play()
          .then(() => video.currentTime)
          .catch(() => video.currentTime);
      }

      return video.currentTime;
    });
  }

  // Asserts the hero video keeps playing and advances past the captured start time.
  private async expectHeroVideoPlaybackProgress(
    playbackStartTime: number
  ): Promise<void> {
    await expect
      .poll(
        async () =>
          this.heroVideo.evaluate(
            (video: HTMLVideoElement, startTime) =>
              !video.paused && video.currentTime > startTime,
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
     MARKET CARD UI AND LINK VALIDATION
  ========================================================== */

  // Splits a config market name on '||' into the list of normalized accepted display names.
  private getAcceptedNames(name: string): string[] {
    return name.split('||').map((part) => this.normalizeText(part));
  }

  // Scrapes every market carousel slide's name, href, and cloned flag from the DOM.
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

        return {
          isCloned,
          marketName,
          href
        };
      });
    });
  }

  // Deduplicates market slides by href, keeping the first occurrence of each link.
  private getUniqueMarketSlides(slides: MarketSlide[]): MarketSlide[] {
    const uniqueMarkets = new Map<string, MarketSlide>();

    for (const slide of slides) {
      if (!uniqueMarkets.has(slide.href)) {
        uniqueMarkets.set(slide.href, {
          marketName: slide.marketName,
          href: slide.href
        });
      }
    }

    return Array.from(uniqueMarkets.values());
  }

  // Returns true when a slide's name and href match a configured market entry.
  private doesSlideMatchMarket(
    slide: MarketSlide,
    market: { name: string; url: string }
  ): boolean {
    const acceptedNames = this.getAcceptedNames(market.name);
    const normalizedName = this.normalizeText(slide.marketName);
    const normalizedHref = slide.href.toLowerCase().trim();

    return (
      acceptedNames.includes(normalizedName) &&
      normalizedHref === market.url.toLowerCase().trim()
    );
  }

  // Cross-checks the rendered market cards against the configured markets and logs a summary.
  async validateMarketCards(): Promise<void> {
    await this.step('Validate market cards against config', async () => {
      await this.waitForPageReady();

      const location = getLocationConfig();

      const section = this.page.locator('text=Explore our locations near you');
      await section.scrollIntoViewIfNeeded();

      await this.page.waitForSelector('#cards .slick-slide');

      const slides = await this.getMarketSlides();

      const validSlides = slides.filter(
        (slide) => !slide.isCloned && slide.marketName && slide.href
      );

      const uniqueSlides = this.getUniqueMarketSlides(validSlides);

      await this.reportValue(
        `Market cards: ${slides.length} total, ${validSlides.length} valid, ${uniqueSlides.length} unique`
      );

      this.assertGreaterThan(uniqueSlides.length, 0, 'No unique market cards found');

      const matchedMarkets: MarketValidationRow[] = [];
      const missingMarkets: MissingMarketRow[] = [];
      const unmatchedUICards: UnmatchedMarketRow[] = [];

      for (const expectedMarket of location.markets) {
        const matchedCard = uniqueSlides.find((slide) =>
          this.doesSlideMatchMarket(slide, expectedMarket)
        );

        if (!matchedCard) {
          missingMarkets.push({
            configName: expectedMarket.name,
            configUrl: expectedMarket.url,
            status: 'Missing on UI'
          });

          continue;
        }

        matchedMarkets.push({
          name: matchedCard.marketName,
          configUrl: expectedMarket.url,
          uiUrl: matchedCard.href,
          status: 'Matched'
        });

        await this.reportValue(`Matched market: ${matchedCard.marketName}`, this.buildFullUrl(matchedCard.href));
      }

      for (const slide of uniqueSlides) {
        const existsInConfig = location.markets.some((market) =>
          this.doesSlideMatchMarket(slide, market)
        );

        if (!existsInConfig) {
          unmatchedUICards.push({
            uiName: slide.marketName,
            uiUrl: slide.href,
            status: 'Not in Config'
          });
        }
      }

      await this.reportMarketValidationSummary(matchedMarkets, missingMarkets, unmatchedUICards);
    });
  }

  // Reports matched, missing, and unmatched market counts to the Allure report.
  private async reportMarketValidationSummary(
    matchedMarkets: MarketValidationRow[],
    missingMarkets: MissingMarketRow[],
    unmatchedUICards: UnmatchedMarketRow[]
  ): Promise<void> {
    await this.reportValue(
      `Market validation summary: ${matchedMarkets.length} matched, ${missingMarkets.length} missing on UI, ${unmatchedUICards.length} not in config`
    );
  }

  // Checks each market card exposes a valid link and a successfully loaded image.
  async validateMarketCardMediaAndLinks(): Promise<void> {
    await this.step('Validate market card media and links', async () => {
      await this.waitForPageReady();

      const section = this.page.locator('text=Explore our locations near you');
      await section.scrollIntoViewIfNeeded();
      // Wait for the slides to be attached, not visible: in the slick carousel only the active slide
      // is visible at a time, so each card is scrolled into view individually in the loop below.
      await this.page.waitForSelector('#cards .slick-slide:not(.slick-cloned)', {
        state: 'attached',
        timeout: 15000
      });

      const cards = this.marketCards.filter({ has: this.page.locator('a[href]') });
      const count = await cards.count();

      expect(count, 'Home page should expose market cards with links').toBeGreaterThan(0);

      for (let index = 0; index < count; index++) {
        const card = cards.nth(index);
        await card.scrollIntoViewIfNeeded();

        const link = card.locator('a[href]').first();
        const href = await link.getAttribute('href');

        expect(href, `Market card ${index + 1} should have a valid href`).toBeTruthy();
        expect(
          href!,
          `Market card ${index + 1} should link to a site path or absolute URL`
        ).toMatch(/^(\/|https?:\/\/)/i);

        await this.reportValue(`Market card ${index + 1}`, this.buildFullUrl(href));

        const image = card.locator('img').first();
        await expect(image, `Market card ${index + 1} should include an image`).toBeAttached({ timeout: 10000 });

        // Bring the (often lazy-loaded) image into view, then poll until the browser has actually
        // decoded it - checking naturalWidth in the same tick as the scroll races the lazy load.
        await image.scrollIntoViewIfNeeded().catch(() => undefined);

        await expect
          .poll(
            () =>
              image.evaluate(
                (img: HTMLImageElement) =>
                  Boolean(img.currentSrc || img.src) &&
                  img.complete &&
                  img.naturalWidth > 0 &&
                  img.naturalHeight > 0
              ),
            {
              message: `Market card ${index + 1} image should be loaded`,
              timeout: 15000
            }
          )
          .toBeTruthy();
      }
    });
  }

  // Confirms an impossible search query yields no selectable autocomplete suggestion.
  async validateSearchAutocompleteNoMatchState(): Promise<void> {
    await this.step('Validate search autocomplete no-match state', async () => {
      await this.waitForPageReady();

      // Reveal the search input first - on the home page it can sit behind the header search toggle.
      const searchBox = await this.ensureSearchBoxVisible();

      await expect(searchBox, 'Home search input should be visible').toBeVisible({ timeout: 15000 });
      const noMatchQuery = 'zzzz automation no match';
      await searchBox.fill('');
      await searchBox.type(noMatchQuery, { delay: 75 });
      await this.settle(1500);

      const suggestions = this.page.locator(
        [
          '[data-aos="fade-down"] a[href]:visible',
          '[role="listbox"] a[href]:visible',
          '[role="option"]:visible',
          '[aria-live] a[href]:visible',
          '[class*="search"] a[href]:visible'
        ].join(', ')
      );
      const matchingSuggestions = suggestions.filter({
        hasText: new RegExp(noMatchQuery.replace(/\s+/g, '.*'), 'i')
      });

      expect(
        await matchingSuggestions.count(),
        'No-match search should not expose a selectable suggestion for the impossible query'
      ).toBe(0);
    });
  }

  // Verifies the cookie banner stays dismissed across a reload and stores a consent cookie.
  async validateCookieBannerPersistence(): Promise<void> {
    await this.step('Validate cookie banner persistence', async () => {
      const banner = this.page.locator('#onetrust-banner-sdk, .ot-sdk-container').first();
      const bannerWasVisible = await banner.isVisible({ timeout: 5000 }).catch(() => false);

      await this.acceptCookiesIfPresent();

      await expect(banner, 'Cookie banner should be hidden after accepting or closing').toBeHidden({ timeout: 10000 });

      const consentCookies = await this.page.context().cookies();
      if (bannerWasVisible) {
        expect(
          consentCookies.some(cookie => /OptanonConsent|OptanonAlertBoxClosed/i.test(cookie.name)),
          'Accepting/closing cookie banner should store a OneTrust consent cookie'
        ).toBeTruthy();
      }

      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
      await this.waitForPageReady();

      await expect(
        banner,
        'Cookie banner should remain hidden after page reload'
      ).toBeHidden({ timeout: 10000 });
    });
  }
}
