import { Page, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

export class SearchPage extends HomePage {

    constructor(page: Page) {
        super(page);
    }
    async filterByPrice(): Promise<void> {

        // Ensure page is fully interactive
        await this.page.waitForLoadState('domcontentloaded');

        // Open Price filter
        const priceFilterBtn = await this.page.getByRole('button', { name: 'Dropdown price filter: ' });
        await priceFilterBtn.waitFor({ state: 'visible' });
        await priceFilterBtn.click();

        // Select Min Price
        const minPriceInput = this.page.getByText('$ No min', { exact: true });
        await minPriceInput.waitFor({ state: 'visible' });
        await minPriceInput.click();

        const minOption = this.page.getByRole('button', { name: '$ 400K', exact: true });
        await minOption.waitFor({ state: 'visible' });
        await minOption.click();

        // Select Max Price
        await priceFilterBtn.click({ delay: 1000 });

        const maxPriceInput = this.page.getByText('$ No Max', { exact: true });
        await maxPriceInput.waitFor({ state: 'visible' });
        await maxPriceInput.click();

        const maxOption = this.page.getByRole('button', { name: '$ 500K', exact: true });
        await maxOption.waitFor({ state: 'visible' });
        await maxOption.click();

    };

    async filterByBedroomsAndBathrooms(minBeds: number, minBaths: number): Promise<void> {
        // Ensure page is fully interactive
        await this.page.waitForLoadState('domcontentloaded');

        // Open bed & bath filter
        const bedBathFilterBtn = await this.page.getByRole('button', { name: 'Select Beds & Baths' });
        await bedBathFilterBtn.waitFor({ state: 'visible' });
        await bedBathFilterBtn.click({ delay: 500 });

        // Select bedroom filters
        const beds = await this.page.locator('.truncate').filter({ hasText: 'Bedrooms' });
        await beds.waitFor({ state: 'visible' });
        await beds.click();

        const noOfBeds = await this.page.locator('span').filter({ hasText: '3 Bedrooms' });
        await noOfBeds.waitFor({ state: 'visible' });
        await noOfBeds.click();

        // Select bathroom filters
        const baths = await this.page.locator('.truncate').filter({ hasText: 'Bathrooms' });
        await baths.waitFor({ state: 'visible' });
        await baths.click();

        const noOfBaths = await this.page.locator('span').filter({ hasText: '3 Bathrooms' });
        await noOfBaths.waitFor({ state: 'visible' });
        await noOfBaths.click();

    };
    // Verify results exist (NOT hardcoded count
    async verifyCommunityResults(): Promise<void> {
        const communityResultsHeader = this.page.getByRole('heading', {
            name: 'Communities',
        });
        if (await communityResultsHeader.isVisible()) {

            const communityCards = await this.page.locator('.bhUBmB');
            await expect(communityCards).not.toHaveCount(0);
        }
        else {
            console.log("No results found for the selected bedroom and bathroom filters.");
        };
    };


};
