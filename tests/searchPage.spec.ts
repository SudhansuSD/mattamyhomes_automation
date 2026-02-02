/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/searchPage.spec.ts
 * Search Page Tests
 * @file tests/search/searchPage.spec.ts
 * @description Tests for search and filter functionality on Mattamy Homes
 */

import { test } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

test.describe(`Search Page Tests – ${location.country}`, () => {

  test('Verify filter by price functionality', async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.searchByMarket(location.market);
    await searchPage.verifySearchByMarket();

    await searchPage.filterByPrice();
    await searchPage.verifyCommunityResults();
  });

  test('Verify filter by bedrooms and bathrooms functionality', async ({ page }) => {
    const searchPage = new SearchPage(page);

    await searchPage.navigate();

    await searchPage.searchByMarket(location.market);
    await searchPage.verifySearchByMarket();

    await searchPage.filterByBedroomsAndBathrooms(3, 3);
    await searchPage.verifyCommunityResults();
  });

});
