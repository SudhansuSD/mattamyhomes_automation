/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/aboutUsPages.spec.ts --project=Chromium
 * Header About Us navigation validation for the configured country experience.
 */

import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { AboutUsPage } from '../pages/AboutUsPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);
const { baseURL } = getEnvConfig();

test.describe(`Mattamy Homes - ${location.country} Header About Us Links`, () => {
  test(`ABOUTUS-001 | @smoke @regression | ${location.country} About Us header menu links should be visible`, async ({ page }, testInfo) => {
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
    test(`ABOUTUS-002 | @regression | ${location.country} ${aboutLink.name} page should load with valid UI and functionality`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'Chromium', 'Header flyout navigation is validated on desktop Chromium.');

      const homePage = new HomePage(page);
      const aboutUsPage = new AboutUsPage(page);

      await test.step(`Navigate directly to ${aboutLink.name} page`, async () => {
        await page.goto(`${baseURL}${aboutLink.url}?${location.queryParam}`, {
          waitUntil: 'domcontentloaded',
          timeout: 90_000
        });
        await homePage.acceptCookiesIfPresent();
      });

      await test.step(`Validate ${aboutLink.name} page UI and functionality`, async () => {
        await aboutUsPage.validateAboutPage(aboutLink);
      });
    });
  }
});
