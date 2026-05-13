import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class Header extends BasePage {

  readonly header: Locator;
  readonly findYourHomeLink: Locator;
  readonly aboutUsLink: Locator;
  readonly contactUsLink: Locator;

  constructor(page: Page) {
    super(page);

    /* ==========================================================
       Scoped Header Container (CRITICAL)
    ========================================================== */

    this.header = page.locator('header');

    /* ==========================================================
       Header Links
    ========================================================== */

    // Stable locator using id (no escaping issues)
    this.findYourHomeLink = this.header.locator(
      '[id="Find Your Dream Home"]'
    );

    // Avoid role-based locator
    this.aboutUsLink = this.header
      .getByRole('button', { name: /About/i });

    this.contactUsLink = this.header.locator('[id="Contact Us"]');

  }

  /* ==========================================================
     Header Visibility Validation
  ========================================================== */

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
    await expect(this.aboutUsLink).toBeVisible({ timeout: 10000 });

    // 5️⃣ Safe hover
    await this.aboutUsLink.first().hover();
  }

  /* ==========================================================
     Actions
  ========================================================== */

  async clickFindYourHome(): Promise<void> {
    await this.clickElement(this.findYourHomeLink);
  }
  async clickAboutUs(): Promise<void> {
    await this.clickElement(this.aboutUsLink);
  }

  async clickContactUs(): Promise<void> {
    await this.clickElement(this.contactUsLink);
  }
  /* ==========================================================
  Verify Find Your Homes links and navigations
  ========================================================== */

  async verifyFindYourHomeLinks(): Promise<void> {

    await this.clickFindYourHome();

    const fyhLinkButtons = this.page.locator('button[href^="/search"]');
    const count = await fyhLinkButtons.count();

    console.log(`✅ Total Find Your Dream Home links: ${count}`);

    for (let i = 0; i < count; i++) {

      // 🔁 Re-locate each time (important after navigation)
      const button = fyhLinkButtons.nth(i);

      const href = await button.getAttribute('href');
      const text = await button.innerText();

      console.log(`🔗 Testing: ${text} -> ${href}`);

      // ✅ Extract metro value from href
      const metroMatch = href?.match(/metro=([^&]+)/);
      const metroValue = metroMatch ? metroMatch[1] : '';

      await this.clickElement(button);
      await this.waitForPageReady(); // optional

      const url = new URL(this.page.url());
      const metro = url.searchParams.get('metro');

      expect(metro).toBe(metroValue);

      console.log(`✅ Passed: ${metroValue}`);

      // 🔙 Go back
      await this.page.goBack();
      await this.page.waitForLoadState('domcontentloaded');

      // 🔁 Re-open menu for next iteration
      await this.clickFindYourHome();
    }
  }

  /* ==========================================================
    Validate About Us link and navigation
  ========================================================== */
  async verifyAboutUsLinks(): Promise<void> {

    await this.clickAboutUs();

    const aboutLinks = this.page.locator('[aria-hidden="false"] a[href^="/about"]');
    const count = await aboutLinks.count();

    console.log(`✅ Total About links: ${count}`);

    for (let i = 0; i < count; i++) {

      // 🔁 Re-locate every time
      const link = aboutLinks.nth(i);

      const href = await link.getAttribute('href');   // e.g. /about/careers
      const text = await link.innerText();

      console.log(`🔗 Testing: ${text} -> ${href}`);

      // ✅ Extract expected path from href
      const expectedPath = href?.split('/about/')[1]; // careers, about-mattamy etc.

      await this.clickElement(link);

      // ✅ Validate using URL object to avoid encoding issues
      await this.waitForPageReady();
      const url = new URL(this.page.url());
      const actualPath = url.pathname;

      expect(actualPath).toContain(expectedPath!);

      console.log(`✅ Passed: ${text}`);

      // 🔙 Go back
      await this.page.goBack();
      await this.page.waitForLoadState('domcontentloaded');

      // 🔁 Re-open menu
      await this.clickAboutUs();
    }

  }
}
