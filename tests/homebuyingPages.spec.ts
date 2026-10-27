/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/homebuyingPages.spec.ts --project=Chrome
 * Homebuying section validation: Journey, Financing (mortgage calculator) and
 * Shopping Tools (savings calculator + form).
 */

import { test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { isPathExposedForCountry } from '../config/navigation/countryNavigation';
import { HOMEBUYING_PAGES, HomebuyingPage } from '../pages/HomebuyingPage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

test.describe(`Homebuying Pages - ${location.country}`, () => {
  let homebuyingPage: HomebuyingPage;

  test.beforeEach(async ({ page }) => {
    homebuyingPage = new HomebuyingPage(page);
    await annotate({
      location: location.country,
      feature: 'Homebuying',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['regression'],
    });
  });

  test.describe('Homebuying Journey', () => {
    const expectation = HOMEBUYING_PAGES.journey;

    test.beforeEach(() => {
      test.skip(
        !isPathExposedForCountry(expectation.path, locationKey),
        `${expectation.name} is not surfaced in ${location.country} navigation.`,
      );
    });

    test(`@smoke @regression | ${location.country} | Homebuying Journey page should load with valid shell and content`, async () => {
      await test.step(`Navigate to ${expectation.name}`, async () => {
        await homebuyingPage.navigateToHomebuyingPage(expectation, locationKey);
      });
      await test.step('Validate page shell', async () => {
        await homebuyingPage.validatePageShell(expectation);
      });
      await test.step('Validate content', async () => {
        await homebuyingPage.validateContent(expectation);
      });
    });
  });

  test.describe('Financing', () => {
    const expectation = HOMEBUYING_PAGES.financing;

    test.beforeEach(async () => {
      test.skip(
        !isPathExposedForCountry(expectation.path, locationKey),
        `${expectation.name} is not surfaced in ${location.country} navigation.`,
      );
      await test.step(`Navigate to ${expectation.name}`, async () => {
        await homebuyingPage.navigateToHomebuyingPage(expectation, locationKey);
      });
    });

    test(`@smoke @regression | ${location.country} | Financing page should load with valid shell and content`, async () => {
      await test.step('Validate page shell', async () => {
        await homebuyingPage.validatePageShell(expectation);
      });
      await test.step('Validate content', async () => {
        await homebuyingPage.validateContent(expectation);
      });
    });

    // The ABA disclosure and Mattamy Home Funding handoff exist only in the USA;
    // Canada has no affiliated lender and embeds the calculator on the page.
    test(`@regression | ${location.country} | Mortgage Calculator CTA should open the ABA disclosure modal`, async () => {
      test.skip(
        location.country !== 'USA',
        'The ABA disclosure is USA-only; Canada embeds the mortgage calculator instead.',
      );
      await test.step('Validate mortgage calculator disclosure modal', async () => {
        await homebuyingPage.validateMortgageCalculatorModal();
      });
    });

    test(`@regression | ${location.country} | Embedded mortgage calculator should calculate a monthly payment`, async () => {
      test.skip(
        location.country !== 'CAN',
        'The embedded calculator is Canada-only; the USA hands off to Mattamy Home Funding.',
      );
      await test.step('Validate embedded mortgage calculator', async () => {
        await homebuyingPage.validateEmbeddedMortgageCalculator();
      });
    });
  });

  test.describe('Shopping Tools', () => {
    const expectation = HOMEBUYING_PAGES.shoppingTools;

    test.beforeEach(async () => {
      // Shopping Tools resolves for both countries but is only DISPLAYED in the
      // USA navigation, so it is skipped for countries that do not surface it.
      test.skip(
        !isPathExposedForCountry(expectation.path, locationKey),
        `${expectation.name} is not surfaced in ${location.country} navigation.`,
      );
      await test.step(`Navigate to ${expectation.name}`, async () => {
        await homebuyingPage.navigateToHomebuyingPage(expectation, locationKey);
      });
    });

    test(`@smoke @regression | ${location.country} | Shopping Tools page should load with valid shell and content`, async () => {
      await test.step('Validate page shell', async () => {
        await homebuyingPage.validatePageShell(expectation);
      });
      await test.step('Validate content', async () => {
        await homebuyingPage.validateContent(expectation);
      });
    });

    test(`@regression | ${location.country} | Savings calculator should display a savings value`, async () => {
      await test.step('Validate savings calculator', async () => {
        await homebuyingPage.validateSavingsCalculator();
      });
    });

    test(`@regression | ${location.country} | Shopping Tools form should enforce required-field validation`, async () => {
      await test.step('Validate form required-field validation', async () => {
        await homebuyingPage.validateFormRequiredValidation();
      });
    });
  });
});
