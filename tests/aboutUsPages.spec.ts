/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/aboutUsPages.spec.ts --project=Chrome
 * Header About Us navigation validation for the configured country experience.
 */

import { test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { TOP_LEVEL_STATIC_LINKS_BY_COUNTRY } from '../config/navigation/countryNavigation';
import { AboutUsPage } from '../pages/AboutUsPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);
const topLevelStaticLinks = TOP_LEVEL_STATIC_LINKS_BY_COUNTRY[locationKey];

test.describe(`Mattamy Homes - ${location.country} Header About Us Links`, () => {
  test.describe('Header Menu Validation', () => {
    test(`TC-01 | @smoke @regression | ${location.country} About Us header menu links should be visible`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'Chrome',
        'Header flyout navigation is validated on desktop Chrome.',
      );

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
      test(`TC-01 | @regression | ${location.country} ${aboutLink.name} page should load with valid UI and functionality`, async ({
        page,
      }, testInfo) => {
        test.skip(
          testInfo.project.name !== 'Chrome',
          'Header flyout navigation is validated on desktop Chrome.',
        );

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

  // Some static About pages are surfaced as top-level nav items rather than in
  // the About flyout for a given country (e.g. Sustainability on CAN). Validate
  // those via their top-level link so coverage matches what the country displays.
  test.describe('Top-Level Static Page Validation', () => {
    for (const topLink of topLevelStaticLinks) {
      test(`TC-01 | @regression | ${location.country} ${topLink.name} top-level page should load with valid UI`, async ({
        page,
      }, testInfo) => {
        test.skip(
          testInfo.project.name !== 'Chrome',
          'Header top-level navigation is validated on desktop Chrome.',
        );

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
