import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { MarketPage } from '../pages/MarketPage';
import { annotate, Severity } from '../utils/allureMeta';

const { envName } = getEnvConfig();
const location = getLocationConfig();
const configuredMarket =
  location.markets.find((market) =>
    market.name
      .split('||')
      .map((name) => name.trim())
      .includes(location.market),
  ) ?? location.markets[0];

test.describe(`@regression Market page tests - ${location.country}`, () => {
  let marketPage: MarketPage;

  test.beforeEach(async ({ page }) => {
    marketPage = new MarketPage(page);
    await annotate({
      epic: 'Mattamy Homes Website',
      feature: 'Market Page',
      owner: 'QA Automation',
      severity: Severity.CRITICAL,
      tags: ['smoke', 'regression'],
    });
  });

  /* ==========================================================
     BASIC MARKET VALIDATION (ALL MARKETS)
  ========================================================== */

  test.describe('Basic Market Validation', () => {
    test(`TC-01 | @smoke @regression | Validate all markets navigation and heading`, async () => {
      for (const market of location.markets) {
        await test.step(`Verify market: ${market.name}`, async () => {
          await marketPage.navigateToMarket(market.url);
          await marketPage.verifyMarketPage(market);
        });
      }
    });
  });

  /* ==========================================================
     MARKET-SPECIFIC TESTS
  ========================================================== */

  for (const market of location.markets) {
    test.describe(`Market: ${market.name}`, () => {
      test.beforeEach(async () => {
        await marketPage.navigateToMarket(market.url);
      });
      test(`TC-01 | @regression | Validate community cards section of ${market.name}`, async () => {
        await test.step('Validate community cards with name + URL', async () => {
          await marketPage.validateCommunityCards();
        });
      });

      test(`TC-02 | @regression | Validate Discover Our Homes section`, async () => {
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

    test('TC-01 | @regression | Validate market hero and key search links', async () => {
      await test.step('Validate hero content', async () => {
        await marketPage.validateHeroContent(configuredMarket);
      });

      await test.step('Validate plan and QMI search links', async () => {
        await marketPage.validateMarketSearchLinks();
      });
    });

    test('TC-02 | @regression | Validate community card details and navigation', async () => {
      await test.step('Validate community card content quality', async () => {
        await marketPage.validateCommunityCardDetails();
      });

      await test.step('Validate first community card navigation', async () => {
        await marketPage.validateFirstCommunityCardNavigation();
      });
    });

    test.describe('Lead Form Validation', () => {
      test.skip(
        location.country === 'CAN',
        'Skipping market lead form validation for Canada because no market form is currently available.',
      );

      test(`TC-01 | @regression | Validate lead form required errors on empty submit`, async () => {
        await test.step(`Submit empty lead form and validate required errors for ${configuredMarket.name}`, async () => {
          await marketPage.validateLeadFormRequiredErrors(configuredMarket.name);
        });
      });

      test(`TC-02 | @regression | Validate lead form invalid email error`, async () => {
        await test.step(`Submit lead form with invalid email for ${configuredMarket.name}`, async () => {
          await marketPage.validateLeadFormInvalidData(configuredMarket.name);
        });
      });

      test.describe('Lead form submission', () => {
        test.skip(envName === 'PROD', 'Skipping lead form submission on PROD environment.');

        test(`TC-01 | @regression @STAGE | Validate lead form successful submission and API response`, async () => {
          await test.step(`Submit lead form with valid data and validate API for ${configuredMarket.name}`, async () => {
            await marketPage.submitLeadFormSuccessfully(configuredMarket.name);
          });
        });
      });
    });

    test.describe('Media Validation', () => {
      test('TC-01 | @regression | Validate market page image and video URLs return 200', async () => {
        await marketPage.validateImageAndVideoUrlsReturn200('Market page');
      });
    });
  });
});
