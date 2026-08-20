/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/searchPage.spec.ts
 * Search Page Tests
 * @file tests/search/searchPage.spec.ts
 * @description Tests for search, filter & sorting functionality
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { SearchPage } from '../pages/SearchPage';
import { annotate, Severity } from '../utils/allureMeta';

const location = getLocationConfig();

test.describe(`Search Page Tests - ${location.country}`, () => {
  let searchPage: SearchPage;

  // Common Setup

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await annotate({
      location: location.country,
      feature: 'Search Page',
      owner: 'QA Automation',
      severity: Severity.CRITICAL,
      tags: ['smoke', 'regression'],
    });
    await test.step('Search and validate market', async () => {
      await searchPage.searchAndValidateByValue('market', location.market);
    });
  });

  // Default Search Tests

  test.describe('Default Search Tests', () => {
    test(`@smoke @regression | ${location.country} | Verify community results functionality`, async () => {
      await test.step('Verify community results functionality', async () => {
        await searchPage.verifyResults('Communities');
      });
    });

    test(`@regression | ${location.country} | Verify plan results functionality`, async () => {
      await test.step('Verify plan results functionality', async () => {
        await searchPage.verifyResults('Plans');
      });
    });

    test(`@regression | ${location.country} | Verify QMI results functionality`, async () => {
      await test.step('Verify QMI results functionality', async () => {
        await searchPage.verifyResults('Quick Move-Ins');
      });
    });

    test(`@regression | ${location.country} | Verify search result cards display required details`, async () => {
      await test.step('Verify search result cards display required details', async () => {
        await searchPage.validateAllResultCardsRequiredDetails();
      });
    });

    test(`@regression | ${location.country} | Verify result card CTAs navigate to correct detail pages`, async () => {
      await test.step('Verify result card CTAs navigate to correct detail pages', async () => {
        await searchPage.validateAllResultCardCtaNavigation();
      });
    });
  });

  // Filter Tests

  test.describe('Filter Tests', () => {
    test(`@regression | ${location.country} | Verify filter by price functionality`, async () => {
      await test.step('Filter by price range', async () => {
        await searchPage.filterByPrice(400000, 500000);
      });
      await test.step('Validate price range across tabs', async () => {
        await searchPage.validatePriceRangeAcrossTabs(400000, 500000);
      });
    });

    test(`@regression | ${location.country} | Validate filter by beds and bathrooms functionality`, async () => {
      await test.step('Filter by bedrooms and bathrooms', async () => {
        await searchPage.filterByBedroomsAndBathrooms(3, 3);
      });
      await test.step('Validate beds and baths across tabs', async () => {
        await searchPage.validateBedsBathsAcrossTabs(3, 3);
      });
    });

    test(`@regression | ${location.country} | Verify Clear Reset filters behavior`, async () => {
      await test.step('Verify Clear Reset filters behavior', async () => {
        await searchPage.validateClearResetFiltersBehavior();
      });
    });

    test(`@regression | ${location.country} | Verify no-results state for unavailable search criteria`, async () => {
      await test.step('Verify no-results state for unavailable search criteria', async () => {
        await searchPage.validateNoResultsState();
      });
    });

    test(`@regression | ${location.country} | Verify combined filters persist in URL state after reload`, async () => {
      await test.step('Verify combined filters persist in URL state after reload', async () => {
        await searchPage.validateCombinedFiltersPersistInUrlState(400000, 500000, 3, 2);
      });
    });

    test(`@regression | ${location.country} | Verify browser back and forward restore filter state`, async () => {
      await test.step('Verify browser back and forward restore filter state', async () => {
        await searchPage.validateFilterBrowserHistoryNavigation(400000, 500000);
      });
    });
  });

  // Sorting Validation Tests

  test.describe('Sorting Validation Tests', () => {
    test(`@regression | ${location.country} | Validate community sorting options`, async () => {
      await test.step('Validate community sort options', async () => {
        await searchPage.validateCommunitySortOptions();
      });
      await test.step('Validate community sorting behavior', async () => {
        await searchPage.validateSortingBehavior('Communities');
      });
    });
    test(`@regression | ${location.country} | Validate Plan sorting options`, async () => {
      await test.step('Validate plan sort options', async () => {
        await searchPage.validatePlanSortOptions();
      });
      await test.step('Validate plan sorting behavior', async () => {
        await searchPage.validateSortingBehavior('Plans');
      });
    });

    test(`@regression | ${location.country} | Validate QMI sorting options`, async () => {
      await test.step('Validate QMI sort options', async () => {
        await searchPage.validateQMISortOptions();
      });
      await test.step('Validate QMI sorting behavior', async () => {
        await searchPage.validateSortingBehavior('Quick Move-Ins');
      });
    });
  });

  // Savings Calculator Tests

  test.describe('Savings Calculator', () => {
    test(`@regression | ${location.country} | Validate savings calculator sidebar`, async () => {
      await test.step('Validate savings calculator sidebar', async () => {
        await searchPage.validateSavingsCalculatorSidebar();
      });
    });
  });
});
