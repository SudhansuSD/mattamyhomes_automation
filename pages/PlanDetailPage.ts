import { Locator, Page, expect } from '@playwright/test';
import { SearchablePage } from './SearchablePage';
import { escapeRegex, isLocatorVisible } from '../utils/pageObjectUtils';
import {
    fillIfPresent,
    getInvalidLeadData,
    getValidLeadData,
    LeadFieldData,
    selectCountryIfPresent
} from '../utils/leadFormHelper';

/* ==========================================================
    Plan Detail Page – Page Object Model
========================================================== */

export type PlanDetails = {
    path: string;
    name: string;
    title?: RegExp;
    price?: string;
    community?: string;
    breadcrumbItems?: string[];
    specs?: string[];
    productLine?: string;
    exteriorStyles?: string[];
    floorPlanFrameUrlPart?: string;
    qmiHeadline?: string;
    salesOffice?: {
        address: string;
        cityStateZip: string;
        phone: string;
    };
};

export class PlanDetailPage extends SearchablePage {

    /** Locator: main plan detail heading. */
    readonly heading: Locator;

    /** Locator: breadcrumb navigation container. */
    readonly breadcrumb: Locator;

    /** Locator: starting price label. */
    readonly priceSection: Locator;

    /** Locator: gallery images on the plan detail page. */
    readonly galleryImages: Locator;

    /** Locator: gallery next button. */
    readonly nextGalleryBtn: Locator;

    /** Locator: gallery previous button. */
    readonly prevGalleryBtn: Locator;

    /** Locator: interactive floorplan section. */
    readonly floorPlanSection: Locator;

    /** Locator: exterior styles section. */
    readonly exteriorStylesSection: Locator;

    /** Locator: mortgage calculator Get Started button. */
    readonly mortgageBtn: Locator;

    /** Locator: mortgage calculator component. */
    readonly mortgageComponent: Locator;

    /** Locator: modal close button. */
    readonly closeModalBtn: Locator;

    /** Locator: available quick move-in homes section. */
    readonly qmiSection: Locator;

    /** Locator: View All QMI CTA. */
    readonly viewAllQMIButton: Locator;

    /** Locator: related QMI home links. */
    readonly qmiHomeslist: Locator;

    /** Locator: Get Information CTA. */
    readonly getInformationCta: Locator;

    /** Locator: community updates form section. */
    readonly signUpFormSection: Locator;

    /** Locator: sales office section. */
    readonly salesOfficeSection: Locator;

    /** Locator: React modal shown after successful form submission. */
    readonly successDialogModal: Locator;


    /** Setup: initialize plan detail page locators. */
    constructor(page: Page) {

        super(page);
        this.heading = page.locator('h1');
        this.breadcrumb = page.locator('#breadcrumb');
        this.priceSection = page.getByText('Starting from', { exact: true });
        this.galleryImages = page.locator('.slick-slide img, .swiper-slide img, img');
        this.nextGalleryBtn = page.getByLabel('Next slide');
        this.prevGalleryBtn = page.getByLabel('Previous slide');
        this.floorPlanSection = page.getByRole('heading', {
            name: /Interactive Floorplan/i
        }).locator('xpath=ancestor::section[1]');
        this.exteriorStylesSection = page.getByRole('heading', {
            name: /Exterior Styles/i
        }).locator('xpath=ancestor::section[1]');
        this.mortgageBtn = page.getByRole('button', { name: /Get Started/i });
        this.mortgageComponent = page.locator('section, div').filter({
            has: page.getByRole('heading', { name: /Mortgage Calculator/i })
        }).first();
        this.closeModalBtn = page.locator('.ReactModal__Content, [role="dialog"]')
            .locator('button[aria-label="Close"], button:has-text("Close"), button:has-text("CLOSE")')
            .first();
        this.qmiSection = page.locator('#availablehomes');
        this.viewAllQMIButton = this.qmiSection.locator('a:has-text("View all")');
        this.qmiHomeslist = this.qmiSection.locator('a[aria-label*="Floorplan"], a:has-text("Floorplan")');
        this.getInformationCta = page.getByRole('link', {
            name: /Get Information/i
        }).first();
        this.signUpFormSection = page.getByText(/Sign Up For Community Updates/i)
            .locator('xpath=ancestor::*[self::section or self::div][1]');
        this.salesOfficeSection = page.getByText(/^Sales Office$/i)
            .locator('xpath=ancestor::*[self::section or self::div][1]');
        this.successDialogModal = page.locator('.ReactModal__Content');
    }

