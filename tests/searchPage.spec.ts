/** Search Page Tests 
 * @file tests/searchPage.spec.ts
 * @description This file contains tests for the search functionality on the Mattamy Homes website.
*/
import { test } from '@playwright/test';
import { SearchPage } from '../pages/searchPage';

test.describe('Search Page Tests', () => {

    test('Verify filter by price Functionality', async ({ page }) => {

        const searchPage = new SearchPage(page);
        // Navigate to the Mattamy Homes Canada homepage

        await searchPage.navigate();
        // Verify market search functionality
        await searchPage.verifySearchMarket("Calgary");
        // Verify filter by price functionality
        await searchPage.verifyFilterByPrice();

    });
});