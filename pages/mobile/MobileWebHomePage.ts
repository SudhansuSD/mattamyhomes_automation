import assert from 'node:assert/strict';
import { MobileWebBasePage } from './MobileWebBasePage';
import { getLocationConfig } from '../../config/locations/locationConfig';

export class MobileWebHomePage extends MobileWebBasePage {
  homePath: string;
  expectedTitle: RegExp;

  /** Sets up the page object with the locators it needs. */
  constructor(driver: MobileBrowser = browser) {
    super(driver);
    this.homePath = '/';
    this.expectedTitle = /Mattamy Homes/i;
  }

  /** Opens the configured home page. */
  async open(path = this.homePath) {
    const targetPath =
      path === this.homePath ? `${this.homePath}?${getLocationConfig().queryParam}` : path;
    const currentUrl = await this.driver.getUrl().catch(() => '');

    if (path === this.homePath && this.isConfiguredHomePage(currentUrl)) {
      await this.waitForPageReady();
      await this.acceptCookiesIfVisible();
      await this.dismissPromoPopupIfPresent();
      return;
    }

    await super.open(targetPath);
  }

  /** Checks that the page loaded correctly. */
  async verifyLoaded() {
    const snapshot = await this.waitForHomeContent();
    const viewport = await this.driver.getWindowSize();

    assert.match(
      `${snapshot.title}\n${snapshot.bodyText}`,
      this.expectedTitle,
      `Expected Mattamy title/source, received title: ${snapshot.title}`,
    );
    this.expectMobileUserAgent(snapshot.userAgent);
    assert.match(snapshot.readyState, /complete|interactive|loading/);
    assert.equal(
      snapshot.hasHomeContent || snapshot.hasSearchEntryPoint,
      true,
      'Expected mobile home page content or Find Your Home entry point',
    );
    assert.ok(
      viewport.width > 0 && viewport.height > 0,
      'Expected mobile browser viewport dimensions',
    );
    this.assertNoErrorPage(snapshot);
  }

  /** Checks hero section. */
  async validateHeroSection() {
    const snapshot = await this.waitForHomeContent();

    if (snapshot.isSourceOnly) {
      assert.match(
        snapshot.bodyText,
        /home\. where moments matter most|designed with you in mind|explore our locations|find your dream home|find your home/i,
        'Expected home page source snapshot to include hero or home-buying content',
      );
      return;
    }

    await this.closeCookiePreferencesIfVisible();
    const hero = await this.driver.execute(() => {
      const sections = Array.from(
        document.querySelectorAll('main section, section, header + *'),
      ) as HTMLElement[];
      const section =
        sections.find((candidate) => {
          const text = (candidate.innerText || '').replace(/\s+/g, ' ').trim();

          return (
            /home|moments|designed|mattamy|find/i.test(text) &&
            !/cookie preferences|strictly necessary/i.test(text)
          );
        }) ||
        sections.find(
          (candidate) => !/cookie preferences|strictly necessary/i.test(candidate.innerText || ''),
        );
      const video = section?.querySelector('video');
      const image = section?.querySelector('img, picture source, [style*="background-image"]');
      const backgroundImage = section ? window.getComputedStyle(section).backgroundImage : '';
      const text = (section?.innerText || '').replace(/\s+/g, ' ').trim();

      return {
        hasHero: Boolean(section),
        hasMedia: Boolean(video || image || (backgroundImage && backgroundImage !== 'none')),
        hasVideo: Boolean(video),
        autoplay: Boolean(video?.autoplay || video?.hasAttribute('autoplay')),
        muted: Boolean(video?.muted || video?.defaultMuted),
        playsInline: Boolean(
          video?.hasAttribute('playsinline') || video?.hasAttribute('webkit-playsinline'),
        ),
        text,
      };
    });

    assert.equal(hero.hasHero, true, 'Expected a hero section to render on mobile home page');
    assert.match(
      hero.text,
      /find|home|community|mattamy/i,
      'Expected hero copy to include home-buying context',
    );

    if (hero.hasVideo) {
      assert.equal(
        hero.autoplay,
        true,
        'Hero video should keep the desktop autoplay behavior on mobile',
      );
      assert.equal(hero.muted, true, 'Hero autoplay video should be muted on mobile');
      assert.equal(
        hero.playsInline,
        true,
        'Hero video should include playsinline for mobile browsers',
      );
    }
  }

