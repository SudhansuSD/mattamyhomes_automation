/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/aboutUsPages.spec.ts --project=Chromium
 * Header About Us navigation validation for the configured country experience.
 */

import { test } from '@playwright/test';
import { AboutUsPage } from '../pages/AboutUsPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';
import { getLocationConfig, getLocationKey } from '../config/locations';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

test.describe(`Mattamy Homes - ${location.country} Header About Us Links`, () => {
  test(`@smoke @regression ${location.country} About Us header menu links should be visible`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Chromium', 'Header flyout navigation is validated on desktop Chromium.');

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

  for (const aboutLink of location.aboutUsLinks) {
    test(`@regression ${location.country} ${aboutLink.name} page should load with valid UI and functionality`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'Chromium', 'Header flyout navigation is validated on desktop Chromium.');

      const homePage = new HomePage(page);
      const header = new Header(page);
      const aboutUsPage = new AboutUsPage(page);

      await test.step(`Navigate to ${location.country} home page`, async () => {
        await homePage.navigate(locationKey);
        await homePage.verifyPageLoaded();
      });

      await test.step(`Open and validate ${aboutLink.name} page UI and functionality`, async () => {
        await header.openAboutUsMenu();
        await header.clickAboutUsMenuLink(aboutLink);
        await aboutUsPage.validateAboutPage(aboutLink);
      });
    });
  }
});
