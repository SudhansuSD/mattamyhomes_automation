/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/home.spec.ts
 * Home Page Smoke & Search Tests
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { HomePage } from '../pages/HomePage';
import { annotate, Severity } from '../utils/allureMeta';

const location = getLocationConfig();
const condoCommunity = 'condoCommunity' in location ? location.condoCommunity : undefined;
const condoPlan = 'condoPlan' in location ? location.condoPlan : undefined;
const mpc = 'mpc' in location ? location.mpc?.[0] : undefined;

test.describe(`Mattamy Homes - ${location.country}`, () => {
  let homePage: HomePage;

  // Setup

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    await annotate({
      location: location.country,
      feature: 'Home Page',
      owner: 'QA Automation',
      severity: Severity.CRITICAL,
      tags: ['smoke', 'regression'],
    });

    await test.step('Navigate to Home Page', async () => {
      await homePage.navigate();
    });
  });

  // PAGE LOAD

  test.describe('Page Load', () => {
    test(`@ci @smoke @regression | ${location.country} | Home page should load correctly`, async () => {
      await test.step('Verify page loaded successfully', async () => {
        await homePage.verifyPageLoaded();
      });
    });

    test(`@smoke @regression | ${location.country} | Validate hero video autoplay on Home Page`, async ({}, testInfo) => {
      test.skip(
        testInfo.project.name !== 'Chrome',
        'Hero autoplay video is validated on the desktop home page.',
      );

      await test.step('Verify hero video autoplays', async () => {
        await homePage.validateHeroVideoAutoplay();
      });
    });
  });

  // SEARCH VALIDATION

  test.describe('Search', () => {
    test(`@smoke @regression | ${location.country} | Search market functionality should work`, async () => {
      await test.step('Search and validate by market', async () => {
        await homePage.searchAndValidateByValue('market', location.market);
      });
    });

    test(`@regression | ${location.country} | Search by community functionality should work`, async () => {
      await test.step('Search and validate by community', async () => {
        await homePage.searchAndValidateByValue('community', location.community);
      });
    });

    test(`@regression | ${location.country} | Search by condo community functionality should work`, async () => {
      test.skip(!condoCommunity, 'Condo community is not configured for this location');

      await test.step('Search and validate by condo community', async () => {
        await homePage.searchAndValidateByValue('condoCommunity', condoCommunity!);
      });
    });

    test(`@regression | ${location.country} | Search by QMI home functionality should work`, async () => {
      await test.step('Search and validate by QMI address', async () => {
        await homePage.searchAndValidateByValue('qmi', location.qmiAddress);
      });
    });

    test(`@regression | ${location.country} | Search by plan functionality should work`, async () => {
      await test.step('Search and validate by plan name', async () => {
        await homePage.searchAndValidateByValue('plan', location.planName);
      });
    });

    test(`@regression | ${location.country} | Search by condo plan functionality should work`, async () => {
      test.skip(!condoPlan?.name, 'Condo plan is not configured for this location');

      await test.step('Search and validate by condo plan name', async () => {
        await homePage.searchAndValidateByValue('condoPlan', condoPlan!.name!);
      });
    });

    test(`@regression | ${location.country} | Search by MPC functionality should work`, async () => {
      test.skip(!mpc?.name, 'MPC is not configured for this location');

      await test.step('Search and validate by MPC', async () => {
        await homePage.searchAndValidateByValue('mpc', mpc!.name);
      });
    });
  });

  // HOME PAGE CONTENT VALIDATION

  test.describe('Home Page Content Validation', () => {
    test(`@regression | ${location.country} | Validate market cards on Home Page`, async () => {
      await test.step('Verify market cards are visible and correctly linked', async () => {
        await homePage.validateMarketCards();
      });
    });

    test(`@regression | ${location.country} | Validate market card images and links`, async () => {
      await test.step('Verify market card media and link integrity', async () => {
        await homePage.validateMarketCardMediaAndLinks();
      });
    });

    test(`@regression | ${location.country} | Validate home search no-match autocomplete behavior`, async () => {
      await test.step('Verify no-match search state', async () => {
        await homePage.validateSearchAutocompleteNoMatchState();
      });
    });

    test(`@regression | ${location.country} | Validate cookie banner persistence after reload`, async () => {
      await test.step('Verify cookie consent persists', async () => {
        await homePage.validateCookieBannerPersistence();
      });
    });

    test(`@regression | ${location.country} | Validate home page image and video URLs return 200`, async () => {
      await test.step('Verify home page media URLs return 200', async () => {
        await homePage.validateImageAndVideoUrlsReturn200('Home page');
      });
    });

    test(`@regression | ${location.country} | Validate promotion or notification banner behavior`, async () => {
      await test.step('Verify promotion / notification banner', async () => {
        await homePage.validatePromotionOrNotificationBanner();
      });
    });
  });
});
