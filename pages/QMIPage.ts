import { Locator, Page, expect } from '@playwright/test';
import { HomePage } from './HomePage';

export class QMIPage extends HomePage {

    readonly heading: Locator;
    readonly homeDetails: Locator;
    readonly priceSection: Locator;

    // readonly requestInfoButton: Locator;

    constructor(page: Page) {

        super(page);
        // Locators (robust + production-friendly)
        this.heading = page.locator('h1');;
        this.homeDetails = page.locator('.fgLMOj').nth(1);
        this.priceSection = page.locator('.hmfjfl');
    }
    // -----------------------------
    // QMI Home Search
    // -----------------------------
    async verifySearchByQMI() {

        // Ensure page content is ready
        await expect(this.heading).toBeVisible({ timeout: 20000 });
        const countryContainer = this.page.locator('#countryContainer');
        await expect(countryContainer).toBeVisible({ timeout: 10000 });
        const countryText = (await countryContainer.textContent())?.toUpperCase() || '';
        if (countryText.includes('CANADA')) {
            await expect(this.heading).toContainText(/1230 148 Avenue NW/i);
        } else if (countryText.includes('USA')) {
            await expect(this.heading).toContainText(/123 Appalachian Trail/i);
        } else {
            throw new Error(`Unknown country detected: ${countryText}`);
        }
    }

    async verifyCommunityDetails() {
        await expect(this.homeDetails).toBeVisible();
    }

    async verifyPriceOrCTA() {
        await expect(this.priceSection).toBeVisible();
    }

    
}