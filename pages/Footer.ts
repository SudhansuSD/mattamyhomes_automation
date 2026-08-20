import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

// Footer Page Object Model

export class Footer extends BasePage {
  readonly footerSection: Locator;
  readonly privacyPolicyLink: Locator;

  // Constructor – Initialize Locators

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.footerSection = page.locator("//section[@id='footer']");
    this.privacyPolicyLink = page.getByRole('link', {
      name: /Privacy Policy/i,
    });
  }

  // Footer Validation

  /** Checks that the footer loaded. */
  async verifyFooterLoaded(): Promise<void> {
    await this.step('Verify footer loaded', async () => {
      // Scroll footer into view
      await this.footerSection.scrollIntoViewIfNeeded();

      // Wait until visible
      await this.footerSection.waitFor({ state: 'visible' });

      // Validate Privacy Policy link
      await this.assertVisible(
        this.privacyPolicyLink,
        'Privacy Policy footer link should be visible',
      );

      // Hover for stability check
      await this.privacyPolicyLink.hover();
    });
  }

  /** Checks that the footer social links are present and correctly linked. */
  async verifySocialLinks(): Promise<void> {
    await this.step('Verify footer social links', async () => {
      await this.footerSection.scrollIntoViewIfNeeded();
      await this.footerSection.waitFor({ state: 'visible', timeout: 15000 });

      const socialPattern = /facebook|instagram|twitter|x\.com|youtube|linkedin|pinterest|tiktok/i;
      const socialLinks = this.footerSection.locator('a[href]').filter({
        has: this.page.locator('svg, img'),
      });

      const hrefs = await this.footerSection
        .locator('a[href]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href') || ''));

      const socialHrefs = hrefs.filter((href) => socialPattern.test(href));

      await this.reportValue('Footer social links found', socialHrefs.join(', ') || '(none)');

      expect(socialHrefs.length, 'Footer should expose social media links').toBeGreaterThan(0);

      for (const href of socialHrefs) {
        expect(href, `Social link should be an absolute URL: ${href}`).toMatch(/^https?:\/\//i);
      }

      // Guard against decorative anchors with no destination.
      const brokenSocial = await socialLinks.evaluateAll(
        (links) => links.filter((link) => !link.getAttribute('href')).length,
      );
      expect(brokenSocial, 'Footer social icons should carry href destinations').toBe(0);
    });
  }

  /**
   * Checks the footer newsletter signup when present: an email field with a
   * subscribe control that enforces client-side validation on empty submit.
   */
  async verifyNewsletterSignup(): Promise<void> {
    await this.step('Verify footer newsletter signup', async () => {
      await this.footerSection.scrollIntoViewIfNeeded();

      const emailField = this.footerSection
        .locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]')
        .first();

      if (!(await emailField.isVisible({ timeout: 8000 }).catch(() => false))) {
        await this.reportValue('No footer newsletter signup present on this page (skipping)');
        return;
      }

      await this.assertVisible(emailField, 'Footer newsletter should expose an email field');

      const subscribeButton = this.footerSection
        .getByRole('button', { name: /subscribe|sign up|submit|join/i })
        .first();

      await this.assertVisible(
        subscribeButton,
        'Footer newsletter should expose a subscribe control',
      );

      // Invalid email should surface client-side validation rather than submit.
      await emailField.fill('not-an-email');
      await subscribeButton.click();
      await this.settle(1000);

      const invalid = await this.footerSection.locator(':invalid, [aria-invalid="true"]').count();
      expect(invalid, 'Newsletter signup should reject an invalid email address').toBeGreaterThan(
        0,
      );
    });
  }
}
