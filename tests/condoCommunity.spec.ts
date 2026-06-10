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
    test('CONDOCOMMUNITY-001 | @smoke | Validate condo community page loads from home search', async () => {
      await condoCommunityPage.verifyHeroContent(condoCommunity!);
    });
  });

  test.describe('Content Validation', () => {
    test('CONDOCOMMUNITY-002 | @regression | Validate condo community content sections', async () => {
      await condoCommunityPage.verifyCondoPageSections();
    });

    test('CONDOCOMMUNITY-003 | @regression | Validate condo-specific content', async () => {
      await condoCommunityPage.verifyCondoSpecificContent();
    });

    test('CONDOCOMMUNITY-004 | @regression | Validate suite or floorplan content', async () => {
      await condoCommunityPage.verifySuiteOrFloorplanContent();
    });

    test('CONDOCOMMUNITY-005 | @regression | Validate available condo floorplans section when available', async () => {
      await condoCommunityPage.verifyAvailableFloorplansSection(condoCommunity!);
    });

    test('CONDOCOMMUNITY-006 | @regression | Validate gallery modal opens, navigates media, and closes when available', async () => {
      await condoCommunityPage.verifyGalleryModalIfAvailable();
    });
  });

  test.describe('Navigation and CTAs', () => {
    test('CONDOCOMMUNITY-007 | @regression | Validate all navigation links', async () => {
      await condoCommunityPage.verifyAllNavigationLinks();
    });

    test('CONDOCOMMUNITY-008 | @regression | Validate primary register/contact CTAs', async () => {
      await condoCommunityPage.verifyPrimaryCtas();
    });
  });

  /* ==========================================================
         FORM VALIDATION
      ========================================================== */

  test.describe('Lead Form Validation', () => {

    /**********Modal form Validation**********/

    test('CONDOCOMMUNITY-009 | @sanity | Validate Get Information CTA opens condo community lead form', async () => {
      await condoCommunityPage.verifyGetInformationCtaOpensLeadForm();
    });

    test('CONDOCOMMUNITY-010 | @sanity | Validate Get Information form required field errors', async () => {
      await condoCommunityPage.validateGetInformationFormEmptyErrors();
    });

    test('CONDOCOMMUNITY-011 | @sanity | Validate Get Information form invalid email format', async () => {
      await condoCommunityPage.validateGetInformationFormInvalidEmail();
    });

    // test('@regression @STAGE Validate Get Information form successful submission', async () => {
    //   test.skip(envName === 'PROD', 'Skipping Get Information form lead submission on PROD environment.');
    //   await condoCommunityPage.verifyGetInformationFormSuccessSubmission();
    // });

    /**********Primary form Validation**********/

    test('CONDOCOMMUNITY-013 | @sanity | Validate primary condo form fields', async () => {
      await condoCommunityPage.validatePrimaryFormFields();
    });

    test('CONDOCOMMUNITY-014 | @sanity | Validate primary condo form invalid email error', async () => {
      await condoCommunityPage.validatePrimaryFormInvalidEmailError();
    });

    test('CONDOCOMMUNITY-015 | @sanity | Validate primary condo form required field errors', async () => {
      await condoCommunityPage.validatePrimaryFormRequiredErrors();
    });

    // test('@regression @STAGE Validate primary condo form successful submission', async () => {
    //   test.skip(envName === 'PROD', 'Skipping primary condo form lead submission on PROD environment.');
    //   await condoCommunityPage.verifyPrimaryFormSuccessSubmission();
    // });

    /*******Footer form Validation**********/

    test('CONDOCOMMUNITY-017 | @sanity | Validate footer condo form fields', async () => {
      await condoCommunityPage.validateFooterFormFields();
    });

    test('CONDOCOMMUNITY-018 | @sanity | Validate footer condo form required field errors', async () => {
      await condoCommunityPage.validateFooterFormRequiredErrors();
    });

    test('CONDOCOMMUNITY-019 | @sanity | Validate footer condo form invalid email error', async () => {
      await condoCommunityPage.validateFooterFormInvalidEmailError();
    });

    // test('@regression @STAGE Validate footer condo form successful submission', async () => {
    //   test.skip(envName === 'PROD', 'Skipping footer condo form lead submission on PROD environment.');
    //   await condoCommunityPage.verifyFooterFormSuccessSubmission();
    // });
  });
});
