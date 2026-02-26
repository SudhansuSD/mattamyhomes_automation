import { Page, expect, Locator } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

type ResultsTab = 'Communities' | 'Plans' | 'Quick Move-In';

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

    private dropdownOption = (text: string) =>
        this.page.getByText(text, { exact: true });

    private sectionHeader = (name: string) =>
        this.page.getByRole('heading', { name });

    private resultCards = () =>
        this.page.locator('#ProductInfo h3');

    private tab = (tabName: ResultsTab) =>
        this.page.getByRole('button', { name: tabName });

    /* ------------------------------------------------------------------
       Common Helpers
    ------------------------------------------------------------------ */

    private async openTab(tabName: ResultsTab): Promise<void> {
        const tab = this.tab(tabName);
        // Click only if not active (aria-pressed check if available)
        const isPressed = await tab.getAttribute('aria-pressed');

        if (isPressed !== 'true') {
            await tab.click();
        }

        // Wait until tab becomes active
        await this.waitForPageReady();
    }

    private async openFilter(label: string): Promise<void> {
        await this.filterButton(label).click({ timeout: 15000 });
    }

    /* ------------------------------------------------------------------
       Filters
    ------------------------------------------------------------------ */

    async filterByPrice(min: string, max: string): Promise<void> {
        await this.waitForPageReady();

        await this.openFilter('Dropdown price filter');
        await this.dropdownOption('$ No min').click();
        await this.dropdownOption(min).click();

        await this.openFilter('Dropdown price filter');
        await this.dropdownOption('$ No Max').click();
        await this.dropdownOption(max).click();
    }

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
       Results Validation
    ------------------------------------------------------------------ */

    async verifyResults(tabName: ResultsTab): Promise<void> {

        await this.openTab(tabName);

        const cards = this.resultCards();

        const count = await cards.count();

        if (count === 0) {
            console.info(`No ${tabName} results found.`);
            return;
        }

        await expect(cards.first()).toBeVisible({ timeout: 15000 });

        console.log(`Total ${tabName} results detected: ${count}`);
    }

    /* ------------------------------------------------------------------
       Sorting Validation
    ------------------------------------------------------------------ */

    private async getSortOptions(): Promise<string[]> {
        await this.sortButton.click();
        await expect(this.sortMenuItems.first()).toBeVisible();

        return (await this.sortMenuItems.allTextContents())
            .map(text => text.trim());
    }

    private async validateSortOptions(
        required: string[],
        optional: string[] = []
    ): Promise<void> {

        const actual = await this.getSortOptions();

        // Required must exist
        for (const option of required) {
            expect(actual).toContain(option);
            console.log(`Verified sort option: ${option}`);
        }

        // Optional validated only if present
        for (const option of optional) {
            if (actual.includes(option)) {
                expect(actual).toContain(option);
                console.log(`Verified optional sort option: ${option}`);
            }
        }
    }

    /* ------------------------------------------------------------------
       Tab-Specific Sorting
    ------------------------------------------------------------------ */

    async validateCommunitySortOptions(): Promise<void> {
        await this.openTab('Communities');

        await this.validateSortOptions(
            ['$ - $$$', 'A - Z', 'Availability'],
            ['Featured'] // optional
        );
    }

    async validatePlanSortOptions(): Promise<void> {
        await this.openTab('Plans');

        await this.validateSortOptions(
            ['$ - $$$', 'Sq. Ft.', 'A - Z']
        );
    }

    async validateQMISortOptions(): Promise<void> {
        await this.openTab('Quick Move-In');

        await this.validateSortOptions(
            ['Date', '$ - $$$', 'Sq. Ft.', 'A - Z']
        );
    }
}