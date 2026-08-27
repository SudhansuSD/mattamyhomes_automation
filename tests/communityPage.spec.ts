import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { CommunityPage } from '../pages/CommunityPage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

const location = getLocationConfig();
const { envName } = getEnvConfig();

test.describe(`Community Detail - ${location.community}`, () => {
  let communityPage: CommunityPage;

  // Setup

  test.beforeEach(async ({ page }) => {
    communityPage = new CommunityPage(page);

    await annotate({
      location: location.country,
      feature: 'Community Detail Page',
      owner: 'QA Automation',
      severity: Severity.CRITICAL,
      tags: ['smoke', 'regression'],
    });

    await test.step('Navigate & search community', async () => {
      await communityPage.searchAndValidateByValue('community', location.community);
    });
  });

  // UI VALIDATION

  test.describe('UI Validation', () => {
    test(`@smoke @regression | ${location.country} | Validate community core sections`, async () => {
      await test.step('Validate community core sections', async () => {
        await communityPage.verifyCoreSections();
      });
    });

    test(`@regression | ${location.country} | Validate overview copy, address, market details, and key attributes`, async () => {
      await test.step('Validate overview copy, address, market details, and key attributes', async () => {
        await communityPage.verifyOverviewAddressMarketAndAttributes(location.community);
      });
    });

    test(`@regression | ${location.country} | Validate QMI card community name matches current community`, async () => {
      await test.step('Validate QMI card community name matches current community', async () => {
        await communityPage.verifyQmiCardCommunityNameMatchesCurrentCommunity(location.community);
      });
    });
  });

  // NAVIGATION VALIDATION

  test.describe('Navigation Validation', () => {
    test(`@regression | ${location.country} | Validate all navigation links`, async () => {
      await test.step('Validate all navigation links', async () => {
        await communityPage.verifyAllNavigationLinks();
      });
    });

    test(`@smoke @regression | ${location.country} | Validate available homes navigation`, async () => {
      await test.step('Validate available homes navigation', async () => {
        await communityPage.verifyAvailableHomesNavigation();
      });
    });

    test(`@smoke @regression | ${location.country} | Validate plans navigation`, async () => {
      await test.step('Validate plans navigation', async () => {
        await communityPage.verifyPlansNavigation();
      });
    });

    test(`@regression | ${location.country} | Validate contact action CTAs when available`, async () => {
      await test.step('Validate Hours, Directions, and Schedule Appointment CTAs when available', async () => {
        await communityPage.verifyContactActionCtas();
      });
    });
  });

  // FORM VALIDATION

  test.describe('Lead Form', () => {
    test.describe('Get Information Form Validation', () => {
      test(`@smoke @regression | ${location.country} | Validate Get Information CTA opens community sideModalForm`, async () => {
        await test.step('Validate Get Information CTA opens community sideModalForm', async () => {
          await communityPage.verifyGetInformationCtaOpensLeadForm();
        });
      });

      test(`@smoke @regression | ${location.country} | Validate community sideModalForm fields`, async () => {
        await test.step('Validate community sideModalForm fields', async () => {
          await communityPage.verifySideModalFormFields();
        });
      });

      test(`@regression | ${location.country} | Validate community sideModalForm required field errors`, async () => {
        await test.step('Validate community sideModalForm required field errors', async () => {
          await communityPage.validateSideModalFormRequiredErrors();
        });
      });

      test(`@regression | ${location.country} | Validate community sideModalForm invalid email format`, async () => {
        await test.step('Validate community sideModalForm invalid email format', async () => {
          await communityPage.validateSideModalFormInvalidEmail();
        });
      });

      test.describe('Get Information form submission', () => {
        test.skip(
          envName === 'PROD',
          'Skipping Get Information form lead submission on PROD environment.',
        );

        test(`@regression @lead-submit @STAGE | ${location.country} | Validate community sideModalForm successful submission`, async () => {
          await test.step('Validate community sideModalForm successful submission', async () => {
            await communityPage.verifySideModalFormSuccessSubmission();
          });
        });
      });
    });

    test.describe('Primary Form Validation', () => {
      test(`@smoke @regression | ${location.country} | Validate primary form required field errors`, async () => {
        await test.step('Validate primary form required field errors', async () => {
          await communityPage.validatePrimaryFormEmptyErrors();
        });
      });

      test(`@regression | ${location.country} | Validate primary form invalid email format`, async () => {
        await test.step('Validate primary form invalid email format', async () => {
          await communityPage.validatePrimaryFormInvalidEmail();
        });
      });

      test.describe('Primary form submission', () => {
        test.skip(envName === 'PROD', 'Skipping primary form lead submission on PROD environment.');

        test(`@regression @lead-submit @STAGE | ${location.country} | Validate primary form successful submission`, async () => {
          await test.step('Validate primary form successful submission', async () => {
            await communityPage.verifyPrimaryFormSuccessSubmission();
          });
        });
      });
    });

    test.describe('Footer Form Validation', () => {
      test(`@smoke @regression | ${location.country} | Validate footer form required field errors`, async () => {
        await test.step('Validate footer form required field errors', async () => {
          await communityPage.validateFooterFormEmptyErrors();
        });
      });

      test(`@regression | ${location.country} | Validate footer form invalid email format`, async () => {
        await test.step('Validate footer form invalid email format', async () => {
          await communityPage.validateFooterFormInvalidEmail();
        });
      });

      test.describe('Footer form submission', () => {
        test.skip(envName === 'PROD', 'Skipping footer form lead submission on PROD environment.');

        test(`@regression @lead-submit @STAGE | ${location.country} | Validate footer form successful submission`, async () => {
          await test.step('Validate footer form successful submission', async () => {
            await communityPage.verifyFooterFormSuccessSubmission();
          });
        });
      });
    });
  });

  test.describe('Media Validation', () => {
    test(`@regression | ${location.country} | Validate community page image and video URLs return 200`, async () => {
      await test.step('Validate community page image and video URLs return 200', async () => {
        await communityPage.validateImageAndVideoUrlsReturn200('Community page');
      });
    });
  });
});
