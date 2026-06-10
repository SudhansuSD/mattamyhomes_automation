/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/home.spec.ts
 * Home Page Smoke & Search Tests
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { Footer } from '../pages/Footer';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';

const location = getLocationConfig();
const condoCommunity =
  'condoCommunity' in location ? location.condoCommunity : undefined;
const condoPlan =
  'condoPlan' in location ? location.condoPlan : undefined;
const mpc =
  'mpc' in location ? location.mpc?.[0] : undefined;

test.describe(`Mattamy Homes - ${location.country}`, () => {

  let homePage: HomePage;

  /* ==========================================================
     Common Navigation
  ========================================================== */

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    await test.step('Navigate to Home Page', async () => {
      await homePage.navigate();
    });
  });

  /* ==========================================================
     Page Load
  ========================================================== */

  test('HOME-001 | @ci @smoke @regression @sanity | Home page should load correctly', async () => {

    await test.step('Verify page loaded successfully', async () => {
      await homePage.verifyPageLoaded();
    });
  });

  test('HOME-002 | @smoke @regression | Validate hero video autoplay on Home Page', async ({ }, testInfo) => {
    test.skip(testInfo.project.name !== 'Chromium', 'Hero autoplay video is validated on the desktop home page.');

    await test.step('Verify hero video autoplays', async () => {
      await homePage.validateHeroVideoAutoplay();
    });
  });

  /* ==========================================================
     Header Validation
  ========================================================== */

  test('HOME-003 | @smoke | Header navigation should be visible', async ({ page }) => {

    const header = new Header(page);

    await test.step('Verify header links are visible', async () => {
      await header.verifyHeaderLinksVisible();
    });
    await test.step('Verify Find Your Home link and navigation', async () => {
      await header.verifyFindYourHomeLinks();
    });
  });

  /* ==========================================================
     Footer Validation
  ========================================================== */

  test('HOME-004 | @smoke | Footer should be visible with Privacy Policy link', async ({ page }) => {

    const footer = new Footer(page);

    await test.step('Verify footer is loaded correctly', async () => {
      await footer.verifyFooterLoaded();
    });
  });

  /* ==========================================================
     Search – Market
  ========================================================== */

  test('HOME-005 | @regression | Search market functionality should work', async () => {

    await test.step('Search and validate by market', async () => {
      await homePage.searchAndValidateByValue('market', location.market);
    });
  });

  /* ==========================================================
     Search – Community
  ========================================================== */

  test('HOME-006 | @regression | Search by community functionality should work', async () => {

    await test.step('Search and validate by community', async () => {
      await homePage.searchAndValidateByValue('community', location.community);
    });
  });
  /* ==========================================================
       Search – Condo Community
    ========================================================== */

  test('HOME-007 | @regression | Search by condo community functionality should work', async () => {
    test.skip(!condoCommunity, 'Condo community is not configured for this location');

    await test.step('Search and validate by condo community', async () => {
      await homePage.searchAndValidateByValue('condoCommunity', condoCommunity!);
    });
  });

  /* ==========================================================
     Search – QMI
  ========================================================== */

  test('HOME-008 | @regression | Search by QMI home functionality should work', async () => {

    await test.step('Search and validate by QMI address', async () => {
      await homePage.searchAndValidateByValue('qmi', location.qmiAddress);
    });
  });

  /* ==========================================================
     Search – Plan
  ========================================================== */

  test('HOME-009 | @regression | Search by plan functionality should work', async () => {

    await test.step('Search and validate by plan name', async () => {
      await homePage.searchAndValidateByValue('plan', location.planName);
    });
  });
  /* ==========================================================
     Search – Condo Plan
  ========================================================== */

  test('HOME-010 | @regression | Search by condo plan functionality should work', async () => {
    test.skip(!condoPlan?.name, 'Condo plan is not configured for this location');

    await test.step('Search and validate by condo plan name', async () => {
      await homePage.searchAndValidateByValue('condoPlan', condoPlan!.name!);
    });
  });
  /* ==========================================================
       Search – Master Planned Community (MPC)
    ========================================================== */
  test('HOME-011 | @regression | Search by MPC functionality should work', async () => {
    test.skip(!mpc?.name, 'MPC is not configured for this location');

    await test.step('Search and validate by MPC', async () => {
      await homePage.searchAndValidateByValue('mpc', mpc!.name);
    });
  });
  /* ==========================================================
       Validate Market Cards on Home Page
    ========================================================== */
  test('HOME-012 | @regression | Validate market Cards on Home Page', async ({ page }) => {
    // Validate market cards are visible and correctly linked
    await homePage.validateMarketCards();

  });

});
