# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customerCarePage.spec.ts >> Mattamy Homes - Customer Care Page >> USA customer care experience >> @smoke @regression | USA | customer care page should load country-specific content
- Location: tests/customerCarePage.spec.ts:38:11

# Error details

```
Error: USA Customer Care page title should match

expect(page).toHaveTitle(expected) failed

Expected pattern: /Customer Care \| Mattamy Homes/i
Received string:  ""
Timeout: 15000ms

Call log:
  - USA Customer Care page title should match with timeout 15000ms
    - found getByRole('dialog', { name: /privacy/i }), intercepting action to run the handler

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
        - link "Mattamy logo. Go to HomePage" [ref=e9]:
          - /url: /
          - figure [ref=e10]:
            - img "Mattamy logo" [ref=e11]
        - button "Navigation menu." [ref=e12] [cursor=pointer]:
          - img [ref=e13]
    - main [ref=e15]:
      - generic [ref=e19]:
        - heading "Customer Care" [level=1] [ref=e20]
        - generic [ref=e21]: Mattamy Homes strives to provide the best homeowner experience that continues after purchasing your home. Should assistance be needed from a routine warranty question to a matter that might be more pressing, please see below.
      - img "image with iStock-1164904657_1800x1200" [ref=e26]
      - generic [ref=e30]:
        - img "Lifestyle" [ref=e36]
        - generic [ref=e40]:
          - heading "Emergency support" [level=2] [ref=e41]
          - generic [ref=e43]:
            - text: In the event you experience any of the defined emergencies listed below, please contact our trade partner immediately.
            - text: What constitutes an emergency?
            - text: • Gas leak
            - text: • Roof leak
            - text: • Total loss of power
            - text: • Total loss of air conditioning or heating
            - text: • Total loss of water, plumbing leak or stoppage
            - text: Should the emergency occur during our normal business hours (8:00am - 4:30pm), contact our team via the applicable phone numbers below.
            - text: Should the emergency occur after hours, our team will respond the following business day.
      - generic [ref=e46]:
        - img "customer_care_gas_leak_2_2050x1600" [ref=e50]
        - generic [ref=e51]:
          - heading "In the event of a gas leak" [level=2] [ref=e52]
          - generic [ref=e54]:
            - text: Should you experience a gas leak, we ask that you leave your home immediately and call the gas service provider from outside of the home.
            - text: Should you determine that it is not a leak coming from your gas line, contact your HVAC contractor instead.
            - text: Please use your discretion as to whether the potential leak requires a call to 911 emergency services.
      - generic [ref=e57]:
        - img "Lifestyle" [ref=e61]
        - generic [ref=e62]:
          - heading "In the event of a roof leak" [level=2] [ref=e63]
          - generic [ref=e64]: If your roof leaks, please contact your roofing vendor located on the Emergency Sticker and Mattamy Homes immediately. Please note that we will not be able to send a contractor until the weather allows. Please make every effort to minimize damage to surrounding household items as well as place containers to help capture any water when possible.
      - generic [ref=e67]:
        - img "iStock-171311412_2050x1600" [ref=e71]
        - generic [ref=e72]:
          - heading "In the event of electricity power loss" [level=2] [ref=e73]
          - generic [ref=e75]:
            - text: Should you experience a total loss of power during after-hours or on the weekend, please check the electrical panel to ensure that a breaker has not tripped. We ask that you also check with your utility provider to ensure that your area has not experienced a loss of power.
            - text: If you still do not have power, please contact your electrical contractor on your Emergency Sticker.
      - generic [ref=e78]:
        - img "iStock-1174999684_2050x1600" [ref=e82]
        - generic [ref=e83]:
          - heading "In the event of total heat or A/C loss" [level=2] [ref=e84]
          - generic [ref=e85]: If you lose either heating or air conditioning on all air conditioning units, we ask that you please contact the Heat, Ventilation & Air Conditioning (HVAC) Contractor as listed on your Emergency Sticker.
      - generic [ref=e88]:
        - img "Lifestyle" [ref=e92]
        - generic [ref=e93]:
          - heading "In the event of a plumbing issue" [level=2] [ref=e94]
          - generic [ref=e96]:
            - text: In case of a leak, shut the water off at the closest source. If the leak continues, locate your home’s main water shutoff valve and turn it to the OFF position. Contact the plumber as listed on the Emergency Sticker immediately.
            - text: In case of total loss of water pressure, check your water meter box in your yard to ensure that it is not turned off. If the meter is turned off, contact your local water service provider to ask if service has been temporarily interrupted.
            - text: In case of a whole house sewer stoppage, or a waste line backing up into your home, contact the plumbing contractor listed on your Emergency Sticker. Discontinue any use of facilities or drains.
      - generic [ref=e100]:
        - heading "Learn more about our coverage" [level=2] [ref=e101]
        - link "Learn more about our coverage Warranty Manual PDF" [ref=e104] [cursor=pointer]:
          - /url: /dfsmedia/a2b99d47a71047839a5a4241f44710ce/84919-source/f2024-sustainabilityreport
          - generic [ref=e105]: Warranty Manual PDF
      - generic [ref=e113]:
        - generic [ref=e114]:
          - heading "Warranty Form" [level=3] [ref=e115]
          - paragraph [ref=e116]: Warranty Form description
          - generic [ref=e117]: Required fields are marked with *
        - group [ref=e118]:
          - generic [ref=e119]:
            - generic "First name*" [ref=e120]:
              - generic [ref=e121]:
                - generic [ref=e122]: First name*
                - textbox "First name* field is required" [ref=e123]:
                  - /placeholder: ""
            - generic "Last name*" [ref=e124]:
              - generic [ref=e125]:
                - generic [ref=e126]: Last name*
                - textbox "Last name* field is required" [ref=e127]:
                  - /placeholder: ""
            - generic "Email" [ref=e128]:
              - generic [ref=e129]:
                - generic [ref=e130]: Email
                - textbox "Email" [ref=e131]:
                  - /placeholder: ""
            - generic "Address*" [ref=e132]:
              - generic [ref=e133]:
                - generic [ref=e134]: Address*
                - textbox "Address* field is required" [ref=e135]:
                  - /placeholder: ""
            - generic "City*" [ref=e136]:
              - generic [ref=e137]:
                - generic [ref=e138]: City*
                - textbox "City* field is required" [ref=e139]:
                  - /placeholder: ""
            - generic "State/Province *" [ref=e140]:
              - generic [ref=e141]:
                - generic [ref=e142]: State/Province *
                - combobox "State/Province * field is required" [ref=e143]:
                  - option [disabled] [selected]
                  - option "Arizona"
                  - option "Florida"
                  - option "Minnesota"
                  - option "North Carolina"
                  - option "South Carolina"
                  - option "Texas"
              - generic:
                - img
            - generic "Zip/Postal Code *" [ref=e144]:
              - generic [ref=e145]:
                - generic [ref=e146]: Zip/Postal Code *
                - textbox "Zip/Postal Code * field is required" [ref=e147]:
                  - /placeholder: ""
            - generic "Phone number*" [ref=e148]:
              - generic [ref=e149]:
                - generic [ref=e150]: Phone number*
                - textbox "Phone number* field is required" [ref=e151]:
                  - /placeholder: ""
            - generic "Market *" [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]: Market *
                - combobox "Market * field is required" [ref=e155]:
                  - option [disabled] [selected]
                  - option "Charlotte"
                  - option "Market"
                  - option "Dallas-Fort Worth"
                  - option "Fort Lauderdale"
                  - option "Jacksonville"
                  - option "Minneapolis"
                  - option "Naples-Fort Myers"
                  - option "Orlando"
                  - option "Palm Beach"
                  - option "Phoenix"
                  - option "Port St. Lucie"
                  - option "Raleigh"
                  - option "Sarasota-Bradenton"
                  - option "Tampa"
                  - option "Tucson"
                  - option "Venice"
              - generic:
                - img
            - generic "Community *" [ref=e156]:
              - generic [ref=e157]:
                - generic [ref=e158]: Community *
                - textbox "Community * field is required" [ref=e159]:
                  - /placeholder: ""
            - generic "Closing date" [ref=e160]:
              - generic [ref=e161]:
                - generic [ref=e162]: Closing date
                - textbox "Closing date" [ref=e163]:
                  - /placeholder: ""
            - generic "Service request*" [ref=e164]:
              - generic [ref=e165]:
                - generic [ref=e166]: Service request*
                - textbox "Service request* field is required" [ref=e167]:
                  - /placeholder: ""
            - button "SUBMIT" [ref=e169] [cursor=pointer]
      - heading "For emergencies, please call:" [level=2] [ref=e173]
      - generic [ref=e177]:
        - heading "Please Select Your Area" [level=2] [ref=e178]
        - generic [ref=e179]:
          - button "View contact details of Charlotte, NC State" [ref=e181] [cursor=pointer]:
            - text: Charlotte, NC
            - img [ref=e183]
          - button "View contact details of Clover, SC State" [ref=e186] [cursor=pointer]:
            - text: Clover, SC
            - img [ref=e188]
        - generic [ref=e190]:
          - button "View contact details of Dallas-Fort Worth, TX State" [ref=e192] [cursor=pointer]:
            - text: Dallas-Fort Worth, TX
            - img [ref=e194]
          - button "View contact details of Fort Lauderdale, FL State" [ref=e197] [cursor=pointer]:
            - text: Fort Lauderdale, FL
            - img [ref=e199]
        - generic [ref=e201]:
          - button "View contact details of Jacksonville-St. Augustine, FL State" [ref=e203] [cursor=pointer]:
            - text: Jacksonville-St. Augustine, FL
            - img [ref=e205]
          - button "View contact details of Naples-Fort Myers, FL State" [ref=e208] [cursor=pointer]:
            - text: Naples-Fort Myers, FL
            - img [ref=e210]
        - generic [ref=e212]:
          - button "View contact details of Orlando, FL State" [ref=e214] [cursor=pointer]:
            - text: Orlando, FL
            - img [ref=e216]
          - button "View contact details of Palm Beach, FL State" [ref=e219] [cursor=pointer]:
            - text: Palm Beach, FL
            - img [ref=e221]
        - generic [ref=e223]:
          - button "View contact details of Palm City-Stuart, FL State" [ref=e225] [cursor=pointer]:
            - text: Palm City-Stuart, FL
            - img [ref=e227]
          - button "View contact details of Phoenix, AZ State" [ref=e230] [cursor=pointer]:
            - text: Phoenix, AZ
            - img [ref=e232]
        - generic [ref=e234]:
          - button "View contact details of Port St. Lucie, FL State" [ref=e236] [cursor=pointer]:
            - text: Port St. Lucie, FL
            - img [ref=e238]
          - button "View contact details of Raleigh, NC State" [ref=e241] [cursor=pointer]:
            - text: Raleigh, NC
            - img [ref=e243]
        - generic [ref=e245]:
          - button "View contact details of Rock Hill, SC State" [ref=e247] [cursor=pointer]:
            - text: Rock Hill, SC
            - img [ref=e249]
          - button "View contact details of Sarasota, FL State" [ref=e252] [cursor=pointer]:
            - text: Sarasota, FL
            - img [ref=e254]
        - generic [ref=e256]:
          - button "View contact details of Tampa, FL State" [ref=e258] [cursor=pointer]:
            - text: Tampa, FL
            - img [ref=e260]
          - button "View contact details of Tucson, AZ State" [ref=e263] [cursor=pointer]:
            - text: Tucson, AZ
            - img [ref=e265]
      - generic [ref=e270]:
        - heading "FAQs" [level=2] [ref=e271]
        - link "FAQs View FAQs" [ref=e274] [cursor=pointer]:
          - /url: /customer-care/FAQs
          - generic [ref=e275]: View FAQs
    - contentinfo "footer" [ref=e276]:
      - generic [ref=e278]:
        - generic [ref=e279]:
          - generic [ref=e280]:
            - heading "Explore" [level=2] [ref=e281]
            - list [ref=e283]:
              - listitem [ref=e284]:
                - link "Mattamy Homes USA" [ref=e285]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e286]:
                - link "Mattamy Homes Canada" [ref=e287]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e288]:
                - link "Design Studio" [ref=e289]:
                  - /url: /design-studio
              - listitem [ref=e290]:
                - link "Customer Care" [ref=e291]:
                  - /url: /customer-care
          - generic [ref=e293]:
            - heading "About Mattamy" [level=2] [ref=e294]
            - list [ref=e296]:
              - listitem [ref=e297]:
                - link "About Us" [ref=e298]:
                  - /url: /about/about-mattamy
              - listitem [ref=e299]:
                - link "Contact Us" [ref=e300]:
                  - /url: /contact
              - listitem [ref=e301]:
                - link "Careers" [ref=e302]:
                  - /url: /about/careers
              - listitem [ref=e303]:
                - link "Media and Investor Relations" [ref=e304]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e306]:
            - heading "Connect With Us" [level=2] [ref=e307]
            - generic [ref=e309]:
              - link "Facebook (opens in a new tab)" [ref=e310]:
                - /url: fb://profile/MattamyHomesUSA
                - img [ref=e311]
              - link "Instagram (opens in a new tab)" [ref=e313]:
                - /url: instagram://user?username=mattamyhomesusa
                - img [ref=e314]
              - link "Youtube (opens in a new tab)" [ref=e316]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e317]
              - link "Pinterest (opens in a new tab)" [ref=e319]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e320]
              - link "Linkedin (opens in a new tab)" [ref=e322]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e323]
        - generic [ref=e326]:
          - paragraph [ref=e327]:
            - link "Accessibility" [ref=e328]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e329]: "|"
            - button "Cookie Settings" [ref=e330] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e331]: "|"
            - link "Legal Disclaimers" [ref=e332]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e333]: "|"
            - link "Privacy Policy" [ref=e334]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e335]: "|"
            - link "Terms and Conditions" [ref=e336]:
              - /url: /terms-and-conditions
              - text: Terms and Conditions
              - generic [ref=e337]: "|"
            - link "About Us" [ref=e338]:
              - /url: /about/about-mattamy
          - paragraph [ref=e339]:
            - img "copyright disclaimer logo" [ref=e340]
            - text: Copyright © 2025 Mattamy Homes. All rights reserved.
```

