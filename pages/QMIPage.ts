import { Locator, Page, expect } from '@playwright/test';
import { HomePage } from './HomePage';
import { getLocationConfig } from '../config/locations';

/* ==========================================================
    QMI Page Object Model
========================================================== */

const location = getLocationConfig();

export class QMIPage extends HomePage {
    private static readonly PAGE_LOAD_TIMEOUT = 20000;
    private static readonly UTOUR_TIMEOUT = 15000;
    private static readonly HOME_QUERY_PARAM_PATTERN = /\?country=/i;
    private static readonly QMI_URL_PATTERN = /\/\d{1,}-/;

    readonly heroSection: Locator;
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

    constructor(page: Page) {
        super(page);
        const mortgageSectionTitle = page.getByText('Mortgage Calculator', {
            exact: true
        });

        this.heroSection = page.locator("//div[@id='detailsBlockBar']/following-sibling::div[1]");
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
    }

    /* ==========================================================
       Page Load Validation
    ========================================================== */

    async verifyPageLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.breadcrumb).toBeVisible();
    }

    /* ==========================================================
       QMI Search Validation (Dynamic + Safe)
    ========================================================== */

    async verifySearchByQMI(expectedAddress: string): Promise<void> {
        await this.waitForPageReady();
        await expect(this.page).not.toHaveURL(QMIPage.HOME_QUERY_PARAM_PATTERN);
        await expect(this.page).toHaveURL(QMIPage.QMI_URL_PATTERN);
        await expect(this.heading).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.heading).toContainText(
            new RegExp(expectedAddress, 'i')
        );
    }

    async verifyExactQmiUrl(): Promise<void> {
        const currentPath = new URL(this.page.url()).pathname;
        expect(currentPath).toBe(location.qmiPath);
    }

    async verifyHeroSection(): Promise<void> {
        await expect(this.heroSection).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.heading).toBeVisible({
            timeout: QMIPage.PAGE_LOAD_TIMEOUT
        });
        await expect(this.heading).toContainText(
            new RegExp(location.qmiAddress, 'i'),
            { timeout: QMIPage.PAGE_LOAD_TIMEOUT }
        );
        await expect(this.propertyStats).toBeVisible();
       
    }

    async verifyBreadcrumb(): Promise<void> {
        await expect(this.breadcrumb).toBeVisible();
    }

    /* ==========================================================
       Price / CTA Validation
    ========================================================== */

    async verifyPriceOrCTA(): Promise<void> {
        await expect(this.priceSection.first()).toBeVisible();
        await expect(this.getInformationCta).toBeVisible();
    }

    async verifyGetInformationScrollsToForm(): Promise<void> {
        await expect(this.getInformationCta).toBeVisible();
        await expect(this.formSection).toBeAttached();
        await this.getInformationCta.scrollIntoViewIfNeeded();
        await this.getInformationCta.click();
        await expect(this.formSection).toBeInViewport();
    }

    /* ==========================================================
       Gallery Validation
    ========================================================== */

    async verifyGallery(): Promise<void> {
        await expect(this.gallerySection.first()).toBeVisible();
        await this.clickIfVisible(this.nextGalleryBtn);
        await this.clickIfVisible(this.prevGalleryBtn);
    }

    /* ==========================================================
       Floor Plan Validation
    ========================================================== */

    async verifyFloorPlan(): Promise<void> {
        if (await this.isVisible(this.floorPlanSection)) {
            await this.floorPlanSection.scrollIntoViewIfNeeded();
            await expect(this.floorPlanSection).toBeVisible();
        }
    }

    /* ==========================================================
       Mortgage Popup (No Form Submit)
    ========================================================== */

    async verifyMortgagePopup(): Promise<void> {
        if (await this.isVisible(this.mortgageComponent)) {
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
       UTour Section Validation
    ========================================================== */

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

    async verifyUTourSectionHidden(): Promise<void> {
        await expect(this.uTourTitle).toHaveCount(0);
        await expect(this.uTourCta).toHaveCount(0);
    }

    private async isVisible(locator: Locator): Promise<boolean> {
        return locator.isVisible().catch(() => false);
    }

    private async clickIfVisible(locator: Locator): Promise<void> {
        if (await this.isVisible(locator)) {
            await locator.click();
        }
    }

    private async closeModalIfPresent(): Promise<void> {
        if (await this.isVisible(this.closeModalBtn)) {
            await this.closeModalBtn.click();
            await expect(this.closeModalBtn).toBeHidden({
                timeout: QMIPage.PAGE_LOAD_TIMEOUT
            });
        }
    }
    /* ==========================================================
       Breadcrumb link Validation
    ========================================================== */

    private getQmiPathSegments(): string[] {
        return location.qmiPath.split('/').filter(Boolean);
    }

    private getSlugTextPattern(slug: string): RegExp {
        const escapedWords = slug
            .split('-')
            .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

        return new RegExp(escapedWords.join('[\\s-]+'), 'i');
    }

    private getVisibleSlugTextPattern(slug: string): RegExp {
        const visibleWords = slug
            .split('-')
            .filter((word) => !/^\d+s?$/i.test(word));

        return this.getSlugTextPattern(visibleWords.join('-') || slug);
    }

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
            this.getSlugTextPattern(stateSlug)
        );
        await expect(this.breadcrumb).toContainText(
            this.getVisibleSlugTextPattern(communitySlug)
        );
        await expect(this.breadcrumb).toContainText(
            this.getSlugTextPattern(addressSlugs.join('-'))
        );
    }
}
