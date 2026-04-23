/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/qmiPage.spec.ts
 * QMI Detail Page Tests
 * @file tests/qmiPage.spec.ts
 */

import { test } from '@playwright/test';
import { QMIPage } from '../pages/QMIPage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

test.describe(`QMI Detail Page Tests - ${location.country}`, () => {
  let qmiPage: QMIPage;

  test.beforeEach(async ({ page }) => {
    qmiPage = new QMIPage(page);

    await test.step('Navigate to QMI detail page', async () => {
      await qmiPage.navigate();
      await qmiPage.searchByQMI(location.qmiAddress);
      await qmiPage.verifySearchByQMI(location.qmiAddress);
      await qmiPage.verifyPageLoaded();
    });
  });

  test('@smoke Validate QMI hero content and URL', async () => {
    await test.step('Verify exact QMI URL', async () => {
      await qmiPage.verifyExactQmiUrl();
    });

    await test.step('Verify hero section content', async () => {
      await qmiPage.verifyHeroSection();
    });

    await test.step('Verify price and Get Information CTA', async () => {
      await qmiPage.verifyPriceOrCTA();
    });

    await test.step('Verify Get Information CTA scrolls to the form section', async () => {
      await qmiPage.verifyGetInformationScrollsToForm();
    });
  });

  test('@regression Validate QMI page media and content sections', async () => {
    await test.step('Verify image gallery functionality', async () => {
      await qmiPage.verifyGallery();
    });

    await test.step('Verify floor plan section', async () => {
      await qmiPage.verifyFloorPlan();
    });
  });

  test('@regression Validate QMI mortgage popup functionality', async () => {
    await test.step('Verify mortgage modal opens and closes', async () => {
      await qmiPage.verifyMortgagePopup();
    });
  });

  test('@regression Validate QMI breadcrumb matches QMI path', async () => {
    await test.step('Verify breadcrumb state and community match QMI path', async () => {
      await qmiPage.verifyBreadcrumbNavigation();
    });
  });

});
