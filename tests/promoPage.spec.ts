/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/promoPage.spec.ts --project=Chromium
 * Hometown Heroes Promo Page Tests
 */

import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { PromoPage } from '../pages/PromoPage';

const { envName } = getEnvConfig();

test.describe('Hometown Heroes Promo Page Tests - USA', () => {
  let promoPage: PromoPage;

  test.beforeEach(async ({ page }) => {
    promoPage = new PromoPage(page);

    await test.step('Navigate to Hometown Heroes promo page', async () => {
      await promoPage.navigateToHometownHeroesPromo();
    });
  });

  test('PROMO-001 | @smoke @promo | Validate promo page content and form fields', async () => {
    await test.step('Verify promo page loads with expected USA Orlando content', async () => {
      await promoPage.verifyPageLoaded();
    });

    await test.step('Verify promo form fields are visible', async () => {
      await promoPage.verifyPromoFormFields();
    });
  });

  test('PROMO-002 | @regression @promo-form-required | Validate promo form required field errors', async () => {
    await test.step('Verify required validation errors', async () => {
      await promoPage.validateRequiredFieldErrors();
    });
  });

  test('PROMO-003 | @regression @promo-form-email | Validate promo form invalid email error', async () => {
    await test.step('Verify invalid email validation error', async () => {
      await promoPage.validateInvalidEmailError();
    });
  });

  // test('@regression @STAGE @promo-form-submit Validate promo form successful submission', async () => {
  //   test.skip(
  //     envName === 'PROD',
  //     'Skipping promo form lead submission on PROD environment.'
  //   );

  //   await test.step('Submit promo form with valid data and verify success message', async () => {
  //     await promoPage.verifySuccessfulSubmission();
  //   });
  // });
});
