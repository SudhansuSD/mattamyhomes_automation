/**
 * ENV=STAGE npx playwright test tests/designStudioPage.spec.ts --project=Chrome
 * Design Studio page validation.
 *
 * Design Studio exists for BOTH countries but is surfaced differently - a
 * top-level header item on USA, nested under the Resources mega-menu on CAN -
 * and each country lists its own markets (Arizona/Florida/... vs Alberta/
 * Ontario). So this suite covers both in a single run rather than only whichever
 * country LOCATION happens to be set to, and it enters the page the way a
 * visitor does: by clicking the country's header link from the home page instead
 * of hitting /design-studio directly. That keeps the placement itself covered -
 * a Design Studio link that disappears from the USA header, or drops out of the
 * CAN Resources menu, fails here even though the URL still resolves.
 */

import { test } from '@playwright/test';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { DesignStudioPage } from '../pages/DesignStudioPage';
import { Header } from '../pages/Header';
import { HomePage } from '../pages/HomePage';
import {
  DESIGN_STUDIO_NAV_BY_COUNTRY,
  isPathExposedForCountry,
} from '../config/navigation/countryNavigation';
import { annotate, Severity } from '../utils/allureMeta';

const COUNTRIES: readonly LocationKey[] = ['USA', 'CAN'];

for (const locationKey of COUNTRIES) {
  const location = getLocationConfig(locationKey);
  const designStudioNav = DESIGN_STUDIO_NAV_BY_COUNTRY[locationKey];
  const entryPoint =
    designStudioNav.placement === 'top-level'
      ? 'top-level header link'
      : `${designStudioNav.menuName} menu`;

  test.describe(`Design Studio Page - ${location.country}`, () => {
    let designStudioPage: DesignStudioPage;

    test.beforeEach(async ({ page }, testInfo) => {
      // Only validate when Design Studio is surfaced in this country's navigation.
      test.skip(
        !isPathExposedForCountry(DesignStudioPage.PATH, locationKey),
        `Design Studio is not surfaced in ${location.country} navigation.`,
      );
      // Reaching the page through a mega-menu flyout is validated on desktop
      // Chrome only, matching the other header-driven suites.
      test.skip(
        designStudioNav.placement === 'menu' && testInfo.project.name !== 'Chrome',
        'Header flyout navigation is validated on desktop Chrome.',
      );

      const homePage = new HomePage(page);
      const header = new Header(page);
      designStudioPage = new DesignStudioPage(page);

      await annotate({
        location: location.country,
        feature: 'Design Studio',
        owner: 'QA Automation',
        severity: Severity.NORMAL,
        tags: ['regression'],
      });

      await test.step(`Navigate to ${location.country} home page`, async () => {
        await homePage.navigate(locationKey);
        await homePage.verifyPageLoaded();
      });

      await test.step(`Open Design Studio from the ${entryPoint}`, async () => {
        if (designStudioNav.placement === 'top-level') {
          await header.verifyTopLevelNavLinkVisible(designStudioNav.link);
          await header.clickTopLevelNavLink(designStudioNav.link);
        } else {
          // Nested placement: the link must NOT stand on its own in the header,
          // it is only reachable after opening the country's menu.
          await header.verifyNoTopLevelNavLink(designStudioNav.link);
          await header.clickMenuLink(designStudioNav.menuName, designStudioNav.link);
        }

        await designStudioPage.verifyDesignStudioLanding();
      });
    });

    test(`@smoke @regression | ${location.country} | Design Studio page should load with valid shell and content from the ${entryPoint}`, async () => {
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
