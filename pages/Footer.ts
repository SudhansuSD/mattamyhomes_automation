import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/* ==========================================================
   Footer Page Object Model
========================================================== */

export class Footer extends BasePage {

  readonly footerSection: Locator;
  readonly privacyPolicyLink: Locator;

  /* ==========================================================
     Constructor – Initialize Locators
  ========================================================== */

  constructor(page: Page) {
    super(page);

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
    await this.assertVisible(this.privacyPolicyLink, 'Privacy Policy footer link should be visible');

    // Hover for stability check
    await this.privacyPolicyLink.hover();
  }
}
