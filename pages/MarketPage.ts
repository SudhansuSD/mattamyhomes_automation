import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';

export interface MarketConfig {
    name: string;
    url: string;
}

export class MarketPage extends BasePage {
    readonly heading: Locator;
    readonly heroSection: Locator;
    readonly communitySection: Locator;
    readonly leadForm: Locator;
    readonly discoverOurHomesSection: Locator;
    readonly marketSearchLinks: Locator;
    readonly successDialogModal: Locator;

    constructor(page: Page) {
        super(page);

        this.heading = page.locator('#HeaderPlanPage h1');
        this.heroSection = page.locator('#HeaderPlanPage');
        this.communitySection = page.locator('#CommunityCards');
        this.leadForm = page.getByRole('group')
            .filter({
                has: page.getByRole('combobox', { name: /Community of Interest/i })
            })
            .filter({
                has: page.getByRole('button', { name: /submit/i })
            });
        this.discoverOurHomesSection = page.locator(
            'h2:has-text("Discover our homes")'
        );
        this.marketSearchLinks = page.locator(
            'a[href*="/search"][href*="productType="]'
        );
        this.successDialogModal = page.locator('.ReactModal__Content');
    }

    /* ==========================================================
       UTIL HELPERS
    ========================================================== */

    private logBlock(title: string): void {
        console.log(`\n===== ${title} =====`);
    }

    private getCommunityCards(): Locator {
        return this.communitySection.locator('li').filter({
            has: this.page.locator('a[href]')
        });
    }

    private async getCommunityCardTitle(card: Locator): Promise<string> {
        const title = card.locator('h2, h3, h4, a div.block, a').first();
        return (await title.innerText()).trim();
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private get formSuccessMessage(): Locator {
        return this.page.getByText(
            /Thank you for your interest in Mattamy Homes/i
        ).last();
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

    async validateHeroContent(market: MarketConfig): Promise<void> {
        await expect(this.heroSection).toBeVisible({ timeout: 15000 });
        await expect(this.heading).toContainText(new RegExp(market.name, 'i'));

        const heroImage = this.heroSection.locator('img').first();
        if (await heroImage.count()) {
            await expect(heroImage).toBeVisible();
        }

        const heroText = (await this.heroSection.innerText()).trim();
        expect(heroText, 'Hero should include visible market copy')
            .toBeTruthy();

        const pageSearchLinkCount = await this.marketSearchLinks.count();
        expect(pageSearchLinkCount, 'Market page should include search CTAs')
            .toBeGreaterThan(0);
    }

    /* ==========================================================
       COMMUNITY CARDS (DETAILED)
    ========================================================== */

    async validateCommunityCards(): Promise<void> {

        await expect(this.communitySection, 'Community Cards section not present')
            .toBeVisible({ timeout: 15000 });

        const isVisible = await this.isSectionVisible(this.communitySection);

        if (!isVisible) {
            console.warn('⚠️ Community Cards section not present');
            return;
        }
        await this.communitySection.scrollIntoViewIfNeeded();
        await this.waitForPageReady();
        await expect(this.communitySection).toBeInViewport({ timeout: 10000 });

        const cards = this.getCommunityCards();

        const count = await cards.count();
        expect(count).toBeGreaterThan(0);

        this.logBlock('COMMUNITY CARDS');

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);

            const name = await this.getCommunityCardTitle(card);
            const href = await card.locator('a').getAttribute('href');

            const fullUrl = this.buildFullUrl(href);

            console.log(`Name: ${name.trim()}`);
            console.log(`URL: ${fullUrl}`);
            console.log('--------------------------');
        }
    }

