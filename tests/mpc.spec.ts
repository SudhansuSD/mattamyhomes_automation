import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { MPCConfig, MPCPage } from '../pages/MPCPage';
import { annotate, Severity } from '../utils/allureMeta';

// Master-Planned Communities are a USA-only offering, so this suite always uses
// USA data and MPCPage always drives the USA site — running it under LOCATION=CAN
// (or with no LOCATION at all) still exercises MPC instead of skipping it.
const location = getLocationConfig('USA');
const { envName } = getEnvConfig();
const mpc = ('mpc' in location ? location.mpc?.[0] : undefined) as MPCConfig | undefined;

test.describe(`MPC page tests - ${location.country}`, () => {
  let mpcPage: MPCPage;

  test.skip(!mpc, 'MPC configuration is not available for this environment');

  test.beforeEach(async ({ page }) => {
    mpcPage = new MPCPage(page);

    await annotate({
      location: location.country,
      feature: 'Master Planned Community Page',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['smoke', 'regression'],
    });

    await test.step('Navigate to MPC page', async () => {
      await mpcPage.navigateToMPC(mpc!.url);
      await mpcPage.verifyMPCPage(mpc!);
    });
  });

  test.describe('Page Load and Hero', () => {
    test(`@smoke @regression | ${location.country} | Validate MPC page loads with hero content`, async () => {
      await test.step('Validate MPC page loads with hero content', async () => {
        await mpcPage.validateHeroContent(mpc!.name);
      });
    });
  });

  test.describe('Tab Validation', () => {
    test(`@regression | ${location.country} | Validate summary tab content`, async () => {
      await test.step('Validate summary tab content', async () => {
        await mpcPage.validateSummaryTab();
      });
    });

    test(`@regression | ${location.country} | Validate home details tab content`, async () => {
      await test.step('Validate home details tab content', async () => {
        await mpcPage.validateHomeDetailsTab();
      });
    });

    test(`@regression | ${location.country} | Validate contact and hours tab content`, async () => {
      await test.step('Validate contact and hours tab content', async () => {
        await mpcPage.validateContactHoursTab();
      });
    });
  });

  test.describe('Content Sections', () => {
    test(`@regression | ${location.country} | Validate amenities and location convenience sections`, async () => {
      await test.step('Validate amenities and location convenience sections', async () => {
        await mpcPage.validateAmenityAndLocationSections();
      });
    });

    test(`@regression | ${location.country} | Validate community promotion CTA`, async () => {
      await test.step('Validate community promotion CTA', async () => {
        await mpcPage.validatePromotionCTA(mpc!.url);
      });
    });

    test(`@regression | ${location.country} | Validate image gallery if available`, async () => {
      await test.step('Validate image gallery if available', async () => {
        await mpcPage.validateImageGalleryIfAvailable();
      });
    });
  });

  test.describe('Neighborhood Cards', () => {
    test(`@regression | ${location.country} | Validate neighborhood card details`, async () => {
      await test.step('Validate neighborhood card details', async () => {
        await mpcPage.validateNeighborhoodCards(mpc!.name, mpc!.url);
      });
    });

    test(`@regression | ${location.country} | Validate first neighborhood navigation`, async () => {
      await test.step('Validate first neighborhood navigation', async () => {
        await mpcPage.validateFirstNeighborhoodNavigation(mpc!.url);
      });
    });
  });

  // FORM VALIDATION

  test.describe('Form Validation', () => {
    test.describe('Get Information Form Validation', () => {
      test(`@regression | ${location.country} | Validate Get Information CTA opens MPC sideModalForm`, async () => {
        await test.step('Validate Get Information CTA opens MPC sideModalForm', async () => {
          await mpcPage.verifyGetInformationCtaOpensLeadForm();
        });
      });

      test(`@smoke @regression | ${location.country} | Validate MPC sideModalForm fields`, async () => {
        await test.step('Validate MPC sideModalForm fields', async () => {
          await mpcPage.verifySideModalFormFields();
        });
      });

      test(`@regression | ${location.country} | Validate MPC sideModalForm required field errors`, async () => {
        await test.step('Validate MPC sideModalForm required field errors', async () => {
          await mpcPage.validateSideModalFormRequiredErrors();
        });
      });

      test(`@regression | ${location.country} | Validate MPC sideModalForm invalid email format`, async () => {
        await test.step('Validate MPC sideModalForm invalid email format', async () => {
          await mpcPage.validateSideModalFormInvalidEmail();
        });
      });

      test.describe('Get Information form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping Get Information form lead submission on PROD environment.',
        );

        test(`@regression @STAGE | ${location.country} | Validate MPC sideModalForm successful submission`, async () => {
          await test.step('Validate MPC sideModalForm successful submission', async () => {
            await mpcPage.verifySideModalFormSuccessSubmission();
          });
        });
      });
    });

    test.describe('Community Update Form Validation', () => {
      test(`@smoke @regression | ${location.country} | Validate MPC community update form fields`, async () => {
        await test.step('Validate MPC community update form fields', async () => {
          await mpcPage.validateCommunityUpdateFormFields();
        });
      });

      test(`@regression | ${location.country} | Validate MPC community update form required field errors`, async () => {
        await test.step('Validate MPC community update form required field errors', async () => {
          await mpcPage.validateCommunityUpdateRequiredErrors();
        });
      });

      test(`@regression | ${location.country} | Validate MPC community update form invalid email error`, async () => {
        await test.step('Validate MPC community update form invalid email error', async () => {
          await mpcPage.validateCommunityUpdateInvalidEmail();
        });
      });

      test.describe('Community update form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping community update form lead submission on PROD environment.',
        );

        test(`@regression @STAGE | ${location.country} | Validate successful community update submission`, async () => {
          await test.step('Validate successful community update submission', async () => {
            await mpcPage.submitCommunityUpdateFormSuccessfully();
          });
        });
      });
    });
  });

  test.describe('Media Validation', () => {
    test(`@regression | ${location.country} | Validate MPC page image and video URLs return 200`, async () => {
      await test.step('Validate MPC page image and video URLs return 200', async () => {
        await mpcPage.validateImageAndVideoUrlsReturn200('MPC page');
      });
    });
  });
});
