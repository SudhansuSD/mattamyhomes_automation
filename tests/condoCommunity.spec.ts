import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { CondoCommunityPage } from '../pages/CondoCommunityPage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

// Condos are a Canada-only offering, so this suite always uses CAN data and
// CondoCommunityPage always drives the Canadian site — running it under
// LOCATION=USA (or with no LOCATION) still exercises condos instead of skipping.
const location = getLocationConfig('CAN');
const { envName } = getEnvConfig();
const condoCommunity = 'condoCommunity' in location ? location.condoCommunity : undefined;

test.describe(`Condo Community Detail - ${location.country}`, () => {
  let condoCommunityPage: CondoCommunityPage;

  test.skip(!condoCommunity, 'Condo community is not configured for this environment');

  test.beforeEach(async ({ page }) => {
    condoCommunityPage = new CondoCommunityPage(page);

    await annotate({
      location: location.country,
      feature: 'Condo Community Page',
      owner: 'QA Automation',
      severity: Severity.CRITICAL,
      tags: ['smoke', 'regression'],
    });

    await test.step(`Search and validate condo community: ${condoCommunity}`, async () => {
      await condoCommunityPage.searchAndValidateByValue('condoCommunity', condoCommunity!);
    });
  });

  test.describe('Page Load and Hero', () => {
    test(`@smoke @regression | ${location.country} | Validate condo community page loads from home search`, async () => {
      await test.step('Validate condo community page loads from home search', async () => {
        await condoCommunityPage.verifyHeroContent(condoCommunity!);
      });
    });
  });

  test.describe('Content Validation', () => {
    test(`@regression | ${location.country} | Validate condo community content sections`, async () => {
      await test.step('Validate condo community content sections', async () => {
        await condoCommunityPage.verifyCondoPageSections();
      });
    });

    test(`@regression | ${location.country} | Validate condo-specific content`, async () => {
      await test.step('Validate condo-specific content', async () => {
        await condoCommunityPage.verifyCondoSpecificContent();
      });
    });

    test(`@regression | ${location.country} | Validate suite or floorplan content`, async () => {
      await test.step('Validate suite or floorplan content', async () => {
        await condoCommunityPage.verifySuiteOrFloorplanContent();
      });
    });

    test(`@smoke @regression | ${location.country} | Validate available condo floorplans section when available`, async () => {
      await test.step('Validate available condo floorplans section when available', async () => {
        await condoCommunityPage.verifyAvailableFloorplansSection(condoCommunity!);
      });
    });

    test(`@regression | ${location.country} | Validate gallery modal opens, navigates media, and closes when available`, async () => {
      await test.step('Validate gallery modal opens, navigates media, and closes when available', async () => {
        await condoCommunityPage.verifyGalleryModal();
      });
    });
  });

  test.describe('Navigation and CTAs', () => {
    test(`@regression | ${location.country} | Validate all navigation links`, async () => {
      await test.step('Validate all navigation links', async () => {
        await condoCommunityPage.verifyAllNavigationLinks();
      });
    });

    test(`@regression | ${location.country} | Validate primary register/contact CTAs`, async () => {
      await test.step('Validate primary register/contact CTAs', async () => {
        await condoCommunityPage.verifyPrimaryCtas();
      });
    });
  });

  // FORM VALIDATION

  test.describe('Lead Form', () => {
    test.describe('Get Information Form Validation', () => {
      test(`@smoke @regression | ${location.country} | Validate Get Information CTA opens condo community sideModalForm`, async () => {
        await test.step('Validate Get Information CTA opens condo community sideModalForm', async () => {
          await condoCommunityPage.verifyGetInformationCtaOpensLeadForm();
        });
      });

      test(`@smoke @regression | ${location.country} | Validate condo community sideModalForm fields`, async () => {
        await test.step('Validate condo community sideModalForm fields', async () => {
          await condoCommunityPage.verifySideModalFormFields();
        });
      });

      test(`@regression | ${location.country} | Validate condo community sideModalForm required field errors`, async () => {
        await test.step('Validate condo community sideModalForm required field errors', async () => {
          await condoCommunityPage.validateSideModalFormRequiredErrors();
        });
      });

      test(`@regression | ${location.country} | Validate condo community sideModalForm invalid email format`, async () => {
        await test.step('Validate condo community sideModalForm invalid email format', async () => {
          await condoCommunityPage.validateSideModalFormInvalidEmail();
        });
      });

      test.describe('Get Information form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping Get Information form lead submission on PROD environment.',
        );

        test(`@regression @lead-submit @STAGE | ${location.country} | Validate condo community sideModalForm successful submission`, async () => {
          await test.step('Validate condo community sideModalForm successful submission', async () => {
            await condoCommunityPage.verifySideModalFormSuccessSubmission();
          });
        });
      });
    });

    test.describe('Primary Condo Form Validation', () => {
      test(`@smoke @regression | ${location.country} | Validate primary condo form fields`, async () => {
        await test.step('Validate primary condo form fields', async () => {
          await condoCommunityPage.validatePrimaryFormFields();
        });
      });

      test(`@regression | ${location.country} | Validate primary condo form invalid email error`, async () => {
        await test.step('Validate primary condo form invalid email error', async () => {
          await condoCommunityPage.validatePrimaryFormInvalidEmailError();
        });
      });

      test(`@smoke @regression | ${location.country} | Validate primary condo form required field errors`, async () => {
        await test.step('Validate primary condo form required field errors', async () => {
          await condoCommunityPage.validatePrimaryFormRequiredErrors();
        });
      });

      test.describe('Primary condo form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping primary condo form lead submission on PROD environment.',
        );

        test(`@regression @lead-submit @STAGE | ${location.country} | Validate primary condo form successful submission`, async () => {
          await test.step('Validate primary condo form successful submission', async () => {
            await condoCommunityPage.verifyPrimaryFormSuccessSubmission();
          });
        });
      });
    });

    test.describe('Footer Condo Form Validation', () => {
      test(`@smoke @regression | ${location.country} | Validate footer condo form fields`, async () => {
        await test.step('Validate footer condo form fields', async () => {
          await condoCommunityPage.validateFooterFormFields();
        });
      });

      test(`@smoke @regression | ${location.country} | Validate footer condo form required field errors`, async () => {
        await test.step('Validate footer condo form required field errors', async () => {
          await condoCommunityPage.validateFooterFormRequiredErrors();
        });
      });

      test(`@regression | ${location.country} | Validate footer condo form invalid email error`, async () => {
        await test.step('Validate footer condo form invalid email error', async () => {
          await condoCommunityPage.validateFooterFormInvalidEmailError();
        });
      });

      test.describe('Footer condo form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping footer condo form lead submission on PROD environment.',
        );

        test(`@regression @lead-submit @STAGE | ${location.country} | Validate footer condo form successful submission`, async () => {
          await test.step('Validate footer condo form successful submission', async () => {
            await condoCommunityPage.verifyFooterFormSuccessSubmission();
          });
        });
      });
    });
  });

  test.describe('Media Validation', () => {
    test(`@regression | ${location.country} | Validate condo community page image and video URLs return 200`, async () => {
      await test.step('Validate condo community page image and video URLs return 200', async () => {
        await condoCommunityPage.validateImageAndVideoUrlsReturn200('Condo community page');
      });
    });
  });
});