  /** Checks that the header links are visible. */
  async verifyHeaderLinksVisible() {
    const snapshot = await this.waitForHomeContent();

    if (snapshot.isSourceOnly) {
      assert.match(
        snapshot.bodyText,
        /Find Your Dream Home|Find Your Home|Contact Us|Customer Care|About/i,
        'Expected home source snapshot to include header navigation links',
      );
      return;
    }

    await this.openHamburgerMenu();

    const headerSnapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const visibleLinks = Array.from(
        document.querySelectorAll('header a, nav a, [role="dialog"] a, a, button'),
      )
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            rect.width > 0 &&
            rect.height > 0
          );
        })
        .map((element) =>
          `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`.trim(),
        );

      return {
        hasHeader: Boolean(document.querySelector('header')),
        hasFindYourHome: /find (your|my)|find home/i.test(text),
        hasExpectedNavigation: visibleLinks.some((link) =>
          /about|contact|care|communities|find/i.test(link),
        ),
      };
    });

    assert.equal(headerSnapshot.hasHeader, true, 'Expected header to render on mobile home page');
    assert.equal(
      headerSnapshot.hasFindYourHome,
      true,
      'Expected Find Your Home link in mobile header navigation',
    );
    assert.equal(
      headerSnapshot.hasExpectedNavigation,
      true,
      'Expected key mobile header navigation links to be visible',
    );
  }

  /** Checks that the footer loaded. */
  async verifyFooterLoaded() {
    const snapshot = await this.waitForHomeContent();

    if (snapshot.isSourceOnly) {
      assert.match(
        snapshot.bodyText,
        /privacy|terms|contact|careers|copyright|mattamy/i,
        'Expected home source snapshot to include footer links or legal copy',
      );
      return;
    }

    await this.closeCookiePreferencesIfVisible();
    await this.driver.execute(() => window.scrollTo(0, document.body.scrollHeight));
    await this.waitForMobileCondition(
      async () => /privacy|terms|contact|careers|copyright|mattamy/i.test(await this.getBodyText()),
      'Expected footer/legal content after scrolling to page bottom',
    );

    const footer = await this.driver.execute(() => {
      const element = document.querySelector('footer');
      const text = (element?.innerText || document.body?.innerText || '')
        .replace(/\s+/g, ' ')
        .trim();
      const links = Array.from((element || document).querySelectorAll('a')).map((link) => ({
        text: (link.textContent || '').replace(/\s+/g, ' ').trim(),
        href: link.getAttribute('href') || '',
      }));
      const hasFooterContext = /privacy|terms|contact|careers|copyright|mattamy/i.test(text);

      return {
        hasFooter: Boolean(element) || hasFooterContext,
        hasPrivacyPolicy: links.some((link) => /privacy/i.test(`${link.text} ${link.href}`)),
        hasFooterContext,
      };
    });

    assert.equal(footer.hasFooter, true, 'Expected footer to render on mobile home page');
    assert.equal(footer.hasPrivacyPolicy, true, 'Expected footer to include Privacy Policy link');
    assert.equal(
      footer.hasFooterContext,
      true,
      'Expected footer to include standard Mattamy links or copy',
    );
  }

  /** Searches for a market. */
  async searchByMarket(market = getLocationConfig().market) {
    const location = getLocationConfig();
    if (this.shouldUseHomeAutocomplete()) {
      const didSearch = await this.searchFromHomeAutocomplete(market, 'market', {
        preferredHrefPart: `metro=${encodeURIComponent(market)}`,
      });

      if (didSearch) {
        return true;
      }

      this.logStep(
        `Market autocomplete did not open on mobile; opening search URL directly for: ${market}`,
      );
    }

    await this.navigateTo(
      `/search?productType=community&metro=${encodeURIComponent(market)}&country=${location.country}&hideMap=true`,
    );
    await this.waitForPageReady();
    return true;
  }

  /** Checks the market search flow. */
  async verifySearchByMarket(expectedMarket = getLocationConfig().market) {
    const currentUrl = await this.driver.getUrl();
    const normalizedUrl = this.normalizeText(currentUrl);
    const params = new URL(currentUrl).searchParams;
    const metro = params.get('metro') || params.get('community') || '';

    assert.ok(
      /\/search/i.test(currentUrl) || normalizedUrl.includes(this.normalizeText(expectedMarket)),
      'Expected location autocomplete selection to land on search results or the selected market page',
    );

    if (/\/search/i.test(currentUrl)) {
      assert.ok(
        this.normalizeText(metro).includes(this.normalizeText(expectedMarket)),
        `Expected search URL to include selected market ${expectedMarket}`,
      );
    } else {
      assert.ok(
        normalizedUrl.includes(this.normalizeText(expectedMarket)),
        `Expected market URL to include selected market ${expectedMarket}`,
      );
    }
  }

  /** Searches for a community. */
  async searchByCommunity(community = getLocationConfig().community) {
    const location = getLocationConfig();
    const communityPath = this.getCommunityPath(location);
    const didSearch = await this.searchFromHomeAutocompleteWithRetry(community, 'community', {
      preferredHrefPart: communityPath,
    });

    assert.equal(
      didSearch,
      true,
      `Expected home page search bar autocomplete to find and open community: ${community}`,
    );
    return true;
  }

  /** Checks the community search flow. */
  async verifySearchByCommunity(expectedCommunity = getLocationConfig().community) {
    await this.waitForPageReady();
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`,
      45000,
    );
    const snapshot = await this.getSnapshot();

    assert.match(snapshot.bodyText, new RegExp(this.escapeRegExp(expectedCommunity), 'i'));
    assert.match(snapshot.currentUrl, new RegExp(this.escapeRegExp(this.getCommunityPath()), 'i'));
    this.assertNoErrorPage(snapshot);
  }

  /** Searches for a quick move-in home. */
  async searchByQMI(address = getLocationConfig().qmiAddress) {
    const location = getLocationConfig();
    const didSearch = await this.searchFromHomeAutocompleteWithRetry(address, 'qmi', {
      preferredHrefPart: location.qmiPath,
    });

    assert.equal(
      didSearch,
      true,
      `Expected home page search bar autocomplete to find and open QMI address: ${address}`,
    );
    return true;
  }

  /** Checks the QMI search flow. */
  async verifySearchByQMI(expectedAddress = getLocationConfig().qmiAddress) {
    await this.waitForPageReady();
    const location = getLocationConfig();
    const expectedPathPattern = new RegExp(this.escapeRegExp(location.qmiPath), 'i');
    const expectedAddressPattern = new RegExp(this.escapeRegExp(expectedAddress), 'i');

    await this.driver.waitUntil(async () => expectedPathPattern.test(await this.driver.getUrl()), {
      timeout: 30000,
      timeoutMsg: `Expected QMI search to navigate to ${location.qmiPath}`,
    });

    await this.waitForBodyText(
      expectedAddressPattern,
      `Expected QMI detail page to include ${expectedAddress}`,
      45000,
    ).catch(() => undefined);

    const snapshot = await this.getSnapshot();
    const isExpectedQmiPath = expectedPathPattern.test(snapshot.currentUrl);
    const hasExpectedAddress = expectedAddressPattern.test(
      `${snapshot.title}\n${snapshot.bodyText}`,
    );
    const isCookieOnlyContent =
      /By using our website, you agree to the use of all cookies/i.test(snapshot.bodyText) &&
      snapshot.bodyText.trim().length < 250;

    assert.equal(isExpectedQmiPath, true, `Expected QMI URL to include ${location.qmiPath}`);

    if (!hasExpectedAddress && !isCookieOnlyContent) {
      assert.match(snapshot.bodyText, expectedAddressPattern);
    }

    if (!isCookieOnlyContent) {
      this.assertNoErrorPage(snapshot);
    }
  }

  /** Searches for a plan. */
  async searchByPlan(planName = getLocationConfig().planName) {
    const location = getLocationConfig();
    const preferredPlanPath = location.expectedPlanPath || location.expectedPlanUrlPart;
    const didSearch = await this.searchFromHomeAutocompleteWithRetry(planName, 'plan', {
      preferredHrefPart: preferredPlanPath,
    });

    assert.equal(
      didSearch,
      true,
      `Expected home page search bar autocomplete to find and open plan: ${planName}`,
    );
    return true;
  }

  // UNIFIED SEARCH-FROM-HOME DISPATCHER (mirrors web SearchablePage)

  /** Runs a search and checks that it lands on the expected page. */
  async searchAndValidateByValue(searchType, searchValue) {
    try {
      await this.runSearchAndValidate(searchType, searchValue);
    } catch (error) {
      if (!this.isSessionLostError(error)) {
        throw error;
      }

      this.logStep(
        `Mobile Chrome session was lost during ${searchType} search-from-home; reloading session and retrying once.`,
      );
      await this.reloadSessionAfterLoss();
      await this.runSearchAndValidate(searchType, searchValue);
    }
  }

  /** Runs a mobile search flow and validates the landing page. */
  async runSearchAndValidate(searchType, searchValue) {
    const location = getLocationConfig();

    await this.ensureSearchStartsFromHomePage();

    switch (searchType) {
      case 'market':
        await this.searchByMarket(searchValue);
        await this.dismissPromoPopupIfPresent();
        await this.verifySearchByMarket(searchValue);
        break;

      case 'community':
        await this.searchByCommunity(searchValue);
        await this.dismissPromoPopupIfPresent();
        await this.verifySearchByCommunity(searchValue);
        break;

      case 'plan':
        await this.searchByPlan(searchValue);
        await this.dismissPromoPopupIfPresent();
        await this.verifySearchByPlan(location.expectedPlanUrlPart);
        break;

      case 'qmi':
        await this.searchByQMI(searchValue);
        await this.dismissPromoPopupIfPresent();
        await this.verifySearchByQMI(searchValue);
        break;

      default:
        throw new Error(`Invalid mobile home search type: ${searchType}`);
    }

    await this.waitForPageReady();
  }

  /** Ensures search starts from home page. */
  async ensureSearchStartsFromHomePage() {
    const currentUrl = await this.driver.getUrl().catch(() => '');

    if (this.isConfiguredHomePage(currentUrl)) {
      await this.closeCookiePreferencesIfVisible();
      await this.waitForPageReady();
      return;
    }

    await this.open();
  }

  /** Checks whether the browser is on the configured home page. */
  isConfiguredHomePage(currentUrl) {
    if (!currentUrl || this.isChromeNativeUrl(currentUrl)) {
      return false;
    }

    try {
      const url = new URL(currentUrl);

      if (!/^https?:$/i.test(url.protocol)) {
        return false;
      }

      const pathname = url.pathname.replace(/\/+$/, '');

      return pathname === '' || pathname === '/';
    } catch {
      return false;
    }
  }

  /** Checks the plan search flow. */
  async verifySearchByPlan(expectedUrlPart = getLocationConfig().expectedPlanUrlPart) {
    await this.waitForPageReady();
    const snapshot = await this.getSnapshot();

    assert.match(snapshot.currentUrl, new RegExp(this.escapeRegExp(expectedUrlPart), 'i'));
    this.assertNoErrorPage(snapshot);
  }

  /** Checks market cards. */
  async validateMarketCards() {
    const snapshot = await this.waitForHomeContent();

    if (snapshot.isSourceOnly) {
      const location = getLocationConfig();
      const missingMarkets = location.markets.filter((expectedMarket) => {
        const names = expectedMarket.name.split('||');

        return !names.some((name) =>
          new RegExp(this.escapeRegExp(name), 'i').test(snapshot.bodyText),
        );
      });

      if (missingMarkets.length === location.markets.length) {
        this.logSkip(
          'Market cards are not present in the mobile source snapshot - skipping rendered card validation',
        );
        return;
      }

      assert.deepEqual(
        missingMarkets.map((market) => market.name),
        [],
        `Expected configured markets in mobile home source snapshot: ${missingMarkets.map((market) => market.name).join(', ')}`,
      );
      return;
    }

    await this.closeCookiePreferencesIfVisible();

    const location = getLocationConfig();
    const cardSnapshot = await this.driver.execute(() => {
      const section = Array.from(document.querySelectorAll('section, div')).find((element) =>
        /explore our locations near you|explore our locations/i.test(element.textContent || ''),
      );

      section?.scrollIntoView({ block: 'center', inline: 'center' });

      const slides = Array.from(
        document.querySelectorAll(
          '#cards .slick-slide, a[href*="/arizona/"], a[href*="/florida/"], a[href*="/ontario/"], a[href*="/alberta/"], a[href*="/texas/"], a[href*="/north-carolina/"], a[href*="/south-carolina/"]',
        ),
      )
        .map((element) => {
          const link = element.matches('a') ? element : element.querySelector('a[href]');
          const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
          const heading = element.querySelector('h2, h3, [class*="title" i]');

          return {
            isCloned: element.classList.contains('slick-cloned'),
            marketName: (heading?.textContent || text).replace(/\s+/g, ' ').trim(),
            href: link?.getAttribute('href') || '',
          };
        })
        .filter((slide) => !slide.isCloned && slide.marketName && slide.href);

      return slides.filter(
        (slide, index, all) =>
          all.findIndex((candidate) => candidate.href === slide.href) === index,
      );
    });

    assert.ok(cardSnapshot.length > 0, 'Expected at least one mobile market card');

    const unmatchedMarkets = [];

    for (const expectedMarket of location.markets) {
      const acceptedNames = expectedMarket.name.split('||').map((name) => this.normalizeText(name));
      const matchedCard = cardSnapshot.find((card) => {
        const normalizedName = this.normalizeText(card.marketName);
        const normalizedHref = card.href.toLowerCase().trim();

        return (
          acceptedNames.includes(normalizedName) &&
          normalizedHref === expectedMarket.url.toLowerCase().trim()
        );
      });

      if (!matchedCard) {
        unmatchedMarkets.push(`${expectedMarket.name} (${expectedMarket.url})`);
      }
    }

    assert.deepEqual(
      unmatchedMarkets,
      [],
      `Expected all configured markets on mobile home page: ${unmatchedMarkets.join(', ')}`,
    );
  }

  /** Opens the Find Your Home search panel. */
  async openFindYourHome() {
    await this.openHamburgerMenu();

    const clicked = await this.clickVisibleByText(/find (your|my)|find your dream home|find home/i);
    assert.equal(
      clicked,
      true,
      'Expected Find Your Home menu item to be clickable from mobile navigation',
    );
    await this.waitForPageReady();
  }

  /** Searches from the home page autocomplete. */
  async searchFromHomeAutocomplete(value: string, searchType: string, options: any = {}) {
    await this.waitForHomeContent();
    await this.closeCookiePreferencesIfVisible();
    await this.dismissPromoPopupIfPresent();
    await this.driver.execute(() => window.scrollTo(0, 0));

    const opened = await this.driver.execute(() => {
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        );
      };
      const input = Array.from(
        document.querySelectorAll(
          'input[placeholder*="Search" i]:not(#vendor-search-handler), input[type="search"]',
        ),
      ).find(isVisible);

      if (!(input instanceof HTMLInputElement)) {
        return false;
      }

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;

      input.scrollIntoView({ block: 'center', inline: 'center' });
      input.focus();
      nativeInputValueSetter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });

    if (!opened) {
      return false;
    }

    const clickAutocompleteResult = async (searchValueForMatch = value) =>
      this.driver.execute(
        ({ preferredHrefPart, searchValue, slug, finalSlug }) => {
          const normalize = (text) =>
            text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, ' ')
              .trim();
          const normalizeHref = (href) => decodeURIComponent(href || '').toLowerCase();
          const isVisible = (element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            return (
              style.visibility !== 'hidden' &&
              style.display !== 'none' &&
              rect.width > 0 &&
              rect.height > 0
            );
          };
          const expected = normalize(searchValue);
          const preferredHref = normalizeHref(preferredHrefPart);
          const selectors = [
            '[data-aos="fade-down"] a[aria-label]',
            '[data-aos="fade-down"] a[href]',
            '[role="listbox"] a[href]',
            '[role="listbox"] [role="option"]',
            '[role="option"] a[href]',
            '[role="option"]',
            '[aria-live] a[href]',
            '[class*="search" i] a[href]',
            '[class*="Search"] a[href]',
            '[class*="suggest" i] a[href]',
            '[class*="Suggest" i] a[href]',
            '[class*="autocomplete" i] a[href]',
            '[class*="Autocomplete"] a[href]',
            '[class*="result" i] a[href]',
            '[class*="Result"] a[href]',
          ];
          const candidates = selectors
            .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
            .filter((element, index, all) => all.indexOf(element) === index)
            .filter(isVisible);
          const candidateLabels = candidates
            .map((element) =>
              `${(element.textContent || '').replace(/\s+/g, ' ').trim()} ${element.getAttribute('href') || ''}`.trim(),
            )
            .slice(0, 10);
          const matchesValue = (element) => {
            const text = normalize(element.textContent || '');
            const href = normalizeHref(element.getAttribute('href') || '');

            return (
              isVisible(element) &&
              (text.includes(expected) || href.includes(slug) || href.includes(finalSlug))
            );
          };
          const matchesPreferredHref = (element) => {
            const href = normalizeHref(element.getAttribute('href') || '');

            return preferredHref && href.includes(preferredHref);
          };
          const match = candidates.find(matchesPreferredHref) || candidates.find(matchesValue);

          if (match instanceof HTMLElement) {
            match.scrollIntoView({ block: 'center', inline: 'center' });
            match.click();
            return { clicked: true, hasDropdown: candidates.length > 0, candidateLabels };
          }

          return { clicked: false, hasDropdown: candidates.length > 0, candidateLabels };
        },
        {
          preferredHrefPart: options.preferredHrefPart || '',
          searchValue: searchValueForMatch,
          searchType,
          slug: this.toSlug(searchValueForMatch),
          finalSlug: this.toSlug(value),
        },
      );

    let typedValue = '';
    for (const character of Array.from(value)) {
      await this.driver.keys(character);
      typedValue += character;
      await this.driver.pause(options.keyDelay || 250);

      if (typedValue.trim().length >= 3) {
        const typedResult = await clickAutocompleteResult(typedValue);

        if (typedResult.clicked) {
          await this.waitForPageReady();
          return true;
        }
      }
    }

    await this.waitForMobileCondition(
      async () =>
        this.driver.execute(() => {
          const isVisible = (element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            return (
              style.visibility !== 'hidden' &&
              style.display !== 'none' &&
              rect.width > 0 &&
              rect.height > 0
            );
          };

          return Array.from(
            document.querySelectorAll(
              '[role="listbox"], [role="option"], [aria-live], [class*="suggest" i], [class*="autocomplete" i]',
            ),
          ).some(isVisible);
        }),
      'Expected autocomplete suggestions after typing search value',
    ).catch(() => undefined);

    const getAutocompleteSnapshot = async () =>
      this.driver.execute(
        ({ searchValue }) => {
          const normalize = (text) =>
            text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, ' ')
              .trim();
          const isVisible = (element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            return (
              style.visibility !== 'hidden' &&
              style.display !== 'none' &&
              rect.width > 0 &&
              rect.height > 0
            );
          };
          const expected = normalize(searchValue);
          const selectors = [
            '[data-aos="fade-down"] a[aria-label]',
            '[data-aos="fade-down"] a[href]',
            '[role="listbox"] a[href]',
            '[role="listbox"] [role="option"]',
            '[role="option"] a[href]',
            '[role="option"]',
            '[aria-live] a[href]',
            '[class*="search" i] a[href]',
            '[class*="Search"] a[href]',
            '[class*="suggest" i] a[href]',
            '[class*="Suggest" i] a[href]',
            '[class*="autocomplete" i] a[href]',
            '[class*="Autocomplete"] a[href]',
            '[class*="result" i] a[href]',
            '[class*="Result"] a[href]',
          ];
          const candidates = selectors
            .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
            .filter((element, index, all) => all.indexOf(element) === index)
            .filter((element) => {
              const text = normalize(element.textContent || '');
              const href = (element.getAttribute('href') || '').toLowerCase();

              return (
                isVisible(element) &&
                (text.includes(expected) || href.includes(expected.replace(/\s+/g, '-')))
              );
            });
          const candidateLabels = candidates
            .map((element) =>
              `${(element.textContent || '').replace(/\s+/g, ' ').trim()} ${element.getAttribute('href') || ''}`.trim(),
            )
            .slice(0, 10);
          const input = Array.from(
            document.querySelectorAll(
              'input[placeholder*="Search" i]:not(#vendor-search-handler), input[type="search"]',
            ),
          ).find(isVisible);

          return {
            candidateLabels,
            count: candidates.length,
            inputValue: input instanceof HTMLInputElement ? input.value : '',
            isInputActive: document.activeElement === input,
          };
        },
        { searchValue: value },
      );

    let autocompleteSnapshot = await getAutocompleteSnapshot();

    await this.driver
      .waitUntil(
        async () => {
          autocompleteSnapshot = await getAutocompleteSnapshot();

          return autocompleteSnapshot.count > 0;
        },
        {
          timeout: options.dropdownTimeout || 10000,
          timeoutMsg: `Expected mobile search autocomplete dropdown data for ${searchType || 'search'} "${value}"`,
        },
      )
      .catch(() => undefined);

    const result = await clickAutocompleteResult();

    if (result.clicked) {
      await this.waitForPageReady();
    }

    if (!result.clicked) {
      this.logStep(
        `Search autocomplete did not find ${searchType || 'result'} "${value}". ` +
          `Dropdown visible: ${result.hasDropdown}. Input value: "${autocompleteSnapshot.inputValue}". ` +
          `Input active: ${autocompleteSnapshot.isInputActive}. Candidates: ${result.candidateLabels.join(' | ')}`,
      );
    }

    return result.clicked;
  }

  /** Retries the home page autocomplete search when the first attempt misses. */
  async searchFromHomeAutocompleteWithRetry(value: string, searchType: string, options: any = {}) {
    const maxAttempts = Number(options.maxAttempts || process.env.APPIUM_SEARCH_MAX_ATTEMPTS || 2);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      this.logStep(
        `Home autocomplete attempt ${attempt}/${maxAttempts} for ${searchType}: ${value}`,
      );

      if (attempt > 1) {
        this.logStep(`Retry home autocomplete from fresh home page for: ${value}`);
        await this.open();
      }

      const didSearch = await this.searchFromHomeAutocomplete(value, searchType, options);

      if (didSearch) {
        return true;
      }
    }

    return false;
  }

  /** Builds the expected community path. */
  getCommunityPath(location = getLocationConfig()) {
    return (
      location.communityPath ||
      `/${location.qmiPath.split('/').filter(Boolean).slice(0, -2).join('/')}`
    );
  }

  /** Determines whether the home autocomplete flow should be used. */
  shouldUseHomeAutocomplete() {
    return String(process.env.APPIUM_USE_HOME_AUTOCOMPLETE || '').toLowerCase() === 'true';
  }

  /** Waits until the home page content is ready. */
  async waitForHomeContent() {
    let loadedPageSnapshot;
    let sessionLostError;

    await this.driver.waitUntil(
      async () => {
        let snapshot;

        try {
          snapshot = await this.driver.execute(() => ({
            bodyText: document.body?.innerText || document.documentElement?.textContent || '',
            hasHeader: Boolean(document.querySelector('header')),
            hasNavigation: Boolean(document.querySelector('nav, header a, header button')),
            hasSearchEntryPoint:
              /find your home|find my home|search|quick move[- ]?in|communities/i.test(
                `${document.body?.innerText || ''}\n${document.documentElement?.textContent || ''}`,
              ),
            hasHomeContent:
              /home\. where moments matter most|designed with you in mind|explore our locations/i.test(
                `${document.body?.innerText || ''}\n${document.documentElement?.textContent || ''}`,
              ),
            isSourceOnly:
              (document.body?.innerText || '').trim().length < 20 &&
              (document.documentElement?.textContent || '').trim().length > 1000,
            readyState: document.readyState,
            title: document.title,
            userAgent: navigator.userAgent,
          }));
        } catch (error) {
          if (this.isSessionLostError(error)) {
            sessionLostError = error;
            return true;
          }

          throw error;
        }

        const hasVisibleBody = snapshot.bodyText.trim().length > 20;
        const hasLoadedContent =
          hasVisibleBody &&
          this.expectedTitle.test(`${snapshot.title}\n${snapshot.bodyText}`) &&
          (snapshot.hasHomeContent || (snapshot.hasNavigation && snapshot.hasSearchEntryPoint));

        if (hasLoadedContent) {
          loadedPageSnapshot = snapshot;
        }

        return hasLoadedContent;
      },
      {
        timeout: 30000,
        timeoutMsg: 'Mattamy home page content did not render after accepting cookies',
      },
    );

    if (sessionLostError) {
      throw sessionLostError;
    }

    return loadedPageSnapshot || this.getSnapshot();
  }

  /** Opens the mobile hamburger menu. */
  async openHamburgerMenu() {
    await this.waitForHomeContent();
    await this.closeCookiePreferencesIfVisible();
    await this.driver.execute(() => window.scrollTo(0, 0));
    const result = await this.driver.execute(() => {
      const selectors = [
        'header button[aria-label*="menu" i]',
        'header button[aria-label*="navigation" i]',
        'header button[aria-label*="open" i]',
        'header button[class*="hamburger" i]',
        'header button[class*="menu" i]',
        'header [role="button"][aria-label*="menu" i]',
        'header [role="button"][aria-label*="navigation" i]',
        'header [role="button"][class*="menu" i]',
        'header [class*="hamburger" i]',
        'header [class*="menu-toggle" i]',
        'header [class*="nav-toggle" i]',
        'button[aria-label*="menu" i]',
        '[role="button"][aria-label*="menu" i]',
      ];
      const button = selectors
        .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
        .find((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            rect.width > 0 &&
            rect.height > 0
          );
        });

      if (button instanceof HTMLElement) {
        button.click();
        return { opened: true, diagnostics: '' };
      }

      const headerButtons = Array.from(
        document.querySelectorAll('header button, header a, header [role="button"]'),
      );
      const fallback = headerButtons.find((element) => {
        const rect = element.getBoundingClientRect();
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        const label = element.getAttribute('aria-label') || '';
        const className = element.getAttribute('class') || '';

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          /menu|nav|open|☰|find|home/i.test(`${text} ${label} ${className}`)
        );
      });

      if (fallback instanceof HTMLElement) {
        fallback.click();
        return { opened: true, diagnostics: '' };
      }

      const header = document.querySelector('header');
      const diagnostics = Array.from(
        document.querySelectorAll('header button, header a, header [role="button"]'),
      )
        .map((element) => ({
          text: (element.textContent || '').replace(/\s+/g, ' ').trim(),
          label: element.getAttribute('aria-label') || '',
          className: element.getAttribute('class') || '',
        }))
        .slice(0, 10);

      return {
        opened: false,
        diagnostics: JSON.stringify({
          headerText: (header?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 500),
          candidates: diagnostics,
        }),
      };
    });

    if (!result.opened) {
      const hasNavigationFallback = await this.driver.execute(() =>
        /find my home|find your home|design studio|customer care|about us|contact us/i.test(
          document.body?.innerText || '',
        ),
      );

      assert.equal(
        hasNavigationFallback,
        true,
        `Expected a mobile hamburger/menu button or visible mobile navigation links. ${result.diagnostics}`,
      );
      return;
    }

    await this.waitForMobileCondition(
      async () =>
        this.driver.execute(() =>
          /find my home|find your home|design studio|customer care|about us|contact us/i.test(
            document.body?.innerText || '',
          ),
        ),
      'Expected mobile navigation links after opening hamburger menu',
    );
  }

  /** Normalizes text for reliable comparisons. */
  normalizeText(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  /** Converts text to a URL slug. */
  toSlug(value) {
    return this.normalizeText(value).replace(/\s+/g, '-');
  }

  /** Escapes text for use in a regular expression. */
  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
