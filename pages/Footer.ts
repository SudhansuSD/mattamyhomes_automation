import { Page, Locator, expect } from '@playwright/test';

// Footer Page Object Model
export class Footer {
    readonly page: Page;
    readonly footerSection: Locator;
    readonly privacyPolicyLink: Locator;
// Initialize locators in the constructor
    constructor(page: Page) {
        this.page = page;
        this.footerSection = page.locator("//section[@id='footer']");
        this.privacyPolicyLink = page.getByRole('link', { name: /Privacy Policy/i });
    }
// Verify that footer is loaded and Privacy Policy link is visible
    async verifyFooterLoaded() {
        await this.footerSection.scrollIntoViewIfNeeded();
        await this.footerSection.waitFor({ state: 'visible' });
        await expect(this.privacyPolicyLink).toBeVisible();
        await this.privacyPolicyLink.hover();
    }
}
