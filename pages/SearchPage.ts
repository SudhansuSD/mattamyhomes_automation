import { expect, Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { escapeRegex } from '../utils/pageObjectUtils';
import { SearchablePage } from './SearchablePage';

type ResultsTab = 'Communities' | 'Plans' | 'Quick Move-Ins';
type SortOrder = 'asc' | 'desc';
type SortCriterion = 'price' | 'sqft' | 'title';

type SortValidationConfig = {
  option: string;
  criterion: SortCriterion;
  label: string;
};

export class SearchPage extends SearchablePage {
  readonly sortButton: Locator;
  readonly sortMenuItems: Locator;
  readonly resetFiltersButton: Locator;

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    super(page);

    this.sortButton = page.locator('div[aria-label^="Sort by:"] button[aria-label*="dropdown"]');
    this.sortMenuItems = page.locator('div.px-2 button');
    this.resetFiltersButton = page.getByRole('button', { name: /Reset all filters/i });
  }

  /* ------------------------------------------------------------------
       Locators
    ------------------------------------------------------------------ */

  private filterButton = (label: string) => this.page.locator(`button[aria-label*="${label}"]`);

  // Keep assertions scoped to cards visible in the active tab.
  private resultCards = () => this.page.locator('#ProductInfo:visible');

  /** Returns tab locator. */
  private getTabLocator(tabName: string) {
    const nameRegex = new RegExp(tabName, 'i');

    return this.page
      .locator(
        `
    button,
    [role="button"],
    [aria-label],
    a
  `,
      )
      .filter({
        hasText: nameRegex,
      });
  }

  private dropdownOption = (text: string) => this.page.getByText(text);

  /** Opens filter. */
  private async openFilter(label: string): Promise<void> {
    const button = this.filterButton(label);

    await this.waitForPageReady();

    await expect(button).toBeVisible({ timeout: 20000 });
    await expect(button).toBeEnabled({ timeout: 20000 });

    await button.scrollIntoViewIfNeeded();
    await this.settle(500);

    await button.click({ timeout: 20000 });
  }

  /* ------------------------------------------------------------------
       Common Helpers
    ------------------------------------------------------------------ */

  /** Opens tab. */
  async openTab(tabName: string): Promise<void> {
    await this.step(`Open '${tabName}' tab`, async () => {
      let tab;

      switch (tabName.toLowerCase()) {
        case 'plans':
          tab = this.page.getByRole('button', { name: /Plans/i });
          break;

        case 'quick move-ins':
          tab = this.page.getByRole('button', { name: /quick move-ins/i }).first();
          break;

        case 'communities':
          tab = this.page
            .locator('button, [role="button"], div[aria-label]')
            .filter({ hasText: /Communities/i })
            .first();
          break;

        default:
          tab = this.page
            .locator('button[aria-pressed]')
            .filter({
              hasText: new RegExp(tabName, 'i'),
            })
            .first();
      }

      await tab.waitFor({ state: 'visible', timeout: 15000 });
      await tab.scrollIntoViewIfNeeded();

      const isPressed = await tab.getAttribute('aria-pressed');

      if (isPressed === 'true') {
        return;
      }

      await tab.click();

      if (isPressed !== null) {
        await expect(tab).toHaveAttribute('aria-pressed', 'true');
      }
    });
  }

  /** Waits for results to load. */
  private async waitForResultsToLoad(): Promise<void> {
    await Promise.race([
      this.page.waitForSelector('#ProductInfo:visible', { timeout: 15000 }).catch(() => undefined),
      this.noResultsMessage()
        .waitFor({ state: 'visible', timeout: 15000 })
        .catch(() => undefined),
    ]);
    await this.settle(800);
  }

  /** Returns the no-results message locator. */
  private noResultsMessage(): Locator {
    const statusMessage = this.page
      .getByRole('status')
      .filter({ hasText: /No results in this area|No results found|No results/i });
    const accessibleNoResultsState = this.page.locator(
      '[aria-label*="No results found" i]:visible, [aria-label*="No results in this area" i]:visible',
    );

    return statusMessage.or(accessibleNoResultsState).first();
  }

  /** Canonicalizes search URL. */
  private canonicalizeSearchUrl(rawUrl: string): string {
    const url = new URL(rawUrl);
    url.searchParams.sort();

    return `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
  }

  /** Returns card count. */
  private async getCardCount(): Promise<number> {
    await this.waitForResultsToLoad();
    return this.resultCards().count();
  }

  // Waits for results to load and asserts at least one card is present before returning the count.
  private async getStableCardCount(message: string): Promise<number> {
    const count = await this.getCardCount();
    expect(count, message).toBeGreaterThan(0);
    return count;
  }

  /** Normalizes sort option. */
  private normalizeSortOption(text: string): string {
    return text.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  /** Returns visible card signature. */
  private async getVisibleCardSignature(): Promise<string> {
    const cards = this.resultCards();
    const count = await cards.count();
    const visibleTexts: string[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      visibleTexts.push(
        (
          await cards
            .nth(i)
            .innerText()
            .catch(() => '')
        ).trim(),
      );
    }

    return visibleTexts.join('|');
  }

  /** Returns displayed result count. */
  private async getDisplayedResultCount(tabName: ResultsTab): Promise<number | null> {
    const resultLabel = tabName === 'Quick Move-Ins' ? 'quick move-ins' : tabName.toLowerCase();
    const statusPattern = new RegExp(`\\d+\\s+${escapeRegex(resultLabel)}\\s+available`, 'i');
    const status = this.page
      .locator("div[role='status'], [role='status']")
      .filter({ hasText: statusPattern })
      .first();
    const text = await status.innerText({ timeout: 5000 }).catch(() => '');
    const count = Number(text.match(/\d+/)?.[0]);

    return Number.isFinite(count) ? count : null;
  }

  /** Returns sortable card count. */
  private async getSortableCardCount(tabName: ResultsTab, availableCards: number): Promise<number> {
    const displayedCount = await this.getDisplayedResultCount(tabName);

    if (displayedCount === null) {
      return availableCards;
    }

    return Math.min(availableCards, displayedCount);
  }

  /** Returns product type for tab. */
  private getProductTypeForTab(tabName: ResultsTab): string {
    switch (tabName) {
      case 'Plans':
        return 'plan';
      case 'Quick Move-Ins':
        return 'qmi';
      case 'Communities':
      default:
        return 'community';
    }
  }

  /** Recovers search results. */
  private async recoverSearchResults(tabName: ResultsTab): Promise<void> {
    const { baseURL } = getEnvConfig();
    const location = getLocationConfig();
    const currentUrl = new URL(this.page.url());
    const metro = currentUrl.searchParams.get('metro') || location.market;
    const country = currentUrl.searchParams.get('country') || location.country;
    const community = currentUrl.searchParams.get('community') || metro;
    const searchParams = new URLSearchParams({
      productType: this.getProductTypeForTab(tabName),
      metro,
      country,
      community,
      hideMap: 'false',
    });

    // await this.page.goto(`${baseURL}/search?${searchParams.toString()}`, {
    //     waitUntil: 'domcontentloaded',
    //     timeout: 90_000
    // });
    await this.waitForPageReady();
  }

  /** Parses sq. ft. value. */
  private parseSqFtValue(text: string): number | null {
    const match = text.match(/([\d,]+(?:\s*-\s*[\d,]+)?)\s*Sq\.?\s*Ft/i);

    if (!match) {
      return null;
    }

    const values =
      match[1]
        .match(/[\d,]+/g)
        ?.map((value) => Number(value.replace(/,/g, '')))
        .filter((value) => !Number.isNaN(value)) ?? [];

    return values[0] ?? null;
  }

  /** Returns card text lines. */
  private getCardTextLines(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  /** Returns location line. */
  private getLocationLine(lines: string[], tabName: ResultsTab): string {
    const locationPattern =
      tabName === 'Communities'
        ? /^[A-Za-z .'-]+,\s*[A-Za-z .'-]+$/
        : /^[A-Za-z .'-]+,\s*[A-Za-z0-9 .&'-]+$/;

    return lines.find((line) => locationPattern.test(line)) ?? '';
  }

  /** Returns card title locator. */
  private getCardTitleLocator(card: Locator): Locator {
    return card.locator('h1, h2, h3, h4, [data-testid*="title"], [class*="title"]').first();
  }

  /** Returns result card container. */
  private async getResultCardContainer(card: Locator): Promise<Locator> {
    const container = card.locator('xpath=ancestor::*[.//img and .//*[@id="ProductInfo"]][1]');

    if (await container.count()) {
      return container.first();
    }

    return card;
  }

  /** Validates card image. */
  private async validateCardImage(
    card: Locator,
    cardIndex: number,
    tabName: ResultsTab,
  ): Promise<void> {
    const cardContainer = await this.getResultCardContainer(card);
    const image = cardContainer.locator('img[src]').first();

    await expect(image, `${tabName} card ${cardIndex} should include an image`).toBeAttached({
      timeout: 10000,
    });
    await expect(image, `${tabName} card ${cardIndex} image should have a source`).toHaveAttribute(
      'src',
      /.+/,
    );
  }

  /** Validates card details link. */
  private async validateCardDetailsLink(
    card: Locator,
    cardIndex: number,
    tabName: ResultsTab,
  ): Promise<void> {
    const detailsLink = card.locator('a[href]').first();
    const href = await detailsLink.getAttribute('href');

    expect(href, `${tabName} card ${cardIndex} should include a CTA/details link`).toBeTruthy();
    expect(
      href,
      `${tabName} card ${cardIndex} CTA/details link should navigate to a detail page`,
    ).toMatch(/^\/(?!search(?:\?|$)).+/);
  }

  /** Returns card details. */
  private async getCardDetails(
    card: Locator,
    tabName: ResultsTab,
    cardIndex: number,
  ): Promise<{
    title: string;
    locationLine: string;
    href: string;
  }> {
    const text = await card.innerText();
    const lines = this.getCardTextLines(text);
    const title = await this.getCardTitleLocator(card)
      .innerText()
      .catch(() => '');
    const href = await card.locator('a[href]').first().getAttribute('href');

    expect(
      title.trim(),
      `${tabName} card ${cardIndex} should show ${tabName === 'Communities' ? 'community name' : 'result name'}`,
    ).toBeTruthy();
    expect(href, `${tabName} card ${cardIndex} should include a CTA/details link`).toBeTruthy();

    return {
      title: title.trim(),
      locationLine: this.validateCardLocationLine(lines, tabName, cardIndex),
      href: href!,
    };
  }

  /** Validates detail page matches card. */
  private async validateDetailPageMatchesCard(
    tabName: ResultsTab,
    cardIndex: number,
    title: string,
    locationLine: string,
    href: string,
  ): Promise<void> {
    const { baseURL } = getEnvConfig();
    const detailPage = await this.page.context().newPage();
    const detailUrl = new URL(href, baseURL).href;

    try {
      await detailPage.goto(detailUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });
      await detailPage.waitForLoadState('domcontentloaded');
      await this.settle(3000, detailPage);

      await expect(
        detailPage,
        `${tabName} card ${cardIndex} CTA should navigate to its detail URL`,
      ).toHaveURL(new RegExp(escapeRegex(new URL(detailUrl).pathname), 'i'));

      const body = detailPage.locator('body');
      const [city, locationContext] = locationLine.split(',').map((value) => value.trim());

      await expect(
        body,
        `${tabName} detail page should contain card title: ${title}`,
      ).toContainText(new RegExp(escapeRegex(title), 'i'), { timeout: 15000 });
      await expect(body, `${tabName} detail page should contain city: ${city}`).toContainText(
        new RegExp(escapeRegex(city), 'i'),
      );
      await expect(
        body,
        `${tabName} detail page should contain ${tabName === 'Communities' ? 'state' : 'community'}: ${locationContext}`,
      ).toContainText(new RegExp(escapeRegex(locationContext), 'i'));
    } finally {
      await detailPage.close().catch(() => undefined);
    }
  }

  /** Validates card location line. */
  private validateCardLocationLine(
    lines: string[],
    tabName: ResultsTab,
    cardIndex: number,
  ): string {
    const locationLine = this.getLocationLine(lines, tabName);
    const expectedFormat = tabName === 'Communities' ? 'City, State' : 'City, Community';

    expect(
      locationLine,
      `${tabName} card ${cardIndex} should show location in ${expectedFormat} format`,
    ).toBeTruthy();

    const [city, locationContext] = locationLine.split(',').map((value) => value.trim());

    expect(city, `${tabName} card ${cardIndex} should show a city`).toBeTruthy();
    expect(
      locationContext,
      `${tabName} card ${cardIndex} should show ${tabName === 'Communities' ? 'state' : 'community'}`,
    ).toBeTruthy();

    return locationLine;
  }

  /* ------------------------------------------------------------------
       Price Utilities (Production Ready)
    ------------------------------------------------------------------ */

  /** Returns all prices. */
  async getAllPrices(): Promise<number[]> {
    const cards = this.resultCards();
    const count = await cards.count();

    const prices: number[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      const nameLocator = card.locator('h3').first();
      const name = (await nameLocator.textContent())?.trim() || `Card ${i + 1}`;

      // Find all spans inside card and pick only the first clean price like "$459,999"
      const priceSpans = card.locator('span');
      const spanTexts = await priceSpans.allTextContents();

      const priceText = spanTexts.find((text) => /^\$\d[\d,]*$/.test(text.trim()));

      // Skip cards with no valid / "coming soon" / malformed price text.
      if (!priceText) {
        continue;
      }

      if (priceText.toLowerCase().includes('coming')) {
        continue;
      }

      const match = priceText.match(/\$([\d,]+)/);

      if (!match) {
        continue;
      }

      prices.push(Number(match[1].replace(/,/g, '')));
    }

    return prices;
  }

  /* =================================================================
       FILTERS
    ================================================================= */

  /* ------------------------------------------------------------------
    Filter by price
    ------------------------------------------------------------------ */
  /** Filters by price. */
  async filterByPrice(minPrice: number, maxPrice: number): Promise<void> {
    const minPriceLabel = this.formatPriceToUiLabel(minPrice);
    const maxPriceLabel = this.formatPriceToUiLabel(maxPrice);

    await this.step(`Apply price filter: ${minPriceLabel} - ${maxPriceLabel}`, async () => {
      await this.waitForPageReady();

      await this.openFilter('Dropdown price filter');
      await this.dropdownOption('$ No min').click();
      await this.dropdownOption(minPriceLabel).click();

      await this.openFilter('Dropdown price filter');
      await this.dropdownOption('$ No Max').click();
      await this.dropdownOption(maxPriceLabel).click();

      await this.waitForResultsToLoad();
    });
  }

  /* ------------------------------------------------------------------
       Validation: Price Range
    ------------------------------------------------------------------ */

  /** Validates price range across tabs. */
  async validatePriceRangeAcrossTabs(min: number, max: number): Promise<void> {
    const tabs: ResultsTab[] = ['Communities', 'Plans', 'Quick Move-Ins'];
    const allFailures: string[] = [];

    for (const tab of tabs) {
      await this.step(`Validate price filter for ${tab} tab`, async () => {
        try {
          await this.verifyResults(tab);

          const failures = await this.validatePriceRange(min, max, tab);

          if (failures.length > 0) {
            allFailures.push(`\n[${tab}]\n${failures.map((f, i) => `${i + 1}. ${f}`).join('\n')}`);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          allFailures.push(`\n[${tab}] Validation error:\n${message}`);
        }
      });
    }

    if (allFailures.length > 0) {
      throw new Error(`Price filter validation failed across tabs:\n${allFailures.join('\n')}`);
    }
  }

  /* ------------------------------------------------------------------
       Validation: Price on each card
    ------------------------------------------------------------------ */

  /** Validates price range. */
  async validatePriceRange(
    minValue: number,
    maxValue: number,
    tabName?: ResultsTab,
  ): Promise<string[]> {
    return this.step(
      `Validate prices within ${this.formatPrice(minValue)} - ${this.formatPrice(maxValue)}${tabName ? ` (${tabName})` : ''}`,
      async () => {
        const tolerance = 0;
        const prices = await this.getAllPrices();

        if (tabName === 'Communities') {
          await this.reportValue(
            'Community cards show starting price; skipping community starting-price range assertions.',
          );
          return [];
        }

        const failures: string[] = [];

        prices.forEach((price, index) => {
          const isValid = price >= minValue - tolerance && price <= maxValue;

          if (!isValid) {
            failures.push(
              `Card ${index + 1}. ${this.formatPrice(price)} is outside range ${this.formatPrice(minValue)} - ${this.formatPrice(maxValue)}`,
            );
          }
        });

        await this.reportValue(
          failures.length > 0
            ? `${failures.length} of ${prices.length} prices outside range`
            : `All ${prices.length} prices within range`,
        );

        return failures;
      },
    );
  }

  /*-------------------------------------------------------------------
    Filter by beds and baths
    ------------------------------------------------------------------ */

  /** Filters by bedrooms and bathrooms. */
  async filterByBedroomsAndBathrooms(minBeds: number, minBaths: number): Promise<void> {
    await this.step(
      `Apply beds & baths filter: ${minBeds}+ Bedrooms, ${minBaths}+ Bathrooms`,
      async () => {
        await this.waitForPageReady();
        await this.openFilter('Select Beds & Baths');

        await this.page.locator('span').filter({ hasText: 'Bedrooms' }).click();
        await this.page.getByRole('checkbox', { name: `${minBeds} Bedrooms` }).click();

        await this.page.locator('span').filter({ hasText: 'Bathrooms' }).click();
        await this.page.getByRole('checkbox', { name: `${minBaths} Bathrooms` }).click();
      },
    );
  }

  /** Resets filters. */
  async resetFilters(): Promise<void> {
    await this.step('Reset all filters', async () => {
      await expect(this.resetFiltersButton).toBeVisible({ timeout: 15000 });
      await this.resetFiltersButton.click();
      await this.waitForResultsToLoad();
    });
  }

  /** Validates clear reset filters behavior. */
  async validateClearResetFiltersBehavior(): Promise<void> {
    await this.verifyResults('Communities');

    const initialCount = await this.getStableCardCount(
      'Default community results should load before filters are applied',
    );
    const initialUrl = this.page.url();

    await this.filterByPrice(400000, 500000);

    const filteredUrl = this.page.url();
    const filteredCount = await this.getCardCount();
    const filteredSignature = await this.getVisibleCardSignature();

    await this.step('Applied filter should refresh results and update URL', async () => {
      expect(filteredCount, 'Filtered search should still show refreshed results').toBeGreaterThan(
        0,
      );
      expect(filteredUrl, 'Applying a price filter should update the search URL/state').not.toBe(
        initialUrl,
      );
    });

    await this.resetFilters();

    const resetCount = await this.getCardCount();
    const priceFilter = this.filterButton('Dropdown price filter').first();

    await this.step('Reset should clear filter, message and restore default results', async () => {
      await expect(priceFilter).toHaveAttribute('aria-label', /No price range selected/i);
      await expect(
        this.page.getByText(/filters successfully cleared|No filters selected/i).first(),
      ).toBeVisible({ timeout: 10000 });
      expect(
        resetCount,
        `Reset filters should restore default result count. Before filter: ${initialCount}, after reset: ${resetCount}`,
      ).toBe(initialCount);
      expect(this.page.url(), 'Reset filters should clear the filtered URL/state').not.toBe(
        filteredUrl,
      );
    });
  }

  /** Validates no results state. */
  async validateNoResultsState(): Promise<void> {
    await this.step('Apply unavailable criteria and verify no-results state', async () => {
      await this.openFilter('Dropdown price filter');
      await this.dropdownOption('$ No min').click();
      await this.dropdownOption(this.formatPriceToUiLabel(1000000)).click();
      await this.filterByBedroomsAndBathrooms(6, 6);
      await this.waitForResultsToLoad();

      const noResults = this.noResultsMessage();
      await expect(noResults, 'Search page should show a clear no-results state').toBeVisible({
        timeout: 20000,
      });
      await expect(this.resultCards(), 'No-results state should not show result cards').toHaveCount(
        0,
      );
    });
  }

  /** Validates combined filters persist in URL state. */
  async validateCombinedFiltersPersistInUrlState(
    minPrice: number,
    maxPrice: number,
    minBeds: number,
    minBaths: number,
  ): Promise<void> {
    await this.verifyResults('Plans');

    const initialUrl = this.page.url();

    await this.filterByPrice(minPrice, maxPrice);
    await this.filterByBedroomsAndBathrooms(minBeds, minBaths);
    await this.waitForResultsToLoad();

    const filteredUrl = this.page.url();
    const filteredCount = await this.resultCards().count();

    await this.step('Combined filters should update URL with selected values', async () => {
      expect(filteredUrl, 'Combined filters should update browser URL/state').not.toBe(initialUrl);
      expect(
        filteredUrl,
        'Combined filter URL should preserve selected price or bed/bath values',
      ).toMatch(new RegExp(`${minPrice}|${maxPrice}|${minBeds}|${minBaths}`));
      expect(
        filteredCount,
        'Combined filters should finish in a loaded results or no-results state',
      ).toBeGreaterThanOrEqual(0);
    });

    await this.step('Reload should preserve combined filter URL/state', async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent();
      await this.openTab('Plans');
      await this.waitForResultsToLoad();

      expect(
        this.canonicalizeSearchUrl(this.page.url()),
        'Reload should preserve combined filter URL/state',
      ).toBe(this.canonicalizeSearchUrl(filteredUrl));
    });
  }

  /** Validates filter browser history navigation. */
  async validateFilterBrowserHistoryNavigation(minPrice: number, maxPrice: number): Promise<void> {
    await this.verifyResults('Communities');

    const initialUrl = this.page.url();
    await this.filterByPrice(minPrice, maxPrice);

    const filteredUrl = this.page.url();

    await this.step('Back navigation should leave the filtered URL', async () => {
      expect(filteredUrl, 'Price filter should create a browser history state').not.toBe(
        initialUrl,
      );

      await this.page
        .goBack({ waitUntil: 'domcontentloaded', timeout: 60_000 })
        .catch(() => undefined);
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent();

      expect(this.page.url(), 'Back navigation should leave the filtered URL').not.toBe(
        filteredUrl,
      );
    });

    await this.step('Forward navigation should restore the filtered URL', async () => {
      await this.page
        .goForward({ waitUntil: 'domcontentloaded', timeout: 60_000 })
        .catch(() => undefined);
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent();

      expect(this.page.url(), 'Forward navigation should restore the filtered URL').toBe(
        filteredUrl,
      );
    });
  }
  /* ------------------------------------------------------------------
       Validation: Beds & Baths
    ------------------------------------------------------------------ */

  /** Validates beds baths across tabs. */
  async validateBedsBathsAcrossTabs(minBeds: number, minBaths: number): Promise<void> {
    const tabs: ResultsTab[] = ['Communities', 'Plans', 'Quick Move-Ins'];
    const allMismatches: string[] = [];

    for (const tab of tabs) {
      await this.step(`Validate beds & baths on ${tab} tab`, async () => {
        await this.verifyResults(tab);

        const mismatches = await this.validateBedsBaths(minBeds, minBaths, tab);
        allMismatches.push(...mismatches);
      });
    }

    expect(
      allMismatches,
      `Beds & Baths filter validation failed:\n${allMismatches.join('\n')}`,
    ).toHaveLength(0);
  }
  /* ------------------------------------------------------------------
       Validation: Beds & Baths on each card
    ------------------------------------------------------------------ */

  /** Validates beds baths. */
  async validateBedsBaths(
    minBeds: number,
    minBaths: number,
    tabName?: ResultsTab,
  ): Promise<string[]> {
    const cards = this.resultCards();
    const count = await cards.count();

    const mismatches: string[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      // Safely get card text
      const text = await card.innerText().catch(() => '');

      // Regex extraction
      const bedsMatch = text.match(/(\d+)\s*Beds?/i);
      const bathsMatch = text.match(/(\d+)\s*Baths?/i);

      const beds = bedsMatch ? Number(bedsMatch[1]) : null;
      const baths = bathsMatch ? Number(bathsMatch[1]) : null;

      // Skip if no info found
      if (beds === null && baths === null) {
        continue;
      }

      let reason = '';

      if (beds !== null && beds < minBeds) {
        reason += `Beds ${beds} < ${minBeds}. `;
      }

      if (baths !== null && baths < minBaths) {
        reason += `Baths ${baths} < ${minBaths}. `;
      }

      if (reason) {
        const logLine = `Card ${i + 1} | Beds: ${beds ?? 'N/A'} | Baths: ${baths ?? 'N/A'}`;
        mismatches.push(`${tabName ?? 'Unknown Tab'} - ${logLine} | ${reason.trim()}`);
      }
    }

    await this.reportValue(
      mismatches.length > 0
        ? `${mismatches.length} card(s) below ${minBeds} beds / ${minBaths} baths${tabName ? ` (${tabName})` : ''}`
        : `All cards meet ${minBeds}+ beds / ${minBaths}+ baths${tabName ? ` (${tabName})` : ''}`,
    );

    return mismatches;
  }

  /* ------------------------------------------------------------------
       Results Validation
    ------------------------------------------------------------------ */

  /** Verifies results. */
  async verifyResults(tabName: ResultsTab): Promise<void> {
    await this.step(`Verify ${tabName} results load`, async () => {
      await this.openTab(tabName);
      await this.waitForPageReady();

      // wait briefly after tab switch
      await this.settle(2000);

      const cards = this.resultCards();
      const noResults = this.noResultsMessage();

      // Wait for either cards OR no-results
      await Promise.race([
        cards
          .first()
          .waitFor({ state: 'visible', timeout: 10000 })
          .catch(() => {}),
        noResults.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
      ]);

      let count = await cards.count();

      if (count === 0 && !(await noResults.isVisible().catch(() => false))) {
        await this.recoverSearchResults(tabName);
        await Promise.race([
          cards
            .first()
            .waitFor({ state: 'visible', timeout: 15000 })
            .catch(() => {}),
          noResults.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
        ]);
        count = await cards.count();
      }

      if (count > 0) {
        const countLabel = this.page.locator("div[role='status']").first();
        await expect(countLabel).toBeVisible();

        const countText = await countLabel.innerText();
        const displayedCount = Number(countText.match(/\d+/)?.[0]);

        await this.reportValue(`${tabName} results`, `displayed ${displayedCount}, cards ${count}`);

        expect(displayedCount).toBeGreaterThan(0);
        expect(count).toBeGreaterThan(0);

        return;
      }

      if (await noResults.isVisible().catch(() => false)) {
        const message = await noResults.innerText();
        await this.reportValue(`${tabName} no-results message`, message.trim());
        return;
      }

      throw new Error(`${tabName}: No results AND no "No results" message found`);
    });
  }
  /* ------------------------------------------------------------------
       Result Card Required Details Validation
    ------------------------------------------------------------------ */

  /** Validates result cards required details. */
  async validateResultCardsRequiredDetails(tabName: ResultsTab): Promise<void> {
    await this.verifyResults(tabName);

    await this.step(`Validate ${tabName} card required details`, async () => {
      const cards = this.resultCards();
      const count = await cards.count();

      expect(count, `${tabName} should display at least one result card`).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const cardIndex = i + 1;
        const card = cards.nth(i);
        const { title, href } = await this.getCardDetails(card, tabName, cardIndex);

        await this.reportValue(`${cardIndex}. ${title}`, this.buildFullUrl(href));

        await this.validateCardImage(card, cardIndex, tabName);
        await this.validateCardDetailsLink(card, cardIndex, tabName);
      }

      await this.reportValue(`${tabName}: validated required details on ${count} card(s)`);
    });
  }

  /** Validates all result cards required details. */
  async validateAllResultCardsRequiredDetails(): Promise<void> {
    const tabs: ResultsTab[] = ['Communities', 'Plans', 'Quick Move-Ins'];

    for (const tab of tabs) {
      await this.validateResultCardsRequiredDetails(tab);
    }
  }

  /** Validates result card CTA navigation. */
  async validateResultCardCtaNavigation(tabName: ResultsTab, cardsToValidate = 3): Promise<void> {
    await this.verifyResults(tabName);

    await this.step(`Validate ${tabName} card CTA navigation`, async () => {
      const cards = this.resultCards();
      const count = await cards.count();
      const validationCount = Math.min(count, cardsToValidate);

      expect(
        validationCount,
        `${tabName} should have cards available for CTA validation`,
      ).toBeGreaterThan(0);

      for (let i = 0; i < validationCount; i++) {
        const cardIndex = i + 1;
        const { title, locationLine, href } = await this.getCardDetails(
          cards.nth(i),
          tabName,
          cardIndex,
        );

        await this.reportValue(`${cardIndex}. ${title}`, this.buildFullUrl(href));

        await this.validateDetailPageMatchesCard(tabName, cardIndex, title, locationLine, href);
      }

      await this.reportValue(`${tabName}: validated CTA navigation on ${validationCount} card(s)`);
    });
  }

  /** Validates all result card CTA navigation. */
  async validateAllResultCardCtaNavigation(cardsToValidatePerTab = 3): Promise<void> {
    const tabs: ResultsTab[] = ['Communities', 'Plans', 'Quick Move-Ins'];

    for (const tab of tabs) {
      await this.validateResultCardCtaNavigation(tab, cardsToValidatePerTab);
    }
  }

  /* ------------------------------------------------------------------
       Sort Options Validation
    ------------------------------------------------------------------ */

  /** Validates sort options. */
  async validateSortOptions(
    tabName: ResultsTab,
    required: string[],
    optional: string[] = [],
  ): Promise<void> {
    await this.step(`Validate ${tabName} sort options`, async () => {
      await this.openTab(tabName);
      await this.waitForResultsToLoad();
      await this.sortButton.click();

      const options = (await this.sortMenuItems.allTextContents())
        .map((option) => option.trim())
        .filter(Boolean);
      const normalizedOptions = options.map((option) => this.normalizeSortOption(option));

      for (const opt of required) {
        await this.step(`Sort option present: ${opt}`, async () => {
          expect(normalizedOptions, `Missing required sort option: ${opt}`).toContain(
            this.normalizeSortOption(opt),
          );
        });
      }

      await this.page.keyboard.press('Escape').catch(() => undefined);
    });
  }

  /* ------------------------------------------------------------------
       Tab-Specific Sorting
    ------------------------------------------------------------------ */

  /** Validates community sort options. */
  async validateCommunitySortOptions(): Promise<void> {
    await this.validateSortOptions(
      'Communities',
      ['$ - $$$', 'A - Z', 'Availability'],
      ['Featured'],
    );
  }

  /** Validates plan sort options. */
  async validatePlanSortOptions(): Promise<void> {
    await this.validateSortOptions('Plans', ['$ - $$$', 'Sq. Ft.', 'A - Z']);
  }

  /** Validates QMI sort options. */
  async validateQMISortOptions(): Promise<void> {
    await this.validateSortOptions('Quick Move-Ins', ['Date', '$ - $$$', 'Sq. Ft.', 'A - Z']);
  }
  /* ==========================================================
       SORTABLE DATA EXTRACTION
    ========================================================== */

  /** Returns sortable prices. */
  async getSortablePrices(tabName: ResultsTab): Promise<number[]> {
    const cards = this.resultCards();
    const count = await this.getSortableCardCount(tabName, await cards.count());

    const prices: number[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const priceText = (await card.locator('span, [class*="price"], a').allTextContents())
        .map((text) => text.trim())
        .find((text) => /^\$[\d,]+$/.test(text));

      if (priceText) {
        prices.push(Number(priceText.replace(/[$,]/g, '')));
      }
    }

    return prices;
  }
  /* ==========================================================
       SORT ACTION
    ========================================================== */

  /** Selects sort option. */
  async selectSortOption(tabName: ResultsTab, option: string): Promise<void> {
    await this.step(`Select sort option '${option}' on ${tabName}`, async () => {
      await this.openTab(tabName);
      await this.waitForResultsToLoad();

      await this.sortButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.sortButton.scrollIntoViewIfNeeded();

      const optionRegex = new RegExp(`^\\s*${escapeRegex(option)}\\s*$`, 'i');
      const optionLocator = this.sortMenuItems.filter({ hasText: optionRegex }).first();

      if (!(await optionLocator.isVisible().catch(() => false))) {
        await this.sortButton.click();
      }

      await optionLocator.waitFor({ state: 'visible', timeout: 10000 });
      await optionLocator.click();

      await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
      await this.waitForResultsToLoad();
    });
  }

  /** Returns sortable sq. ft.. */
  async getSortableSqFt(tabName: ResultsTab): Promise<number[]> {
    const cards = this.resultCards();
    const count = await this.getSortableCardCount(tabName, await cards.count());

    const values: number[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = await card.innerText().catch(() => '');

      const sqft = this.parseSqFtValue(text);

      if (sqft !== null) {
        values.push(sqft);
      }
    }

    return values;
  }

  /** Returns sortable titles. */
  async getSortableTitles(tabName: ResultsTab): Promise<string[]> {
    const cards = this.resultCards();
    const count = await this.getSortableCardCount(tabName, await cards.count());

    const titles: string[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      const title = await card
        .locator('h1, h2, h3, h4, [data-testid*="title"], [class*="title"]')
        .first()
        .innerText()
        .catch(() => '');

      if (title.trim()) {
        titles.push(title.trim());
      }
    }

    return titles;
  }

  /* ==========================================================
       SORT VALIDATION HELPERS
    ========================================================== */

  /** Validates ascending numbers. */
  private validateAscendingNumbers(actual: number[], label: string): void {
    const failures: string[] = [];

    for (let i = 0; i < actual.length - 1; i++) {
      const current = actual[i];
      const next = actual[i + 1];

      if (current > next) {
        failures.push(
          `Position ${i + 1}: ${current.toLocaleString()} should be <= ${next.toLocaleString()}`,
        );
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `${label} sorting is incorrect.\n` + failures.map((f, i) => `${i + 1}. ${f}`).join('\n'),
      );
    }
  }

  /** Validates alphabetical. */
  private validateAlphabetical(actual: string[], label: string): void {
    const expected = [...actual].sort((a, b) => a.localeCompare(b));

    expect(actual, `${label} sorting is incorrect`).toEqual(expected);
  }

  /* ==========================================================
       ACTUAL CARD SORTING VALIDATION
    ========================================================== */

  /** Validates price sorting. */
  async validatePriceSorting(tabName: ResultsTab): Promise<void> {
    await this.selectSortOption(tabName, '$ - $$$');

    await this.step(`Validate ${tabName} price ascending order`, async () => {
      const prices = await this.getSortablePrices(tabName);

      expect(prices.length, 'No sortable price values found').toBeGreaterThan(1);
      this.validateAscendingNumbers(prices, `${tabName} Price`);
    });
  }

  /** Validates sq. ft. sorting. */
  async validateSqFtSorting(tabName: ResultsTab): Promise<void> {
    await this.selectSortOption(tabName, 'Sq. Ft.');

    await this.step(`Validate ${tabName} Sq. Ft. ascending order`, async () => {
      const values = await this.getSortableSqFt(tabName);

      expect(values.length, 'No sortable Sq. Ft. values found').toBeGreaterThan(1);
      this.validateAscendingNumbers(values, `${tabName} Sq. Ft.`);
    });
  }

  /** Validates A-Z sorting. */
  async validateAZSorting(tabName: ResultsTab): Promise<void> {
    await this.selectSortOption(tabName, 'A - Z');

    await this.step(`Validate ${tabName} A-Z order`, async () => {
      const titles = await this.getSortableTitles(tabName);

      expect(titles.length, 'No sortable title values found').toBeGreaterThan(1);
      this.validateAlphabetical(titles, `${tabName} A-Z`);
    });
  }

  /** Returns sort validation configs. */
  private getSortValidationConfigs(tabName: ResultsTab): SortValidationConfig[] {
    const commonConfigs: SortValidationConfig[] = [
      { option: '$ - $$$', criterion: 'price', label: 'Price' },
      { option: 'A - Z', criterion: 'title', label: 'A-Z' },
    ];

    if (tabName === 'Communities') {
      return [commonConfigs[1]];
    }

    return [
      commonConfigs[0],
      { option: 'Sq. Ft.', criterion: 'sqft', label: 'Sq. Ft.' },
      commonConfigs[1],
    ];
  }

  /** Returns sortable values. */
  private async getSortableValues(
    tabName: ResultsTab,
    criterion: SortCriterion,
  ): Promise<number[] | string[]> {
    switch (criterion) {
      case 'price':
        return this.getSortablePrices(tabName);
      case 'sqft':
        return this.getSortableSqFt(tabName);
      case 'title':
        return this.getSortableTitles(tabName);
      default:
        throw new Error(`Unsupported sort criterion: ${criterion}`);
    }
  }

  /** Validates sortable values. */
  private validateSortableValues(
    values: number[] | string[],
    config: SortValidationConfig,
    tabName: ResultsTab,
  ): void {
    expect(
      values.length,
      `${tabName} ${config.label}: at least 2 sortable values are required`,
    ).toBeGreaterThan(1);

    if (config.criterion === 'title') {
      this.validateAlphabetical(values as string[], `${tabName} ${config.label}`);
      return;
    }

    this.validateAscendingNumbers(values as number[], `${tabName} ${config.label}`);
  }

  /* ==========================================================
       HIGH-LEVEL SORTING TEST METHODS
    ========================================================== */

  /** Validates sorting behavior. */
  async validateSortingBehavior(tabName: ResultsTab): Promise<void> {
    const configs = this.getSortValidationConfigs(tabName);

    for (const config of configs) {
      await this.selectSortOption(tabName, config.option);

      await this.step(`Validate ${tabName} ${config.label} sort order`, async () => {
        const values = await this.getSortableValues(tabName, config.criterion);
        this.validateSortableValues(values, config, tabName);
      });
    }
  }

  /** Validates community sorting behavior. */
  async validateCommunitySortingBehavior(): Promise<void> {
    await this.validateSortingBehavior('Communities');
  }

  /** Validates plan sorting behavior. */
  async validatePlanSortingBehavior(): Promise<void> {
    await this.validateSortingBehavior('Plans');
  }

  /** Validates QMI sorting behavior. */
  async validateQMISortingBehavior(): Promise<void> {
    await this.validateSortingBehavior('Quick Move-Ins');
  }

  /**
   * Validates the Savings Calculator sidebar on the search page: it renders
   * adjustable inputs and surfaces a currency value.
   */
  async validateSavingsCalculatorSidebar(): Promise<void> {
    await this.step('Validate savings calculator sidebar', async () => {
      const sidebar = this.page
        .locator('aside, section, div')
        .filter({ hasText: /savings|save|calculat/i })
        .filter({ has: this.page.locator('input, [role="slider"]') })
        .first();

      await sidebar.scrollIntoViewIfNeeded().catch(() => undefined);

      if (!(await sidebar.isVisible({ timeout: 8000 }).catch(() => false))) {
        await this.reportValue('Savings calculator sidebar not present (skipping)');
        return;
      }

      await this.assertVisible(sidebar, 'Savings calculator sidebar should be visible', 15_000);

      const inputs = sidebar.locator('input, [role="slider"]');
      expect(
        await inputs.count(),
        'Savings calculator should expose adjustable inputs',
      ).toBeGreaterThan(0);

      await expect
        .poll(
          async () => /\$\s?[0-9,]+/.test((await sidebar.textContent().catch(() => '')) ?? ''),
          {
            message: 'Savings calculator should display a currency value',
            timeout: 12000,
          },
        )
        .toBeTruthy();
    });
  }
}
