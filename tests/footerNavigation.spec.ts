/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/footerNavigation.spec.ts --project=Chrome
 * Footer navigation validation: Privacy Policy link, social links and the
 * newsletter signup.
 */

import { test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { Footer } from '../pages/Footer';
import { HomePage } from '../pages/HomePage';
import { annotate, Severity } from '../utils/allureMeta';

// The footer checks below are structural — footer visible with a Privacy Policy
// link, social hrefs absolute, newsletter rejects a bad email — and use no
// per-country data. The suite is therefore reported under ALL and runs once per
// invocation instead of repeating identical assertions in every location pass
// (see config/locations/locationAgnosticSpecs.ts). It still opens whichever
// country LOCATION selects, so a direct `LOCATION=CAN` run checks the CAN footer.
const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

test.describe('Footer Navigation - ALL', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await annotate({
      location: 'ALL',
      feature: 'Footer Navigation',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['regression'],
    });

    await test.step(`Navigate to ${location.country} home page`, async () => {
      await homePage.navigate(locationKey);
      await homePage.verifyPageLoaded();
    });
  });

  test(`@smoke @regression | ALL | Footer should be visible with Privacy Policy link`, async ({
    page,
  }) => {
    const footer = new Footer(page);

    await test.step('Verify footer is loaded correctly', async () => {
      await footer.verifyFooterLoaded();
    });
  });

  test(`@regression | ALL | Footer social links should be present and linked`, async ({ page }) => {
    const footer = new Footer(page);

    await test.step('Verify footer social links', async () => {
      await footer.verifySocialLinks();
    });
  });

  test(`@regression | ALL | Footer newsletter signup should validate email input`, async ({
    page,
  }) => {
    const footer = new Footer(page);

    await test.step('Verify footer newsletter signup', async () => {
      await footer.verifyNewsletterSignup();
    });
  });
});
