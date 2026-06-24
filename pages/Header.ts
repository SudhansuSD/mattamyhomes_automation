import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type HeaderNavigationLink = {
  name: string;
  url: string;
};

export class Header extends BasePage {

  readonly header: Locator;
  readonly findYourHomeLink: Locator;
  readonly aboutUsLink: Locator;
  readonly contactUsLink: Locator;
  readonly aboutUsMenuLinks: Locator;
  private promoPopupHandlerRegistered = false;
  private nationalPromotionDismissed = false;

  constructor(page: Page) {
    super(page);

    this.header = page.locator('header');
    this.findYourHomeLink = this.header.locator('[id="Find Your Dream Home"]');
    this.aboutUsLink = this.header.getByRole('button', { name: /^About$/i });
    this.contactUsLink = this.header.locator('[id="Contact Us"]');
    this.aboutUsMenuLinks = this.header.locator('a[role="button"][href^="/about"]');
  }

  /* ==========================================================
     Header Visibility Validation
  ========================================================== */

  async verifyHeaderLinksVisible(): Promise<void> {
    await this.page.waitForSelector('header', { timeout: 20000 });
    await this.page.evaluate(() => window.scrollTo(0, 0));

    await this.findYourHomeLink.waitFor({
      state: 'attached',
      timeout: 20000
    });

    await this.assertVisible(this.findYourHomeLink, 'Find Your Dream Home header link should be visible');
    await this.assertVisible(this.aboutUsLink, 'About header menu button should be visible');
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

  async openAboutUsMenu(): Promise<void> {
    await this.header.waitFor({ state: 'attached', timeout: 20000 });
    await this.page.evaluate(() => window.scrollTo(0, 0));

    await this.aboutUsLink.waitFor({ state: 'visible', timeout: 20000 });
    await this.aboutUsLink.hover();
    await this.aboutUsLink.click();
    await this.assertAttached(
      this.header.locator('a[href="/about/about-mattamy"]'),
      'About Us menu should open'
    );
  }

  /* ==========================================================
     Find Your Home Link Validation
  ========================================================== */

  private get nationalPromotionDialog(): Locator {
    return this.page
      .locator('.ReactModal__Content[role="dialog"][aria-label="National promotion"]')
      .first();
  }

  private async closeNationalPromotionDialog(dialog: Locator): Promise<void> {
    const closeButton = dialog
      .locator(
        [
          'button[aria-label*="close" i]',
          'button[title*="close" i]',
          'button:has(svg)',
          '[role="button"][aria-label*="close" i]'
        ].join(', ')
      )
      .first();

    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click({ force: true });
    } else {
      await this.page.keyboard.press('Escape');
    }

    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    this.nationalPromotionDismissed = true;
    console.log('National promotion popup closed');
  }

  private async registerNationalPromotionHandler(): Promise<void> {
    if (this.promoPopupHandlerRegistered) {
      return;
    }

    await this.page.addLocatorHandler(
      this.nationalPromotionDialog,
      async (dialog) => this.closeNationalPromotionDialog(dialog)
    );
    this.promoPopupHandlerRegistered = true;
  }

  async verifyFindYourHomeLinks(): Promise<void> {
    await this.registerNationalPromotionHandler();
    await this.clickFindYourHome();

    const fyhLinkButtons = this.page.locator('button[href^="/search"]');
    const count = await fyhLinkButtons.count();

    console.log(`Total Find Your Dream Home links: ${count}`);

    for (let i = 0; i < count; i++) {
      const button = fyhLinkButtons.nth(i);

      const href = await button.getAttribute('href');
      const text = await button.innerText();

      console.log(`Testing: ${text} -> ${href}`);

      const metroMatch = href?.match(/metro=([^&]+)/);
      const metroValue = metroMatch ? metroMatch[1] : '';

      await this.clickElement(button);
      await this.waitForPageReady();

      // The campaign modal is injected shortly after the search page has loaded.
      if (!this.nationalPromotionDismissed) {
        await this.page.waitForTimeout(5000);
      }

      if (
        !this.nationalPromotionDismissed &&
        await this.nationalPromotionDialog.isVisible().catch(() => false)
      ) {
        await this.closeNationalPromotionDialog(this.nationalPromotionDialog);
      }

      const url = new URL(this.page.url());
      const metro = url.searchParams.get('metro');

      expect(metro).toBe(metroValue);

      console.log(`Passed: ${metroValue}`);

      await this.page.goBack();
      await this.page.waitForLoadState('domcontentloaded');
      await this.clickFindYourHome();
    }
  }

