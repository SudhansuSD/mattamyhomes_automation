/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/promoPage.spec.ts --project=Chrome
 * Promo Page Tests - one pass per location, driven by `promoURL` in locationConfig
 */

import { test } from '@playwright/test';
import {
  getLeadSubmissionSkipReason,
  isLeadSubmissionBlocked,
} from '../config/environments/leadSubmissionPolicy';
import { getLocationConfig } from '../config/locations/locationConfig';
import { PromoPage } from '../pages/PromoPage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

const location = getLocationConfig();

test.describe(`Promo Page Tests - ${location.country}`, () => {
  // A country with no promotion running declares promoURL: null in locationConfig.
  test.skip(!location.promoURL, `No promo URL configured for ${location.country}`);

  let promoPage: PromoPage;

  test.beforeEach(async ({ page }) => {
    promoPage = new PromoPage(page);

    await annotate({
      location: location.country,
      feature: 'Promo Page',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['smoke', 'regression'],
    });

    await test.step('Open home page and navigate to promo page', async () => {
      await promoPage.navigateToPromo();
    });
  });

  test.describe('Promo Page Validation', () => {
    test(`@smoke @regression @promo | ${location.country} | Validate promo page content and form fields`, async () => {
      await test.step('Verify promo page loads with expected content', async () => {
        await promoPage.verifyPageLoaded();
      });

      await test.step('Verify promo form fields are visible', async () => {
        await promoPage.verifyPromoFormFields();
      });
    });

    test(`@regression @promo-form-required | ${location.country} | Validate promo form required field errors`, async () => {
      await test.step('Verify required validation errors', async () => {
        await promoPage.validateRequiredFieldErrors();
      });
    });

    test(`@regression @promo-form-email | ${location.country} | Validate promo form invalid email error`, async () => {
      await test.step('Verify invalid email validation error', async () => {
        await promoPage.validateInvalidEmailError();
      });
    });
  });

  test.describe('Promo form submission', () => {
    test.skip(isLeadSubmissionBlocked(), getLeadSubmissionSkipReason() ?? '');

    test(`@regression @lead-submit @STAGE @promo-form-submit | ${location.country} | Validate promo form successful submission`, async () => {
      await test.step('Submit promo form with valid data and verify success message', async () => {
        await promoPage.verifySuccessfulSubmission();
      });
    });
  });
});
