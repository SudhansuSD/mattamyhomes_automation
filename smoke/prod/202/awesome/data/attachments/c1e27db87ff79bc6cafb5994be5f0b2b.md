# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: condoPlan.spec.ts >> Condo Plan Page - CAN >> Page Load and Hero >> @smoke @regression | CAN | Validate condo plan page URL, title, and hero
- Location: tests/condoPlan.spec.ts:47:9

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /The M2ad plan.*Martha James Condominiums.*Mattamy Homes/i
Received string:  "The MJ1A plan in Burlington, ON: Welcome to Martha James Condominiums | Mattamy Homes"
Timeout: 15000ms

Call log:
  - Expect "toHaveTitle" with timeout 15000ms
    19 × unexpected value "The MJ1A plan in Burlington, ON: Welcome to Martha James Condominiums | Mattamy Homes"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e7]:
    - generic [ref=e13]:
      - text: Government Tax Rebates Available on New Homes!
      - link "Learn More" [ref=e14] [cursor=pointer]:
        - /url: http://mattamyhomes.com/promos/government-rebates
  - generic [ref=e16]:
    - banner [ref=e18]:
      - generic [ref=e19]:
        - link "MJ1A Plan Mattamy logo at Martha James Condominiums in Burlington Ontario by Mattamy Homes. Go to HomePage" [ref=e20] [cursor=pointer]:
          - /url: /
          - figure [ref=e21]:
            - img "MJ1A Plan Mattamy logo at Martha James Condominiums in Burlington Ontario by Mattamy Homes" [ref=e22]
        - navigation [ref=e23]:
          - generic [ref=e24]:
            - button "Find Your Dream Home" [ref=e26] [cursor=pointer]:
              - paragraph [ref=e27]:
                - text: Find Your Dream Home
                - img [ref=e28]
            - generic:
              - generic:
                - generic:
                  - heading [level=3]:
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
                  - heading [level=3]:
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
          - link "Sustainability" [ref=e31] [cursor=pointer]:
            - /url: /about/sustainability
            - paragraph [ref=e32]: Sustainability
          - button "Resources" [ref=e35] [cursor=pointer]:
            - paragraph [ref=e36]:
              - text: Resources
              - img [ref=e37]
          - link "Customer Care" [ref=e40] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e41]: Customer Care
          - button "About" [ref=e44] [cursor=pointer]:
            - paragraph [ref=e45]:
              - text: About
              - img [ref=e46]
          - link "Contact Us" [ref=e49] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e50]: Contact Us
        - generic [ref=e51]:
          - button "Go to Favorites Page" [ref=e52] [cursor=pointer]:
            - img "Favorite Icon" [ref=e53]
          - button "Select your country. CANADA country is selected" [ref=e58] [cursor=pointer]:
            - generic [ref=e60]: CANADA
            - img [ref=e62]
    - main [ref=e64]:
      - generic [ref=e66]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - text: Ontario
            - img [ref=e70]
          - generic [ref=e72]:
            - link "Greater Toronto Area" [ref=e73] [cursor=pointer]:
              - /url: /ontario/gta
            - img [ref=e74]
          - generic [ref=e76]:
            - text: Burlington
            - img [ref=e77]
          - generic [ref=e79]:
            - link "Martha James Condominiums" [ref=e80] [cursor=pointer]:
              - /url: /ontario/gta/burlington/martha-james-condominiums
            - img [ref=e81]
          - generic [ref=e83]: MJ1A
        - link "Stay Updated" [ref=e85] [cursor=pointer]:
          - generic [ref=e86]: Stay Updated
      - generic [ref=e89]:
        - heading "MJ1A" [level=1] [ref=e91]:
          - generic [ref=e92]: MJ1A
        - paragraph [ref=e93]:
          - generic [ref=e94]: 1 Bed|
          - generic [ref=e95]: 1 Bath
          - generic [ref=e96]: "|"
          - generic [ref=e97]: 425 Sq. Ft.
          - generic [ref=e98]: "|"
          - generic [ref=e99]: Floor 10|
          - generic [ref=e100]: North
      - generic [ref=e104]:
        - generic [ref=e105]:
          - link "Download floorplan. Opens in a new tab" [ref=e107] [cursor=pointer]:
            - /url: blob:https://mattamyhomes.com/0481bc04-b1ff-41d7-879f-048a3cc4d622
            - img "Download floorplan. Opens in a new tab" [ref=e108]
          - button "Show Floorplans" [pressed] [ref=e112] [cursor=pointer]:
            - paragraph [ref=e113]: Floorplans
          - generic [ref=e114]:
            - button "Mark as favorite" [ref=e116] [cursor=pointer]:
              - img "Favorite Icon" [ref=e117]
            - img "Share Icon" [ref=e121] [cursor=pointer]
        - generic [ref=e123]:
          - generic [ref=e130]:
            - button "Martha James M1JA Floorplan" [ref=e132] [cursor=pointer]
            - button "Zoom in" [ref=e133] [cursor=pointer]: +
            - button "Zoom out" [ref=e134] [cursor=pointer]: "-"
          - generic [ref=e135]: MJ1A
      - generic [ref=e138]:
        - generic [ref=e139]:
          - heading "Condo Plan Details" [level=2] [ref=e140]
          - button "Collapse Information" [expanded] [ref=e141] [cursor=pointer]
        - paragraph [ref=e148]: Discover thoughtfully designed living in this beautifully appointed 1-bedroom suite featuring an open-concept layout, soaring 9-foot ceilings, and expansive windows that fill the home with natural light. The contemporary kitchen is designed for both style and function, while the spacious outdoor terrace extends your living space and creates the perfect setting for relaxing or entertaining. Thoughtfully crafted throughout, this home delivers a seamless blend of comfort, functionality, and modern design.
      - generic [ref=e152]:
        - paragraph [ref=e154]: Mortgage Calculator
        - button "Get Started Expand calculator" [ref=e157] [cursor=pointer]:
          - generic [ref=e158]: Get Started
      - generic [ref=e163]:
        - heading "We're with you all the way to the front door" [level=2] [ref=e164]
        - button "Expand for more information" [ref=e165] [cursor=pointer]
      - generic [ref=e170]:
        - generic [ref=e172]:
          - heading "Explore available floorplans" [level=2] [ref=e173]
          - generic [ref=e174]: Take a look at the variety of plans this community offers.
          - link "View all" [ref=e176] [cursor=pointer]:
            - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
            - generic [ref=e177]: View all
        - generic [ref=e179]:
          - generic [ref=e182] [cursor=pointer]:
            - generic [ref=e184]:
              - paragraph [ref=e186]: Inquire for Pricing
              - img "Martha James M1DD Floorplan" [ref=e187]
              - button "Mark as favorite" [ref=e188]:
                - img "Favorite Icon" [ref=e189]
            - link "Martha James Condominiums M1DD 579 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage" [ref=e191]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m1dd
              - generic [ref=e192]: M1DD
              - generic [ref=e193]:
                - paragraph [ref=e196]: 579 Sq. Ft.
                - generic [ref=e197]:
                  - paragraph [ref=e198]: 1 Bed
                  - generic [ref=e199]: "|"
                  - paragraph [ref=e200]: 1 Bath
          - generic [ref=e204] [cursor=pointer]:
            - generic [ref=e206]:
              - paragraph [ref=e208]: Inquire for Pricing
              - img "Martha James M2JH Floorplan" [ref=e209]
              - button "Mark as favorite" [ref=e210]:
                - img "Favorite Icon" [ref=e211]
            - link "Martha James Condominiums MJ2H 809 Sq. Ft. 2 Beds 2 Baths 0 Half Bath 0 Car Garage" [ref=e213]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj2h
              - generic [ref=e214]: MJ2H
              - generic [ref=e215]:
                - paragraph [ref=e218]: 809 Sq. Ft.
                - generic [ref=e219]:
                  - paragraph [ref=e220]: 2 Beds
                  - generic [ref=e221]: "|"
                  - paragraph [ref=e222]: 2 Baths
      - generic [ref=e227]:
        - generic [ref=e229]:
          - generic [ref=e231]:
            - heading "Contact Us" [level=3] [ref=e232]
            - generic [ref=e233]:
              - generic [ref=e234]:
                - img [ref=e236]
                - link "Go to 1388 Dundas Street West Oakville Ontario L6M 4L8. Opens in Googlemaps" [ref=e239] [cursor=pointer]:
                  - /url: https://maps.google.com/maps?q=43.453831254877,-79.756406318446
                  - paragraph [ref=e240]: 1388 Dundas Street West
                  - paragraph [ref=e241]:
                    - text: Oakville, ON L6M 4L8
                    - img "OpenNewTab Icon" [ref=e242]
              - generic [ref=e245]:
                - img [ref=e247]
                - link "Call to 416-630-8282" [ref=e249] [cursor=pointer]:
                  - /url: tel:416-630-8282
                  - text: 416-630-8282
          - generic [ref=e250]:
            - heading "Hours" [level=3] [ref=e251]
            - generic [ref=e252]:
              - img [ref=e254]
              - button "Show Schedule" [ref=e257] [cursor=pointer]:
                - paragraph [ref=e258]: Closed Now
                - img [ref=e260]
        - generic [ref=e263]:
          - generic [ref=e264]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e265]
            - generic [ref=e267]: Required fields are marked with *
            - separator [ref=e268]
          - group [ref=e269]:
            - generic [ref=e270]:
              - textbox "username" [ref=e271]:
                - /placeholder: ""
              - textbox "company" [ref=e272]:
                - /placeholder: ""
              - generic [ref=e273]:
                - generic [ref=e274]: First name *
                - textbox "First name" [ref=e276]:
                  - /placeholder: ""
              - generic [ref=e277]:
                - generic [ref=e278]: Last name *
                - textbox "Last name" [ref=e280]:
                  - /placeholder: ""
              - generic [ref=e281]:
                - generic [ref=e282]: Email *
                - textbox "Email" [ref=e284]:
                  - /placeholder: ""
              - generic [ref=e285]:
                - generic [ref=e286]: Country of Residence *
                - generic [ref=e287]:
                  - combobox "Country of Residence" [ref=e288] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "Canada"
                    - option "United States"
                    - option "Other"
                  - generic:
                    - img
              - generic [ref=e289]:
                - generic [ref=e290]: Zip/Postal Code *
                - textbox "Zip/Postal Code" [ref=e292]:
                  - /placeholder: ""
              - generic [ref=e293]:
                - generic [ref=e294]: Phone number
                - textbox "Phone number" [ref=e296]:
                  - /placeholder: ""
              - generic [ref=e297]:
                - generic [ref=e298]: When do you want to move into your home?
                - generic [ref=e299]:
                  - combobox "When do you want to move into your home?" [ref=e300] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "0-3 Months"
                    - option "3-6 Months"
                    - option "6-12 Months"
                    - option "12+ Months"
                  - generic:
                    - img
              - generic [ref=e301]:
                - generic [ref=e302]: How many bedrooms do you need?
                - generic [ref=e303]:
                  - combobox "How many bedrooms do you need?" [ref=e304] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "1"
                    - option "2"
                    - option "3"
                    - option "4"
                    - option "5+"
                  - generic:
                    - img
              - generic [ref=e305]:
                - generic [ref=e306]: What is your budget?
                - generic [ref=e307]:
                  - combobox "What is your budget?" [ref=e308] [cursor=pointer]:
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
              - generic [ref=e310] [cursor=pointer]:
                - checkbox "I am a Real Estate Agent" [ref=e311]
                - generic [ref=e312]: I am a Real Estate Agent
              - generic [ref=e314] [cursor=pointer]:
                - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e315]'
                - generic [ref=e316]:
                  - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                  - link "SMS Privacy Policy" [ref=e317]:
                    - /url: /sms-privacy-policy
                  - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                  - link "Privacy Policy" [ref=e318]:
                    - /url: /privacy-policy
                  - text: ","
                  - link "SMS Privacy Policy" [ref=e319]:
                    - /url: /sms-privacy-policy
                  - text: ","
                  - link "SMS Terms of Service" [ref=e320]:
                    - /url: /sms-terms-of-service
                  - text: ", and/or"
                  - link "Contact Us" [ref=e321]:
                    - /url: /contact-us
                  - text: .
              - button "SUBMIT" [ref=e323] [cursor=pointer]
      - generic [ref=e326]:
        - paragraph
        - paragraph [ref=e327]: Any price for a home in Ontario listed on Mattamy’s website includes an estimated amount for the temporary Ontario enhanced new housing HST rebate. This pricing assumes that the purchaser meets all eligibility criteria for the rebate. If the purchaser is not eligible, the rebate will not apply and the purchaser may be responsible for a higher purchase price without the benefit of the rebate.
        - paragraph [ref=e328]
      - button "View promotions" [ref=e330] [cursor=pointer]:
        - generic [ref=e331]: View promotions
        - img [ref=e332]
    - contentinfo "footer" [ref=e334]:
      - generic [ref=e336]:
        - generic [ref=e337]:
          - generic [ref=e338]:
            - heading "Explore" [level=2] [ref=e339]
            - list [ref=e341]:
              - listitem [ref=e342]:
                - link "Find My Home" [ref=e343] [cursor=pointer]:
                  - /url: /search
              - listitem [ref=e344]:
                - link "Design Studio" [ref=e345] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e346]:
                - link "Customer Care" [ref=e347] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e349]:
            - heading "About Mattamy" [level=2] [ref=e350]
            - list [ref=e352]:
              - listitem [ref=e353]:
                - link "About Us" [ref=e354] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e355]:
                - link "Contact Us" [ref=e356] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e357]:
                - link "Careers" [ref=e358] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e359]:
                - link "Media and Investor Relations" [ref=e360] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e362]:
            - heading "Connect With Us" [level=2] [ref=e363]
            - generic [ref=e365]:
              - link "Facebook (opens in a new tab)" [ref=e366] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomes
                - img [ref=e367]
              - link "Instagram (opens in a new tab)" [ref=e369] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomes/
                - img [ref=e370]
              - link "Youtube (opens in a new tab)" [ref=e372] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e373]
              - link "Pinterest (opens in a new tab)" [ref=e375] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e376]
              - link "Linkedin (opens in a new tab)" [ref=e378] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e379]
        - generic [ref=e382]:
          - paragraph [ref=e383]:
            - link "Accessibility" [ref=e384] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e385]: "|"
            - button "Cookie Settings" [ref=e386] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e387]: "|"
            - link "Legal Disclaimers" [ref=e388] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e389]: "|"
            - link "Privacy Policy" [ref=e390] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e391]: "|"
            - link "Terms and Conditions" [ref=e392] [cursor=pointer]:
              - /url: /terms-and-conditions
          - paragraph [ref=e393]: ©2026 Mattamy Homes
  - iframe [ref=e395]:
    - generic [active] [ref=f8e1]:
      - generic:
        - generic:
          - generic:
            - button [ref=f8e2]
            - img "AtlasRTX Digital Assistant icon" [ref=f8e5]:
              - text: Chat with Us
              - strong [ref=f8e8]: "1"
            - button [ref=f8e9]
