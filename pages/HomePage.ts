// import { Page, Locator, expect } from '@playwright/test';
// import { BasePage } from './BasePage';
// import path from 'path';
// import fs from 'fs';

// export class HomePage extends BasePage {
//     readonly logo: Locator;
//     readonly heroSection: Locator;

//     constructor(page: Page) {
//         super(page);
//         this.logo = page.getByRole('img', { name: /mattamy/i });
//         this.heroSection = page.locator('section').first();
//     }

//     async verifyPageLoaded() {
//         // Wait for main header to ensure app is ready, then assert title.
//         await this.page.waitForSelector('header', { timeout: 30000 });
//         await expect(this.page).toHaveTitle(/Mattamy Homes/i);

//         // Try to assert hero section visible but don't fail too quickly if it's delayed
//         try {
//             await expect(this.heroSection).toBeVisible({ timeout: 10000 });
//         } catch (e) {
//             console.warn('Hero section not visible within 10s — continuing');
//         }
//     }


//     // Search for market
//     async searchByMarket(market: string) {
//         await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });

//         const searchBox = this.page.getByPlaceholder(/Search by City/i);
//         await searchBox.click();

//         // Type sequentially with a small delay to mimic user typing and trigger suggestions
//         await searchBox.pressSequentially(market, { delay: 500 });
//         if (market === "Calgary") {
//             const suggestion = this.page.getByText("Calgary, AB", { exact: false }).first();
//             await suggestion.waitFor({ state: 'visible', timeout: 7000 });
//             await suggestion.scrollIntoViewIfNeeded();
//             await suggestion.click({ timeout: 7000 });
//         } else if (market === "GTA") {
//             const suggestion = this.page.getByText("GTA, ON", { exact: false }).first();
//             await suggestion.waitFor({ state: 'visible', timeout: 7000 });
//             await suggestion.scrollIntoViewIfNeeded();
//             await suggestion.click({ timeout: 7000 });
//         } else if (market === "Phoenix") {
//             const suggestion = this.page.getByText("Phoenix, AZ", { exact: false }).first();
//             await suggestion.waitFor({ state: 'visible', timeout: 7000 });
//             await suggestion.scrollIntoViewIfNeeded();
//             await suggestion.click({ timeout: 7000 });
//         }
//     }
//     // Assert market name in query parameter in url
//     async verifySearchByMarket() {
//         await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
//         await this.page.waitForURL(url => url.toString().includes("metro="));

//         const url = new URL(this.page.url());
//         if (this.page.url().includes('country=CAN')) {
//             expect(url.searchParams.get("metro")).toMatch(/(?:Calgary|GTA)/i);

//         } else if (this.page.url().includes('country=USA')) {
//             await expect(url.searchParams.get("metro")).toMatch(/Phoenix/i);
//         }
//     }
//     async searchByCommunity(community: string) {
//         const searchBox = this.page.getByPlaceholder(/Search by City/i);
//         await searchBox.click();

//         // Type community name sequentially to trigger suggestions
//         await searchBox.pressSequentially(community, { delay: 500 });

//         if (community === "Yorkville") {
//             const suggestion = this.page.getByText("Yorkville", { exact: false }).first();
//             await suggestion.waitFor({ state: 'visible', timeout: 7000 });
//             await suggestion.scrollIntoViewIfNeeded();
//             await suggestion.click({ timeout: 7000 });
//         } else if (community === "Blackhawk") {
//             const suggestion = this.page.getByText("Blackhawk", { exact: false }).first();
//             await suggestion.waitFor({ state: 'visible', timeout: 7000 });
//             await suggestion.scrollIntoViewIfNeeded();
//             await suggestion.click({ timeout: 7000 });
//         }
//     }
//     // Assert page heading contains community name
//     async verifySearchByCommunity() {
//         const pageHeading = this.page.getByRole('heading');
//         await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
//         if (this.page.url().includes('country=CAN')) {
//             await expect(pageHeading).toContainText(/Yorkville/i);
//         } else if (this.page.url().includes('country=USA')) {
//             await expect(pageHeading).toContainText(/Blackhawk/i);
//         }

//     };

// }


import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    readonly heroSection: Locator;
    readonly header: Locator;

    constructor(page: Page) {
        super(page);
        this.heroSection = page.locator('section').first();
        this.header = page.locator('header');
    }

    async verifyPageLoaded() {
        // ✅ Business-ready signal (not full load)
        await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.page).toHaveTitle(/Mattamy Homes/i);

        try {
            await expect(this.header).toBeVisible({ timeout: 30000 });
        } catch {
            console.warn('Header not visible within 30s — continuing');
        }
    }

    // -----------------------------
    // Market Search
    // -----------------------------
    async searchByMarket(market: string) {
        const searchBox = this.page.getByPlaceholder(/Search by City/i);

        await searchBox.click();
        await searchBox.fill(''); // reset
        await searchBox.pressSequentially(market, { delay: 500 });


        let searchedMarket: Locator;

        if (market === 'Calgary') {
            searchedMarket = this.page.getByText('Calgary, AB');
        } else if (market === 'GTA') {
            searchedMarket = this.page.getByText('GTA, ON');
        } else {
            searchedMarket = this.page.getByText('Phoenix, AZ');
        }

        await expect(searchedMarket.first()).toBeVisible({ timeout: 15000 });

        // 🔑 KEY FIX → stop Playwright waiting for navigation
        await searchedMarket.first().click({ noWaitAfter: true });

        // ✅ Wait for SPA routing signal
        await this.page.waitForURL(
            url => url.toString().includes('metro='),
            { timeout: 20000 }
        );
    }

    async verifySearchByMarket() {
        const url = new URL(this.page.url());
        if (this.page.url().includes('country=CAN')) {
            expect(url.searchParams.get('metro')).toMatch(/Calgary|GTA/i);
        } else {
            expect(url.searchParams.get('metro')).toMatch(/Phoenix/i);
        }
    }

    // -----------------------------
    // Community Search
    // -----------------------------
    async searchByCommunity(community: string) {

        const searchBox = this.page.getByPlaceholder(/Search by City/i);
        let searchedCommunity: Locator;
        await searchBox.click();
        await searchBox.fill('');
        await searchBox.pressSequentially(community, { delay: 500 });

        if (community === 'Yorkville') {
            searchedCommunity = this.page.getByText(/Yorkville/i);
        } else {
            searchedCommunity = this.page.getByText(/Blackhawk/i);
        }

        await expect(searchedCommunity.first()).toBeVisible({ timeout: 15000 });

        // 🔑 Same fix here
        await searchedCommunity.first().click({ noWaitAfter: true });
    }

    async verifySearchByCommunity() {
        const heading = this.page.locator('h1');

        // Ensure page content is ready
        await expect(heading).toBeVisible({ timeout: 20000 });

        const countryContainer = this.page.locator('#countryContainer');
        await expect(countryContainer).toBeVisible({ timeout: 10000 });

        const countryText = (await countryContainer.textContent())?.toUpperCase() || '';

        if (countryText.includes('CANADA')) {
            await expect(heading).toContainText(/Yorkville/i);
        } else if (countryText.includes('USA')) {
            await expect(heading).toContainText(/Blackhawk/i);
        } else {
            throw new Error(`Unknown country detected: ${countryText}`);
        }
    }
}
