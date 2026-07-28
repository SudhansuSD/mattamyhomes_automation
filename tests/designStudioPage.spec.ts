/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/designStudioPage.spec.ts --project=Chrome
 * Design Studio page validation for the configured country experience.
 */

import { test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { DesignStudioPage } from '../pages/DesignStudioPage';
import { isPathExposedForCountry } from '../config/navigation/countryNavigation';
import { annotate, Severity } from '../utils/allureMeta';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

test.describe(`Design Studio Page - ${location.country}`, () => {
  let designStudioPage: DesignStudioPage;

  test.beforeEach(async ({ page }) => {
    // Only validate when Design Studio is surfaced in this country's navigation.
    test.skip(
      !isPathExposedForCountry(DesignStudioPage.PATH, locationKey),
      `Design Studio is not surfaced in ${location.country} navigation.`,
    );

    designStudioPage = new DesignStudioPage(page);
    await annotate({
      epic: 'Mattamy Homes Website',
      feature: 'Design Studio',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['regression'],
    });

    await test.step('Navigate to Design Studio', async () => {
      await designStudioPage.navigateToDesignStudio(locationKey);
    });
  });

  test('TC-01 | @smoke @regression | Design Studio page should load with valid shell and content', async () => {
    await test.step('Validate page shell', async () => {
      await designStudioPage.validatePageShell();
    });
    await test.step('Validate hero and overview content', async () => {
      await designStudioPage.validateContent();
    });
  });

  test('TC-02 | @regression | Design Studio Market Selector should offer selectable markets', async () => {
    await test.step('Validate Market Selector', async () => {
      await designStudioPage.validateMarketSelector();
    });
  });

  test('TC-03 | @regression | Design Studio Title CTA should link to a destination', async () => {
    await test.step('Validate Title CTA', async () => {
      await designStudioPage.validateTitleCta();
    });
  });

  test('TC-04 | @regression | Design Studio image and video URLs return 200', async () => {
    await test.step('Validate media URLs return 200', async () => {
      await designStudioPage.validateImageAndVideoUrlsReturn200('Design Studio page');
    });
  });
});
