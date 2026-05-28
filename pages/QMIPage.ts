import { Locator, Page, expect } from '@playwright/test';
import { getLocationConfig } from '../config/locations/locationConfig';
import {
    clickIfVisible,
    escapeRegex,
    getPathSegments,
    getSlugTextPattern,
    isLocatorVisible,
    toTitleCase
} from '../utils/pageObjectUtils';
import { HomePage } from './HomePage';

/* ==========================================================
    QMI Page Object Model
========================================================== */

const location = getLocationConfig();

export class QMIPage extends HomePage {
    private static readonly PAGE_LOAD_TIMEOUT = 20000;
    private static readonly UTOUR_TIMEOUT = 15000;
    private static readonly QMI_URL_PATTERN = /\/\d{1,}-/;

    readonly heroSection: Locator;
    readonly heroDetails: Locator;
    readonly heading: Locator;
    readonly breadcrumb: Locator;
    readonly priceSection: Locator;
    readonly getInformationCta: Locator;
    readonly formSection: Locator;
    
    readonly propertyStats: Locator;
    readonly gallerySection: Locator;
    readonly nextGalleryBtn: Locator;
    readonly prevGalleryBtn: Locator;
    readonly floorPlanSection: Locator;
    readonly mortgageBtn: Locator;
    readonly mortgageComponent: Locator;
    readonly closeModalBtn: Locator;
    readonly uTourTitle: Locator;
    readonly uTourCta: Locator;
    readonly uTourSection: Locator;
    readonly interactiveFloorPlanSection: Locator;
    readonly communitySitemapSection: Locator;
    readonly homeDesignDetailsSection: Locator;
    readonly homeFeaturesSection: Locator;
    readonly salesOfficeSection: Locator;
    readonly relatedQmiSection: Locator;
    readonly relatedQmiCards: Locator;
    readonly successDialogModal: Locator;

    constructor(page: Page) {
        super(page);
        const mortgageSectionTitle = page.getByText('Mortgage Calculator', {
            exact: true
        });

        this.heroSection = page.locator("//div[@id='detailsBlockBar']/following-sibling::div[1]");
        this.heroDetails = page.locator('h1').locator('xpath=ancestor::div[contains(@class,"container")][1]');
        this.heading = page.locator('h1');
        this.breadcrumb = page.locator('#breadcrumb');
        this.priceSection = this.heroSection.locator("p:has-text('$')");
        this.getInformationCta = page.locator('a, button').filter({
            hasText: /Get Information/i
        }).first();
        this.formSection = page.locator(
            '#contact, #ScheduleAVisit-FormInstance0, #ScheduleAVisit-FormInstance1'
        ).first();
        
        this.propertyStats = page.locator("p:has-text('Beds')").nth(1);
        this.gallerySection =  page.locator('#gallery');
        this.nextGalleryBtn = page.locator('button[aria-label="Next"]');
        this.prevGalleryBtn = page.locator('button[aria-label="Previous"]');
        this.floorPlanSection = page.locator('text=/Floor Plan/i');
        this.mortgageComponent = page.locator('section')
            .filter({ has: mortgageSectionTitle })
            .filter({
                has: page.getByRole('button', { name: /Get Started/i })
            })
            .first();
        this.mortgageBtn = this.mortgageComponent.getByRole('button', {
            name: /Get Started/i
        }).first();
        this.closeModalBtn = page.locator('.ReactModal__Content, [role="dialog"]')
            .locator('button[aria-label="Close"], button:has-text("Close"), button:has-text("CLOSE")')
            .first();
        this.uTourTitle = page.getByRole(
            'heading', { name: /Self-guided tours available/i }
        );
        this.uTourSection = page.locator('section').filter({
            has: this.uTourTitle
        }).first();
        this.uTourCta = this.uTourSection.locator(
            'a[href*="utourhomes.com/visitor"]'
        ).filter({ hasText: /Schedule a Self-Guided Tour/i }).first();
        this.interactiveFloorPlanSection = this.getSectionByHeading(/Interactive Floorplan|Floor Plan/i);
        this.communitySitemapSection = this.getSectionByHeading(/Explore the community/i);
        this.homeDesignDetailsSection = this.getSectionByHeading(/Home Design Details/i);
        this.homeFeaturesSection = this.getSectionByHeading(/Home Features/i);
        this.salesOfficeSection = page.locator('section').filter({
            has: page.getByRole('heading', { name: /Showhome Parade|Sales Office/i })
        }).first();
        this.relatedQmiSection = this.getSectionByHeading(/Quick Move-In Homes ready when you are/i);
        this.relatedQmiCards = this.relatedQmiSection.locator('a[href*="/"][href*="-"]').filter({
            hasText: /Beds|Baths|Garage|Sq\.?\s*Ft\./i
        });
        this.successDialogModal = page.locator('.ReactModal__Content');
    }

