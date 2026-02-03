import { Page, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

export class SearchPage extends HomePage {
    constructor(page: Page) {
        super(page);
    }

    /* -------------------------
       Common helpers
    --------------------------*/

    private async openFilter(buttonName: string): Promise<void> {
        const filterBtn = this.page.getByRole('button', { name: buttonName });
        await filterBtn.waitFor({ state: 'visible' });
        await filterBtn.click();
    }

    private async selectOption(label: string): Promise<void> {
        const option = this.page.getByRole('button', { name: label, exact: true });
        await option.waitFor({ state: 'visible' });
        await option.click();
    }

    /* -------------------------
       Price filter
    --------------------------*/

    async filterByPrice(minPrice: string, maxPrice: string): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');

        await this.openFilter('Dropdown price filter:');

        await this.page.getByText('$ No min', { exact: true }).click();
        await this.selectOption(minPrice);

        await this.openFilter('Dropdown price filter:');

        await this.page.getByText('$ No Max', { exact: true }).click();
        await this.selectOption(maxPrice);
    }

    /* -------------------------
       Beds & Baths filter
    --------------------------*/

    async filterByBedroomsAndBathrooms(
        minBeds: number,
        minBaths: number
    ): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');

        await this.openFilter('Select Beds & Baths');

        await this.selectCategory('Bedrooms', `${minBeds} Bedrooms`);
        await this.selectCategory('Bathrooms', `${minBaths} Bathrooms`);
    }

    private async selectCategory(
        categoryName: 'Bedrooms' | 'Bathrooms',
        optionText: string
    ): Promise<void> {
        const category = this.page.locator('.truncate', { hasText: categoryName });
        await category.click();

        const option = this.page.locator('span', { hasText: optionText });
        await option.waitFor({ state: 'visible' });
        await option.click();
    }

    /* -------------------------
       Results validation
    --------------------------*/

    async verifyCommunityResults(): Promise<void> {
        const header = this.page.getByRole('heading', { name: 'Communities' });

        if (await header.isVisible()) {
            const communityCards = this.page.locator('.bhUBmB');
            await expect(communityCards).not.toHaveCount(0);
            ;
        } else {
            console.info(
                'No community results found for the selected filters.'
            );
        }
    }
}