```

# Test source

```ts
  98  |       .getByRole('button', {
  99  |         name: /Get Started/i,
  100 |       })
  101 |       .first();
  102 |     this.availableFloorplansSection = page
  103 |       .locator('section, div')
  104 |       .filter({
  105 |         has: page.getByRole('heading', { name: TEXT.availableFloorplans }),
  106 |       })
  107 |       .first();
  108 |     this.contactSection = page
  109 |       .locator('section, div')
  110 |       .filter({
  111 |         has: page.getByRole('heading', { name: TEXT.contactUs }),
  112 |       })
  113 |       .first();
  114 |     this.hoursSection = page
  115 |       .locator('section, div')
  116 |       .filter({
  117 |         has: page.getByRole('heading', { name: TEXT.hours }),
  118 |       })
  119 |       .first();
  120 |     this.communityUpdatesSection = page
  121 |       .locator('section, div')
  122 |       .filter({
  123 |         has: page.getByRole('heading', { name: TEXT.communityUpdates }),
  124 |       })
  125 |       .last();
  126 |     this.successDialogModal = page.locator('.ReactModal__Content');
  127 |   }
  128 | 
  129 |   /** Every visible navigation and content link on the page. */
  130 |   private get navLinks(): Locator {
  131 |     return this.page.locator('a[href]');
  132 |   }
  133 | 
  134 |   /** The Get Information form, wherever it opens - modal, drawer or sidebar. */
  135 |   private get leadFormDialogOrSidebar(): Locator {
  136 |     return (
  137 |       this.page
  138 |         .locator(
  139 |           '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible',
  140 |         )
  141 |         // A Submit button, not just any input, is what separates a lead form from
  142 |         // the page's other dialogs - the National-promotion overlay is a
  143 |         // full-screen role="dialog" with inputs, so it matches everything else here. Matched
  144 |         // by CSS rather than by role (see SUBMIT_BUTTON_SELECTOR): the promotion
  145 |         // popup aria-hides the whole page while it is up, which left this filter
  146 |         // matching nothing and an open side modal reporting as "did not open".
  147 |         // and(), not filter({ hasNot }): the aria-label sits on the overlay
  148 |         // itself, and hasNot only inspects descendants.
  149 |         .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
  150 |         .and(
  151 |           this.page.locator(
  152 |             ':not([aria-label*="promotion" i]):not([aria-label*="notification" i])',
  153 |           ),
  154 |         )
  155 |     );
  156 |   }
  157 | 
  158 |   /** The thank-you message shown after the form is submitted. */
  159 |   private get formSuccessMessage(): Locator {
  160 |     return this.page.getByText(TEXT.successMessage).last();
  161 |   }
  162 | 
  163 |   /** Checks a condo plan search lands on the right plan page. */
  164 |   async verifySearchByCondoPlan(): Promise<void> {
  165 |     await this.step('Verify search lands on condo plan URL', async () => {
  166 |       const location = this.location as ReturnType<typeof getLocationConfig> & {
  167 |         condoPlan?: { url?: string };
  168 |       };
  169 | 
  170 |       if (!location.condoPlan?.url) {
  171 |         throw new Error('Condo plan URL is not configured in location config');
  172 |       }
  173 | 
  174 |       await this.waitForPageReady();
  175 |       await this.assertPageUrlContains(
  176 |         location.condoPlan.url,
  177 |         `Condo plan URL should contain configured path: ${location.condoPlan.url}`,
  178 |       );
  179 |       await this.assertHeadingVisible(
  180 |         undefined,
  181 |         'Condo plan detail page should expose a visible H1',
  182 |       );
  183 |     });
  184 |   }
  185 | 
  186 |   /** Checks the condo plan page loaded with its expected heading. */
  187 |   async verifyPageLoaded(expectedPlanName = 'M2ad'): Promise<void> {
  188 |     await this.step(`Verify condo plan page loaded ('${expectedPlanName}')`, async () => {
  189 |       await expect(this.heading).toBeVisible({ timeout: TIMEOUT.long });
  190 |       await expect(this.heading).toContainText(new RegExp(escapeRegex(expectedPlanName), 'i'));
  191 |     });
  192 |   }
  193 | 
  194 |   /** Checks the URL and tab title match the condo plan we asked for. */
  195 |   async verifyUrlAndTitle(plan: CondoPlanDetails): Promise<void> {
  196 |     await this.step('Verify URL and title', async () => {
  197 |       await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(plan.url)}\\/?$`, 'i'));
> 198 |       await expect(this.page).toHaveTitle(EXPECTED_CONDO_PLAN.title);
      |                               ^ Error: expect(page).toHaveTitle(expected) failed
  199 |     });
  200 |   }
  201 | 
  202 |   /** Checks the breadcrumb walks market, city, community and plan. */
  203 |   async verifyBreadcrumb(plan: CondoPlanDetails): Promise<void> {
  204 |     await this.step('Verify breadcrumb context', async () => {
  205 |       if (await this.breadcrumb.count()) {
  206 |         await expect(this.breadcrumb).toBeVisible({ timeout: TIMEOUT.short });
  207 |         await expect(
  208 |           this.breadcrumb.getByRole('link', { name: /Greater To|Greater Toronto Area/i }).first(),
  209 |         ).toHaveAttribute('href', /\/ontario\/gta$/i);
  210 |         await expect(this.breadcrumb).toContainText(
  211 |           new RegExp(escapeRegex(EXPECTED_CONDO_PLAN.city), 'i'),
  212 |         );
  213 |         await expect(
  214 |           this.breadcrumb
  215 |             .getByRole('link', { name: /Martha Jam|Martha James Condominiums/i })
  216 |             .first(),
  217 |         ).toHaveAttribute('href', /\/ontario\/gta\/burlington\/martha-james-condominiums$/i);
  218 |         await expect(this.breadcrumb).toContainText(new RegExp(escapeRegex(plan.name), 'i'));
  219 |         return;
  220 |       }
  221 | 
  222 |       await expect(this.body).toContainText(new RegExp(escapeRegex(plan.community), 'i'));
  223 |       await expect(this.body).toContainText(new RegExp(escapeRegex(plan.name), 'i'));
  224 |     });
  225 |   }
  226 | 
  227 |   /** Checks the hero summary shows the plan's name, specs and type. */
  228 |   async verifyHeroSummary(plan: CondoPlanDetails): Promise<void> {
  229 |     await this.step('Verify hero summary', async () => {
  230 |       await expect(this.heading).toContainText(new RegExp(escapeRegex(plan.name), 'i'));
  231 | 
  232 |       for (const spec of EXPECTED_CONDO_PLAN.specs) {
  233 |         await expect(this.body).toContainText(new RegExp(escapeRegex(spec), 'i'));
  234 |       }
  235 | 
  236 |       await expect(this.body).toContainText(
  237 |         new RegExp(escapeRegex(EXPECTED_CONDO_PLAN.planType), 'i'),
  238 |       );
  239 |     });
  240 |   }
  241 | 
  242 |   /** Checks the Condo Plan Details section says something real. */
  243 |   async verifyCondoPlanDetailsContent(): Promise<void> {
  244 |     await this.step('Verify condo plan details content', async () => {
  245 |       await expect(this.page.getByRole('heading', { name: TEXT.condoPlanDetails })).toBeVisible({
  246 |         timeout: TIMEOUT.short,
  247 |       });
  248 | 
  249 |       for (const keyword of EXPECTED_CONDO_PLAN.descriptionKeywords) {
  250 |         await expect(this.body).toContainText(keyword);
  251 |       }
  252 |     });
  253 |   }
  254 | 
  255 |   /** Checks the floorplan image is there and has a real source. */
  256 |   async verifyFloorplanImage(): Promise<void> {
  257 |     await this.step('Verify floorplan image', async () => {
  258 |       await expect(this.floorplanImage).toBeVisible({ timeout: TIMEOUT.medium });
  259 |       await expect(this.floorplanImage).toHaveAttribute('src', /.+/);
  260 |     });
  261 |   }
  262 | 
  263 |   /** Checks the mortgage calculator and its CTA are visible, without opening the form. */
  264 |   async verifyMortgageCalculatorCta(): Promise<void> {
  265 |     await this.step('Verify mortgage calculator CTA', async () => {
  266 |       await expect(this.mortgageCalculatorSection).toBeVisible({ timeout: TIMEOUT.short });
  267 |       await expect(this.mortgageCalculatorCta).toBeVisible({ timeout: TIMEOUT.short });
  268 |     });
  269 |   }
  270 | 
  271 |   /** Checks the support headline under the mortgage calculator is visible. */
  272 |   async verifySupportHeadline(): Promise<void> {
  273 |     await this.step('Verify support headline', async () => {
  274 |       await expect(this.body).toContainText(TEXT.supportHeadline, { timeout: TIMEOUT.short });
  275 |     });
  276 |   }
  277 | 
  278 |   /** Checks the related floorplans and their View All link. */
  279 |   async verifyAvailableFloorplans(_plan: CondoPlanDetails): Promise<void> {
  280 |     await this.step('Verify available floorplans', async () => {
  281 |       await expect(this.availableFloorplansSection).toBeVisible({ timeout: TIMEOUT.medium });
  282 |       await expect(this.availableFloorplansSection).toContainText(TEXT.availableFloorplans);
  283 | 
  284 |       const viewAllLink = this.page
  285 |         .locator(
  286 |           'a[href*="productType=plan"][href*="Martha%20James%20Condominiums"], a[href*="productType=plan"][href*="Martha James Condominiums"]',
  287 |         )
  288 |         .first();
  289 | 
  290 |       await expect(viewAllLink).toBeVisible({ timeout: TIMEOUT.short });
  291 |       await expect(viewAllLink).toHaveAttribute(
  292 |         'href',
  293 |         /\/search\?productType=plan.*community=Martha(\+|%20| )James(\+|%20| )Condominiums/i,
  294 |       );
  295 | 
  296 |       for (const planName of EXPECTED_CONDO_PLAN.relatedPlanNames) {
  297 |         const relatedPlanLink = this.page
  298 |           .locator(`a[href$="/martha-james-condominiums/${planName.toLowerCase()}"]`)
```