    /** Locator: Sitecore-generated plan forms. */
    private get sitecorePlanForms(): Locator {
        return this.page.locator('[id^="Sitecore-ScheduleAVisit-FormInstance"]');
    }

    /** Locator: contact forms inside the contact section. */
    private get contactForms(): Locator {
        return this.page.locator('#contact form');
    }

    /** Locator: schedule visit form containers. */
    private get scheduleVisitContainers(): Locator {
        return this.page.locator('[id^="ScheduleAVisit-FormInstance"]');
    }

    /** Locator: lead form success confirmation message. */
    private get formSuccessMessage(): Locator {
        return this.page.getByText(
            /Thank you for your interest in Mattamy Homes/i
        ).last();
    }

    // ----------------------------------
    // Page Load Validation
    // ----------------------------------

    /** Verify: plan detail page heading and breadcrumb are visible. */
    async verifyPageLoaded() {
        await this.step('Verify plan detail page loaded', async () => {
            await expect(this.heading).toBeVisible({ timeout: 20000 });
            await expect(this.breadcrumb).toBeVisible();
        });
    }

    // ----------------------------------
    // Plan detail Validation 
    // ----------------------------------

    /** Verify: search by plan lands on the expected plan URL and shows a heading. */
    async verifySearchByPlan(expectedSlug: string) {
        await this.step('Verify search by plan lands on expected URL', async () => {
            await this.waitForPageReady();

            await expect(this.page).toHaveURL(
                new RegExp(escapeRegex(expectedSlug), 'i')
            );

            await expect(this.heading).toBeVisible({ timeout: 20000 });
        });
    }