  /* ==========================================================
     About Us Link Validation
  ========================================================== */

  async getVisibleAboutUsMenuLinks(): Promise<HeaderNavigationLink[]> {
    await this.openAboutUsMenu();

    const links = await this.aboutUsMenuLinks.evaluateAll((elements) =>
      elements.map((element) => ({
        name: element.textContent?.trim().replace(/\s+/g, ' ') || '',
        url: element.getAttribute('href') || ''
      }))
    );

    const uniqueLinks = new Map<string, HeaderNavigationLink>();

    for (const link of links) {
      if (link.name && link.url && !uniqueLinks.has(link.url)) {
        uniqueLinks.set(link.url, link);
      }
    }

    return Array.from(uniqueLinks.values());
  }

  async verifyAboutUsMenuLinks(expectedLinks: readonly HeaderNavigationLink[]): Promise<void> {
    const actualLinks = await this.getVisibleAboutUsMenuLinks();

    expect(actualLinks, 'About Us menu links should match country configuration').toEqual(expectedLinks);

    for (const expectedLink of expectedLinks) {
      const menuLink = this.getAboutUsMenuLink(expectedLink);

      await this.assertAttached(
        menuLink,
        `${expectedLink.name} should be present in the About Us menu`
      );
      await this.assertAttribute(
        menuLink,
        'href',
        expectedLink.url,
        `${expectedLink.name} should point to ${expectedLink.url}`
      );
    }
  }

  async verifyAboutUsLinks(expectedLinks: readonly HeaderNavigationLink[]): Promise<void> {
    await this.verifyAboutUsMenuLinks(expectedLinks);

    for (const expectedLink of expectedLinks) {
      await this.openAboutUsMenu();

      const menuLink = this.getAboutUsMenuLink(expectedLink);
      await this.assertVisible(menuLink, `${expectedLink.name} should be visible in the About Us menu`);

      await menuLink.click();
      await this.page.waitForURL(
        (url) => url.pathname === expectedLink.url,
        { timeout: 30000 }
      );
      await this.waitForPageReady();

      await this.assertPageUrl(
        new RegExp(`${this.escapeRegExp(expectedLink.url)}(?:\\?.*)?$`),
        `${expectedLink.name} should navigate to the configured About URL`
      );

      await this.assertHeadingVisible(
        undefined,
        `${expectedLink.name} page should expose a visible H1`,
        15_000
      );

      await this.page.goBack({ waitUntil: 'domcontentloaded' });
      await this.waitForPageReady();
    }
  }

  async clickAboutUsMenuLink(expectedLink: HeaderNavigationLink): Promise<void> {
    const menuLink = this.getAboutUsMenuLink(expectedLink);

    await this.assertAttached(
      menuLink,
      `${expectedLink.name} should be visible before clicking`
    );
    await menuLink.click({ timeout: 10000 });
    await this.page.waitForURL(
        (url) => url.pathname === expectedLink.url,
        { timeout: 30000 }
      );

    await this.waitForPageReady();
  }

  private getAboutUsMenuLink(expectedLink: HeaderNavigationLink): Locator {
    return this.aboutUsMenuLinks
      .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(expectedLink.name)}\\s*$`, 'i') })
      .and(this.header.locator(`a[href="${expectedLink.url}"]`))
      .first();
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
