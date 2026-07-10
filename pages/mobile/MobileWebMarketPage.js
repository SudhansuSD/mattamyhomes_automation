const assert = require('node:assert/strict');
const { MobileWebHomePage } = require('./MobileWebHomePage');
const { getEnvConfig } = require('../../config/environments/envConfig');
const { getLocationConfig } = require('../../config/locations/locationConfig');
const { getMobilePlatformLabel } = require('../../utils/mobilePlatform');
const testData = require('../../data/test_data.json');
const {
  assertLeadFormSubmissionSuccess,
  getLeadFormErrorSnapshot,
  installVisibleLeadFormFinder,
  submitVisibleLeadFormByIndex,
} = require('../../utils/mobileLeadFormHelper');

const MARKET_FORM_GLOBAL = '__getVisibleMarketLeadForms';
const LEAD_DATA = testData.leadForm;
const MOBILE_LEAD_DATA = LEAD_DATA.mobile;

class MobileWebMarketPage extends MobileWebHomePage {
  /** Initializes this page object and its locators. */
  constructor(driver = browser) {
    super(driver);
    this.marketPageReady = false;
  }

  /** Returns the configured market (matched by alias, falling back to the first market). */
  getConfiguredMarket() {
    const location = getLocationConfig();
    const configured = location.markets.find((market) =>
      market.name
        .split('||')
        .map((name) => name.trim())
        .includes(location.market)
    );

    return configured || location.markets[0];
  }

  /** Builds a heading matcher from a configured market's aliases (handles "-"/"and" variants). */
  getMarketNamePattern(marketName) {
    const aliases = marketName
      .split('||')
      .map((name) => name.trim())
      .filter(Boolean);
    const escapedAliases = aliases.flatMap((name) => {
      const escapedName = this.escapeRegExp(name);
      const andVariant = escapedName.replace(/-/g, '\\s+(?:-|and)\\s+');

      return [escapedName, andVariant];
    });

    return new RegExp(`(?:${escapedAliases.join('|')})`, 'i');
  }

