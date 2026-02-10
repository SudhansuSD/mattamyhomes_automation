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

        await this.page.locator(
            'button[aria-label*="' + buttonName + '"]'
        )
            .click({ timeout: 15000 });
    }

    private async selectOption(label: string): Promise<void> {

        await this.page.waitForLoadState('domcontentloaded');
        await this.page.getByText(label)
            .click({ timeout: 15000 });
    }

    /* -------------------------
       Price filter
    --------------------------*/

    async filterByPrice(): Promise<void> {


        await this.page.waitForLoadState('domcontentloaded');

        await this.openFilter('Dropdown price filter');

        await this.page.getByText('$ No min', { exact: true }).click();
        await this.selectOption('400K');

        await this.openFilter('Dropdown price filter');

        await this.page.getByText('$ No Max', { exact: true }).click();
        await this.selectOption('500K');
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
        await this.page
            .locator('.truncate', { hasText: new RegExp(categoryName, 'i') })
            .click({ force: true });

        await this.page
            .locator('span', { hasText: optionText })
            .click({ timeout: 15000, force: true });
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
