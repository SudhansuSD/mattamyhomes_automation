import { Page, expect, Locator } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

type ResultsTab = 'Communities' | 'Plans' | 'Quick Move-Ins';
type SortOrder = 'asc' | 'desc';

export class SearchPage extends HomePage {

    readonly sortButton: Locator;
    readonly sortMenuItems: Locator;

    constructor(page: Page) {
        super(page);

        this.sortButton = page.locator('div[aria-label^="Sort by:"] button[aria-label*="dropdown"]');
        this.sortMenuItems = page.locator('div.px-2 button');
    }

    /* ------------------------------------------------------------------
       Locators
    ------------------------------------------------------------------ */

    private filterButton = (label: string) =>
        this.page.locator(`button[aria-label*="${label}"]`);

    // ✅ Stable card locator (avoids duplicates + ensures price exists)
    private resultCards = () =>
        this.page.locator('#ProductInfo');

    private getTabLocator(tabName: string) {
        const nameRegex = new RegExp(tabName, 'i');

        return this.page.locator(`
    button,
    [role="button"],
    [aria-label],
    a
  `).filter({
            hasText: nameRegex
        });
    }

    private dropdownOption = (text: string) =>
        this.page.getByText(text);

    private async openFilter(label: string): Promise<void> {
        await this.filterButton(label).click({ timeout: 15000 });
    }

    /* ------------------------------------------------------------------
       Common Helpers
    ------------------------------------------------------------------ */

    async openTab(tabName: string): Promise<void> {
        let tab;

        switch (tabName.toLowerCase()) {
            case 'plans':
                tab = this.page.getByRole('button', { name: /Plans/i });
                break;

            case 'quick move-ins':
                tab = this.page.getByRole('button', { name: /quick move-ins/i });
                break;

            case 'communities':
                // special case (NOT real tab)
                tab = this.page.locator('div[aria-label*="Communities"]').first();
                break;

            default:
                // 🔥 fallback (generic)
                tab = this.page.locator('button[aria-pressed]').filter({
                    hasText: new RegExp(tabName, 'i')
                });
        }

        const el = tab.first();

        await el.waitFor({ state: 'visible', timeout: 15000 });
        await el.scrollIntoViewIfNeeded();

        const isPressed = await el.getAttribute('aria-pressed');

        if (isPressed === 'true') {
            console.log(`[openTab] '${tabName}' already selected`);
            return;
        }

        await el.click();

        // verify only if attribute exists
        if (await el.getAttribute('aria-pressed') !== null) {
            await expect(el).toHaveAttribute('aria-pressed', 'true');
        }
    }

    private async waitForResultsToLoad(): Promise<void> {
        await this.page.waitForSelector('#ProductInfo', { timeout: 15000 });
        await this.page.waitForTimeout(800);
    }

    private async getCardCount(): Promise<number> {
        await this.waitForResultsToLoad();
        return this.resultCards().count();
    }

    private log(message: string): void {
        console.log(`[SearchPage] ${message}`);
    }

    /* ------------------------------------------------------------------
       Price Utilities (Production Ready)
    ------------------------------------------------------------------ */

    async getAllPrices(): Promise<number[]> {
        const cards = this.page.locator('div.sc-jCJzcv:has(h3)');
        const count = await cards.count();

        const prices: number[] = [];

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);

            const priceLocator = card.locator('span[class*="text-3xl"]');

            // ✅ Handle case: no price element exists
            if (await priceLocator.count() === 0) {
                console.log(`Card ${i + 1}: No price available`);
                continue;
            }

            const priceText = await priceLocator.textContent();

            // ✅ Handle null / empty
            if (!priceText || priceText.trim() === '') {
                console.log(`Card ${i + 1}: Empty price`);
                continue;
            }

            const normalized = priceText.toLowerCase();

            // ✅ Handle "Coming Soon" / "Pricing Coming Soon"
            if (normalized.includes('coming')) {
                console.log(`Card ${i + 1}: Coming soon`);
                continue;
            }

            // ✅ Extract numeric value
            const cleaned = priceText.replace(/[^0-9]/g, '');

            if (!cleaned) {
                console.log(`Card ${i + 1}: Invalid price format -> ${priceText}`);
                continue;
            }

            const price = Number(cleaned);
            prices.push(price);

