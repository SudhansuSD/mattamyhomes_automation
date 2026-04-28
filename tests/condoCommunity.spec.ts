import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { CondoCommunityPage } from '../pages/CondoCommunityPage';

const location = getLocationConfig();
const condoCommunity = location.country === 'CAN' && 'condoCommunity' in location
  ? location.condoCommunity
  : undefined;

test.describe(`Condo Community Detail - ${location.country}`, () => {
  let condoCommunityPage: CondoCommunityPage;

  test.skip(location.country !== 'CAN', 'Condo communities are available only for Canada location');
  test.skip(!condoCommunity, 'Condo community is not configured for this location');

  test.beforeEach(async ({ page }) => {
    condoCommunityPage = new CondoCommunityPage(page);

    await test.step('Navigate to Canada home page', async () => {
      await condoCommunityPage.navigate();
    });

    await test.step(`Search condo community: ${condoCommunity}`, async () => {
      await condoCommunityPage.searchByCondoCommunity(condoCommunity!);
      await condoCommunityPage.verifySearchByCondoCommunity(condoCommunity!);
    });
  });

  test.describe('Page Load and Hero', () => {
    test('@smoke Validate condo community page loads from home search', async () => {
      await condoCommunityPage.verifyHeroContent(condoCommunity!);
    });
  });

  test.describe('Content Validation', () => {
    test('@regression Validate condo community content sections', async () => {
      await condoCommunityPage.verifyCondoPageSections();
    });

    test('@regression Validate condo-specific content', async () => {
      await condoCommunityPage.verifyCondoSpecificContent();
    });

    test('@regression Validate suite or floorplan content', async () => {
      await condoCommunityPage.verifySuiteOrFloorplanContent();
    });

    test('@regression Validate available condo floorplans section when available', async () => {
      await condoCommunityPage.verifyAvailableFloorplansSection(condoCommunity!);
    });
  });

  test.describe('Navigation and CTAs', () => {
    test('@regression Validate all navigation links', async () => {
      await condoCommunityPage.verifyAllNavigationLinks();
    });

    test('@regression Validate primary register/contact CTAs', async () => {
      await condoCommunityPage.verifyPrimaryCtas();
    });
  });

  test.describe('Lead Form Validation', () => {
    test('@sanity Validate primary condo form fields', async () => {
      await condoCommunityPage.validatePrimaryFormFields();
    });

    test('@sanity Validate footer condo form fields', async () => {
      await condoCommunityPage.validateFooterFormFields();
    });

    test('@sanity Validate primary condo form required field errors', async () => {
      await condoCommunityPage.validatePrimaryFormRequiredErrors();
    });

    test('@sanity Validate footer condo form required field errors', async () => {
      await condoCommunityPage.validateFooterFormRequiredErrors();
    });

    test('@sanity Validate primary condo form invalid email error', async () => {
      await condoCommunityPage.validatePrimaryFormInvalidEmailError();
    });

    test('@sanity Validate footer condo form invalid email error', async () => {
      await condoCommunityPage.validateFooterFormInvalidEmailError();
    });

    // test('@regression @STAGE Validate primary condo form successful submission', async () => {
    //   await condoCommunityPage.verifyPrimaryFormSuccessSubmission();
    // });

    // test('@regression @STAGE Validate footer condo form successful submission', async () => {
    //   await condoCommunityPage.verifyFooterFormSuccessSubmission();
    // });
  });
});
