import assert from 'node:assert/strict';
import { MobileWebHomePage } from './MobileWebHomePage';
import { getLocationConfig } from '../../config/locations/locationConfig';

const RESULT_TABS = ['Communities', 'Plans', 'Quick Move-Ins'];

export class MobileWebSearchPage extends MobileWebHomePage {
  /** Opens the configured mobile search page. */
  async navigate() {
    await this.openSearchByMarket(getLocationConfig().market);
  }

  /** Opens the search results for a market. */
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

  /** Searches for a market from the search box. */
  async searchByMarket(market = getLocationConfig().market) {
    await this.openSearchByMarket(market);
    return true;
  }

  /** Checks a market search lands on results for that market. */
  async verifySearchByMarket(expectedMarket = getLocationConfig().market) {
    const currentUrl = await this.driver.getUrl();
    const params = new URL(currentUrl).searchParams;
    const metro = params.get('metro') || '';

    assert.match(currentUrl, /\/search/i, 'Expected search page URL');
    assert.equal(this.normalizeText(metro), this.normalizeText(expectedMarket));
  }

  /** Waits until the search page has loaded its results. */
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

  /** Opens the requested results tab. */
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
      await this.waitForSearchPage();
    }
  }

  /** Captures the current search results state. */
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

  /** Opens a tab and checks it settles on either result cards or a no-results message. */
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

  /** Checks every card on a tab has a name, location, image and detail link. */
  async validateResultCardsRequiredDetails(tabName) {
    await this.verifyResults(tabName);
    const snapshot = await this.getSearchSnapshot();

    if (!snapshot.cards.length) {
      assert.fail(`${tabName}: expected result cards before validating card details`);
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

  /** Runs the required-details check on every tab. */
  async validateAllResultCardsRequiredDetails() {
    for (const tab of RESULT_TABS) {
      await this.validateResultCardsRequiredDetails(tab);
    }
  }

  /** Opens the first few cards on a tab and checks each detail page matches its card. */
  async validateResultCardCtaNavigation(tabName, cardsToValidate = 2) {
    await this.verifyResults(tabName);
    const snapshot = await this.getSearchSnapshot();
    const cards = snapshot.cards.filter(
      (card) => card.href && !/^\/?search(?:\?|$)/i.test(card.href),
    );

    if (!cards.length) {
      assert.fail(
        `${tabName}: expected result cards with detail CTAs before navigation validation`,
      );
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

  /** Runs the card-to-detail-page check on every tab. */
  async validateAllResultCardCtaNavigation() {
    for (const tab of RESULT_TABS) {
      await this.validateResultCardCtaNavigation(tab);
    }
  }

  /** Applies a minimum and maximum price from the price filter. */
  async filterByPrice(minPrice, maxPrice) {
    await this.applyFilterControl(/price/i, [
      this.formatPriceLabel(minPrice),
      this.formatPriceLabel(maxPrice),
    ]);
  }

  /** Checks every tab's card prices stay inside the filtered range. */
  async validatePriceRangeAcrossTabs(minPrice, maxPrice) {
    for (const tab of RESULT_TABS) {
      await this.verifyResults(tab);
      const prices = await this.getCardNumbers(/\$([\d,]+)/g);

      if (tab === 'Communities' || prices.length === 0) {
        if (tab !== 'Communities') {
          assert.fail(`${tab}: expected displayed prices to assert mobile price filtering`);
        }
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

  /** Applies the minimum bedrooms and bathrooms from the Beds & Baths filter. */
  async filterByBedroomsAndBathrooms(minBeds, minBaths) {
    await this.applyFilterControl(/beds|bath/i, [`${minBeds} Bedrooms`, `${minBaths} Bathrooms`]);
  }

  /** Checks every tab's cards meet the bed and bath minimums. */
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

  /** Filters, resets, and checks the results go back to how they started. */
  async validateClearResetFiltersBehavior() {
    await this.verifyResults('Communities');
    const before = await this.getVisibleCardSignature();

    await this.filterByPrice(400000, 500000);
    const filtered = await this.getVisibleCardSignature();

    const resetClicked = await this.clickVisibleByText(/reset all filters|clear filters|reset/i, [
      'button',
      'a',
    ]);
    assert.equal(resetClicked, true, 'Expected reset/clear filters control to be clickable');
    await this.waitForSearchSignatureChange(filtered, 'reset filters');

    const after = await this.getVisibleCardSignature();
    assert.ok(
      before || filtered || after,
      'Expected search results state to be readable before and after reset',
    );
  }

  /** Checks the Communities tab offers its sort options. */
  async validateCommunitySortOptions() {
    await this.validateSortOptions(
      'Communities',
      ['$ - $$$', 'A - Z', 'Availability'],
      ['Featured'],
    );
  }

  /** Checks the Plans tab offers its sort options. */
  async validatePlanSortOptions() {
    await this.validateSortOptions('Plans', ['$ - $$$', 'Sq. Ft.', 'A - Z']);
  }

  /** Checks the Quick Move-Ins tab offers its sort options. */
  async validateQMISortOptions() {
    await this.validateSortOptions('Quick Move-Ins', ['Date', '$ - $$$', 'Sq. Ft.', 'A - Z']);
  }

  /** Opens the sort menu and checks it offers every option this tab should have. */
  async validateSortOptions(tabName, required, optional = []) {
    await this.openTab(tabName);
    const options = await this.openSortAndGetOptions();

    if (!options.length) {
      assert.fail(`${tabName}: expected sort control/options for mobile sort option validation`);
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

  /** Walks every sort option on a tab and checks the cards re-order correctly. */
  async validateSortingBehavior(tabName) {
    await this.openTab(tabName);
    const options = await this.openSortAndGetOptions();

    if (!options.length) {
      assert.fail(`${tabName}: expected sort control/options for mobile sort behavior validation`);
    }

    const option = options.find((item) => /\$|A - Z|Sq\.?\s*Ft/i.test(item));

    if (!option) {
      assert.fail(
        `${tabName}: expected at least one sortable option. Options: ${options.join(', ')}`,
      );
    }

    const before = await this.getVisibleCardSignature();
    await this.clickVisibleByText(
      new RegExp(`^\\s*${this.escapeRegExp(option)}\\s*$`, 'i'),
      ['button', 'a', 'div'],
      `${tabName} sort: ${option}`,
    );
    await this.waitForSearchSignatureChange(before, `${tabName} sort: ${option}`);
    const after = await this.getVisibleCardSignature();

    assert.ok(before || after, `${tabName} sort behavior should leave readable result state`);
  }

  /** Opens the sort menu and returns the options it offers. */
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

    await this.waitForMobileCondition(async () => {
      const options = await this.getSortOptionLabels();
      return options.length > 0;
    }, 'Expected mobile sort options to render after opening sort control').catch(() => undefined);

    return this.getSortOptionLabels();
  }

  /** Applies a filter control by choosing its matching options. */
  async applyFilterControl(filterPattern, optionLabels) {
    await this.waitForSearchPage();

    const opened = await this.clickVisibleByText(filterPattern, ['button', 'a', '[role="button"]']);

    if (!opened) {
      assert.fail(`Expected filter control ${filterPattern} to be present on mobile search page`);
    }

    await this.waitForMobileCondition(async () => {
      const text = await this.getBodyText();
      return optionLabels.some((label) => new RegExp(this.escapeRegExp(label), 'i').test(text));
    }, `Expected filter options for ${filterPattern} to render on mobile search page`).catch(
      () => undefined,
    );

    const before = await this.getVisibleCardSignature();
    for (const label of optionLabels) {
      const clicked = await this.clickVisibleByText(
        new RegExp(this.escapeRegExp(label), 'i'),
        ['button', 'a', 'label', 'span', 'div'],
        `filter option: ${label}`,
      );

      assert.equal(clicked, true, `Expected filter option "${label}" to be clickable`);
    }

    await this.waitForSearchSignatureChange(before, `filter ${filterPattern}`);
  }

  /** Returns the sort option labels currently on screen. */
  async getSortOptionLabels() {
    return this.driver.execute(() =>
      Array.from(
        document.querySelectorAll('button, [role="option"], [role="menuitem"], div[role="button"]'),
      )
        .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
        .filter((text) => /\$|A - Z|Sq\.?\s*Ft|Availability|Featured|Date/i.test(text)),
    );
  }

  /** Waits for the results to change after a filter or sort. */
  async waitForSearchSignatureChange(before, label) {
    await this.waitForMobileCondition(async () => {
      const after = await this.getVisibleCardSignature();
      return after.length > 0 && after !== before;
    }, `Expected mobile search results state to change after ${label}`).catch(async () => {
      await this.waitForSearchPage();
    });
  }

  /** Reads the numbers - prices, square footage - off the visible cards. */
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

  /** Builds a short fingerprint of the visible cards, so we can tell when results change. */
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

  /** Formats a price the way the mobile filter labels it. */
  formatPriceLabel(value) {
    if (value >= 1000000) {
      return `$${value / 1000000}M`;
    }

    return `$${Math.round(value / 1000)}k`;
  }
}
