import { Page, Locator, expect } from '@playwright/test';

export class Header {
    readonly page: Page;
    readonly findYourHomeLink: Locator;
    readonly aboutUsLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.findYourHomeLink = page.getByRole("button", { name: /Find Your Dream Home/i });
        this.aboutUsLink = page.getByRole("button", { name: /About/i });
    }

    async verifyHeaderLinksVisible() {
        await expect(this.findYourHomeLink).toBeVisible();
        await expect(this.aboutUsLink).toBeVisible();
    }

    async clickFindYourHome() {
        await this.findYourHomeLink.click();
    }
}
