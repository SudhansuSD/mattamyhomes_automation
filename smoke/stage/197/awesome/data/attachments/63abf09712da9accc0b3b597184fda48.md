# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: designStudioPage.spec.ts >> Design Studio Page - USA >> @smoke @regression | USA | Design Studio page should load with valid shell and content from the top-level header link
- Location: tests/designStudioPage.spec.ts:85:9

# Error details

```
Error: Design Studio should be visible as a top-level header item

expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 20000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e7]:
    - generic [ref=e10]:
      - img [ref=e13]
      - paragraph [ref=e15]:
        - text: Save with an FHA Low Rate
        - link "Going On Now!" [ref=e16]:
          - /url: /promos/dec-2024
  - generic [ref=e18]:
    - banner [ref=e19]:
      - generic [ref=e20]:
        - link "Mattamy logo. Go to HomePage" [ref=e21]:
          - /url: /
          - figure [ref=e22]:
            - img "Mattamy logo" [ref=e23]
        - button "Navigation menu." [ref=e24] [cursor=pointer]:
          - img [ref=e25]
    - main [ref=e27]:
      - generic [ref=e28]:
        - generic:
          - heading "Home. Where moments matter most." [level=1]
          - textbox "Search by City, Community, Plan, or QMI name" [ref=e33]
          - link "Navigate to more information on this page." [ref=e34] [cursor=pointer]:
            - img [ref=e35]
      - generic [ref=e40]:
        - img "Large white kitchen with vertical white cabinets, a large white island and round, grey bar stools." [ref=e46]
        - generic [ref=e50]:
          - heading "Designed with you in mind" [level=2] [ref=e51]
          - generic [ref=e52]: Our committed focus on how people really live informs each step of every home we build. From our modern, timeless and charming architecture to the spacious, bright and inviting floorplans and the communities with green space and wellness opportunities, your satisfaction is our priority. Our dedicated team of professionals is ready to build the new home of your dreams, where you can make lasting memories.
          - link "Get to know us" [ref=e54] [cursor=pointer]:
            - /url: /about/about-mattamy
            - generic [ref=e55]: Get to know us
      - generic [ref=e56]:
        - generic [ref=e57]:
          - heading "Explore our locations near you" [level=2] [ref=e58]
          - generic [ref=e59]: We build homes in hundreds of communities across North America. Explore our locations and find the home and area that best fit your lifestyle.
        - generic [ref=e60]:
          - generic [ref=e63]:
            - generic [ref=e69]:
              - img [ref=e72]
              - generic [ref=e74]:
                - paragraph [ref=e75]: North Carolina
                - heading [level=2] [ref=e76]: Charlotte
              - link [ref=e78]:
                - /url: /north-carolina/charlotte
                - generic [ref=e79]:
                  - paragraph [ref=e80]: North Carolina
                  - heading [level=2] [ref=e81]: Charlotte
                - generic [ref=e83]: Find my home
            - generic [ref=e89]:
              - img [ref=e92]
              - generic [ref=e94]:
                - paragraph [ref=e95]: South Carolina
                - heading [level=2] [ref=e96]: Clover
              - link [ref=e98]:
                - /url: /south-carolina/clover
                - generic [ref=e99]:
                  - paragraph [ref=e100]: South Carolina
                  - heading [level=2] [ref=e101]: Clover
                - generic [ref=e103]: Find my home
            - generic [ref=e109]:
              - img [ref=e112]
              - generic [ref=e114]:
                - paragraph [ref=e115]: Texas
                - heading [level=2] [ref=e116]: Dallas-Fort Worth
              - link [ref=e118]:
                - /url: /texas/dallas-fort-worth
                - generic [ref=e119]:
                  - paragraph [ref=e120]: Texas
                  - heading [level=2] [ref=e121]: Dallas-Fort Worth
                - generic [ref=e123]: Find my home
            - generic [ref=e129]:
              - generic [ref=e133]:
                - paragraph [ref=e134]: Florida
                - heading [level=2] [ref=e135]: Fort Lauderdale
              - link [ref=e137]:
                - /url: /florida/fort-lauderdale
                - generic [ref=e138]:
                  - paragraph [ref=e139]: Florida
                  - heading [level=2] [ref=e140]: Fort Lauderdale
                - generic [ref=e142]: Find my home
            - generic [ref=e148]:
              - img [ref=e151]
              - generic [ref=e153]:
                - paragraph [ref=e154]: Florida
                - heading [level=2] [ref=e155]: Jacksonville-St. Augustine
              - link [ref=e157]:
                - /url: /florida/jacksonville-st-augustine
                - generic [ref=e158]:
                  - paragraph [ref=e159]: Florida
                  - heading [level=2] [ref=e160]: Jacksonville-St. Augustine
                - generic [ref=e162]: Find my home
            - generic [ref=e168]:
              - img [ref=e171]
              - generic [ref=e173]:
                - paragraph [ref=e174]: Florida
                - heading [level=2] [ref=e175]: Naples-Fort Myers
              - link [ref=e177]:
                - /url: /florida/naples-fort-myers
                - generic [ref=e178]:
                  - paragraph [ref=e179]: Florida
                  - heading [level=2] [ref=e180]: Naples-Fort Myers
                - generic [ref=e182]: Find my home
            - generic [ref=e188]:
              - img [ref=e191]
              - generic [ref=e193]:
                - paragraph [ref=e194]: Florida
                - heading [level=2] [ref=e195]: Orlando
              - link [ref=e197]:
                - /url: /florida/orlando
                - generic [ref=e198]:
                  - paragraph [ref=e199]: Florida
                  - heading [level=2] [ref=e200]: Orlando
                - generic [ref=e202]: Find my home
            - generic [ref=e208]:
              - img [ref=e211]
              - generic [ref=e213]:
                - paragraph [ref=e214]: Florida
                - heading [level=2] [ref=e215]: Palm Beach
              - link [ref=e217]:
                - /url: /florida/palm-beach
                - generic [ref=e218]:
                  - paragraph [ref=e219]: Florida
                  - heading [level=2] [ref=e220]: Palm Beach
                - generic [ref=e222]: Find my home
            - generic [ref=e228]:
              - img [ref=e231]
              - generic [ref=e233]:
                - paragraph [ref=e234]: Florida
                - heading [level=2] [ref=e235]: Palm City-Stuart
              - link [ref=e237]:
                - /url: /florida/palm-city-stuart
                - generic [ref=e238]:
                  - paragraph [ref=e239]: Florida
                  - heading [level=2] [ref=e240]: Palm City-Stuart
                - generic [ref=e242]: Find my home
            - generic [ref=e248]:
              - img [ref=e251]
              - generic [ref=e253]:
                - paragraph [ref=e254]: Arizona
                - heading [level=2] [ref=e255]: Phoenix
              - link [ref=e257]:
                - /url: /arizona/phoenix
                - generic [ref=e258]:
                  - paragraph [ref=e259]: Arizona
                  - heading [level=2] [ref=e260]: Phoenix
                - generic [ref=e262]: Find my home
            - generic [ref=e268]:
              - img [ref=e271]
              - generic [ref=e273]:
                - paragraph [ref=e274]: Florida
                - heading [level=2] [ref=e275]: Port St. Lucie
              - link [ref=e277]:
                - /url: /florida/port-st-lucie
                - generic [ref=e278]:
                  - paragraph [ref=e279]: Florida
                  - heading [level=2] [ref=e280]: Port St. Lucie
                - generic [ref=e282]: Find my home
            - generic [ref=e288]:
              - generic [ref=e292]:
                - paragraph [ref=e293]: North Carolina
                - heading [level=2] [ref=e294]: Raleigh
              - link [ref=e296]:
                - /url: /north-carolina/raleigh
                - generic [ref=e297]:
                  - paragraph [ref=e298]: North Carolina
                  - heading [level=2] [ref=e299]: Raleigh
                - generic [ref=e301]: Find my home
            - generic [ref=e307]:
              - img [ref=e310]
              - generic [ref=e312]:
                - paragraph [ref=e313]: South Carolina
                - heading [level=2] [ref=e314]: Rock Hill
              - link [ref=e316]:
                - /url: /south-carolina/rock-hill
                - generic [ref=e317]:
                  - paragraph [ref=e318]: South Carolina
                  - heading [level=2] [ref=e319]: Rock Hill
                - generic [ref=e321]: Find my home
            - generic [ref=e327]:
              - generic [ref=e331]:
                - paragraph [ref=e332]: Florida
                - heading [level=2] [ref=e333]: Sarasota
              - link [ref=e335]:
                - /url: /florida/sarasota
                - generic [ref=e336]:
                  - paragraph [ref=e337]: Florida
                  - heading [level=2] [ref=e338]: Sarasota
                - generic [ref=e340]: Find my home
            - generic [ref=e346]:
              - img [ref=e349]
              - generic [ref=e351]:
                - paragraph [ref=e352]: Florida
                - heading [level=2] [ref=e353]: Tampa
              - link [ref=e355]:
                - /url: /florida/tampa
                - generic [ref=e356]:
                  - paragraph [ref=e357]: Florida
                  - heading [level=2] [ref=e358]: Tampa
                - generic [ref=e360]: Find my home
            - generic [ref=e366]:
              - generic [ref=e370]:
                - paragraph [ref=e371]: Arizona
                - heading [level=2] [ref=e372]: Tucson
              - link [ref=e374]:
                - /url: /arizona/tucson
                - generic [ref=e375]:
                  - paragraph [ref=e376]: Arizona
                  - heading [level=2] [ref=e377]: Tucson
                - generic [ref=e379]: Find my home
          - button "Previous story panel." [ref=e380] [cursor=pointer]:
            - img [ref=e381]
          - button "Next story panel." [ref=e383] [cursor=pointer]:
            - img [ref=e384]
    - contentinfo "footer" [ref=e386]:
      - generic [ref=e388]:
        - generic [ref=e389]:
          - generic [ref=e390]:
            - heading "Explore" [level=2] [ref=e391]
            - list [ref=e393]:
              - listitem [ref=e394]:
                - link "Find My Home" [ref=e395]:
                  - /url: /search
              - listitem [ref=e396]:
                - link "Design Studio" [ref=e397]:
                  - /url: /design-studio
              - listitem [ref=e398]:
                - link "Customer Care" [ref=e399]:
                  - /url: /customer-care
          - generic [ref=e401]:
            - heading "About Mattamy" [level=2] [ref=e402]
            - list [ref=e404]:
              - listitem [ref=e405]:
                - link "About Us" [ref=e406]:
                  - /url: /about/about-mattamy
              - listitem [ref=e407]:
                - link "Contact Us" [ref=e408]:
                  - /url: /contact
              - listitem [ref=e409]:
                - link "Careers" [ref=e410]:
                  - /url: /about/careers
              - listitem [ref=e411]:
                - link "Media and Investor Relations" [ref=e412]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e414]:
            - heading "Connect With Us" [level=2] [ref=e415]
            - generic [ref=e417]:
              - link "Facebook (opens in a new tab)" [ref=e418]:
                - /url: fb://profile/MattamyHomesUSA
                - img [ref=e419]
              - link "Instagram (opens in a new tab)" [ref=e421]:
                - /url: instagram://user?username=mattamyhomesusa
                - img [ref=e422]
              - link "Youtube (opens in a new tab)" [ref=e424]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e425]
              - link "Pinterest (opens in a new tab)" [ref=e427]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e428]
              - link "Linkedin (opens in a new tab)" [ref=e430]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e431]
        - generic [ref=e434]:
          - paragraph [ref=e435]:
            - link "Accessibility" [ref=e436]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e437]: "|"
            - button "Cookie Settings" [ref=e438] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e439]: "|"
            - link "Legal Disclaimers" [ref=e440]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e441]: "|"
            - link "Privacy Policy" [ref=e442]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e443]: "|"
            - link "Terms and Conditions" [ref=e444]:
              - /url: /terms-and-conditions
              - text: Terms and Conditions
              - generic [ref=e445]: "|"
            - link "About Us" [ref=e446]:
              - /url: /about/about-mattamy
          - paragraph [ref=e447]:
            - img "copyright disclaimer logo" [ref=e448]
            - text: Copyright © 2025 Mattamy Homes. All rights reserved.
  - iframe [ref=e450]:
    - generic [active] [ref=f5e1]:
      - generic:
        - generic:
          - generic:
            - button [ref=f5e2]
            - img "AtlasRTX Digital Assistant icon" [ref=f5e5]:
              - text: Chat with Us
              - strong [ref=f5e8]: "1"
            - button [ref=f5e9]
```