            console.log(`Card ${i + 1}: ${price}`);
        }

        return prices;
    }

    /* ------------------------------------------------------------------
       Filters
    ------------------------------------------------------------------ */

    // Filter by price

    async filterByPrice(min: string, max: string): Promise<void> {

        this.log(`Applying price filter: ${min} - ${max}`);

        await this.waitForPageReady();

        await this.openFilter('Dropdown price filter');
        await this.dropdownOption('$ No min').click();
        await this.dropdownOption(min).click();

        await this.openFilter('Dropdown price filter');
        await this.dropdownOption('$ No Max').click();
        await this.dropdownOption(max).click();

        await this.waitForResultsToLoad();
    }

    // Filter by beds and baths

    async filterByBedroomsAndBathrooms(
        minBeds: number,
        minBaths: number
    ): Promise<void> {

        await this.waitForPageReady();
        await this.openFilter('Select Beds & Baths');

        await this.selectCategory('Bedrooms', `${minBeds} Bedrooms`);
        await this.selectCategory('Bathrooms', `${minBaths} Bathrooms`);
    }

    private async selectCategory(
        category: 'Bedrooms' | 'Bathrooms',
        option: string
    ): Promise<void> {

        await this.page
            .locator('.truncate', { hasText: new RegExp(category, 'i') })
            .click({ force: true });

        await this.page
            .locator('span', { hasText: option })
            .click({ timeout: 15000, force: true });
    }

    /* ------------------------------------------------------------------
       Validation: Price Range
    ------------------------------------------------------------------ */

    async validatePriceRange(minValue: number, maxValue: number) {

        const tolerance = 0;
        const prices = await this.getAllPrices();

        const format = (p: number) => `$${p.toLocaleString()}`;

        console.log(`\n========== PRICE VALIDATION ==========`);

        console.log(`Range: ${format(minValue)} - ${format(maxValue)}`);
        console.log(`Total Results: ${prices.length}\n`);

        prices.forEach((price, index) => {

            const isValid =
                price >= (minValue - tolerance) &&
                price <= maxValue;

            const status = isValid ? '✅ PASS' : '❌ FAIL';

            console.log(`${status} | ${index + 1}. ${format(price)}`);

            expect(price).toBeGreaterThanOrEqual(minValue - tolerance);
            expect(price).toBeLessThanOrEqual(maxValue);
        });

        console.log(`=====================================\n`);
    }

    /* ------------------------------------------------------------------
       Results Validation
    ------------------------------------------------------------------ */

    async verifyResults(tabName: ResultsTab): Promise<void> {

        await this.openTab(tabName);

        const cards = await this.resultCards();

        await this.waitForPageReady();

        const firstCard = cards.first();

        // check if at least one card is visible
        if (await firstCard.isVisible().catch(() => false)) {

            const count = await cards.count();

            console.log(`✅ Total ${tabName} results detected: ${count}`);

            expect(count).toBeGreaterThan(0);

        } else {
            const noResults = this.page
                .getByRole('status')
                .filter({ hasText: 'No results in this area' })
                .first();
            await expect(noResults).toBeVisible({ timeout: 15000 });                

            const message = await noResults.innerText();
            console.log(`⚠️ No Results Message: ${message.trim()}`);

        }
    }

    /* ------------------------------------------------------------------
       Sorting
    ------------------------------------------------------------------ */

    async selectSortOption(option: string): Promise<void> {

        this.log(`Selecting sort option: ${option}`);

        await this.sortButton.click();

        const menu = this.page.locator('div[role="menu"]').last();
        await expect(menu).toBeVisible();

        await menu.getByRole('button', { name: new RegExp(option, 'i') }).click();

        await this.waitForResultsToLoad();
    }

    async validatePriceSorting(order: SortOrder): Promise<void> {

        const prices = await this.getAllPrices();

        const sorted = [...prices].sort((a, b) =>
            order === 'asc' ? a - b : b - a
        );

        expect(prices).toEqual(sorted);

        this.log(`✅ Price sorting (${order}) validated`);
    }

    /* ------------------------------------------------------------------
       Sort Options Validation
    ------------------------------------------------------------------ */

    async validateSortOptions(
        tabName: ResultsTab,
        required: string[],
        optional: string[] = []
    ): Promise<void> {

        await this.openTab(tabName);

        await this.sortButton.click();

        const options = await this.sortMenuItems.allTextContents();

        required.forEach(opt => expect(options).toContain(opt));

        optional.forEach(opt => {
            if (options.includes(opt)) {
                this.log(`Optional present: ${opt}`);
            }
        });
    }

    /* ------------------------------------------------------------------
       Tab-Specific Sorting
    ------------------------------------------------------------------ */

    async validateCommunitySortOptions(): Promise<void> {
        await this.openTab('Communities');

        await this.validateSortOptions(
            'Communities',
            ['$ - $$$', 'A - Z', 'Availability'],
            ['Featured']
        );
    }

    async validatePlanSortOptions(): Promise<void> {
        await this.openTab('Plans');

        await this.validateSortOptions(
            'Plans',
            ['$ - $$$', 'Sq. Ft.', 'A - Z']
        );
    }

    async validateQMISortOptions(): Promise<void> {
        await this.openTab('Quick Move-In');

        await this.validateSortOptions(
            'Quick Move-Ins',
            ['Date', '$ - $$$', 'Sq. Ft.', 'A - Z']
        );
    }
}