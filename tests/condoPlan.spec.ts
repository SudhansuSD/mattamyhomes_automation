/**
 * ENV=PROD LOCATION=CAN npx playwright test tests/condoPlan.spec.ts
 * Condo Plan Page Tests
 * Searches configured Canada condo plan from the home page.
 *
 * NOTE: Live lead forms must not be submitted.
 * Submit-based form scenarios are intentionally skipped/commented below.
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { CondoPlanPage } from '../pages/CondoPlanPage';

const location = getLocationConfig();
const condoPlan = location.country === 'CAN' && 'condoPlan' in location
  ? location.condoPlan
  : undefined;

test.describe(`Condo Plan Page - ${location.country}`, () => {
  let condoPlanPage: CondoPlanPage;

  test.skip(location.country !== 'CAN', 'Condo plans are available only for Canada location');
  test.skip(!condoPlan, 'Condo plan is not configured for this location');

  test.beforeEach(async ({ page }) => {
    condoPlanPage = new CondoPlanPage(page);

    await test.step('Navigate to Canada home page', async () => {
      await condoPlanPage.navigate();
    });

    await test.step(`Search condo plan: ${condoPlan?.name}`, async () => {
      await condoPlanPage.searchByCondoPlan(condoPlan!.name);
      await condoPlanPage.verifySearchByCondoPlan(condoPlan!);
    });
  });

  test.describe('Page Load and Hero', () => {
    test('@smoke Validate condo plan page URL, title, and hero', async () => {
      await condoPlanPage.verifyUrlAndTitle(condoPlan!);
      await condoPlanPage.verifyHeroSummary(condoPlan!);
    });

    test('@regression Validate condo plan breadcrumb', async () => {
      await condoPlanPage.verifyBreadcrumb(condoPlan!);
    });
  });

  test.describe('Content Validation', () => {
    test('@regression Validate condo plan details content', async () => {
      await condoPlanPage.verifyCondoPlanDetailsContent();
    });

    test('@regression Validate floorplan image', async () => {
      await condoPlanPage.verifyFloorplanImage();
    });

    test('@regression Validate mortgage calculator CTA', async () => {
      await condoPlanPage.verifyMortgageCalculatorCta();
      await condoPlanPage.verifySupportHeadline();
    });
  });

  test.describe('Available Floorplans', () => {
    test('@regression Validate related condo floorplans and View All CTA', async () => {
      await condoPlanPage.verifyAvailableFloorplans(condoPlan!);
    });

    test('@regression Validate Show More floorplans control when present', async () => {
      await condoPlanPage.verifyShowMoreFloorplansIfPresent();
    });
  });

  test.describe('Contact and Navigation', () => {
    test('@regression Validate contact us and hours sections', async () => {
      await condoPlanPage.verifyContactUsSection();
      await condoPlanPage.verifyHoursSection();
    });

    test('@regression Validate Get Information CTA scrolls to form without submitting', async () => {
      await condoPlanPage.verifyGetInformationCtaScrollsToForm();
    });

    test('@regression Validate page navigation links', async () => {
      await condoPlanPage.verifyNavigationLinks();
    });
  });

  test.describe('Community Updates Form - No Submit', () => {
    test('@sanity Validate community updates form fields only', async () => {
      await condoPlanPage.verifyCommunityUpdateFormFields();
    });

    test.skip('@sanity Validate required field errors - skipped to avoid submitting form', async () => {
      await condoPlanPage.validateCommunityUpdateRequiredErrors();
    });

    test.skip('@sanity Validate invalid email error - skipped to avoid submitting form', async () => {
      await condoPlanPage.validateCommunityUpdateInvalidEmail();
    });

    test('@regression @STAGE Validate successful form submission', async () => {
      await condoPlanPage.verifyCommunityUpdateSuccessfulSubmission();
    });
  });
});
