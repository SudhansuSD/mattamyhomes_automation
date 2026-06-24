/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/searchPage.spec.ts
 * Search Page Tests
 * @file tests/search/searchPage.spec.ts
 * @description Tests for search, filter & sorting functionality
 */

import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import { SearchPage } from '../pages/SearchPage';

const location = getLocationConfig();

test.describe(`Search Page Tests - ${location.country}`, () => {

  let searchPage: SearchPage;

  /* -------------------------------------------------------
     Common Setup
  -------------------------------------------------------- */

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await test.step('Search and validate market', async () => {
      await searchPage.searchAndValidateByValue('market', location.market);
    });
  });

  /* -------------------------------------------------------
     Default Search Tests
  -------------------------------------------------------- */
  test('SEARCH-001 | @sanity | Verify community results functionality', async () => {
    await searchPage.verifyResults('Communities');
  });

  test('SEARCH-002 | @sanity | Verify plan results functionality', async () => {
    await searchPage.verifyResults('Plans');
  });

  test('SEARCH-003 | @sanity | Verify QMI results functionality', async () => {
    await searchPage.verifyResults('Quick Move-Ins');
  });

  test('SEARCH-004 | @regression | Verify search result cards display required details', async () => {
    await searchPage.validateAllResultCardsRequiredDetails();
  });

  test('SEARCH-005 | @regression | Verify result card CTAs navigate to correct detail pages', async () => {
    await searchPage.validateAllResultCardCtaNavigation();
  });


  /* -------------------------------------------------------
     Filter Tests
  -------------------------------------------------------- */

  test('SEARCH-006 | @regression | Verify filter by price functionality', async () => {
    await searchPage.filterByPrice(400000, 500000);
    await searchPage.validatePriceRangeAcrossTabs(400000, 500000);
  });

  test('SEARCH-007 | @regression | Validate filter by beds and bathrooms functionality', async () => {
    await searchPage.filterByBedroomsAndBathrooms(3, 3);
    await searchPage.validateBedsBathsAcrossTabs(3, 3);
  });

  test('SEARCH-008 | @regression | Verify Clear Reset filters behavior', async () => {
    await searchPage.validateClearResetFiltersBehavior();
  });

  test('SEARCH-009 | @regression | Verify no-results state for unavailable search criteria', async () => {
    await searchPage.validateNoResultsState();
  });

  test('SEARCH-010 | @regression | Verify combined filters persist in URL state after reload', async () => {
    await searchPage.validateCombinedFiltersPersistInUrlState(400000, 500000, 3, 2);
  });

  test('SEARCH-011 | @regression | Verify browser back and forward restore filter state', async () => {
    await searchPage.validateFilterBrowserHistoryNavigation(400000, 500000);
  });

  /* -------------------------------------------------------
     Sorting Validation Tests
  -------------------------------------------------------- */

  test('SEARCH-012 | @regression | Validate community sorting options', async () => {
    await searchPage.validateCommunitySortOptions();
    await searchPage.validateSortingBehavior('Communities');

  });
  test('SEARCH-013 | @regression | Validate Plan sorting options', async () => {
    await searchPage.validatePlanSortOptions();
    await searchPage.validateSortingBehavior('Plans');
  });

  test('SEARCH-014 | @regression | Validate QMI sorting options', async () => {
    await searchPage.validateQMISortOptions();
    await searchPage.validateSortingBehavior('Quick Move-Ins');
  });


});
