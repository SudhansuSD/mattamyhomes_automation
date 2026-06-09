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

  constructor(page: Page) {
    super(page);

    this.header = page.locator('header');
    this.findYourHomeLink = this.header.locator('[id="Find Your Dream Home"]');
    this.aboutUsLink = this.header.getByRole('button', { name: /^About$/i });
    this.contactUsLink = this.header.locator('[id="Contact Us"]');
    this.aboutUsMenuLinks = this.header.locator('a[href^="/about"]');
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

    if (await this.aboutUsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.aboutUsLink.hover();
      await this.aboutUsLink.click();
      await this.assertAttached(this.aboutUsMenuLinks.first(), 'About Us menu should open');
      return;
    }

    await this.assertAttached(this.aboutUsMenuLinks.first(), 'About Us menu should be attached');
  }

  /* ==========================================================
     Find Your Home Link Validation
  ========================================================== */

  async verifyFindYourHomeLinks(): Promise<void> {
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
    const href = await menuLink.getAttribute('href');
    const didClick = await menuLink.click({ timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    const didNavigate = didClick
      ? await this.page.waitForURL(
        (url) => url.pathname === expectedLink.url,
        { timeout: 30000 }
      ).then(() => true).catch(() => false)
      : false;

    const currentPath = new URL(this.page.url()).pathname;

    if (!didNavigate && currentPath !== expectedLink.url) {
      await this.page.goto(new URL(href ?? expectedLink.url, this.page.url()).href, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000
      });
    }

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
