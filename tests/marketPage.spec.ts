import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { MarketPage } from '../pages/MarketPage';

const location = getLocationConfig();
const configuredMarket = location.markets.find((market) =>
  market.name
    .split('||')
    .map((name) => name.trim())
    .includes(location.market)
) ?? location.markets[0];

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

      test(`@regression Validate Discover Our Homes section`, async () => {
        await test.step('Validate discover section links and URLs', async () => {
          await marketPage.validateDiscoverOurHomesSection();
        });
      });

    });
  }
  /* ==========================================================
         MARKET-PAGE VALIDATION
      ========================================================== */

  test.describe(`Configured market deep validation - ${configuredMarket.name}`, () => {
    test.beforeEach(async () => {
      await marketPage.navigateToMarket(configuredMarket.url);
      await marketPage.verifyMarketPage(configuredMarket);
    });

    test('@regression Validate market hero and key search links', async () => {
      await test.step('Validate hero content', async () => {
        await marketPage.validateHeroContent(configuredMarket);
      });

      await test.step('Validate plan and QMI search links', async () => {
        await marketPage.validateMarketSearchLinks();
      });
    });

    test('@regression Validate community card details and navigation', async () => {
      await test.step('Validate community card content quality', async () => {
        await marketPage.validateCommunityCardDetails();
      });



      await test.step('Validate first community card navigation', async () => {
        await marketPage.validateFirstCommunityCardNavigation();
      });
    });

    test(`@regression Validate lead form with invalid data`, async () => {
      await test.step('Validate lead form fields and errors', async () => {
        await marketPage.validateLeadFormInvalidData(configuredMarket.name);
      });
    });

    // test(`@regression @STAGE Validate lead form successful submission`, async () => {
    //   await test.step('Submit lead form with valid data', async () => {
    //     await marketPage.submitLeadFormSuccessfully(configuredMarket.name);
    //   });
    // });

  });
});
