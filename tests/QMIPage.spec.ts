/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/qmiPage.spec.ts
 * QMI Detail Page Tests
 * @file tests/qmiPage.spec.ts
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { QMIPage } from '../pages/QMIPage';

const location = getLocationConfig();

test.describe(`QMI Detail Page Tests - ${location.country}`, () => {
  let qmiPage: QMIPage;

  test.beforeEach(async ({ page }) => {
    qmiPage = new QMIPage(page);

    await test.step('Search and validate QMI', async () => {
      await qmiPage.searchAndValidateByValue('qmi', location.qmiAddress);
    });
  });

  test('@smoke Validate QMI hero content and URL', async () => {
    await test.step('Verify exact QMI URL', async () => {
      await qmiPage.verifyExactQmiUrl();
    });

    await test.step('Verify hero section content', async () => {
      await qmiPage.verifyHeroSection();
    });

    await test.step('Verify QMI home facts and price', async () => {
      await qmiPage.verifyHeroHomeFacts();
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

    await test.step('Verify interactive floor plan section', async () => {
      await qmiPage.verifyInteractiveFloorPlan();
    });

    await test.step('Verify community sitemap section', async () => {
      await qmiPage.verifyCommunitySitemap();
    });
  });

  test('@regression Validate QMI home details and features', async () => {
    await test.step('Verify home design details content', async () => {
      await qmiPage.verifyHomeDesignDetails();
    });

    await test.step('Verify home features content', async () => {
      await qmiPage.verifyHomeFeatures();
    });
  });

  test('@regression Validate QMI sales office and related homes', async () => {
    await test.step('Verify sales office contact and community update form', async () => {
      await qmiPage.verifySalesOfficeAndContactForm();
    });
  });

  test('@regression @qmi-related-log Validate QMI related homes names and URLs', async () => {
    await test.step('Verify related quick move-in homes section and log name with URL', async () => {
      await qmiPage.verifyRelatedQuickMoveInHomes();
    });
  });

  test('@regression @qmi-form-fields Validate QMI form fields', async () => {
    await test.step('Verify QMI form fields are visible', async () => {
      await qmiPage.validateQmiFormFields();
    });
  });

  test('@regression @qmi-form-required Validate QMI form required field errors', async () => {
    await test.step('Verify QMI form required field validation', async () => {
      await qmiPage.validateQmiFormRequiredErrors();
    });
  });

  test('@regression @qmi-form-email Validate QMI form invalid email validation', async () => {
    await test.step('Verify QMI form invalid email validation', async () => {
      await qmiPage.validateQmiFormInvalidEmail();
    });
  });

  // test('@regression @STAGE @qmi-form-submit Validate QMI form successful submission', async () => {
  //   test.skip(
  //     envName === 'PROD',
  //     'Skipping QMI form lead submission on PROD environment.'
  //   );

  //   await test.step('Submit QMI form with valid data and verify success message', async () => {
  //     await qmiPage.verifyQmiFormSuccessSubmission();
  //   });
  // });

  test('@regression Validate QMI mortgage popup functionality', async () => {
    await test.step('Verify mortgage modal opens and closes', async () => {
      await qmiPage.verifyMortgagePopup();
    });
  });

  test('@regression @qmi-breadcrumb-log Validate QMI breadcrumb names and URLs', async () => {
    await test.step('Verify breadcrumb state and community match QMI path', async () => {
      await qmiPage.verifyBreadcrumbNavigation();
    });

    await test.step('Verify breadcrumb links point to parent paths and current QMI label', async () => {
      await qmiPage.verifyBreadcrumbLinks();
    });
  });

});
