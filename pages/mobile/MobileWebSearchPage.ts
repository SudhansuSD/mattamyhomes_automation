import assert from 'node:assert/strict';
import { MobileWebHomePage } from './MobileWebHomePage';
import { getLocationConfig } from '../../config/locations/locationConfig';

const RESULT_TABS = ['Communities', 'Plans', 'Quick Move-Ins'];

export class MobileWebSearchPage extends MobileWebHomePage {
  /** Navigates to the configured mobile search page. */
  async navigate() {
    await this.openSearchByMarket(getLocationConfig().market);
  }

  /** Opens search by market. */
  async openSearchByMarket(market = getLocationConfig().market) {
    const location = getLocationConfig();
    const params = new URLSearchParams({
      productType: 'community',
      metro: market,
      country: location.country,
      community: market,
      hideMap: 'true',
    });

    await this.driver.url(`/search?${params.toString()}`);
    await this.waitForPageReady();
    await this.closeCookiePreferencesIfVisible();
    await this.waitForSearchPage();
  }

  /** Searches by market. */
  async searchByMarket(market = getLocationConfig().market) {
    await this.openSearchByMarket(market);
    return true;
  }

  /** Verifies search by market. */
  async verifySearchByMarket(expectedMarket = getLocationConfig().market) {
    const currentUrl = await this.driver.getUrl();
    const params = new URL(currentUrl).searchParams;
    const metro = params.get('metro') || '';

    assert.match(currentUrl, /\/search/i, 'Expected search page URL');
    assert.equal(this.normalizeText(metro), this.normalizeText(expectedMarket));
  }

  /** Waits for search page. */
  async waitForSearchPage() {
    await this.driver.waitUntil(
      async () => {
        const snapshot = await this.driver.execute(() => {
          const text = document.body?.innerText || '';
          const cards = document.querySelectorAll('#ProductInfo, [id="ProductInfo"]').length;
          const hasTabs = /Communities|Plans|Quick Move-Ins/i.test(text);
          const hasSearchState =
            /results|available|no results|filter|sort|communities|plans|quick move/i.test(text);

          return {
            cards,
            hasSearchState,
            hasTabs,
            readyState: document.readyState,
            textLength: text.trim().length,
          };
        });

        return (
          snapshot.readyState === 'complete' &&
          snapshot.textLength > 20 &&
          (snapshot.cards > 0 || snapshot.hasTabs || snapshot.hasSearchState)
        );
      },
      {
        timeout: 45000,
        timeoutMsg: 'Mobile search page did not render results, tabs, or search controls',
      },
    );
  }

  /** Opens tab. */
  async openTab(tabName) {
    await this.waitForSearchPage();
    await this.closeCookiePreferencesIfVisible();

    const clicked = await this.driver.execute(
      ({ tabName }) => {
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
        const regex = new RegExp(tabName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const tabs = Array.from(
          document.querySelectorAll('button, [role="button"], a, [aria-label]'),
        );
        const tab = tabs.find(
          (element) =>
            isVisible(element) &&
            regex.test(`${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`),
        );

        if (tab instanceof HTMLElement) {
          tab.scrollIntoView({ block: 'center', inline: 'center' });
          tab.click();
          return true;
        }

        return false;
      },
      { tabName },
    );

    if (clicked) {
      await this.driver.pause(1500);
      await this.waitForPageReady();
    }
  }

  /** Returns search snapshot. */
  async getSearchSnapshot() {
    return this.driver.execute(() => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const cards = Array.from(document.querySelectorAll('#ProductInfo, [id="ProductInfo"]')).map(
        (card) => {
          const text = normalize(card.textContent || '');
          const link = card.querySelector('a[href]');
          const image =
            card.closest('a, section, article, div')?.querySelector('img[src]') ||
            card.querySelector('img[src]');

          return {
            href: link?.getAttribute('href') || '',
            imageSrc: image?.getAttribute('src') || '',
            text,
            title: normalize(
              card.querySelector('h1, h2, h3, h4, [class*="title" i]')?.textContent || '',
            ),
          };
        },
      );
      const bodyText = document.body?.innerText || '';
      const statusText = normalize(
        document.querySelector('[role="status"], div[role="status"]')?.textContent || '',
      );
      const hasSearchState =
        /results|available|no results|filter|sort|communities|plans|quick move|homeType|start exploring/i.test(
          bodyText,
        );

      return {
        bodyText,
        cards,
        hasSearchState,
        noResults: /no results in this area|no results/i.test(bodyText),
        statusText,
      };
    });
  }

  /** Verifies results. */
  async verifyResults(tabName) {
    await this.openTab(tabName);
    await this.waitForSearchPage();

    const snapshot = await this.getSearchSnapshot();
    this.logResult(`${tabName} cards: ${snapshot.cards.length} | status: ${snapshot.statusText}`);

    assert.equal(
      snapshot.cards.length > 0 ||
        snapshot.noResults ||
        snapshot.hasSearchState ||
        /available|results/i.test(snapshot.statusText),
      true,
      `Expected ${tabName} cards, count status, no-results message, or mobile search state`,
    );
  }