# Test source

```ts
  558 |       .then(() => true)
  559 |       .catch(() => false);
  560 | 
  561 |     return (await this.requireFeature(present || null, feature, description)) !== null;
  562 |   }
  563 | 
  564 |   /**
  565 |    * Same decision as isFeaturePresent, for callers that already resolved the
  566 |    * element themselves. Returns the value, or null when declared optional.
  567 |    */
  568 |   protected async requireFeature<T>(
  569 |     value: T | null | undefined,
  570 |     feature: FeatureKey,
  571 |     description: string,
  572 |   ): Promise<T | null> {
  573 |     const { value: resolved, skipMessage } = resolveFeature(
  574 |       value,
  575 |       feature,
  576 |       description,
  577 |       this.locationKey,
  578 |       this.page.url(),
  579 |     );
  580 | 
  581 |     if (skipMessage) {
  582 |       await this.reportValue(skipMessage);
  583 |     }
  584 | 
  585 |     return resolved;
  586 |   }
  587 | 
  588 |   /**
  589 |    * Returns the first candidate locator that works, falling back down the list.
  590 |    *
  591 |    * When nothing matches, the primary locator comes back so the test still fails
  592 |    * on the real selector. Every heal is reported as selector drift: a run kept
  593 |    * green by a fallback still means the app changed, and someone has to see that.
  594 |    */
  595 |   protected async healLocator(
  596 |     label: string,
  597 |     candidates: SelfHealingLocatorCandidate[],
  598 |     options: SelfHealingLocatorOptions = {},
  599 |   ): Promise<Locator> {
  600 |     if (candidates.length === 0) {
  601 |       throw new Error(`No self-healing locator candidates provided for ${label}`);
  602 |     }
  603 | 
  604 |     const minimumCount = options.minimumCount ?? 1;
  605 |     const state = options.state ?? 'visible';
  606 |     const timeout = options.timeout ?? 750;
  607 |     const primary = candidates[0];
  608 | 
  609 |     for (const [index, candidate] of candidates.entries()) {
  610 |       const locator = candidate.locator;
  611 |       const count = await locator.count().catch(() => 0);
  612 | 
  613 |       if (count < minimumCount) {
  614 |         continue;
  615 |       }
  616 | 
  617 |       const isUsable = await locator
  618 |         .first()
  619 |         .waitFor({ state, timeout })
  620 |         .then(() => true)
  621 |         .catch(() => false);
  622 | 
  623 |       if (!isUsable) {
  624 |         continue;
  625 |       }
  626 | 
  627 |       if (index > 0) {
  628 |         await reportSelectorDrift(label, primary.selector, candidate.selector);
  629 |       }
  630 | 
  631 |       return locator;
  632 |     }
  633 | 
  634 |     await this.reportValue(
  635 |       `Self-healing fallback not found: ${label}`,
  636 |       `Using primary selector so the test fails normally: ${primary.selector}`,
  637 |     );
  638 | 
  639 |     return primary.locator;
  640 |   }
  641 | 
  642 |   // Shared Assertions
  643 | 
  644 |   /** Checks we actually landed on a page and not about:blank. */
  645 |   protected async assertPageLoaded(label = 'Page should be loaded'): Promise<void> {
  646 |     await test.step(label, async () => {
  647 |       await this.waitForPageReady();
  648 |       await expect(this.page, label).not.toHaveURL(/about:blank/i);
  649 |     });
  650 |   }
  651 | 
  652 |   /** Checks the browser tab title. */
  653 |   protected async assertPageTitle(
  654 |     expectedTitle: string | RegExp,
  655 |     label = 'Page title should match expected value',
  656 |   ): Promise<void> {
  657 |     await test.step(label, async () => {
> 658 |       await expect(this.page, label).toHaveTitle(expectedTitle);
      |                                      ^ Error: USA Customer Care page title should match
  659 |     });
  660 |   }
  661 | 
  662 |   /** Checks the current URL. */
  663 |   protected async assertPageUrl(
  664 |     expectedUrl: string | RegExp,
  665 |     label = 'Page URL should match expected value',
  666 |     timeout = 60_000,
  667 |   ): Promise<void> {
  668 |     await test.step(label, async () => {
  669 |       await expect(this.page, label).toHaveURL(expectedUrl, { timeout });
  670 |     });
  671 |   }
  672 | 
  673 |   /** Checks the current URL contains this fragment. */
  674 |   protected async assertPageUrlContains(
  675 |     expectedUrlPart: string,
  676 |     label = `Page URL should contain: ${expectedUrlPart}`,
  677 |     timeout = 60_000,
  678 |   ): Promise<void> {
  679 |     await this.assertPageUrl(new RegExp(escapeRegex(expectedUrlPart), 'i'), label, timeout);
  680 |   }
  681 | 
  682 |   /** Checks we did not end up on an unexpected URL. */
  683 |   protected async assertPageUrlDoesNotMatch(
  684 |     unexpectedUrl: string | RegExp,
  685 |     label = 'Page URL should not match unexpected value',
  686 |   ): Promise<void> {
  687 |     await test.step(label, async () => {
  688 |       await expect(this.page, label).not.toHaveURL(unexpectedUrl);
  689 |     });
  690 |   }
  691 | 
  692 |   /** Checks an element is visible on screen. */
  693 |   protected async assertVisible(
  694 |     locator: Locator,
  695 |     label = 'Element should be visible',
  696 |     timeout = 10_000,
  697 |   ): Promise<void> {
  698 |     await test.step(label, async () => {
  699 |       await expect(locator, label).toBeVisible({ timeout });
  700 |     });
  701 |   }
  702 | 
  703 |   /** Checks an element is in the DOM, whether or not it is on screen. */
  704 |   protected async assertAttached(
  705 |     locator: Locator,
  706 |     label = 'Element should be attached',
  707 |     timeout = 10_000,
  708 |   ): Promise<void> {
  709 |     await test.step(label, async () => {
  710 |       await expect(locator, label).toBeAttached({ timeout });
  711 |     });
  712 |   }
  713 | 
  714 |   /** Checks an element's text contains what we expect. */
  715 |   protected async assertTextContains(
  716 |     locator: Locator,
  717 |     expectedText: string | RegExp,
  718 |     label = 'Element should contain expected text',
  719 |     timeout = 10_000,
  720 |   ): Promise<void> {
  721 |     await test.step(label, async () => {
  722 |       await expect(locator, label).toContainText(expectedText, { timeout });
  723 |     });
  724 |   }
  725 | 
  726 |   /** Checks an element's text matches exactly. */
  727 |   protected async assertText(
  728 |     locator: Locator,
  729 |     expectedText: string | RegExp,
  730 |     label = 'Element text should match expected value',
  731 |     timeout = 10_000,
  732 |   ): Promise<void> {
  733 |     await test.step(label, async () => {
  734 |       await expect(locator, label).toHaveText(expectedText, { timeout });
  735 |     });
  736 |   }
  737 | 
  738 |   /** Checks the text appears somewhere on the page. */
  739 |   protected async assertBodyContains(
  740 |     expectedText: string | RegExp,
  741 |     label = 'Page body should contain expected text',
  742 |     timeout = 10_000,
  743 |   ): Promise<void> {
  744 |     await this.assertTextContains(this.page.locator('body'), expectedText, label, timeout);
  745 |   }
  746 | 
  747 |   /** Checks the page shows an H1. */
  748 |   protected async assertHeadingVisible(
  749 |     expectedName?: string | RegExp,
  750 |     label = 'Page heading should be visible',
  751 |     timeout = 20_000,
  752 |   ): Promise<void> {
  753 |     const heading = expectedName
  754 |       ? this.page.getByRole('heading', { level: 1, name: expectedName }).first()
  755 |       : this.page.locator('h1').first();
  756 | 
  757 |     await this.assertVisible(heading, label, timeout);
  758 |   }
```