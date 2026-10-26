# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: QMIPage.spec.ts >> QMI Detail Page Tests - CAN >> Media & Content >> @regression | CAN | Validate QMI home details and features
- Location: tests/QMIPage.spec.ts:76:9

# Error details

```
Error: Home Features should list at least one feature

expect(received).toBeGreaterThan(expected)

Expected: > 3
Received:   0
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
        - link "48 Yorkstone Crescent Sw Quick Move-In Mattamy logo at Yorkville in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e19]:
          - /url: /
          - figure [ref=e20]:
            - img "48 Yorkstone Crescent Sw Quick Move-In Mattamy logo at Yorkville in Calgary Alberta by Mattamy Homes" [ref=e21]
        - button "Navigation menu." [ref=e22] [cursor=pointer]:
          - img [ref=e23]
    - link "Navigate to Top." [ref=e25] [cursor=pointer]:
      - img [ref=e26]
    - main [ref=e28]:
      - link "Go to Fullerton" [ref=e34]:
        - /url: /alberta/calgary/calgary/yorkville/fullerton
        - text: Fullerton
      - 'region "Images and videos of: 48 Yorkstone Crescent SW" [ref=e38]':
        - img "Rendering of the Prairie elevation for the Fullerton Model" [ref=e46]
        - paragraph [ref=e48]: Ready Now
      - generic [ref=e50]:
        - generic [ref=e51]:
          - link "48 Yorkstone Crescent SW" [ref=e53]:
            - /url: /alberta/calgary/calgary/yorkville/fullerton/48-yorkstone-crescent-sw#sitemap
            - heading "48 Yorkstone Crescent SW" [level=1] [ref=e54]:
              - generic [ref=e55]: 48 Yorkstone Crescent SW
          - paragraph [ref=e56]:
            - generic [ref=e57]: 3 Beds|
            - generic [ref=e58]: 2 Baths|
            - generic [ref=e59]: 1 Half Bath
          - paragraph [ref=e60]:
            - generic [ref=e61]: 2,043 Sq. Ft.|
            - generic [ref=e62]: 2 Car Garage
        - generic [ref=e63]:
          - paragraph [ref=e64]:
            - generic [ref=e65]: $698,990
          - generic [ref=e66]:
            - img "Calculator Icon" [ref=e67]
            - button "Monthly Mortgage $3,123" [ref=e75] [cursor=pointer]
            - img [ref=e76]
            - button [ref=e78] [cursor=pointer]:
              - img [ref=e79]
      - generic [ref=e83]:
        - heading "Interactive Floorplan" [level=2] [ref=e84]
        - generic [ref=e86]: The floorplan below is keyboard accessible with consideration for colour contrast and button sizes. A text alternative document, complete with full floorplan dimensions, features and details, to be used with a screen reader, is available upon request for any floorplan. Please contact accessibility@mattamycorp.com to request a text alternative document of this floorplan. Please note, this is not a sales email. For information regarding purchasing, please visit our Contact Us Page. Any emails requesting sales information sent to accessibility@mattamycorp.com, will be disregarded.
        - button "View Floorplan" [ref=e88] [cursor=pointer]:
          - generic [ref=e89]: View Floorplan
      - generic [ref=e91]:
        - heading "Explore the community" [level=2] [ref=e92]
        - generic [ref=e93]: Take a closer look at the community sitemap and get familiar with our available offerings.
        - button "VIEW SITEMAP" [ref=e94] [cursor=pointer]:
          - generic [ref=e95]: VIEW SITEMAP
      - generic [ref=e98]:
        - generic [ref=e99]:
          - heading "Home Design Details" [level=2] [ref=e100]
          - button "Collapse Information" [expanded] [ref=e101] [cursor=pointer]
        - generic [ref=e106]:
          - paragraph [ref=e109]: The Fullerton offers 2043 sq. ft in the Yorkville community in Calgary. This 3 bedroom, 2.5 bath with Double attached Garage home includes 8 Solar panels and design Studio finishes like 9ft basement foundation, Side entry, quartz countertops, luxu...
          - button "Show more" [ref=e110] [cursor=pointer]: More+
      - generic [ref=e114]:
        - heading "Home Features" [level=2] [ref=e115]
        - button "Expand for more information" [ref=e116] [cursor=pointer]
      - generic [ref=e122]:
        - paragraph [ref=e124]: Mortgage Calculator
        - button "Get Started Expand calculator" [ref=e127] [cursor=pointer]:
          - generic [ref=e128]: Get Started
      - generic [ref=e133]:
        - heading "We're with you all the way to the front door" [level=2] [ref=e134]
        - button "Expand for more information" [ref=e135] [cursor=pointer]
      - generic [ref=e141]:
        - generic [ref=e143]:
          - generic [ref=e145]:
            - heading "Showhome Parade" [level=3] [ref=e146]
            - generic [ref=e148]:
              - generic [ref=e149]:
                - img [ref=e151]
                - link "Go to 19515 Sheriff King Street SW Calgary Alberta T2X 0T9. Opens in Googlemaps" [ref=e154]:
                  - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
                  - text: Directions
              - generic [ref=e155]:
                - img [ref=e157]
                - link "Call to 403-471-1538" [ref=e159]:
                  - /url: tel:403-471-1538
                  - text: Call
          - generic [ref=e160]:
            - heading "Hours" [level=3] [ref=e161]
            - generic [ref=e162]:
              - img [ref=e164]
              - button "Show Schedule" [ref=e167] [cursor=pointer]:
                - paragraph [ref=e168]: Closed Now
                - img [ref=e170]
        - generic [ref=e173]:
          - generic [ref=e174]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e175]
            - generic [ref=e177]: Required fields are marked with *
            - separator [ref=e178]
          - group [ref=e179]:
            - generic [ref=e180]:
              - textbox [ref=e181]
              - textbox "company" [ref=e182]:
                - /placeholder: ""
              - generic [ref=e183]:
                - generic [ref=e184]: First name *
                - textbox "First name" [ref=e186]:
                  - /placeholder: ""
              - generic [ref=e187]:
                - generic [ref=e188]: Last name *
                - textbox "Last name" [ref=e190]:
                  - /placeholder: ""
              - generic [ref=e191]:
                - generic [ref=e192]: Email *
                - textbox "Email" [ref=e194]:
                  - /placeholder: ""
              - generic [ref=e195]:
                - generic [ref=e196]: Country of Residence *
                - generic [ref=e197]:
                  - combobox "Country of Residence" [ref=e198] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "Canada"
                    - option "United States"
                    - option "Other"
                  - generic:
                    - img
              - generic [ref=e199]:
                - generic [ref=e200]: Zip/Postal Code *
                - textbox "Zip/Postal Code" [ref=e202]:
                  - /placeholder: ""
              - generic [ref=e203]:
                - generic [ref=e204]: Phone number
                - textbox "Phone number" [ref=e206]:
                  - /placeholder: ""
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - text: When do you want to move into your home?
                  - generic [ref=e209]: "*"
                - generic [ref=e210]:
                  - combobox "When do you want to move into your home?" [ref=e211] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "0-3 Months"
                    - option "3-6 Months"
                    - option "6-12 Months"
                    - option "12+ Months"
                  - generic:
                    - img
              - generic [ref=e212]:
                - generic [ref=e213]:
                  - text: Are you a first time homebuyer?
                  - generic [ref=e214]: "*"
                - generic [ref=e215]:
                  - combobox "Are you a first time homebuyer?" [ref=e216] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "No"
                    - option "Yes"
                  - generic:
                    - img
              - generic [ref=e217]:
                - generic [ref=e218]:
                  - text: How many bedrooms do you need?
                  - generic [ref=e219]: "*"
                - generic [ref=e220]:
                  - combobox "How many bedrooms do you need?" [ref=e221] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "1"
                    - option "2"
                    - option "3"
                    - option "4"
                    - option "5+"
                  - generic:
                    - img
              - generic [ref=e222]:
                - generic [ref=e223]:
                  - text: What is your budget?
                  - generic [ref=e224]: "*"
                - generic [ref=e225]:
                  - combobox "What is your budget?" [ref=e226] [cursor=pointer]:
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
              - generic [ref=e228] [cursor=pointer]:
                - checkbox "I am a Real Estate Agent" [ref=e229]
                - generic [ref=e230]: I am a Real Estate Agent
              - generic [ref=e232] [cursor=pointer]:
                - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e233]'
                - generic [ref=e234]:
                  - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                  - link "SMS Privacy Policy" [ref=e235]:
                    - /url: /sms-privacy-policy
                  - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                  - link "Privacy Policy" [ref=e236]:
                    - /url: /privacy-policy
                  - text: ","
                  - link "SMS Privacy Policy" [ref=e237]:
                    - /url: /sms-privacy-policy
                  - text: ","
                  - link "SMS Terms of Service" [ref=e238]:
                    - /url: /sms-terms-of-service
                  - text: ", and/or"
                  - link "Contact Us" [ref=e239]:
                    - /url: /contact-us
                  - text: .
              - button "SUBMIT" [ref=e241] [cursor=pointer]
      - generic [ref=e242]:
        - generic [ref=e246]:
          - heading "Explore available floorplans" [level=2] [ref=e247]
          - generic [ref=e248]: Take a look at the variety of plans this community offers.
        - generic [ref=e250]:
          - generic [ref=e253]:
            - link "2 story Craftsman style townhomes with light yellow and light grey exterior, dark roof, many windows, white trim, front porches, blue outline of 3rd home from right" [ref=e256]:
              - /url: /alberta/calgary/calgary/yorkville/brooke
              - img "2 story Craftsman style townhomes with light yellow and light grey exterior, dark roof, many windows, white trim, front porches, blue outline of 3rd home from right" [ref=e259]
            - link "View Brooke information.Attached 1,342 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage Starting From $469,990" [ref=e261]:
              - /url: /alberta/calgary/calgary/yorkville/brooke
              - generic [ref=e262]: Brooke
              - generic [ref=e263]: Attached
              - generic [ref=e266]:
                - paragraph [ref=e268]: 1,342 Sq. Ft.|3 Beds|2 Baths
                - paragraph [ref=e270]: 1 Half Bath|2 Car Garage
                - paragraph [ref=e272]: Starting From $469,990
            - button "Mark as favorite" [ref=e273] [cursor=pointer]:
              - img "Favorite Icon" [ref=e274]
          - generic [ref=e278]:
            - link "Fisher townhome model with prairie elevation. 1 large windows sits above porch with 4 medium sized window to the left side." [ref=e281]:
              - /url: /alberta/calgary/calgary/yorkville/fisher
              - img "Fisher townhome model with prairie elevation. 1 large windows sits above porch with 4 medium sized window to the left side." [ref=e284]
            - link "View Fisher information.Attached 1,380 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage Starting From $474,990" [ref=e286]:
              - /url: /alberta/calgary/calgary/yorkville/fisher
              - generic [ref=e287]: Fisher
              - generic [ref=e288]: Attached
              - generic [ref=e291]:
                - paragraph [ref=e293]: 1,380 Sq. Ft.|3 Beds|2 Baths
                - paragraph [ref=e295]: 1 Half Bath|2 Car Garage
                - paragraph [ref=e297]: Starting From $474,990
            - button "Mark as favorite" [ref=e298] [cursor=pointer]:
              - img "Favorite Icon" [ref=e299]
          - generic [ref=e303]:
            - link "Exterior rendering shot of the Hampton End Townhome" [ref=e306]:
              - /url: /alberta/calgary/calgary/yorkville/hampton-end
              - img "Exterior rendering shot of the Hampton End Townhome" [ref=e309]
            - link "View Hampton End information. 1,373 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage Starting From $489,990" [ref=e311]:
              - /url: /alberta/calgary/calgary/yorkville/hampton-end
              - generic [ref=e312]: Hampton End
              - generic [ref=e315]:
                - paragraph [ref=e317]: 1,373 Sq. Ft.|3 Beds|2 Baths
                - paragraph [ref=e319]: 1 Half Bath|2 Car Garage
                - paragraph [ref=e321]: Starting From $489,990
            - button "Mark as favorite" [ref=e322] [cursor=pointer]:
              - img "Favorite Icon" [ref=e323]
          - generic [ref=e327]:
            - link "2 story Brownstone style townhouses with red brick and light grey exterior, dark roof, white trim, many windows, front porches, blue outline of home on right" [ref=e330]:
              - /url: /alberta/calgary/calgary/yorkville/ripley-end
              - img "2 story Brownstone style townhouses with red brick and light grey exterior, dark roof, white trim, many windows, front porches, blue outline of home on right" [ref=e333]
            - link "View Ripley End information.Attached 1,458-1,469 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage Starting From $499,990" [ref=e335]:
              - /url: /alberta/calgary/calgary/yorkville/ripley-end
              - generic [ref=e336]: Ripley End
              - generic [ref=e337]: Attached
              - generic [ref=e340]:
                - paragraph [ref=e342]: 1,458-1,469 Sq. Ft.|3 Beds|2 Baths
                - paragraph [ref=e344]: 1 Half Bath|2 Car Garage
                - paragraph [ref=e346]: Starting From $499,990
            - button "Mark as favorite" [ref=e347] [cursor=pointer]:
              - img "Favorite Icon" [ref=e348]
          - button "SHOW MORE" [ref=e350] [cursor=pointer]:
            - paragraph [ref=e352]: SHOW MORE
          - generic [ref=e353]:
            - link "View all" [ref=e354] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
              - generic [ref=e355]: View all
            - paragraph [ref=e356]: Showing 4 of 24 floorplans
      - generic [ref=e358]: test test test
      - generic [ref=e361] [cursor=pointer]:
        - button "New home rebates available!" [ref=e362]:
          - generic [ref=e364]:
            - img "Click Here New home rebates available!" [ref=e367]
            - generic [ref=e370]: click here
        - generic [ref=e371]: "1"
        - img [ref=e373]
      - generic [ref=e375]:
        - generic [ref=e377]: 48 Yorkstone Crescent SW
        - generic [ref=e378]:
          - link "Contact Us" [ref=e379] [cursor=pointer]:
            - generic [ref=e380]: Contact Us
          - link "Get Information" [ref=e381] [cursor=pointer]:
            - generic [ref=e382]: Get Information
      - button "View promotions" [ref=e384] [cursor=pointer]:
        - generic [ref=e385]: View promotions
        - img [ref=e386]
    - contentinfo "footer" [ref=e388]:
      - generic [ref=e390]:
        - generic [ref=e391]:
          - generic [ref=e392]:
            - heading "Explore" [level=2] [ref=e393]
            - list [ref=e395]:
              - listitem [ref=e396]:
                - link "Mattamy Homes USA" [ref=e397]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e398]:
                - link "Mattamy Homes Canada" [ref=e399]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e400]:
                - link "Design Studio" [ref=e401]:
                  - /url: /design-studio
              - listitem [ref=e402]:
                - link "Customer Care" [ref=e403]:
                  - /url: /customer-care
          - generic [ref=e405]:
            - heading "About Mattamy" [level=2] [ref=e406]
            - list [ref=e408]:
              - listitem [ref=e409]:
                - link "About Us" [ref=e410]:
                  - /url: /about/about-mattamy
              - listitem [ref=e411]:
                - link "Contact Us" [ref=e412]:
                  - /url: /contact
              - listitem [ref=e413]:
                - link "Careers" [ref=e414]:
                  - /url: /about/careers
              - listitem [ref=e415]:
                - link "Media and Investor Relations" [ref=e416]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e418]:
            - heading "Connect With Us" [level=2] [ref=e419]
            - generic [ref=e421]:
              - link "Facebook (opens in a new tab)" [ref=e422]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e423]
              - link "Instagram (opens in a new tab)" [ref=e425]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e426]
              - link "Youtube (opens in a new tab)" [ref=e428]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e429]
              - link "Pinterest (opens in a new tab)" [ref=e431]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e432]
              - link "Linkedin (opens in a new tab)" [ref=e434]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e435]
        - generic [ref=e438]:
          - paragraph [ref=e439]:
            - link "Accessibility" [ref=e440]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e441]: "|"
            - button "Cookie Settings" [ref=e442] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e443]: "|"
            - link "Legal Disclaimers" [ref=e444]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e445]: "|"
            - link "Privacy Policy" [ref=e446]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e447]: "|"
            - link "Terms and Conditions" [ref=e448]:
              - /url: /terms-and-conditions
          - paragraph [ref=e449]: ©2024 Mattamy Homes
```

