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

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

test.describe(`Footer Navigation - ${location.country}`, () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await annotate({
      epic: 'Mattamy Homes Website',
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

  test('TC-01 | @smoke @regression | Footer should be visible with Privacy Policy link', async ({
    page,
  }) => {
    const footer = new Footer(page);

    await test.step('Verify footer is loaded correctly', async () => {
      await footer.verifyFooterLoaded();
    });
  });

  test('TC-02 | @regression | Footer social links should be present and linked', async ({
    page,
  }) => {
    const footer = new Footer(page);

    await test.step('Verify footer social links', async () => {
      await footer.verifySocialLinks();
    });
  });

  test('TC-03 | @regression | Footer newsletter signup should validate email input', async ({
    page,
  }) => {
    const footer = new Footer(page);

    await test.step('Verify footer newsletter signup', async () => {
      await footer.verifyNewsletterSignup();
    });
  });
});
