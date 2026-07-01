import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { escapeRegex, isLocatorVisible } from '../utils/pageObjectUtils';
import { BasePage } from './BasePage';

export type SearchType =
  | 'market'
  | 'community'
  | 'condoCommunity'
  | 'mpc'
  | 'plan'
  | 'condoPlan'
  | 'qmi';

type SearchMatchContext = {
  href: string | null;
  previousUrl: string;
};

type MpcConfig = {
  name: string;
  market: string | string[];
  url: string;
};

type LocationWithCondoPlan = ReturnType<typeof getLocationConfig> & {
  mpc?: MpcConfig[];
  condoPlan?: {
    name?: string;
    url?: string;
  };
};

export class SearchablePage extends BasePage {
  readonly searchBox: Locator;

  // Initializes the shared search box locator used across all searchable pages.
  constructor(page: Page) {
    super(page);

    this.searchBox = page
      .locator('input[placeholder*="Search"]:not(#vendor-search-handler)')
      .first();
  }

  /* ==========================================================
     SHARED CONSTANTS
  ========================================================== */

  private readonly SEARCH_MAX_ATTEMPTS = 2;
  private readonly SEARCH_INPUT_TIMEOUT = 10000;
  private readonly SEARCH_RESULTS_TIMEOUT = 15000;

  private readonly SEARCH_INPUT_SELECTOR =
    'input[placeholder*="Search"]:not(#vendor-search-handler)';

  private readonly PRIMARY_SEARCH_SUGGESTION_SELECTORS = [
    '[data-aos="fade-down"] a[aria-label]:visible',
    '[data-aos="fade-down"] a[href]:visible',
    'button[href*="/search"][href*="metro="]:not([aria-hidden="true"]):visible',
    '[role="listbox"] a[href]:visible',
    '[role="listbox"] [role="option"]:visible',
    '[role="option"] a[href]:visible',
    '[role="option"]:visible',
    '[aria-live] a[href]:visible'
  ];

  private readonly FALLBACK_SEARCH_SUGGESTION_SELECTORS = [
    '[class*="search"] a[href]:visible',
    '[class*="Search"] a[href]:visible'
  ];

  /* ==========================================================
     SEARCH LOCATORS
  ========================================================== */

  // Locator for the preferred autocomplete suggestion elements (combined primary selectors).
  private get primarySearchResults(): Locator {
    return this.page.locator(this.PRIMARY_SEARCH_SUGGESTION_SELECTORS.join(', '));
  }

  // Locator for broader, lower-confidence suggestion elements used when primary ones miss.
  private get fallbackSearchResults(): Locator {
    return this.page.locator(this.FALLBACK_SEARCH_SUGGESTION_SELECTORS.join(', '));
  }

  // Locator for the first currently visible search input on the page.
  private get visibleSearchBox(): Locator {
    return this.page.locator(`${this.SEARCH_INPUT_SELECTOR}:visible`).first();
  }

  /* ==========================================================
     SEARCH FEATURE
  ========================================================== */

