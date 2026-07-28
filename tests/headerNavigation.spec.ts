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
import { annotate, Severity } from '../utils/allureMeta';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

// Country-specific mega-menu flyout under test (from the country navigation source of truth).
const menuConfig = RESOURCE_MENU_BY_COUNTRY[locationKey];

test.describe(`Header Navigation - ${location.country}`, () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await annotate({
      epic: 'Mattamy Homes Website',
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

  test('TC-01 | @smoke @regression | Header navigation should be visible', async ({ page }) => {
    const header = new Header(page);

    await test.step('Verify header links are visible', async () => {
      await header.verifyHeaderLinksVisible();
    });
    await test.step('Verify Find Your Home link and navigation', async () => {
      await header.verifyFindYourHomeLinks();
    });
  });

  test('TC-02 | @regression | Chatbot widget should load', async ({ page }) => {
    const header = new Header(page);

    await test.step('Verify chatbot widget is present', async () => {
      await header.verifyChatbotLoaded();
    });
  });

  test(`TC-03 | @smoke @regression | ${location.country} ${menuConfig.menuName} mega-menu should expose expected links`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'Chrome',
      'Header flyout navigation is validated on desktop Chrome.',
    );

    const header = new Header(page);

    await test.step(`Verify ${menuConfig.menuName} flyout links`, async () => {
      await header.verifyMenuLinks(menuConfig.menuName, menuConfig.links);
    });
  });
});
