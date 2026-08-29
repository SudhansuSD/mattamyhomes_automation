# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: headerNavigation.spec.ts >> Header Navigation - CAN >> @chrome-only @smoke @regression | CAN | Resources mega-menu should expose expected links
- Location: tests/headerNavigation.spec.ts:64:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
Call log:
  - waiting for locator('header').getByRole('button', { name: /^Resources$/i }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Mattamy logo. Go to HomePage" [ref=e6] [cursor=pointer]:
        - /url: /
        - figure [ref=e7]:
          - img "Mattamy logo" [ref=e8]
      - button "Navigation menu." [ref=e9] [cursor=pointer]:
        - img [ref=e10]
  - main [ref=e12]:
    - generic [ref=e13]:
      - generic:
        - heading "Home. Where moments matter most." [level=1]
        - generic: Find your new home and make memories that matter.
        - textbox "Search by City, Community, Plan, or QMI name" [ref=e19]
        - link "Navigate to more information on this page." [ref=e20] [cursor=pointer]:
          - img [ref=e21]
    - generic [ref=e26]:
      - img "Large white kitchen with vertical white cabinets, a large white island and round, grey bar stools." [ref=e32]
      - generic [ref=e36]:
        - heading "Designed with you in mind" [level=2] [ref=e37]
        - generic [ref=e38]: Our committed focus on how people really live informs each step of every home we build. From our modern, timeless and charming architecture to the spacious, bright and inviting floorplans and the communities with green space and wellness opportunities, your satisfaction is our priority. Our dedicated team of professionals is ready to build the new home of your dreams, where you can make lasting memories.
        - link "Get to know us" [ref=e40] [cursor=pointer]:
          - /url: /about/about-mattamy
          - generic [ref=e41]: Get to know us
    - generic [ref=e42]:
      - generic [ref=e43]:
        - heading "Explore our locations near you" [level=2] [ref=e44]
        - generic [ref=e45]: We build homes in hundreds of communities across North America. Explore our locations and find the home and area that best fit your lifestyle.
      - generic:
        - button "Previous story panel.":
          - img
        - button "Next story panel.":
          - img
```

# Test source

```ts
  271 |         await this.assertAttached(
  272 |           menuLink,
  273 |           `${expectedLink.name} should be present in the About Us menu`,
  274 |         );
  275 |         await this.assertAttribute(
  276 |           menuLink,
  277 |           'href',
  278 |           expectedLink.url,
  279 |           `${expectedLink.name} should point to ${expectedLink.url}`,
  280 |         );
  281 | 
  282 |         await this.reportValue(
  283 |           `About Us menu link: ${expectedLink.name}`,
  284 |           this.buildFullUrl(expectedLink.url),
  285 |         );
  286 |       }
  287 |     });
  288 |   }
  289 | 
  290 |   /** Walks every About Us link, confirming each one opens its page and comes back. */
  291 |   async verifyAboutUsLinks(expectedLinks: readonly HeaderNavigationLink[]): Promise<void> {
  292 |     await this.step('Verify About Us links navigation', async () => {
  293 |       await this.verifyAboutUsMenuLinks(expectedLinks);
  294 | 
  295 |       for (const expectedLink of expectedLinks) {
  296 |         await this.openAboutUsMenu();
  297 | 
  298 |         const menuLink = this.getAboutUsMenuLink(expectedLink);
  299 |         await this.assertVisible(
  300 |           menuLink,
  301 |           `${expectedLink.name} should be visible in the About Us menu`,
  302 |         );
  303 | 
  304 |         await this.reportValue(
  305 |           `About Us link: ${expectedLink.name}`,
  306 |           this.buildFullUrl(expectedLink.url),
  307 |         );
  308 | 
  309 |         // noWaitAfter: the link navigates and detaches, so post-click checks would
  310 |         // time out against a gone element; waitForURL is the real assertion.
  311 |         await menuLink.click({ noWaitAfter: true });
  312 |         await this.page.waitForURL((url) => url.pathname === expectedLink.url, { timeout: 30000 });
  313 |         await this.waitForPageReady();
  314 | 
  315 |         await this.assertPageUrl(
  316 |           new RegExp(`${escapeRegex(expectedLink.url)}(?:\\?.*)?$`),
  317 |           `${expectedLink.name} should navigate to the configured About URL`,
  318 |         );
  319 | 
  320 |         await this.assertHeadingVisible(
  321 |           undefined,
  322 |           `${expectedLink.name} page should expose a visible H1`,
  323 |           15_000,
  324 |         );
  325 | 
  326 |         await this.page.goBack({ waitUntil: 'domcontentloaded' });
  327 |         await this.waitForPageReady();
  328 |       }
  329 |     });
  330 |   }
  331 | 
  332 |   /** Clicks one About Us flyout link and waits for its page to load. */
  333 |   async clickAboutUsMenuLink(expectedLink: HeaderNavigationLink): Promise<void> {
  334 |     await this.step(`Click About Us menu link: ${expectedLink.name}`, async () => {
  335 |       const menuLink = this.getAboutUsMenuLink(expectedLink);
  336 | 
  337 |       await this.assertAttached(menuLink, `${expectedLink.name} should be visible before clicking`);
  338 | 
  339 |       // noWaitAfter: this link navigates, so the element detaches mid-click. Without
  340 |       // it, Playwright keeps running its post-click checks against the gone element
  341 |       // and times out even though the navigation succeeded (seen on the heavier
  342 |       // About pages such as Sustainability). The waitForURL below is the real
  343 |       // assertion that the click worked.
  344 |       await menuLink.click({ timeout: 10000, noWaitAfter: true });
  345 |       await this.page.waitForURL((url) => url.pathname === expectedLink.url, { timeout: 30000 });
  346 | 
  347 |       await this.waitForPageReady();
  348 |     });
  349 |   }
  350 | 
  351 |   /** Returns the About Us flyout link with this name and href. */
  352 |   private getAboutUsMenuLink(expectedLink: HeaderNavigationLink): Locator {
  353 |     return this.aboutUsMenuLinks
  354 |       .filter({ hasText: new RegExp(`^\\s*${escapeRegex(expectedLink.name)}\\s*$`, 'i') })
  355 |       .and(this.header.locator(`a[href="${expectedLink.url}"]`))
  356 |       .first();
  357 |   }
  358 | 
  359 |   // Generic Mega-Menu Flyout Validation
  360 | 
  361 |   /** Opens a top-level header menu (flyout) by its button label. */
  362 |   async openMenu(menuName: string): Promise<void> {
  363 |     await this.step(`Open '${menuName}' menu`, async () => {
  364 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  365 |       await this.page.evaluate(() => window.scrollTo(0, 0));
  366 | 
  367 |       const menuButton = this.header
  368 |         .getByRole('button', { name: new RegExp(`^${escapeRegex(menuName)}$`, 'i') })
  369 |         .first();
  370 | 
> 371 |       await menuButton.waitFor({ state: 'visible', timeout: 20000 });
      |                        ^ TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
  372 |       await menuButton.hover();
  373 |       await menuButton.click();
  374 |       await this.settle(1000);
  375 |     });
  376 |   }
  377 | 
  378 |   /** Checks that a header flyout menu exposes the expected navigation links. */
  379 |   async verifyMenuLinks(
  380 |     menuName: string,
  381 |     expectedLinks: readonly HeaderNavigationLink[],
  382 |   ): Promise<void> {
  383 |     await this.step(`Verify '${menuName}' menu links`, async () => {
  384 |       await this.openMenu(menuName);
  385 | 
  386 |       for (const expected of expectedLinks) {
  387 |         const link = this.header.locator(`a[href="${expected.url}"]`).first();
  388 | 
  389 |         await this.assertAttached(
  390 |           link,
  391 |           `${menuName} menu should expose ${expected.name} (${expected.url})`,
  392 |           15_000,
  393 |         );
  394 |         await this.reportValue(
  395 |           `${menuName} menu link: ${expected.name}`,
  396 |           this.buildFullUrl(expected.url),
  397 |         );
  398 |       }
  399 |     });
  400 |   }
  401 | 
  402 |   /** Gets the header links pointing at a path that are actually rendered on screen. */
  403 |   private visibleHeaderLinks(url: string): Locator {
  404 |     return this.header.locator(`a[href="${url}"]:visible`);
  405 |   }
  406 | 
  407 |   /** Checks that a link is exposed as a visible top-level header item, with no flyout opened. */
  408 |   async verifyTopLevelNavLinkVisible(link: HeaderNavigationLink): Promise<void> {
  409 |     await this.step(`Verify top-level nav link: ${link.name}`, async () => {
  410 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  411 |       await this.page.evaluate(() => window.scrollTo(0, 0));
  412 | 
  413 |       await expect
  414 |         .poll(() => this.visibleHeaderLinks(link.url).count(), {
  415 |           message: `${link.name} should be visible as a top-level header item`,
  416 |           timeout: 20000,
  417 |         })
  418 |         .toBeGreaterThan(0);
  419 | 
  420 |       await this.reportValue(
  421 |         `Top-level header nav link: ${link.name}`,
  422 |         this.buildFullUrl(link.url),
  423 |       );
  424 |     });
  425 |   }
  426 | 
  427 |   /**
  428 |    * Checks a link is NOT a top-level header item - it lives inside a flyout for
  429 |    * this country. Asserted on the closed header, where the flyout's copy of the
  430 |    * link is in the DOM but has no box, so ":visible" is what separates the two
  431 |    * placements.
  432 |    */
  433 |   async verifyNoTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
  434 |     await this.step(`Verify ${link.name} is not a top-level nav link`, async () => {
  435 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  436 |       await this.page.evaluate(() => window.scrollTo(0, 0));
  437 | 
  438 |       await expect
  439 |         .poll(() => this.visibleHeaderLinks(link.url).count(), {
  440 |           message: `${link.name} should not be surfaced as a top-level header item`,
  441 |           timeout: 15000,
  442 |         })
  443 |         .toBe(0);
  444 |     });
  445 |   }
  446 | 
  447 |   /** Opens a header flyout menu, clicks one of its links and waits for the route. */
  448 |   async clickMenuLink(menuName: string, link: HeaderNavigationLink): Promise<void> {
  449 |     await this.step(`Click '${menuName}' menu link: ${link.name}`, async () => {
  450 |       await this.openMenu(menuName);
  451 | 
  452 |       const menuLink = this.header.locator(`a[href="${link.url}"]`).first();
  453 | 
  454 |       await this.assertVisible(menuLink, `${link.name} should be visible in the ${menuName} menu`);
  455 | 
  456 |       // noWaitAfter: the link navigates and detaches, so Playwright's post-click
  457 |       // checks would time out against a gone element; waitForURL is the real
  458 |       // assertion that the click worked.
  459 |       await menuLink.click({ noWaitAfter: true });
  460 |       await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
  461 |       await this.waitForPageReady();
  462 | 
  463 |       await this.reportValue(`${menuName} menu navigation: ${link.name}`, this.page.url());
  464 |     });
  465 |   }
  466 | 
  467 |   /** Clicks a top-level header navigation link by its href and waits for the route. */
  468 |   async clickTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
  469 |     await this.step(`Click top-level nav link: ${link.name}`, async () => {
  470 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  471 |       await this.page.evaluate(() => window.scrollTo(0, 0));
```