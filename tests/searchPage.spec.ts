/** Search Page Tests 
 * @file tests/searchPage.spec.ts
 * @description This file contains tests for the search functionality on the Mattamy Homes website.
*/
import { test } from '@playwright/test';
import { SearchPage } from '../pages/searchPage';
import { CountryCode } from '../utils/country';

const country: CountryCode = 'CAN';

test.describe('Search Page Tests', () => {

    test('Verify filter by price Functionality', async ({ page }) => {

        const searchPage = new SearchPage(page);    
        // Navigate to the Mattamy Homes Canada homepage

        await searchPage.navigate(country);
        // Verify market search functionality
        await searchPage.searchByMarket("GTA");
        await searchPage.verifySearchByMarket();
        // Verify filter by price functionality
        await searchPage.filterByPrice();
        await searchPage.verifyCommunityResults();

    });
    test('Verify filter by beadrooms and bathrooms functionality', async ({ page }) => {

        const searchPage = new SearchPage(page);    
        // Navigate to the Mattamy Homes Canada homepage')
        await searchPage.navigate(country);
        // Verify market search functionality
        await searchPage.searchByMarket("Calgary");
        await searchPage.verifySearchByMarket(); 
        // Verify filter by bedrooms and bathrooms functionality
        await searchPage.filterByBedroomsAndBathrooms(3, 3);
                await searchPage.verifyCommunityResults();


    });
});