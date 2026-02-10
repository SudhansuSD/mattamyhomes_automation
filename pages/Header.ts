import { Page, Locator, expect } from '@playwright/test';

export class Header {
  readonly page: Page;
  readonly header: Locator;
  readonly findYourHomeLink: Locator;
  readonly aboutUsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Scope everything to header (CRITICAL)
    this.header = page.locator('header');

    // Stable locator using id (no escaping issues)
    this.findYourHomeLink = this.header.locator(
      '[id="Find Your Dream Home"]'
    );

    // Avoid role-based locator
    this.aboutUsLink = this.header.locator('button, a').filter({
      hasText: /about/i
    });
  }

  async verifyHeaderLinksVisible(): Promise<void> {
    // 1️⃣ Wait for header hydration
    await this.page.waitForSelector('header', { timeout: 20000 });

    // 2️⃣ Ensure header is in viewport (headless fix)
    await this.page.evaluate(() => window.scrollTo(0, 0));

    // 3️⃣ Wait for CTA to be attached
    await this.findYourHomeLink.waitFor({
      state: 'attached',
      timeout: 20000
    });

    // 4️⃣ Assert visibility
    await expect(this.findYourHomeLink).toBeVisible({ timeout: 10000 });
    await expect(this.aboutUsLink.first()).toBeVisible({ timeout: 10000 });

    // 5️⃣ Safe hover
    await this.aboutUsLink.first().hover();
  }

  async clickFindYourHome(): Promise<void> {
    await this.findYourHomeLink.scrollIntoViewIfNeeded();
    await this.findYourHomeLink.click();
  }
}
