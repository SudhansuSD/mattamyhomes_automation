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

  async verifyPageLoaded(): Promise<void> {
    await this.assertPageLoaded('Home page should finish loading');
    await this.assertPageTitle(/Mattamy Homes/i, 'Home page title should include Mattamy Homes');
  }

  async validateHeroVideoAutoplay(): Promise<void> {
    await this.waitForPageReady();
    await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
    await this.heroVideo.waitFor({ state: 'attached', timeout: 15000 });

    await this.assertVisible(this.heroVideo, 'Hero section video should be visible');

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
      playsInlineAttribute:
        video.hasAttribute('playsinline') ||
        video.hasAttribute('webkit-playsinline'),
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

    expect(
      videoState.playsInlineAttribute,
      'Hero autoplay video should include playsinline for mobile playback'
    ).toBeTruthy();

    expect(
      videoState.src || videoState.sourceCount > 0,
      'Hero video should have a playable source'
    ).toBeTruthy();
  }

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

  private getAcceptedNames(name: string): string[] {
    return name.split('||').map((part) => this.normalizeText(part));
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

        return {
          isCloned,
          marketName,
          href
        };
      });
    });
  }

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

  async validateMarketCards(): Promise<void> {
    await this.waitForPageReady();

    const location = getLocationConfig();

    const section = this.page.locator('text=Explore our locations near you');
    await section.scrollIntoViewIfNeeded();

    await this.page.waitForSelector('#cards .slick-slide');

    const slides = await this.getMarketSlides();

    console.log(`📊 Total market cards: ${slides.length}`);

    const validSlides = slides.filter(
      (slide) => !slide.isCloned && slide.marketName && slide.href
    );

    console.log(`✅ Valid market cards after filtering: ${validSlides.length}`);

    const uniqueSlides = this.getUniqueMarketSlides(validSlides);

    console.log(`🎯 Unique markets found: ${uniqueSlides.length}`);

    this.assertGreaterThan(uniqueSlides.length, 0, 'No unique market cards found');

    const matchedMarkets: MarketValidationRow[] = [];
    const missingMarkets: MissingMarketRow[] = [];
    const unmatchedUICards: UnmatchedMarketRow[] = [];

    for (const expectedMarket of location.markets) {
      const acceptedNames = this.getAcceptedNames(expectedMarket.name);

      const matchedCard = uniqueSlides.find((slide) => {
        const normalizedName = this.normalizeText(slide.marketName);
        const normalizedHref = slide.href.toLowerCase().trim();

        return (
          acceptedNames.includes(normalizedName) &&
          normalizedHref === expectedMarket.url.toLowerCase().trim()
        );
      });

      if (!matchedCard) {
        missingMarkets.push({
          configName: expectedMarket.name,
          configUrl: expectedMarket.url,
          status: 'Missing on UI'
        });

        continue;
      }

      const fullUrl = this.buildFullUrl(matchedCard.href);

      matchedMarkets.push({
        name: matchedCard.marketName,
        configUrl: expectedMarket.url,
        uiUrl: matchedCard.href,
        status: 'Matched'
      });

      console.log(`✅ Market Name: ${matchedCard.marketName} | URL: ${fullUrl}`);
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
