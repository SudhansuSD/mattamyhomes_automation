import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/bddConfig';

/**
 * -----------------------------
 * Market Search
 * -----------------------------
 */
When(
    'I search for market {string}',
    async function (this: CustomWorld, market: string) {
        await this.homePage.searchByMarket(market);
    }
);

Then(
  'search results should display communities for the selected market',
  async function (this: CustomWorld) {
    await this.homePage.verifySearchByMarket();
  }
);


/**
 * -----------------------------
 * Community Search
 * -----------------------------
 */
When(
    'I search for community {string}',
    async function (this: CustomWorld, community: string) {
        await this.homePage.searchByCommunity(community);
    }
);

Then(
  'community details page should be displayed',
  async function (this: CustomWorld) {
    await this.homePage.verifySearchByCommunity();
  }
);

