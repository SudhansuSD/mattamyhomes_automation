# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: planPage.spec.ts >> Plan Detail Page Tests - CAN >> UI & Functional Validation >> @regression | CAN | Validate Plan Detail page media and interactive sections
- Location: tests/planPage.spec.ts:64:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('iframe[title*="Floorplan" i]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('iframe[title*="Floorplan" i]').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e6]:
    - paragraph [ref=e11]:
      - strong [ref=e13]: Limited Time Offer - FREE Finished Basement Upgrade
  - generic [ref=e15]:
    - banner [ref=e17]:
      - generic [ref=e18]:
        - link "Fullerton Plan Mattamy logo at Yorkville in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e19]:
          - /url: /
          - figure [ref=e20]:
            - img "Fullerton Plan Mattamy logo at Yorkville in Calgary Alberta by Mattamy Homes" [ref=e21]
        - button "Navigation menu." [ref=e22] [cursor=pointer]:
          - img [ref=e23]
    - link "Navigate to Top." [ref=e25] [cursor=pointer]:
      - img [ref=e26]
    - main [ref=e28]:
      - link "Go to Yorkville" [ref=e34]:
        - /url: /alberta/calgary/calgary/yorkville
        - text: Yorkville
      - 'region "Images and videos of: Fullerton" [ref=e38]':
        - generic [ref=e41]:
          - img [ref=e46]
          - img "2 story detached Craftsman style home with light beige exterior, grey roof, white trim, many windows, front porch, double car garage" [ref=e51]
          - iframe [ref=e56]
          - img [ref=e61]
          - img [ref=e66]
          - img [ref=e71]
          - img [ref=e76]
          - img [ref=e81]
          - img [ref=e86]
          - img [ref=e91]
          - img [ref=e96]
          - img [ref=e101]
          - img [ref=e106]
          - img [ref=e111]
          - img [ref=e116]
          - img [ref=e121]
          - img [ref=e126]
        - radiogroup "Content type" [ref=e127] [cursor=pointer]:
          - radio "Select 360 Toursfilter" [ref=e128]:
            - img [ref=e130]
            - generic [ref=e133]: 360 Tours
          - radio "Select Photosfilter" [ref=e134]:
            - img [ref=e136]
            - generic [ref=e139]: Photos
        - paragraph [ref=e141]: Model Home
        - paragraph [ref=e143]: 1/15
      - generic [ref=e145]:
        - generic [ref=e146]:
          - heading "Fullerton" [level=1] [ref=e149]:
            - generic [ref=e150]: Fullerton
          - paragraph [ref=e151]:
            - generic [ref=e152]: 3 Beds|
            - generic [ref=e153]: 2 Baths|
            - generic [ref=e154]: 1 Half Bath
          - paragraph [ref=e155]:
            - generic [ref=e156]: 2,043 Sq. Ft.|
            - generic [ref=e157]: 2 Car Garage
            - generic [ref=e158]: "|"
            - generic [ref=e159]: 36' Single Family Home
        - generic [ref=e160]:
          - paragraph [ref=e161]: Starting from
          - paragraph [ref=e162]:
            - generic [ref=e163]: $716,990
          - generic [ref=e164]:
            - img "Calculator Icon" [ref=e165]
            - button "Monthly Mortgage $3,203" [ref=e173] [cursor=pointer]
            - img [ref=e174]
            - button [ref=e176] [cursor=pointer]:
              - img [ref=e177]
      - generic [ref=e181]:
        - heading "Interactive Floorplan" [level=2] [ref=e182]
        - generic [ref=e184]: The floorplan below is keyboard accessible with consideration for colour contrast and button sizes. A text alternative document, complete with full floorplan dimensions, features and details, to be used with a screen reader, is available upon request for any floorplan. Please contact accessibility@mattamycorp.com to request a text alternative document of this floorplan. Please note, this is not a sales email. For information regarding purchasing, please visit our Contact Us Page. Any emails requesting sales information sent to accessibility@mattamycorp.com, will be disregarded.
        - button "View Floorplan" [ref=e186] [cursor=pointer]:
          - generic [ref=e187]: View Floorplan
      - generic [ref=e188]:
        - generic [ref=e189]:
          - heading "Exterior Styles" [level=2] [ref=e190]
          - generic [ref=e191]: Exterior styles to suit your personal taste.
        - generic [ref=e196]:
          - figure [ref=e200]:
            - img "2 story detached Craftsman style home with light beige exterior, grey roof, white trim, many windows, front porch, double car garage" [ref=e202]
            - generic [ref=e203]: craftsman
          - figure [ref=e207]:
            - img [ref=e209]
            - generic [ref=e210]: georgian-colonial
          - figure [ref=e214]:
            - img [ref=e216]
            - generic [ref=e217]: prairie
      - generic [ref=e220]:
        - generic [ref=e221]:
          - heading "Home Design Details" [level=2] [ref=e222]
          - button "Collapse Information" [expanded] [ref=e223] [cursor=pointer]
        - generic [ref=e228]:
          - generic [ref=e229]: As part of our WideLotTM collection and largest of our 36’ single-family, the Fullerton was uniquely designed to reimagine livability, with shorter hallways and brighter windows. The open-concept main floor seamlessly flows together, with a functi...
          - button "Show more" [ref=e230] [cursor=pointer]: More+
      - generic [ref=e234]:
        - heading "Home Features" [level=2] [ref=e235]
        - button "Expand for more information" [ref=e236] [cursor=pointer]
      - generic [ref=e242]:
        - paragraph [ref=e244]: Mortgage Calculator
        - button "Get Started Expand calculator" [ref=e247] [cursor=pointer]:
          - generic [ref=e248]: Get Started
      - generic [ref=e252]:
        - generic [ref=e253]:
          - heading "We're with you all the way to the front door" [level=2] [ref=e254]
          - button "Collapse Information" [expanded] [ref=e255] [cursor=pointer]
        - generic [ref=e259]:
          - generic [ref=e260]: Mattamy Homes focuses every part of the homebuying experience around you, and obtaining financing is no exception. Mattamy financing partners work closely with you throughout the process — ensuring coordination, communication and peace of mind.
          - link "Learn More" [ref=e261]:
            - /url: /homebuying/financing
            - button "Learn More" [ref=e262] [cursor=pointer]:
              - generic [ref=e263]: Learn More
      - generic [ref=e264]:
        - generic [ref=e268]:
          - heading "Quick Move-In Homes ready when you are" [level=2] [ref=e269]
          - generic [ref=e270]: If time is of the essence, then our Quick Move-In Homes are for you.
        - generic [ref=e272]:
          - generic [ref=e273]:
            - paragraph [ref=e276]: Ready Now
            - generic [ref=e278]:
              - link "Rendering of the Prairie elevation for the Fullerton Model" [ref=e281]:
                - /url: /alberta/calgary/calgary/yorkville/fullerton/48-yorkstone-crescent-sw
                - img "Rendering of the Prairie elevation for the Fullerton Model" [ref=e284]
              - link "View 48 Yorkstone Crescent SW information.Fullerton Floorplan | Detached 2,043 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage $698,990" [ref=e286]:
                - /url: /alberta/calgary/calgary/yorkville/fullerton/48-yorkstone-crescent-sw
                - generic [ref=e287]: 48 Yorkstone Crescent SW
                - generic [ref=e288]: Fullerton Floorplan | Detached
                - generic [ref=e291]:
                  - paragraph [ref=e293]: 2,043 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e295]: 1 Half Bath|2 Car Garage
                  - paragraph [ref=e297]: $698,990
              - button "Mark as favorite" [ref=e298] [cursor=pointer]:
                - img "Favorite Icon" [ref=e299]
          - generic [ref=e301]:
            - link "View all" [ref=e302] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
              - generic [ref=e303]: View all
            - paragraph [ref=e304]: Showing 1 of 1 quick move-in homes
      - generic [ref=e308]:
        - generic [ref=e310]:
          - generic [ref=e312]:
            - heading "Showhome Parade" [level=3] [ref=e313]
            - generic [ref=e315]:
              - generic [ref=e316]:
                - img [ref=e318]
                - link "Go to 19515 Sheriff King Street SW Calgary Alberta T2X 0T9. Opens in Googlemaps" [ref=e321]:
                  - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
                  - text: Directions
              - generic [ref=e322]:
                - img [ref=e324]
                - link "Call to 403-471-1538" [ref=e326]:
                  - /url: tel:403-471-1538
                  - text: Call
          - generic [ref=e327]:
            - heading "Hours" [level=3] [ref=e328]
            - generic [ref=e329]:
              - img [ref=e331]
              - button "Show Schedule" [ref=e334] [cursor=pointer]:
                - paragraph [ref=e335]: Closed Now
                - img [ref=e337]
        - generic [ref=e340]:
          - generic [ref=e341]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e342]
            - generic [ref=e344]: Required fields are marked with *
            - separator [ref=e345]
          - group [ref=e346]:
            - generic [ref=e347]:
              - textbox [ref=e348]
              - textbox "company" [ref=e349]:
                - /placeholder: ""
              - generic [ref=e350]:
                - generic [ref=e351]: First name *
                - textbox "First name" [ref=e353]:
                  - /placeholder: ""
              - generic [ref=e354]:
                - generic [ref=e355]: Last name *
                - textbox "Last name" [ref=e357]:
                  - /placeholder: ""
              - generic [ref=e358]:
                - generic [ref=e359]: Email *
                - textbox "Email" [ref=e361]:
                  - /placeholder: ""
              - generic [ref=e362]:
                - generic [ref=e363]: Country of Residence *
                - generic [ref=e364]:
                  - combobox "Country of Residence" [ref=e365] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "Canada"
                    - option "United States"
                    - option "Other"
                  - generic:
                    - img
              - generic [ref=e366]:
                - generic [ref=e367]: Zip/Postal Code *
                - textbox "Zip/Postal Code" [ref=e369]:
                  - /placeholder: ""
              - generic [ref=e370]:
                - generic [ref=e371]: Phone number
                - textbox "Phone number" [ref=e373]:
                  - /placeholder: ""
              - generic [ref=e374]:
                - generic [ref=e375]:
                  - text: When do you want to move into your home?
                  - generic [ref=e376]: "*"
                - generic [ref=e377]:
                  - combobox "When do you want to move into your home?" [ref=e378] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "0-3 Months"
                    - option "3-6 Months"
                    - option "6-12 Months"
                    - option "12+ Months"
                  - generic:
                    - img
              - generic [ref=e379]:
                - generic [ref=e380]:
                  - text: Are you a first time homebuyer?
                  - generic [ref=e381]: "*"
                - generic [ref=e382]:
                  - combobox "Are you a first time homebuyer?" [ref=e383] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "No"
                    - option "Yes"
                  - generic:
                    - img
              - generic [ref=e384]:
                - generic [ref=e385]:
                  - text: How many bedrooms do you need?
                  - generic [ref=e386]: "*"
                - generic [ref=e387]:
                  - combobox "How many bedrooms do you need?" [ref=e388] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "1"
                    - option "2"
                    - option "3"
                    - option "4"
                    - option "5+"
                  - generic:
                    - img
              - generic [ref=e389]:
                - generic [ref=e390]:
                  - text: What is your budget?
                  - generic [ref=e391]: "*"
                - generic [ref=e392]:
                  - combobox "What is your budget?" [ref=e393] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "$200,000 - $299,000"
                    - option "$300,000 - $399,000"
                    - option "$400,000 - $499,000"
                    - option "$500,000 - $599,000"
                    - option "$600,000 - $699,000"
                    - option "$700,000 - $799,000"
                    - option "$800,000 - $899,000"
                    - option "$900,000 - $999,000"
                    - option "$1M - $1.25M"
                    - option "$1.25M - $1.5M"
                    - option "$1.5M - $2M"
                    - option "$2M+"
                  - generic:
                    - img
              - generic [ref=e395] [cursor=pointer]:
                - checkbox "I am a Real Estate Agent" [ref=e396]
                - generic [ref=e397]: I am a Real Estate Agent
              - generic [ref=e399] [cursor=pointer]:
                - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e400]'
                - generic [ref=e401]:
                  - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                  - link "SMS Privacy Policy" [ref=e402]:
                    - /url: /sms-privacy-policy
                  - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                  - link "Privacy Policy" [ref=e403]:
                    - /url: /privacy-policy
                  - text: ","
                  - link "SMS Privacy Policy" [ref=e404]:
                    - /url: /sms-privacy-policy
                  - text: ","
                  - link "SMS Terms of Service" [ref=e405]:
                    - /url: /sms-terms-of-service
                  - text: ", and/or"
                  - link "Contact Us" [ref=e406]:
                    - /url: /contact-us
                  - text: .
              - button "SUBMIT" [ref=e408] [cursor=pointer]
      - generic [ref=e410]: test test test
      - generic [ref=e413] [cursor=pointer]:
        - button "New home rebates available!" [ref=e414]:
          - generic [ref=e416]:
            - img "Click Here New home rebates available!" [ref=e419]
            - generic [ref=e422]: click here
        - generic [ref=e423]: "1"
        - img [ref=e425]
      - generic [ref=e427]:
        - generic [ref=e429]: Fullerton
        - generic [ref=e430]:
          - link "Contact Us" [ref=e431] [cursor=pointer]:
            - generic [ref=e432]: Contact Us
          - link "Get Information" [ref=e433] [cursor=pointer]:
            - generic [ref=e434]: Get Information
      - button "View promotions" [ref=e436] [cursor=pointer]:
        - generic [ref=e437]: View promotions
        - img [ref=e438]
    - contentinfo "footer" [ref=e440]:
      - generic [ref=e442]:
        - generic [ref=e443]:
          - generic [ref=e444]:
            - heading "Explore" [level=2] [ref=e445]
            - list [ref=e447]:
              - listitem [ref=e448]:
                - link "Mattamy Homes USA" [ref=e449]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e450]:
                - link "Mattamy Homes Canada" [ref=e451]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e452]:
                - link "Design Studio" [ref=e453]:
                  - /url: /design-studio
              - listitem [ref=e454]:
                - link "Customer Care" [ref=e455]:
                  - /url: /customer-care
          - generic [ref=e457]:
            - heading "About Mattamy" [level=2] [ref=e458]
            - list [ref=e460]:
              - listitem [ref=e461]:
                - link "About Us" [ref=e462]:
                  - /url: /about/about-mattamy
              - listitem [ref=e463]:
                - link "Contact Us" [ref=e464]:
                  - /url: /contact
              - listitem [ref=e465]:
                - link "Careers" [ref=e466]:
                  - /url: /about/careers
              - listitem [ref=e467]:
                - link "Media and Investor Relations" [ref=e468]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e470]:
            - heading "Connect With Us" [level=2] [ref=e471]
            - generic [ref=e473]:
              - link "Facebook (opens in a new tab)" [ref=e474]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e475]
              - link "Instagram (opens in a new tab)" [ref=e477]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e478]
              - link "Youtube (opens in a new tab)" [ref=e480]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e481]
              - link "Pinterest (opens in a new tab)" [ref=e483]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e484]
              - link "Linkedin (opens in a new tab)" [ref=e486]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e487]
        - generic [ref=e490]:
          - paragraph [ref=e491]:
            - link "Accessibility" [ref=e492]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e493]: "|"
            - button "Cookie Settings" [ref=e494] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e495]: "|"
            - link "Legal Disclaimers" [ref=e496]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e497]: "|"
            - link "Privacy Policy" [ref=e498]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e499]: "|"
            - link "Terms and Conditions" [ref=e500]:
              - /url: /terms-and-conditions
          - paragraph [ref=e501]: ©2024 Mattamy Homes
