/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/planDetail.spec.ts
 * Plan Detail Page Tests
 * @file tests/planDetail.spec.ts
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { PlanDetailPage } from '../pages/PlanDetailPage';

const location = getLocationConfig();

test.describe(`Plan Detail Page Tests - ${location.country}`, () => {

  let planPage: PlanDetailPage;

  /* -------------------------------------------------------
     Common Setup
  -------------------------------------------------------- */

  test.beforeEach(async ({ page }) => {
    planPage = new PlanDetailPage(page);

    await test.step('Navigate to Plan Detail page', async () => {
      await planPage.navigate();
      await planPage.searchByPlan(location.planName);
      await planPage.verifySearchByPlan(location.expectedPlanUrlPart);
      await planPage.verifyPageLoaded();
    });
  });

  /* -------------------------------------------------------
     UI & Functional Validation
  -------------------------------------------------------- */

  test('@regression Validate Plan Detail page core content', async () => {

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

  test('@regression Validate Plan Detail page media and interactive sections', async () => {

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

  test('@regression Validate Plan Detail page conversion and contact sections', async () => {

    await test.step('Verify Quick Move-In Homes section when present', async () => {
      await planPage.verifyQuickMoveInHomesSection();
    });

    await test.step('Verify sales office details when present', async () => {
      await planPage.verifySalesOfficeSection();
    });

    await test.step('Verify community updates form fields', async () => {
      await planPage.verifyCommunityUpdatesForm();
    });

  });

  /* -------------------------------------------------------
     QMI Section Validation
  -------------------------------------------------------- */

  test('@prod @regression Verify QMI Section on Plan Detail page', async () => {

    await test.step('Verify QMI section is displayed and functional', async () => {
      await planPage.verifyQMISection();
    });

  });

});
