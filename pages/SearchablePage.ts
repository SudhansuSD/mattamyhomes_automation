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
  market: string[];
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
    await this.page.waitForTimeout(1500);

    for (let attempt = 1; attempt <= this.SEARCH_MAX_ATTEMPTS + 1; attempt++) {
      console.log(`🔁 Attempt ${attempt} - 🔍 Searching for: ${value}`);

      const searchBox = this.visibleSearchBox;

      if (!(await this.isSearchBoxVisible(searchBox))) {
        if (await this.recoverSearchBoxVisibility(attempt)) {
          continue;
        }

        if (searchType === 'market') {
          console.log(
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
        await this.page.waitForTimeout(500);

        const matchedResult = await this.getSearchResult(typedValue, searchType);

        if (await isLocatorVisible(matchedResult)) {
          console.log(`✅ Match found after typing: ${typedValue}`);
          await this.openMatchedSearchResult(matchedResult, value, searchType);
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

  private async gotoSearchResultHref(href: string): Promise<void> {
    await this.page.goto(this.buildFullUrl(href), {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.waitForPageReady();
  }

  private async didSearchResultNavigate(previousUrl: string): Promise<boolean> {
    return this.page
      .waitForURL((url) => url.toString() !== previousUrl, {
        timeout: this.SEARCH_RESULTS_TIMEOUT
      })
      .then(() => true)
      .catch(() => false);
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
      console.log(
        `Search input not visible on attempt ${attempt}; reloading home page before retry`
      );

      await this.page.reload({
        waitUntil: 'domcontentloaded',
        timeout: 90_000
      });

      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();

      return this.isSearchBoxVisible(this.visibleSearchBox);
    }

    return false;
  }

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

    console.log(
      `No autocomplete market result found - navigating to search results for: ${market}`
    );

    await this.page.goto(`${baseURL}/search?${searchParams.toString()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.waitForPageReady();
  }

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

  private getConfiguredPathSearchResult(value: string, path: string): Locator {
    return this.page
      .locator(`a[href*="${path}"]:visible`)
      .filter({ hasText: new RegExp(escapeRegex(value), 'i') })
      .first();
  }

  private getPlanSearchResult(value: string): Locator {
    const preferredPlanPath = this.getPreferredPlanPath();

    return this.page
      .locator(`a[href*="${preferredPlanPath}"]:visible`)
      .filter({ hasText: new RegExp(escapeRegex(value), 'i') })
      .first();
  }

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

  private getQmiSearchResult(): Locator {
    const location = getLocationConfig();

    return this.page
      .locator(`a[href*="${location.qmiPath}"]:visible`)
      .filter({ hasText: new RegExp(escapeRegex(location.qmiAddress), 'i') })
      .first();
  }

  private getCondoCommunityPath(): string | undefined {
    const location = getLocationConfig() as LocationWithCondoPlan;
    const condoUrl = location.condoPlan?.url;

    return condoUrl ? condoUrl.split('/').slice(0, -1).join('/') : undefined;
  }

  /* ==========================================================
     GENERIC SEARCH FLOW WRAPPER
  ========================================================== */

  private async executeSearchFlow(
    searchAction: () => Promise<void>,
    validationAction: () => Promise<void>
  ): Promise<void> {
    await this.ensureSearchStartsFromHomePage();
    await searchAction();
    await validationAction();
    await this.waitForPageReady();
  }

  private async ensureSearchStartsFromHomePage(): Promise<void> {
    if (this.isCurrentConfiguredHomePage()) {
      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
      return;
    }

    await this.navigate();
  }

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

  async searchAndValidateByValue(
    searchType: SearchType,
    searchValue: string
  ): Promise<void> {
    const location = getLocationConfig() as LocationWithCondoPlan;

    switch (searchType) {
      case 'community':
        await this.executeSearchFlow(
          () => this.searchByCommunity(searchValue),
          () => this.verifySearchByCommunity(searchValue)
        );
        break;

      case 'condoCommunity':
        await this.executeSearchFlow(
          () => this.searchByCondoCommunity(searchValue),
          () => this.verifySearchByCondoCommunity(searchValue)
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

            await this.clickMpcLearnMore(mpc.name);

            // Validate both URL and MPC name on MPC detail page
            await this.verifyMpcDetailPage(mpc);
          }
        );

        break;
      }

      case 'plan':
        await this.executeSearchFlow(
          () => this.searchByPlan(searchValue),
          async () => {
            await this.verifySearchByPlan(location.expectedPlanUrlPart);
            await this.verifyPlanUrlContains(location.communityPath);
          }
        );
        break;

      case 'condoPlan':
        await this.executeSearchFlow(
          () => this.searchByCondoPlan(searchValue),
          () => this.verifySearchByCondoPlan()
        );
        break;

      case 'qmi':
        await this.executeSearchFlow(
          () => this.searchByQMI(searchValue),
          () => this.verifySearchByQMI(searchValue)
        );
        break;

      default:
        throw new Error(`Invalid home search type: ${searchType}`);
    }
  }

  /* ==========================================================
     MARKET SEARCH
  ========================================================== */

  async searchByMarket(market: string): Promise<void> {
    await this.search(market, 'market');
  }

  async verifySearchByMarket(expectedMarket: string): Promise<void> {
    await this.waitForPageReady();

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
  }

  /* ==========================================================
     COMMUNITY SEARCH
  ========================================================== */

  async searchByCommunity(community: string): Promise<void> {
    await this.search(community, 'community');
  }

  async verifySearchByCommunity(expectedCommunity: string): Promise<void> {
    await this.waitForPageReady();

    const { communityPath } = getLocationConfig();

    if (communityPath) {
      await this.assertPageUrlContains(
        communityPath,
        'Community search should navigate to the configured community URL'
      );
    }

    await this.assertHeadingVisible(
      new RegExp(escapeRegex(expectedCommunity), 'i'),
      'Community detail page heading should show searched community',
      60_000
    );
  }

  /* ==========================================================
     CONDO COMMUNITY SEARCH
  ========================================================== */

  async searchByCondoCommunity(condoCommunity: string): Promise<void> {
    await this.search(condoCommunity, 'condoCommunity');
  }

  async verifySearchByCondoCommunity(expectedCommunity: string): Promise<void> {
    await this.waitForPageReady();

    await this.assertTextContains(
      this.page.getByRole('heading', { level: 1 }).first(),
      new RegExp(escapeRegex(expectedCommunity), 'i'),
      'Condo community heading should show searched community',
      20_000
    );

    await this.assertPageUrlDoesNotMatch(
      /\?country=/i,
      'Condo community search should navigate away from home country query'
    );
  }

  /* ==========================================================
     MPC SEARCH
  ========================================================== */

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

  private getSearchableMpcMarket(mpc: MpcConfig): string {
    return (
      mpc.market.find((market) => market.includes('-')) ||
      mpc.market.find((market) => market.includes('/')) ||
      mpc.market[0]
    );
  }

  async clickMpcLearnMore(mpcName: string): Promise<void> {
    await this.waitForPageReady();

    const mpcCard = this.page
      .locator('article, section, li, [class*="card"], [class*="Card"]')
      .filter({ hasText: new RegExp(escapeRegex(mpcName), 'i') })
      .first();

    await this.assertVisible(
      mpcCard,
      `MPC card should be visible on search result page: ${mpcName}`,
      60_000
    );

    await mpcCard.scrollIntoViewIfNeeded();

    const learnMoreCta = mpcCard
      .getByRole('link', { name: /learn more/i })
      .first()
      .or(mpcCard.getByRole('button', { name: /learn more/i }).first());

    await this.assertVisible(
      learnMoreCta,
      `Learn More CTA should be visible for MPC card: ${mpcName}`,
      30_000
    );

    await learnMoreCta.click();

    await this.waitForPageReady();
  }

  async verifyMpcDetailPage(mpc: MpcConfig): Promise<void> {
    await this.waitForPageReady();

    await this.assertPageUrlContains(
      mpc.url,
      `MPC detail page URL should contain config URL: ${mpc.url}`
    );

    await this.assertHeadingContains(
      new RegExp(escapeRegex(mpc.name), 'i'),
      `MPC detail page heading should contain config MPC name: ${mpc.name}`,
      30_000
    );
  }

  /* ==========================================================
     PLAN SEARCH
  ========================================================== */

  async searchByPlan(planName: string): Promise<void> {
    await this.search(planName, 'plan');
  }

  async verifySearchByPlan(expectedSlug: string): Promise<void> {
    await this.waitForPageReady();

    await this.assertPageUrlContains(
      expectedSlug,
      `Plan search URL should contain expected slug: ${expectedSlug}`
    );

    await this.assertHeadingVisible(undefined, 'Plan detail page should expose a visible H1');
  }

  async verifyPlanUrlContains(expectedUrlPart: string): Promise<void> {
    await this.assertPageUrlContains(
      expectedUrlPart,
      `Plan detail URL should contain expected path: ${expectedUrlPart}`
    );
  }

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

  async searchByCondoPlan(condoPlanName: string): Promise<void> {
    await this.search(condoPlanName, 'condoPlan');
  }

  async verifySearchByCondoPlan(): Promise<void> {
    const location = getLocationConfig() as LocationWithCondoPlan;

    if (!location.condoPlan?.url) {
      throw new Error('Condo plan URL is not configured in location config');
    }

    await this.waitForPageReady();

    await this.assertPageUrlContains(
      location.condoPlan.url,
      `Condo plan URL should contain configured path: ${location.condoPlan.url}`
    );

    await this.assertHeadingVisible(undefined, 'Condo plan detail page should expose a visible H1');
  }

  /* ==========================================================
     QMI SEARCH
  ========================================================== */

  async searchByQMI(address: string): Promise<void> {
    await this.search(address, 'qmi');
  }

  async verifySearchByQMI(expectedAddress: string): Promise<void> {
    await this.waitForPageReady();

    await this.assertPageUrl(
      /\/\d{1,}-/,
      'QMI search should navigate to a QMI detail URL'
    );

    await this.assertHeadingContains(
      new RegExp(escapeRegex(expectedAddress), 'i'),
      `QMI detail heading should contain searched address: ${expectedAddress}`
    );
  }

}