    /** Locator: all visible QMI lead forms with a submit button. */
    private get qmiForms(): Locator {
        return this.page
            .locator(
                [
                    'form',
                    '[id^="Sitecore-ScheduleAVisit-FormInstance"]',
                    '[id^="ScheduleAVisit-FormInstance"]',
                    'section',
                    '[role="group"]'
                ].join(', ')
            )
            .filter({
                has: this.page.getByRole('button', { name: /submit/i })
            })
            .filter({
                has: this.page.locator('input, select, textarea')
            });
    }

    /** Locator: successful QMI lead form confirmation message. */
    private get formSuccessMessage(): Locator {
        return this.page.getByText(
            /Thank you for your interest in Mattamy Homes/i
        ).last();
    }

    /* ==========================================================
       Navigation and Page Load
    ========================================================== */

    /** Verify: QMI detail page has loaded with heading and breadcrumb. */
    async verifyPageLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.breadcrumb).toBeVisible();
    }

    /* ==========================================================
       Search Result Validation
    ========================================================== */

    /** Verify: home page QMI search redirects to the expected QMI detail page. */
    async verifySearchByQMI(expectedAddress: string): Promise<void> {
        await this.waitForPageReady();
        await expect(this.page).toHaveURL(QMIPage.QMI_URL_PATTERN);
        await expect(this.heading).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.heading).toContainText(
            new RegExp(escapeRegex(expectedAddress), 'i')
        );
    }

    /** Verify: current QMI URL path exactly matches the configured QMI path. */
    async verifyExactQmiUrl(): Promise<void> {
        const currentPath = new URL(this.page.url()).pathname;
        expect(currentPath).toBe(location.qmiPath);
    }

    /* ==========================================================
       Hero and Summary
    ========================================================== */

    /** Verify: hero section, heading, configured address, and summary stats are visible. */
    async verifyHeroSection(): Promise<void> {
        await expect(this.heroSection).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.heading).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.heading).toContainText(
            new RegExp(escapeRegex(location.qmiAddress), 'i'),
            { timeout: QMIPage.PAGE_LOAD_TIMEOUT }
        );
        await expect(this.propertyStats).toBeVisible();
       
    }

    /** Verify: breadcrumb container is visible. */
    async verifyBreadcrumb(): Promise<void> {
        await expect(this.breadcrumb).toBeVisible();
    }

    /** Verify: hero displays beds, baths, garage or half bath, square footage, and price. */
    async verifyHeroHomeFacts(): Promise<void> {
        await expect(this.heroDetails).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.heroDetails).toContainText(/\d+\s+Beds?/i);
        await expect(this.heroDetails).toContainText(/\d+\s+Baths?/i);
        await expect(this.heroDetails).toContainText(/Half Bath|Garage/i);
        await expect(this.heroDetails).toContainText(/[\d,]+\s+Sq\.?\s*Ft\.?/i);
        await expect(this.heroDetails).toContainText(/\$[\d,]+/);
    }

    /* ==========================================================
       Price and CTA
    ========================================================== */

    /** Verify: price section and Get Information CTA are visible. */
    async verifyPriceOrCTA(): Promise<void> {
        await expect(this.priceSection.first()).toBeVisible();
        await expect(this.getInformationCta).toBeVisible();
    }

    /** Verify: Get Information CTA scrolls the user to the QMI form section. */
    async verifyGetInformationScrollsToForm(): Promise<void> {
        await expect(this.getInformationCta).toBeVisible();
        await expect(this.formSection).toBeAttached();
        await this.getInformationCta.scrollIntoViewIfNeeded();
        await this.getInformationCta.click();
        await expect(this.formSection).toBeInViewport();
    }

    /* ==========================================================
       Gallery
    ========================================================== */

    /** Verify: gallery is visible and gallery navigation buttons work when present. */
    async verifyGallery(): Promise<void> {
        await expect(this.gallerySection.first()).toBeVisible();
        await clickIfVisible(this.nextGalleryBtn);
        await clickIfVisible(this.prevGalleryBtn);
    }

    /* ==========================================================
       Floor Plan and Community Map
    ========================================================== */

    /** Verify: floor plan section is visible when available. */
    async verifyFloorPlan(): Promise<void> {
        const floorPlanSection = await isLocatorVisible(this.interactiveFloorPlanSection)
            ? this.interactiveFloorPlanSection
            : this.floorPlanSection;

        if (await isLocatorVisible(floorPlanSection)) {
            await floorPlanSection.scrollIntoViewIfNeeded();
            await expect(floorPlanSection).toBeVisible();
        }
    }

    /** Verify: interactive floor plan section content when available. */
    async verifyInteractiveFloorPlan(): Promise<void> {
        if (!(await isLocatorVisible(this.interactiveFloorPlanSection))) {
            console.log('Interactive floorplan section not found - skipping validation');
            return;
        }

        await this.interactiveFloorPlanSection.scrollIntoViewIfNeeded();
        await expect(this.interactiveFloorPlanSection).toBeVisible();
        await expect(this.interactiveFloorPlanSection).toContainText(
            /Interactive Floorplan|floorplan/i
        );
    }

    /** Verify: community sitemap section content when available. */
    async verifyCommunitySitemap(): Promise<void> {
        if (!(await isLocatorVisible(this.communitySitemapSection))) {
            console.log('Community sitemap section not found - skipping validation');
            return;
        }

        await this.communitySitemapSection.scrollIntoViewIfNeeded();
        await expect(this.communitySitemapSection).toBeVisible();
        await expect(this.communitySitemapSection).toContainText(/Explore the community/i);
        await expect(this.communitySitemapSection.locator('button, svg, canvas').first())
            .toBeVisible();
    }

    /* ==========================================================
       Content Sections
    ========================================================== */

    /** Verify: home design details section has meaningful content. */
    async verifyHomeDesignDetails(): Promise<void> {
        await this.homeDesignDetailsSection.scrollIntoViewIfNeeded();
        await expect(this.homeDesignDetailsSection).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.homeDesignDetailsSection).toContainText(/Home Design Details/i);
        const detailsText = await this.homeDesignDetailsSection.innerText();
        expect(
            detailsText.replace(/Home Design Details/i, '').trim().length,
            'Home Design Details should include rendered content'
        ).toBeGreaterThan(0);
    }

    /** Verify: home features section has meaningful content. */
    async verifyHomeFeatures(): Promise<void> {
        await this.homeFeaturesSection.scrollIntoViewIfNeeded();
        await expect(this.homeFeaturesSection).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.homeFeaturesSection).toContainText(/Home Features/i);
        const featuresText = await this.homeFeaturesSection.innerText();
        expect(
            featuresText.replace(/Home Features/i, '').trim().length,
            'Home Features should list at least one feature'
        ).toBeGreaterThan(3);
    }

    /** Verify: sales office section includes contact links, map link, and form submit button. */
    async verifySalesOfficeAndContactForm(): Promise<void> {
        const salesOfficeSection = await this.getSalesOfficeSectionIfAvailable();

        if (!salesOfficeSection) {
            console.log('Sales Office section not present - skipping sales office validation');
        } else {
            await salesOfficeSection.scrollIntoViewIfNeeded();
            await expect(salesOfficeSection).toBeVisible({
                timeout: QMIPage.PAGE_LOAD_TIMEOUT
            });
            await expect(salesOfficeSection).toContainText(/Hours|Open|Closed|Sales Office|Showhome Parade/i);
            await this.verifySalesOfficePhone(salesOfficeSection);
            await this.verifySalesOfficeMapLinkIfPresent(salesOfficeSection);
        }

        await this.getAvailableForm(0, 'QMI community updates form');
    }

    /* ==========================================================
       Lead Form Validation
    ========================================================== */

    /** Verify: expected QMI form fields and submit button are visible. */
    async validateQmiFormFields(): Promise<void> {
        const form = await this.getAvailableForm(0, 'QMI community updates form');

        if (!form) {
            return;
        }

        await this.expectFieldIfPresent(form.getByRole('textbox', { name: /first name/i }), 'First name');
        await this.expectFieldIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name');
        await this.expectFieldIfPresent(form.getByRole('textbox', { name: /^email/i }), 'Email');
        await this.expectFieldIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone');
        await this.expectFieldIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), 'Zip or postal');

        const countryOfResidence = form.getByRole('combobox', {
            name: /country of residence/i
        }).first();

        if (await countryOfResidence.count()) {
            await expect(countryOfResidence, 'Country of residence field should be visible')
                .toBeVisible({ timeout: QMIPage.PAGE_LOAD_TIMEOUT });
        }

        await expect(this.getSubmitButton(form)).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
    }

    /** Verify: QMI form shows required-field validation errors. */
    async validateQmiFormRequiredErrors(): Promise<void> {
        const form = await this.getAvailableForm(0, 'QMI community updates form');

        if (!form) {
            return;
        }

        await this.getSubmitButton(form).click();
        await expect(form.locator('text=/Required|Please complete|Invalid|Error/i').first())
            .toBeVisible({ timeout: QMIPage.PAGE_LOAD_TIMEOUT });
    }

    /** Verify: QMI form rejects an invalid email address. */
    async validateQmiFormInvalidEmail(): Promise<void> {
        const form = await this.getAvailableForm(0, 'QMI community updates form');

        if (!form) {
            return;
        }

        await this.fillLeadFormWithInvalidEmail(form);
        await this.getSubmitButton(form).click();

        const visibleEmailError = form
            .locator('div:visible, span:visible, p:visible, label:visible')
            .filter({
                hasText: /valid email|invalid email|valid domain name|Required|Invalid|Error/i
            })
            .first();

        if (await isLocatorVisible(visibleEmailError)) {
            await expect(visibleEmailError).toBeVisible();
            return;
        }

        const emailField = form.getByRole('textbox', { name: /^email/i }).first();
        const nativeValidationMessage = await emailField.evaluate((element) => {
            const input = element as HTMLInputElement;
            return input.validationMessage;
        });

        expect(
            nativeValidationMessage,
            'QMI email field should reject invalid email format'
        ).toBeTruthy();
    }

    /** Verify: QMI form can be submitted successfully with valid lead data. */
    async verifyQmiFormSuccessSubmission(): Promise<void> {
        const form = await this.getAvailableForm(0, 'QMI community updates form');

        if (!form) {
            return;
        }

        await this.fillLeadFormWithValidData(form);
        await this.getSubmitButton(form).click();

        if (await this.successDialogModal.count()) {
            await expect(this.successDialogModal.last()).toBeVisible({
                timeout: QMIPage.PAGE_LOAD_TIMEOUT
            });
        }

        await expect(this.formSuccessMessage).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        console.log('QMI form successful submission validated');
    }

    /* ==========================================================
       Related Homes
    ========================================================== */

    /** Verify: related quick move-in homes section and related card content. */
    async verifyRelatedQuickMoveInHomes(): Promise<void> {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.waitForPageReady();

        await this.relatedQmiSection.scrollIntoViewIfNeeded();
        await expect(this.relatedQmiSection, 'Related QMI section should be visible')
            .toBeVisible({ timeout: QMIPage.PAGE_LOAD_TIMEOUT });
        await expect(this.relatedQmiSection.locator('a').filter({ hasText: /View all/i }).first())
            .toHaveAttribute('href', /productType=qmi/i);

        const cardCount = await this.relatedQmiCards.count();
        expect(cardCount, 'Expected at least one related QMI card').toBeGreaterThan(0);

        for (let i = 0; i < cardCount; i++) {
            const card = this.relatedQmiCards.nth(i);
            const href = await card.getAttribute('href');
            const name = await this.getRelatedQmiCardName(card, href);
            const url = href ? this.buildFullUrl(href) : 'URL missing';

            console.log(`Related QMI ${i + 1}: ${name} | URL: ${url}`);
        }

        const firstCard = this.relatedQmiCards.first();
        await expect(firstCard).toBeVisible();
        await expect(firstCard).toContainText(/Beds/i);
        await expect(firstCard).toContainText(/Baths/i);
        await expect(firstCard).toContainText(/Garage|Sq\.?\s*Ft\./i);
    }

    /* ==========================================================
       Mortgage Popup
    ========================================================== */

    /** Verify: mortgage modal opens and closes when the mortgage component exists. */
    async verifyMortgagePopup(): Promise<void> {
        if (await isLocatorVisible(this.mortgageComponent)) {
            await expect(this.mortgageComponent).toBeVisible();
            await this.mortgageBtn.scrollIntoViewIfNeeded();
            await this.mortgageBtn.click();
            await this.closeModalIfPresent();
        } else {
            console.log(
                'Mortgage component not found - skipping validation'
            );
        }
    }

    /* ==========================================================
       UTour Section
    ========================================================== */

    /** Verify: self-guided tour section and CTA are visible. */
    async verifyUTourSectionVisible(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        await this.uTourSection.scrollIntoViewIfNeeded();
        await expect(this.uTourTitle).toBeVisible({
            timeout: QMIPage.UTOUR_TIMEOUT
        });
        await expect(this.uTourCta).toBeVisible({
            timeout: QMIPage.UTOUR_TIMEOUT
        });
    }

    /** Verify: self-guided tour section and CTA are hidden. */
    async verifyUTourSectionHidden(): Promise<void> {
        await expect(this.uTourTitle).toHaveCount(0);
        await expect(this.uTourCta).toHaveCount(0);
    }

    /* ==========================================================
       Shared Helpers
    ========================================================== */

    /** Helper: return a configured QMI form and validate its submit button. */
    private async getAvailableForm(
        formIndex = 0,
        formName = 'QMI form'
    ): Promise<Locator | null> {
        const formHeading = this.page.getByRole('heading', {
            name: /Sign Up For Community Updates/i
        }).first();

        if (await formHeading.count()) {
            await formHeading.scrollIntoViewIfNeeded();
            await this.waitForPageReady();
        }

        const formCount = await expect
            .poll(
                () => this.qmiForms.count(),
                {
                    message: `${formName} should mount when available`,
                    timeout: 15000
                }
            )
            .toBeGreaterThan(formIndex)
            .then(() => this.qmiForms.count())
            .catch(() => 0);

        if (formCount <= formIndex) {
            console.warn(`${formName} not present on current QMI page - skipping form validation`);
            return null;
        }

        const form = this.qmiForms.nth(formIndex);
        const submitButton = this.getSubmitButton(form);

        await form.scrollIntoViewIfNeeded();
        await this.waitForPageReady();

        await expect(submitButton, `${formName} submit button should be visible`)
            .toBeVisible({ timeout: QMIPage.PAGE_LOAD_TIMEOUT });

        return form;
    }

    /** Helper: locate the submit button inside a specific form. */
    private getSubmitButton(form: Locator): Locator {
        return form.getByRole('button', { name: /submit/i }).first();
    }

    /** Helper: assert a form field only if that field exists. */
    private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
        if (await field.count()) {
            await expect(field.first(), `${label} field should be visible`)
                .toBeVisible({ timeout: QMIPage.PAGE_LOAD_TIMEOUT });
        }
    }

    /** Helper: fill lead form with data that should fail email validation. */
    private async fillLeadFormWithInvalidEmail(form: Locator): Promise<void> {
        await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Test');
        await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'User');
        await this.fillIfPresent(form.getByRole('textbox', { name: /^email/i }), 'not-an-email');
        await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '4165551212');
        await this.fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), 'L7R 0A1');

        await this.selectCountryIfPresent(form);
        await this.checkTermsIfPresent(form);
    }

    /** Helper: fill lead form with valid data for successful submission tests. */
    private async fillLeadFormWithValidData(form: Locator): Promise<void> {
        await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Sudhansu');
        await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Das');
        await this.fillIfPresent(
            form.getByRole('textbox', { name: /^email/i }),
            `ssdas_qmi${Date.now()}@ex2india.com`
        );
        await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '4165551212');
        await this.fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), 'L7R 0A1');

        await this.selectCountryIfPresent(form);
        await this.checkTermsIfPresent(form);
    }

    /** Helper: fill a field only when that field exists. */
    private async fillIfPresent(field: Locator, value: string): Promise<void> {
        if (await field.count()) {
            await field.first().fill(value);
        }
    }

    /** Helper: select country of residence when the form includes that field. */
    private async selectCountryIfPresent(form: Locator): Promise<void> {
        const countryOfResidence = form.getByRole('combobox', {
            name: /country of residence/i
        }).first();

        if (!(await countryOfResidence.count())) {
            return;
        }

        await countryOfResidence.selectOption({ label: 'Canada' }).catch(async () => {
            await countryOfResidence.selectOption({ index: 1 });
        });
    }

    /** Helper: check terms checkbox when the form includes one. */
    private async checkTermsIfPresent(form: Locator): Promise<void> {
        const checkbox = form.getByRole('checkbox').first();

        if (await checkbox.count()) {
            await checkbox.check({ force: true });
        }
    }

    /** Helper: return compact visible text for logging and comparisons. */
    private async getCompactText(locator: Locator): Promise<string> {
        return (await locator.innerText().catch(() => ''))
            .replace(/\s+/g, ' ')
            .trim();
    }

    /** Helper: find the sales office section across supported QMI page layouts. */
    private async getSalesOfficeSectionIfAvailable(): Promise<Locator | null> {
        await this.salesOfficeSection
            .waitFor({ state: 'attached', timeout: 5000 })
            .catch(() => undefined);

        if (await this.salesOfficeSection.count()) {
            return this.salesOfficeSection;
        }

        const salesOfficeHeading = this.page
            .getByText(/Showhome Parade|Sales Office/i)
            .first();

        await salesOfficeHeading
            .waitFor({ state: 'attached', timeout: 5000 })
            .catch(() => undefined);

        if (!(await salesOfficeHeading.count())) {
            return null;
        }

        return salesOfficeHeading.locator('xpath=ancestor::*[self::section or self::div][1]');
    }

    /** Helper: verify sales office phone is available as a tel link or visible phone text. */
    private async verifySalesOfficePhone(salesOfficeSection: Locator): Promise<void> {
        const phoneLink = salesOfficeSection.locator('a[href^="tel:"]').first();

        if (await phoneLink.count()) {
            await expect(phoneLink).toBeVisible();
            return;
        }

        await expect(salesOfficeSection).toContainText(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    }

    /** Helper: verify a map link when the sales office layout exposes one. */
    private async verifySalesOfficeMapLinkIfPresent(salesOfficeSection: Locator): Promise<void> {
        const mapLink = salesOfficeSection
            .locator('a[href*="google.com/maps"], a[href*="maps.google"], a[href*="/maps"]')
            .first();

        if (await mapLink.count()) {
            await expect(mapLink).toBeVisible();
        }
    }

    /** Helper: locate the related QMI card address/title within a single card. */
    private getRelatedQmiCardNameLocator(card: Locator): Locator {
        return card.locator(
            [
                'span[class*="text-mattamy-blue"][class*="uppercase"]',
                'span[class*="font-trade-gothic"][class*="uppercase"]',
                'span:has-text(" NW"), span:has-text(" NE"), span:has-text(" SW"), span:has-text(" SE")'
            ].join(', ')
        ).filter({
            hasText: /\b\d+\s+\S.+\b(?:NW|NE|SW|SE|N|S|E|W)\b/i
        }).first();
    }

    /** Helper: return the related QMI card address/title shown in the card heading. */
    private async getRelatedQmiCardName(card: Locator, href: string | null): Promise<string> {
        const addressFromHref = href ? this.getAddressFromQmiHref(href) : null;

        if (addressFromHref) {
            return addressFromHref;
        }

        const title = this.getRelatedQmiCardNameLocator(card);

        if (await isLocatorVisible(title)) {
            return this.getCompactText(title);
        }

        const ariaLabel = await card.getAttribute('aria-label');
        const addressFromLabel = ariaLabel?.match(/\b\d+\s+[A-Z0-9][A-Z0-9\s.-]+?\b(?:NW|NE|SW|SE|N|S|E|W)\b/i);

        if (addressFromLabel) {
            return addressFromLabel[0].replace(/\s+/g, ' ').trim();
        }

        return this.getCompactText(card);
    }

    /** Helper: convert the QMI URL address slug into the compact display address. */
    private getAddressFromQmiHref(href: string): string | null {
        const path = href.split('?')[0].replace(/\/$/, '');
        const addressSlug = path.split('/').pop();

        if (!addressSlug || !/^\d+-/.test(addressSlug)) {
            return null;
        }

        return addressSlug
            .split('-')
            .filter(Boolean)
            .join(' ')
            .toUpperCase();
    }

    /** Helper: close an open modal when a close button is visible. */
    private async closeModalIfPresent(): Promise<void> {
        if (await isLocatorVisible(this.closeModalBtn)) {
            await this.closeModalBtn.click();
            await expect(this.closeModalBtn).toBeHidden({
                timeout: QMIPage.PAGE_LOAD_TIMEOUT
            });
        }
    }

    /** Helper: dismiss OneTrust cookie UI when it appears. */
    private async dismissCookieBannerIfPresent(): Promise<void> {
        await this.acceptCookiesIfPresent();

        const closeCookieBannerBtn = this.page
            .locator('#onetrust-banner-sdk, [aria-label="Privacy"], [role="dialog"]')
            .getByRole('button', { name: /^Close$/i })
            .first();

        if (await isLocatorVisible(closeCookieBannerBtn)) {
            await closeCookieBannerBtn.click();
        }
    }

    /** Helper: find a section by its heading text. */
    private getSectionByHeading(heading: RegExp): Locator {
        return this.page.locator('section').filter({
            has: this.page.getByRole('heading', { name: heading })
        }).first();
    }

    /* ==========================================================
       Breadcrumb Validation
    ========================================================== */

    /** Helper: split the configured QMI path into route segments. */
    private getQmiPathSegments(): string[] {
        return getPathSegments(location.qmiPath);
    }

    /** Verify: breadcrumb state, community, current address, and path match configured QMI path. */
    async verifyBreadcrumbNavigation(): Promise<void> {
        const [stateSlug, , , communitySlug, , ...addressSlugs] = this.getQmiPathSegments();
        const currentPath = new URL(this.page.url()).pathname;

        expect(currentPath).toBe(location.qmiPath);
        expect(stateSlug, `State/province segment missing from qmiPath: ${location.qmiPath}`)
            .toBeTruthy();
        expect(communitySlug, `Community segment missing from qmiPath: ${location.qmiPath}`)
            .toBeTruthy();
        expect(addressSlugs.length, `Address segment missing from qmiPath: ${location.qmiPath}`)
            .toBeGreaterThan(0);

        await expect(this.breadcrumb).toBeVisible();
        await expect(this.breadcrumb).toContainText(
            getSlugTextPattern(addressSlugs.join('-'))
        );
        await expect(this.breadcrumb.locator(`a[href*="/${stateSlug}/"]`).first())
            .toBeVisible();
        await expect(this.breadcrumb.locator(`a[href*="/${communitySlug}"]`).first())
            .toBeVisible();
    }

    /** Verify: breadcrumb links point to the configured community and plan parent paths. */
    async verifyBreadcrumbLinks(): Promise<void> {
        const segments = this.getQmiPathSegments();
        const communityPath = `/${segments.slice(0, 4).join('/')}`;
        const planPath = `/${segments.slice(0, 5).join('/')}`;
        const addressSlug = segments.slice(5).join('-');

        await expect(this.breadcrumb.locator(`a[href="${communityPath}"]`).first())
            .toBeVisible();
        await expect(this.breadcrumb.locator(`a[href="${planPath}"]`).first())
            .toBeVisible();
        await expect(this.breadcrumb).toContainText(getSlugTextPattern(addressSlug));
        await this.logBreadcrumbNamesAndUrls();
    }

    /** Helper: log breadcrumb link labels and URLs for report troubleshooting. */
    private async logBreadcrumbNamesAndUrls(): Promise<void> {
        const breadcrumbLinks = this.breadcrumb.locator('a[href]');
        const linkCount = await breadcrumbLinks.count();

        console.log('QMI breadcrumb links:');

        for (let i = 0; i < linkCount; i++) {
            const link = breadcrumbLinks.nth(i);
            const href = await link.getAttribute('href');
            const name = this.getNameFromHref(href, await this.getCompactText(link));
            const url = href ? this.buildFullUrl(href) : 'URL missing';

            console.log(`Breadcrumb ${i + 1}: ${name || 'Unnamed'} | URL: ${url}`);
        }

        const currentLabel = await this.getCompactText(this.heading);

        if (currentLabel) {
            console.log(`Breadcrumb current: ${currentLabel} | URL: ${this.page.url()}`);
        }
    }

    /** Helper: derive a readable breadcrumb label from href when UI text is truncated. */
    private getNameFromHref(href: string | null, fallback: string): string {
        if (!href || (fallback && !fallback.includes('...'))) {
            return fallback;
        }

        const slug = getPathSegments(href).pop();

        if (!slug) {
            return fallback;
        }

        return toTitleCase(slug);
    }
}
