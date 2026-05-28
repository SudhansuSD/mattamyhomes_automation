/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/home.spec.ts
 * Home Page Smoke & Search Tests
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { CommunityPage } from '../pages/CommunityPage';
import { Footer } from '../pages/Footer';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';
import { PlanDetailPage } from '../pages/PlanDetailPage';
import { QMIPage } from '../pages/QMIPage';

const location = getLocationConfig();

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

  test('@ci @smoke @regression @sanity Home page should load correctly', async () => {

    await test.step('Verify page loaded successfully', async () => {
      await homePage.verifyPageLoaded();
    });
  });

  test('@smoke @regression Validate hero video autoplay on Home Page', async ({ }, testInfo) => {
    test.skip(testInfo.project.name !== 'Chromium', 'Hero autoplay video is validated on the desktop home page.');

    await test.step('Verify hero video autoplays', async () => {
      await homePage.validateHeroVideoAutoplay();
    });
  });

  /* ==========================================================
     Header Validation
  ========================================================== */

  test('@smoke Header navigation should be visible', async ({ page }) => {

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

  test('@smoke Footer should be visible with Privacy Policy link', async ({ page }) => {

    const footer = new Footer(page);

    await test.step('Verify footer is loaded correctly', async () => {
      await footer.verifyFooterLoaded();
    });
  });

  /* ==========================================================
     Search – Market
  ========================================================== */

  test('@regression Search market functionality should work', async () => {

    await test.step('Search by market', async () => {
      await homePage.searchByMarket(location.market);
    });

    await test.step('Verify market search result', async () => {
      await homePage.verifySearchByMarket(location.market);
    });
  });

  /* ==========================================================
     Search – Community
  ========================================================== */

  test('@regression Search by community functionality should work', async ({ page }) => {

    const communityPage = new CommunityPage(page);

    await test.step('Search by community', async () => {
      await communityPage.searchByCommunity(location.community);
    });

    await test.step('Verify community search result', async () => {
      await communityPage.verifySearchByCommunity(location.community);
    });
  });

  /* ==========================================================
     Search – QMI
  ========================================================== */

  test('@regression Search by QMI home functionality should work', async ({ page }) => {

    const qmiPage = new QMIPage(page);

    await test.step('Search by QMI address', async () => {
      await qmiPage.searchByQMI(location.qmiAddress);
    });

    await test.step('Verify QMI search result', async () => {
      await qmiPage.verifySearchByQMI(location.qmiAddress);
    });
  });

  /* ==========================================================
     Search – Plan
  ========================================================== */

  test('@regression Search by plan functionality should work', async ({ page }) => {

    const planPage = new PlanDetailPage(page);

    await test.step('Search by plan name', async () => {
      await planPage.searchByPlan(location.planName);
    });

    await test.step('Verify plan search result', async () => {
      await planPage.verifySearchByPlan(location.expectedPlanUrlPart);
      await planPage.verifyPlanUrlContains(location.communityPath);
    });
  });

  test('@regression Validate market Cards on Home Page', async ({ page }) => {
    // Validate market cards are visible and correctly linked
    await homePage.validateMarketCards();

  });

});
