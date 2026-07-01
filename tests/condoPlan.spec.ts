/**
 * ENV=PROD LOCATION=CAN npx playwright test tests/condoPlan.spec.ts
 * Condo Plan Page Tests
 * Searches configured Canada condo plan from the home page.
 *
 * NOTE: Live lead forms must not be submitted.
 * Submit-based form scenarios are intentionally skipped/commented below.
 */

import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { CondoPlanPage } from '../pages/CondoPlanPage';

const location = getLocationConfig();
const { envName } = getEnvConfig();
const condoPlan = location.country === 'CAN' && 'condoPlan' in location
  ? location.condoPlan
  : undefined;

test.describe(`Condo Plan Page - ${location.country}`, () => {
  let condoPlanPage: CondoPlanPage;

  test.skip(location.country !== 'CAN', 'Condo plans are available only for Canada location');
  test.skip(!condoPlan, 'Condo plan is not configured for this location');

  test.beforeEach(async ({ page }) => {
    condoPlanPage = new CondoPlanPage(page);

    await test.step(`Search and validate condo plan: ${condoPlan?.name}`, async () => {
      await condoPlanPage.searchAndValidateByValue('condoPlan', condoPlan!.name);
    });
  });

  test.describe('Page Load and Hero', () => {
    test('TC-01 | @smoke | Validate condo plan page URL, title, and hero', async () => {
      await condoPlanPage.verifyUrlAndTitle(condoPlan!);
      await condoPlanPage.verifyHeroSummary(condoPlan!);
    });

    test('TC-02 | @regression | Validate condo plan breadcrumb', async () => {
      await condoPlanPage.verifyBreadcrumb(condoPlan!);
    });
  });

  test.describe('Content Validation', () => {
    test('TC-01 | @regression | Validate condo plan details content', async () => {
      await condoPlanPage.verifyCondoPlanDetailsContent();
    });

    test('TC-02 | @regression | Validate floorplan image', async () => {
      await condoPlanPage.verifyFloorplanImage();
    });

    test('TC-03 | @regression | Validate mortgage calculator CTA', async () => {
      await condoPlanPage.verifyMortgageCalculatorCta();
      await condoPlanPage.verifySupportHeadline();
    });
  });

  test.describe('Available Floorplans', () => {
    test('TC-01 | @regression | Validate related condo floorplans and View All CTA', async () => {
      await condoPlanPage.verifyAvailableFloorplans(condoPlan!);
    });

    test('TC-02 | @regression | Validate Show More floorplans control when present', async () => {
      await condoPlanPage.verifyShowMoreFloorplansIfPresent();
    });
  });

  test.describe('Contact and Navigation', () => {
    test('TC-01 | @regression | Validate contact us and hours sections', async () => {
      await condoPlanPage.verifyContactUsSection();
      await condoPlanPage.verifyHoursSection();
    });

    test('TC-02 | @regression | Validate Get Information CTA scrolls to form without submitting', async () => {
      await condoPlanPage.verifyGetInformationCtaScrollsToForm();
    });

    test('TC-03 | @regression | Validate page navigation links', async () => {
      await condoPlanPage.verifyNavigationLinks();
    });
  });

  test.describe('Community Updates Form - No Submit', () => {
    test('TC-01 | @sanity | Validate community updates form fields only', async () => {
      await condoPlanPage.verifyCommunityUpdateFormFields();
    });

    test('TC-02 | @sanity | Validate required field errors', async () => {
      await condoPlanPage.validateCommunityUpdateRequiredErrors();
    });

    test('TC-03 | @sanity | Validate invalid email error', async () => {
      await condoPlanPage.validateCommunityUpdateInvalidEmail();
    });

    test.describe('Community updates form submission', () => {
      test.skip(
        envName === 'PROD',
        'Skipping condo plan form lead submission on PROD environment.'
      );

      test('TC-01 | @regression @STAGE | Validate successful form submission', async () => {
        await condoPlanPage.verifyCommunityUpdateSuccessfulSubmission();
      });
    });
  });

  test.describe('Media Validation', () => {
    test('TC-01 | @regression | Validate condo plan page image and video URLs return 200', async () => {
      await condoPlanPage.validateImageAndVideoUrlsReturn200('Condo plan page');
    });
  });
});
