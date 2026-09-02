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
  /**
   * The header together with the mobile navigation panel it opens.
   *
   * At phone widths the panel is not part of `<header>` at all: it mounts as a
   * sibling dialog under `#root`, so a header-scoped locator resolves to none of
   * the navigation it holds and every mobile nav item reads as absent. Scoping
   * navigation lookups to the union gives each item one locator that works in
   * both layouts, and stays exact on desktop because the dialog only exists
   * while the panel is open.
   */
  readonly navigationScope: Locator;
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
    this.mobileNavToggle = page.locator(MOBILE_NAV_TOGGLE_SELECTOR);
    this.mobileNavCloseButton = page.locator(MOBILE_NAV_CLOSE_SELECTOR);
    this.navigationScope = page.locator(
      `header, [role="dialog"]:has(${MOBILE_NAV_CLOSE_SELECTOR})`,
    );
    // By role, not by id: the desktop header gives this control
    // `id="Find Your Dream Home"`, while the same control inside the opened
    // mobile navigation panel carries no id at all. The accessible name is the
    // one thing both layouts share, so one locator serves both.
    this.findYourHomeLink = this.visibleNavigationItem(
      this.navigationScope.getByRole('button', { name: /^Find Your Dream Home$/i }),
    );
    this.aboutUsLink = this.visibleNavigationItem(
      this.navigationScope.getByRole('button', { name: /^About$/i }),
    );
    // Two spellings for one item: the desktop header labels it `id="Contact Us"`,
    // the mobile panel renders a plain `/contact` anchor with no id.
    this.contactUsLink = this.visibleNavigationItem(
      this.navigationScope.locator('[id="Contact Us"], a[href="/contact"]'),
    );
    // Two layouts, one locator. The desktop flyout marks each entry as
    // `a[role="button"]`; the phone panel renders plain anchors inside the
    // collapsible section that follows the About trigger. The mobile half is
    // scoped through that trigger rather than to the panel as a whole, because
    // the panel also carries About pages the country promotes to top-level nav
    // items - Sustainability on CAN - which do not belong to the flyout.
    this.aboutUsMenuLinks = this.navigationScope.locator(
      [
        'a[role="button"][href^="/about"]',
        'button[aria-expanded="true"]:has(:text-is("About")) + div a[href^="/about"]',
      ].join(', '),
    );
  }

  /**
   * Narrows a navigation locator to the copy that is actually on screen.
   *
   * Both layouts ship in the DOM at once - the desktop nav stays mounted behind
   * the phone header, and the panel keeps its items after it closes - so a
   * navigation item routinely resolves to more than one node and only one of
   * them belongs to the layout under test.
   */
  private visibleNavigationItem(locator: Locator): Locator {
    return locator.filter({ visible: true }).first();
  }

  // Mobile Navigation Panel

  /**
   * Opens the mobile navigation panel, and does nothing when it is already open.
   *
   * The phone header collapses every nav item behind this toggle, so mobile runs
   * have to open it before any nav item exists to assert on.
   *
   * Deliberately narrow: the toggle's own id plus a real click, so a toggle that
   * has moved or is covered fails here. Matching a set of speculative selectors
   * instead risks opening some other control and reporting success.
   */
  async openMobileNavIfClosed(): Promise<void> {
    await this.step('Open mobile navigation panel', async () => {
      if (await this.mobileNavCloseButton.isVisible().catch(() => false)) {
        return;
      }

      // The consent dialog and promo overlay both sit on top of the toggle at
      // phone widths, where there is far less room around it than on desktop.
      await this.acceptCookiesIfPresent();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });

      // Asserted before the click, so a page still behind its flicker guard says
      // that instead of reporting a toggle that is "not visible, enabled and
      // stable" - which reads as a broken menu button rather than as a document
      // that never finished loading.
      expect(
        await this.waitForAppPainted(),
        'Page has not painted, so the mobile navigation toggle cannot be tapped - the site keeps <body> hidden until window.onload fires',
      ).toBe(true);

      // The phone header slides out of view as the page scrolls, which leaves the
      // toggle visible, enabled and stable while sitting outside the viewport -
      // Playwright then retries the click for its full timeout and reports a
      // broken menu button. Scrolling back to the top brings the header in, and
      // the poll waits for its slide-in to actually land.
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
      // Attached here, visible below: the two branches each assert visibility
      // with a message naming their own layout, which a single visibility gate
      // at this point cannot do.
      await this.header.first().waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      await expect(
        this.header.first(),
        'Header should be visible, not rendered with visibility:hidden',
      ).toBeVisible({ timeout: 20000 });

      // On the mobile-web device profiles every nav item is collapsed behind the
      // menu button, so the panel is opened and the SAME items are validated
      // rather than the check being weakened to "a hamburger exists".
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

      // The desktop navigation does not exist until the header shell hydrates:
      // the SSR HTML ships a mobile-only header, and the swap happens client
      // side. Asserted first so a page that never hydrated says so, instead of
      // reporting "[id=Find Your Dream Home] not attached" and pointing at a
      // locator that is perfectly correct.
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
      await this.clickElement(this.contactUsLink);
    });
  }

  /** Opens the About Us flyout and waits for its links to finish rendering. */
  async openAboutUsMenu(expectedLinkCount?: number): Promise<void> {
    await this.step('Open About Us menu', async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));

      // The phone header carries the same links as the web header, but behind
      // the hamburger: without opening it first the About Us trigger is not in
      // the layout at all.
      await this.revealNavigationForViewport();

      await this.aboutUsLink.waitFor({ state: 'visible', timeout: 20000 });
      await this.aboutUsLink.hover();

      // The phone panel's trigger is a toggle, so clicking one that is already
      // expanded collapses the very section the caller is about to read. The
      // desktop trigger carries no aria-expanded and still gets its click.
      if ((await this.aboutUsLink.getAttribute('aria-expanded')) !== 'true') {
        await this.aboutUsLink.click();
      }
      // navigationScope, not the header: at phone widths the panel that holds
      // these links mounts as a sibling dialog, so a header-scoped locator finds
      // none of them.
      await this.assertAttached(
        this.navigationScope.locator('a[href="/about/about-mattamy"]'),
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
      // On mobile the control lives inside the collapsed panel, so it has to be
      // opened before the flyout can be triggered at all.
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

  /** Clicks one About Us flyout link and waits for its page to load. */
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

  /** Returns the About Us flyout link with this name and href. */
  private getAboutUsMenuLink(expectedLink: HeaderNavigationLink): Locator {
    return this.aboutUsMenuLinks
      .filter({ hasText: new RegExp(`^\\s*${escapeRegex(expectedLink.name)}\\s*$`, 'i') })
      .and(this.navigationScope.locator(`a[href="${expectedLink.url}"]`))
      .first();
  }

  // Generic Mega-Menu Flyout Validation

  /** Opens a top-level header menu (flyout) by its button label. */
  async openMenu(menuName: string): Promise<void> {
    await this.step(`Open '${menuName}' menu`, async () => {
      await this.header.waitFor({ state: 'attached', timeout: 20000 });
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.revealNavigationForViewport();

      const menuButton = this.navigationScope
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

  /**
   * Checks a link is NOT a top-level header item - it lives inside a flyout for
   * this country. Asserted with no flyout opened, where the flyout's copy of the
   * link is in the DOM but has no box, so ":visible" is what separates the two
   * placements. On a phone the navigation panel itself is what has to be open
   * for either placement to have a box at all, which is not the same as opening
   * the flyout inside it.
   */
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

      const menuLink = this.navigationScope.locator(`a[href="${link.url}"]`).first();

      await this.assertVisible(menuLink, `${link.name} should be visible in the ${menuName} menu`);

      const previousTitle = await this.page.title().catch(() => '');

      // noWaitAfter: the link navigates and detaches, so Playwright's post-click
      // checks would time out against a gone element; waitForURL is the real
      // assertion that the click worked.
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

      await navLink.click();
      await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
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