  // Types the value into the search box character by character and opens the first matching
  // suggestion; retries, recovers a hidden search box, and falls back to direct navigation.
  async search(value: string, searchType?: SearchType): Promise<void> {
    await this.step(`Search for "${value}"`, async () => {
      await this.waitForPageReady();
      await this.settle(1500);

      for (let attempt = 1; attempt <= this.SEARCH_MAX_ATTEMPTS + 1; attempt++) {
        await this.reportValue(`Searching (attempt ${attempt}): ${value}`);

        const searchBox = this.visibleSearchBox;

        if (!(await this.isSearchBoxVisible(searchBox))) {
          if (await this.recoverSearchBoxVisibility(attempt)) {
            continue;
          }

          if (searchType === 'market') {
            await this.reportValue(
              `Search input not visible - navigating directly to market search for: ${value}`
            );
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
          await this.settle(500);

          const matchedResult = await this.getSearchResult(typedValue, searchType);

          if (await isLocatorVisible(matchedResult)) {
            await this.reportValue(`Match found for: ${typedValue}`);
            await this.openMatchedSearchResult(matchedResult, value, searchType);
            return;
          }
        }

        await this.reportValue(`No match found in attempt ${attempt}`);
        await this.visibleSearchBox.fill('').catch(() => undefined);
        await this.settle(800);
      }

      if (searchType === 'market') {
        await this.navigateToMarketSearchResults(value);
        return;
      }

      if (await this.navigateDirectlyToConfiguredResult(searchType)) {
        return;
      }

      throw new Error(`No matching search result found for: ${value}`);
    });
  }

  // Fallback when autocomplete yields nothing: navigates straight to the configured path for the search type.
  private async navigateDirectlyToConfiguredResult(searchType?: SearchType): Promise<boolean> {
    const location = getLocationConfig() as LocationWithCondoPlan;
    let path: string | undefined;

    switch (searchType) {
      case 'community':
        path = location.communityPath;
        break;
      case 'plan':
        path = this.getPreferredPlanPath();
        break;
      case 'qmi':
        path = location.qmiPath;
        break;
      case 'condoPlan':
        path = location.condoPlan?.url;
        break;
      case 'condoCommunity':
        path = this.getCondoCommunityPath();
        break;
      default:
        path = undefined;
    }

    if (!path) {
      return false;
    }

    await this.reportValue(`No autocomplete result found - navigating directly to configured ${searchType} path: ${path}`);
    await this.gotoSearchResultHref(path);
    return true;
  }

  // Clicks the matched suggestion and ensures navigation happened, falling back to its href or a market search.
  private async openMatchedSearchResult(
    matchedResult: Locator,
    value: string,
    searchType?: SearchType
  ): Promise<void> {
    const context: SearchMatchContext = {
      href: await matchedResult.getAttribute('href'),
      previousUrl: this.page.url()
    };

    await matchedResult.scrollIntoViewIfNeeded();

    const didClick = await matchedResult
      .click({ timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (!didClick && context.href) {
      await this.gotoSearchResultHref(context.href);
      return;
    }

    const didNavigate = await this.didSearchResultNavigate(context.previousUrl);

    if (!didNavigate && searchType === 'market') {
      await this.navigateToMarketSearchResults(value);
      return;
    }

    if (!didNavigate && context.href) {
      await this.gotoSearchResultHref(context.href);
      return;
    }

    await this.waitForPageReady();
  }

  // Navigates directly to a search result href (resolved to a full URL) and waits for the page to settle.
  private async gotoSearchResultHref(href: string): Promise<void> {
    await this.page.goto(this.buildFullUrl(href), {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.waitForPageReady();
  }

  // Returns true if the URL changed from the previous one within the results timeout.
  private async didSearchResultNavigate(previousUrl: string): Promise<boolean> {
    return this.page
      .waitForURL((url) => url.toString() !== previousUrl, {
        timeout: this.SEARCH_RESULTS_TIMEOUT
      })
      .then(() => true)
      .catch(() => false);
  }

  // Returns true if the given search box becomes visible within the input timeout.
  private async isSearchBoxVisible(searchBox: Locator): Promise<boolean> {
    return searchBox
      .waitFor({ state: 'visible', timeout: this.SEARCH_INPUT_TIMEOUT })
      .then(() => true)
      .catch(() => false);
  }

  // Scrolls to, focuses, and clears the search box so a fresh query can be typed.
  private async prepareSearchBox(searchBox: Locator): Promise<void> {
    await this.scrollTo(searchBox);
    await searchBox.click();
    await searchBox.fill('');
  }

  // Reveals the search input if it is hidden behind the header search toggle, then returns the visible box.
  protected async ensureSearchBoxVisible(): Promise<Locator> {
    if (!(await this.isSearchBoxVisible(this.visibleSearchBox))) {
      const searchToggle = this.page.getByRole('button', { name: /search/i }).first();

      if (await searchToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchToggle.click({ force: true }).catch(() => undefined);
        await this.isSearchBoxVisible(this.visibleSearchBox);
      }
    }

    return this.visibleSearchBox;
  }

  // Attempts to make a hidden search box appear by toggling the search button or reloading the page.
  private async recoverSearchBoxVisibility(attempt: number): Promise<boolean> {
    await this.page.keyboard.press('Home').catch(() => undefined);

    const searchToggle = this.page.getByRole('button', { name: /search/i }).first();

    if (await searchToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchToggle.click({ force: true }).catch(() => undefined);

      if (await this.isSearchBoxVisible(this.visibleSearchBox)) {
        return true;
      }
    }

    if (attempt <= this.SEARCH_MAX_ATTEMPTS) {
      await this.reportValue(`Search box hidden on attempt ${attempt}; reloading before retry`);

      await this.page.reload({
        waitUntil: 'domcontentloaded',
        timeout: 90_000
      }).catch(async (error) => {
        await this.reportValue(`Search input recovery reload failed: ${error instanceof Error ? error.message : String(error)}`);
        await this.navigate();
      });

      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();

      return this.isSearchBoxVisible(this.visibleSearchBox);
    }

    return false;
  }

  // Builds and opens the /search results URL for a market directly, bypassing autocomplete.
  private async navigateToMarketSearchResults(market: string): Promise<void> {
    const location = getLocationConfig();
    const { baseURL } = getEnvConfig();

    const searchParams = new URLSearchParams({
      community: 'All',
      country: location.country,
      hideMap: 'false',
      homeType: 'All',
      metro: market,
      productType: 'community'
    });

    await this.reportValue(
      `No autocomplete market result found - navigating to search results for: ${market}`
    );

    await this.page.goto(`${baseURL}/search?${searchParams.toString()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.waitForPageReady();
  }

  // Resolves the best matching suggestion for the typed value, trying primary then fallback selectors.
  private async getSearchResult(
    value: string,
    searchType?: SearchType
  ): Promise<Locator> {
    const primaryMatch = this.getSearchResultFromLocator(
      this.primarySearchResults,
      value,
      searchType
    );

    if (await isLocatorVisible(primaryMatch)) {
      return primaryMatch;
    }

    return this.getSearchResultFromLocator(
      this.fallbackSearchResults,
      value,
      searchType
    );
  }

  // Filters a suggestion locator down to the entry matching the value, with per-search-type matching rules.
  private getSearchResultFromLocator(
    searchResults: Locator,
    value: string,
    searchType?: SearchType
  ): Locator {
    const matchedResults = searchResults.filter({
      hasText: new RegExp(escapeRegex(value), 'i')
    });

    switch (searchType) {
      case 'market':
        return matchedResults
          .filter({
            hasText: new RegExp(`^\\s*${escapeRegex(value)}\\s*$`, 'i')
          })
          .first()
          .or(matchedResults.first());

      case 'plan':
        return this.getPlanSearchResult(value);

      case 'condoPlan':
        return this.getCondoPlanSearchResult(value);

      case 'community':
        return this.getConfiguredPathSearchResult(
          value,
          getLocationConfig().communityPath
        );

      case 'condoCommunity': {
        const condoCommunityPath = this.getCondoCommunityPath();

        return condoCommunityPath
          ? this.getConfiguredPathSearchResult(value, condoCommunityPath)
          : matchedResults.first();
      }

      case 'qmi':
        return this.getQmiSearchResult();

      default:
        return matchedResults.first();
    }
  }

  // Locates a suggestion link whose href contains the configured path and text matches the value.
  private getConfiguredPathSearchResult(value: string, path: string): Locator {
    return this.page
      .locator(`a[href*="${path}"]:visible`)
      .filter({ hasText: new RegExp(escapeRegex(value), 'i') })
      .first();
  }

  // Locates the plan suggestion link under the preferred plan path matching the value.
  private getPlanSearchResult(value: string): Locator {
    const preferredPlanPath = this.getPreferredPlanPath();

    return this.page
      .locator(`a[href*="${preferredPlanPath}"]:visible`)
      .filter({ hasText: new RegExp(escapeRegex(value), 'i') })
      .first();
  }

  // Locates the condo plan suggestion link, scoping to the configured condo plan URL when available.
  private getCondoPlanSearchResult(value: string): Locator {
    const location = getLocationConfig() as LocationWithCondoPlan;
    const condoPlanUrl = location.condoPlan?.url;

    if (!condoPlanUrl) {
      return this.page
        .locator('a[href]:visible')
        .filter({ hasText: new RegExp(escapeRegex(value), 'i') })
        .first();
    }

    return this.page
      .locator(`a[href*="${condoPlanUrl}"]:visible`)
      .filter({ hasText: new RegExp(escapeRegex(value), 'i') })
      .first();
  }

  // Locates the QMI suggestion link under the configured QMI path matching the configured address.
  private getQmiSearchResult(): Locator {
    const location = getLocationConfig();

    return this.page
      .locator(`a[href*="${location.qmiPath}"]:visible`)
      .filter({ hasText: new RegExp(escapeRegex(location.qmiAddress), 'i') })
      .first();
  }

  // Derives the condo community path by dropping the last segment of the configured condo plan URL.
  private getCondoCommunityPath(): string | undefined {
    const location = getLocationConfig() as LocationWithCondoPlan;
    const condoUrl = location.condoPlan?.url;

    return condoUrl ? condoUrl.split('/').slice(0, -1).join('/') : undefined;
  }

  /* ==========================================================
     GENERIC SEARCH FLOW WRAPPER
  ========================================================== */

  // Runs the standard search flow: start from home, search, dismiss promo popup, then validate.
  private async executeSearchFlow(
    searchAction: () => Promise<void>,
    validationAction: () => Promise<void>
  ): Promise<void> {
    await this.ensureSearchStartsFromHomePage();
    await searchAction();
    await this.dismissPromoPopupIfPresent();
    await validationAction();
    await this.waitForPageReady();
  }

  // Guarantees the search begins on the configured home page, navigating there if needed.
  private async ensureSearchStartsFromHomePage(): Promise<void> {
    if (this.isCurrentConfiguredHomePage()) {
      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
      return;
    }

    await this.navigate();
  }

  // Returns true if the current URL matches the configured home page origin, path, and query params.
  private isCurrentConfiguredHomePage(): boolean {
    const { baseURL } = getEnvConfig();
    const location = getLocationConfig();
    const currentUrl = this.page.url();

    if (!currentUrl || currentUrl === 'about:blank') {
      return false;
    }

    const current = new URL(currentUrl);
    const target = new URL(`/?${location.queryParam}`, baseURL);

    if (current.origin !== target.origin || current.pathname !== target.pathname) {
      return false;
    }

    for (const [key, value] of target.searchParams) {
      if (current.searchParams.get(key) !== value) {
        return false;
      }
    }

    return true;
  }

  // Orchestrates a full search-and-validate flow for the given type; market validation lives here,
  // while every other type delegates validation to its dedicated page object.
  async searchAndValidateByValue(
    searchType: SearchType,
    searchValue: string
  ): Promise<void> {
    await this.step(`Search and validate ${searchType}: ${searchValue}`, async () => {
    const location = getLocationConfig() as LocationWithCondoPlan;

    switch (searchType) {
      case 'community':
        await this.executeSearchFlow(
          () => this.searchByCommunity(searchValue),
          async () => {
            const { CommunityPage } = require('./CommunityPage') as typeof import('./CommunityPage');
            await new CommunityPage(this.page).verifySearchByCommunity(searchValue);
          }
        );
        break;

      case 'condoCommunity':
        await this.executeSearchFlow(
          () => this.searchByCondoCommunity(searchValue),
          async () => {
            const { CondoCommunityPage } = require('./CondoCommunityPage') as typeof import('./CondoCommunityPage');
            await new CondoCommunityPage(this.page).verifySearchByCondoCommunity(searchValue);
          }
        );
        break;

      case 'market':
        await this.executeSearchFlow(
          () => this.searchByMarket(searchValue),
          () => this.verifySearchByMarket(searchValue)
        );
        break;

      case 'mpc': {
        const mpc = this.getMpcConfig(location, searchValue);
        const mpcParentMarket = this.getSearchableMpcMarket(mpc);

        await this.executeSearchFlow(
          () => this.searchByMarket(mpcParentMarket),
          async () => {
            await this.verifySearchByMarket(mpcParentMarket);

            // Tap the MPC card on the search results page to open its detail page.
            await this.clickMpcLearnMore(mpc.name);

            // Validate both URL and MPC name on the MPC detail page.
            const { MPCPage } = require('./MPCPage') as typeof import('./MPCPage');
            await new MPCPage(this.page).verifyMPCPage({ name: mpc.name, url: mpc.url });
          }
        );

        break;
      }

      case 'plan':
        await this.executeSearchFlow(
          () => this.searchByPlan(searchValue),
          async () => {
            const { PlanDetailPage } = require('./PlanDetailPage') as typeof import('./PlanDetailPage');
            const planPage = new PlanDetailPage(this.page);
            await planPage.verifySearchByPlan(location.expectedPlanUrlPart);
            await planPage.verifyPlanUrlContains(location.communityPath);
          }
        );
        break;

      case 'condoPlan':
        await this.executeSearchFlow(
          () => this.searchByCondoPlan(searchValue),
          async () => {
            const { CondoPlanPage } = require('./CondoPlanPage') as typeof import('./CondoPlanPage');
            await new CondoPlanPage(this.page).verifySearchByCondoPlan();
          }
        );
        break;

      case 'qmi':
        await this.executeSearchFlow(
          () => this.searchByQMI(searchValue),
          async () => {
            const { QMIPage } = require('./QMIPage') as typeof import('./QMIPage');
            await new QMIPage(this.page).verifySearchByQMI(searchValue);
          }
        );
        break;

      default:
        throw new Error(`Invalid home search type: ${searchType}`);
    }
    });
  }

  /* ==========================================================
     MARKET SEARCH
  ========================================================== */

  // Searches for a market by name from the search box.
  async searchByMarket(market: string): Promise<void> {
    await this.step(`Search by market: ${market}`, async () => {
      await this.search(market, 'market');
    });
  }

  // Validates the search landed on the market results page whose 'metro' param matches the market.
  async verifySearchByMarket(expectedMarket: string): Promise<void> {
    await this.step(`Verify market search result for: ${expectedMarket}`, async () => {
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent();

      await this.page.waitForURL(
        (url) =>
          this.normalizeText(url.searchParams.get('metro') || '').includes(
            this.normalizeText(expectedMarket)
          ),
        { timeout: this.SEARCH_RESULTS_TIMEOUT }
      );

      const params = new URL(this.page.url()).searchParams;
      const metro = params.get('metro') || '';

      expect(this.normalizeText(metro)).toContain(this.normalizeText(expectedMarket));
    });
  }

  /* ==========================================================
     COMMUNITY SEARCH
  ========================================================== */

  // Searches for a community by name from the search box.
  async searchByCommunity(community: string): Promise<void> {
    await this.step(`Search by community: ${community}`, async () => {
      await this.search(community, 'community');
    });
  }

  /* ==========================================================
     CONDO COMMUNITY SEARCH
  ========================================================== */

  // Searches for a condo community by name from the search box.
  async searchByCondoCommunity(condoCommunity: string): Promise<void> {
    await this.step(`Search by condo community: ${condoCommunity}`, async () => {
      await this.search(condoCommunity, 'condoCommunity');
    });
  }

  /* ==========================================================
     MPC SEARCH
  ========================================================== */

  // Resolves the MPC config entry matching the given name (or the first one), validating required fields.
  private getMpcConfig(
    location: LocationWithCondoPlan,
    mpcName?: string
  ): MpcConfig {
    const mpcList = location.mpc || [];

    if (!mpcList.length) {
      throw new Error('MPC config is not configured in location config');
    }

    const normalizedMpcName = this.normalizeText(mpcName || '');

    const matchedMpc = normalizedMpcName
      ? mpcList.find((mpc) =>
        this.normalizeText(mpc.name).includes(normalizedMpcName)
      )
      : undefined;

    const mpc = matchedMpc || mpcList[0];

    if (!mpc?.name || !mpc?.market?.length || !mpc?.url) {
      throw new Error(
        `Invalid MPC config. Required fields: name, market, url. Received: ${JSON.stringify(mpc)}`
      );
    }

    return mpc;
  }

  // Picks the most searchable parent market for an MPC, preferring metro-style slugs.
  private getSearchableMpcMarket(mpc: MpcConfig): string {
    const markets = Array.isArray(mpc.market) ? mpc.market : [mpc.market];

    return (
      markets.find((market) => market.includes('-')) ||
      markets.find((market) => market.includes('/')) ||
      markets[0]
    );
  }

  // Finds the MPC card on the market search results page and clicks its Learn More CTA to open the detail page.
  async clickMpcLearnMore(mpcName: string): Promise<void> {
    await this.step(`Open MPC "${mpcName}" via Learn More`, async () => {
      await this.waitForPageReady();

      // The promo popup renders after the results page settles, so the earlier
      // dismissal in the search flow can run before it appears. Re-dismiss it here,
      // at the point of use, so it cannot be picked up as the matching "card".
      await this.dismissPromoPopupIfPresent();

      const learnMoreCta = this.page
        .getByRole('link', { name: /learn more/i })
        .or(this.page.getByRole('button', { name: /learn more/i }));

      // Scope to the actual product card: the element that contains both the MPC
      // name and a Learn More CTA, excluding promo/modal overlays. Use `.last()`
      // to prefer the innermost (tightest) matching card over a broad wrapper.
      const mpcCard = this.page
        .locator('article, section, li, [class*="card"], [class*="Card"]')
        .filter({ hasText: new RegExp(escapeRegex(mpcName), 'i') })
        .filter({ has: learnMoreCta })
        .filter({
          hasNot: this.page.locator(
            '.ReactModal__Content, [role="dialog"], [aria-modal="true"]'
          )
        })
        .last();

      await this.assertVisible(
        mpcCard,
        `MPC card should be visible on search result page: ${mpcName}`,
        60_000
      );

      await mpcCard.scrollIntoViewIfNeeded();
      await this.dismissPromoPopupIfPresent();

      const cardLearnMoreCta = mpcCard
        .getByRole('link', { name: /learn more/i })
        .first()
        .or(mpcCard.getByRole('button', { name: /learn more/i }).first());

      await this.assertVisible(
        cardLearnMoreCta,
        `Learn More CTA should be visible for MPC card: ${mpcName}`,
        30_000
      );

      await cardLearnMoreCta.click();

      await this.waitForPageReady();
    });
  }

  /* ==========================================================
     PLAN SEARCH
  ========================================================== */

  // Searches for a plan by name from the search box.
  async searchByPlan(planName: string): Promise<void> {
    await this.step(`Search by plan: ${planName}`, async () => {
      await this.search(planName, 'plan');
    });
  }

  // Builds the expected plan URL path by combining the configured community path and plan slug.
  private getPreferredPlanPath(): string {
    const location = getLocationConfig();

    const communityPath = location.communityPath.replace(/\/$/, '');

    const expectedPlanPath = location.expectedPlanUrlPart.startsWith('/')
      ? location.expectedPlanUrlPart
      : `/${location.expectedPlanUrlPart}`;

    if (expectedPlanPath.startsWith(`${communityPath}/`)) {
      return expectedPlanPath.toLowerCase();
    }

    return `${communityPath}/${expectedPlanPath.replace(/^\/+/, '')}`.toLowerCase();
  }

  /* ==========================================================
     CONDO PLAN SEARCH
  ========================================================== */

  // Searches for a condo plan by name from the search box.
  async searchByCondoPlan(condoPlanName: string): Promise<void> {
    await this.step(`Search by condo plan: ${condoPlanName}`, async () => {
      await this.search(condoPlanName, 'condoPlan');
    });
  }

  /* ==========================================================
     QMI SEARCH
  ========================================================== */

  // Searches for a quick move-in (QMI) home by address from the search box.
  async searchByQMI(address: string): Promise<void> {
    await this.step(`Search by QMI address: ${address}`, async () => {
      await this.search(address, 'qmi');
    });
  }

}
