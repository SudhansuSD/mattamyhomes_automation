import { Locator, Page, expect } from '@playwright/test';
import { HomePage } from './HomePage';
import { getEnvConfig } from '../config/envConfig';

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

export class PlanDetailPage extends HomePage {

    readonly heading: Locator;
    readonly breadcrumb: Locator;
    readonly priceSection: Locator;
    readonly galleryImages: Locator;
    readonly nextGalleryBtn: Locator;
    readonly prevGalleryBtn: Locator;
    readonly floorPlanSection: Locator;
    readonly exteriorStylesSection: Locator;
    readonly mortgageBtn: Locator;
    readonly mortgageComponent: Locator;
    readonly closeModalBtn: Locator;
    readonly qmiSection: Locator;
    readonly viewAllQMIButton: Locator;
    readonly qmiHomeslist: Locator;
    readonly getInformationCta: Locator;
    readonly signUpFormSection: Locator;
    readonly salesOfficeSection: Locator;


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
    }

    // ----------------------------------
    // Page Load Validation
    // ----------------------------------

    async verifyPageLoaded() {
        await expect(this.heading).toBeVisible({ timeout: 20000 });
        await expect(this.breadcrumb).toBeVisible();
    }

    // ----------------------------------
    // Plan detail Validation 
    // ----------------------------------

    async verifySearchByPlan(expectedSlug: string) {

        await this.waitForPageReady();

        await expect(this.page).toHaveURL(
            new RegExp(expectedSlug, 'i')
        );

        await expect(this.heading).toBeVisible({ timeout: 20000 });
    }

    async navigateToPlanPath(planPath: string): Promise<void> {
        const { baseURL } = getEnvConfig();
        await this.page.goto(`${baseURL}${planPath}`, {
            waitUntil: 'domcontentloaded',
            timeout: 90_000
        });
        await this.acceptCookiesIfPresent();
        await this.waitForPageReady();
    }

    async verifyPlanUrlAndTitle(plan: PlanDetails): Promise<void> {
        await expect(this.page).toHaveURL(new RegExp(`${plan.path}$`, 'i'));

        if (plan.title) {
            await expect(this.page).toHaveTitle(plan.title);
        }
    }

    async verifyPlanUrlContains(expectedUrlPart: string): Promise<void> {
        await expect(this.page).toHaveURL(new RegExp(expectedUrlPart, 'i'));
    }

    async verifyHeroSection() {
        await expect(this.heading).toBeVisible({ timeout: 20000 });
    }

    async verifyHeroSummaryForPlan(planName: string): Promise<void> {
        await expect(this.heading).toBeVisible({ timeout: 20000 });
        await expect(this.heading).toContainText(new RegExp(planName, 'i'));
    }

    async verifyHomeSpecsPresent(): Promise<void> {
        const pageText = this.page.locator('body');

        await expect(pageText).toContainText(/Bed/i);
        await expect(pageText).toContainText(/Bath/i);
        await expect(pageText).toContainText(/Sq\.?\s*Ft\.?/i);
    }

    async verifyHeroSummary(plan: PlanDetails): Promise<void> {
        await expect(this.heading).toBeVisible({ timeout: 20000 });
        await expect(this.heading).toContainText(new RegExp(plan.name, 'i'));

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
    }

    async verifyBreadcrumb() {
        if (await this.breadcrumb.count() > 0) {
            await expect(this.breadcrumb.first()).toBeVisible();
        }
    }

    async verifyBreadcrumbMatchesPlanPath(plan: PlanDetails): Promise<void> {
        await expect(this.breadcrumb).toBeVisible();

        for (const item of plan.breadcrumbItems ?? []) {
            await expect(this.breadcrumb).toContainText(new RegExp(item, 'i'));
        }
    }

    async verifyBreadcrumbContainsPlan(planName: string): Promise<void> {
        await expect(this.breadcrumb).toBeVisible();
        await expect(this.breadcrumb).toContainText(new RegExp(planName, 'i'));
    }

    async verifyPriceOrCTA() {
        if (await this.priceSection.count() > 0) {
            await expect(this.priceSection.first()).toBeVisible();
        }
    }

    async verifyGallery() {
        await expect(this.galleryImages.first()).toBeVisible();

        if (await this.nextGalleryBtn.isVisible()) {
            await this.nextGalleryBtn.click();
        }

        if (await this.prevGalleryBtn.isVisible()) {
            await this.prevGalleryBtn.click();
        }
    }

    async verifyFloorPlan() {
        if (await this.floorPlanSection.isVisible().catch(() => false)) {
            await this.floorPlanSection.scrollIntoViewIfNeeded();
            await expect(this.floorPlanSection).toBeVisible();
        }
    }

    async verifyInteractiveFloorPlan(plan: PlanDetails): Promise<void> {
        await this.floorPlanSection.scrollIntoViewIfNeeded();
        await expect(
            this.page.getByRole('heading', { name: /Interactive Floorplan/i })
        ).toBeVisible();

        if (plan.floorPlanFrameUrlPart) {
            const iframe = this.page.locator('iframe[title*="Floorplan" i]').first();
            await expect(iframe).toBeVisible();
            await expect(iframe).toHaveAttribute(
                'src',
                new RegExp(plan.floorPlanFrameUrlPart, 'i')
            );
        }
    }

    async verifyInteractiveFloorPlanSection(): Promise<void> {
        const floorPlanHeading = this.page.getByRole('heading', {
            name: /Interactive Floorplan|Floor ?Plan/i
        }).first();

        if (await floorPlanHeading.isVisible().catch(() => false)) {
            await floorPlanHeading.scrollIntoViewIfNeeded();
            await expect(floorPlanHeading).toBeVisible();
            await expect(this.page.locator('iframe[title*="Floorplan" i]').first())
                .toBeVisible();
        } else {
            console.log('Interactive floorplan section not present - skipping validation');
        }
    }

    async verifyExteriorStyles(styles: string[]): Promise<void> {
        await this.exteriorStylesSection.scrollIntoViewIfNeeded();
        await expect(
            this.page.getByRole('heading', { name: /Exterior Styles/i })
        ).toBeVisible();

        for (const style of styles) {
            await expect(this.page.getByText(style, { exact: false }).first())
                .toBeVisible();
        }
    }

    async verifyExteriorStylesSection(): Promise<void> {
        const exteriorHeading = this.page.getByRole('heading', {
            name: /Exterior Styles/i
        }).first();

        if (await exteriorHeading.isVisible().catch(() => false)) {
            await exteriorHeading.scrollIntoViewIfNeeded();
            await expect(exteriorHeading).toBeVisible();
        } else {
            console.log('Exterior Styles section not present - skipping validation');
        }
    }

    async verifyMortgageForm() {
        if (await this.mortgageBtn.isVisible().catch(() => false)) {
            await this.mortgageBtn.scrollIntoViewIfNeeded();
            await this.mortgageBtn.click();


            if (await this.closeModalBtn.isVisible().catch(() => false)) {
                await this.closeModalBtn.click();
            }
        }
    }

    async verifyMortgageCalculatorCta(): Promise<void> {
        const mortgageTitle = this.page.getByText(/Mortgage Calculator/i).first();

        if (await mortgageTitle.isVisible().catch(() => false)) {
            await mortgageTitle.scrollIntoViewIfNeeded();
            await expect(mortgageTitle).toBeVisible();
            await expect(this.mortgageBtn.first()).toBeVisible();
        } else {
            console.log('Mortgage Calculator section not present - skipping validation');
        }
    }

    async verifyQMISection() {
        if (await this.qmiSection.isVisible().catch(() => false)) {

            await this.qmiSection.scrollIntoViewIfNeeded();
            await this.waitForPageReady();

            const qmiCount = await this.qmiHomeslist.count();
            console.log("Number of QMI Homes listed:", qmiCount);
            expect(qmiCount).toBeGreaterThan(0);

            for (let i = 0; i < qmiCount; i++) {
                const homeLink = this.qmiHomeslist.nth(i);
                const homeHref = await homeLink.getAttribute('href');
                expect(homeHref).toBeTruthy();
                console.log(`QMI Home ${i + 1} URL:`, homeHref);
            }

            if (await this.viewAllQMIButton.count() > 0) {
                await expect(this.viewAllQMIButton).toBeVisible();

                const href = await this.viewAllQMIButton.getAttribute('href');
                console.log('View All QMI URL:', href);
            } else {
                console.log('View All link not visible');
            }

        }
        else {
            console.log('QMI Section not found !!');
        }
    }

    async verifyQuickMoveInHomes(plan: PlanDetails): Promise<void> {
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
    }

    async verifyQuickMoveInHomesSection(): Promise<void> {
        if (await this.qmiSection.isVisible().catch(() => false)) {
            await this.qmiSection.scrollIntoViewIfNeeded();
            await expect(this.qmiSection).toBeVisible();
            await expect(this.viewAllQMIButton).toBeVisible();

            const qmiCount = await this.qmiHomeslist.count();
            expect(qmiCount).toBeGreaterThan(0);
        } else {
            console.log('QMI section not present - skipping validation');
        }
    }

    async verifySalesOffice(plan: PlanDetails): Promise<void> {
        await expect(this.page.getByText(/^Sales Office$/i)).toBeVisible();

        if (plan.salesOffice) {
            await expect(this.page.getByText(plan.salesOffice.address)).toBeVisible();
            await expect(this.page.getByText(plan.salesOffice.cityStateZip, {
                exact: false
            })).toBeVisible();
            await expect(this.page.getByText(plan.salesOffice.phone)).toBeVisible();
        }
    }

    async verifySalesOfficeSection(): Promise<void> {
        const salesOfficeTitle = this.page.getByText(/^Sales Office$/i).first();

        if (await salesOfficeTitle.isVisible().catch(() => false)) {
            await salesOfficeTitle.scrollIntoViewIfNeeded();
            await expect(salesOfficeTitle).toBeVisible();
            await expect(this.page.locator('body')).toContainText(/Hours|Open|Closed|Office/i);
        } else {
            console.log('Sales Office section not present - skipping validation');
        }
    }

    async verifyCommunityUpdatesForm(): Promise<void> {
        await expect(
            this.page.getByText(/Sign Up For Community Updates/i)
        ).toBeVisible();

        for (const fieldName of [
            /First name/i,
            /Last name/i,
            /Email/i,
            /Country of Residence/i,
            /Zip\/Postal Code/i
        ]) {
            await expect(this.page.getByText(fieldName).first()).toBeVisible();
        }
    }

}
