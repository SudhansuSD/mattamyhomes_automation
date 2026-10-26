# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contactPage.spec.ts >> Mattamy Homes - Contact Page >> CAN contact experience >> @regression | CAN | corporate office contacts and footer links should be valid
- Location: tests/contactPage.spec.ts:56:11

# Error details

```
Error: Find My Home footer link should be visible

expect(locator).toBeVisible() failed

Locator: locator('body').getByRole('link', { name: /^Find My Home/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Find My Home footer link should be visible with timeout 10000ms
  - waiting for locator('body').getByRole('link', { name: /^Find My Home/i }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - banner [ref=e7]:
      - generic [ref=e8]:
        - link "Mattamy logo. Go to HomePage" [ref=e9] [cursor=pointer]:
          - /url: /
          - figure [ref=e10]:
            - img "Mattamy logo" [ref=e11]
        - navigation [ref=e12]:
          - generic [ref=e13]:
            - button "Find Your Dream Home" [ref=e15] [cursor=pointer]:
              - paragraph [ref=e16]:
                - text: Find Your Dream Home
                - img [ref=e17]
            - generic:
              - generic:
                - generic:
                  - generic:
                    - button:
                      - generic:
                        - text: Alberta
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Calgary
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Edmonton
                        - generic:
                          - img
                - generic:
                  - generic:
                    - button:
                      - generic:
                        - text: Ontario
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Greater Toronto Area
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Kitchener-Waterloo-Guelph
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Ottawa
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Simcoe
                        - generic:
                          - img
          - link "Sustainability" [ref=e20] [cursor=pointer]:
            - /url: /about/sustainability
            - paragraph [ref=e21]: Sustainability
          - button "Resources" [ref=e24] [cursor=pointer]:
            - paragraph [ref=e25]:
              - text: Resources
              - img [ref=e26]
          - link "Customer Care" [ref=e29] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e30]: Customer Care
          - button "About" [ref=e33] [cursor=pointer]:
            - paragraph [ref=e34]:
              - text: About
              - img [ref=e35]
          - link "Contact Us" [ref=e38] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e39]: Contact Us
        - generic [ref=e41]:
          - button "Go to Favorites Page" [ref=e42] [cursor=pointer]:
            - img "Favorite Icon" [ref=e43]
          - button "Select your country. CANADA country is selected" [ref=e48] [cursor=pointer]:
            - generic [ref=e50]: CANADA
            - img [ref=e52]
    - main [ref=e54]:
      - generic [ref=e58]:
        - heading "Our team is here for you" [level=1] [ref=e59]
        - generic [ref=e60]: Whether you're interested in a new community or are a current homeowner needing assistance, we'd love to hear from you.
      - heading "Country Selector" [level=2] [ref=e62]
      - generic [ref=e64]:
        - button "Country selector, Canada is selected" [ref=e68] [cursor=pointer]:
          - generic [ref=e70]: Canada
          - button "Country selector, Canada is selected dropdown list" [ref=e71]:
            - img [ref=e72]
        - generic [ref=e74]:
          - heading "Please Select Your Area" [level=2] [ref=e75]
          - generic [ref=e76]:
            - button "View contact details of Calgary, AB State" [ref=e78] [cursor=pointer]:
              - text: Calgary, AB
              - img [ref=e80]
            - button "View contact details of Edmonton, AB State" [ref=e83] [cursor=pointer]:
              - text: Edmonton, AB
              - img [ref=e85]
            - button "View contact details of Greater Toronto Area, ON State" [ref=e88] [cursor=pointer]:
              - text: Greater Toronto Area, ON
              - img [ref=e90]
            - button "View contact details of Kitchener-Waterloo-Guelph, ON State" [ref=e93] [cursor=pointer]:
              - text: Kitchener-Waterloo-Guelph, ON
              - img [ref=e95]
          - generic [ref=e97]:
            - button "View contact details of Ottawa, ON State" [ref=e99] [cursor=pointer]:
              - text: Ottawa, ON
              - img [ref=e101]
            - button "View contact details of Simcoe, ON State" [ref=e104] [cursor=pointer]:
              - text: Simcoe, ON
              - img [ref=e106]
      - generic [ref=e110]:
        - heading "Contact Our Corporate Offices" [level=2] [ref=e111]
        - generic [ref=e112]:
          - generic [ref=e114]:
            - heading "Investors" [level=3] [ref=e115]
            - generic [ref=e117]:
              - img [ref=e119]
              - link "Email to bondholders@mattamycorp.com" [ref=e122] [cursor=pointer]:
                - /url: mailto:bondholders@mattamycorp.com
                - text: bondholders@mattamycorp.com
          - generic [ref=e124]:
            - heading "Media" [level=3] [ref=e125]
            - generic [ref=e127]:
              - img [ref=e129]
              - link "Email to media@mattamycorp.com" [ref=e132] [cursor=pointer]:
                - /url: mailto:media@mattamycorp.com
                - text: media@mattamycorp.com
          - generic [ref=e134]:
            - heading "Trades Canada" [level=3] [ref=e135]
            - generic [ref=e137]:
              - img [ref=e139]
              - link "Email to Trades.Canada@mattamycorp.com" [ref=e142] [cursor=pointer]:
                - /url: mailto:Trades.Canada@mattamycorp.com
                - text: Trades.Canada@mattamycorp.com
          - generic [ref=e144]:
            - heading "Trades US" [level=3] [ref=e145]
            - generic [ref=e147]:
              - img [ref=e149]
              - link "Email to Trades.US@mattamycorp.com" [ref=e152] [cursor=pointer]:
                - /url: mailto:Trades.US@mattamycorp.com
                - text: Trades.US@mattamycorp.com
    - contentinfo "footer" [ref=e153]:
      - generic [ref=e155]:
        - generic [ref=e156]:
          - generic [ref=e157]:
            - heading "Explore" [level=2] [ref=e158]
            - list [ref=e160]:
              - listitem [ref=e161]:
                - link "Mattamy Homes USA" [ref=e162] [cursor=pointer]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e163]:
                - link "Mattamy Homes Canada" [ref=e164] [cursor=pointer]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e165]:
                - link "Design Studio" [ref=e166] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e167]:
                - link "Customer Care" [ref=e168] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e170]:
            - heading "About Mattamy" [level=2] [ref=e171]
            - list [ref=e173]:
              - listitem [ref=e174]:
                - link "About Us" [ref=e175] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e176]:
                - link "Contact Us" [ref=e177] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e178]:
                - link "Careers" [ref=e179] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e180]:
                - link "Media and Investor Relations" [ref=e181] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e183]:
            - heading "Connect With Us" [level=2] [ref=e184]
            - generic [ref=e186]:
              - link "Facebook (opens in a new tab)" [ref=e187] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomes
                - img [ref=e188]
              - link "Instagram (opens in a new tab)" [ref=e190] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomes/
                - img [ref=e191]
              - link "Youtube (opens in a new tab)" [ref=e193] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e194]
              - link "Pinterest (opens in a new tab)" [ref=e196] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e197]
              - link "Linkedin (opens in a new tab)" [ref=e199] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e200]
        - generic [ref=e203]:
          - paragraph [ref=e204]:
            - link "Accessibility" [ref=e205] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e206]: "|"
            - button "Cookie Settings" [ref=e207] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e208]: "|"
            - link "Legal Disclaimers" [ref=e209] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e210]: "|"
            - link "Privacy Policy" [ref=e211] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e212]: "|"
            - link "Terms and Conditions" [ref=e213] [cursor=pointer]:
              - /url: /terms-and-conditions
          - paragraph [ref=e214]: ©2024 Mattamy Homes
```

