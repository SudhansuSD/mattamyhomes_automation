/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/favoritesPage.spec.ts --project=Chrome
 * Favorites ("Homes I Love") validation: page shell, empty state and the
 * cross-page save -> view -> remove workflow.
 */

import { expect, test } from '@playwright/test';
import { getLocationConfig, getLocationKey } from '../config/locations/locationConfig';
import { FavoritesPage } from '../pages/FavoritesPage';
import { SearchPage } from '../pages/SearchPage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

const locationKey = getLocationKey();
const location = getLocationConfig(locationKey);

test.describe(`Favorites Page - ${location.country}`, () => {
  let favoritesPage: FavoritesPage;

  test.beforeEach(async ({ page }) => {
    favoritesPage = new FavoritesPage(page);
    await annotate({
      location: location.country,
      feature: 'Favorites',
      owner: 'QA Automation',
      severity: Severity.NORMAL,
      tags: ['regression'],
    });
  });

  test(`@smoke @regression | ${location.country} | Favorites page should load with a valid shell`, async () => {
    await test.step('Navigate to Favorites', async () => {
      await favoritesPage.navigateToFavorites(locationKey);
    });
    await test.step('Validate page shell', async () => {
      await favoritesPage.validatePageShell();
    });
    await test.step('Validate header Go to Favorites link', async () => {
      await favoritesPage.validateHeaderFavoritesLink();
    });
  });

  test(`@regression | ${location.country} | Favorites page should show an empty state with no saved homes`, async ({
    page,
  }) => {
    await test.step('Clear any previously saved favorites', async () => {
      await page.context().clearCookies();
    });
    await test.step('Navigate to Favorites', async () => {
      await favoritesPage.navigateToFavorites(locationKey);
      await page
        .evaluate(() => {
          try {
            window.localStorage.clear();
            window.sessionStorage.clear();
          } catch {
            /* storage may be unavailable */
          }
        })
        .catch(() => undefined);
      await favoritesPage.navigateToFavorites(locationKey);
    });
    await test.step('Validate empty state', async () => {
      await favoritesPage.validateEmptyState();
    });
  });

  test(`@regression | ${location.country} | Saving a home from search should surface it on Favorites`, async ({
    page,
  }) => {
    const searchPage = new SearchPage(page);

    await test.step('Open search results', async () => {
      await searchPage.searchAndValidateByValue('market', location.market);
    });

    let saved = false;
    await test.step('Save the first home from search results', async () => {
      saved = await favoritesPage.saveFirstVisibleHome();
    });

    // Assert rather than skip: search cards DO expose a "Mark as favorite" control,
    // so its absence is a real regression. Skipping here would turn that into a
    // silent pass and hide the fact that nothing is being saved.
    expect(saved, 'Search result cards should expose a favorite control to save a home').toBe(true);

    await test.step('Open the Favorites page', async () => {
      await favoritesPage.navigateToFavorites(locationKey);
      await favoritesPage.validatePageShell();
    });

    await test.step('Validate the saved home is listed', async () => {
      await favoritesPage.validateSavedHomesPresent();
    });

    await test.step('Remove the saved home', async () => {
      await favoritesPage.removeFirstSavedHome();
    });
  });
});
