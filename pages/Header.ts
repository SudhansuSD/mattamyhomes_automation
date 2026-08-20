import { Page, Locator, expect } from '@playwright/test';
import { escapeRegex } from '../utils/pageObjectUtils';
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

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header');
    this.findYourHomeLink = this.header.locator('[id="Find Your Dream Home"]');
    this.aboutUsLink = this.header.getByRole('button', { name: /^About$/i });
    this.contactUsLink = this.header.locator('[id="Contact Us"]');
    this.aboutUsMenuLinks = this.header.locator('a[role="button"][href^="/about"]');
  }

  // Header Visibility Validation

  /** Checks that the header links are visible. */
  async verifyHeaderLinksVisible(): Promise<void> {
    await this.step('Verify header links visible', async () => {
      await this.page.waitForSelector('header', { timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      await this.findYourHomeLink.waitFor({
        state: 'attached',
        timeout: 20000,
      });

      await this.assertVisible(
        this.findYourHomeLink,
        'Find Your Dream Home header link should be visible',
      );
      await this.assertVisible(this.aboutUsLink, 'About header menu button should be visible');
      await this.aboutUsLink.first().hover();
    });
  }

  // Actions

  /** Clicks find your home. */
  async clickFindYourHome(): Promise<void> {
    await this.step('Click Find Your Dream Home', async () => {
      await this.clickElement(this.findYourHomeLink);
    });
  }

  /** Clicks about us. */
  async clickAboutUs(): Promise<void> {
    await this.step('Click About', async () => {
      await this.clickElement(this.aboutUsLink);
    });
  }

  /** Clicks contact us. */
  async clickContactUs(): Promise<void> {
    await this.step('Click Contact Us', async () => {
      await this.clickElement(this.contactUsLink);
    });
  }

  /** Opens about us menu. */
  async openAboutUsMenu(expectedLinkCount?: number): Promise<void> {
    await this.step('Open About Us menu', async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      await this.aboutUsLink.waitFor({ state: 'visible', timeout: 20000 });
      await this.aboutUsLink.hover();
      await this.aboutUsLink.click();
      await this.assertAttached(
        this.header.locator('a[href="/about/about-mattamy"]'),
        'About Us menu should open',
      );

      // Wait for the flyout to finish populating before callers read it: the
      // links render/animate in asynchronously, so a read taken right after the
      // first link attaches can capture a partial list and flake a strict compare.
      if (expectedLinkCount && expectedLinkCount > 0) {
        await expect
          .poll(async () => this.aboutUsMenuLinks.count(), {
            message: `About Us menu should render ${expectedLinkCount} links`,
            timeout: 15000,
          })
          .toBeGreaterThanOrEqual(expectedLinkCount);
      }
    });
  }

  // Find Your Home Link Validation

  /** Gets the national promotion dialog locator. */
  private get nationalPromotionDialog(): Locator {
    return this.page
      .locator('.ReactModal__Content[role="dialog"][aria-label="National promotion"]')
      .first();
  }

  /** Closes national promotion dialog. */
  private async closeNationalPromotionDialog(dialog: Locator): Promise<void> {
    const closeButton = dialog
      .locator(
        [
          'button[aria-label*="close" i]',
          'button[title*="close" i]',
          'button:has(svg)',
          '[role="button"][aria-label*="close" i]',
        ].join(', '),
      )
      .first();

    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click({ force: true });
    } else {
      await this.page.keyboard.press('Escape');
    }

    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    this.nationalPromotionDismissed = true;
    await this.reportValue('National promotion popup closed');
  }

  /** Registers national promotion handler. */
  private async registerNationalPromotionHandler(): Promise<void> {
    if (this.promoPopupHandlerRegistered) {
      return;
    }

    await this.page.addLocatorHandler(this.nationalPromotionDialog, async (dialog) =>
      this.closeNationalPromotionDialog(dialog),
    );
    this.promoPopupHandlerRegistered = true;
  }

  /** Checks the Find Your Home links. */
  async verifyFindYourHomeLinks(): Promise<void> {
    await this.step('Verify Find Your Dream Home links', async () => {
      await this.registerNationalPromotionHandler();
      await this.clickFindYourHome();

      const fyhLinkButtons = this.header.locator('button[href^="/search"], a[href^="/search"]');
      await expect
        .poll(() => fyhLinkButtons.count(), {
          message: 'Find Your Dream Home menu should expose search links',
          timeout: 15000,
        })
        .toBeGreaterThan(0);

      const links = await fyhLinkButtons.evaluateAll((elements) =>
        elements
          .map((element) => ({
            href: element.getAttribute('href') || '',
            text: element.textContent?.trim().replace(/\s+/g, ' ') || '',
          }))
          .filter((link) => /^\/search/i.test(link.href)),
      );
      const count = links.length;

      await this.reportValue('Total Find Your Dream Home links', count);
      expect(count, 'Find Your Dream Home menu should expose search links').toBeGreaterThan(0);

      for (const [i, { href, text }] of links.entries()) {
        expect(href, `Find Your Dream Home link ${i + 1} should expose href`).toMatch(/^\/search/i);

        await this.reportValue(
          `Find Your Dream Home link ${i + 1}: ${text}`,
          this.buildFullUrl(href),
        );

        const metroMatch = href?.match(/metro=([^&]+)/);
        const metroValue = metroMatch ? metroMatch[1] : '';

        if (i > 0) {
          expect(
            metroValue,
            `Find Your Dream Home link ${i + 1} should include metro`,
          ).toBeTruthy();
          continue;
        }

        await this.page.goto(this.buildFullUrl(href), {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        });
        await this.waitForPageReady();

        // The campaign modal is injected shortly after the search page has loaded.
        // Wait for it to actually appear (up to the same 5s) instead of always
        // sleeping the full duration — returns as soon as it shows and never
        // throws when it never appears, so the visibility check below is unchanged.
        if (!this.nationalPromotionDismissed) {
          await this.nationalPromotionDialog
            .waitFor({ state: 'visible', timeout: 5000 })
            .catch(() => undefined);
        }

        if (
          !this.nationalPromotionDismissed &&
          (await this.nationalPromotionDialog.isVisible().catch(() => false))
        ) {
          await this.closeNationalPromotionDialog(this.nationalPromotionDialog);
        }

        const url = new URL(this.page.url());
        const metro = url.searchParams.get('metro') ?? '';

        expect(metro).toBe(metroValue);
      }
    });
  }

  // About Us Link Validation

  /** Gets visible about us menu links. */
  async getVisibleAboutUsMenuLinks(expectedLinkCount?: number): Promise<HeaderNavigationLink[]> {
    return this.step('Get visible About Us menu links', async () => {
      await this.openAboutUsMenu(expectedLinkCount);

      const links = await this.aboutUsMenuLinks.evaluateAll((elements) =>
        elements.map((element) => ({
          name: element.textContent?.trim().replace(/\s+/g, ' ') || '',
          url: element.getAttribute('href') || '',
        })),
      );

      const uniqueLinks = new Map<string, HeaderNavigationLink>();

      for (const link of links) {
        if (link.name && link.url && !uniqueLinks.has(link.url)) {
          uniqueLinks.set(link.url, link);
        }
      }

      return Array.from(uniqueLinks.values());
    });
  }

  /** Checks the About Us menu links. */
  async verifyAboutUsMenuLinks(expectedLinks: readonly HeaderNavigationLink[]): Promise<void> {
    await this.step('Verify About Us menu links', async () => {
      const actualLinks = await this.getVisibleAboutUsMenuLinks(expectedLinks.length);

      // Order-independent comparison: the flyout can render links in a different
      // order than the config, and the per-link assertions below already verify
      // each expected link is present with the correct href. Compare as sets so
      // the check is resilient to ordering without losing coverage.
      const sortByUrl = (links: readonly HeaderNavigationLink[]) =>
        [...links].sort((a, b) => a.url.localeCompare(b.url));

      expect(
        sortByUrl(actualLinks),
        'About Us menu links should match country configuration',
      ).toEqual(sortByUrl(expectedLinks));

      for (const expectedLink of expectedLinks) {
        const menuLink = this.getAboutUsMenuLink(expectedLink);

        await this.assertAttached(
          menuLink,
          `${expectedLink.name} should be present in the About Us menu`,
        );
        await this.assertAttribute(
          menuLink,
          'href',
          expectedLink.url,
          `${expectedLink.name} should point to ${expectedLink.url}`,
        );

        await this.reportValue(
          `About Us menu link: ${expectedLink.name}`,
          this.buildFullUrl(expectedLink.url),
        );
      }
    });
  }

  /** Checks the About Us links. */
  async verifyAboutUsLinks(expectedLinks: readonly HeaderNavigationLink[]): Promise<void> {
    await this.step('Verify About Us links navigation', async () => {
      await this.verifyAboutUsMenuLinks(expectedLinks);

      for (const expectedLink of expectedLinks) {
        await this.openAboutUsMenu();

        const menuLink = this.getAboutUsMenuLink(expectedLink);
        await this.assertVisible(
          menuLink,
          `${expectedLink.name} should be visible in the About Us menu`,
        );

        await this.reportValue(
          `About Us link: ${expectedLink.name}`,
          this.buildFullUrl(expectedLink.url),
        );

        // noWaitAfter: the link navigates and detaches, so post-click checks would
        // time out against a gone element; waitForURL is the real assertion.
        await menuLink.click({ noWaitAfter: true });
        await this.page.waitForURL((url) => url.pathname === expectedLink.url, { timeout: 30000 });
        await this.waitForPageReady();

        await this.assertPageUrl(
          new RegExp(`${escapeRegex(expectedLink.url)}(?:\\?.*)?$`),
          `${expectedLink.name} should navigate to the configured About URL`,
        );

        await this.assertHeadingVisible(
          undefined,
          `${expectedLink.name} page should expose a visible H1`,
          15_000,
        );

        await this.page.goBack({ waitUntil: 'domcontentloaded' });
        await this.waitForPageReady();
      }
    });
  }

  /** Clicks about us menu link. */
  async clickAboutUsMenuLink(expectedLink: HeaderNavigationLink): Promise<void> {
    await this.step(`Click About Us menu link: ${expectedLink.name}`, async () => {
      const menuLink = this.getAboutUsMenuLink(expectedLink);

      await this.assertAttached(menuLink, `${expectedLink.name} should be visible before clicking`);

      // noWaitAfter: this link navigates, so the element detaches mid-click. Without
      // it, Playwright keeps running its post-click checks against the gone element
      // and times out even though the navigation succeeded (seen on the heavier
      // About pages such as Sustainability). The waitForURL below is the real
      // assertion that the click worked.
      await menuLink.click({ timeout: 10000, noWaitAfter: true });
      await this.page.waitForURL((url) => url.pathname === expectedLink.url, { timeout: 30000 });

      await this.waitForPageReady();
    });
  }

  /** Gets about us menu link. */
  private getAboutUsMenuLink(expectedLink: HeaderNavigationLink): Locator {
    return this.aboutUsMenuLinks
      .filter({ hasText: new RegExp(`^\\s*${escapeRegex(expectedLink.name)}\\s*$`, 'i') })
      .and(this.header.locator(`a[href="${expectedLink.url}"]`))
      .first();
  }

  // Generic Mega-Menu Flyout Validation

  /** Opens a top-level header menu (flyout) by its button label. */
  async openMenu(menuName: string): Promise<void> {
    await this.step(`Open '${menuName}' menu`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      const menuButton = this.header
        .getByRole('button', { name: new RegExp(`^${escapeRegex(menuName)}$`, 'i') })
        .first();

      await menuButton.waitFor({ state: 'visible', timeout: 20000 });
      await menuButton.hover();
      await menuButton.click();
      await this.settle(1000);
    });
  }

  /** Checks that a header flyout menu exposes the expected navigation links. */
  async verifyMenuLinks(
    menuName: string,
    expectedLinks: readonly HeaderNavigationLink[],
  ): Promise<void> {
    await this.step(`Verify '${menuName}' menu links`, async () => {
      await this.openMenu(menuName);

      for (const expected of expectedLinks) {
        const link = this.header.locator(`a[href="${expected.url}"]`).first();

        await this.assertAttached(
          link,
          `${menuName} menu should expose ${expected.name} (${expected.url})`,
          15_000,
        );
        await this.reportValue(
          `${menuName} menu link: ${expected.name}`,
          this.buildFullUrl(expected.url),
        );
      }
    });
  }

  /** Gets the header links pointing at a path that are actually rendered on screen. */
  private visibleHeaderLinks(url: string): Locator {
    return this.header.locator(`a[href="${url}"]:visible`);
  }

  /** Checks that a link is exposed as a visible top-level header item, with no flyout opened. */
  async verifyTopLevelNavLinkVisible(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Verify top-level nav link: ${link.name}`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      await expect
        .poll(() => this.visibleHeaderLinks(link.url).count(), {
          message: `${link.name} should be visible as a top-level header item`,
          timeout: 20000,
        })
        .toBeGreaterThan(0);

      await this.reportValue(
        `Top-level header nav link: ${link.name}`,
        this.buildFullUrl(link.url),
      );
    });
  }

  /**
   * Checks a link is NOT a top-level header item - it lives inside a flyout for
   * this country. Asserted on the closed header, where the flyout's copy of the
   * link is in the DOM but has no box, so ":visible" is what separates the two
   * placements.
   */
  async verifyNoTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Verify ${link.name} is not a top-level nav link`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      await expect
        .poll(() => this.visibleHeaderLinks(link.url).count(), {
          message: `${link.name} should not be surfaced as a top-level header item`,
          timeout: 15000,
        })
        .toBe(0);
    });
  }

  /** Opens a header flyout menu, clicks one of its links and waits for the route. */
  async clickMenuLink(menuName: string, link: HeaderNavigationLink): Promise<void> {
    await this.step(`Click '${menuName}' menu link: ${link.name}`, async () => {
      await this.openMenu(menuName);

      const menuLink = this.header.locator(`a[href="${link.url}"]`).first();

      await this.assertVisible(menuLink, `${link.name} should be visible in the ${menuName} menu`);

      // noWaitAfter: the link navigates and detaches, so Playwright's post-click
      // checks would time out against a gone element; waitForURL is the real
      // assertion that the click worked.
      await menuLink.click({ noWaitAfter: true });
      await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
      await this.waitForPageReady();

      await this.reportValue(`${menuName} menu navigation: ${link.name}`, this.page.url());
    });
  }

  /** Clicks a top-level header navigation link by its href and waits for the route. */
  async clickTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Click top-level nav link: ${link.name}`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      const navLink = this.header.locator(`a[href="${link.url}"]`).first();

      await navLink.waitFor({ state: 'visible', timeout: 20000 });
      await navLink.click();
      await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
      await this.waitForPageReady();
    });
  }

  /** Checks that the chatbot widget / launcher is loaded on the page. */
  async verifyChatbotLoaded(): Promise<void> {
    await this.step('Verify chatbot widget loads', async () => {
      const launcher = this.page
        .locator(
          [
            'iframe[title*="chat" i]',
            'iframe[id*="chat" i]',
            'iframe[src*="atlasrtx" i]',
            'iframe[src*="chatbot" i]',
            'button[aria-label*="chat" i]',
            '[id*="chat" i][class*="launch" i]',
            '[class*="chatbot" i]',
          ].join(', '),
        )
        .first();

      await this.assertAttached(
        launcher,
        'A chatbot launcher / iframe should be present on the page',
        25_000,
      );
      await this.reportValue('Chatbot widget detected');
    });
  }
}
