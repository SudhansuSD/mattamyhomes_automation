import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly logo: Locator;
    readonly heroSection: Locator;

    constructor(page: Page) {
        this.page = page;
        this.logo = page.getByRole('img', { name: /mattamy/i });
        this.heroSection = page.locator('section').first();
    }

    async navigate() {
        await this.page.goto("/?country=CAN"); // Navigate to home page for Canada
    }

    // Verify that the home page is loaded
    async verifyPageLoaded() {
        await expect(this.page).toHaveTitle(/Mattamy Homes/i);
        await expect(this.heroSection).toBeVisible();
    }
    // Verify search market functionality
    async verifySearchMarket(market: string) {

        const searchBox = this.page.getByPlaceholder(/Search by City/i);
        await searchBox.click();
        await searchBox.pressSequentially(market, { delay: 400 }); // Enter market name with delay

        await this.page.getByText('Calgary, AB').first().click();

        // Assert market name in query parameter in url
        await this.page.waitForURL(url => url.toString().includes("metro="));

        const url = new URL(this.page.url());
        expect(url.searchParams.get("metro")).toMatch(/Calgary/i);
    }
}