    /** Verify: plan URL and optional browser title match expected details. */
    async verifyPlanUrlAndTitle(plan: PlanDetails): Promise<void> {
        await this.step('Verify plan URL and title', async () => {
            await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(plan.path)}$`, 'i'));

            if (plan.title) {
                await expect(this.page).toHaveTitle(plan.title);
            }
        });
    }

    /** Verify: current URL contains an expected plan URL fragment. */
    async verifyPlanUrlContains(expectedUrlPart: string): Promise<void> {
        await this.step(`Verify URL contains '${expectedUrlPart}'`, async () => {
            await expect(this.page).toHaveURL(new RegExp(escapeRegex(expectedUrlPart), 'i'));
        });
    }

    /** Verify: hero heading is visible. */
    async verifyHeroSection() {
        await this.step('Verify hero section heading visible', async () => {
            const headingLoaded = await this.heading
                .waitFor({ state: 'visible', timeout: 20000 })
                .then(() => true)
                .catch(() => false);

            if (!headingLoaded) {
                await this.reportValue('Plan heading not visible after search navigation; reloading current plan URL');
                await this.page.reload({
                    waitUntil: 'domcontentloaded',
                    timeout: 90_000
                });
                await this.waitForPageReady();
            }

            await expect(this.heading).toBeVisible({ timeout: 20000 });
        });
    }

    /** Verify: hero heading contains a specific plan name. */
    async verifyHeroSummaryForPlan(planName: string): Promise<void> {
        await this.step(`Verify hero heading contains '${planName}'`, async () => {
            await expect(this.heading).toBeVisible({ timeout: 20000 });
            await expect(this.heading).toContainText(new RegExp(escapeRegex(planName), 'i'));
        });
    }

    /** Verify: page body includes standard home specs. */
    async verifyHomeSpecsPresent(): Promise<void> {
        await this.step('Verify home specs present', async () => {
            const pageText = this.page.locator('body');

            await expect(pageText).toContainText(/Bed/i);
            await expect(pageText).toContainText(/Bath/i);
            await expect(pageText).toContainText(/Sq\.?\s*Ft\.?/i);
        });
    }

    /** Verify: hero summary contains configured plan name, price, specs, and product line. */
    async verifyHeroSummary(plan: PlanDetails): Promise<void> {
        await this.step('Verify hero summary details', async () => {
            await expect(this.heading).toBeVisible({ timeout: 20000 });
            await expect(this.heading).toContainText(new RegExp(escapeRegex(plan.name), 'i'));

            if (plan.price) {
                await expect(this.page.getByText('Starting from', { exact: true })).toBeVisible();
                await expect(this.page.locator('body')).toContainText(plan.price);
            }

            for (const spec of plan.specs ?? []) {
                await expect(this.page.locator('body')).toContainText(spec);
            }

            if (plan.productLine) {
                await expect(this.page.locator('body')).toContainText(plan.productLine);
            }
        });
    }

    /** Verify: breadcrumb is visible when present. */
    async verifyBreadcrumb() {
        await this.step('Verify breadcrumb visible', async () => {
            if (await this.breadcrumb.count() > 0) {
                await expect(this.breadcrumb.first()).toBeVisible();
            }
        });
    }

    /** Verify: breadcrumb includes expected items from the configured plan path. */
    async verifyBreadcrumbMatchesPlanPath(plan: PlanDetails): Promise<void> {
        await this.step('Verify breadcrumb matches plan path', async () => {
            await expect(this.breadcrumb).toBeVisible();

            for (const item of plan.breadcrumbItems ?? []) {
                await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(item), 'i'));
            }
        });
    }

    /** Verify: breadcrumb contains the expected plan name. */
    async verifyBreadcrumbContainsPlan(planName: string): Promise<void> {
        await this.step(`Verify breadcrumb contains '${planName}'`, async () => {
            await expect(this.breadcrumb).toBeVisible();
            await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(planName), 'i'));
        });
    }

    /** Verify: starting price label is visible when present. */
    async verifyPriceOrCTA() {
        await this.step('Verify starting price label', async () => {
            if (await this.priceSection.count() > 0) {
                await expect(this.priceSection.first()).toBeVisible();
            }
        });
    }

    /** Verify: gallery image is visible and gallery controls work when present. */
    async verifyGallery() {
        await this.step('Verify gallery image and controls', async () => {
            await expect(this.galleryImages.first()).toBeVisible();

            if (await this.nextGalleryBtn.isVisible()) {
                await this.nextGalleryBtn.click();
            }

            if (await this.prevGalleryBtn.isVisible()) {
                await this.prevGalleryBtn.click();
            }
        });
    }

    /** Verify: floorplan section is visible when present. */
    async verifyFloorPlan() {
        await this.step('Verify floorplan section', async () => {
            if (await isLocatorVisible(this.floorPlanSection)) {
                await this.floorPlanSection.scrollIntoViewIfNeeded();
                await expect(this.floorPlanSection).toBeVisible();
            }
        });
    }

    /** Verify: interactive floorplan section and optional iframe source match expected plan details. */
    async verifyInteractiveFloorPlan(plan: PlanDetails): Promise<void> {
        await this.step('Verify interactive floorplan', async () => {
            await this.floorPlanSection.scrollIntoViewIfNeeded();
            await expect(
                this.page.getByRole('heading', { name: /Interactive Floorplan/i })
            ).toBeVisible();

            if (plan.floorPlanFrameUrlPart) {
                const iframe = this.page.locator('iframe[title*="Floorplan" i]').first();
                await expect(iframe).toBeVisible();
                await expect(iframe).toHaveAttribute(
                    'src',
                    new RegExp(escapeRegex(plan.floorPlanFrameUrlPart), 'i')
                );
            }
        });
    }

    /** Verify: interactive floorplan section is available when present. */
    async verifyInteractiveFloorPlanSection(): Promise<void> {
        await this.step('Verify interactive floorplan section', async () => {
            const floorPlanHeading = this.page.getByRole('heading', {
                name: /Interactive Floorplan/i
            }).first();

            if (await isLocatorVisible(floorPlanHeading)) {
                await floorPlanHeading.scrollIntoViewIfNeeded();
                await expect(floorPlanHeading).toBeVisible();
                await expect(this.page.locator('iframe[title*="Floorplan" i]').first())
                    .toBeVisible();
            } else {
                await this.reportValue('Interactive floorplan section not present - skipping validation');
            }
        });
    }

    /** Verify: configured exterior styles are visible. */
    async verifyExteriorStyles(styles: string[]): Promise<void> {
        await this.step('Verify exterior styles', async () => {
            await this.exteriorStylesSection.scrollIntoViewIfNeeded();
            await expect(
                this.page.getByRole('heading', { name: /Exterior Styles/i })
            ).toBeVisible();

            for (const style of styles) {
                await expect(this.page.getByText(style, { exact: false }).first())
                    .toBeVisible();
            }
        });
    }

    /** Verify: exterior styles section is visible when present. */
    async verifyExteriorStylesSection(): Promise<void> {
        await this.step('Verify exterior styles section', async () => {
            const exteriorHeading = this.page.getByRole('heading', {
                name: /Exterior Styles/i
            }).first();

            if (await isLocatorVisible(exteriorHeading)) {
                await exteriorHeading.scrollIntoViewIfNeeded();
                await expect(exteriorHeading).toBeVisible();
            } else {
                await this.reportValue('Exterior Styles section not present - skipping validation');
            }
        });
    }

    /** Verify: mortgage form CTA opens and can be closed when present. */
    async verifyMortgageForm() {
        await this.step('Verify mortgage form CTA', async () => {
            if (await isLocatorVisible(this.mortgageBtn)) {
                await this.mortgageBtn.scrollIntoViewIfNeeded();
                await this.mortgageBtn.click();


                if (await isLocatorVisible(this.closeModalBtn)) {
                    await this.closeModalBtn.click();
                }
            }
        });
    }

    /** Verify: mortgage calculator CTA is visible when the section exists. */
    async verifyMortgageCalculatorCta(): Promise<void> {
        await this.step('Verify mortgage calculator CTA', async () => {
            const mortgageTitle = this.page.getByText(/Mortgage Calculator/i).first();

            if (await isLocatorVisible(mortgageTitle)) {
                await mortgageTitle.scrollIntoViewIfNeeded();
                await expect(mortgageTitle).toBeVisible();
                await expect(this.mortgageBtn.first()).toBeVisible();
            } else {
                await this.reportValue('Mortgage Calculator section not present - skipping validation');
            }
        });
    }

    /** Verify: QMI section logs available homes and View All URL when present. */
    async verifyQMISection() {
        await this.step('Verify QMI section', async () => {
            if (await isLocatorVisible(this.qmiSection)) {

                await this.qmiSection.scrollIntoViewIfNeeded();
                await this.waitForPageReady();

                const qmiCount = await this.qmiHomeslist.count();
                await this.reportValue('Number of QMI Homes listed', qmiCount);
                if (qmiCount === 0) {
                    await this.reportValue('QMI section has no home cards - skipping card validation');
                    return;
                }

                for (let i = 0; i < qmiCount; i++) {
                    const homeLink = this.qmiHomeslist.nth(i);
                    const homeHref = await homeLink.getAttribute('href');
                    expect(homeHref).toBeTruthy();
                    await this.reportValue(`QMI Home ${i + 1}`, this.buildFullUrl(homeHref));
                }

                if (await this.viewAllQMIButton.count() > 0) {
                    await expect(this.viewAllQMIButton).toBeVisible();

                    const href = await this.viewAllQMIButton.getAttribute('href');
                    await this.reportValue('View All QMI URL', href);
                } else {
                    await this.reportValue('View All link not visible');
                }

            }
            else {
                await this.reportValue('QMI Section not found');
            }
        });
    }

    /** Verify: configured quick move-in homes section content and links. */
    async verifyQuickMoveInHomes(plan: PlanDetails): Promise<void> {
        await this.step('Verify quick move-in homes section', async () => {
            await expect(this.qmiSection).toBeVisible();

            if (plan.qmiHeadline) {
                await expect(
                    this.qmiSection.getByText(plan.qmiHeadline, { exact: false })
                ).toBeVisible();
            }

            await expect(this.viewAllQMIButton).toBeVisible();
            await expect(this.viewAllQMIButton).toHaveAttribute(
                'href',
                /productType=qmi/i
            );
            expect(await this.qmiHomeslist.count()).toBeGreaterThan(0);
        });
    }

    /** Verify: quick move-in homes section is visible when present. */
    async verifyQuickMoveInHomesSection(): Promise<void> {
        await this.step('Verify quick move-in homes section present', async () => {
            if (await isLocatorVisible(this.qmiSection)) {
                await this.qmiSection.scrollIntoViewIfNeeded();
                await expect(this.qmiSection).toBeVisible();
                await expect(this.viewAllQMIButton).toBeVisible();

                const qmiCount = await this.qmiHomeslist.count();
                if (qmiCount === 0) {
                    await this.reportValue('QMI section has no home cards - skipping card validation');
                    return;
                }

                expect(qmiCount).toBeGreaterThan(0);
            } else {
                await this.reportValue('QMI section not present - skipping validation');
            }
        });
    }

    /** Verify: sales office content matches configured plan details. */
    async verifySalesOffice(plan: PlanDetails): Promise<void> {
        await this.step('Verify sales office details', async () => {
            await expect(this.page.getByText(/^Sales Office$/i)).toBeVisible();

            if (plan.salesOffice) {
                await expect(this.page.getByText(plan.salesOffice.address)).toBeVisible();
                await expect(this.page.getByText(plan.salesOffice.cityStateZip, {
                    exact: false
                })).toBeVisible();
                await expect(this.page.getByText(plan.salesOffice.phone)).toBeVisible();
            }
        });
    }

    /** Verify: sales office section is visible when present. */
    async verifySalesOfficeSection(): Promise<void> {
        await this.step('Verify sales office section', async () => {
            const salesOfficeTitle = this.page.getByText(/^Sales Office$/i).first();

            if (await isLocatorVisible(salesOfficeTitle)) {
                await salesOfficeTitle.scrollIntoViewIfNeeded();
                await expect(salesOfficeTitle).toBeVisible();
                await expect(this.page.locator('body')).toContainText(/Hours|Open|Closed|Office/i);
            } else {
                await this.reportValue('Sales Office section not present - skipping validation');
            }
        });
    }

    /** Verify: community updates form fields are visible. */
    async verifyCommunityUpdatesForm(): Promise<void> {
        await this.verifyPlanDetailForm();
    }

    /** Helper: return a form by index from a specific form locator group. */
    private async getFormFromLocator(
        forms: Locator,
        formIndex: number
    ): Promise<Locator | null> {
        const formCount = await forms.count();

        if (formIndex >= formCount) {
            return null;
        }

        return forms.nth(formIndex);
    }

    /** Helper: find a plan form by index across supported form containers. */
    private async getFormByIndex(formIndex: number): Promise<Locator | null> {
        return (
            await this.getFormFromLocator(this.sitecorePlanForms, formIndex) ??
            await this.getFormFromLocator(this.contactForms, formIndex) ??
            await this.getFormFromLocator(this.scheduleVisitContainers, formIndex)
        );
    }

    /** Helper: return a visible plan form with a submit button when available. */
    private async getAvailableForm(
        formIndex = 0,
        formName = 'Plan detail form'
    ): Promise<Locator | null> {
        const form = await this.getFormByIndex(formIndex);

        if (!form) {
            await this.reportValue(`${formName} not present - skipping form validation`);
            return null;
        }

        const submitButton = form.getByRole('button', { name: /submit/i }).first();

        if (!await submitButton.count()) {
            await this.reportValue(`${formName} submit button not present - skipping form validation`);
            return null;
        }

        await form.scrollIntoViewIfNeeded();
        await this.waitForPageReady();

        if (
            await isLocatorVisible(form) ||
            await isLocatorVisible(submitButton)
        ) {
            return form;
        }

        await this.reportValue(`${formName} not visible - skipping form validation`);
        return null;
    }

    /** Helper: verify required community update form fields by form index. */
    private async verifyCommunityUpdatesFormByIndex(
        formIndex: number,
        formName: string
    ): Promise<void> {
        const form = await this.getAvailableForm(formIndex, formName);

        if (!form) {
            return;
        }

        for (const fieldName of [
            /First name/i,
            /Last name/i,
            /^Email/i,
            /Country of Residence/i,
            /Zip|Postal/i,
            /Phone/i
        ]) {
            await expect(form.getByText(fieldName).first()).toBeVisible();
        }
    }

    /** Helper: submit an empty form and verify required-field errors. */
    private async validateEmptyFormErrorsByIndex(
        formIndex: number,
        formName: string
    ): Promise<void> {
        const form = await this.getAvailableForm(formIndex, formName);

        if (!form) {
            return;
        }

        await form.getByRole('button', { name: /submit/i }).first().click();

        await expect(form.locator('text=/Required|Invalid|Error/i').first())
            .toBeVisible({ timeout: 10000 });
    }

    /** Helper: submit invalid email data and verify email validation errors. */
    private async validateInvalidEmailByIndex(
        formIndex: number,
        formName: string
    ): Promise<void> {
        const form = await this.getAvailableForm(formIndex, formName);

        if (!form) {
            return;
        }

        const invalid = getInvalidLeadData('planDetail');

        await this.fillPlanLeadFormFields(form, invalid, {
            includeCountryAndZip: false
        });

        await form.getByRole('button', { name: /submit/i }).first().click();

        await expect(form.locator('text=/valid domain name/i').first())
            .toBeVisible({ timeout: 10000 });
    }

    /** Helper: fill and submit a valid form selected by index. */
    private async submitSuccessfulFormByIndex(
        formIndex: number,
        formName: string
    ): Promise<void> {
        const form = await this.getAvailableForm(formIndex, formName);

        if (!form) {
            return;
        }

        const valid = getValidLeadData('planDetail');

        await this.fillPlanLeadFormFields(form, valid, {
            includeCountryAndZip: true
        });

        await this.submitLeadFormAndCaptureApi({
            formName,
            submitButton: form.getByRole('button', { name: /submit/i }).first(),
            successModal: this.successDialogModal,
            successMessage: this.formSuccessMessage
        });
    }

    /** Helper: fill plan lead fields while preserving each validation flow's original field set. */
    private async fillPlanLeadFormFields(
        form: Locator,
        leadData: LeadFieldData,
        options: { includeCountryAndZip: boolean }
    ): Promise<void> {
        await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), leadData.firstName);
        await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), leadData.lastName);
        await fillIfPresent(form.getByRole('textbox', { name: /^email/i }), leadData.email);
        await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), leadData.phone);

        if (!options.includeCountryAndZip) {
            return;
        }

        await selectCountryIfPresent(form, leadData.country);
        await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), leadData.zip);
    }

    /** Verify: plan detail bottom form fields are visible. */
    async verifyPlanDetailForm(): Promise<void> {
        await this.step('Verify plan detail form fields', async () => {
            await this.verifyCommunityUpdatesFormByIndex(0, 'Plan detail bottom form');
        });
    }

    /** Verify: plan detail bottom form shows empty required-field errors. */
    async validatePlanDetailFormEmptyErrors(): Promise<void> {
        await this.step('Validate plan detail form empty errors', async () => {
            await this.validateEmptyFormErrorsByIndex(0, 'Plan detail bottom form');
        });
    }

    /** Verify: plan detail bottom form rejects invalid email addresses. */
    async validatePlanDetailFormInvalidEmail(): Promise<void> {
        await this.step('Validate plan detail form invalid email', async () => {
            await this.validateInvalidEmailByIndex(0, 'Plan detail bottom form');
        });
    }

    /** Verify: plan detail bottom form can be submitted successfully. */
    async verifyPlanDetailFormSuccessSubmission(): Promise<void> {
        await this.step('Submit plan detail form successfully', async () => {
            await this.submitSuccessfulFormByIndex(0, 'Plan detail bottom form');
        });
    }

}