# Test source

```ts
  267 |       if (!form) {
  268 |         return;
  269 |       }
  270 | 
  271 |       await expect(form, 'QMI Get Information side modal form should be visible').toBeVisible({
  272 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  273 |       });
  274 |     });
  275 |   }
  276 | 
  277 |   // Gallery
  278 | 
  279 |   /** Checks the gallery shows an image and its navigation buttons work. */
  280 |   async verifyGallery(): Promise<void> {
  281 |     await this.step('Verify gallery & navigation buttons', async () => {
  282 |       await expect(this.gallerySection.first()).toBeVisible();
  283 |       await clickIfVisible(this.nextGalleryBtn);
  284 |       await clickIfVisible(this.prevGalleryBtn);
  285 |     });
  286 |   }
  287 | 
  288 |   // Floor Plan and Community Map
  289 | 
  290 |   /** Checks the floor plan section is visible. */
  291 |   async verifyFloorPlan(): Promise<void> {
  292 |     await this.step('Verify floor plan section when available', async () => {
  293 |       const floorPlanSection = (await isLocatorVisible(this.interactiveFloorPlanSection))
  294 |         ? this.interactiveFloorPlanSection
  295 |         : this.floorPlanSection;
  296 | 
  297 |       if (await isLocatorVisible(floorPlanSection)) {
  298 |         await floorPlanSection.scrollIntoViewIfNeeded();
  299 |         await expect(floorPlanSection).toBeVisible();
  300 |       }
  301 |     });
  302 |   }
  303 | 
  304 |   /** Checks the interactive floor plan section renders its content. */
  305 |   async verifyInteractiveFloorPlan(): Promise<void> {
  306 |     await this.step('Verify interactive floor plan when available', async () => {
  307 |       if (!(await isLocatorVisible(this.interactiveFloorPlanSection))) {
  308 |         await this.reportValue('Interactive floorplan section not found - skipping validation');
  309 |         return;
  310 |       }
  311 | 
  312 |       await this.interactiveFloorPlanSection.scrollIntoViewIfNeeded();
  313 |       await expect(this.interactiveFloorPlanSection).toBeVisible();
  314 |       await expect(this.interactiveFloorPlanSection).toContainText(
  315 |         /Interactive Floorplan|floorplan/i,
  316 |       );
  317 |     });
  318 |   }
  319 | 
  320 |   /** Checks the community sitemap section renders its content. */
  321 |   async verifyCommunitySitemap(): Promise<void> {
  322 |     await this.step('Verify community sitemap when available', async () => {
  323 |       if (!(await isLocatorVisible(this.communitySitemapSection))) {
  324 |         await this.reportValue('Community sitemap section not found - skipping validation');
  325 |         return;
  326 |       }
  327 | 
  328 |       await this.communitySitemapSection.scrollIntoViewIfNeeded();
  329 |       await expect(this.communitySitemapSection).toBeVisible();
  330 |       await expect(this.communitySitemapSection).toContainText(/Explore the community/i);
  331 |       await expect(
  332 |         this.communitySitemapSection.locator('button, svg, canvas').first(),
  333 |       ).toBeVisible();
  334 |     });
  335 |   }
  336 | 
  337 |   // Content Sections
  338 | 
  339 |   /** Checks the home design details section says something real. */
  340 |   async verifyHomeDesignDetails(): Promise<void> {
  341 |     await this.step('Verify home design details content', async () => {
  342 |       await this.homeDesignDetailsSection.scrollIntoViewIfNeeded();
  343 |       await expect(this.homeDesignDetailsSection).toBeVisible({
  344 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  345 |       });
  346 |       await expect(this.homeDesignDetailsSection).toContainText(/Home Design Details/i);
  347 |       const detailsText = await this.homeDesignDetailsSection.innerText();
  348 |       expect(
  349 |         detailsText.replace(/Home Design Details/i, '').trim().length,
  350 |         'Home Design Details should include rendered content',
  351 |       ).toBeGreaterThan(0);
  352 |     });
  353 |   }
  354 | 
  355 |   /** Checks the home features section says something real. */
  356 |   async verifyHomeFeatures(): Promise<void> {
  357 |     await this.step('Verify home features content', async () => {
  358 |       await this.homeFeaturesSection.scrollIntoViewIfNeeded();
  359 |       await expect(this.homeFeaturesSection).toBeVisible({
  360 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  361 |       });
  362 |       await expect(this.homeFeaturesSection).toContainText(/Home Features/i);
  363 |       const featuresText = await this.homeFeaturesSection.innerText();
  364 |       expect(
  365 |         featuresText.replace(/Home Features/i, '').trim().length,
  366 |         'Home Features should list at least one feature',
> 367 |       ).toBeGreaterThan(3);
      |         ^ Error: Home Features should list at least one feature
  368 |     });
  369 |   }
  370 | 
  371 |   /** Checks the sales office shows its contact links, map link and form submit button. */
  372 |   async verifySalesOfficeAndContactForm(): Promise<void> {
  373 |     await this.step('Verify sales office & contact form', async () => {
  374 |       const salesOfficeSection = await this.requireFeature(
  375 |         await this.getSalesOfficeSection(),
  376 |         'qmi.salesOfficeSection',
  377 |         'Sales Office section',
  378 |       );
  379 | 
  380 |       if (salesOfficeSection) {
  381 |         await salesOfficeSection.scrollIntoViewIfNeeded();
  382 |         await expect(salesOfficeSection).toBeVisible({
  383 |           timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  384 |         });
  385 |         await expect(salesOfficeSection).toContainText(
  386 |           /Hours|Open|Closed|Sales Office|Showhome Parade/i,
  387 |         );
  388 |         await this.verifySalesOfficePhone(salesOfficeSection);
  389 |         await this.verifySalesOfficeMapLink(salesOfficeSection);
  390 |       }
  391 | 
  392 |       await expect(this.getInformationCta).toBeVisible();
  393 |     });
  394 |   }
  395 | 
  396 |   // Lead Form Validation
  397 | 
  398 |   /** Checks the lead form shows its fields and submit button. */
  399 |   async verifySideModalFormFields(): Promise<void> {
  400 |     await this.step('Verify QMI side modal form fields & submit button', async () => {
  401 |       const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');
  402 | 
  403 |       if (!form) {
  404 |         return;
  405 |       }
  406 | 
  407 |       await expectSideModalFormFields(form, {
  408 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  409 |         formName: 'QMI Get Information side modal form',
  410 |         location: this.locationKey,
  411 |       });
  412 |     });
  413 |   }
  414 | 
  415 |   /** Submits the form empty and checks the required-field errors appear. */
  416 |   async validateSideModalFormRequiredErrors(): Promise<void> {
  417 |     await this.step('Verify QMI side modal form required-field errors', async () => {
  418 |       const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');
  419 | 
  420 |       if (!form) {
  421 |         return;
  422 |       }
  423 | 
  424 |       await clickSubmit(this.page, form, QMIPage.PAGE_LOAD_TIMEOUT);
  425 |       await expectRequiredErrorsInForm(form, QMIPage.PAGE_LOAD_TIMEOUT);
  426 |     });
  427 |   }
  428 | 
  429 |   /** Checks the form rejects an invalid email address. */
  430 |   async validateSideModalFormInvalidEmail(): Promise<void> {
  431 |     await this.step('Verify QMI side modal form rejects invalid email', async () => {
  432 |       const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');
  433 | 
  434 |       if (!form) {
  435 |         return;
  436 |       }
  437 | 
  438 |       await this.fillLeadFormWithInvalidEmail(form);
  439 |       await clickSubmit(this.page, form, QMIPage.PAGE_LOAD_TIMEOUT);
  440 |       await expectInvalidEmailErrorInForm(form, QMIPage.PAGE_LOAD_TIMEOUT);
  441 |     });
  442 |   }
  443 | 
  444 |   /** Fills the form with valid data and checks it submits. */
  445 |   async verifySideModalFormSuccessSubmission(): Promise<void> {
  446 |     await this.step('Submit QMI side modal form with valid data', async () => {
  447 |       const form = await this.getAvailableForm(0, 'QMI Get Information side modal form');
  448 | 
  449 |       if (!form) {
  450 |         return;
  451 |       }
  452 | 
  453 |       await this.fillLeadFormWithValidData(form);
  454 |       await this.submitLeadFormAndCaptureApi({
  455 |         form: form,
  456 |         formName: 'QMI Get Information side modal form',
  457 |         submitButton: getSubmitButton(form),
  458 |         successModal: this.successDialogModal,
  459 |         successMessage: this.formSuccessMessage,
  460 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  461 |       });
  462 |       await this.reportValue('QMI form successful submission validated');
  463 |     });
  464 |   }
  465 | 
  466 |   /** Opens the floating-CTA side modal lead form and returns it, for evidence runs. */
  467 |   async openSideModalLeadForm(formName = 'QMI Get Information side modal form'): Promise<Locator> {
```