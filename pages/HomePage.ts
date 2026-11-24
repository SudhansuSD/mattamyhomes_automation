import { Locator, Page, expect } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { SearchablePage } from './SearchablePage';

/** Viewport width from which the masthead shows the hero video instead of the image (its own breakpoint, not the header's). */
const HERO_VIDEO_MIN_WIDTH = 768;

type HeroVideoState = {
  autoplayAttribute: boolean;
  autoplayProperty: boolean;
  muted: boolean;
  defaultMuted: boolean;
  playsInlineAttribute: boolean;
  sourceCount: number;
  src: string;
};

type HeroImageState = {
  posterImageUrl: string;
  backgroundImageUrl: string;
  videoDisplayed: boolean;
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

    this.heroSection = page.locator('#masthead');
    this.heroVideo = this.heroSection.locator('video').first();
    this.header = page.locator('header');

    this.marketCards = page.locator('#cards .slick-slide:not(.slick-cloned)');
  }

  // PAGE LOAD

  // Confirms the home page finished loading and shows the expected title.
  async verifyPageLoaded(): Promise<void> {
    await this.step('Verify home page loaded', async () => {
      await this.assertPageLoaded('Home page should finish loading');
      await this.assertPageTitle(/Mattamy Homes/i, 'Home page title should include Mattamy Homes');
    });
  }

  // Checks the masthead hero media: the video on desktop, the image on phones.
  async validateHeroMedia(): Promise<void> {
    await this.step('Validate hero media', async () => {
      await this.waitForPageReady();
      await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
      await this.assertVisible(this.heroSection, 'Hero section should be visible');
      await this.heroVideo.waitFor({ state: 'attached', timeout: 15000 });

      if (await this.isHeroImageViewport()) {
        await this.validateHeroImage();
        return;
      }

      await this.validateHeroVideoAutoplay();
    });
  }

  // True when the viewport is narrow enough for the masthead to show the hero image.
  private async isHeroImageViewport(): Promise<boolean> {
    // Defaults to the breakpoint so an unreadable viewport runs the stricter video checks.
    const viewportWidth = await this.page
      .evaluate(() => window.innerWidth)
      .catch(() => HERO_VIDEO_MIN_WIDTH);

    return viewportWidth < HERO_VIDEO_MIN_WIDTH;
  }

  // Checks the phone masthead shows its fallback hero image in place of the video.
  private async validateHeroImage(): Promise<void> {
    await this.step('Validate hero image', async () => {
      const imageState = await this.getHeroImageState();

      await this.reportValue('Hero poster image URL', imageState.posterImageUrl);
      await this.reportValue('Hero background image URL', imageState.backgroundImageUrl);

      this.expectHeroImageSource(imageState);
      await this.expectHeroImageRendered(imageState.posterImageUrl, 'Hero poster image');
      await this.expectHeroImageRendered(imageState.backgroundImageUrl, 'Hero background image');
    });
  }

  // Reads the video's poster fallback, the masthead's painted background, and whether the video is on screen.
  private async getHeroImageState(): Promise<HeroImageState> {
    return this.heroSection.evaluate((section: HTMLElement) => {
      // Keep empty as empty; resolving it would yield the page URL and falsely pass the checks.
      const toAbsoluteUrl = (url: string) => {
        if (!url.trim()) {
          return '';
        }

        try {
          return new URL(url, window.location.href).href;
        } catch {
          return '';
        }
      };

      const video = section.querySelector('video');
      // A different CDN rendition of the poster, so it is checked separately, not compared.
      const backgroundUrl =
        /url\(["']?(.*?)["']?\)/.exec(window.getComputedStyle(section).backgroundImage)?.[1] ?? '';

      return {
        posterImageUrl: toAbsoluteUrl(video?.getAttribute('poster') ?? ''),
        backgroundImageUrl: toAbsoluteUrl(backgroundUrl),
        videoDisplayed: video ? window.getComputedStyle(video).display !== 'none' : false,
      };
    });
  }

  // Asserts the phone masthead has a poster and background image and hides the video.
  private expectHeroImageSource(imageState: HeroImageState): void {
    expect(
      imageState.posterImageUrl,
      'Hero video should declare a poster image as the fallback when autoplay is unavailable',
    ).toBeTruthy();

    expect(
      imageState.backgroundImageUrl,
      'Masthead should paint a hero background image on phone viewports',
    ).toBeTruthy();

    expect(
      imageState.videoDisplayed,
      'Hero video should stay hidden on phone viewports, where the hero image replaces it',
    ).toBeFalsy();
  }

  // Confirms the browser can actually load and decode the hero image.
  private async expectHeroImageRendered(imageUrl: string, imageName: string): Promise<void> {
    const decodedWidth = await this.page.evaluate(async (url) => {
      const image = new Image();
      image.src = url;

      // Capped at 15s so an unresponsive CDN cannot hang the test.
      return Promise.race([
        image
          .decode()
          .then(() => image.naturalWidth)
          .catch(() => 0),
        new Promise<number>((resolve) => window.setTimeout(() => resolve(0), 15000)),
      ]);
    }, imageUrl);

    expect(
      decodedWidth,
      `${imageName} should load from the CDN with real pixel dimensions`,
    ).toBeGreaterThan(0);
  }

  // Checks that the hero video is configured for muted inline autoplay and actually plays.
  private async validateHeroVideoAutoplay(): Promise<void> {
    await this.step('Validate hero video autoplay', async () => {
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
        video.hasAttribute('playsinline') || video.hasAttribute('webkit-playsinline'),
      sourceCount: video.querySelectorAll('source').length,
      src: video.currentSrc || video.src,
    }));
  }

  // Asserts the captured video state has autoplay, muted, playsinline, and a playable source.
  private expectHeroVideoAutoplayAttributes(videoState: HeroVideoState): void {
    expect(
      videoState.autoplayAttribute || videoState.autoplayProperty,
      'Hero video should have autoplay enabled',
    ).toBeTruthy();

    expect(
      videoState.muted || videoState.defaultMuted,
      'Hero autoplay video should be muted so browsers allow autoplay',
    ).toBeTruthy();

    expect(
      videoState.playsInlineAttribute,
      'Hero autoplay video should include playsinline for mobile playback',
    ).toBeTruthy();

    expect(
      videoState.src || videoState.sourceCount > 0,
      'Hero video should have a playable source',
    ).toBeTruthy();
  }

  // Waits until the hero video has buffered enough data to begin playback.
  private async expectHeroVideoReadyForPlayback(): Promise<void> {
    await expect
      .poll(
        async () => this.heroVideo.evaluate((video: HTMLVideoElement) => video.readyState >= 2),
        {
          message: 'Hero video should load enough data to start playback',
          timeout: 15000,
        },
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
  private async expectHeroVideoPlaybackProgress(playbackStartTime: number): Promise<void> {
    await expect
      .poll(
        async () =>
          this.heroVideo.evaluate(
            (video: HTMLVideoElement, startTime) => !video.paused && video.currentTime > startTime,
            playbackStartTime,
          ),
        {
          message: 'Hero video should autoplay and advance playback time',
          timeout: 10000,
        },
      )
      .toBeTruthy();
  }

  // MARKET CARD UI AND LINK VALIDATION

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
          href,
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
          href: slide.href,
        });
      }
    }

    return Array.from(uniqueMarkets.values());
  }

  // Returns true when a slide's name and href match a configured market entry.
  private doesSlideMatchMarket(slide: MarketSlide, market: { name: string; url: string }): boolean {
    const acceptedNames = this.getAcceptedNames(market.name);
    const normalizedName = this.normalizeText(slide.marketName);
    const normalizedHref = slide.href.toLowerCase().trim();

    return (
      acceptedNames.includes(normalizedName) && normalizedHref === market.url.toLowerCase().trim()
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
        (slide) => !slide.isCloned && slide.marketName && slide.href,
      );

      const uniqueSlides = this.getUniqueMarketSlides(validSlides);

      await this.reportValue(
        `Market cards: ${slides.length} total, ${validSlides.length} valid, ${uniqueSlides.length} unique`,
      );

      this.assertGreaterThan(uniqueSlides.length, 0, 'No unique market cards found');

      const matchedMarkets: MarketValidationRow[] = [];
      const missingMarkets: MissingMarketRow[] = [];
      const unmatchedUICards: UnmatchedMarketRow[] = [];

      for (const expectedMarket of location.markets) {
        const matchedCard = uniqueSlides.find((slide) =>
          this.doesSlideMatchMarket(slide, expectedMarket),
        );

        if (!matchedCard) {
          missingMarkets.push({
            configName: expectedMarket.name,
            configUrl: expectedMarket.url,
            status: 'Missing on UI',
          });

          continue;
        }

        matchedMarkets.push({
          name: matchedCard.marketName,
          configUrl: expectedMarket.url,
          uiUrl: matchedCard.href,
          status: 'Matched',
        });

        await this.reportValue(
          `Matched market: ${matchedCard.marketName}`,
          this.buildFullUrl(matchedCard.href),
        );
      }

      for (const slide of uniqueSlides) {
        const existsInConfig = location.markets.some((market) =>
          this.doesSlideMatchMarket(slide, market),
        );

        if (!existsInConfig) {
          unmatchedUICards.push({
            uiName: slide.marketName,
            uiUrl: slide.href,
            status: 'Not in Config',
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
    unmatchedUICards: UnmatchedMarketRow[],
  ): Promise<void> {
    await this.reportValue(
      `Market validation summary: ${matchedMarkets.length} matched, ${missingMarkets.length} missing on UI, ${unmatchedUICards.length} not in config`,
    );
  }

  // Opens every market card from the home page and checks the market page it lands on.
  async validateEachMarketCardOpens(): Promise<void> {
    await this.step('Open each market card from the home page', async () => {
      await this.waitForPageReady();
      await this.page.waitForSelector('#cards .slick-slide', { timeout: 15000 });

      const slides = await this.getMarketSlides();
      const cards = this.getUniqueMarketSlides(
        slides.filter((slide) => !slide.isCloned && slide.href),
      );

      expect(cards.length, 'Home page should expose market cards to open').toBeGreaterThan(0);
      await this.reportValue(`Market cards to open: ${cards.length}`);

      const failures: string[] = [];
      // Header reads USA / CANADA; the query param is USA / CAN.
      const expectedCountry = this.location.country === 'USA' ? 'USA' : 'CANADA';

      for (const [index, card] of cards.entries()) {
        const label = card.marketName || card.href;

        await this.step(`Open market card ${index + 1}/${cards.length}: ${label}`, async () => {
          // A fresh tab per card keeps renderer memory from building up across the whole carousel,
          // which is where this loop crashed when every card reused one tab.
          const tab = await this.page.context().newPage();

          try {
            const failure = await new HomePage(tab).openMarketCard(card, label, expectedCountry);

            if (failure) {
              failures.push(failure);
            }
          } finally {
            await tab.close().catch(() => undefined);
          }
        });
      }

      expect(
        failures,
        `Market cards that failed to open correctly: ${failures.join('\n')}`,
      ).toEqual([]);
    });
  }

  // Opens one market card from the home page and returns why it failed, or null when it landed correctly.
  private async openMarketCard(
    card: MarketSlide,
    label: string,
    expectedCountry: string,
  ): Promise<string | null> {
    await this.navigate();

    const link = this.page.locator(`#cards a[href="${card.href}"]`).first();

    // Inactive carousel slides sit off-screen where even a forced click fails; fall back to a DOM click.
    await link.scrollIntoViewIfNeeded().catch(() => undefined);
    await link.click({ force: true, timeout: 5000 }).catch(async () => {
      await link.dispatchEvent('click');
    });
    await this.waitForPageReady();
    await this.ensurePageRendered();

    const landedUrl = this.page.url();

    if (!landedUrl.includes(card.href)) {
      return `${label}: expected to land on ${card.href}, got ${landedUrl}`;
    }

    // Check the header country, not ?country=: card links are bare paths and the site keeps country in session.
    const countrySelector = this.page.locator('button[aria-label^="Select your country."]').first();

    const countrySelectorPresent = await countrySelector
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (countrySelectorPresent) {
      // Poll: the header briefly shows its default country before client state hydrates.
      let shown = '';
      const settled = await expect
        .poll(
          async () => {
            shown = `${await countrySelector.getAttribute('aria-label').catch(() => '')} ${await countrySelector.innerText().catch(() => '')}`;
            return new RegExp(expectedCountry, 'i').test(shown);
          },
          { timeout: 10000 },
        )
        .toBe(true)
        .then(() => true)
        .catch(() => false);

      if (!settled) {
        return `${label}: country still reads "${shown.trim()}" 10s after opening the card (${landedUrl})`;
      }
    }

    // waitFor, not isVisible(): isVisible() ignores its timeout and would catch the heading mid-render.
    const heading = this.page.getByRole('heading', { level: 1 }).first();
    const headingRendered = await heading
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    if (!headingRendered) {
      return `${label}: market page rendered no level-1 heading (${landedUrl})`;
    }

    await this.reportValue(`Opened ${label}`, landedUrl);

    return null;
  }

  // Checks each market card exposes a valid link and a successfully loaded image.
  async validateMarketCardMediaAndLinks(): Promise<void> {
    await this.step('Validate market card media and links', async () => {
      await this.waitForPageReady();

      const section = this.page.locator('text=Explore our locations near you');
      await section.scrollIntoViewIfNeeded();
      // Attached, not visible: only the active carousel slide is visible at a time.
      await this.page.waitForSelector('#cards .slick-slide:not(.slick-cloned)', {
        state: 'attached',
        timeout: 15000,
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
          `Market card ${index + 1} should link to a site path or absolute URL`,
        ).toMatch(/^(\/|https?:\/\/)/i);

        await this.reportValue(`Market card ${index + 1}`, this.buildFullUrl(href));

        const image = card.locator('img').first();
        await expect(image, `Market card ${index + 1} should include an image`).toBeAttached({
          timeout: 10000,
        });

        // The image is lazy-loaded, so scroll it into view and poll until it has decoded.
        await image.scrollIntoViewIfNeeded().catch(() => undefined);

        await expect
          .poll(
            () =>
              image.evaluate(
                (img: HTMLImageElement) =>
                  Boolean(img.currentSrc || img.src) &&
                  img.complete &&
                  img.naturalWidth > 0 &&
                  img.naturalHeight > 0,
              ),
            {
              message: `Market card ${index + 1} image should be loaded`,
              timeout: 15000,
            },
          )
          .toBeTruthy();
      }
    });
  }

  // Confirms an impossible search query yields no selectable autocomplete suggestion.
  async validateSearchAutocompleteNoMatchState(): Promise<void> {
    await this.step('Validate search autocomplete no-match state', async () => {
      await this.waitForPageReady();

      // The search input can sit behind the header search toggle.
      const searchBox = await this.ensureSearchBoxVisible();

      await expect(searchBox, 'Home search input should be visible').toBeVisible({
        timeout: 15000,
      });
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
          '[class*="search"] a[href]:visible',
        ].join(', '),
      );
      const matchingSuggestions = suggestions.filter({
        hasText: new RegExp(noMatchQuery.replace(/\s+/g, '.*'), 'i'),
      });

      expect(
        await matchingSuggestions.count(),
        'No-match search should not expose a selectable suggestion for the impossible query',
      ).toBe(0);
    });
  }

  // Checks that the cookie banner stays dismissed after reload and stores a consent cookie.
  async validateCookieBannerPersistence(): Promise<void> {
    await this.step('Validate cookie banner persistence', async () => {
      const banner = this.page.locator('#onetrust-banner-sdk, .ot-sdk-container').first();
      const bannerWasVisible = await banner.isVisible({ timeout: 5000 }).catch(() => false);

      await this.acceptCookiesIfPresent();

      await expect(banner, 'Cookie banner should be hidden after accepting or closing').toBeHidden({
        timeout: 10000,
      });

      const consentCookies = await this.page.context().cookies();
      if (bannerWasVisible) {
        expect(
          consentCookies.some((cookie) =>
            /OptanonConsent|OptanonAlertBoxClosed/i.test(cookie.name),
          ),
          'Accepting/closing cookie banner should store a OneTrust consent cookie',
        ).toBeTruthy();
      }

      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
      await this.waitForPageReady();

      await expect(banner, 'Cookie banner should remain hidden after page reload').toBeHidden({
        timeout: 10000,
      });
    });
  }

  // PROMOTION / NOTIFICATION BANNER VALIDATION

  // Checks that the promotion or notification banner has content and can be dismissed when shown.
  async validatePromotionOrNotificationBanner(): Promise<void> {
    await this.step('Validate promotion / notification banner', async () => {
      await this.waitForPageReady();

      const banner = this.page
        .locator(
          [
            '#national-notification-banner',
            '#market-notification-banner',
            '#notification-banner',
            '[class*="promotion" i][class*="banner" i]',
            '[class*="notification" i][class*="banner" i]',
          ].join(', '),
        )
        .filter({ hasText: /\S/ })
        .first();

      if (!(await banner.isVisible({ timeout: 8000 }).catch(() => false))) {
        await this.reportValue(
          'No promotion / notification banner shown on the home page (skipping)',
        );
        return;
      }

      const text = (await banner.innerText().catch(() => ''))?.replace(/\s+/g, ' ').trim() ?? '';
      expect(text.length, 'A shown banner should render meaningful text').toBeGreaterThan(0);
      await this.reportValue('Promotion / notification banner text', text.slice(0, 120));

      const bannerLink = banner.locator('a[href]').first();
      if (await bannerLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        const href = await bannerLink.getAttribute('href');
        expect(href, 'Banner CTA should link to a destination').toBeTruthy();
        await this.reportValue('Banner CTA', this.buildFullUrl(href));
      }

      const closeButton = banner
        .getByRole('button', { name: /close|dismiss|got it|ok|x/i })
        .or(
          banner.locator(
            'button[aria-label*="close" i], button[title*="close" i], button:has(svg)',
          ),
        )
        .first();

      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click({ force: true }).catch(() => undefined);
        await expect(banner, 'Dismissing the banner should hide it').toBeHidden({ timeout: 10000 });
      }
    });
  }
}