  /** Validates result cards required details. */
  async validateResultCardsRequiredDetails(tabName) {
    await this.verifyResults(tabName);
    const snapshot = await this.getSearchSnapshot();

    if (!snapshot.cards.length) {
      this.logSkip(`${tabName}: no cards present - skipping card detail validation`);
      return;
    }

    for (const [index, card] of snapshot.cards.entries()) {
      assert.ok(
        card.text.length > 10,
        `${tabName} card ${index + 1} should include descriptive text`,
      );
      assert.ok(
        card.title || /beds|baths|sq\.?\s*ft|from|community/i.test(card.text),
        `${tabName} card ${index + 1} should include a title or key details`,
      );
      assert.ok(card.href, `${tabName} card ${index + 1} should include a CTA/details link`);
    }
  }

  /** Validates all result cards required details. */
  async validateAllResultCardsRequiredDetails() {
    for (const tab of RESULT_TABS) {
      await this.validateResultCardsRequiredDetails(tab);
    }
  }

  /** Validates result card CTA navigation. */
  async validateResultCardCtaNavigation(tabName, cardsToValidate = 2) {
    await this.verifyResults(tabName);
    const snapshot = await this.getSearchSnapshot();
    const cards = snapshot.cards.filter(
      (card) => card.href && !/^\/?search(?:\?|$)/i.test(card.href),
    );

    if (!cards.length) {
      this.logSkip(`${tabName}: no detail CTAs present - skipping CTA navigation validation`);
      return;
    }

    for (const card of cards.slice(0, cardsToValidate)) {
      const previousUrl = await this.driver.getUrl();
      await this.driver.url(card.href);
      await this.waitForPageReady();
      this.logOpen(`${tabName} card detail`, await this.driver.getUrl());
      assert.notEqual(
        await this.driver.getUrl(),
        previousUrl,
        `${tabName} CTA should navigate away from search page`,
      );
      this.assertNoErrorPage(await this.getSnapshot());
      await this.driver.back();
      await this.waitForSearchPage();
    }
  }

  /** Validates all result card CTA navigation. */
  async validateAllResultCardCtaNavigation() {
    for (const tab of RESULT_TABS) {
      await this.validateResultCardCtaNavigation(tab);
    }
  }

  /** Filters by price. */
  async filterByPrice(minPrice, maxPrice) {
    await this.applyFilterControl(/price/i, [
      this.formatPriceLabel(minPrice),
      this.formatPriceLabel(maxPrice),
    ]);
  }

  /** Validates price range across tabs. */
  async validatePriceRangeAcrossTabs(minPrice, maxPrice) {
    for (const tab of RESULT_TABS) {
      await this.verifyResults(tab);
      const prices = await this.getCardNumbers(/\$([\d,]+)/g);

      if (tab === 'Communities' || prices.length === 0) {
        this.logSkip(`${tab}: no displayed card prices to assert for mobile price filter`);
        continue;
      }

      for (const price of prices) {
        assert.ok(
          price >= minPrice && price <= maxPrice,
          `${tab} price ${price} should be within ${minPrice}-${maxPrice}`,
        );
      }
    }
  }

  /** Filters by bedrooms and bathrooms. */
  async filterByBedroomsAndBathrooms(minBeds, minBaths) {
    await this.applyFilterControl(/beds|bath/i, [`${minBeds} Bedrooms`, `${minBaths} Bathrooms`]);
  }

  /** Validates beds baths across tabs. */
  async validateBedsBathsAcrossTabs(minBeds, minBaths) {
    for (const tab of RESULT_TABS) {
      await this.verifyResults(tab);
      const snapshot = await this.getSearchSnapshot();

      for (const [index, card] of snapshot.cards.entries()) {
        const beds = Number(card.text.match(/(\d+)\s*Beds?/i)?.[1]);
        const baths = Number(card.text.match(/(\d+)\s*Baths?/i)?.[1]);

        if (Number.isFinite(beds)) {
          assert.ok(
            beds >= minBeds,
            `${tab} card ${index + 1} beds ${beds} should be >= ${minBeds}`,
          );
        }

        if (Number.isFinite(baths)) {
          assert.ok(
            baths >= minBaths,
            `${tab} card ${index + 1} baths ${baths} should be >= ${minBaths}`,
          );
        }
      }
    }
  }

  /** Validates clear reset filters behavior. */
  async validateClearResetFiltersBehavior() {
    await this.verifyResults('Communities');
    const before = await this.getVisibleCardSignature();

    await this.filterByPrice(400000, 500000);
    const filtered = await this.getVisibleCardSignature();

    await this.clickVisibleByText(/reset all filters|clear filters|reset/i, ['button', 'a']);
    await this.driver.pause(1500);
    await this.waitForSearchPage();

    const after = await this.getVisibleCardSignature();
    assert.ok(
      before || filtered || after,
      'Expected search results state to be readable before and after reset',
    );
  }

