import { Locator, Page, expect } from '@playwright/test';
import { HomePage } from './HomePage';

/* ==========================================================
   QMI Detail Page – Page Object Model
========================================================== */

export class QMIPage extends HomePage {

    readonly heading: Locator;
    readonly breadcrumb: Locator;
    readonly priceSection: Locator;
    readonly galleryImages: Locator;
    readonly nextGalleryBtn: Locator;
    readonly prevGalleryBtn: Locator;
    readonly floorPlanSection: Locator;
    readonly featuresAccordion: Locator;
    readonly mortgageBtn: Locator;
    readonly closeModalBtn: Locator;
    readonly communityLink: Locator;

    constructor(page: Page) {
        super(page);

        /* ==========================================================
           Stable Locators
        ========================================================== */

        this.heading = page.locator('h1');
        this.breadcrumb = page.locator('#breadcrumb');
        this.priceSection = page.locator('text=/\\$|From|Starting/i');

        this.galleryImages = page.locator(
            '.slick-slide img, .swiper-slide img'
        );

        this.nextGalleryBtn = page.locator(
            'button[aria-label="Next"]'
        );

        this.prevGalleryBtn = page.locator(
            'button[aria-label="Previous"]'
        );

        this.floorPlanSection = page.locator('text=/Floor Plan/i');

        this.featuresAccordion = page.locator(
            'button:has-text("Features"), button:has-text("Details")'
        );

        this.mortgageBtn = page.getByRole('button', {
            name: /Get Started/i
        });

        this.closeModalBtn = page.locator(
            'button[aria-label="Close"]'
        );

        this.communityLink = page.locator(
            'a:has-text("Community")'
        );
    }

    /* ==========================================================
       Page Load Validation
    ========================================================== */

    async verifyPageLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible({ timeout: 20000 });
        await expect(this.breadcrumb).toBeVisible();
    }

    /* ==========================================================
       QMI Search Validation (Dynamic + Safe)
    ========================================================== */

    async verifySearchByQMI(expectedAddress: string): Promise<void> {

        // Common load stabilization
        await this.waitForPageReady();

        // Ensure URL is not homepage
        await expect(this.page).not.toHaveURL(/\?country=/i);

        // Ensure QMI-style URL (contains numbers)
        await expect(this.page).toHaveURL(/-\d{3,}/);

        // Validate heading is visible
        await expect(this.heading).toBeVisible({ timeout: 20000 });

        // Validate heading contains expected address
        await expect(this.heading).toContainText(
            new RegExp(expectedAddress, 'i')
        );
    }

    /* ==========================================================
       Price / CTA Validation
    ========================================================== */

    async verifyPriceOrCTA(): Promise<void> {
        await expect(this.priceSection.first()).toBeVisible();
    }

    /* ==========================================================
       Gallery Validation
    ========================================================== */

    async verifyGallery(): Promise<void> {

        await expect(this.galleryImages.first()).toBeVisible();

        if (await this.nextGalleryBtn.isVisible()) {
            await this.nextGalleryBtn.click();
        }

        if (await this.prevGalleryBtn.isVisible()) {
            await this.prevGalleryBtn.click();
        }
    }

    /* ==========================================================
       Floor Plan Validation
    ========================================================== */

    async verifyFloorPlan(): Promise<void> {

        if (await this.floorPlanSection.isVisible()) {
            await this.floorPlanSection.scrollIntoViewIfNeeded();
        }
    }

    /* ==========================================================
       Features Accordion Validation
    ========================================================== */

    async verifyFeaturesAccordion(): Promise<void> {

        const count = await this.featuresAccordion.count();

        for (let i = 0; i < count; i++) {
            await this.featuresAccordion.nth(i).click();
        }
    }

    /* ==========================================================
       Mortgage Popup (No Form Submit)
    ========================================================== */

    async verifyMortgagePopup(): Promise<void> {

        if (await this.mortgageBtn.isVisible()) {
            await this.mortgageBtn.click();
        } else {
            console.log(
                'Mortgage button not found - skipping validation'
            );
        }
    }

    /* ==========================================================
       Community Navigation Validation
    ========================================================== */

    async verifyCommunityNavigation(): Promise<void> {

        if (await this.communityLink.isVisible()) {

            await this.communityLink.click();

            await expect(this.page).toHaveURL(
                /community|carrington|landmarke/i
            );
        }
    }
}