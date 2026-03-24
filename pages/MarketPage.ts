import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';

export interface MarketConfig {
    name: string;
    url: string;
}

export class MarketPage extends BasePage {
    readonly heading: Locator;
    readonly communitySection: Locator;
    readonly leadForm: Locator;
    readonly footer: Locator;
    readonly discoverOurHomesSection: Locator;

    constructor(page: Page) {
        super(page);

        this.heading = page.locator('#HeaderPlanPage h1');
        this.communitySection = page.locator('#CommunityCards');
        this.leadForm = page.locator('[id$="ScheduleAVisitMarket"] form');
        this.footer = page.locator('#footer');
        this.discoverOurHomesSection = page.locator(
            'h2:has-text("Discover our homes")'
        );
    }

    /* ==========================================================
       UTIL HELPERS
    ========================================================== */

    private async getSectionOrSkip(locator: Locator, sectionName: string): Promise<boolean> {
        const exists = await locator.count();
        if (exists === 0) {
            console.warn(`${sectionName} not found on this page.`);
            return false;
        }
        return true;
    }

    // private buildFullUrl(relativeUrl: string | null): string {
    //     if (!relativeUrl) throw new Error('URL is null');
    //     return new URL(relativeUrl, this.page.url()).href;
    // }

    private logBlock(title: string): void {
        console.log(`\n===== ${title} =====`);
    }

    /* ==========================================================
       NAVIGATION
    ========================================================== */

    async navigateToMarket(relativeUrl: string): Promise<void> {
        const { baseURL } = getEnvConfig();
        await this.page.goto(`${baseURL}${relativeUrl}`);
        await this.waitForPageReady();
    }

    /* ==========================================================
       MARKET PAGE VALIDATION
    ========================================================== */

    async verifyMarketPage(market: MarketConfig): Promise<void> {
        await this.waitForPageReady();

        await expect(this.page).toHaveURL(new RegExp(market.url, 'i'));
        await expect(this.heading).toContainText(
            new RegExp(market.name, 'i'),
            { timeout: 15000 }
        );

        console.log(`✅ Market verified: ${market.name}`);
        console.log(`🌐 URL: ${this.page.url()}`);
    }

    /* ==========================================================
       COMMUNITY CARDS (DETAILED)
    ========================================================== */

    async validateCommunityCards(): Promise<void> {

        const isVisible = await this.isSectionVisible(this.communitySection);

        if (!isVisible) {
            console.warn('⚠️ Community Cards section not present');
            return;
        }
        await this.communitySection.scrollIntoViewIfNeeded();
        await this.waitForPageReady();

        const cards = this.communitySection.locator('li').filter({
            has: this.page.locator('a')
        });

        const count = await cards.count();
        expect(count).toBeGreaterThan(0);

        this.logBlock('COMMUNITY CARDS');

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);

            const name = await card.locator('a div.block').first().innerText();
            const href = await card.locator('a').getAttribute('href');

            const fullUrl = this.buildFullUrl(href);

            console.log(`Name: ${name.trim()}`);
            console.log(`URL: ${fullUrl}`);
            console.log('--------------------------');
        }
    }

    /* ==========================================================
       LEAD FORM VALIDATION
    ========================================================== */

    async validateLeadForm(marketName: string): Promise<void> {
        await this.waitForPageReady();

        const form = this.leadForm.first();

        try {
            await form.waitFor({ state: 'visible', timeout: 20000 });
        } catch {
            console.warn(`Lead form not available on ${marketName}`);
            return;
        }

        await form.scrollIntoViewIfNeeded();

        const fields = {
            community: form.getByRole('combobox', { name: /Community of Interest/i }),
            firstName: form.getByRole('textbox', { name: /First name/i }),
            lastName: form.getByRole('textbox', { name: /Last name/i }),
            email: form.getByRole('textbox', { name: /^Email/i }),
            country: form.getByRole('combobox', { name: /Country of Residence/i }),
            zip: form.getByRole('textbox', { name: /Zip|Postal/i }),
            phone: form.getByRole('textbox', { name: /Phone/i }),
            submit: form.getByRole('button', { name: /SUBMIT/i })
        };

        // Visibility check
        for (const field of Object.values(fields)) {
            await expect(field).toBeVisible();
        }

        // Select dropdowns
        await fields.community.selectOption({ index: 1 });
        await fields.country.selectOption({ index: 1 });

        // Submit to trigger validation
        await fields.submit.click();

        const errors = [
            /First name.*Required/i,
            /Last name.*Required/i,
            /Email.*Required/i,
            /Zip.*Required/i
        ];

        for (const error of errors) {
            await expect(form.getByText(error)).toBeVisible();
        }

        console.log(`✅ Lead form validation successful: ${marketName}`);
    }

    /* ==========================================================
       DISCOVER OUR HOMES
    ========================================================== */

    async validateDiscoverOurHomesSection(): Promise<void> {

        await this.waitForPageReady();
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const isVisible = await this.isSectionVisible(this.discoverOurHomesSection);

        if (!isVisible) {
            console.warn(`⚠️ Discover Our Homes section not present on ${this.page.url()}`);
            return;
        }

        await this.discoverOurHomesSection.scrollIntoViewIfNeeded();
        await this.waitForPageReady();


        const section = this.discoverOurHomesSection.locator('xpath=ancestor::section');
        const links = section.locator('a');
        const count = await links.count();
        this.logBlock('DISCOVER OUR HOMES');
        console.log(`Links found: ${count}`);
        for (let i = 0; i < count; i++) {
            const link = links.nth(i);
            await this.waitForPageReady();
            const text = (await link.innerText()).trim();
            const href = await link.getAttribute('href');
            expect(href).toBeTruthy();
            const normalizedText = text.toLowerCase();
            if (normalizedText.includes('floorplan')) {
                expect(href).toContain('productType=plan');
            }
            if (normalizedText.includes('quick move-in')) {
                expect(href).toContain('productType=qmi');
            }
            console.log(`Text: ${text}`);
            console.log(`URL: ${href}`);
            console.log('--------------------------');
        }
    }
}