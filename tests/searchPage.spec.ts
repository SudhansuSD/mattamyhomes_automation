/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/searchPage.spec.ts
 * Search Page Tests
 * @file tests/search/searchPage.spec.ts
 * @description Tests for search, filter & sorting functionality
 */

import { test } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

test.describe(`Search Page Tests - ${location.country}`, () => {

  let searchPage: SearchPage;

  /* -------------------------------------------------------
     Common Setup
  -------------------------------------------------------- */

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);

    await searchPage.navigate();
    await searchPage.searchByMarket(location.market);
    await searchPage.verifySearchByMarket(location.market);
  });

  /* -------------------------------------------------------
     Filter Tests
  -------------------------------------------------------- */

  test('@regression Verify filter by price functionality', async () => {
    await searchPage.filterByPrice('400K', '500K');
    await searchPage.verifyResults('Communities');
  });

  test('@regression Verify filter by bedrooms and bathrooms functionality', async () => {
    await searchPage.filterByBedroomsAndBathrooms(3, 3);
    await searchPage.verifyResults('Communities');
  });

  test('@sanity Verify plan results functionality', async () => {
    await searchPage.verifyResults('Plans');
  });

  test('@sanity Verify QMI results functionality', async () => {
    await searchPage.verifyResults('Quick Move-In');
  });

  /* -------------------------------------------------------
     Sorting Validation Tests
  -------------------------------------------------------- */

  test('@regression Validate community sorting options', async () => {
    await searchPage.validateCommunitySortOptions();

  });
  test('@regression Validate Plan sorting options', async () => {
    await searchPage.validatePlanSortOptions();
  });

  test('@regression Validate QMI sorting options', async () => {
    await searchPage.validateQMISortOptions();
  });


});