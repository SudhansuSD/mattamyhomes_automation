import { Page, expect, Locator } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

type ResultsTab = 'Communities' | 'Plans' | 'Quick Move-Ins';
type SortOrder = 'asc' | 'desc';
type SortCriterion = 'price' | 'sqft' | 'title';

type SortValidationConfig = {
    option: string;
    criterion: SortCriterion;
    label: string;
};

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

    // Keep assertions scoped to cards visible in the active tab.
    private resultCards = () =>
        this.page.locator('#ProductInfo:visible');

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
        const button = this.filterButton(label);

        await this.waitForPageReady();

        await expect(button).toBeVisible({ timeout: 20000 });
        await expect(button).toBeEnabled({ timeout: 20000 });

        await button.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        await button.click({ timeout: 20000 });
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
                tab = this.page.getByRole('button', { name: /quick move-ins/i }).first();
                break;

            case 'communities':
                tab = this.page.locator('div[aria-label*="Communities"]').first();
                break;

            default:
                tab = this.page.locator('button[aria-pressed]').filter({
                    hasText: new RegExp(tabName, 'i')
                }).first();
        }

        await tab.waitFor({ state: 'visible', timeout: 15000 });
        await tab.scrollIntoViewIfNeeded();

        const isPressed = await tab.getAttribute('aria-pressed');

        if (isPressed === 'true') {
            console.log(`[openTab] '${tabName}' is already selected`);
            return;
        }

        await tab.click();

        if (isPressed !== null) {
            await expect(tab).toHaveAttribute('aria-pressed', 'true');
        }
    }

    private async waitForResultsToLoad(): Promise<void> {
        await this.page.waitForSelector('#ProductInfo:visible', { timeout: 15000 });
        await this.page.waitForTimeout(800);
    }

    private async getCardCount(): Promise<number> {
        await this.waitForResultsToLoad();
        return this.resultCards().count();
    }

    private log(message: string): void {
        console.log(`[SearchPage] ${message}`);
    }

    private normalizeSortOption(text: string): string {
        return text.replace(/\s+/g, ' ').trim().toLowerCase();
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private async getVisibleCardSignature(): Promise<string> {
        const cards = this.resultCards();
        const count = await cards.count();
        const visibleTexts: string[] = [];

        for (let i = 0; i < Math.min(count, 5); i++) {
            visibleTexts.push((await cards.nth(i).innerText().catch(() => '')).trim());
        }

        return visibleTexts.join('|');
    }

    private async getDisplayedResultCount(tabName: ResultsTab): Promise<number | null> {
        const resultLabel = tabName === 'Quick Move-Ins' ? 'quick move-ins' : tabName.toLowerCase();
        const statusPattern = new RegExp(`\\d+\\s+${this.escapeRegex(resultLabel)}\\s+available`, 'i');
        const status = this.page
            .locator("div[role='status'], [role='status']")
            .filter({ hasText: statusPattern })
            .first();
        const text = await status.innerText({ timeout: 5000 }).catch(() => '');
        const count = Number(text.match(/\d+/)?.[0]);

        return Number.isFinite(count) ? count : null;
    }

    private async getSortableCardCount(tabName: ResultsTab, availableCards: number): Promise<number> {
        const displayedCount = await this.getDisplayedResultCount(tabName);

        if (displayedCount === null) {
            return availableCards;
        }

        if (availableCards > displayedCount) {
            this.log(`${tabName}: limiting ${availableCards} visible cards to ${displayedCount} displayed results`);
        }

        return Math.min(availableCards, displayedCount);
    }

    private parseSqFtValue(text: string): number | null {
        const match = text.match(/([\d,]+(?:\s*-\s*[\d,]+)?)\s*Sq\.?\s*Ft/i);

        if (!match) {
            return null;
        }

        const values = match[1]
            .match(/[\d,]+/g)
            ?.map(value => Number(value.replace(/,/g, '')))
            .filter(value => !Number.isNaN(value)) ?? [];

        return values[0] ?? null;
    }

    /* ------------------------------------------------------------------
       Price Utilities (Production Ready)
    ------------------------------------------------------------------ */

    async getAllPrices(): Promise<number[]> {
        const cards = this.resultCards();
        const count = await cards.count();

        const prices: number[] = [];

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);

            const nameLocator = card.locator('h3').first();
            const name = (await nameLocator.textContent())?.trim() || `Card ${i + 1}`;

            // ✅ Find all spans inside card and pick only the first clean price like "$459,999"
            const priceSpans = card.locator('span');
            const spanTexts = await priceSpans.allTextContents();

            const priceText = spanTexts.find(text => /^\$\d[\d,]*$/.test(text.trim()));

            // ✅ Handle case: no valid price text found
            if (!priceText) {
                console.log(`Card ${i + 1}: ${name} - No price available`);
                continue;
            }

            const normalized = priceText.toLowerCase();

            // ✅ Handle "Coming Soon" / "Pricing Coming Soon"
            if (normalized.includes('coming')) {
                console.log(`Card ${i + 1}: ${name} - Coming soon`);
                continue;
            }

            // ✅ Extract only numeric part safely
            const match = priceText.match(/\$([\d,]+)/);

            if (!match) {
                console.log(`Card ${i + 1}: ${name} - Invalid price format -> ${priceText}`);
                continue;
            }

            const price = Number(match[1].replace(/,/g, ''));

            prices.push(price);

            console.log(`Card ${i + 1}: ${name} - ${price}`);
        }

        return prices;
    }

    /* =================================================================
       FILTERS
    ================================================================= */

    /* ------------------------------------------------------------------
    Filter by price
    ------------------------------------------------------------------ */
    async filterByPrice(minPrice: number, maxPrice: number): Promise<void> {


        await this.waitForPageReady();
        
        const minPriceLabel = this.formatPriceToUiLabel(minPrice);
        const maxPriceLabel = this.formatPriceToUiLabel(maxPrice);

        console.log(`Applying Price Filter: ${minPriceLabel} - ${maxPriceLabel}`);

        await this.openFilter('Dropdown price filter');
        await this.dropdownOption('$ No min').click();
        await this.dropdownOption(minPriceLabel).click();

        await this.openFilter('Dropdown price filter');
        await this.dropdownOption('$ No Max').click();
        await this.dropdownOption(maxPriceLabel).click();

        await this.waitForResultsToLoad();
    }

    
    /* ------------------------------------------------------------------
       Validation: Price Range
    ------------------------------------------------------------------ */

    async validatePriceRangeAcrossTabs(min: number, max: number): Promise<void> {
        const tabs: ResultsTab[] = ['Communities', 'Plans', 'Quick Move-Ins'];
        const allFailures: string[] = [];

        for (const tab of tabs) {
            console.log(`\n🔎 Validating price filter for ${tab} tab: `);

            try {
                await this.verifyResults(tab);

                const failures = await this.validatePriceRange(min, max, tab);

                if (failures.length > 0) {
                    allFailures.push(
                        `\n[${tab}]\n${failures.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
                    );
                }

            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);

                console.log(`❌ ${tab} validation could not complete`);
                allFailures.push(`\n[${tab}] Validation error:\n${message}`);
            }
        }

        if (allFailures.length > 0) {
            throw new Error(
                `❌ Price filter validation failed across tabs:\n${allFailures.join('\n')}`
            );
        }

        console.log(`\n🎯 Price filter validation passed across all tabs`);
    }

    /* ------------------------------------------------------------------
       Validation: Price on each card
    ------------------------------------------------------------------ */

    async validatePriceRange(
        minValue: number,
        maxValue: number,
        tabName?: ResultsTab
    ): Promise<string[]> {
        const tolerance = 0;
        const prices = await this.getAllPrices();

        console.log(`\n========== PRICE VALIDATION${tabName ? `: ${tabName}` : ''} ==========`);
        console.log(`Range: ${this.formatPrice(minValue)} - ${this.formatPrice(maxValue)}`);
        console.log(`Total Results: ${prices.length}\n`);

        const failures: string[] = [];

        prices.forEach((price, index) => {
            const isValid =
                price >= (minValue - tolerance) &&
                price <= maxValue;

            const formattedPrice = this.formatPrice(price);
            const status = isValid ? '✅ PASS' : '❌ FAIL';

            console.log(`${status} | Card ${index + 1}. ${formattedPrice}`);

            if (!isValid) {
                failures.push(
                    `Card ${index + 1}. ${formattedPrice} is outside range ${this.formatPrice(minValue)} - ${this.formatPrice(maxValue)}`
                );
            }
        });

        if (failures.length > 0) {
            console.log(`\n❌ Price validation failures found${tabName ? ` for ${tabName}` : ''}:`);
            failures.forEach((failure, index) => {
                console.log(`Card ${index + 1}. ${failure}`);
            });
        } else {
            console.log(`✅ All prices are within range${tabName ? ` for ${tabName}` : ''}`);
        }

        console.log(`=====================================\n`);

        return failures;
    }

    /*-------------------------------------------------------------------
    Filter by beds and baths
    ------------------------------------------------------------------ */

    async filterByBedroomsAndBathrooms(
        minBeds: number,
        minBaths: number
    ): Promise<void> {
        await this.waitForPageReady();
        await this.openFilter('Select Beds & Baths');

        await this.page.locator('span').filter({ hasText: 'Bedrooms' }).click();
        await this.page.getByRole('checkbox', { name: `${minBeds} Bedrooms` }).click();

        await this.page.locator('span').filter({ hasText: 'Bathrooms' }).click();
        await this.page.getByRole('checkbox', { name: `${minBaths} Bathrooms` }).click();

    }
    /* ------------------------------------------------------------------
       Validation: Beds & Baths
    ------------------------------------------------------------------ */

    async validateBedsBathsAcrossTabs(minBeds: number, minBaths: number): Promise<void> {
        const tabs: ResultsTab[] = ['Communities', 'Plans', 'Quick Move-Ins'];
        const allMismatches: string[] = [];

        for (const tab of tabs) {
            console.log(`\n🔎 Validating beds & baths on tab: ${tab}`);

            await this.verifyResults(tab);

            const mismatches = await this.validateBedsBaths(minBeds, minBaths, tab);
            allMismatches.push(...mismatches);
        }

        expect(
            allMismatches,
            `Beds & Baths filter validation failed:\n${allMismatches.join('\n')}`
        ).toHaveLength(0);
    }
    /* ------------------------------------------------------------------
       Validation: Beds & Baths on each card
    ------------------------------------------------------------------ */

    async validateBedsBaths(
        minBeds: number,
        minBaths: number,
        tabName?: ResultsTab
    ): Promise<string[]> {
        const cards = this.resultCards();
        const count = await cards.count();

        const mismatches: string[] = [];

        console.log(`\n========== BEDS & BATHS VALIDATION${tabName ? `: ${tabName}` : ''} ==========`);

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);

            // Safely get card text
            const text = await card.innerText().catch(() => '');

            // Regex extraction
            const bedsMatch = text.match(/(\d+)\s*Beds?/i);
            const bathsMatch = text.match(/(\d+)\s*Baths?/i);

            const beds = bedsMatch ? Number(bedsMatch[1]) : null;
            const baths = bathsMatch ? Number(bathsMatch[1]) : null;

            // Skip if no info found
            if (beds === null && baths === null) {
                console.log(`⚠️ Card ${i + 1}: No beds/baths info → Skipped`);
                continue;
            }

            let isValid = true;
            let reason = '';

            if (beds !== null && beds < minBeds) {
                isValid = false;
                reason += `Beds ${beds} < ${minBeds}. `;
            }

            if (baths !== null && baths < minBaths) {
                isValid = false;
                reason += `Baths ${baths} < ${minBaths}. `;
            }

            const logLine = `Card ${i + 1} | Beds: ${beds ?? 'N/A'} | Baths: ${baths ?? 'N/A'}`;

            if (isValid) {
                console.log(`✅ PASS | ${logLine}`);
            } else {
                console.log(`❌ FAIL | ${logLine} | ${reason.trim()}`);
                mismatches.push(`${tabName ?? 'Unknown Tab'} - ${logLine} | ${reason.trim()}`);
            }
        }

        console.log(`============================================================\n`);

        return mismatches;
    }

    /* ------------------------------------------------------------------
       Results Validation
    ------------------------------------------------------------------ */

    async verifyResults(tabName: ResultsTab): Promise<void> {
        await this.openTab(tabName);
        await this.waitForPageReady();

        // wait briefly after tab switch
        await this.page.waitForTimeout(2000);

        const cards = await this.resultCards();
        const noResults = this.page
            .getByRole('status')
            .filter({ hasText: 'No results in this area' })
            .first();

        // Wait for either cards OR no-results
        await Promise.race([
            cards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => { }),
            noResults.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { })
        ]);

        const count = await cards.count();
        console.log(`📋 ${tabName} results count: ${count}`);

        if (count > 0) {
            const countLabel = this.page.locator("div[role='status']").first();
            await expect(countLabel).toBeVisible();

            const countText = await countLabel.innerText();
            const displayedCount = Number(countText.match(/\d+/)?.[0]);

            console.log(`📊 ${tabName} displayed count: ${displayedCount}`);
            console.log(`📦 ${tabName} actual cards count: ${count}`);

            expect(displayedCount).toBeGreaterThan(0);
            expect(count).toBeGreaterThan(0);

            return;
        }

        if (await noResults.isVisible().catch(() => false)) {
            const message = await noResults.innerText();
            console.log(`⚠️ No Results Message: ${message.trim()}`);
            return;
        }

        throw new Error(`❌ ${tabName}: No results AND no "No results" message found`);
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
        await this.waitForResultsToLoad();
        await this.sortButton.click();

        const options = (await this.sortMenuItems.allTextContents())
            .map(option => option.trim())
            .filter(Boolean);
        const normalizedOptions = options.map(option => this.normalizeSortOption(option));

        console.log(`\n========== SORT OPTIONS VALIDATION: ${tabName} ==========`);

        required.forEach(opt => {
            const normalizedOption = this.normalizeSortOption(opt);
            const isPresent = normalizedOptions.includes(normalizedOption);

            console.log(`${isPresent ? '✅' : '❌'} Required: ${opt}`);

            expect(normalizedOptions, `Missing required sort option: ${opt}`).toContain(normalizedOption);
        });

        optional.forEach(opt => {
            const isPresent = normalizedOptions.includes(this.normalizeSortOption(opt));

            console.log(`${isPresent ? '⚠️ Optional Sort' : 'ℹ️ Optional not present'}: ${opt}`);
        });

        await this.page.keyboard.press('Escape').catch(() => undefined);
        console.log(`=====================================================\n`);
    }

    /* ------------------------------------------------------------------
       Tab-Specific Sorting
    ------------------------------------------------------------------ */

    async validateCommunitySortOptions(): Promise<void> {
        await this.validateSortOptions(
            'Communities',
            ['$ - $$$', 'A - Z', 'Availability'],
            ['Featured']
        );
    }

    async validatePlanSortOptions(): Promise<void> {
        await this.validateSortOptions(
            'Plans',
            ['$ - $$$', 'Sq. Ft.', 'A - Z']
        );
    }

    async validateQMISortOptions(): Promise<void> {
        await this.validateSortOptions(
            'Quick Move-Ins',
            ['Date', '$ - $$$', 'Sq. Ft.', 'A - Z']
        );
    }
    /* ==========================================================
       SORTABLE DATA EXTRACTION
    ========================================================== */

    async getSortablePrices(tabName: ResultsTab): Promise<number[]> {
        const cards = await this.resultCards();
        const count = await this.getSortableCardCount(tabName, await cards.count());

        const prices: number[] = [];

        console.log(`\n========== EXTRACTING SORTABLE PRICES: ${tabName} ==========`);

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const priceText = (await card.locator('span, [class*="price"], a').allTextContents())
                .map(text => text.trim())
                .find(text => /^\$[\d,]+$/.test(text));

            if (priceText) {
                const price = Number(priceText.replace(/[$,]/g, ''));
                prices.push(price);
                console.log(`💲 Card ${i + 1}: $${price.toLocaleString()}`);
            } else {
                console.log(`⚠️ Card ${i + 1}: skipped (no sortable price)`);
            }
        }

        console.log(`===========================================================\n`);
        return prices;
    }
    /* ==========================================================
       SORT ACTION
    ========================================================== */

    async selectSortOption(tabName: ResultsTab, option: string): Promise<void> {
        await this.openTab(tabName);
        await this.waitForResultsToLoad();

        await this.sortButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.sortButton.scrollIntoViewIfNeeded();

        const optionRegex = new RegExp(`^\\s*${this.escapeRegex(option)}\\s*$`, 'i');
        const optionLocator = this.sortMenuItems
            .filter({ hasText: optionRegex })
            .first();

        if (!await optionLocator.isVisible().catch(() => false)) {
            await this.sortButton.click();
        }

        await optionLocator.waitFor({ state: 'visible', timeout: 10000 });

        console.log(`🔽 Selecting sort option: ${option}`);
        await optionLocator.click();

        await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
        await this.waitForResultsToLoad();
    }

    async getSortableSqFt(tabName: ResultsTab): Promise<number[]> {
        const cards = await this.resultCards();
        const count = await this.getSortableCardCount(tabName, await cards.count());

        const values: number[] = [];

        console.log(`\n========== EXTRACTING SORTABLE SQ. FT.: ${tabName} ==========`);

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const text = await card.innerText().catch(() => '');

            const sqft = this.parseSqFtValue(text);

            if (sqft !== null) {
                values.push(sqft);
                console.log(`📐 Card ${i + 1}: ${sqft.toLocaleString()} Sq. Ft.`);
            } else {
                console.log(`⚠️ Card ${i + 1}: skipped (no sortable Sq. Ft.)`);
            }
        }

        console.log(`===========================================================\n`);
        return values;
    }

    async getSortableTitles(tabName: ResultsTab): Promise<string[]> {
        const cards = await this.resultCards();
        const count = await this.getSortableCardCount(tabName, await cards.count());

        const titles: string[] = [];

        console.log(`\n========== EXTRACTING SORTABLE TITLES: ${tabName} ==========`);

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);

            const title = await card
                .locator('h1, h2, h3, h4, [data-testid*="title"], [class*="title"]')
                .first()
                .innerText()
                .catch(() => '');

            if (title.trim()) {
                titles.push(title.trim());
                console.log(`🔤 Card ${i + 1}: ${title.trim()}`);
            } else {
                console.log(`⚠️ Card ${i + 1}: skipped (no sortable title)`);
            }
        }

        console.log(`===========================================================\n`);
        return titles;
    }

    /* ==========================================================
       SORT VALIDATION HELPERS
    ========================================================== */

    private validateAscendingNumbers(actual: number[], label: string): void {
        console.log(`\n========== ${label.toUpperCase()} SORT VALIDATION ==========`);

        const failures: string[] = [];

        for (let i = 0; i < actual.length - 1; i++) {
            const current = actual[i];
            const next = actual[i + 1];

            const isValid = current <= next;

            console.log(`${isValid ? '✅' : '❌'} ${i + 1}. ${current.toLocaleString()} <= ${next.toLocaleString()}`);

            if (!isValid) {
                failures.push(
                    `Position ${i + 1}: ${current.toLocaleString()} should be <= ${next.toLocaleString()}`
                );
            }
        }

        if (failures.length > 0) {
            console.log(`\n❌ ${label} sorting failures found:`);

            failures.forEach((failure, index) => {
                console.log(`   ${index + 1}. ${failure}`);
            });

            throw new Error(
                `❌ ${label} sorting is incorrect.\n` +
                failures.map((f, i) => `${i + 1}. ${f}`).join('\n')
            );
        }

        console.log(`✅ ${label} sorting validated successfully`);
        console.log(`=====================================================\n`);
    }

    private validateAlphabetical(actual: string[], label: string): void {
        const expected = [...actual].sort((a, b) => a.localeCompare(b));

        console.log(`\n========== ${label.toUpperCase()} SORT VALIDATION ==========`);

        actual.forEach((value, index) => {
            const isCorrect = value === expected[index];
            console.log(`${isCorrect ? '✅' : '❌'} ${index + 1}. ${value}`);
        });

        expect(actual, `${label} sorting is incorrect`).toEqual(expected);

        console.log(`✅ ${label} sorting validated successfully`);
        console.log(`=====================================================\n`);
    }

    /* ==========================================================
       ACTUAL CARD SORTING VALIDATION
    ========================================================== */

    async validatePriceSorting(tabName: ResultsTab): Promise<void> {
        await this.selectSortOption(tabName, '$ - $$$');

        const prices = await this.getSortablePrices(tabName);

        expect(prices.length, 'No sortable price values found').toBeGreaterThan(1);
        this.validateAscendingNumbers(prices, `${tabName} Price`);
    }

    async validateSqFtSorting(tabName: ResultsTab): Promise<void> {
        await this.selectSortOption(tabName, 'Sq. Ft.');

        const values = await this.getSortableSqFt(tabName);

        expect(values.length, 'No sortable Sq. Ft. values found').toBeGreaterThan(1);
        this.validateAscendingNumbers(values, `${tabName} Sq. Ft.`);
    }

    async validateAZSorting(tabName: ResultsTab): Promise<void> {
        await this.selectSortOption(tabName, 'A - Z');

        const titles = await this.getSortableTitles(tabName);

        expect(titles.length, 'No sortable title values found').toBeGreaterThan(1);
        this.validateAlphabetical(titles, `${tabName} A-Z`);
    }

    private getSortValidationConfigs(tabName: ResultsTab): SortValidationConfig[] {
        const commonConfigs: SortValidationConfig[] = [
            { option: '$ - $$$', criterion: 'price', label: 'Price' },
            { option: 'A - Z', criterion: 'title', label: 'A-Z' }
        ];

        if (tabName === 'Communities') {
            return commonConfigs;
        }

        return [
            commonConfigs[0],
            { option: 'Sq. Ft.', criterion: 'sqft', label: 'Sq. Ft.' },
            commonConfigs[1]
        ];
    }

    private async getSortableValues(
        tabName: ResultsTab,
        criterion: SortCriterion
    ): Promise<number[] | string[]> {
        switch (criterion) {
            case 'price':
                return this.getSortablePrices(tabName);
            case 'sqft':
                return this.getSortableSqFt(tabName);
            case 'title':
                return this.getSortableTitles(tabName);
            default:
                throw new Error(`Unsupported sort criterion: ${criterion}`);
        }
    }

    private validateSortableValues(
        values: number[] | string[],
        config: SortValidationConfig,
        tabName: ResultsTab
    ): void {
        expect(
            values.length,
            `${tabName} ${config.label}: at least 2 sortable values are required`
        ).toBeGreaterThan(1);

        if (config.criterion === 'title') {
            this.validateAlphabetical(values as string[], `${tabName} ${config.label}`);
            return;
        }

        this.validateAscendingNumbers(values as number[], `${tabName} ${config.label}`);
    }

    /* ==========================================================
       HIGH-LEVEL SORTING TEST METHODS
    ========================================================== */

    async validateSortingBehavior(tabName: ResultsTab): Promise<void> {
        const configs = this.getSortValidationConfigs(tabName);

        for (const config of configs) {
            await this.selectSortOption(tabName, config.option);

            const values = await this.getSortableValues(tabName, config.criterion);
            this.validateSortableValues(values, config, tabName);
        }
    }

    async validateCommunitySortingBehavior(): Promise<void> {
        await this.validateSortingBehavior('Communities');
    }

    async validatePlanSortingBehavior(): Promise<void> {
        await this.validateSortingBehavior('Plans');
    }

    async validateQMISortingBehavior(): Promise<void> {
        await this.validateSortingBehavior('Quick Move-Ins');
    }

}
