import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { MPCConfig, MPCPage } from '../pages/MPCPage';

const location = getLocationConfig();
const { envName } = getEnvConfig();
const mpc = location.country === 'USA' && 'mpc' in location
  ? location.mpc?.[0] as MPCConfig | undefined
  : undefined;

test.describe(`MPC page tests - ${location.country}`, () => {
  let mpcPage: MPCPage;

  test.skip(location.country !== 'USA', 'MPC pages are available only for USA location');
  test.skip(!mpc, 'MPC configuration is not available for this location');

  test.beforeEach(async ({ page }) => {
    mpcPage = new MPCPage(page);

    await test.step('Navigate to MPC page', async () => {
      await mpcPage.navigateToMPC(mpc!.url);
      await mpcPage.verifyMPCPage(mpc!);
    });
  });

  test.describe('Page Load and Hero', () => {
    test('TC-01 | @smoke @regression | Validate MPC page loads with hero content', async () => {
      await mpcPage.validateHeroContent(mpc!.name);
    });
  });

  test.describe('Tab Validation', () => {
    test('TC-01 | @regression | Validate summary tab content', async () => {
      await mpcPage.validateSummaryTab();
    });

    test('TC-02 | @regression | Validate home details tab content', async () => {
      await mpcPage.validateHomeDetailsTab();
    });

    test('TC-03 | @regression | Validate contact and hours tab content', async () => {
      await mpcPage.validateContactHoursTab();
    });
  });

  test.describe('Content Sections', () => {
    test('TC-01 | @regression | Validate amenities and location convenience sections', async () => {
      await mpcPage.validateAmenityAndLocationSections();
    });

    test('TC-02 | @regression | Validate community promotion CTA', async () => {
      await mpcPage.validatePromotionCTA(mpc!.url);
    });

    test('TC-03 | @regression | Validate image gallery if available', async () => {
      await mpcPage.validateImageGalleryIfAvailable();
    });
  });

  test.describe('Neighborhood Cards', () => {
    test('TC-01 | @regression | Validate neighborhood card details', async () => {
      await mpcPage.validateNeighborhoodCards(mpc!.name, mpc!.url);
    });

    test('TC-02 | @regression | Validate first neighborhood navigation', async () => {
      await mpcPage.validateFirstNeighborhoodNavigation(mpc!.url);
    });
  });

  /* ==========================================================
     FORM VALIDATION
  ========================================================== */

  test.describe('Form Validation', () => {
    test.describe('Get Information Form Validation', () => {
      test('TC-01 | @regression | Validate Get Information CTA opens MPC sideModalForm', async () => {
        await mpcPage.verifyGetInformationCtaOpensLeadForm();
      });

      test('TC-02 | @smoke @regression | Validate MPC sideModalForm fields', async () => {
        await mpcPage.verifySideModalFormFields();
      });

      test('TC-03 | @regression | Validate MPC sideModalForm required field errors', async () => {
        await mpcPage.validateSideModalFormRequiredErrors();
      });

      test('TC-04 | @regression | Validate MPC sideModalForm invalid email format', async () => {
        await mpcPage.validateSideModalFormInvalidEmail();
      });

      test.describe('Get Information form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping Get Information form lead submission on PROD environment.'
        );

        test('TC-01 | @regression @STAGE | Validate MPC sideModalForm successful submission', async () => {
          await mpcPage.verifySideModalFormSuccessSubmission();
        });
      });
    });

    test.describe('Community Update Form Validation', () => {
      test('TC-01 | @smoke @regression | Validate MPC community update form fields', async () => {
        await mpcPage.validateCommunityUpdateFormFields();
      });

      test('TC-02 | @regression | Validate MPC community update form required field errors', async () => {
        await mpcPage.validateCommunityUpdateRequiredErrors();
      });

      test('TC-03 | @regression | Validate MPC community update form invalid email error', async () => {
        await mpcPage.validateCommunityUpdateInvalidEmail();
      });

      test.describe('Community update form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping community update form lead submission on PROD environment.'
        );

        test('TC-01 | @regression @STAGE | Validate successful community update submission', async () => {
          await mpcPage.submitCommunityUpdateFormSuccessfully();
        });
      });
    });
  });

  test.describe('Media Validation', () => {
    test('TC-01 | @regression | Validate MPC page image and video URLs return 200', async () => {
      await mpcPage.validateImageAndVideoUrlsReturn200('MPC page');
    });
  });
});
