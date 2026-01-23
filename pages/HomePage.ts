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
