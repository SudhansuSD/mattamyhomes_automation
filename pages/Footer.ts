import { Page, Locator, expect } from '@playwright/test';

export class Footer {
    readonly page: Page;
    readonly footerSection: Locator;
    readonly privacyPolicyLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.footerSection = page.locator("//section[@id='footer']");
        this.privacyPolicyLink = page.getByRole('link', { name: /Privacy Policy/i });
    }

    async scrollToFooter(): Promise<void> {
        await this.footerSection.scrollIntoViewIfNeeded();
        await this.footerSection.waitFor({ state: 'visible' });
    }
    async verifyFooterLoaded() {
        // await expect(this.footerSection).toBeVisible();
        await this.page.waitForTimeout(2000); // Wait for 2 seconds to ensure footer is fully loaded
        await expect(this.privacyPolicyLink).toBeVisible();
    }
}
