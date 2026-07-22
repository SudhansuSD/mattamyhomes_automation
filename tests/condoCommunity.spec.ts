import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { CondoCommunityPage } from '../pages/CondoCommunityPage';


const location = getLocationConfig();
const { envName } = getEnvConfig();
const condoCommunity = location.country === 'CAN' && 'condoCommunity' in location
  ? location.condoCommunity
  : undefined;

test.describe(`Condo Community Detail - ${location.country}`, () => {
  let condoCommunityPage: CondoCommunityPage;

  test.skip(location.country !== 'CAN', 'Condo communities are available only for Canada location');
  test.skip(!condoCommunity, 'Condo community is not configured for this location');

  test.beforeEach(async ({ page }) => {
    condoCommunityPage = new CondoCommunityPage(page);

    await test.step(`Search and validate condo community: ${condoCommunity}`, async () => {
      await condoCommunityPage.searchAndValidateByValue('condoCommunity', condoCommunity!);
    });
  });

  test.describe('Page Load and Hero', () => {
    test('TC-01 | @smoke @regression | Validate condo community page loads from home search', async () => {
      await condoCommunityPage.verifyHeroContent(condoCommunity!);
    });
  });

  test.describe('Content Validation', () => {
    test('TC-01 | @regression | Validate condo community content sections', async () => {
      await condoCommunityPage.verifyCondoPageSections();
    });

    test('TC-02 | @regression | Validate condo-specific content', async () => {
      await condoCommunityPage.verifyCondoSpecificContent();
    });

    test('TC-03 | @regression | Validate suite or floorplan content', async () => {
      await condoCommunityPage.verifySuiteOrFloorplanContent();
    });

    test('TC-04 | @regression | Validate available condo floorplans section when available', async () => {
      await condoCommunityPage.verifyAvailableFloorplansSection(condoCommunity!);
    });

    test('TC-05 | @regression | Validate gallery modal opens, navigates media, and closes when available', async () => {
      await condoCommunityPage.verifyGalleryModalIfAvailable();
    });
  });

  test.describe('Navigation and CTAs', () => {
    test('TC-01 | @regression | Validate all navigation links', async () => {
      await condoCommunityPage.verifyAllNavigationLinks();
    });

    test('TC-02 | @regression | Validate primary register/contact CTAs', async () => {
      await condoCommunityPage.verifyPrimaryCtas();
    });
  });

  /* ==========================================================
         FORM VALIDATION
      ========================================================== */

  test.describe('Lead Form', () => {
    test.describe('Get Information Form Validation', () => {
      test('TC-01 | @regression | Validate Get Information CTA opens condo community sideModalForm', async () => {
        await condoCommunityPage.verifyGetInformationCtaOpensLeadForm();
      });

      test('TC-02 | @smoke @regression | Validate condo community sideModalForm fields', async () => {
        await condoCommunityPage.verifySideModalFormFields();
      });

      test('TC-03 | @regression | Validate condo community sideModalForm required field errors', async () => {
        await condoCommunityPage.validateSideModalFormRequiredErrors();
      });

      test('TC-04 | @regression | Validate condo community sideModalForm invalid email format', async () => {
        await condoCommunityPage.validateSideModalFormInvalidEmail();
      });

      test.describe('Get Information form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping Get Information form lead submission on PROD environment.'
        );

        test('TC-01 | @regression @STAGE | Validate condo community sideModalForm successful submission', async () => {
          await condoCommunityPage.verifySideModalFormSuccessSubmission();
        });
      });
    });

    test.describe('Primary Condo Form Validation', () => {
      test('TC-01 | @smoke @regression | Validate primary condo form fields', async () => {
        await condoCommunityPage.validatePrimaryFormFields();
      });

      test('TC-02 | @regression | Validate primary condo form invalid email error', async () => {
        await condoCommunityPage.validatePrimaryFormInvalidEmailError();
      });

      test('TC-03 | @regression | Validate primary condo form required field errors', async () => {
        await condoCommunityPage.validatePrimaryFormRequiredErrors();
      });

      test.describe('Primary condo form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping primary condo form lead submission on PROD environment.'
        );

        test('TC-01 | @regression @STAGE | Validate primary condo form successful submission', async () => {
          await condoCommunityPage.verifyPrimaryFormSuccessSubmission();
        });
      });
    });

    test.describe('Footer Condo Form Validation', () => {
      test('TC-01 | @smoke @regression | Validate footer condo form fields', async () => {
        await condoCommunityPage.validateFooterFormFields();
      });

      test('TC-02 | @regression | Validate footer condo form required field errors', async () => {
        await condoCommunityPage.validateFooterFormRequiredErrors();
      });

      test('TC-03 | @regression | Validate footer condo form invalid email error', async () => {
        await condoCommunityPage.validateFooterFormInvalidEmailError();
      });

      test.describe('Footer condo form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping footer condo form lead submission on PROD environment.'
        );

        test('TC-01 | @regression @STAGE | Validate footer condo form successful submission', async () => {
          await condoCommunityPage.verifyFooterFormSuccessSubmission();
        });
      });
    });
  });

  test.describe('Media Validation', () => {
    test('TC-01 | @regression | Validate condo community page image and video URLs return 200', async () => {
      await condoCommunityPage.validateImageAndVideoUrlsReturn200('Condo community page');
    });
  });
});