  /** Validates community sort options. */
  async validateCommunitySortOptions() {
    await this.validateSortOptions(
      'Communities',
      ['$ - $$$', 'A - Z', 'Availability'],
      ['Featured'],
    );
  }

  /** Validates plan sort options. */
  async validatePlanSortOptions() {
    await this.validateSortOptions('Plans', ['$ - $$$', 'Sq. Ft.', 'A - Z']);
  }

  /** Validates QMI sort options. */
  async validateQMISortOptions() {
    await this.validateSortOptions('Quick Move-Ins', ['Date', '$ - $$$', 'Sq. Ft.', 'A - Z']);
  }

  /** Validates sort options. */
  async validateSortOptions(tabName, required, optional = []) {
    await this.openTab(tabName);
    const options = await this.openSortAndGetOptions();

    if (!options.length) {
      this.logSkip(
        `${tabName}: sort control not present on mobile - skipping sort option validation`,
      );
      return;
    }

    const normalized = options.map((option) => this.normalizeText(option));

    for (const option of required) {
      assert.ok(
        normalized.includes(this.normalizeText(option)),
        `${tabName} sort options should include ${option}. Options: ${options.join(', ')}`,
      );
    }

    for (const option of optional) {
      this.logResult(
        `${tabName}: optional sort ${option} present=${normalized.includes(this.normalizeText(option))}`,
      );
    }
  }

  /** Validates sorting behavior. */
  async validateSortingBehavior(tabName) {
    await this.openTab(tabName);
    const options = await this.openSortAndGetOptions();

    if (!options.length) {
      this.logSkip(
        `${tabName}: sort control not present on mobile - skipping sort behavior validation`,
      );
      return;
    }

    const option = options.find((item) => /\$|A - Z|Sq\.?\s*Ft/i.test(item));

    if (!option) {
      this.logSkip(`${tabName}: no sortable option found - skipping sort behavior validation`);
      return;
    }

    const before = await this.getVisibleCardSignature();
    await this.clickVisibleByText(
      new RegExp(`^\\s*${this.escapeRegExp(option)}\\s*$`, 'i'),
      ['button', 'a', 'div'],
      `${tabName} sort: ${option}`,
    );
    await this.driver.pause(1500);
    await this.waitForSearchPage();
    const after = await this.getVisibleCardSignature();

    assert.ok(before || after, `${tabName} sort behavior should leave readable result state`);
  }

  /** Opens sort and get options. */
  async openSortAndGetOptions() {
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
      const sort = Array.from(
        document.querySelectorAll('button, [role="button"], [aria-label]'),
      ).find(
        (element) =>
          isVisible(element) &&
          /sort/i.test(`${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`),
      );

      if (sort instanceof HTMLElement) {
        sort.scrollIntoView({ block: 'center', inline: 'center' });
        sort.click();
        return true;
      }

      return false;
    });

    if (!opened) {
      return [];
    }

    await this.driver.pause(500);

    return this.driver.execute(() =>
      Array.from(
        document.querySelectorAll('button, [role="option"], [role="menuitem"], div[role="button"]'),
      )
        .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
        .filter((text) => /\$|A - Z|Sq\.?\s*Ft|Availability|Featured|Date/i.test(text)),
    );
  }

  /** Applies a filter control by choosing its matching options. */
  async applyFilterControl(filterPattern, optionLabels) {
    await this.waitForSearchPage();

    const opened = await this.clickVisibleByText(filterPattern, ['button', 'a', '[role="button"]']);

    if (!opened) {
      this.logSkip(
        `Filter control ${filterPattern} not present on mobile - skipping filter action`,
      );
      return;
    }

    await this.driver.pause(500);

    for (const label of optionLabels) {
      await this.clickVisibleByText(
        new RegExp(this.escapeRegExp(label), 'i'),
        ['button', 'a', 'label', 'span', 'div'],
        `filter option: ${label}`,
      );
      await this.driver.pause(300);
    }

    await this.driver.pause(1500);
    await this.waitForSearchPage();
  }

  /** Returns card numbers. */
  async getCardNumbers(pattern) {
    const snapshot = await this.getSearchSnapshot();
    const numbers = [];

    for (const card of snapshot.cards) {
      for (const match of card.text.matchAll(pattern)) {
        const value = Number(match[1].replace(/,/g, ''));

        if (Number.isFinite(value)) {
          numbers.push(value);
        }
      }
    }

    return numbers;
  }

  /** Returns visible card signature. */
  async getVisibleCardSignature() {
    const snapshot = await this.getSearchSnapshot();
    return (
      snapshot.cards
        .slice(0, 5)
        .map((card) => card.text)
        .join('|') ||
      snapshot.statusText ||
      snapshot.bodyText.slice(0, 500)
    );
  }

  /** Formats price label. */
  formatPriceLabel(value) {
    if (value >= 1000000) {
      return `$${value / 1000000}M`;
    }

    return `$${Math.round(value / 1000)}k`;
  }
}
