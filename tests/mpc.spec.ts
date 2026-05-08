import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { MPCPage, MPCConfig } from '../pages/MPCPage';

const location = getLocationConfig();
const mpc = location.country === 'USA' && 'mpc' in location
  ? location.mpc as MPCConfig
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
    test('@smoke Validate MPC page loads with hero content', async () => {
      await mpcPage.validateHeroContent(mpc!.name);
    });
  });

  test.describe('Tab Validation', () => {
    test('@regression Validate summary tab content', async () => {
      await mpcPage.validateSummaryTab();
    });

    test('@regression Validate home details tab content', async () => {
      await mpcPage.validateHomeDetailsTab();
    });

    test('@regression Validate contact and hours tab content', async () => {
      await mpcPage.validateContactHoursTab();
    });
  });

  test.describe('Content Sections', () => {
    test('@regression Validate amenities and location convenience sections', async () => {
      await mpcPage.validateAmenityAndLocationSections();
    });

    test('@regression Validate community promotion CTA', async () => {
      await mpcPage.validatePromotionCTA(mpc!.url);
    });

    test('@regression Validate image gallery if available', async () => {
      await mpcPage.validateImageGalleryIfAvailable();
    });
  });

  test.describe('Neighborhood Cards', () => {
    test('@regression Validate neighborhood card details', async () => {
      await mpcPage.validateNeighborhoodCards(mpc!.name, mpc!.url);
    });

    test('@regression Validate first neighborhood navigation', async () => {
      await mpcPage.validateFirstNeighborhoodNavigation(mpc!.url);
    });
  });

  test.describe('Community Update Form', () => {
    test('@sanity Validate community update form fields', async () => {
      await mpcPage.validateCommunityUpdateFormFields();
    });

    test('@sanity Validate required field errors', async () => {
      await mpcPage.validateCommunityUpdateRequiredErrors();
    });

    test('@sanity Validate invalid email error', async () => {
      await mpcPage.validateCommunityUpdateInvalidEmail();
    });

    // test('@regression @STAGE Validate successful community update submission', async () => {
    //   await mpcPage.submitCommunityUpdateFormSuccessfully();
    // });
  });
});
