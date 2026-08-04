/**
 * ENV=PROD npx playwright test tests/customerCarePage.spec.ts --project=Chrome
 * Customer Care validation for USA and Canada country experiences.
 */

import { test } from '@playwright/test';
import { CUSTOMER_CARE_COUNTRIES, CustomerCarePage } from '../pages/CustomerCarePage';
import { annotate, Severity } from '../utils/allureMeta';

// Location-agnostic: covers both countries itself, so a multi-location run
// executes it once — see config/locations/locationAgnosticSpecs.ts.
test.describe('Mattamy Homes - Customer Care Page', () => {
  test.beforeEach(async () => {
    await annotate({
      feature: 'Customer Care',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['smoke', 'regression'],
    });
  });

  for (const countryConfig of CUSTOMER_CARE_COUNTRIES) {
    test.describe(`${countryConfig.locationKey} customer care experience`, () => {
      let customerCarePage: CustomerCarePage;

      test.beforeEach(async ({ page }) => {
        // This suite runs once and covers both countries, so each test reports
        // under the country it actually exercises rather than a shared bucket.
        await annotate({ location: countryConfig.locationKey });

        customerCarePage = new CustomerCarePage(page);

        await test.step(`Navigate to ${countryConfig.locationKey} Customer Care Page`, async () => {
          await customerCarePage.navigateToCustomerCare(countryConfig.locationKey);
        });
      });

      test(`@smoke @regression | ${countryConfig.locationKey} | customer care page should load country-specific content`, async () => {
        await test.step('Verify title, URL, hero content, and selected country', async () => {
          await customerCarePage.verifyPageLoaded(countryConfig);
        });
      });

      test(`@regression | ${countryConfig.locationKey} | customer care page should expose area contacts`, async () => {
        await test.step('Verify all configured area buttons are present and accessible', async () => {
          await customerCarePage.validateAreaList(countryConfig);
        });

        await test.step('Select the primary configured area and verify contact details', async () => {
          await customerCarePage.validateAreaDetails(countryConfig.areas[0]);
        });
      });

      test(`@regression | ${countryConfig.locationKey} | customer care resources should be linked correctly`, async () => {
        await test.step('Verify warranty, support, PDF, and video resource links', async () => {
          await customerCarePage.validateResourceLinks(countryConfig);
        });
      });
    });
  }

  test.describe('USA service request and emergency support', () => {
    let customerCarePage: CustomerCarePage;

    test.beforeEach(async ({ page }) => {
      await annotate({ location: 'USA' });

      customerCarePage = new CustomerCarePage(page);

      await test.step('Navigate to USA Customer Care Page', async () => {
        await customerCarePage.navigateToCustomerCare('USA');
      });
    });

    test('@regression | USA | customer care should show emergency support coverage', async () => {
      await test.step('Verify emergency support sections', async () => {
        await customerCarePage.validateUsEmergencySupportContent();
      });
    });

    test('@regression | USA | service request form should enforce required client-side validation', async () => {
      await test.step('Verify form fields and required indicators', async () => {
        await customerCarePage.validateUsServiceRequestForm();
      });

      await test.step('Verify blank required fields fail validation', async () => {
        await customerCarePage.validateUsRequiredFieldValidation();
      });
    });
  });

  test.describe('Canada support coverage', () => {
    let customerCarePage: CustomerCarePage;

    test.beforeEach(async ({ page }) => {
      await annotate({ location: 'CAN' });

      customerCarePage = new CustomerCarePage(page);

      await test.step('Navigate to Canada Customer Care Page', async () => {
        await customerCarePage.navigateToCustomerCare('CAN');
      });
    });

    test('@regression | CAN | customer care should show support and warranty sections', async () => {
      await test.step('Verify warranty, after-hours, checklist, and video sections', async () => {
        await customerCarePage.validateCanadaSupportSections();
      });
    });
  });
});
