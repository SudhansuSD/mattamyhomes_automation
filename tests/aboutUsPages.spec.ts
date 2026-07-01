/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/aboutUsPages.spec.ts --project=Chrome
 * Header About Us navigation validation for the configured country experience.
 */

import { test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { AboutUsPage } from '../pages/AboutUsPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

test.describe(`Mattamy Homes - ${location.country} Header About Us Links`, () => {
  test.describe('Header Menu Validation', () => {
    test(`TC-01 | @smoke @regression | ${location.country} About Us header menu links should be visible`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'Chrome', 'Header flyout navigation is validated on desktop Chrome.');

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
      test(`TC-01 | @regression | ${location.country} ${aboutLink.name} page should load with valid UI and functionality`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'Chrome', 'Header flyout navigation is validated on desktop Chrome.');

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
});
