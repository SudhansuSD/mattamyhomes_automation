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
import { annotate, Severity } from '../utils/allureMeta';

// Condos are a Canada-only offering, so this suite always uses CAN data and
// CondoPlanPage always drives the Canadian site — running it under LOCATION=USA
// (or with no LOCATION) still exercises condo plans instead of skipping.
const location = getLocationConfig('CAN');
const { envName } = getEnvConfig();
const condoPlan = 'condoPlan' in location ? location.condoPlan : undefined;

test.describe(`Condo Plan Page - ${location.country}`, () => {
  let condoPlanPage: CondoPlanPage;

  test.skip(!condoPlan, 'Condo plan is not configured for this environment');

  test.beforeEach(async ({ page }) => {
    condoPlanPage = new CondoPlanPage(page);

    await annotate({
      location: location.country,
      feature: 'Condo Plan Page',
      owner: 'QA Automation',
      severity: Severity.CRITICAL,
      tags: ['smoke', 'regression'],
    });

    await test.step(`Search and validate condo plan: ${condoPlan?.name}`, async () => {
      await condoPlanPage.searchAndValidateByValue('condoPlan', condoPlan!.name);
    });
  });

  test.describe('Page Load and Hero', () => {
    test(`@smoke @regression | ${location.country} | Validate condo plan page URL, title, and hero`, async () => {
      await test.step('Verify condo plan page URL and title', async () => {
        await condoPlanPage.verifyUrlAndTitle(condoPlan!);
      });
      await test.step('Verify condo plan hero summary', async () => {
        await condoPlanPage.verifyHeroSummary(condoPlan!);
      });
    });

    test(`@regression | ${location.country} | Validate condo plan breadcrumb`, async () => {
      await test.step('Validate condo plan breadcrumb', async () => {
        await condoPlanPage.verifyBreadcrumb(condoPlan!);
      });
    });
  });

  test.describe('Content Validation', () => {
    test(`@regression | ${location.country} | Validate condo plan details content`, async () => {
      await test.step('Validate condo plan details content', async () => {
        await condoPlanPage.verifyCondoPlanDetailsContent();
      });
    });

    test(`@regression | ${location.country} | Validate floorplan image`, async () => {
      await test.step('Validate floorplan image', async () => {
        await condoPlanPage.verifyFloorplanImage();
      });
    });

    test(`@regression | ${location.country} | Validate mortgage calculator CTA`, async () => {
      await test.step('Validate mortgage calculator CTA', async () => {
        await condoPlanPage.verifyMortgageCalculatorCta();
      });
      await test.step('Verify support headline', async () => {
        await condoPlanPage.verifySupportHeadline();
      });
    });
  });

  test.describe('Available Floorplans', () => {
    test(`@regression | ${location.country} | Validate related condo floorplans and View All CTA`, async () => {
      await test.step('Validate related condo floorplans and View All CTA', async () => {
        await condoPlanPage.verifyAvailableFloorplans(condoPlan!);
      });
    });

    test(`@regression | ${location.country} | Validate Show More floorplans control when present`, async () => {
      await test.step('Validate Show More floorplans control when present', async () => {
        await condoPlanPage.verifyShowMoreFloorplansIfPresent();
      });
    });
  });

  test.describe('Contact and Navigation', () => {
    test(`@regression | ${location.country} | Validate contact us and hours sections`, async () => {
      await test.step('Validate contact us section', async () => {
        await condoPlanPage.verifyContactUsSection();
      });
      await test.step('Validate hours section', async () => {
        await condoPlanPage.verifyHoursSection();
      });
    });

    test(`@regression | ${location.country} | Validate page navigation links`, async () => {
      await test.step('Validate page navigation links', async () => {
        await condoPlanPage.verifyNavigationLinks();
      });
    });
  });

  test.describe('Community Updates Form - No Submit', () => {
    test(`@regression | ${location.country} | Validate Get Information CTA opens condo plan side modal form`, async () => {
      await test.step('Validate Get Information CTA opens condo plan side modal form', async () => {
        await condoPlanPage.verifyGetInformationCtaOpensLeadForm();
      });
    });

    test(`@smoke @regression | ${location.country} | Validate Get Information side modal form fields`, async () => {
      await test.step('Validate Get Information side modal form fields', async () => {
        await condoPlanPage.verifySideModalFormFields();
      });
    });

    test(`@regression | ${location.country} | Validate Get Information side modal form required field errors`, async () => {
      await test.step('Validate Get Information side modal form required field errors', async () => {
        await condoPlanPage.validateSideModalFormRequiredErrors();
      });
    });

    test(`@regression | ${location.country} | Validate Get Information side modal form invalid email error`, async () => {
      await test.step('Validate Get Information side modal form invalid email error', async () => {
        await condoPlanPage.validateSideModalFormInvalidEmail();
      });
    });

    test.describe('Community updates form submission', () => {
      test.skip(
        envName === 'PROD',
        'Skipping condo plan form lead submission on PROD environment.',
      );

      test(`@regression @STAGE | ${location.country} | Validate Get Information side modal form successful submission`, async () => {
        await test.step('Validate Get Information side modal form successful submission', async () => {
          await condoPlanPage.verifySideModalFormSuccessfulSubmission();
        });
      });
    });
  });

  test.describe('Media Validation', () => {
    test(`@regression | ${location.country} | Validate condo plan page image and video URLs return 200`, async () => {
      await test.step('Validate condo plan page image and video URLs return 200', async () => {
        await condoPlanPage.validateImageAndVideoUrlsReturn200('Condo plan page');
      });
    });
  });
});