```

# Test source

```ts
  427 |     await this.step('Verify plan media gallery', async () => {
  428 |       const gallery = this.page
  429 |         .locator(
  430 |           '[role="region"][aria-label*="Images and videos" i], [role="region"][aria-label*="gallery" i]',
  431 |         )
  432 |         .first();
  433 | 
  434 |       if (!(await this.isFeaturePresent(gallery, 'plan.mediaGallery', 'Plan media gallery'))) {
  435 |         return;
  436 |       }
  437 | 
  438 |       await gallery.scrollIntoViewIfNeeded();
  439 | 
  440 |       const tabNames = [/^Videos$/i, /^360 Tours$/i, /^Photos$/i, /^Model Home$/i];
  441 |       let validatedTabs = 0;
  442 | 
  443 |       for (const tabName of tabNames) {
  444 |         const tab = this.page
  445 |           .locator('button:visible, a:visible')
  446 |           .filter({ hasText: tabName })
  447 |           .first();
  448 | 
  449 |         if (!(await tab.isVisible({ timeout: 1500 }).catch(() => false))) {
  450 |           continue;
  451 |         }
  452 | 
  453 |         await tab.scrollIntoViewIfNeeded();
  454 |         await tab.click();
  455 |         await this.waitForPageReady();
  456 |         await this.settle(500);
  457 | 
  458 |         const visibleMedia = this.page
  459 |           .locator('img:visible, video:visible, iframe:visible, canvas:visible')
  460 |           .first();
  461 | 
  462 |         await expect(
  463 |           visibleMedia,
  464 |           `${tabName.source} gallery tab should render visible media`,
  465 |         ).toBeVisible({ timeout: 10000 });
  466 |         validatedTabs++;
  467 |       }
  468 | 
  469 |       if (validatedTabs) {
  470 |         await this.reportValue(`Validated ${validatedTabs} plan gallery media tab(s)`);
  471 |         return;
  472 |       }
  473 | 
  474 |       // No named tabs on this plan - it renders a plain carousel. Assert that
  475 |       // the gallery actually shows media rather than returning having checked
  476 |       // nothing, which is what the tab-only version did here.
  477 |       await expect(
  478 |         gallery.locator('img:visible, video:visible, iframe:visible').first(),
  479 |         'Plan media gallery should render visible media',
  480 |       ).toBeVisible({ timeout: 10000 });
  481 | 
  482 |       await this.reportValue('Plan gallery renders a media carousel (no named media tabs)');
  483 |     });
  484 |   }
  485 | 
  486 |   /** Checks the floorplan section is visible. */
  487 |   async verifyFloorPlan() {
  488 |     await this.step('Verify floorplan section', async () => {
  489 |       if (await isLocatorVisible(this.floorPlanSection)) {
  490 |         await this.floorPlanSection.scrollIntoViewIfNeeded();
  491 |         await expect(this.floorPlanSection).toBeVisible();
  492 |       }
  493 |     });
  494 |   }
  495 | 
  496 |   /** Checks the interactive floorplan matches the plan, including its embedded viewer. */
  497 |   async verifyInteractiveFloorPlan(plan: PlanDetails): Promise<void> {
  498 |     await this.step('Verify interactive floorplan', async () => {
  499 |       await this.floorPlanSection.scrollIntoViewIfNeeded();
  500 |       await expect(
  501 |         this.page.getByRole('heading', { name: /Interactive Floorplan/i }),
  502 |       ).toBeVisible();
  503 | 
  504 |       if (plan.floorPlanFrameUrlPart) {
  505 |         const iframe = this.page.locator('iframe[title*="Floorplan" i]').first();
  506 |         await expect(iframe).toBeVisible();
  507 |         await expect(iframe).toHaveAttribute(
  508 |           'src',
  509 |           new RegExp(escapeRegex(plan.floorPlanFrameUrlPart), 'i'),
  510 |         );
  511 |       }
  512 |     });
  513 |   }
  514 | 
  515 |   /** Checks the interactive floorplan section is available. */
  516 |   async verifyInteractiveFloorPlanSection(): Promise<void> {
  517 |     await this.step('Verify interactive floorplan section', async () => {
  518 |       const floorPlanHeading = this.page
  519 |         .getByRole('heading', {
  520 |           name: /Interactive Floorplan/i,
  521 |         })
  522 |         .first();
  523 | 
  524 |       if (await isLocatorVisible(floorPlanHeading)) {
  525 |         await floorPlanHeading.scrollIntoViewIfNeeded();
  526 |         await expect(floorPlanHeading).toBeVisible();
> 527 |         await expect(this.page.locator('iframe[title*="Floorplan" i]').first()).toBeVisible();
      |                                                                                 ^ Error: expect(locator).toBeVisible() failed
  528 |       } else {
  529 |         await this.reportValue('Interactive floorplan section not present - skipping validation');
  530 |       }
  531 |     });
  532 |   }
  533 | 
  534 |   /** Checks each configured exterior style is shown. */
  535 |   async verifyExteriorStyles(styles: string[]): Promise<void> {
  536 |     await this.step('Verify exterior styles', async () => {
  537 |       await this.exteriorStylesSection.scrollIntoViewIfNeeded();
  538 |       await expect(this.page.getByRole('heading', { name: /Exterior Styles/i })).toBeVisible();
  539 | 
  540 |       for (const style of styles) {
  541 |         await expect(this.page.getByText(style, { exact: false }).first()).toBeVisible();
  542 |       }
  543 |     });
  544 |   }
  545 | 
  546 |   /** Checks the exterior styles section is visible. */
  547 |   async verifyExteriorStylesSection(): Promise<void> {
  548 |     await this.step('Verify exterior styles section', async () => {
  549 |       const exteriorHeading = this.page
  550 |         .getByRole('heading', {
  551 |           name: /Exterior Styles/i,
  552 |         })
  553 |         .first();
  554 | 
  555 |       if (await isLocatorVisible(exteriorHeading)) {
  556 |         await exteriorHeading.scrollIntoViewIfNeeded();
  557 |         await expect(exteriorHeading).toBeVisible();
  558 |       } else {
  559 |         await this.reportValue('Exterior Styles section not present - skipping validation');
  560 |       }
  561 |     });
  562 |   }
  563 | 
  564 |   /** Checks the mortgage calculator opens from its CTA and closes again. */
  565 |   async verifyMortgageForm() {
  566 |     await this.step('Verify mortgage form CTA', async () => {
  567 |       if (await isLocatorVisible(this.mortgageBtn)) {
  568 |         await this.mortgageBtn.scrollIntoViewIfNeeded();
  569 |         await this.mortgageBtn.click();
  570 | 
  571 |         if (await isLocatorVisible(this.closeModalBtn)) {
  572 |           await this.closeModalBtn.click();
  573 |         }
  574 |       }
  575 |     });
  576 |   }
  577 | 
  578 |   /** Checks the mortgage calculator CTA is visible. */
  579 |   async verifyMortgageCalculatorCta(): Promise<void> {
  580 |     await this.step('Verify mortgage calculator CTA', async () => {
  581 |       const mortgageTitle = this.page.getByText(/Mortgage Calculator/i).first();
  582 | 
  583 |       if (await isLocatorVisible(mortgageTitle)) {
  584 |         await mortgageTitle.scrollIntoViewIfNeeded();
  585 |         await expect(mortgageTitle).toBeVisible();
  586 |         await expect(this.mortgageBtn.first()).toBeVisible();
  587 |       } else {
  588 |         await this.reportValue('Mortgage Calculator section not present - skipping validation');
  589 |       }
  590 |     });
  591 |   }
  592 | 
  593 |   /** Checks the quick move-in homes section and records the homes and View All link. */
  594 |   async verifyQMISection() {
  595 |     await this.step('Verify QMI section', async () => {
  596 |       const qmiSection = await this.availableHomesSection();
  597 | 
  598 |       if (await isLocatorVisible(qmiSection)) {
  599 |         await qmiSection.scrollIntoViewIfNeeded();
  600 |         await this.waitForPageReady();
  601 | 
  602 |         const qmiHomeslist = this.qmiHomeLinks(qmiSection);
  603 |         const viewAllQMIButton = this.viewAllQmiButton(qmiSection);
  604 |         const qmiCount = await qmiHomeslist.count();
  605 | 
  606 |         await this.reportValue('Number of QMI Homes listed', qmiCount);
  607 |         if (qmiCount === 0) {
  608 |           await this.reportValue('QMI section has no home cards - skipping card validation');
  609 |           return;
  610 |         }
  611 | 
  612 |         for (let i = 0; i < qmiCount; i++) {
  613 |           const homeLink = qmiHomeslist.nth(i);
  614 |           const homeHref = await homeLink.getAttribute('href');
  615 |           expect(homeHref).toBeTruthy();
  616 |           await this.reportValue(`QMI Home ${i + 1}`, this.buildFullUrl(homeHref));
  617 |         }
  618 | 
  619 |         if ((await viewAllQMIButton.count()) > 0) {
  620 |           await expect(viewAllQMIButton).toBeVisible();
  621 | 
  622 |           const href = await viewAllQMIButton.getAttribute('href');
  623 |           await this.reportValue('View All QMI URL', href);
  624 |         } else {
  625 |           await this.reportValue('View All link not visible');
  626 |         }
  627 |       } else {
```