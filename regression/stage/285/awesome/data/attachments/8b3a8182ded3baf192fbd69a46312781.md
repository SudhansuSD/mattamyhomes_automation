# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aboutUsPages.spec.ts >> Mattamy Homes - CAN Header About Us Links >> About Us Page Validation >> @regression | CAN | Community Involvement page should load with valid UI and functionality
- Location: tests/aboutUsPages.spec.ts:54:11

# Error details

```
Error: Community Involvement title should match expected value

expect(page).toHaveTitle(expected) failed

Expected pattern: /Community Involvement \| Mattamy Homes/i
Received string:  "Mattamy Homes"
Timeout: 15000ms

Call log:
  - Community Involvement title should match expected value with timeout 15000ms
    - found getByRole('dialog', { name: /privacy/i }), intercepting action to run the handler
    - locator handler has finished, waiting for getByRole('dialog', { name: /privacy/i }) to be hidden
    - interception handler has finished, continuing
    - found locator('#iAtlasChat:visible').first(), intercepting action to run the handler
    - locator handler has finished
    - interception handler has finished, continuing
    18 × unexpected value "Mattamy Homes"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - banner [ref=e7]:
      - generic [ref=e8]:
        - link "Mattamy logo. Go to HomePage" [ref=e9]:
          - /url: /
          - figure [ref=e10]:
            - img "Mattamy logo" [ref=e11]
        - button "Navigation menu." [ref=e12] [cursor=pointer]:
          - img [ref=e13]
    - main [ref=e15]:
      - generic [ref=e19]:
        - heading "Community is our home" [level=1] [ref=e20]
        - paragraph [ref=e23]: We believe that our communities are just as important as our homes. Giving back is an integral part of who we are.
      - img "image with White construction hardhat with Mattamy logo set on picnic table with playground behind it" [ref=e28]
      - generic [ref=e31]:
        - heading "Caring about doing good" [level=2] [ref=e32]
        - generic [ref=e33]: Our ongoing dedication to making our communities better places to live and call home is a critical part of what makes Mattamy special. The concept of ‘community’ isn’t just our most important core value, it’s in our DNA. As an organization, and as individual employees, we believe that having a positive impact in the community is our responsibility. Through our grass-roots, employee-driven initiatives, corporate MattamyCares program, grand-scale company donations and the generous philanthropy of our Founder’s charitable organization, the Peter Gilgan Foundation, we come together like family to actively support local and global charitable organizations to create vibrant, healthy communities.
      - generic [ref=e36]:
        - heading "Caring about doing good" [level=2] [ref=e37]
        - generic [ref=e38]: Our ongoing dedication to making our communities better places to live and call home is a critical part of what makes Mattamy special. The concept of 'community' isn't just our most important core value, it's in out DNA. As an organization, and as individual employees, we believe that having a positive impact in the community is our responsibility. Through our grass-roots, employee-driven initiatives, corporate MattamyCares program, grand-scale company donations and the generous philanthropy of our Founder's charitable organization, the Peter Gilgan Foundation, we come together like family to actively support local and global charitable organizations to create vibrant, healthy communities.
      - generic [ref=e40]:
        - 'heading "Making an impact: by the numbers" [level=2] [ref=e41]'
        - generic [ref=e43]: At Mattamy, community involvement isn’t just about doing good and giving back, it’s about having an impact. We’re proud of the difference we continue to make in the communities we serve.
        - generic [ref=e44]:
          - article [ref=e45]:
            - heading "$40,000" [level=3] [ref=e46]
            - paragraph [ref=e47]: Donated to Habitat for Humanity South Sarasota County in 2023 as part of the organization's Cottages for Kids program.
          - article [ref=e48]:
            - heading "60,000" [level=3] [ref=e49]
            - paragraph [ref=e50]: KN-95 masks donated by Mattamy to hospitals in need during a critical time in the COVID-19 pandemic.
          - article [ref=e51]:
            - heading "$39 million" [level=3] [ref=e52]
            - paragraph [ref=e53]: Raised by Peter Gilgan Foundation's annual cycling fundraiser, Tour de Bleu, benefiting health care and healthy living since 2005.
          - article [ref=e54]:
            - heading "40" [level=3] [ref=e55]
            - paragraph [ref=e56]: Charitable or not-for-profit organizations supported by the Mattamy Volunteer Program in Fiscal 2024, as selected by our team members.
          - article [ref=e57]:
            - heading "$325 million" [level=3] [ref=e58]
            - paragraph [ref=e59]: Donated to hospitals in Canada, including $105 million to Trillium Health Partners – the single largest donation to a hospital in Canadian history.
          - article [ref=e60]:
            - heading "2nd out of 20,000+" [level=3] [ref=e61]
            - paragraph [ref=e62]: Teams participating in Movember 2022 globally, raising more than $200,000 in support of men’s health.
      - generic [ref=e63]:
        - generic [ref=e64]:
          - heading "Dive deeper into life at Mattamy" [level=2] [ref=e65]
          - paragraph [ref=e66]: What does it really look like to work at Mattamy? Get to know some of our team members as they share their own Mattamy stories.
        - generic [ref=e69]:
          - link "Area Sales Manager Amanda. Opens in new tab. null" [ref=e73] [cursor=pointer]:
            - /url: /about/careers/day-in-the-life-amanda
            - img [ref=e75]
            - generic [ref=e78]:
              - paragraph [ref=e79]: Area Sales Manager
              - heading "Amanda" [level=2] [ref=e80]
              - img "OpenNewTab Icon" [ref=e81]
          - button "SHOW MORE" [ref=e85] [cursor=pointer]:
            - paragraph [ref=e87]: SHOW MORE
      - generic [ref=e91]:
        - img "Peter Gilgan smiling with a large group of children outside of the Peter Gilgan Family Patient Care Tower" [ref=e97]
        - generic [ref=e101]:
          - heading "The Peter Gilgan Foundation" [level=2] [ref=e102]
          - generic [ref=e103]: The Peter Gilgan Foundation supports registered charities that improve life opportunities for children and families, as well as those that advance market-based solutions for global humanitarian and environmental concerns.
          - link "Learn more. Opens in new tab" [ref=e105] [cursor=pointer]:
            - /url: https://www.petergilganfoundation.org/
            - generic [ref=e106]:
              - text: Learn more
              - img [ref=e107]
    - contentinfo "footer" [ref=e110]:
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic [ref=e114]:
            - heading "Explore" [level=2] [ref=e115]
            - list [ref=e117]:
              - listitem [ref=e118]:
                - link "Mattamy Homes USA" [ref=e119]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e120]:
                - link "Mattamy Homes Canada" [ref=e121]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e122]:
                - link "Design Studio" [ref=e123]:
                  - /url: /design-studio
              - listitem [ref=e124]:
                - link "Customer Care" [ref=e125]:
                  - /url: /customer-care
          - generic [ref=e127]:
            - heading "About Mattamy" [level=2] [ref=e128]
            - list [ref=e130]:
              - listitem [ref=e131]:
                - link "About Us" [ref=e132]:
                  - /url: /about/about-mattamy
              - listitem [ref=e133]:
                - link "Contact Us" [ref=e134]:
                  - /url: /contact
              - listitem [ref=e135]:
                - link "Careers" [ref=e136]:
                  - /url: /about/careers
              - listitem [ref=e137]:
                - link "Media and Investor Relations" [ref=e138]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e140]:
            - heading "Connect With Us" [level=2] [ref=e141]
            - generic [ref=e143]:
              - link "Facebook (opens in a new tab)" [ref=e144]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e145]
              - link "Instagram (opens in a new tab)" [ref=e147]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e148]
              - link "Youtube (opens in a new tab)" [ref=e150]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e151]
              - link "Pinterest (opens in a new tab)" [ref=e153]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e154]
              - link "Linkedin (opens in a new tab)" [ref=e156]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e157]
        - generic [ref=e160]:
          - paragraph [ref=e161]:
            - link "Accessibility" [ref=e162]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e163]: "|"
            - button "Cookie Settings" [ref=e164] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e165]: "|"
            - link "Legal Disclaimers" [ref=e166]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e167]: "|"
            - link "Privacy Policy" [ref=e168]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e169]: "|"
            - link "Terms and Conditions" [ref=e170]:
              - /url: /terms-and-conditions
          - paragraph [ref=e171]: ©2024 Mattamy Homes
  - generic:
    - region "Cookie banner"
```