  /** Normalizes a URL/path to a lowercase pathname without a trailing slash. */
  toMarketPath(value) {
    try {
      return new URL(value, 'https://placeholder.local').pathname.toLowerCase().replace(/\/+$/, '');
    } catch {
      return String(value || '').toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '');
    }
  }

  /**
   * True when the landed URL corresponds to the configured market path. Tolerates the site's
   * canonical redirects (e.g. /florida/sarasota-bradenton -> /florida/sarasota) by accepting either
   * path as a prefix of the other; market identity is still guarded by the strict heading assertion.
   */
  matchesMarketUrl(currentUrl, marketUrl) {
    const landed = this.toMarketPath(currentUrl);
    const configured = this.toMarketPath(marketUrl);

    if (!landed || !configured) {
      return false;
    }

    const shorter = landed.length <= configured.length ? landed : configured;

    // Require at least two path segments (e.g. /florida/sarasota) so a bare region never matches.
    if (shorter.split('/').filter(Boolean).length < 2) {
      return landed === configured;
    }

    return landed === configured || configured.startsWith(landed) || landed.startsWith(configured);
  }

  /** Opens a market page by its configured relative URL and verifies it landed. */
  async openMarket(market = this.getConfiguredMarket()) {
    const location = getLocationConfig();
    const targetPath = `${market.url}?${location.queryParam}`;

    if (this.marketPageReady) {
      const currentUrl = await this.driver.getUrl().catch(() => '');

      if (this.matchesMarketUrl(currentUrl, market.url)) {
        await this.waitForPageReady();
        return;
      }
    }

    await this.open(targetPath);
    await this.verifyMarketPage(market);
    this.marketPageReady = true;
  }

  /** Verifies the market page URL and heading match the configured market. */
  async verifyMarketPage(market = this.getConfiguredMarket()) {
    await this.waitForPageReady(60000);
    await this.closeCookiePreferencesIfVisible();

    const namePattern = this.getMarketNamePattern(market.name);

    await this.waitForBodyText(
      namePattern,
      `Expected market page to include ${market.name}`,
      45000
    );

    const snapshot = await this.getSnapshot();

    assert.ok(
      this.matchesMarketUrl(snapshot.currentUrl, market.url),
      `Expected market URL to match ${market.url}, landed on ${snapshot.currentUrl}`
    );
    assert.match(`${snapshot.title}\n${snapshot.bodyText}`, /Mattamy Homes/i);
    assert.match(`${snapshot.title}\n${snapshot.bodyText}`, namePattern);
    this.assertNoErrorPage(snapshot);
    this.logOpen('Market page', snapshot.currentUrl);
  }

  /** Validates the mobile browser context (user agent + viewport) for the market page. */
  async verifyLoaded(market = this.getConfiguredMarket()) {
    const snapshot = await this.getSnapshot();
    const viewport = await this.driver.getWindowSize();

    this.expectMobileUserAgent(snapshot.userAgent);
    assert.ok(
      this.matchesMarketUrl(snapshot.currentUrl, market.url),
      `Expected market URL to match ${market.url}, landed on ${snapshot.currentUrl}`
    );
    assert.ok(viewport.width > 0 && viewport.height > 0, 'Expected mobile browser viewport dimensions');
    this.assertNoErrorPage(snapshot);
    this.logResult(`Market page rendered on ${getMobilePlatformLabel()} ${viewport.width}x${viewport.height}`);
  }

  /** Validates the market hero content, media, autoplay safety, and search CTAs. */
  async validateHeroContent(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    await this.closeCookiePreferencesIfVisible();

    const namePattern = this.getMarketNamePattern(market.name);
    const hero = await this.driver.execute(({ source, flags }) => {
      const regex = new RegExp(source, flags);
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const heroSection =
        document.querySelector('#HeaderPlanPage') ||
        Array.from(document.querySelectorAll('header, section, main > *')).find((element) =>
          isVisible(element) && regex.test(element.textContent || '')
        );

      heroSection?.scrollIntoView({ block: 'center', inline: 'center' });

      const heading = (heroSection || document).querySelector('h1, h2');
      const video = heroSection?.querySelector('video');
      const image = heroSection?.querySelector('img, picture source, [style*="background-image"]');
      const backgroundImage = heroSection ? window.getComputedStyle(heroSection).backgroundImage : '';
      const searchLinks = document.querySelectorAll('a[href*="/search"][href*="productType="]');

      return {
        hasHero: Boolean(heroSection),
        headingText: normalize(heading?.textContent || ''),
        heroText: normalize(heroSection?.textContent || ''),
        hasMedia: Boolean(video || image || (backgroundImage && backgroundImage !== 'none')),
        hasVideo: Boolean(video),
        autoplay: Boolean(video?.autoplay || video?.hasAttribute('autoplay')),
        muted: Boolean(video?.muted || video?.defaultMuted),
        playsInline: Boolean(video?.hasAttribute('playsinline') || video?.hasAttribute('webkit-playsinline')),
        searchLinkCount: searchLinks.length,
      };
    }, { source: namePattern.source, flags: namePattern.flags });

    assert.equal(hero.hasHero, true, `Expected market hero section on mobile for ${market.name}`);
    assert.match(`${hero.headingText}\n${hero.heroText}`, namePattern, `Expected market hero heading to include ${market.name}`);
    assert.equal(hero.hasMedia, true, `Expected market hero media on mobile for ${market.name}`);
    assert.ok(hero.heroText.length > 0, 'Expected market hero to include visible copy');
    assert.ok(hero.searchLinkCount > 0, 'Expected market page to expose search CTAs');

    if (hero.hasVideo) {
      assert.equal(hero.autoplay, true, 'Market hero video should keep desktop autoplay behavior on mobile');
      assert.equal(hero.muted, true, 'Market hero autoplay video should be muted on mobile');
      assert.equal(hero.playsInline, true, 'Market hero video should include playsinline for mobile browsers');
    }
  }

  /** Validates the market community cards section lists at least one card. */
  async validateCommunityCards(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    const cards = await this.getCommunityCardsSnapshot();

    if (!cards.found) {
      this.logSkip(`Community cards section not present for ${market.name} - skipping card listing validation`);
      return;
    }

    assert.ok(cards.cards.length > 0, `Expected market page to list community cards for ${market.name}`);
    this.logResult(`Found ${cards.cards.length} community card(s) for ${market.name}`);
  }

  /** Validates each community card exposes a title, href, and image source when present. */
  async validateCommunityCardDetails(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    const cards = await this.getCommunityCardsSnapshot();

    if (!cards.found) {
      this.logSkip(`Community cards section not present for ${market.name} - skipping card detail validation`);
      return;
    }

    assert.ok(cards.cards.length > 0, `Expected at least one community card for ${market.name}`);

    const currentPathname = new URL(cards.currentUrl).pathname;
    const invalidCards = [];

    for (const [index, card] of cards.cards.entries()) {
      if (!card.title) {
        invalidCards.push(`Card ${index + 1} missing title`);
      }

      if (!card.href) {
        invalidCards.push(`Card ${index + 1} missing href`);
      }

      if (card.href && card.href === currentPathname) {
        invalidCards.push(`Card ${index + 1} links to the current page`);
      }

      // Image src can lazy-resolve after scroll, so its absence is reported but not failed here;
      // the dedicated media test (validateImageAndVideoUrlsReturn200) asserts image URLs strictly.
      if (card.hasImage && !card.imageSrc) {
        this.logResult(`Card ${index + 1} image src not yet resolved (lazy-loaded)`);
      }

      this.logResult(`${index + 1}. ${card.title || '(no title)'} | ${card.href}`);
    }

    assert.deepEqual(invalidCards, [], `Community card detail failures for ${market.name}:\n${invalidCards.join('\n')}`);
  }

  /** Validates the first community card navigates to its community page (mobile script-driven click). */
  async validateFirstCommunityCardNavigation(market = this.getConfiguredMarket()) {
    await this.openMarket(market);

    const result = await this.driver.execute(() => {
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const section =
        document.querySelector('#CommunityCards') ||
        Array.from(document.querySelectorAll('section, div')).find((element) =>
          isVisible(element) &&
          /explore (our )?communities/i.test(element.textContent || '') &&
          element.querySelector('li a[href]')
        );

      if (!section) {
        return { clicked: false, reason: 'Community cards section not present' };
      }

      const link = Array.from(section.querySelectorAll('li a[href], a[href]')).find((element) => {
        const href = element.getAttribute('href') || '';

        return isVisible(element) && href && href !== window.location.pathname;
      });

      if (!(link instanceof HTMLElement)) {
        return { clicked: false, reason: 'No community card link found' };
      }

      const href = link.getAttribute('href') || '';
      link.scrollIntoView({ block: 'center', inline: 'center' });
      link.click();
      return { clicked: true, href };
    });

    if (!result.clicked) {
      this.logSkip(`${result.reason} - skipping first community card navigation for ${market.name}`);
      return;
    }

    this.logScriptClick('first market community card');
    await this.waitForPageReady();
    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(result.href), 'i'));
  }

  /** Validates the Discover Our Homes section links point at the expected search result types. */
  async validateDiscoverOurHomesSection(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    await this.driver.execute(() => window.scrollTo(0, document.body.scrollHeight));
    await this.driver.pause(1000);

    const section = await this.driver.execute(() => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const heading = Array.from(document.querySelectorAll('h2, h3')).find((element) =>
        isVisible(element) && /discover our homes/i.test(element.textContent || '')
      );
      const root = heading?.closest('section') || heading?.parentElement;

      root?.scrollIntoView({ block: 'center', inline: 'center' });

      const links = Array.from((root || document).querySelectorAll('a[href]'))
        .filter(isVisible)
        .map((link) => ({
          text: normalize(link.textContent || ''),
          href: link.getAttribute('href') || '',
        }))
        .filter((link) => link.href);

      return { found: Boolean(root), links };
    });

    if (!section.found) {
      this.logSkip(`Discover Our Homes section not present for ${market.name} - skipping validation`);
      return;
    }

    const invalidLinks = [];

    for (const [index, link] of section.links.entries()) {
      if (!link.href) {
        invalidLinks.push(`Discover link ${index + 1} missing href`);
      }

      const normalizedText = link.text.toLowerCase();
      const normalizedHref = link.href.toLowerCase();

      if (normalizedText.includes('floorplan') && !normalizedHref.includes('producttype=plan')) {
        invalidLinks.push(`Floorplan link ${index + 1} should target productType=plan: ${link.href}`);
      }

      if (normalizedText.includes('quick move-in') && !normalizedHref.includes('producttype=qmi')) {
        invalidLinks.push(`Quick move-in link ${index + 1} should target productType=qmi: ${link.href}`);
      }

      this.logResult(`Discover link ${index + 1}: ${link.text || '(no text)'} | ${link.href}`);
    }

    assert.deepEqual(invalidLinks, [], `Discover Our Homes link failures for ${market.name}:\n${invalidLinks.join('\n')}`);
  }

  /** Validates the market page links to both plan and QMI search results. */
  async validateMarketSearchLinks(market = this.getConfiguredMarket()) {
    await this.openMarket(market);

    const result = await this.driver.execute(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/search"][href*="productType="]'))
        .map((link) => link.getAttribute('href') || '')
        .filter(Boolean);

      return {
        count: links.length,
        hasPlanLink: links.some((href) => href.toLowerCase().includes('producttype=plan')),
        hasQmiLink: links.some((href) => href.toLowerCase().includes('producttype=qmi')),
        links,
      };
    });

    assert.ok(result.count > 0, `Expected market search links for ${market.name}`);
    result.links.forEach((href, index) => this.logResult(`Market search link ${index + 1}: ${href}`));
    assert.equal(result.hasPlanLink, true, 'Expected market page to link to plan search results');
    assert.equal(result.hasQmiLink, true, 'Expected market page to link to QMI search results');
  }

  /** Opens the mobile hamburger menu and asserts key navigation links are exposed. */
  async verifyHeaderNavigation(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    await this.closeCookiePreferencesIfVisible();
    await this.driver.execute(() => window.scrollTo(0, 0));

    const opened = await this.clickMobileMenuButton();

    if (opened) {
      this.logScriptClick('mobile hamburger menu');
      await this.driver.pause(1000);
    }

    const navigation = await this.driver.execute(() => {
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
        hasExpectedNavigation:
          visibleLinks.some((link) => /about|contact|care|communities|find/i.test(link)) ||
          /find (your|my)|contact us|customer care|about us/i.test(text),
      };
    });

    assert.equal(navigation.hasHeader, true, 'Expected header to render on mobile market page');
    assert.equal(navigation.hasExpectedNavigation, true, 'Expected key mobile header navigation links to be reachable');
  }

  /** Clicks the mobile hamburger/menu button when present; returns whether it was clicked. */
  async clickMobileMenuButton() {
    return this.driver.execute(() => {
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const selectors = [
        'header button[aria-label*="menu" i]',
        'header button[aria-label*="navigation" i]',
        'header button[class*="hamburger" i]',
        'header button[class*="menu" i]',
        'header [role="button"][aria-label*="menu" i]',
        'header [class*="menu-toggle" i]',
        'header [class*="nav-toggle" i]',
        'button[aria-label*="menu" i]',
      ];
      const button = selectors
        .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
        .find(isVisible);

      if (button instanceof HTMLElement) {
        button.click();
        return true;
      }

      return false;
    });
  }

  /* ==========================================================
     LEAD FORM (market "Community of Interest" form)
  ========================================================== */

  /** Validates the market lead form exposes its expected fields. */
  async validateLeadFormFields(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    const form = await this.getMarketLeadForm();

    assert.equal(form.found, true, `Expected market lead form on mobile for ${market.name}`);
    assert.match(form.text, /community of interest|community/i);
    assert.match(form.text, /first name/i);
    assert.match(form.text, /last name/i);
    assert.match(form.text, /email/i);
    assert.match(form.text, /country of residence|country/i);
    assert.match(form.text, /zip|postal/i);
    assert.equal(form.hasSubmit, true, 'Expected market lead form submit button on mobile');
  }

  /** Validates the market lead form shows required-field errors on empty submit. */
  async validateLeadFormRequiredErrors(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    await this.getMarketLeadForm();
    const submitted = await this.submitVisibleLeadFormByIndex(0);

    assert.equal(submitted, true, 'Expected market lead form to be submittable on mobile');
    await this.assertFormErrors('Expected required field validation in market lead form');
  }

  /** Validates the market lead form rejects an invalid email. */
  async validateLeadFormInvalidEmail(market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    await this.getMarketLeadForm();
    const result = await this.fillMarketLeadForm({ invalidEmail: true, submit: true });

    assert.equal(result.filled, true, 'Expected market lead form to accept invalid email test data');
    await this.assertEmailError('Expected invalid email validation in market lead form');
  }

  /** Submits the market lead form with valid data and asserts the success confirmation. */
  async submitLeadFormSuccessfully(market = this.getConfiguredMarket()) {
    const { envName } = getEnvConfig();

    assert.notEqual(envName, 'PROD', 'Market lead form submission must not run on PROD');

    await this.openMarket(market);
    await this.getMarketLeadForm();
    const result = await this.fillMarketLeadForm({ submit: true });

    assert.equal(result.filled, true, 'Expected market lead form to submit valid data on mobile');
    // Log the resolved field map + any fields still invalid after fill, so a submission failure is
    // diagnosable (missing/unmatched field) instead of a bare timeout.
    this.logResult(`Market form fields: ${JSON.stringify(result.descriptors)}`);

    if (result.invalidFields.length) {
      this.logResult(`Fields still invalid after fill: ${result.invalidFields.join(', ')}`);
    }

    await this.assertSubmissionSuccess('Expected market lead form success confirmation on mobile');
  }

  /** Scrolls the page to render the lower lead form, installs a finder, and snapshots it. */
  async getMarketLeadForm() {
    // The market lead form sits low on the page and hydrates lazily, so a cold page needs a scroll
    // before the finder can see it. Progressively scroll and retry so the form is reliably found
    // whether or not an earlier test already warmed the page.
    const scrollFractions = [1, 0.5, 0.75, 1];

    for (const fraction of scrollFractions) {
      await this.driver.execute((ratio) => {
        const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        window.scrollTo(0, Math.floor(height * ratio));
      }, fraction);
      await this.driver.pause(1000);
      await this.installLeadFormFinder();

      const snapshot = await this.getLeadFormSnapshotByIndex(0);

      if (snapshot.found) {
        await this.driver.execute(() => {
          const form = window.__getVisibleMarketLeadForms?.()[0];
          form?.scrollIntoView({ block: 'center', inline: 'center' });
        });
        await this.driver.pause(500);
        return snapshot;
      }
    }

    return this.getLeadFormSnapshotByIndex(0);
  }

  /** Installs the shared visible-lead-form finder scoped to market form containers. */
  async installLeadFormFinder() {
    await installVisibleLeadFormFinder(this.driver, {
      containerSelectors: 'form, [role="group"], section, div',
      formTextPattern: 'community of interest|first name|last name|email|zip|postal|submit',
      globalName: MARKET_FORM_GLOBAL,
    });
  }

  /** Returns a snapshot (found/text/hasSubmit) of the market lead form at the given index. */
  async getLeadFormSnapshotByIndex(formIndex = 0) {
    await this.installLeadFormFinder();

    return this.driver.execute((index) => {
      const form = window.__getVisibleMarketLeadForms?.()[index] || window.__getVisibleMarketLeadForms?.()[0];

      form?.scrollIntoView({ block: 'center', inline: 'center' });

      return {
        found: Boolean(form),
        hasSubmit: Boolean(form?.querySelector('button[type="submit"], input[type="submit"], button')),
        text: (form?.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    }, formIndex);
  }

  /** Submits the visible market lead form at the given index. */
  async submitVisibleLeadFormByIndex(formIndex = 0) {
    await this.installLeadFormFinder();
    return submitVisibleLeadFormByIndex(this.driver, MARKET_FORM_GLOBAL, formIndex);
  }

  /**
   * Fills the market lead form by resolving each field via its accessible label, mirroring the web
   * MarketPage field matchers (Community of Interest, First name, Last name, Email, Country of
   * Residence, Zip/Postal, Phone + consent). Attribute-substring matching missed this form's fields,
   * leaving required fields empty; label resolution fills them the same way the web test does.
   * Returns { filled, submitted, invalidFields, descriptors } for assertions and diagnostics.
   */
  async fillMarketLeadForm(options = {}) {
    await this.installLeadFormFinder();

    const email = options.invalidEmail
      ? LEAD_DATA.invalidEmail
      : `ssdas_market_mobile_${Date.now()}@${LEAD_DATA.emailDomain}`;
    const config = {
      firstName: options.invalidEmail ? LEAD_DATA.invalidName.firstName : MOBILE_LEAD_DATA.validName.firstName,
      lastName: options.invalidEmail ? LEAD_DATA.invalidName.lastName : MOBILE_LEAD_DATA.validName.lastName,
      email,
      phone: MOBILE_LEAD_DATA.phone,
      zip: MOBILE_LEAD_DATA.zip,
      communityPattern: MOBILE_LEAD_DATA.communityPattern,
      countryPattern: MOBILE_LEAD_DATA.countryPattern,
      submit: options.submit !== false,
    };

    return this.driver.execute((cfg) => {
      const form = window.__getVisibleMarketLeadForms?.()[0];

      if (!form) {
        return { filled: false, submitted: false, invalidFields: [], descriptors: [] };
      }

      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      // Resolve a field's accessible name the way getByRole({name}) does: aria-label, aria-labelledby,
      // <label for>, a wrapping <label>, then placeholder/name/id as fallbacks.
      const labelText = (element) => {
        let text = element.getAttribute('aria-label') || '';

        if (!text && element.getAttribute('aria-labelledby')) {
          text = element
            .getAttribute('aria-labelledby')
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent || '')
            .join(' ');
        }

        if (!text && element.id) {
          try {
            text = document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.textContent || '';
          } catch {
            text = '';
          }
        }

        if (!text) {
          text = element.closest('label')?.textContent || '';
        }

        if (!text) {
          text = element.getAttribute('placeholder') || element.getAttribute('name') || element.id || '';
        }

        return normalize(text);
      };
      const fields = Array.from(form.querySelectorAll('input, select, textarea'));
      const selects = fields.filter((field) => field.tagName.toLowerCase() === 'select');
      const findInput = (regex) =>
        fields.find((field) => field.tagName.toLowerCase() !== 'select' && regex.test(labelText(field)));
      const findSelect = (regex) => selects.find((field) => regex.test(labelText(field)));
      const setInput = (element, value) => {
        if (!element) {
          return;
        }

        const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
        const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value')?.set;

        element.focus();
        setter?.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const setSelect = (element, patternSource) => {
        if (!(element instanceof HTMLSelectElement)) {
          return;
        }

        const pattern = new RegExp(patternSource, 'i');
        const preferred = Array.from(element.options).find(
          (option) => option.value && pattern.test(option.textContent || option.value)
        );
        const fallback = Array.from(element.options).find((option) => option.value && option.index > 0);
        const chosen = preferred || fallback;

        if (chosen) {
          element.value = chosen.value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      form.scrollIntoView({ block: 'center', inline: 'center' });

      // Community of Interest / Country of Residence are the two selects; prefer label match, then
      // fall back to document order (web renders Community before Country).
      setSelect(findSelect(/community of interest|community/i) || selects[0], cfg.communityPattern);
      setInput(findInput(/first name/i), cfg.firstName);
      setInput(findInput(/last name/i), cfg.lastName);
      setInput(findInput(/email/i), cfg.email);
      setSelect(findSelect(/country of residence|country/i) || selects[1], cfg.countryPattern);
      setInput(findInput(/zip|postal/i), cfg.zip);
      setInput(findInput(/phone/i), cfg.phone);

      const consent = Array.from(form.querySelectorAll('input[type="checkbox"]')).find(
        (checkbox) => !/real estate agent/i.test(labelText(checkbox))
      );

      if (consent) {
        consent.checked = true;
        consent.dispatchEvent(new Event('input', { bubbles: true }));
        consent.dispatchEvent(new Event('change', { bubbles: true }));
      }

      let submitted = false;

      if (cfg.submit) {
        const submit =
          form.querySelector('button[type="submit"], input[type="submit"]') || form.querySelector('button');

        if (submit) {
          submit.click();
          submitted = true;
        } else if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
          submitted = true;
        }
      }

      const descriptors = fields.map((field) => ({
        tag: field.tagName.toLowerCase(),
        type: field.getAttribute('type') || '',
        label: labelText(field),
        options: field.tagName.toLowerCase() === 'select' ? field.querySelectorAll('option').length : undefined,
      }));
      const invalidFields = fields
        .filter((field) => typeof field.checkValidity === 'function' && !field.checkValidity())
        .map((field) => labelText(field));

      return { filled: true, submitted, invalidFields, descriptors };
    }, config);
  }

  /** Returns a snapshot of lead-form validation state (errors, invalid fields). */
  async getFormErrorSnapshot() {
    return getLeadFormErrorSnapshot(this.driver);
  }

  /** Asserts required/validation errors are present in the market lead form. */
  async assertFormErrors(message) {
    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(snapshot.text) || snapshot.invalidFieldCount > 0,
      message
    );
  }

  /** Asserts an email-format validation message is present in the market lead form. */
  async assertEmailError(message) {
    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${snapshot.text} ${snapshot.emailValidationMessage} ${snapshot.emailAriaInvalid}`
      ),
      message
    );
  }

  /** Asserts the market lead form submission success confirmation is shown (allows for slow emulators). */
  async assertSubmissionSuccess(message) {
    await assertLeadFormSubmissionSuccess(this.driver, message, 60000);
  }

  /* ==========================================================
     COMMUNITY CARDS SNAPSHOT
  ========================================================== */

  /** Returns a snapshot of the market community cards (title/href/image per card). */
  async getCommunityCardsSnapshot() {
    return this.driver.execute(() => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const section =
        document.querySelector('#CommunityCards') ||
        Array.from(document.querySelectorAll('section, div')).find((element) =>
          isVisible(element) &&
          /explore (our )?communities/i.test(element.textContent || '') &&
          element.querySelector('li a[href]')
        );

      if (!section) {
        return { found: false, cards: [], currentUrl: window.location.href };
      }

      section.scrollIntoView({ block: 'center', inline: 'center' });

      const cards = Array.from(section.querySelectorAll('li'))
        .filter((item) => item.querySelector('a[href]'))
        .map((item) => {
          const link = item.querySelector('a[href]');
          const image = item.querySelector('img');
          // Pick the first candidate that actually has text: an empty heading must not win over the
          // link/label that carries the real community name.
          const titleCandidates = [
            ...item.querySelectorAll('h2, h3, h4, h5, [class*="title" i]'),
            item.querySelector('a div.block'),
            link,
          ];
          let title = '';

          for (const candidate of titleCandidates) {
            const text = normalize(candidate?.textContent || '');

            if (text) {
              title = text;
              break;
            }
          }

          if (!title) {
            title = normalize(link?.getAttribute('aria-label') || image?.getAttribute('alt') || '');
          }

          return {
            title,
            href: link?.getAttribute('href') || '',
            hasImage: Boolean(image),
            imageSrc:
              image?.getAttribute('src') ||
              image?.currentSrc ||
              image?.getAttribute('data-src') ||
              image?.getAttribute('srcset') ||
              '',
          };
        });

      return { found: true, cards, currentUrl: window.location.href };
    });
  }

  /* ==========================================================
     MEDIA VALIDATION
  ========================================================== */

  /** Validates every market image/video URL returns HTTP 200. */
  async validateImageAndVideoUrlsReturn200(pageName = 'Market page', market = this.getConfiguredMarket()) {
    await this.openMarket(market);
    await this.loadLazyMedia();

    const mediaUrls = await this.collectImageAndVideoUrls();

    assert.ok(mediaUrls.length > 0, `${pageName} should expose image or video URLs`);

    const failures = [];

    for (const media of mediaUrls) {
      const status = await this.getMediaUrlStatus(media.url);
      this.logResult(`${pageName} media check | ${media.type} | ${status} | ${media.label} | ${media.url}`);

      if (status !== 200) {
        failures.push(`${media.type} returned ${status} for ${media.label}: ${media.url}`);
      }
    }

    assert.deepEqual(failures, [], `${pageName} image/video URL status failures:\n${failures.join('\n')}`);
  }

  /** Scrolls the full page to trigger lazy-loaded media, then returns to the top. */
  async loadLazyMedia() {
    await this.driver.execute(async () => {
      const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
      const viewportStep = Math.max(window.innerHeight || 800, 600);
      const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

      for (let y = 0; y <= pageHeight; y += viewportStep) {
        window.scrollTo(0, y);
        await delay(250);
      }

      window.scrollTo(0, 0);
    });

    await this.waitForPageReady();
  }

  /** Collects deduplicated image/video URLs (with labels) from the page. */
  async collectImageAndVideoUrls() {
    const rawUrls = await this.driver.execute(() => {
      const media = [];
      const cleanText = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const addUrl = (type, rawUrl, element) => {
        if (!rawUrl) {
          return;
        }

        const trimmed = rawUrl.trim();

        if (!trimmed || /^(data|blob|javascript|about):/i.test(trimmed)) {
          return;
        }

        try {
          const section = element.closest('section, article, main, header, footer, [role="region"], [aria-label]');
          const heading = section?.querySelector('h1, h2, h3, h4, h5, h6');
          const label =
            cleanText(element.getAttribute('alt')) ||
            cleanText(element.getAttribute('aria-label')) ||
            cleanText(element.getAttribute('title')) ||
            cleanText(section?.getAttribute('aria-label')) ||
            cleanText(heading?.textContent) ||
            'No alt/section label';

          media.push({
            label,
            type,
            url: new URL(trimmed, window.location.href).href,
          });
        } catch {
          // Ignore malformed media URLs.
        }
      };
      const addSrcset = (type, srcset, element) => {
        if (!srcset) {
          return;
        }

        for (const candidate of srcset.split(',')) {
          addUrl(type, candidate.trim().split(/\s+/)[0], element);
        }
      };

      document.querySelectorAll('img').forEach((image) => {
        addUrl('image', image.currentSrc || image.src || image.getAttribute('src'), image);
        addSrcset('image', image.getAttribute('srcset'), image);
      });

      document.querySelectorAll('picture source').forEach((source) => {
        addUrl('image-source', source.getAttribute('src'), source);
        addSrcset('image-source', source.getAttribute('srcset'), source);
      });

      document.querySelectorAll('video').forEach((video) => {
        addUrl('video', video.currentSrc || video.src || video.getAttribute('src'), video);
        addUrl('video-poster', video.poster || video.getAttribute('poster'), video);
      });

      document.querySelectorAll('video source').forEach((source) => {
        addUrl('video-source', source.getAttribute('src'), source);
        addSrcset('video-source', source.getAttribute('srcset'), source);
      });

      return media;
    });

    const unique = new Map();

    for (const item of rawUrls) {
      if (/\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(item.url)) {
        continue;
      }

      if (!unique.has(item.url)) {
        unique.set(item.url, item);
      }
    }

    return [...unique.values()];
  }

  /** Returns the HTTP status for a media URL (HEAD, falling back to GET). */
  async getMediaUrlStatus(url) {
    const tryRequest = async (method) => {
      try {
        const response = await fetch(url, { method });
        return response.status;
      } catch (error) {
        return `request failed: ${error.message}`;
      }
    };
    const headStatus = await tryRequest('HEAD');

    if (![403, 405, 501].includes(headStatus) && typeof headStatus === 'number') {
      return headStatus;
    }

    return tryRequest('GET');
  }
}

module.exports = { MobileWebMarketPage };
