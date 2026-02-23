import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getLocationConfig } from '../config/locations';

const locationConfig = getLocationConfig

export class HomePage extends BasePage {
    readonly heroSection: Locator;
    readonly header: Locator;
    readonly searchBox: Locator;
    // readonly searchResults: Locator;

    constructor(page: Page) {
        super(page);
        this.heroSection = page.locator('section').first();
        this.header = page.locator('header');

        // ⚠️ keep original casing
        this.searchBox = page.getByPlaceholder(/Search by City/i);

        // 🔑 dropdown container (this is the key fix)
        // this.searchResults = page.locator('[role="listbox"]');
    }

    // ----------------------------------
    // Page Load
    // ----------------------------------
    async verifyPageLoaded() {

        await this.page.waitForLoadState('domcontentloaded');
        await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.page).toHaveTitle(/Mattamy Homes/i);

        try {
            await expect(this.header).toBeVisible({ timeout: 30000 });
        } catch {
            console.warn('Header not visible within 30s — continuing');
        }
    }

    // ----------------------------------
    // Market Search
    // ----------------------------------
    async searchByMarket(market: 'Calgary' | 'GTA' | 'Phoenix') {
        await this.typeIntoSearch(market);

        const marketOption = this.getMarketLocator(market).first();
        await this.clickSearchResult(marketOption);

        await this.waitForMarketRouting();
    }

    async verifySearchByMarket() {

        await this.page.waitForLoadState('domcontentloaded');
        const params = new URL(this.page.url()).searchParams;

        if (params.get('country') === 'CAN') {
            expect(params.get('metro')).toMatch(/calgary|gta/i);
        } else {
            expect(params.get('metro')).toMatch(/phoenix/i);
        }
    }

    // ----------------------------------
    // Community Search
    // ----------------------------------
    async searchByCommunity(community: 'Yorkville' | 'Landmarke') {
        await this.typeIntoSearch(community);

        const communityOption = this.getCommunityLocator(community).first();
        await this.clickSearchResult(communityOption);
    }

    async verifySearchByCommunity() {

        await this.page.waitForLoadState('domcontentloaded');
        const heading = this.page.locator('h1');
        await expect(heading).toBeVisible({ timeout: 20000 });

        const countryContainer = this.page.locator('#countryContainer');
        await expect(countryContainer).toBeVisible({ timeout: 10000 });

        const countryText = (await countryContainer.textContent() || '').toUpperCase();

        if (countryText.includes('CAN')) {
            await expect(heading).toContainText(/yorkville/i);
        } else if (countryText.includes('USA')) {
            await expect(heading).toContainText(/landmarke/i);
        } else {
            throw new Error(`Unknown country detected: ${countryText}`);
        }
    }

    // ----------------------------------
    // QMI Search
    // ----------------------------------
    async searchByQMI(qmiHome: '1234 148 Avenue NW' | '263 W FLAX DR') {
        await this.page.waitForLoadState('domcontentloaded');
        await this.typeIntoSearch(qmiHome);

        const qmiOption = this.getQmiLocator(qmiHome).first();
        await this.clickSearchResult(qmiOption);
    }

    // ----------------------------------
    // Plan Search
    // ----------------------------------
    async searchByPlan(planName: 'Brinkley I' | 'Aqua') {
        await this.page.waitForLoadState('domcontentloaded');
        await this.typeIntoSearch(planName);
        const planOption = this.getPlanLocator(planName);
        await this.clickSearchResult(planOption);
    }

    private async typeIntoSearch(value: string) {
        await this.searchBox.click();
        await this.searchBox.fill('');
        await this.searchBox.pressSequentially(value, { delay: 500 });
    }

    // DO NOT override locator here
    private async clickSearchResult(result: Locator) {

        await expect(result).toBeVisible({ timeout: 15000 });
        await result.scrollIntoViewIfNeeded();
        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            result.click()
        ]);
    }

    // Works for CAN + USA (path OR query)
    private async waitForMarketRouting() {
        const startUrl = this.page.url();

        await this.page.waitForFunction(
            prev => window.location.href !== prev,
            startUrl,
            { timeout: 20000 }
        );

        await this.page.waitForLoadState('domcontentloaded');
    }

    private getMarketLocator(market: string): Locator {
        switch (market) {
            case 'Calgary':
                return this.page.getByText(/Calgary, AB/i);
            case 'GTA':
                return this.page.getByText(/GTA, ON/i);
            case 'Phoenix':
                return this.page.getByText(/Phoenix, AZ/i);
            default:
                throw new Error(`Unknown market: ${market}`);
        }
    }

    private getCommunityLocator(community: string): Locator {
        switch (community) {
            case 'Yorkville':
                return this.page.getByText(/Yorkville/i);
            case 'Landmarke':
                return this.page.getByText(/Landmarke/i);
            default:
                throw new Error(`Unknown community: ${community}`);
        }
    }

    private getQmiLocator(qmiHome: string): Locator {
        switch (qmiHome) {
            case '1234 148 Avenue NW':
                return this.page.getByText(/1234 148 Avenue NW/i);
            case '263 W FLAX DR':
                return this.page.getByText(/263 W FLAX DR/i);
            default:
                throw new Error(`Unknown QMI Home: ${qmiHome}`);
        }
    }
    private getPlanLocator(planOption: string): Locator {

        switch (planOption) {
            case 'Brinkley I':
                return this.page.locator('a[href*="yorkville/brinkley-i"]').first();

            case 'Aqua':
                return this.page.locator('a[href*="/san-tan-valley/landmarke-50s/aqua"]').first();

            default:
                throw new Error(`Unknown plan option: ${planOption}`);
        }

    }


}