# Test source

```ts
  563 |       .then(() => true)
  564 |       .catch(() => false);
  565 | 
  566 |     return (await this.requireFeature(present || null, feature, description)) !== null;
  567 |   }
  568 | 
  569 |   /**
  570 |    * Same decision as isFeaturePresent, for callers that already resolved the
  571 |    * element themselves. Returns the value, or null when declared optional.
  572 |    */
  573 |   protected async requireFeature<T>(
  574 |     value: T | null | undefined,
  575 |     feature: FeatureKey,
  576 |     description: string,
  577 |   ): Promise<T | null> {
  578 |     const { value: resolved, skipMessage } = resolveFeature(
  579 |       value,
  580 |       feature,
  581 |       description,
  582 |       this.locationKey,
  583 |       this.page.url(),
  584 |     );
  585 | 
  586 |     if (skipMessage) {
  587 |       await this.reportValue(skipMessage);
  588 |     }
  589 | 
  590 |     return resolved;
  591 |   }
  592 | 
  593 |   /**
  594 |    * Returns the first candidate locator that works, falling back down the list.
  595 |    *
  596 |    * When nothing matches, the primary locator comes back so the test still fails
  597 |    * on the real selector. Every heal is reported as selector drift: a run kept
  598 |    * green by a fallback still means the app changed, and someone has to see that.
  599 |    */
  600 |   protected async healLocator(
  601 |     label: string,
  602 |     candidates: SelfHealingLocatorCandidate[],
  603 |     options: SelfHealingLocatorOptions = {},
  604 |   ): Promise<Locator> {
  605 |     if (candidates.length === 0) {
  606 |       throw new Error(`No self-healing locator candidates provided for ${label}`);
  607 |     }
  608 | 
  609 |     const minimumCount = options.minimumCount ?? 1;
  610 |     const state = options.state ?? 'visible';
  611 |     const timeout = options.timeout ?? 750;
  612 |     const primary = candidates[0];
  613 | 
  614 |     for (const [index, candidate] of candidates.entries()) {
  615 |       const locator = candidate.locator;
  616 |       const count = await locator.count().catch(() => 0);
  617 | 
  618 |       if (count < minimumCount) {
  619 |         continue;
  620 |       }
  621 | 
  622 |       const isUsable = await locator
  623 |         .first()
  624 |         .waitFor({ state, timeout })
  625 |         .then(() => true)
  626 |         .catch(() => false);
  627 | 
  628 |       if (!isUsable) {
  629 |         continue;
  630 |       }
  631 | 
  632 |       if (index > 0) {
  633 |         await reportSelectorDrift(label, primary.selector, candidate.selector);
  634 |       }
  635 | 
  636 |       return locator;
  637 |     }
  638 | 
  639 |     await this.reportValue(
  640 |       `Self-healing fallback not found: ${label}`,
  641 |       `Using primary selector so the test fails normally: ${primary.selector}`,
  642 |     );
  643 | 
  644 |     return primary.locator;
  645 |   }
  646 | 
  647 |   // Shared Assertions
  648 | 
  649 |   /** Checks we actually landed on a page and not about:blank. */
  650 |   protected async assertPageLoaded(label = 'Page should be loaded'): Promise<void> {
  651 |     await test.step(label, async () => {
  652 |       await this.waitForPageReady();
  653 |       await expect(this.page, label).not.toHaveURL(/about:blank/i);
  654 |     });
  655 |   }
  656 | 
  657 |   /** Checks the browser tab title. */
  658 |   protected async assertPageTitle(
  659 |     expectedTitle: string | RegExp,
  660 |     label = 'Page title should match expected value',
  661 |   ): Promise<void> {
  662 |     await test.step(label, async () => {
> 663 |       await expect(this.page, label).toHaveTitle(expectedTitle);
      |                                      ^ Error: Community Involvement title should match expected value
  664 |     });
  665 |   }
  666 | 
  667 |   /** Checks the current URL. */
  668 |   protected async assertPageUrl(
  669 |     expectedUrl: string | RegExp,
  670 |     label = 'Page URL should match expected value',
  671 |     timeout = 60_000,
  672 |   ): Promise<void> {
  673 |     await test.step(label, async () => {
  674 |       await expect(this.page, label).toHaveURL(expectedUrl, { timeout });
  675 |     });
  676 |   }
  677 | 
  678 |   /** Checks the current URL contains this fragment. */
  679 |   protected async assertPageUrlContains(
  680 |     expectedUrlPart: string,
  681 |     label = `Page URL should contain: ${expectedUrlPart}`,
  682 |     timeout = 60_000,
  683 |   ): Promise<void> {
  684 |     await this.assertPageUrl(new RegExp(escapeRegex(expectedUrlPart), 'i'), label, timeout);
  685 |   }
  686 | 
  687 |   /** Checks we did not end up on an unexpected URL. */
  688 |   protected async assertPageUrlDoesNotMatch(
  689 |     unexpectedUrl: string | RegExp,
  690 |     label = 'Page URL should not match unexpected value',
  691 |   ): Promise<void> {
  692 |     await test.step(label, async () => {
  693 |       await expect(this.page, label).not.toHaveURL(unexpectedUrl);
  694 |     });
  695 |   }
  696 | 
  697 |   /** Checks an element is visible on screen. */
  698 |   protected async assertVisible(
  699 |     locator: Locator,
  700 |     label = 'Element should be visible',
  701 |     timeout = 10_000,
  702 |   ): Promise<void> {
  703 |     await test.step(label, async () => {
  704 |       await expect(locator, label).toBeVisible({ timeout });
  705 |     });
  706 |   }
  707 | 
  708 |   /** Checks an element is in the DOM, whether or not it is on screen. */
  709 |   protected async assertAttached(
  710 |     locator: Locator,
  711 |     label = 'Element should be attached',
  712 |     timeout = 10_000,
  713 |   ): Promise<void> {
  714 |     await test.step(label, async () => {
  715 |       await expect(locator, label).toBeAttached({ timeout });
  716 |     });
  717 |   }
  718 | 
  719 |   /** Checks an element's text contains what we expect. */
  720 |   protected async assertTextContains(
  721 |     locator: Locator,
  722 |     expectedText: string | RegExp,
  723 |     label = 'Element should contain expected text',
  724 |     timeout = 10_000,
  725 |   ): Promise<void> {
  726 |     await test.step(label, async () => {
  727 |       await expect(locator, label).toContainText(expectedText, { timeout });
  728 |     });
  729 |   }
  730 | 
  731 |   /** Checks an element's text matches exactly. */
  732 |   protected async assertText(
  733 |     locator: Locator,
  734 |     expectedText: string | RegExp,
  735 |     label = 'Element text should match expected value',
  736 |     timeout = 10_000,
  737 |   ): Promise<void> {
  738 |     await test.step(label, async () => {
  739 |       await expect(locator, label).toHaveText(expectedText, { timeout });
  740 |     });
  741 |   }
  742 | 
  743 |   /** Checks the text appears somewhere on the page. */
  744 |   protected async assertBodyContains(
  745 |     expectedText: string | RegExp,
  746 |     label = 'Page body should contain expected text',
  747 |     timeout = 10_000,
  748 |   ): Promise<void> {
  749 |     await this.assertTextContains(this.page.locator('body'), expectedText, label, timeout);
  750 |   }
  751 | 
  752 |   /** Checks the page shows an H1. */
  753 |   protected async assertHeadingVisible(
  754 |     expectedName?: string | RegExp,
  755 |     label = 'Page heading should be visible',
  756 |     timeout = 20_000,
  757 |   ): Promise<void> {
  758 |     const heading = expectedName
  759 |       ? this.page.getByRole('heading', { level: 1, name: expectedName }).first()
  760 |       : this.page.locator('h1').first();
  761 | 
  762 |     await this.assertVisible(heading, label, timeout);
  763 |   }
```