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
    test('MPC-001 | @smoke | Validate MPC page loads with hero content', async () => {
      await mpcPage.validateHeroContent(mpc!.name);
    });
  });

  test.describe('Tab Validation', () => {
    test('MPC-002 | @regression | Validate summary tab content', async () => {
      await mpcPage.validateSummaryTab();
    });

    test('MPC-003 | @regression | Validate home details tab content', async () => {
      await mpcPage.validateHomeDetailsTab();
    });

    test('MPC-004 | @regression | Validate contact and hours tab content', async () => {
      await mpcPage.validateContactHoursTab();
    });
  });

  test.describe('Content Sections', () => {
    test('MPC-005 | @regression | Validate amenities and location convenience sections', async () => {
      await mpcPage.validateAmenityAndLocationSections();
    });

    test('MPC-006 | @regression | Validate community promotion CTA', async () => {
      await mpcPage.validatePromotionCTA(mpc!.url);
    });

    test('MPC-007 | @regression | Validate image gallery if available', async () => {
      await mpcPage.validateImageGalleryIfAvailable();
    });
  });

  test.describe('Neighborhood Cards', () => {
    test('MPC-008 | @regression | Validate neighborhood card details', async () => {
      await mpcPage.validateNeighborhoodCards(mpc!.name, mpc!.url);
    });

    test('MPC-009 | @regression | Validate first neighborhood navigation', async () => {
      await mpcPage.validateFirstNeighborhoodNavigation(mpc!.url);
    });
  });

  /* ==========================================================
     FORM VALIDATION
  ========================================================== */

  test.describe('Form Validation', () => {
    
    /**********Modal form Validation**********/

    test('MPC-010 | @sanity | Validate Get Information CTA opens MPC lead form', async () => {
      await mpcPage.verifyGetInformationCtaOpensLeadForm();
    });

    test('MPC-011 | @sanity | Validate Get Information form required field errors', async () => {
      await mpcPage.validateGetInformationFormEmptyErrors();
    });

    test('MPC-012 | @sanity | Validate Get Information form invalid email format', async () => {
      await mpcPage.validateGetInformationFormInvalidEmail();
    });

    // test('@regression @STAGE Validate Get Information form successful submission', async () => {
    //   test.skip(envName === 'PROD', 'Skipping Get Information form lead submission on PROD environment.');
    //   await mpcPage.verifyGetInformationFormSuccessSubmission();
    // });

    /**********Community Update form Validation**********/

    test('MPC-014 | @sanity | Validate MPC community update form fields', async () => {
      await mpcPage.validateCommunityUpdateFormFields();
    });

    test('MPC-015 | @sanity | Validate MPC community update form required field errors', async () => {
      await mpcPage.validateCommunityUpdateRequiredErrors();
    });

    test('MPC-016 | @sanity | Validate MPC community update form invalid email error', async () => {
      await mpcPage.validateCommunityUpdateInvalidEmail();
    });

    // test('@regression @STAGE Validate successful community update submission', async () => {
    //   test.skip(envName === 'PROD', 'Skipping community update form lead submission on PROD environment.');
    //   await mpcPage.submitCommunityUpdateFormSuccessfully();
    // });
  });

  test('MPC-018 | @regression | Validate MPC page image and video URLs return 200', async () => {
    await mpcPage.validateImageAndVideoUrlsReturn200('MPC page');
  });
});
