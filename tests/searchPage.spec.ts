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
  test('@sanity Verify community results functionality', async () => {
    await searchPage.verifyResults('Communities');
  });

  test('@sanity Verify plan results functionality', async () => {
    await searchPage.verifyResults('Plans');
  });

  test('@sanity Verify QMI results functionality', async () => {
    await searchPage.verifyResults('Quick Move-Ins');
  });

  test('@regression Verify search result cards display required details', async () => {
    await searchPage.validateAllResultCardsRequiredDetails();
  });

  test('@regression Verify result card CTAs navigate to correct detail pages', async () => {
    await searchPage.validateAllResultCardCtaNavigation();
  });


  /* -------------------------------------------------------
     Filter Tests
  -------------------------------------------------------- */

  test('@regression Verify filter by price functionality', async () => {
    await searchPage.filterByPrice(400000, 500000);
    await searchPage.validatePriceRangeAcrossTabs(400000, 500000);
  });

  test('@regression Validate filter by beds and bathrooms functionality', async () => {
    await searchPage.filterByBedroomsAndBathrooms(3, 3);
    await searchPage.validateBedsBathsAcrossTabs(3, 3);
  });

  test('@regression Verify Clear Reset filters behavior', async () => {
    await searchPage.validateClearResetFiltersBehavior();
  });

  /* -------------------------------------------------------
     Sorting Validation Tests
  -------------------------------------------------------- */

  test('@regression Validate community sorting options', async () => {
    await searchPage.validateCommunitySortOptions();
    await searchPage.validateSortingBehavior('Communities');

  });
  test('@regression Validate Plan sorting options', async () => {
    await searchPage.validatePlanSortOptions();
    await searchPage.validateSortingBehavior('Plans');
  });

  test('@regression Validate QMI sorting options', async () => {
    await searchPage.validateQMISortOptions();
    await searchPage.validateSortingBehavior('Quick Move-Ins');
  });


});
