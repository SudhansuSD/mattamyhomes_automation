import { Page, Locator, expect } from '@playwright/test';
import {
  escapeRegex,
  MOBILE_NAV_CLOSE_SELECTOR,
  MOBILE_NAV_TOGGLE_SELECTOR,
} from '../utils/web/pageObjectUtils';
import { BasePage } from './BasePage';

export type HeaderNavigationLink = {
  name: string;
  url: string;
};

export class Header extends BasePage {
  readonly header: Locator;
  readonly mobileNavToggle: Locator;
  readonly mobileNavCloseButton: Locator;
  /** The header plus the mobile nav panel, which mounts as a separate dialog outside `<header>`. */
  readonly navigationScope: Locator;
  readonly findYourHomeLink: Locator;
  readonly aboutUsLink: Locator;
  readonly contactUsLink: Locator;
  readonly favoritesLink: Locator;
  readonly aboutUsMenuLinks: Locator;
  private promoPopupHandlerRegistered = false;
  private nationalPromotionDismissed = false;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header');
    this.mobileNavToggle = page.locator(MOBILE_NAV_TOGGLE_SELECTOR);
    this.mobileNavCloseButton = page.locator(MOBILE_NAV_CLOSE_SELECTOR);
    this.navigationScope = page.locator(
      `header, [role="dialog"]:has(${MOBILE_NAV_CLOSE_SELECTOR})`,
    );
    // By role, not id: only the desktop copy has an id; the accessible name is shared.
    this.findYourHomeLink = this.visibleNavigationItem(
      this.navigationScope.getByRole('button', { name: /^Find Your Dream Home$/i }),
    );
    this.aboutUsLink = this.visibleNavigationItem(
      this.navigationScope.getByRole('button', { name: /^About$/i }),
    );
    // Desktop uses an id; the mobile panel uses a plain /contact anchor.
    this.contactUsLink = this.visibleNavigationItem(
      this.navigationScope.locator('[id="Contact Us"], a[href="/contact"]'),
    );
    // Desktop uses a heart button with no href; the mobile panel uses a /favorites anchor.
    this.favoritesLink = this.visibleNavigationItem(
      this.navigationScope.locator('#goToFavoritesButton, a[href="/favorites"]'),
    );
    // Desktop flyout entries, plus mobile anchors under the expanded About section only
    // (the panel also holds top-level About pages, e.g. Sustainability on CAN).
    this.aboutUsMenuLinks = this.navigationScope.locator(
      [
        'a[role="button"][href^="/about"]',
        'button[aria-expanded="true"]:has(:text-is("About")) + div a[href^="/about"]',
      ].join(', '),
    );
  }

  /** Narrows a nav locator to the on-screen copy, since desktop and mobile nav are both in the DOM. */
  private visibleNavigationItem(locator: Locator): Locator {
    return locator.filter({ visible: true }).first();
  }

  // Mobile Navigation Panel

  /** Opens the mobile navigation panel unless it is already open. */
  async openMobileNavIfClosed(): Promise<void> {
    await this.step('Open mobile navigation panel', async () => {
      if (await this.mobileNavCloseButton.isVisible().catch(() => false)) {
        return;
      }

      // The consent dialog and promo overlay cover the toggle on phones.
      await this.acceptCookiesIfPresent();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });

      // Checked first so an unpainted page is reported as such, not as a broken menu button.
      expect(
        await this.waitForAppPainted(),
        'Page has not painted, so the mobile navigation toggle cannot be tapped - the site keeps <body> hidden until window.onload fires',
      ).toBe(true);

      // The phone header slides off-screen on scroll; scroll to top and wait for it to slide back in.
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await expect
        .poll(
          async () => {
            const box = await this.mobileNavToggle.boundingBox();
            const viewport = this.page.viewportSize();

            return !!box && !!viewport && box.y >= 0 && box.y + box.height <= viewport.height;
          },
          {
            message: 'Mobile navigation toggle should be inside the viewport before it is tapped',
            timeout: 10000,
          },
        )
        .toBe(true);

      await this.mobileNavToggle.click();

      await expect(
        this.mobileNavCloseButton,
        'Mobile navigation panel should open when the menu button is tapped',
      ).toBeVisible({ timeout: 15000 });
    });
  }

  /** Opens the mobile nav panel first when the run is at a phone width. */
  private async revealNavigationForViewport(): Promise<void> {
    if (await this.isMobileHeaderViewport()) {
      await this.openMobileNavIfClosed();
    }
  }

  // Header Visibility Validation

  /** Checks that the header links are visible. */
  async verifyHeaderLinksVisible(): Promise<void> {
    await this.step('Verify header links visible', async () => {
      await this.header.first().waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      await expect(
        this.header.first(),
        'Header should be visible, not rendered with visibility:hidden',
      ).toBeVisible({ timeout: 20000 });

      // On mobile, open the panel and validate the same items.
      if (await this.isMobileHeaderViewport()) {
        await expect(
          this.mobileNavToggle,
          'Mobile header should expose its navigation menu button',
        ).toBeVisible({ timeout: 20000 });

        await this.openMobileNavIfClosed();

        await this.assertVisible(
          this.findYourHomeLink,
          'Find Your Dream Home should be visible in the mobile navigation panel',
        );
        await this.assertVisible(
          this.aboutUsLink,
          'About should be visible in the mobile navigation panel',
        );
        await this.assertVisible(
          this.contactUsLink,
          'Contact Us should be visible in the mobile navigation panel',
        );

        return;
      }

      // Desktop nav only exists once the mobile SSR shell hydrates; check that first for a clear failure.
      await expect(
        this.mobileNavToggle,
        'Header should replace its mobile shell with the desktop navigation',
      ).toBeHidden({ timeout: 20000 });

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

  /** Clicks the Find Your Dream Home link in the header. */
  async clickFindYourHome(): Promise<void> {
    await this.step('Click Find Your Dream Home', async () => {
      await this.revealNavigationForViewport();
      await this.clickElement(this.findYourHomeLink);
    });
  }

  /** Clicks the About link in the header. */
  async clickAboutUs(): Promise<void> {
    await this.step('Click About', async () => {
      await this.revealNavigationForViewport();
      await this.clickElement(this.aboutUsLink);
    });
  }

  /** Clicks the Contact Us link in the header. */
  async clickContactUs(): Promise<void> {
    await this.step('Click Contact Us', async () => {
      await this.revealNavigationForViewport();

      await this.acceptCookiesIfPresent();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.assertVisible(
        this.contactUsLink,
        'Contact Us header link should be visible',
        20000,
      );

      const previousTitle = await this.page.title().catch(() => '');
      let lastClickError: unknown;

      for (let attempt = 1; attempt <= 2; attempt++) {
        const clicked = await this.contactUsLink
          .click({ timeout: 10000, noWaitAfter: true })
          .then(() => true)
          .catch(async (error: unknown) => {
            lastClickError = error;
            await this.dismissPromoPopupIfPresent({ appearTimeout: 1000 });
            return false;
          });

        if (!clicked) {
          continue;
        }

        await this.page.waitForURL((url) => url.pathname.replace(/\/$/, '') === '/contact', {
          timeout: 30000,
        });
        await this.waitForRouteContent(previousTitle);
        await this.waitForPageReady();
        return;
      }

      throw lastClickError ?? new Error('Unable to click Contact Us header link');
    });
  }

  /** Opens the About Us flyout and waits for its links to finish rendering. */
  async openAboutUsMenu(expectedLinkCount?: number): Promise<void> {
    await this.step('Open About Us menu', async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      await this.revealNavigationForViewport();

      await this.aboutUsLink.waitFor({ state: 'visible', timeout: 20000 });
      await this.aboutUsLink.hover();

      // On mobile the trigger toggles, so clicking an expanded one would collapse it.
      if ((await this.aboutUsLink.getAttribute('aria-expanded')) !== 'true') {
        await this.aboutUsLink.click();
      }
      await this.assertAttached(
        this.navigationScope.locator('a[href="/about/about-mattamy"]'),
        'About Us menu should open',
      );

      // Links render in asynchronously; wait for all of them so callers do not read a partial list.
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

  /** Returns the national promotion popup dialog. */
  private get nationalPromotionDialog(): Locator {
    return this.page
      .locator('.ReactModal__Content[role="dialog"][aria-label="National promotion"]')
      .first();
  }

  /** Closes the national promotion popup, falling back to Escape if it has no close button. */
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

  /** Registers a one-time handler so the promo popup is closed whenever it appears. */
  private async registerNationalPromotionHandler(): Promise<void> {
    if (this.promoPopupHandlerRegistered) {
      return;
    }

    await this.page.addLocatorHandler(this.nationalPromotionDialog, async (dialog) =>
      this.closeNationalPromotionDialog(dialog),
    );
    this.promoPopupHandlerRegistered = true;
  }

  /** Checks the Find Your Dream Home flyout lists the links this country expects. */
  async verifyFindYourHomeLinks(): Promise<void> {
    await this.step('Verify Find Your Dream Home links', async () => {
      await this.registerNationalPromotionHandler();
      await this.revealNavigationForViewport();
      await this.clickFindYourHome();

      const fyhLinkButtons = this.navigationScope.locator(
        'button[href^="/search"], a[href^="/search"]',
      );
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

        // The campaign modal appears shortly after load; wait up to 5s for it, without failing.
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

  /** Opens the About Us flyout and returns its links, one per unique href. */
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

  /** Checks the About Us flyout lists exactly the configured links, in any order. */
  async verifyAboutUsMenuLinks(expectedLinks: readonly HeaderNavigationLink[]): Promise<void> {
    await this.step('Verify About Us menu links', async () => {
      const actualLinks = await this.getVisibleAboutUsMenuLinks(expectedLinks.length);

      // Compared sorted, since the flyout order can differ from the config.
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

  /** Walks every About Us link, confirming each one opens its page and comes back. */
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

        // noWaitAfter: the link detaches as it navigates; waitForURL is the real check.
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

  /** Clicks one About Us flyout link and waits for its page to load. */
  async clickAboutUsMenuLink(expectedLink: HeaderNavigationLink): Promise<void> {
    await this.step(`Click About Us menu link: ${expectedLink.name}`, async () => {
      const menuLink = this.getAboutUsMenuLink(expectedLink);

      await this.assertAttached(menuLink, `${expectedLink.name} should be visible before clicking`);

      const previousTitle = await this.page.title().catch(() => '');

      // noWaitAfter: the link detaches as it navigates; waitForURL is the real check.
      await menuLink.click({ timeout: 10000, noWaitAfter: true });
      await this.page.waitForURL((url) => url.pathname === expectedLink.url, { timeout: 30000 });

      // The URL changes before the new page renders, so wait for the content too.
      await this.waitForRouteContent(previousTitle);

      await this.waitForPageReady();
    });
  }

  /** Returns the About Us flyout link with this name and href. */
  private getAboutUsMenuLink(expectedLink: HeaderNavigationLink): Locator {
    return this.aboutUsMenuLinks
      .filter({ hasText: new RegExp(`^\\s*${escapeRegex(expectedLink.name)}\\s*$`, 'i') })
      .and(this.navigationScope.locator(`a[href="${expectedLink.url}"]`))
      .first();
  }

  // Generic Mega-Menu Flyout Validation

  /** Opens a top-level header menu by its button label (a section of the nav panel on mobile). */
  async openMenu(menuName: string): Promise<void> {
    await this.step(`Open '${menuName}' menu`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.revealNavigationForViewport();

      const menuButton = this.visibleNavigationItem(
        this.navigationScope.getByRole('button', {
          name: new RegExp(`^${escapeRegex(menuName)}$`, 'i'),
        }),
      );

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
        const link = this.navigationScope.locator(`a[href="${expected.url}"]`).first();

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

  /** Gets the navigation links pointing at a path that are actually rendered on screen. */
  private visibleHeaderLinks(url: string): Locator {
    return this.navigationScope.locator(`a[href="${url}"]:visible`);
  }

  /** Checks that a link is exposed as a visible top-level header item, with no flyout opened. */
  async verifyTopLevelNavLinkVisible(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Verify top-level nav link: ${link.name}`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.revealNavigationForViewport();

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

  /** Checks a link is not visible as a top-level header item while no flyout is open. */
  async verifyNoTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Verify ${link.name} is not a top-level nav link`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.revealNavigationForViewport();

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

      const menuLink = this.visibleNavigationItem(
        this.navigationScope.locator(`a[href="${link.url}"]`),
      );

      await this.assertVisible(menuLink, `${link.name} should be visible in the ${menuName} menu`);

      const previousTitle = await this.page.title().catch(() => '');

      await this.neutralizeChatWidget();

      // noWaitAfter: the link detaches as it navigates; waitForURL is the real check.
      await menuLink.click({ noWaitAfter: true });
      await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
      await this.waitForRouteContent(previousTitle);
      await this.waitForPageReady();

      await this.reportValue(`${menuName} menu navigation: ${link.name}`, this.page.url());
    });
  }

  /** Clicks a top-level header navigation link by its href and waits for the route. */
  async clickTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Click top-level nav link: ${link.name}`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.revealNavigationForViewport();

      const navLink = this.visibleNavigationItem(
        this.navigationScope.locator(`a[href="${link.url}"]`),
      );

      await navLink.waitFor({ state: 'visible', timeout: 20000 });

      const previousTitle = await this.page.title().catch(() => '');

      await this.neutralizeChatWidget();
      await navLink.click();
      await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
      await this.waitForRouteContent(previousTitle);
      await this.waitForPageReady();
    });
  }

  /** Checks the header exposes the Go to Favorites link. */
  async verifyFavoritesLinkVisible(): Promise<void> {
    await this.step('Verify header Go to Favorites link', async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.revealNavigationForViewport();
      await this.assertVisible(
        this.favoritesLink,
        'Header should expose the Go to Favorites link',
        20000,
      );
    });
  }

  /** Clicks the header Go to Favorites link and waits for the Favorites route. */
  async clickFavorites(): Promise<void> {
    await this.step('Click header Go to Favorites link', async () => {
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.revealNavigationForViewport();

      const previousTitle = await this.page.title().catch(() => '');

      // Hover first: the heart icon swaps on hover, and a click during the swap never fires.
      if (!(await this.isMobileHeaderViewport())) {
        await this.favoritesLink.hover();
        await expect(
          this.favoritesLink.locator('svg[class*="HeartFilled"]'),
          'Hovering the Go to Favorites button should show the filled heart icon',
        ).toBeVisible({ timeout: 5000 });
      }

      await this.neutralizeChatWidget();
      await this.favoritesLink.click({ noWaitAfter: true });
      await expect
        .poll(() => new URL(this.page.url()).pathname.replace(/\/$/, ''), {
          message: 'Header Go to Favorites link should navigate to /favorites when clicked',
          timeout: 30000,
        })
        .toBe('/favorites');
      await this.waitForRouteContent(previousTitle);
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
