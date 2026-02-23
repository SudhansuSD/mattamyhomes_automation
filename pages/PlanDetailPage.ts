import { Locator, Page, expect } from '@playwright/test';
import { HomePage } from './HomePage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

export class PlanDetailPage extends HomePage {

    readonly heading: Locator;
    readonly breadcrumb: Locator;
    readonly priceSection: Locator;
    readonly galleryImages: Locator;
    readonly nextGalleryBtn: Locator;
    readonly prevGalleryBtn: Locator;
    readonly floorPlanSection: Locator;
    readonly mortgageBtn: Locator;
    readonly mortgageComponent: Locator;
    readonly closeModalBtn: Locator;
    readonly communityLink: Locator;
    readonly qmiSection: Locator;
    readonly viewAllQMIButton: Locator;
    readonly qmiHomeslist: Locator;


    constructor(page: Page) {

        super(page);
        this.heading = page.locator('h1');
        this.breadcrumb = page.locator('#breadcrumb');
        this.priceSection = page.getByText('Starting from', { exact: true });
        this.galleryImages = page.locator('.slick-slide img, .swiper-slide img, img');
        this.nextGalleryBtn = page.getByLabel('Next slide');
        this.prevGalleryBtn = page.getByLabel('Previous slide');
        this.floorPlanSection = page.locator('#floorplan');
        this.mortgageBtn = page.getByRole('button', { name: /Get Started|Mortgage/i });
        this.mortgageComponent = page.locator('.sc-gyRCUT');
        this.closeModalBtn = this.mortgageComponent.locator(':text("CLOSE")');
        this.communityLink = this.breadcrumb.getByLabel(`${location.community}`);
        this.qmiSection = page.locator('#availablehomes');
        this.viewAllQMIButton = this.qmiSection.locator('a:has-text("View all")');
        this.qmiHomeslist = page.locator('a[aria-label*="Floorplan"]');
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

        await this.page.waitForLoadState('domcontentloaded');

        await expect(this.page).toHaveURL(
            new RegExp(expectedSlug, 'i')
        );

        await expect(this.heading).toBeVisible({ timeout: 20000 });
    }

    async verifyHeroSection() {
        await expect(this.heading).toBeVisible({ timeout: 20000 });
    }

    async verifyBreadcrumb() {
        if (await this.breadcrumb.count() > 0) {
            await expect(this.breadcrumb.first()).toBeVisible();
        }
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
        if (await this.floorPlanSection.isVisible()) {
            await this.floorPlanSection.scrollIntoViewIfNeeded();
        }
    }

    async verifyMortgageForm() {
        if (await this.mortgageBtn.isVisible()) {
            await this.mortgageBtn.click({ timeout: 500 });


            if (await this.mortgageComponent.isVisible()) {
                await this.closeModalBtn.click();
            }
        }
    }

    async verifyCommunityNavigation() {

        if (await this.communityLink.first().isVisible()) {

            const href = await this.communityLink.first().getAttribute('href');

            console.log('Community Link URL:', href);

            await Promise.all([
                this.page.waitForLoadState('domcontentloaded'),
                this.communityLink.first().click()
            ]);
        }
    }
    async verifyQMISection() {
        if (await this.qmiSection.isVisible()) {

            await this.qmiSection.scrollIntoViewIfNeeded();
            await this.page.waitForLoadState('domcontentloaded');

            console.log("Number of QMI Homes listed:", await this.qmiHomeslist.count());
            for (let i = 0; i < await this.qmiHomeslist.count(); i++) {
                const homeLink = this.qmiHomeslist.nth(i);
                await expect(homeLink).toBeVisible();
                const homeHref = await homeLink.getAttribute('href');
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

}
