/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/headerNavigation.spec.ts --project=Chrome
 * Header navigation validation: link visibility, Find Your Home, chatbot widget
 * and the country-specific mega-menu flyout (Homebuying on USA, Resources on CAN).
 */

import { test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { RESOURCE_MENU_BY_COUNTRY } from '../config/navigation/countryNavigation';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

// Country-specific mega-menu flyout under test (from the country navigation source of truth).
const menuConfig = RESOURCE_MENU_BY_COUNTRY[locationKey];

test.describe(`Header Navigation - ${location.country}`, () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await annotate({
      location: location.country,
      feature: 'Header Navigation',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['regression'],
    });

    await test.step(`Navigate to ${location.country} home page`, async () => {
      await homePage.navigate(locationKey);
      await homePage.verifyPageLoaded();
    });
  });

  test(`@smoke @regression | ${location.country} | Header navigation should be visible`, async ({
    page,
  }) => {
    // Walks each Find Your Home link and waits for its navigation (30s ceiling
    // per link), so this outgrows the 5 min per-test default.
    test.setTimeout(8 * 60 * 1000);

    const header = new Header(page);

    await test.step('Verify header links are visible', async () => {
      await header.verifyHeaderLinksVisible();
    });
    await test.step('Verify Find Your Home link and navigation', async () => {
      await header.verifyFindYourHomeLinks();
    });
  });

  test(`@regression | ${location.country} | Chatbot widget should load`, async ({ page }) => {
    const header = new Header(page);

    await test.step('Verify chatbot widget is present', async () => {
      await header.verifyChatbotLoaded();
    });
  });

  test(`@smoke @regression | ${location.country} | ${menuConfig.menuName} mega-menu should expose expected links`, async ({
    page,
  }) => {
    // Opens the flyout and navigates every link in it (30s ceiling per link).
    test.setTimeout(8 * 60 * 1000);

    const header = new Header(page);

    await test.step(`Verify ${menuConfig.menuName} flyout links`, async () => {
      await header.verifyMenuLinks(menuConfig.menuName, menuConfig.links);
    });
  });
});
