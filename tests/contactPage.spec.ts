/**
 * ENV=STAGE npx playwright test tests/contactPage.spec.ts --project=Chrome
 * Contact page validation for USA and Canada country experiences.
 */

import { test } from '@playwright/test';
import { CONTACT_COUNTRIES, ContactPage } from '../pages/ContactPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

// Location-agnostic: covers both countries itself, so a multi-location run
// executes it once — see config/locations/locationAgnosticSpecs.ts.
test.describe('Mattamy Homes - Contact Page', () => {
  test.beforeEach(async () => {
    await annotate({
      feature: 'Contact Page',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['smoke', 'regression'],
    });
  });

  for (const countryConfig of CONTACT_COUNTRIES) {
    test.describe(`${countryConfig.locationKey} contact experience`, () => {
      let contactPage: ContactPage;

      test.beforeEach(async ({ page }) => {
        // This suite runs once and covers both countries, so each test reports
        // under the country it actually exercises rather than a shared bucket.
        await annotate({ location: countryConfig.locationKey });

        contactPage = new ContactPage(page);

        await test.step(`Navigate to ${countryConfig.locationKey} Home Page`, async () => {
          const homePage = new HomePage(page);

          await homePage.navigate(countryConfig.locationKey);
          await homePage.verifyPageLoaded();
        });

        await test.step('Open Contact Us from the header', async () => {
          const header = new Header(page);

          await header.clickContactUs();
        });
      });

      test(`@smoke @regression | ${countryConfig.locationKey} | contact page should load with country-specific content`, async () => {
        await test.step('Verify hero, title, URL country parameter, and country selector', async () => {
          await contactPage.verifyPageLoaded(countryConfig);
        });
      });

      test(`@regression | ${countryConfig.locationKey} | contact page should list all selectable areas`, async () => {
        await test.step('Verify area buttons and accessible labels', async () => {
          await contactPage.validateAreaList(countryConfig);
        });
      });

      test(`@regression | ${countryConfig.locationKey} | area selection should reveal contact options`, async () => {
        await test.step('Select the primary configured area and verify detail actions', async () => {
          await contactPage.validateAreaDetails(countryConfig.areas[0]);
        });
      });

      test(`@regression | ${countryConfig.locationKey} | corporate office contacts and footer links should be valid`, async () => {
        await test.step('Verify corporate office mailto links', async () => {
          await contactPage.validateCorporateOfficeEmails();
        });

        await test.step('Verify footer navigation and social links', async () => {
          await contactPage.validateFooterAndSocialLinks(countryConfig);
        });
      });
    });
  }
});
