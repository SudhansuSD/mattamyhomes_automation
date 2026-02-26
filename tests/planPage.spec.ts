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

  test('@regression Validate Plan Detail page UI and functionality', async () => {

    await test.step('Verify hero section', async () => {
      await planPage.verifyHeroSection();
    });

    await test.step('Verify breadcrumb navigation', async () => {
      await planPage.verifyBreadcrumb();
    });

    await test.step('Verify price or CTA section', async () => {
      await planPage.verifyPriceOrCTA();
    });

    await test.step('Verify image gallery', async () => {
      await planPage.verifyGallery();
    });

    await test.step('Verify floor plan section', async () => {
      await planPage.verifyFloorPlan();
    });

    await test.step('Verify mortgage form', async () => {
      await planPage.verifyMortgageForm();
    });

    await test.step('Verify community navigation link', async () => {
      await planPage.verifyCommunityNavigation();
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