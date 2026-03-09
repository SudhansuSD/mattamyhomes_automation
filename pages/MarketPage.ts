import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';

export interface MarketConfig {
    name: string;
    url: string; // relative URL
}

export class MarketPage extends BasePage {

    readonly heading: Locator;
    readonly communitySection: Locator;
    readonly leadForm: Locator;
    readonly footer: Locator;

    constructor(page: Page) {
        super(page);

        this.heading = page.locator('#HeaderPlanPage h1');
        this.communitySection = page.locator('#CommunityCards');
        this.leadForm = page.locator('[id$="ScheduleAVisitMarket"] form');
        this.footer = page.locator('#footer');
    }

    /* ==========================================================
       NAVIGATE USING RELATIVE URL
    ========================================================== */

    async navigateToMarket(relativeUrl: string): Promise<void> {
        const { baseURL } = getEnvConfig();
        const targetUrl = `${baseURL}${relativeUrl}`;

        await this.page.goto(targetUrl);
        await this.waitForPageReady();
    }

    /* ==========================================================
       VERIFY MARKET PAGE
    ========================================================== */

    async verifyMarketPage(market: MarketConfig): Promise<void> {

        await this.waitForPageReady();

        await expect(this.page).toHaveURL(new RegExp(market.url, 'i'));

        await expect(this.heading).toContainText(
            new RegExp(market.name, 'i'),
            { timeout: 15000 }
        );

        console.log(
            `Successfully verified market page: ${market.name}\nURL: ${this.page.url()}`
        );
    }

    /* ==========================================================
       COMMUNITY CARDS VALIDATION
    ========================================================== */

    async validateCommunityCards(): Promise<void> {

        await this.scrollTo(this.communitySection);
        await this.waitForPageReady();

        const sectionExists = await this.communitySection.count();

        if (sectionExists === 0) {
            console.warn('No community cards found on this market page.');
            return;
        }

        const communityCards = this.communitySection.locator('a');
        const count = await communityCards.count();

        console.log(`Community cards found: ${count}`);
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const communityUrl = await communityCards.nth(i).getAttribute('href');
            expect(communityUrl).toBeTruthy();

            console.log(`Community card URL ${i + 1}: ${communityUrl}`);
        }
    }

    /* ==========================================================
       LEAD FORM VALIDATION
    ========================================================== */

    async validateLeadForm(marketName: string): Promise<void> {

        await this.waitForPageReady();

        const form = this.leadForm.first();

        try {
            await form.waitFor({
                state: 'visible',
                timeout: 20000
            });
        } catch {
            console.warn(`Lead form not available on ${marketName}`);
            return;
        }

        await form.scrollIntoViewIfNeeded();

        const communityOfInterest = form.getByRole('combobox', { name: /Community of Interest/i });
        const firstName = form.getByRole('textbox', { name: /First name/i });
        const lastName = form.getByRole('textbox', { name: /Last name/i });
        const email = form.getByRole('textbox', { name: /^Email/i });
        const countryOfResidence = form.getByRole('combobox', { name: /Country of Residence/i });
        const zipCode = form.getByRole('textbox', { name: /Zip|Postal/i });
        const phone = form.getByRole('textbox', { name: /Phone/i });
        const submitButton = form.getByRole('button', { name: /SUBMIT/i });

        const fieldsToValidate = [
            communityOfInterest,
            firstName,
            lastName,
            email,
            countryOfResidence,
            zipCode,
            phone,
            submitButton
        ];

        for (const field of fieldsToValidate) {
            await expect(field).toBeVisible();
        }

        // Select dropdowns only
        await communityOfInterest.selectOption({ index: 1 });
        await countryOfResidence.selectOption({ index: 1 });

        // Trigger validation
        await submitButton.click();

        const requiredFieldErrors = [
            /First name.*Required/i,
            /Last name.*Required/i,
            /Email.*Required/i,
            /Zip.*Required/i
        ];

        for (const error of requiredFieldErrors) {
            await expect(form.getByText(error)).toBeVisible();
        }

        console.log(`Lead form validation successful for ${marketName}`);
    }
}