# Test source

```ts
  414 |         await this.waitForPageReady();
  415 | 
  416 |         await this.assertPageUrl(
  417 |           new RegExp(`${escapeRegex(expectedLink.url)}(?:\\?.*)?$`),
  418 |           `${expectedLink.name} should navigate to the configured About URL`,
  419 |         );
  420 | 
  421 |         await this.assertHeadingVisible(
  422 |           undefined,
  423 |           `${expectedLink.name} page should expose a visible H1`,
  424 |           15_000,
  425 |         );
  426 | 
  427 |         await this.page.goBack({ waitUntil: 'domcontentloaded' });
  428 |         await this.waitForPageReady();
  429 |       }
  430 |     });
  431 |   }
  432 | 
  433 |   /** Clicks one About Us flyout link and waits for its page to load. */
  434 |   async clickAboutUsMenuLink(expectedLink: HeaderNavigationLink): Promise<void> {
  435 |     await this.step(`Click About Us menu link: ${expectedLink.name}`, async () => {
  436 |       const menuLink = this.getAboutUsMenuLink(expectedLink);
  437 | 
  438 |       await this.assertAttached(menuLink, `${expectedLink.name} should be visible before clicking`);
  439 | 
  440 |       // noWaitAfter: this link navigates, so the element detaches mid-click. Without
  441 |       // it, Playwright keeps running its post-click checks against the gone element
  442 |       // and times out even though the navigation succeeded (seen on the heavier
  443 |       // About pages such as Sustainability). The waitForURL below is the real
  444 |       // assertion that the click worked.
  445 |       await menuLink.click({ timeout: 10000, noWaitAfter: true });
  446 |       await this.page.waitForURL((url) => url.pathname === expectedLink.url, { timeout: 30000 });
  447 | 
  448 |       await this.waitForPageReady();
  449 |     });
  450 |   }
  451 | 
  452 |   /** Returns the About Us flyout link with this name and href. */
  453 |   private getAboutUsMenuLink(expectedLink: HeaderNavigationLink): Locator {
  454 |     return this.aboutUsMenuLinks
  455 |       .filter({ hasText: new RegExp(`^\\s*${escapeRegex(expectedLink.name)}\\s*$`, 'i') })
  456 |       .and(this.header.locator(`a[href="${expectedLink.url}"]`))
  457 |       .first();
  458 |   }
  459 | 
  460 |   // Generic Mega-Menu Flyout Validation
  461 | 
  462 |   /** Opens a top-level header menu (flyout) by its button label. */
  463 |   async openMenu(menuName: string): Promise<void> {
  464 |     await this.step(`Open '${menuName}' menu`, async () => {
  465 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  466 |       await this.page.evaluate(() => window.scrollTo(0, 0));
  467 | 
  468 |       const menuButton = this.header
  469 |         .getByRole('button', { name: new RegExp(`^${escapeRegex(menuName)}$`, 'i') })
  470 |         .first();
  471 | 
  472 |       await menuButton.waitFor({ state: 'visible', timeout: 20000 });
  473 |       await menuButton.hover();
  474 |       await menuButton.click();
  475 |       await this.settle(1000);
  476 |     });
  477 |   }
  478 | 
  479 |   /** Checks that a header flyout menu exposes the expected navigation links. */
  480 |   async verifyMenuLinks(
  481 |     menuName: string,
  482 |     expectedLinks: readonly HeaderNavigationLink[],
  483 |   ): Promise<void> {
  484 |     await this.step(`Verify '${menuName}' menu links`, async () => {
  485 |       await this.openMenu(menuName);
  486 | 
  487 |       for (const expected of expectedLinks) {
  488 |         const link = this.header.locator(`a[href="${expected.url}"]`).first();
  489 | 
  490 |         await this.assertAttached(
  491 |           link,
  492 |           `${menuName} menu should expose ${expected.name} (${expected.url})`,
  493 |           15_000,
  494 |         );
  495 |         await this.reportValue(
  496 |           `${menuName} menu link: ${expected.name}`,
  497 |           this.buildFullUrl(expected.url),
  498 |         );
  499 |       }
  500 |     });
  501 |   }
  502 | 
  503 |   /** Gets the header links pointing at a path that are actually rendered on screen. */
  504 |   private visibleHeaderLinks(url: string): Locator {
  505 |     return this.header.locator(`a[href="${url}"]:visible`);
  506 |   }
  507 | 
  508 |   /** Checks that a link is exposed as a visible top-level header item, with no flyout opened. */
  509 |   async verifyTopLevelNavLinkVisible(link: HeaderNavigationLink): Promise<void> {
  510 |     await this.step(`Verify top-level nav link: ${link.name}`, async () => {
  511 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  512 |       await this.page.evaluate(() => window.scrollTo(0, 0));
  513 | 
> 514 |       await expect
      |       ^ Error: Design Studio should be visible as a top-level header item
  515 |         .poll(() => this.visibleHeaderLinks(link.url).count(), {
  516 |           message: `${link.name} should be visible as a top-level header item`,
  517 |           timeout: 20000,
  518 |         })
  519 |         .toBeGreaterThan(0);
  520 | 
  521 |       await this.reportValue(
  522 |         `Top-level header nav link: ${link.name}`,
  523 |         this.buildFullUrl(link.url),
  524 |       );
  525 |     });
  526 |   }
  527 | 
  528 |   /**
  529 |    * Checks a link is NOT a top-level header item - it lives inside a flyout for
  530 |    * this country. Asserted on the closed header, where the flyout's copy of the
  531 |    * link is in the DOM but has no box, so ":visible" is what separates the two
  532 |    * placements.
  533 |    */
  534 |   async verifyNoTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
  535 |     await this.step(`Verify ${link.name} is not a top-level nav link`, async () => {
  536 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  537 |       await this.page.evaluate(() => window.scrollTo(0, 0));
  538 | 
  539 |       await expect
  540 |         .poll(() => this.visibleHeaderLinks(link.url).count(), {
  541 |           message: `${link.name} should not be surfaced as a top-level header item`,
  542 |           timeout: 15000,
  543 |         })
  544 |         .toBe(0);
  545 |     });
  546 |   }
  547 | 
  548 |   /** Opens a header flyout menu, clicks one of its links and waits for the route. */
  549 |   async clickMenuLink(menuName: string, link: HeaderNavigationLink): Promise<void> {
  550 |     await this.step(`Click '${menuName}' menu link: ${link.name}`, async () => {
  551 |       await this.openMenu(menuName);
  552 | 
  553 |       const menuLink = this.header.locator(`a[href="${link.url}"]`).first();
  554 | 
  555 |       await this.assertVisible(menuLink, `${link.name} should be visible in the ${menuName} menu`);
  556 | 
  557 |       // noWaitAfter: the link navigates and detaches, so Playwright's post-click
  558 |       // checks would time out against a gone element; waitForURL is the real
  559 |       // assertion that the click worked.
  560 |       await menuLink.click({ noWaitAfter: true });
  561 |       await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
  562 |       await this.waitForPageReady();
  563 | 
  564 |       await this.reportValue(`${menuName} menu navigation: ${link.name}`, this.page.url());
  565 |     });
  566 |   }
  567 | 
  568 |   /** Clicks a top-level header navigation link by its href and waits for the route. */
  569 |   async clickTopLevelNavLink(link: HeaderNavigationLink): Promise<void> {
  570 |     await this.step(`Click top-level nav link: ${link.name}`, async () => {
  571 |       await this.header.waitFor({ state: 'attached', timeout: 20000 });
  572 |       await this.page.evaluate(() => window.scrollTo(0, 0));
  573 | 
  574 |       const navLink = this.header.locator(`a[href="${link.url}"]`).first();
  575 | 
  576 |       await navLink.waitFor({ state: 'visible', timeout: 20000 });
  577 |       await navLink.click();
  578 |       await this.page.waitForURL((url) => url.pathname === link.url, { timeout: 30000 });
  579 |       await this.waitForPageReady();
  580 |     });
  581 |   }
  582 | 
  583 |   /** Checks that the chatbot widget / launcher is loaded on the page. */
  584 |   async verifyChatbotLoaded(): Promise<void> {
  585 |     await this.step('Verify chatbot widget loads', async () => {
  586 |       const launcher = this.page
  587 |         .locator(
  588 |           [
  589 |             'iframe[title*="chat" i]',
  590 |             'iframe[id*="chat" i]',
  591 |             'iframe[src*="atlasrtx" i]',
  592 |             'iframe[src*="chatbot" i]',
  593 |             'button[aria-label*="chat" i]',
  594 |             '[id*="chat" i][class*="launch" i]',
  595 |             '[class*="chatbot" i]',
  596 |           ].join(', '),
  597 |         )
  598 |         .first();
  599 | 
  600 |       await this.assertAttached(
  601 |         launcher,
  602 |         'A chatbot launcher / iframe should be present on the page',
  603 |         25_000,
  604 |       );
  605 |       await this.reportValue('Chatbot widget detected');
  606 |     });
  607 |   }
  608 | }
  609 | 
```