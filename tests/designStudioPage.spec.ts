/**
 * ENV=STAGE npx playwright test tests/designStudioPage.spec.ts --project=Chrome
 * Design Studio page validation.
 *
 * Design Studio exists for BOTH countries - a top-level nav item on USA and under
 * Resources on CAN - and each country lists its own markets (Arizona/Florida/...
 * vs Alberta/Ontario). So this suite covers both in a single run rather than only
 * whichever country LOCATION happens to be set to.
 */

import { test } from '@playwright/test';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { DesignStudioPage } from '../pages/DesignStudioPage';
import { isPathExposedForCountry } from '../config/navigation/countryNavigation';
import { annotate, Severity } from '../utils/allureMeta';

const COUNTRIES: readonly LocationKey[] = ['USA', 'CAN'];

for (const locationKey of COUNTRIES) {
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
        location: location.country,
        feature: 'Design Studio',
        owner: 'QA Automation',
        severity: Severity.NORMAL,
        tags: ['regression'],
      });

      await test.step(`Navigate to Design Studio (${location.country})`, async () => {
        await designStudioPage.navigateToDesignStudio(locationKey);
      });
    });

    test(`@smoke @regression | ${location.country} | Design Studio page should load with valid shell and content`, async () => {
      await test.step('Validate page shell', async () => {
        await designStudioPage.validatePageShell();
      });
      await test.step('Validate hero and overview content', async () => {
        await designStudioPage.validateContent();
      });
    });

    test(`@regression | ${location.country} | Design Studio market links should open each market design studio page`, async () => {
      await test.step('Expand the market panel and validate every market link', async () => {
        await designStudioPage.validateMarketSelector();
      });
    });

    test(`@regression | ${location.country} | Design Studio Title CTA should link to a destination`, async () => {
      await test.step('Validate Title CTA', async () => {
        await designStudioPage.validateTitleCta();
      });
    });

    test(`@regression | ${location.country} | Design Studio image and video URLs return 200`, async () => {
      await test.step('Validate media URLs return 200', async () => {
        await designStudioPage.validateImageAndVideoUrlsReturn200(
          `Design Studio page (${location.country})`,
        );
      });
    });
  });
}
