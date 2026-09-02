import { test } from '@playwright/test';
import {
  getLeadSubmissionSkipReason,
  isLeadSubmissionBlocked,
} from '../config/environments/leadSubmissionPolicy';
import { getLocationConfig, getMarketsPerRegion } from '../config/locations/locationConfig';
import { MarketPage } from '../pages/MarketPage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

const location = getLocationConfig();
const configuredMarket =
  location.markets.find((market) =>
    market.name
      .split('||')
      .map((name) => name.trim())
      .includes(location.market),
  ) ?? location.markets[0];
const sampledMarkets = getMarketsPerRegion(location.markets);

test.describe(`Market page tests - ${location.country}`, () => {
  let marketPage: MarketPage;

  test.beforeEach(async ({ page }) => {
    marketPage = new MarketPage(page);
    await annotate({
      location: location.country,
      feature: 'Market Page',
      owner: 'QA Automation',
      severity: Severity.CRITICAL,
      tags: ['smoke', 'regression'],
    });
  });

  // BASIC MARKET VALIDATION

  test.describe('Basic Market Validation', () => {
    test(`@smoke | ${location.country} | Validate one market per region navigation and heading`, async () => {
      // One market per state or province rather than the full list: the smoke
      // question is whether market pages render per region, and the sample
      // answers it in a fraction of the time. Budget ~30s per market plus
      // headroom - a ceiling to catch hangs, not a target.
      test.setTimeout(8 * 60 * 1000);

      for (const market of sampledMarkets) {
        await test.step(`Verify market: ${market.name}`, async () => {
          await marketPage.navigateToMarket(market.url);
          await marketPage.verifyMarketPage(market);
        });
      }
    });

    // Retries are off for this one: it walks every market in a single test, so a
    // failure here is either a wedged market page or a genuinely broken one, and
    // a second 15-minute attempt buys diagnosis nothing it did not already have.
    test.describe('All markets', () => {
      test.describe.configure({ retries: 0 });

      test(`@regression | ${location.country} | Validate all markets navigation and heading`, async () => {
        // Navigates every configured market in one test (16 for USA), so it
        // needs far more than the 5 min per-test default.
        test.setTimeout(15 * 60 * 1000);

        for (const market of location.markets) {
          await test.step(`Verify market: ${market.name}`, async () => {
            await marketPage.navigateToMarket(market.url);
            await marketPage.verifyMarketPage(market);
          });
        }
      });
    });
  });

  // MARKET-SPECIFIC TESTS

  for (const market of location.markets) {
    test.describe(`Market: ${market.name}`, () => {
      test.beforeEach(async () => {
        await marketPage.navigateToMarket(market.url);
      });
      test(`@regression | ${location.country} | Validate community cards section of ${market.name}`, async () => {
        await test.step('Validate community cards with name + URL', async () => {
          await marketPage.validateCommunityCards();
        });
      });
    });
  }
  // MARKET-PAGE VALIDATION

  test.describe(`Configured market deep validation - ${configuredMarket.name}`, () => {
    test.beforeEach(async () => {
      await marketPage.navigateToMarket(configuredMarket.url);
      await marketPage.verifyMarketPage(configuredMarket);
    });

    test(`@regression | ${location.country} | Validate market hero and key search links`, async () => {
      await test.step('Validate hero content', async () => {
        await marketPage.validateHeroContent(configuredMarket);
      });

      await test.step('Validate plan and QMI search links', async () => {
        await marketPage.validateMarketSearchLinks();
      });
    });

    test(`@regression | ${location.country} | Validate community card details and navigation`, async () => {
      await test.step('Validate community card content quality', async () => {
        await marketPage.validateCommunityCardDetails();
      });

      await test.step('Validate first community card navigation', async () => {
        await marketPage.validateFirstCommunityCardNavigation();
      });
    });

    // The Discover Our Homes section is identical across markets, so it is
    // validated once per country on the configured market rather than on all of
    // them - same rationale as the lead form tests below.
    test(`@regression | ${location.country} | Validate Discover Our Homes section`, async () => {
      await test.step('Validate discover section links and URLs', async () => {
        await marketPage.validateDiscoverOurHomesSection();
      });
    });

    test.describe('Lead Form Validation', () => {
      test.skip(
        location.country === 'CAN',
        'Skipping market lead form validation for Canada because no market form is currently available.',
      );

      test(`@regression | ${location.country} | Validate lead form required errors on empty submit`, async () => {
        await test.step(`Submit empty lead form and validate required errors for ${configuredMarket.name}`, async () => {
          await marketPage.validateLeadFormRequiredErrors(configuredMarket.name);
        });
      });

      test(`@regression | ${location.country} | Validate lead form invalid email error`, async () => {
        await test.step(`Submit lead form with invalid email for ${configuredMarket.name}`, async () => {
          await marketPage.validateLeadFormInvalidData(configuredMarket.name);
        });
      });

      test.describe('Lead form submission', () => {
        test.skip(isLeadSubmissionBlocked(), getLeadSubmissionSkipReason() ?? '');

        test(`@regression @lead-submit @STAGE | ${location.country} | Validate lead form successful submission and API response`, async () => {
          await test.step(`Submit lead form with valid data and validate API for ${configuredMarket.name}`, async () => {
            await marketPage.submitLeadFormSuccessfully(configuredMarket.name);
          });
        });
      });
    });

    test.describe('Media Validation', () => {
      test(`@regression | ${location.country} | Validate market page image and video URLs return 200`, async () => {
        // Lazy-loads the whole page then requests every image/video URL it finds.
        test.setTimeout(10 * 60 * 1000);

        await marketPage.validateImageAndVideoUrlsReturn200('Market page');
      });
    });
  });
});
