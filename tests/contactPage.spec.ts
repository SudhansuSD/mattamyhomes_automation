/**
 * ENV=STAGE npx playwright test tests/contactPage.spec.ts --project=Chrome
 * Contact page validation for USA and Canada country experiences.
 */

import { test } from '@playwright/test';
import { CONTACT_COUNTRIES, ContactPage } from '../pages/ContactPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';

test.describe('Mattamy Homes - Contact Page', () => {
  for (const countryConfig of CONTACT_COUNTRIES) {
    test.describe(`${countryConfig.locationKey} contact experience`, () => {
      let contactPage: ContactPage;

      test.beforeEach(async ({ page }) => {
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

      test(`TC-01 | @smoke @regression | ${countryConfig.locationKey} contact page should load with country-specific content`, async () => {
        await test.step('Verify hero, title, URL country parameter, and country selector', async () => {
          await contactPage.verifyPageLoaded(countryConfig);
        });
      });

      test(`TC-02 | @regression | ${countryConfig.locationKey} contact page should list all selectable areas`, async () => {
        await test.step('Verify area buttons and accessible labels', async () => {
          await contactPage.validateAreaList(countryConfig);
        });
      });

      test(`TC-03 | @regression | ${countryConfig.locationKey} area selection should reveal contact options`, async () => {
        await test.step('Select the primary configured area and verify detail actions', async () => {
          await contactPage.validateAreaDetails(countryConfig.areas[0]);
        });
      });

      test(`TC-04 | @regression | ${countryConfig.locationKey} corporate office contacts and footer links should be valid`, async () => {
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
