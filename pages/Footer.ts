import { Page, Locator, expect } from '@playwright/test';

/* ==========================================================
   Footer Page Object Model
========================================================== */

export class Footer {

  readonly page: Page;
  readonly footerSection: Locator;
  readonly privacyPolicyLink: Locator;

  /* ==========================================================
     Constructor – Initialize Locators
  ========================================================== */

  constructor(page: Page) {
    this.page = page;

    this.footerSection = page.locator("//section[@id='footer']");
    this.privacyPolicyLink = page.getByRole('link', {
      name: /Privacy Policy/i
    });
  }

  /* ==========================================================
     Footer Validation
  ========================================================== */

  async verifyFooterLoaded(): Promise<void> {

    // Scroll footer into view
    await this.footerSection.scrollIntoViewIfNeeded();

    // Wait until visible
    await this.footerSection.waitFor({ state: 'visible' });

    // Validate Privacy Policy link
    await expect(this.privacyPolicyLink).toBeVisible();

    // Hover for stability check
    await this.privacyPolicyLink.hover();
  }
}