# Test source

```ts
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
  663 |       await expect(this.page, label).toHaveTitle(expectedTitle);
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
> 704 |       await expect(locator, label).toBeVisible({ timeout });
      |                                    ^ Error: Find My Home footer link should be visible
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
  764 | 
  765 |   /** Checks the H1 says what we expect. */
  766 |   protected async assertHeadingContains(
  767 |     expectedText: string | RegExp,
  768 |     label = 'Page heading should contain expected text',
  769 |     timeout = 20_000,
  770 |   ): Promise<void> {
  771 |     await this.assertTextContains(this.page.locator('h1').first(), expectedText, label, timeout);
  772 |   }
  773 | 
  774 |   /** Checks an element's attribute value. */
  775 |   protected async assertAttribute(
  776 |     locator: Locator,
  777 |     attributeName: string,
  778 |     expectedValue: string | RegExp,
  779 |     label = `${attributeName} attribute should match expected value`,
  780 |     timeout = 10_000,
  781 |   ): Promise<void> {
  782 |     await test.step(label, async () => {
  783 |       await expect(locator, label).toHaveAttribute(attributeName, expectedValue, { timeout });
  784 |     });
  785 |   }
  786 | 
  787 |   /** Checks how many elements the locator matches. */
  788 |   protected async assertCount(
  789 |     locator: Locator,
  790 |     expectedCount: number,
  791 |     label = `Element count should be ${expectedCount}`,
  792 |     timeout = 10_000,
  793 |   ): Promise<void> {
  794 |     await test.step(label, async () => {
  795 |       await expect(locator, label).toHaveCount(expectedCount, { timeout });
  796 |     });
  797 |   }
  798 | 
  799 |   protected assertTruthy<T>(
  800 |     value: T,
  801 |     label = 'Expected value should be present',
  802 |   ): asserts value is NonNullable<T> {
  803 |     expect(value, label).toBeTruthy();
  804 |   }
```