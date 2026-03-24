import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { MarketPage } from '../pages/MarketPage';

const location = getLocationConfig();

test.describe(`@regression Market page tests - ${location.country}`, () => {
  let marketPage: MarketPage;

  test.beforeEach(async ({ page }) => {
    marketPage = new MarketPage(page);
  });

  /* ==========================================================
     BASIC MARKET VALIDATION (ALL MARKETS)
  ========================================================== */

  test(`@smoke Validate all markets navigation and heading`, async () => {
    for (const market of location.markets) {
      await test.step(`Verify market: ${market.name}`, async () => {
        await marketPage.navigateToMarket(market.url);
        await marketPage.verifyMarketPage(market);
      });
    }
  });

  /* ==========================================================
     MARKET-SPECIFIC TESTS
  ========================================================== */

  for (const market of location.markets) {
    test.describe(`Market: ${market.name}`, () => {

      test.beforeEach(async () => {
        await marketPage.navigateToMarket(market.url);
      });
      test(`@regression Validate community cards section of ${market.name}`, async () => {
        await test.step('Validate community cards with name + URL', async () => {
          await marketPage.validateCommunityCards();
        });
      });

      test(`@regression Validate lead form`, async () => {
        await test.step('Validate lead form fields and errors', async () => {
          await marketPage.validateLeadForm(market.name);
        });
      });

      test(`@regression Validate Discover Our Homes section`, async () => {
        await test.step('Validate discover section links and URLs', async () => {
          await marketPage.validateDiscoverOurHomesSection();
        });
      });

    });
  }
});