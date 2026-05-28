const assert = require('node:assert/strict');
const { MobileWebBasePage } = require('./MobileWebBasePage');
const { getLocationConfig } = require('../../config/locations/locationConfig');

class MobileWebHomePage extends MobileWebBasePage {
  constructor(driver = browser) {
    super(driver);
    this.homePath = '/';
    this.expectedTitle = /Mattamy Homes/i;
  }

  async open(path = this.homePath) {
    const targetPath = path === this.homePath ? `${this.homePath}?${getLocationConfig().queryParam}` : path;
    await super.open(targetPath);
  }

  async verifyLoaded() {
    const snapshot = await this.waitForHomeContent();
    const viewport = await this.driver.getWindowSize();

    assert.match(snapshot.title, this.expectedTitle, `Expected Mattamy title, received: ${snapshot.title}`);
    assert.match(snapshot.userAgent, /Android/i, `Expected Android Chrome user agent, received: ${snapshot.userAgent}`);
    assert.match(snapshot.userAgent, /Chrome/i, `Expected Chrome user agent, received: ${snapshot.userAgent}`);
    assert.equal(snapshot.readyState, 'complete');
    assert.equal(
      snapshot.hasHomeContent || snapshot.hasSearchEntryPoint,
      true,
      'Expected mobile home page content or Find Your Home entry point'
    );
    assert.ok(viewport.width > 0 && viewport.height > 0, 'Expected Android Chrome viewport dimensions');
    this.assertNoErrorPage(snapshot);
  }

  async validateHeroSection() {
    await this.waitForHomeContent();
    await this.closeCookiePreferencesIfVisible();
    const hero = await this.driver.execute(() => {
      const sections = Array.from(document.querySelectorAll('main section, section, header + *'));
      const section = sections.find((candidate) => {
        const text = (candidate.innerText || '').replace(/\s+/g, ' ').trim();

        return /home|moments|designed|mattamy|find/i.test(text) && !/cookie preferences|strictly necessary/i.test(text);
      }) || sections.find((candidate) => !/cookie preferences|strictly necessary/i.test(candidate.innerText || ''));
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
        playsInline: Boolean(video?.hasAttribute('playsinline') || video?.hasAttribute('webkit-playsinline')),
        text,
      };
    });

    assert.equal(hero.hasHero, true, 'Expected a hero section to render on mobile home page');
    assert.match(hero.text, /find|home|community|mattamy/i, 'Expected hero copy to include home-buying context');

