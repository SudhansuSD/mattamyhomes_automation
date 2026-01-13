import { Page, Locator, expect } from '@playwright/test';
// Header Page Object Model
export class Header {
    readonly page: Page;
    readonly findYourHomeLink: Locator;
    readonly aboutUsLink: Locator;
    
// Initialize locators in the constructor
    constructor(page: Page) {
        this.page = page;
        this.findYourHomeLink = page.getByRole("button", { name: /Find Your Dream Home/i });
        this.aboutUsLink = page.getByRole("button", { name: /About/i });
    }
    // Verify that header links are visible
    async verifyHeaderLinksVisible() {
        await expect(this.findYourHomeLink).toBeVisible();
        await expect(this.aboutUsLink).toBeVisible();
        await this.aboutUsLink.hover();
    }

    async clickFindYourHome() {
        await this.findYourHomeLink.click();
    }
}
