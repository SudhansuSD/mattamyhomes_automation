/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/planDetail.spec.ts
 * Plan Detail Page Tests
 * @file tests/planDetail.spec.ts
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { PlanDetailPage } from '../pages/PlanDetailPage';

const location = getLocationConfig();

test.describe(`Plan Detail Page Tests - ${location.country}`, () => {

  let planPage: PlanDetailPage;

  /* -------------------------------------------------------
     Common Setup
  -------------------------------------------------------- */

  test.beforeEach(async ({ page }) => {
    planPage = new PlanDetailPage(page);

    await test.step('Search and validate Plan', async () => {
      await planPage.searchAndValidateByValue('plan', location.planName);
    });
  });
  /* -------------------------------------------------------
     UI & Functional Validation
  -------------------------------------------------------- */

  test('PLAN-001 | @regression | Validate Plan Detail page core content', async () => {

    await test.step('Verify plan URL contains configured plan path', async () => {
      await planPage.verifyPlanUrlContains(location.expectedPlanUrlPart);
    });

    await test.step('Verify hero shows configured plan name', async () => {
      await planPage.verifyHeroSummaryForPlan(location.planName);
    });

    await test.step('Verify plan home specs are present', async () => {
      await planPage.verifyHomeSpecsPresent();
    });

    await test.step('Verify breadcrumb includes plan name', async () => {
      await planPage.verifyBreadcrumbContainsPlan(location.planName);
    });

    await test.step('Verify image gallery', async () => {
      await planPage.verifyGallery();
    });

  });

  test('PLAN-002 | @regression | Validate Plan Detail page media and interactive sections', async () => {

    await test.step('Verify interactive floorplan section when present', async () => {
      await planPage.verifyInteractiveFloorPlanSection();
    });

    await test.step('Verify exterior styles section when present', async () => {
      await planPage.verifyExteriorStylesSection();
    });

    await test.step('Verify mortgage calculator CTA when present', async () => {
      await planPage.verifyMortgageCalculatorCta();
    });

  });

  test('PLAN-003 | @regression | Validate Plan Detail page conversion and contact sections', async () => {

    await test.step('Verify Quick Move-In Homes section when present', async () => {
      await planPage.verifyQuickMoveInHomesSection();
    });

    await test.step('Verify sales office details when present', async () => {
      await planPage.verifySalesOfficeSection();
    });

    await test.step('Verify community updates form fields', async () => {
      await planPage.verifyPlanDetailForm();
    });

  });

  test.describe('Form Validation', () => {
    test('PLAN-004 | @sanity | Validate plan detail form required field errors', async () => {
      await planPage.validatePlanDetailFormEmptyErrors();
    });

    test('PLAN-005 | @sanity | Validate plan detail form invalid email format', async () => {
      await planPage.validatePlanDetailFormInvalidEmail();
    });

    // test('@regression @STAGE Validate plan detail form successful submission', async () => {
    //   await planPage.verifyPlanDetailFormSuccessSubmission();
    // });
  });

  /* -------------------------------------------------------
     QMI Section Validation
  -------------------------------------------------------- */

  test('PLAN-007 | @prod @regression | Verify QMI Section on Plan Detail page', async () => {

    await test.step('Verify QMI section is displayed and functional', async () => {
      await planPage.verifyQMISection();
    });

  });

  test('PLAN-008 | @regression | Validate plan page image and video URLs return 200', async () => {
    await planPage.validateImageAndVideoUrlsReturn200('Plan page');
  });

});