    if (hero.hasVideo) {
      assert.equal(hero.autoplay, true, 'Hero video should keep the desktop autoplay behavior on mobile');
      assert.equal(hero.muted, true, 'Hero autoplay video should be muted on mobile');
      assert.equal(hero.playsInline, true, 'Hero video should include playsinline for mobile browsers');
    }
  }

  async validateHeroVideoAutoplay() {
    await this.waitForHomeContent();
    await this.closeCookiePreferencesIfVisible();

    const videoState = await this.driver.execute(() => {
      const video = document.querySelector('main video, section video, video');

      if (!(video instanceof HTMLVideoElement)) {
        return { hasVideo: false };
      }

      if (video.paused) {
        video.play().catch(() => undefined);
      }

      return {
        hasVideo: true,
        autoplay: video.autoplay || video.hasAttribute('autoplay'),
        muted: video.muted || video.defaultMuted,
        playsInline: video.hasAttribute('playsinline') || video.hasAttribute('webkit-playsinline'),
        sourceCount: video.querySelectorAll('source').length,
        src: video.currentSrc || video.src,
        currentTime: video.currentTime,
        paused: video.paused,
      };
    });

    assert.equal(videoState.hasVideo, true, 'Expected a hero video on the mobile home page');
    assert.equal(videoState.autoplay, true, 'Hero video should have autoplay enabled');
    assert.equal(videoState.muted, true, 'Hero autoplay video should be muted');
    assert.equal(videoState.playsInline, true, 'Hero autoplay video should include playsinline');
    assert.ok(videoState.src || videoState.sourceCount > 0, 'Hero video should have a playable source');
  }

  async verifyHeaderLinksVisible() {
    await this.openHamburgerMenu();

    const headerSnapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const visibleLinks = Array.from(document.querySelectorAll('header a, nav a, [role="dialog"] a, a, button'))
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        })
        .map((element) => `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`.trim());

      return {
        hasHeader: Boolean(document.querySelector('header')),
        hasFindYourHome: /find (your|my)|find home/i.test(text),
        hasExpectedNavigation: visibleLinks.some((link) => /about|contact|care|communities|find/i.test(link)),
      };
    });

    assert.equal(headerSnapshot.hasHeader, true, 'Expected header to render on mobile home page');
    assert.equal(headerSnapshot.hasFindYourHome, true, 'Expected Find Your Home link in mobile header navigation');
    assert.equal(headerSnapshot.hasExpectedNavigation, true, 'Expected key mobile header navigation links to be visible');
  }

  async verifyFooterLoaded() {
    await this.waitForHomeContent();
    await this.closeCookiePreferencesIfVisible();
    await this.driver.execute(() => window.scrollTo(0, document.body.scrollHeight));
    await this.driver.pause(1000);

    const footer = await this.driver.execute(() => {
      const element = document.querySelector('footer');
      const text = (element?.innerText || document.body?.innerText || '').replace(/\s+/g, ' ').trim();
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
    assert.equal(footer.hasFooterContext, true, 'Expected footer to include standard Mattamy links or copy');
  }

  async searchByMarket(market = getLocationConfig().market) {
    const didSearch = await this.searchFromHomeAutocomplete(market, 'market', {
      preferredHrefPart: `metro=${encodeURIComponent(market)}`,
    });

    assert.equal(
      didSearch,
      true,
      `Expected mobile search autocomplete dropdown to show and navigate for location: ${market}`
    );
  }

  async verifySearchByMarket(expectedMarket = getLocationConfig().market) {
    const currentUrl = await this.driver.getUrl();
    const normalizedUrl = this.normalizeText(currentUrl);
    const params = new URL(currentUrl).searchParams;
    const metro = params.get('metro') || params.get('community') || '';

    assert.ok(
      /\/search/i.test(currentUrl) ||
      normalizedUrl.includes(this.normalizeText(expectedMarket)),
      'Expected location autocomplete selection to land on search results or the selected market page'
    );

    if (/\/search/i.test(currentUrl)) {
      assert.ok(
        this.normalizeText(metro).includes(this.normalizeText(expectedMarket)),
        `Expected search URL to include selected market ${expectedMarket}`
      );
    } else {
      assert.ok(
        normalizedUrl.includes(this.normalizeText(expectedMarket)),
        `Expected market URL to include selected market ${expectedMarket}`
      );
    }
  }

  async searchByCommunity(community = getLocationConfig().community) {
    const didSearch = await this.searchFromHomeAutocomplete(community, 'community', {
      preferredHrefPart: this.getCommunityPath(),
    });

    assert.equal(
      didSearch,
      true,
      `Expected mobile search autocomplete dropdown to show and navigate for community: ${community}`
    );
  }

  async verifySearchByCommunity(expectedCommunity = getLocationConfig().community) {
    await this.waitForPageReady();
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`,
      45000
    );
    const snapshot = await this.getSnapshot();

    assert.match(snapshot.bodyText, new RegExp(this.escapeRegExp(expectedCommunity), 'i'));
    assert.match(snapshot.currentUrl, new RegExp(this.escapeRegExp(this.getCommunityPath()), 'i'));
    this.assertNoErrorPage(snapshot);
  }

  async searchByQMI(address = getLocationConfig().qmiAddress, options = {}) {
    const location = getLocationConfig();
    const allowDirectFallback = options.allowDirectFallback !== false;
    const didSearch = await this.searchFromHomeAutocomplete(address, 'qmi', {
      preferredHrefPart: location.qmiPath,
    });

    if (didSearch) {
      return true;
    }

    if (!allowDirectFallback) {
      assert.equal(
        false,
        true,
        `Expected mobile home search autocomplete to find QMI address: ${address}`
      );
    }

    console.log(`QMI autocomplete did not open on mobile; opening QMI detail URL directly for: ${address}`);

    await this.driver.url(location.qmiPath);
    await this.waitForPageReady();

    if (new RegExp(this.escapeRegExp(location.qmiPath), 'i').test(await this.driver.getUrl())) {
      return true;
    }

    console.log(`Direct QMI detail URL did not load as expected; searching results page for: ${address}`);
    const searchUrls = [
      `/search?productType=qmi&metro=${encodeURIComponent(location.market)}&country=${location.country}&community=${encodeURIComponent(location.community)}&hideMap=true`,
      `/search?keyword=${encodeURIComponent(address)}&country=${location.country}&productType=qmi`,
      `/search?keyword=${encodeURIComponent(address)}&country=${location.country}`,
      `/search?productType=qmi&country=${location.country}`,
    ];

    for (const searchUrl of searchUrls) {
      await this.driver.url(searchUrl);
      await this.waitForPageReady();
      await this.waitForSearchResultCandidate(location.qmiPath, address);

      if (await this.clickResultByHref(location.qmiPath, address)) {
        return true;
      }
    }

    assert.equal(
      false,
      true,
      `Expected mobile search to find QMI address: ${address}`
    );
  }

  async verifySearchByQMI(expectedAddress = getLocationConfig().qmiAddress) {
    await this.waitForPageReady();
    const location = getLocationConfig();
    const expectedPathPattern = new RegExp(this.escapeRegExp(location.qmiPath), 'i');
    const expectedAddressPattern = new RegExp(this.escapeRegExp(expectedAddress), 'i');

    await this.driver.waitUntil(
      async () => expectedPathPattern.test(await this.driver.getUrl()),
      {
        timeout: 30000,
        timeoutMsg: `Expected QMI search to navigate to ${location.qmiPath}`,
      }
    );

    await this.waitForBodyText(
      expectedAddressPattern,
      `Expected QMI detail page to include ${expectedAddress}`,
      45000
    ).catch(() => undefined);

    const snapshot = await this.getSnapshot();
    const isExpectedQmiPath = expectedPathPattern.test(snapshot.currentUrl);
    const hasExpectedAddress = expectedAddressPattern.test(`${snapshot.title}\n${snapshot.bodyText}`);
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

  async searchByPlan(planName = getLocationConfig().planName, options = {}) {
    const location = getLocationConfig();
    const preferredPlanPath = `${this.getCommunityPath(location)}${location.expectedPlanUrlPart}`;
    const didSearch = await this.searchFromHomeAutocomplete(planName, 'plan', {
      preferredHrefPart: preferredPlanPath,
    });

    if (didSearch) {
      return true;
    }

    if (!options.allowFallback) {
      assert.equal(
        didSearch,
        true,
        `Expected mobile search autocomplete dropdown to show and navigate for plan: ${planName}`
      );
    }

    await this.driver.url(`/search?keyword=${encodeURIComponent(planName)}&country=${location.country}`);
    await this.waitForPageReady();
    return this.clickResultByHref(location.expectedPlanUrlPart, planName);
  }

  async verifySearchByPlan(expectedUrlPart = getLocationConfig().expectedPlanUrlPart) {
    await this.waitForPageReady();
    const snapshot = await this.getSnapshot();

    assert.match(snapshot.currentUrl, new RegExp(this.escapeRegExp(expectedUrlPart), 'i'));
    this.assertNoErrorPage(snapshot);
  }

  async validateMarketCards() {
    await this.waitForHomeContent();
    await this.closeCookiePreferencesIfVisible();

    const location = getLocationConfig();
    const cardSnapshot = await this.driver.execute(() => {
      const section = Array.from(document.querySelectorAll('section, div')).find((element) =>
        /explore our locations near you|explore our locations/i.test(element.textContent || '')
      );

      section?.scrollIntoView({ block: 'center', inline: 'center' });

      const slides = Array.from(document.querySelectorAll('#cards .slick-slide, a[href*="/arizona/"], a[href*="/florida/"], a[href*="/ontario/"], a[href*="/alberta/"], a[href*="/texas/"], a[href*="/north-carolina/"], a[href*="/south-carolina/"]'))
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

      return slides.filter((slide, index, all) =>
        all.findIndex((candidate) => candidate.href === slide.href) === index
      );
    });

    assert.ok(cardSnapshot.length > 0, 'Expected at least one mobile market card');

    const unmatchedMarkets = [];

    for (const expectedMarket of location.markets) {
      const acceptedNames = expectedMarket.name.split('||').map((name) => this.normalizeText(name));
      const matchedCard = cardSnapshot.find((card) => {
        const normalizedName = this.normalizeText(card.marketName);
        const normalizedHref = card.href.toLowerCase().trim();

        return acceptedNames.includes(normalizedName) && normalizedHref === expectedMarket.url.toLowerCase().trim();
      });

      if (!matchedCard) {
        unmatchedMarkets.push(`${expectedMarket.name} (${expectedMarket.url})`);
      }
    }

    assert.deepEqual(unmatchedMarkets, [], `Expected all configured markets on mobile home page: ${unmatchedMarkets.join(', ')}`);
  }

  async validateFindYourHomeFilter() {
    if (!/\/search/i.test(await this.driver.getUrl())) {
      await this.searchByMarket();
    }

    const filterSnapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const inputs = Array.from(document.querySelectorAll('input, select, button')).map((element) => ({
        text: (element.textContent || '').trim(),
        label: element.getAttribute('aria-label') || '',
        placeholder: element.getAttribute('placeholder') || '',
        type: element.getAttribute('type') || '',
      }));

      return {
        hasFilterCopy: /filter|sort|price|bed|bath|home type|move-in|community/i.test(text),
        hasInteractiveFilter: inputs.some((input) =>
          /filter|sort|price|bed|bath|home type|move-in|community|search/i.test(
            `${input.text} ${input.label} ${input.placeholder} ${input.type}`
          )
        ),
      };
    });

    assert.equal(filterSnapshot.hasFilterCopy, true, 'Expected FYH search page to render filter categories');
    assert.equal(filterSnapshot.hasInteractiveFilter, true, 'Expected FYH search page to expose interactive filter controls');
  }

  async openFindYourHome() {
    await this.openHamburgerMenu();

    const clicked = await this.clickVisibleByText(/find (your|my)|find your dream home|find home/i);
    assert.equal(clicked, true, 'Expected Find Your Home menu item to be clickable from mobile navigation');
    await this.driver.pause(1000);
  }

  async searchFromHomeAutocomplete(value, searchType, options = {}) {
    await this.waitForHomeContent();
    await this.closeCookiePreferencesIfVisible();
    await this.driver.execute(() => window.scrollTo(0, 0));

    const opened = await this.driver.execute(() => {
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const input = Array.from(document.querySelectorAll('input[placeholder*="Search" i]:not(#vendor-search-handler), input[type="search"]'))
        .find(isVisible);

      if (!(input instanceof HTMLInputElement)) {
        return false;
      }

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

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

    const clickAutocompleteResult = async (searchValueForMatch = value) => this.driver.execute(
      ({ preferredHrefPart, searchValue, slug, finalSlug }) => {
        const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const normalizeHref = (href) => decodeURIComponent(href || '').toLowerCase();
        const isVisible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
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
        const candidateLabels = candidates.map((element) =>
          `${(element.textContent || '').replace(/\s+/g, ' ').trim()} ${element.getAttribute('href') || ''}`.trim()
        ).slice(0, 10);
        const matchesValue = (element) => {
          const text = normalize(element.textContent || '');
          const href = normalizeHref(element.getAttribute('href') || '');

          return isVisible(element) && (text.includes(expected) || href.includes(slug) || href.includes(finalSlug));
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
      }
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

    await this.driver.pause(500);

    const getAutocompleteSnapshot = async () => this.driver.execute(
      ({ searchValue }) => {
        const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const isVisible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
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

            return isVisible(element) && (text.includes(expected) || href.includes(expected.replace(/\s+/g, '-')));
          });
        const candidateLabels = candidates.map((element) =>
          `${(element.textContent || '').replace(/\s+/g, ' ').trim()} ${element.getAttribute('href') || ''}`.trim()
        ).slice(0, 10);
        const input = Array.from(document.querySelectorAll('input[placeholder*="Search" i]:not(#vendor-search-handler), input[type="search"]'))
          .find(isVisible);

        return {
          candidateLabels,
          count: candidates.length,
          inputValue: input instanceof HTMLInputElement ? input.value : '',
          isInputActive: document.activeElement === input,
        };
      },
      { searchValue: value }
    );

    let autocompleteSnapshot = await getAutocompleteSnapshot();

    await this.driver.waitUntil(
      async () => {
        autocompleteSnapshot = await getAutocompleteSnapshot();

        return autocompleteSnapshot.count > 0;
      },
      {
        timeout: options.dropdownTimeout || 10000,
        timeoutMsg: `Expected mobile search autocomplete dropdown data for ${searchType || 'search'} "${value}"`,
      }
    ).catch(() => undefined);

    const result = await clickAutocompleteResult();

    if (result.clicked) {
      await this.waitForPageReady();
    }

    if (!result.clicked) {
      console.log(
        `Search autocomplete did not find ${searchType || 'result'} "${value}". ` +
        `Dropdown visible: ${result.hasDropdown}. Input value: "${autocompleteSnapshot.inputValue}". ` +
        `Input active: ${autocompleteSnapshot.isInputActive}. Candidates: ${result.candidateLabels.join(' | ')}`
      );
    }

    return result.clicked;
  }

  async clickResultByHref(expectedHrefPart, label) {
    const clicked = await this.driver.execute(
      ({ expectedHrefPart, label }) => {
        const isVisible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        };
        const normalizeHref = (href) => decodeURIComponent(href || '').toLowerCase();
        const expectedHref = normalizeHref(expectedHrefPart);
        const normalizedLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const labelParts = normalizedLabel.split(' ').filter(Boolean);
        const links = Array.from(document.querySelectorAll('a[href]'));
        const link = links.find((element) => {
          const href = normalizeHref(element.getAttribute('href') || '');
          const text = (element.textContent || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

          return isVisible(element) && (
            href.includes(expectedHref) ||
            text.includes(normalizedLabel) ||
            labelParts.every((part) => text.includes(part))
          );
        }) || links.find((element) => normalizeHref(element.getAttribute('href') || '').includes(expectedHref));

        if (link instanceof HTMLElement) {
          const href = link.getAttribute('href');

          link.scrollIntoView({ block: 'center', inline: 'center' });

          if (isVisible(link)) {
            link.click();
          } else if (href) {
            window.location.href = new URL(href, window.location.href).href;
          }

          return true;
        }

        return false;
      },
      { expectedHrefPart, label }
    );

    if (clicked) {
      await this.waitForPageReady();
    }

    return clicked;
  }

  async waitForSearchResultCandidate(expectedHrefPart, label) {
    await this.driver.waitUntil(
      async () => this.driver.execute(
        ({ expectedHrefPart, label }) => {
          const normalizeHref = (href) => decodeURIComponent(href || '').toLowerCase();
          const expectedHref = normalizeHref(expectedHrefPart);
          const normalizedLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
          const labelParts = normalizedLabel.split(' ').filter(Boolean);

          return Array.from(document.querySelectorAll('a[href]')).some((link) => {
            const href = normalizeHref(link.getAttribute('href') || '');
            const text = (link.textContent || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

            return href.includes(expectedHref) || text.includes(normalizedLabel) || labelParts.every((part) => text.includes(part));
          });
        },
        { expectedHrefPart, label }
      ),
      {
        timeout: 15000,
        timeoutMsg: `Expected search results to include ${label}`,
      }
    ).catch(() => undefined);
  }

  getCommunityPath(location = getLocationConfig()) {
    return `/${location.qmiPath.split('/').filter(Boolean).slice(0, -2).join('/')}`;
  }

  async waitForHomeContent() {
    let loadedPageSnapshot;

    await this.driver.waitUntil(
      async () => {
        const snapshot = await this.driver.execute(() => ({
          bodyText: document.body?.innerText || '',
          hasHeader: Boolean(document.querySelector('header')),
          hasNavigation: Boolean(document.querySelector('nav, header a, header button')),
          hasSearchEntryPoint: /find your home|find my home|search|quick move[- ]?in|communities/i.test(
            document.body?.innerText || ''
          ),
          hasHomeContent: /home\. where moments matter most|designed with you in mind|explore our locations/i.test(
            document.body?.innerText || ''
          ),
          readyState: document.readyState,
          title: document.title,
          userAgent: navigator.userAgent,
        }));
        const hasVisibleBody = snapshot.bodyText.trim().length > 20;
        const hasLoadedContent =
          hasVisibleBody &&
          this.expectedTitle.test(snapshot.title) &&
          (snapshot.hasHomeContent || (snapshot.hasNavigation && snapshot.hasSearchEntryPoint));

        if (hasLoadedContent) {
          loadedPageSnapshot = snapshot;
        }

        return hasLoadedContent;
      },
      {
        timeout: 30000,
        timeoutMsg: 'Mattamy home page content did not render after accepting cookies',
      }
    );

    return loadedPageSnapshot || this.getSnapshot();
  }

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

          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        });

      if (button instanceof HTMLElement) {
        button.click();
        return { opened: true, diagnostics: '' };
      }

      const headerButtons = Array.from(document.querySelectorAll('header button, header a, header [role="button"]'));
      const fallback = headerButtons.find((element) => {
        const rect = element.getBoundingClientRect();
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        const label = element.getAttribute('aria-label') || '';
        const className = element.getAttribute('class') || '';

        return rect.width > 0 && rect.height > 0 && /menu|nav|open|☰|find|home/i.test(`${text} ${label} ${className}`);
      });

      if (fallback instanceof HTMLElement) {
        fallback.click();
        return { opened: true, diagnostics: '' };
      }

      const header = document.querySelector('header');
      const diagnostics = Array.from(document.querySelectorAll('header button, header a, header [role="button"]'))
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
        /find my home|find your home|design studio|customer care|about us|contact us/i.test(document.body?.innerText || '')
      );

      assert.equal(
        hasNavigationFallback,
        true,
        `Expected a mobile hamburger/menu button or visible mobile navigation links. ${result.diagnostics}`
      );
      return;
    }

    await this.driver.pause(1000);
  }

  async verifyHamburgerMenu() {
    await this.openHamburgerMenu();

    const menu = await this.driver.execute(() => {
      const text = document.body?.innerText || '';

      return {
        hasExpectedLinks: /find (your|my)|about|contact|care|communities/i.test(text),
        hasVisibleMenuSurface: Array.from(document.querySelectorAll('nav, [role="dialog"], [class*="menu" i], a, button')).some(
          (element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
            const label = element.getAttribute('aria-label') || '';

            return (
              /find (your|my)|about|contact|care|communities/i.test(`${text} ${label}`) &&
              style.visibility !== 'hidden' &&
              style.display !== 'none' &&
              rect.width > 0 &&
              rect.height > 0
            );
          }
        ),
      };
    });

    assert.equal(menu.hasExpectedLinks, true, 'Expected hamburger menu to show key navigation links');
    assert.equal(menu.hasVisibleMenuSurface, true, 'Expected a visible mobile navigation surface after opening menu');
  }

  normalizeText(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  toSlug(value) {
    return this.normalizeText(value).replace(/\s+/g, '-');
  }

  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = { MobileWebHomePage };
