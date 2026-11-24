/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/aboutUsPages.spec.ts --project=Chrome
 * Header About Us navigation; on phones `Header` opens the menu panel first.
 */

import { test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { TOP_LEVEL_STATIC_LINKS_BY_COUNTRY } from '../config/navigation/countryNavigation';
import { AboutUsPage } from '../pages/AboutUsPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);
const topLevelStaticLinks = TOP_LEVEL_STATIC_LINKS_BY_COUNTRY[locationKey];

test.describe(`Mattamy Homes - ${location.country} Header About Us Links`, () => {
  test.beforeEach(async () => {
    await annotate({
      location: location.country,
      feature: 'About Us',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['smoke', 'regression'],
    });
  });

  test.describe('Header Menu Validation', () => {
    test(`@smoke @regression | ${location.country} | About Us header menu links should be visible`, async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      const header = new Header(page);

      await test.step(`Navigate to ${location.country} home page`, async () => {
        await homePage.navigate(locationKey);
        await homePage.verifyPageLoaded();
      });

      await test.step('Verify About Us menu links match country configuration', async () => {
        await header.verifyAboutUsMenuLinks(location.aboutUsLinks);
      });
    });
  });

  test.describe('About Us Page Validation', () => {
    for (const aboutLink of location.aboutUsLinks) {
      test(`@regression | ${location.country} | ${aboutLink.name} page should load with valid UI and functionality`, async ({
        page,
      }) => {
        const homePage = new HomePage(page);
        const aboutUsPage = new AboutUsPage(page);
        const header = new Header(page);

        await test.step(`Navigate to ${aboutLink.name} from the home page header`, async () => {
          await homePage.navigate(locationKey);
          await homePage.verifyPageLoaded();
          await header.openAboutUsMenu();
          await header.clickAboutUsMenuLink(aboutLink);
        });

        await test.step(`Validate ${aboutLink.name} page UI and functionality`, async () => {
          await aboutUsPage.validateAboutPage(aboutLink);
        });
      });
    }
  });

  // About pages shown as top-level nav items (e.g. Sustainability on CAN).
  test.describe('Top-Level Static Page Validation', () => {
    for (const topLink of topLevelStaticLinks) {
      test(`@regression | ${location.country} | ${topLink.name} top-level page should load with valid UI`, async ({
        page,
      }) => {
        const homePage = new HomePage(page);
        const aboutUsPage = new AboutUsPage(page);
        const header = new Header(page);

        await test.step(`Navigate to ${topLink.name} from the top-level header nav`, async () => {
          await homePage.navigate(locationKey);
          await homePage.verifyPageLoaded();
          await header.clickTopLevelNavLink(topLink);
        });

        await test.step(`Validate ${topLink.name} page`, async () => {
          await aboutUsPage.validateTopLevelAboutPage(topLink);
        });
      });
    }
  });
});