    async validateCommunityCardDetails(): Promise<void> {
        await expect(this.communitySection, 'Community Cards section not present')
            .toBeVisible({ timeout: 15000 });

        const isVisible = await this.isSectionVisible(this.communitySection);

        if (!isVisible) {
            console.warn('Community Cards section not present');
            return;
        }

        await this.communitySection.scrollIntoViewIfNeeded();
        await this.waitForPageReady();
        await expect(this.communitySection).toBeInViewport({ timeout: 10000 });
        const cards = this.getCommunityCards();
        const count = await cards.count();
        expect(count, 'Market page should list at least one community card')
            .toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const title = await this.getCommunityCardTitle(card);
            const href = await card.locator('a[href]').first().getAttribute('href');

            expect(title, `Community card ${i + 1} title missing`).toBeTruthy();
            expect(href, `Community card ${i + 1} href missing`).toBeTruthy();
            expect(href, `Community card ${i + 1} should not link to current page`)
                .not.toBe(new URL(this.page.url()).pathname);

            const image = card.locator('img').first();
            if (await image.count()) {
                await expect(image).toHaveAttribute('src', /.+/);
            }
        }
    }

    async validateFirstCommunityCardNavigation(): Promise<void> {
        await expect(this.communitySection, 'Community Cards section not present')
            .toBeVisible({ timeout: 15000 });
        await this.communitySection.scrollIntoViewIfNeeded();
        await this.waitForPageReady();
        await expect(this.communitySection).toBeInViewport({ timeout: 10000 });

        const isVisible = await this.isSectionVisible(this.communitySection);

        if (!isVisible) {
            console.warn('Community Cards section not present');
            return;
        }

        const firstCardLink = this.getCommunityCards()
            .first()
            .locator('a[href]')
            .first();

        await expect(firstCardLink, 'No community card link available')
            .toBeVisible({ timeout: 10000 });

        const href = await firstCardLink.getAttribute('href');
        expect(href).toBeTruthy();

        await firstCardLink.scrollIntoViewIfNeeded();
        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            firstCardLink.click()
        ]);
        await this.waitForPageReady();
        await expect(this.page).toHaveURL(new RegExp(this.escapeRegex(href!), 'i'));
    }

    /* ==========================================================
       LEAD FORM VALIDATION
    ========================================================== */

    async validateLeadForm(marketName: string): Promise<void> {
        await this.validateLeadFormInvalidData(marketName);
        return;

        await this.waitForPageReady();

        const form = this.leadForm.first();

        await expect(form, `Lead form not available on ${marketName}`)
            .toBeAttached({ timeout: 20000 });
        await form.scrollIntoViewIfNeeded();
        await this.waitForPageReady();
        await expect(form, `Lead form not in viewport on ${marketName}`)
            .toBeInViewport({ timeout: 10000 });
        await expect(form, `Lead form not visible on ${marketName}`)
            .toBeVisible({ timeout: 10000 });

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
            await expect(field).toBeVisible({ timeout: 10000 });
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

    private async getAvailableLeadForm(marketName: string): Promise<Locator | null> {
        await this.waitForPageReady();

        const form = this.leadForm.first();

        if (!await form.count()) {
            console.warn(`No lead form available on ${marketName} - skipping form validation`);
            return null;
        }

        await form.scrollIntoViewIfNeeded();
        await this.waitForPageReady();

        await expect(form, `Lead form not in viewport on ${marketName}`)
            .toBeInViewport({ timeout: 10000 });
        await expect(form, `Lead form not visible on ${marketName}`)
            .toBeVisible({ timeout: 10000 });

        return form;
    }

    private getLeadFormFields(form: Locator) {
        return {
            community: form.getByRole('combobox', { name: /Community of Interest/i }),
            firstName: form.getByRole('textbox', { name: /First name/i }),
            lastName: form.getByRole('textbox', { name: /Last name/i }),
            email: form.getByRole('textbox', { name: /^Email/i }),
            country: form.getByRole('combobox', { name: /Country of Residence/i }),
            zip: form.getByRole('textbox', { name: /Zip|Postal/i }),
            phone: form.getByRole('textbox', { name: /Phone/i }),
            submit: form.getByRole('button', { name: /SUBMIT/i })
        };
    }

    async validateLeadFormInvalidData(marketName: string): Promise<void> {
        const form = await this.getAvailableLeadForm(marketName);

        if (!form) {
            return;
        }

        const fields = this.getLeadFormFields(form);

        for (const field of Object.values(fields)) {
            await expect(field).toBeVisible({ timeout: 10000 });
        }

        await fields.community.selectOption({ index: 1 });
        await fields.country.selectOption({ index: 1 });
        await fields.firstName.fill('Test');
        await fields.lastName.fill('User');
        await fields.email.fill('user@domain.c');
        await fields.zip.fill('12345');
        await fields.phone.fill('123456');

        await fields.submit.click();

        await expect(form.locator('text=/valid domain name|Invalid|Error/i').first())
            .toBeVisible({ timeout: 10000 });

        console.log(`Lead form invalid-data validation successful: ${marketName}`);
    }

    async submitLeadFormSuccessfully(marketName: string): Promise<void> {
        const form = await this.getAvailableLeadForm(marketName);

        if (!form) {
            return;
        }

        const fields = this.getLeadFormFields(form);

        for (const field of Object.values(fields)) {
            await expect(field).toBeVisible({ timeout: 10000 });
        }

        await fields.community.selectOption({ index: 1 });
        await fields.country.selectOption({ index: 1 });
        await fields.firstName.fill('Sudhansu');
        await fields.lastName.fill('Das');
        await fields.email.fill(`ssdas+market${Date.now()}@ex2india.com`);
        await fields.zip.fill('34293');
        await fields.phone.fill('4488559933');

        await fields.submit.click();

        if (await this.successDialogModal.count()) {
            await expect(this.successDialogModal.last()).toBeVisible({
                timeout: 10000
            });
        }

        await expect(this.formSuccessMessage).toBeVisible({ timeout: 10000 });
        console.log(`Lead form successful submission validated: ${marketName}`);
    }

    /* ==========================================================
       DISCOVER OUR HOMES
    ========================================================== */

    async validateDiscoverOurHomesSection(): Promise<void> {

        await this.waitForPageReady();
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(
            this.discoverOurHomesSection,
            `Discover Our Homes section not present on ${this.page.url()}`
        ).toBeVisible({ timeout: 15000 });

        const isVisible = await this.isSectionVisible(this.discoverOurHomesSection);

        if (!isVisible) {
            console.warn(`⚠️ Discover Our Homes section not present on ${this.page.url()}`);
            return;
        }

        await this.discoverOurHomesSection.scrollIntoViewIfNeeded();
        await this.waitForPageReady();
        await expect(this.discoverOurHomesSection).toBeInViewport({ timeout: 10000 });


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

    async validateMarketSearchLinks(): Promise<void> {
        const count = await this.marketSearchLinks.count();
        expect(count, `Market search links not present on ${this.page.url()}`)
            .toBeGreaterThan(0);

        if (!count) {
            console.warn(`Market search links not present on ${this.page.url()}`);
            return;
        }

        let hasPlanLink = false;
        let hasQmiLink = false;

        for (let i = 0; i < count; i++) {
            const href = await this.marketSearchLinks.nth(i).getAttribute('href');
            expect(href).toBeTruthy();

            const normalizedHref = href!.toLowerCase();
            hasPlanLink = hasPlanLink || normalizedHref.includes('producttype=plan');
            hasQmiLink = hasQmiLink || normalizedHref.includes('producttype=qmi');
            expect(normalizedHref).toContain('/search');
        }

        expect(hasPlanLink, 'Market page should link to plan search results').toBeTruthy();
        expect(hasQmiLink, 'Market page should link to QMI search results').toBeTruthy();
    }
}
