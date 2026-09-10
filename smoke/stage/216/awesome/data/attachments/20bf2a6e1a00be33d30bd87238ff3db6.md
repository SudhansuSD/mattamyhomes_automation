# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: condoCommunity.spec.ts >> Condo Community Detail - CAN >> Lead Form >> Get Information Form Validation >> @smoke @regression | CAN | Validate condo community sideModalForm fields
- Location: tests/condoCommunity.spec.ts:101:11

# Error details

```
Error: Community field should be visible

expect(locator).toBeVisible() failed

Locator: locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByRole('combobox', { name: /community/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Community field should be visible with timeout 10000ms
  - waiting for locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByRole('combobox', { name: /community/i }).first()

```

```
Error: Suite/Floorplan/Plan field should be visible

expect(locator).toBeVisible() failed

Locator: locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByRole('combobox', { name: /suite|floorplan|plan/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Suite/Floorplan/Plan field should be visible with timeout 10000ms
  - waiting for locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByRole('combobox', { name: /suite|floorplan|plan/i }).first()

```

```
Error: Side modal form field audit should have no assertion failures

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 2
Received array:  [{"cause": undefined, "message": "Error: Community field should be visible·
expect(locator).toBeVisible() failed·
Locator: locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /community/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found·
Call log:
  - Community field should be visible with timeout 10000ms
  - waiting for locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /community/i }).first()
", "stack": "Error: Community field should be visible·
expect(locator).toBeVisible() failed·
Locator: locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /community/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found·
Call log:
  - Community field should be visible with timeout 10000ms
  - waiting for locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /community/i }).first()·
    at expectFieldVisible (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:446:19)
    at map (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:663:7)
    at expectSideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:662:23)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/pages/CondoCommunityPage.ts:444:7
    at CondoCommunityPage.verifySideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/pages/CondoCommunityPage.ts:442:5)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/condoCommunity.spec.ts:103:11
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/condoCommunity.spec.ts:102:9"}, {"cause": undefined, "message": "Error: Suite/Floorplan/Plan field should be visible·
expect(locator).toBeVisible() failed·
Locator: locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /suite|floorplan|plan/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found·
Call log:
  - Suite/Floorplan/Plan field should be visible with timeout 10000ms
  - waiting for locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /suite|floorplan|plan/i }).first()
", "stack": "Error: Suite/Floorplan/Plan field should be visible·
expect(locator).toBeVisible() failed·
Locator: locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /suite|floorplan|plan/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found·
Call log:
  - Suite/Floorplan/Plan field should be visible with timeout 10000ms
  - waiting for locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('combobox', { name: /suite|floorplan|plan/i }).first()·
    at expectFieldVisible (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:446:19)
    at map (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:663:7)
    at expectSideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:662:23)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/pages/CondoCommunityPage.ts:444:7
    at CondoCommunityPage.verifySideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/pages/CondoCommunityPage.ts:442:5)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/condoCommunity.spec.ts:103:11
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/condoCommunity.spec.ts:102:9"}]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e7]:
    - generic [ref=e11]: I am a banner!
  - generic [ref=e13]:
    - banner [ref=e14]:
      - generic [ref=e15]:
        - link "Martha James Condominiums Mattamy logo in Burlington Ontario by Mattamy Homes. Go to HomePage" [ref=e16]:
          - /url: /
          - figure [ref=e17]:
            - img "Martha James Condominiums Mattamy logo in Burlington Ontario by Mattamy Homes" [ref=e18]
        - button "Navigation menu." [ref=e19] [cursor=pointer]:
          - img [ref=e20]
    - main [ref=e22]:
      - generic [ref=e24]:
        - heading [level=2] [ref=e26]: Martha James Condominiums
        - generic [ref=e27]:
          - link [ref=e28] [cursor=pointer]:
            - generic [ref=e29]: Contact Us
          - link [ref=e30] [cursor=pointer]:
            - generic [ref=e31]: Get Information
      - generic [ref=e34]:
        - paragraph [ref=e35]: Sold Out
        - heading "Martha James Condominiums" [level=1] [ref=e37]
        - generic [ref=e38]: Introducing Martha James Condominiums, premiere condo living just steps from the majestic waterfront and lively Downtown Burlington.
        - button "Stay updated about this community" [active] [ref=e39] [cursor=pointer]:
          - generic [ref=e40]: Get Information
      - region "Sales center contact and quick links" [ref=e43]:
        - generic [ref=e44]:
          - generic [ref=e45]: Contact Us
          - generic [ref=e46]:
            - generic [ref=e47]: 1388 Dundas Street West, Oakville, ON L6M 4L8
            - generic [ref=e48]: 416-630-8282
          - generic [ref=e49]:
            - link "Call 416-630-8282" [ref=e50] [cursor=pointer]:
              - /url: tel:4166308282
              - img "Call Icon" [ref=e51]
            - link "Email condosales@mattamycorp.com" [ref=e53] [cursor=pointer]:
              - /url: mailto:condosales@mattamycorp.com
              - img "Mail Icon" [ref=e54]
            - button "Hours" [ref=e57] [cursor=pointer]
            - link "Get directions to sales center, opens in new tab" [ref=e58] [cursor=pointer]:
              - /url: maps://maps.google.com/maps?q=43.453831254877,-79.756406318446
              - img "Map Location Icon" [ref=e59]
              - generic [ref=e61]: Directions
            - button "Schedule an Appointment" [ref=e62] [cursor=pointer]
          - dialog:
            - generic:
              - generic: Mon
              - generic:
                - generic: 11:00am - 6:00pm
              - generic: Tue
              - generic:
                - generic: 11:00am - 6:00pm
              - generic: Wed
              - generic:
                - generic: 11:00am - 6:00pm
              - generic: Thu
              - generic:
                - generic: 11:00am - 6:00pm
              - generic: Fri
              - generic:
                - generic: 11:00am - 6:00pm
              - generic: Sat
              - generic:
                - generic: 11:00am - 6:00pm
              - generic: Sun
              - generic:
                - generic: 11:00am - 6:00pm
        - link "View 4 Floorplans" [ref=e65]:
          - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
      - generic [ref=e69]:
        - img [ref=e70]
        - generic [ref=e71]:
          - heading "Condo Offer" [level=2] [ref=e72]
          - text: Offer test promo
        - generic [ref=e73]:
          - heading "Condo offer test" [level=3] [ref=e74]
          - generic [ref=e75]: testing promotion for condo
        - link "View Details" [ref=e77] [cursor=pointer]:
          - /url: /ontario/gta/promos/move-forward
          - generic [ref=e78]: View Details
      - generic [ref=e80]:
        - generic [ref=e82]:
          - 'img "Martha James Condominiums Logo: Text in cursive." [ref=e84]'
          - generic [ref=e85]:
            - heading "Welcome to Martha James Condominiums" [level=2] [ref=e86]
            - generic [ref=e87]:
              - generic [ref=e88]:
                - generic [ref=e89]: Set in a mature park side neighbourhood, steps from Brant Street and only moments from Lake Ontario, Martha James is Burlington’s most intimate new condominium. Endowed with breathtaking lake views, life-enhancing amenities, and flexible suites - ...
                - button "Show more" [expanded] [ref=e90] [cursor=pointer]: More+
              - paragraph
              - paragraph
        - generic [ref=e92]:
          - paragraph [ref=e93]: Home Details
          - generic [ref=e94]:
            - img [ref=e95]
            - generic [ref=e97]:
              - generic [ref=e98]: Home Types
              - generic [ref=e99]: Condominium
          - generic [ref=e100]:
            - generic [ref=e101]:
              - img [ref=e102]
              - generic [ref=e104]:
                - generic [ref=e105]: Bedrooms
                - generic [ref=e106]: 1 to 2
            - generic [ref=e107]:
              - img [ref=e108]
              - generic [ref=e110]:
                - generic [ref=e111]: Full Bathrooms
                - generic [ref=e112]: 1 - 2
            - generic [ref=e113]:
              - img [ref=e114]
              - generic [ref=e116]:
                - generic [ref=e117]: Sq. Ft.
                - generic [ref=e118]: 529 - 946
            - generic [ref=e119]:
              - img [ref=e120]
              - generic [ref=e130]:
                - generic [ref=e131]: Stories
                - generic [ref=e132]: "1"
      - generic [ref=e138]:
        - generic [ref=e139]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e140]
          - generic [ref=e142]: Required fields are marked with *
          - separator [ref=e143]
        - group [ref=e144]:
          - generic [ref=e145]:
            - textbox "username" [ref=e146]:
              - /placeholder: ""
            - textbox "company" [ref=e147]:
              - /placeholder: ""
            - generic [ref=e148]:
              - generic [ref=e149]: First name *
              - textbox "First name" [ref=e151]:
                - /placeholder: ""
            - generic [ref=e152]:
              - generic [ref=e153]: Last name *
              - textbox "Last name" [ref=e155]:
                - /placeholder: ""
            - generic [ref=e156]:
              - generic [ref=e157]: Email *
              - textbox "Email" [ref=e159]:
                - /placeholder: ""
            - generic [ref=e160]:
              - generic [ref=e161]: Country of Residence *
              - generic [ref=e162]:
                - combobox "Country of Residence" [ref=e163] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e164]:
              - generic [ref=e165]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e167]:
                - /placeholder: ""
            - generic [ref=e168]:
              - generic [ref=e169]: Phone number
              - textbox "Phone number" [ref=e171]:
                - /placeholder: ""
            - generic [ref=e172]:
              - generic [ref=e173]:
                - text: When do you want to move into your home?
                - generic [ref=e174]: "*"
              - generic [ref=e175]:
                - combobox "When do you want to move into your home?" [ref=e176] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e177]:
              - generic [ref=e178]:
                - text: Are you a first time homebuyer?
                - generic [ref=e179]: "*"
              - generic [ref=e180]:
                - combobox "Are you a first time homebuyer?" [ref=e181] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e182]:
              - generic [ref=e183]:
                - text: How many bedrooms do you need?
                - generic [ref=e184]: "*"
              - generic [ref=e185]:
                - combobox "How many bedrooms do you need?" [ref=e186] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e187]:
              - generic [ref=e188]:
                - text: What is your budget?
                - generic [ref=e189]: "*"
              - generic [ref=e190]:
                - combobox "What is your budget?" [ref=e191] [cursor=pointer]:
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
            - generic [ref=e193] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e194]
              - generic [ref=e195]: I am a Real Estate Agent
            - generic [ref=e197] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e198]'
              - generic [ref=e199]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e200]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e201]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e202]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e203]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e204]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e206] [cursor=pointer]
      - generic [ref=e207]:
        - generic [ref=e211]:
          - heading "Explore available floorplans" [level=2] [ref=e212]
          - generic [ref=e213]: Take a look at the variety of plans this community offers.
          - link "View all" [ref=e215] [cursor=pointer]:
            - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
            - generic [ref=e216]: View all
        - generic [ref=e218]:
          - generic [ref=e221]:
            - link "GTU_MarthaJames_Floorplan_M1BD_Suite1002" [ref=e224]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m1bd
              - img "GTU_MarthaJames_Floorplan_M1BD_Suite1002" [ref=e227]
            - link "View M1bd information.Condominium 578-579 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e229]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m1bd
              - generic [ref=e230]: M1bd
              - generic [ref=e231]: Condominium
              - generic [ref=e234]:
                - paragraph [ref=e236]: 578-579 Sq. Ft.|1 Bed|1 Bath
                - generic [ref=e237]:
                  - paragraph
                - paragraph [ref=e239]: Inquire for Pricing
            - button "Mark as favorite" [ref=e240] [cursor=pointer]:
              - img "Favorite Icon" [ref=e241]
          - generic [ref=e245]:
            - link "GTU_MarthaJames_Floorplan_M2AD-Suite505" [ref=e248]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m2ad
              - img "GTU_MarthaJames_Floorplan_M2AD-Suite505" [ref=e251]
            - link "View M2ad information.Condominium 946 Sq. Ft. 2 Beds 2 Baths 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e253]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m2ad
              - generic [ref=e254]: M2ad
              - generic [ref=e255]: Condominium
              - generic [ref=e258]:
                - paragraph [ref=e260]: 946 Sq. Ft.|2 Beds|2 Baths
                - generic [ref=e261]:
                  - paragraph
                - paragraph [ref=e263]: Inquire for Pricing
            - button "Mark as favorite" [ref=e264] [cursor=pointer]:
              - img "Favorite Icon" [ref=e265]
          - generic [ref=e269]:
            - link "GTU_MarthaJames_Floorplan_MJ1B-Suite1002" [ref=e272]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1b
              - img "GTU_MarthaJames_Floorplan_MJ1B-Suite1002" [ref=e275]
            - link "View Mj1b information.Condominium 529 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e277]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1b
              - generic [ref=e278]: Mj1b
              - generic [ref=e279]: Condominium
              - generic [ref=e282]:
                - paragraph [ref=e284]: 529 Sq. Ft.|1 Bed|1 Bath
                - generic [ref=e285]:
                  - paragraph
                - paragraph [ref=e287]: Inquire for Pricing
            - button "Mark as favorite" [ref=e288] [cursor=pointer]:
              - img "Favorite Icon" [ref=e289]
          - generic [ref=e293]:
            - link "GTU_MarthaJames_Floorplan_MJ1F-Suite211" [ref=e296]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1f
              - img "GTU_MarthaJames_Floorplan_MJ1F-Suite211" [ref=e299]
            - link "View Mj1f information.Condominium 566 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e301]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1f
              - generic [ref=e302]: Mj1f
              - generic [ref=e303]: Condominium
              - generic [ref=e306]:
                - paragraph [ref=e308]: 566 Sq. Ft.|1 Bed|1 Bath
                - generic [ref=e309]:
                  - paragraph
                - paragraph [ref=e311]: Inquire for Pricing
            - button "Mark as favorite" [ref=e312] [cursor=pointer]:
              - img "Favorite Icon" [ref=e313]
      - generic [ref=e317]:
        - heading "Calendly field validation" [level=2] [ref=e318]
        - generic [ref=e319]:
          - button "Video Test" [ref=e321] [cursor=pointer]:
            - generic [ref=e322]: Video Test
          - button "In Person" [ref=e323] [cursor=pointer]:
            - generic [ref=e324]: In Person
      - generic [ref=e326]:
        - heading "Your destination - for work, play and life" [level=2] [ref=e327]
        - generic [ref=e328]:
          - article [ref=e329]:
            - heading "Community Garden" [level=3] [ref=e331]
            - paragraph [ref=e332]: Let your green thumb thrive at the rooftop community garden.
          - article [ref=e333]:
            - heading "Connectivity" [level=3] [ref=e335]
            - paragraph [ref=e336]: Access to major highways and the Burlington GO Station makes commuting a breeze.
          - article [ref=e337]:
            - heading "Fitness Centre" [level=3] [ref=e339]
            - paragraph [ref=e340]: Enjoy morning yoga on the rooftop or weights in the fitness studio.
          - article [ref=e341]:
            - heading "Nature" [level=3] [ref=e343]
            - paragraph [ref=e344]: Minutes from the majestic Brant Pier and surrounded by parks and trails.
          - article [ref=e345]:
            - heading "Rooftop Lounge" [level=3] [ref=e347]
            - paragraph [ref=e348]: Entertain with outdoor BBQs on the stunning rooftop.
          - article [ref=e349]:
            - heading "Social Lounge" [level=3] [ref=e351]
            - paragraph [ref=e352]: Transitions from dynamic coworking space during the day to the ideal entertainment spot for family and friends.
      - generic [ref=e353]:
        - generic [ref=e356]:
          - img "The exterior of Martha James Condominiums, surrounded by green space and roads." [ref=e362]
          - generic [ref=e366]:
            - heading "Everyday Perfection" [level=2] [ref=e367]
            - generic [ref=e369]:
              - paragraph [ref=e370]: Meticulously designed, Martha James Condominiums introduces elegance to your everyday living. Open-concept suites with airy 9’ ceilings and thoughtfully designed floorplans with beautifully refined finishes will inspire life to unfold splendidly. Drawing you and your visitors into a warm welcome, the impressive lobby and concierge service makes a stunning statement.
              - paragraph [ref=e371]: Wake up to sun salutations on the rooftop, let your green thumb thrive in the community garden or get your sweat on in the performance inducing fitness studio. The flexible, well-appointed social lounge takes working from home to the next level and seamlessly transitions into the ideal spot to entertain. The rooftop lounge with expansive lake views provides the perfect backdrop for, alfresco dining or simply unwinding.
        - generic [ref=e374]:
          - img "A couple biking alongside the water." [ref=e380]
          - generic [ref=e384]:
            - heading "The Charm of Burlington" [level=2] [ref=e385]
            - generic [ref=e386]: The spectacular lakefront, abundance of lush parks and trails, easy access to GO Transit and major highways, and family-friendly neighbourhoods have made Burlington one of the most desired cities in the GTHA. Toronto is a short 40-minute commute, perfect for those seeking a quiet life with all the conveniences of an urban setting.
        - generic [ref=e389]:
          - img "The exterior of Martha James Condominiums, surrounded by green space and roads." [ref=e395]
          - generic [ref=e399]:
            - heading "Martha James Brochure" [level=2] [ref=e400]
            - generic [ref=e401]: Learn more about Martha James Condominiums, the surrounding community, and imagine your life here!
            - link "Discover Martha James" [ref=e403] [cursor=pointer]:
              - /url: /dfsmedia/a2b99d47a71047839a5a4241f44710ce/98988-source/gtu-marthajames-brochure
              - generic [ref=e404]: Discover Martha James
      - generic [ref=e406]:
        - heading "Thoughtfully designed with you in mind" [level=2] [ref=e407]
        - generic [ref=e408]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e410]:
          - radiogroup "Content type" [ref=e412]:
            - generic [ref=e413] [cursor=pointer]:
              - text: Community Gallery
              - img [ref=e414]
            - paragraph [ref=e416]: Slide has changed view to 0
          - button "Community Gallery" [ref=e417] [cursor=pointer]
          - generic [ref=e418]:
            - generic [ref=e423]:
              - button [ref=e428] [cursor=pointer]
              - button "The lobby of Martha James with a large window, seating, and a white marble service desk." [ref=e433] [cursor=pointer]
              - button [ref=e438] [cursor=pointer]
              - button [ref=e443] [cursor=pointer]
              - button [ref=e448] [cursor=pointer]
              - button [ref=e453] [cursor=pointer]
              - button [ref=e458] [cursor=pointer]
              - button [ref=e463] [cursor=pointer]
              - button [ref=e468] [cursor=pointer]
              - button [ref=e473] [cursor=pointer]
              - button [ref=e478] [cursor=pointer]
              - button [ref=e483] [cursor=pointer]
              - button [ref=e488] [cursor=pointer]
              - button [ref=e493] [cursor=pointer]
              - button [ref=e498] [cursor=pointer]
              - button [ref=e503] [cursor=pointer]
              - button [ref=e508] [cursor=pointer]
            - generic [ref=e510]: Lobby
            - paragraph [ref=e512]:
              - generic [ref=e513]: Slide number
              - text: 1/15
      - generic [ref=e515]:
        - heading "Conveniently located to fit your needs" [level=2] [ref=e516]
        - generic [ref=e517]:
          - article [ref=e518]:
            - heading "Brant Street Pier" [level=3] [ref=e520]
            - paragraph [ref=e521]: 1400 Lakeshore Rd., Burlington, ON, L7S 1Y2
          - article [ref=e522]:
            - heading "Burlington Golf & Country Club" [level=3] [ref=e524]
            - paragraph [ref=e525]: 422 North Shore Blvd E, Burlington, ON, L7T 1W9
          - article [ref=e526]:
            - heading "Burlington Go Station" [level=3] [ref=e528]
            - paragraph [ref=e529]: 2101 Fairview St, Burlington, ON L7R 2C8
          - article [ref=e530]:
            - heading "The Burlington Performing Arts Centre" [level=3] [ref=e532]
            - paragraph [ref=e533]: 440 Locust St, Burlington, ON L7S 1T7
          - article [ref=e534]:
            - heading "Central Public School" [level=3] [ref=e536]
            - paragraph [ref=e537]: 638 Brant St, Burlington, ON, L7R 2H2
          - article [ref=e538]:
            - heading "Fortinos" [level=3] [ref=e540]
            - paragraph [ref=e541]: 1059 Plains Rd E, Burlington, ON L7T 4K1
          - article [ref=e542]:
            - heading "Goodlife" [level=3] [ref=e544]
            - paragraph [ref=e545]: 777 Guelph Line 2nd Floor, Burlington, ON, L7R 3N2
          - article [ref=e546]:
            - heading "Joseph Brant Hospital" [level=3] [ref=e548]
            - paragraph [ref=e549]: 1245 Lakeshore Rd, Burlington, ON, L7S 0A2
          - article [ref=e550]:
            - heading "Kelly's Bake Shoppe" [level=3] [ref=e552]
            - paragraph [ref=e553]: 401 Brant St, Burlington, ON, L7R 2E9
        - button "SHOW MORE" [ref=e555] [cursor=pointer]:
          - paragraph [ref=e557]: SHOW MORE
      - generic [ref=e561]:
        - img "An rendering image of the Toronto Skyline with the CN Tower and Rogers centre in the distance beyond Lake Ontario. In the foreground, there is a lush green park with lots of trees and people dotted throughout." [ref=e567]
        - generic [ref=e572]:
          - heading "Mattamy Homes in The GTA" [level=2] [ref=e573]
          - generic [ref=e574]: Discover the cultural diversity, rich heritage and vibrant energy of Canada's largest metropolitan area.
          - link "Learn More About Living in The GTA" [ref=e576] [cursor=pointer]:
            - /url: /ontario/gta
            - generic [ref=e577]: Learn More About Living in The GTA
      - generic [ref=e583]:
        - generic [ref=e584]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e585]
          - generic [ref=e587]: Required fields are marked with *
          - separator [ref=e588]
        - group [ref=e589]:
          - generic [ref=e590]:
            - textbox "username" [ref=e591]:
              - /placeholder: ""
            - textbox "company" [ref=e592]:
              - /placeholder: ""
            - generic [ref=e593]:
              - generic [ref=e594]: First name *
              - textbox "First name" [ref=e596]:
                - /placeholder: ""
            - generic [ref=e597]:
              - generic [ref=e598]: Last name *
              - textbox "Last name" [ref=e600]:
                - /placeholder: ""
            - generic [ref=e601]:
              - generic [ref=e602]: Email *
              - textbox "Email" [ref=e604]:
                - /placeholder: ""
            - generic [ref=e605]:
              - generic [ref=e606]: Country of Residence *
              - generic [ref=e607]:
                - combobox "Country of Residence" [ref=e608] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e609]:
              - generic [ref=e610]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e612]:
                - /placeholder: ""
            - generic [ref=e613]:
              - generic [ref=e614]: Phone number
              - textbox "Phone number" [ref=e616]:
                - /placeholder: ""
            - generic [ref=e617]:
              - generic [ref=e618]:
                - text: When do you want to move into your home?
                - generic [ref=e619]: "*"
              - generic [ref=e620]:
                - combobox "When do you want to move into your home?" [ref=e621] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e622]:
              - generic [ref=e623]:
                - text: Are you a first time homebuyer?
                - generic [ref=e624]: "*"
              - generic [ref=e625]:
                - combobox "Are you a first time homebuyer?" [ref=e626] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e627]:
              - generic [ref=e628]:
                - text: How many bedrooms do you need?
                - generic [ref=e629]: "*"
              - generic [ref=e630]:
                - combobox "How many bedrooms do you need?" [ref=e631] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e632]:
              - generic [ref=e633]:
                - text: What is your budget?
                - generic [ref=e634]: "*"
              - generic [ref=e635]:
                - combobox "What is your budget?" [ref=e636] [cursor=pointer]:
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
            - generic [ref=e638] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e639]
              - generic [ref=e640]: I am a Real Estate Agent
            - generic [ref=e642] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e643]'
              - generic [ref=e644]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e645]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e646]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e647]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e648]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e649]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e651] [cursor=pointer]
      - generic [ref=e654]:
        - button [ref=e655] [cursor=pointer]:
          - img [ref=e656]
        - generic [ref=e660]:
          - generic [ref=e661]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e662]
            - generic [ref=e664]: Required fields are marked with *
            - separator [ref=e665]
          - generic [ref=e666]:
            - textbox "username" [ref=e667]:
              - /placeholder: ""
            - textbox "company" [ref=e668]:
              - /placeholder: ""
            - generic [ref=e669]:
              - generic [ref=e670]: First name *
              - textbox "First name" [ref=e672]:
                - /placeholder: ""
            - generic [ref=e673]:
              - generic [ref=e674]: Last name *
              - textbox "Last name" [ref=e676]:
                - /placeholder: ""
            - generic [ref=e677]:
              - generic [ref=e678]: Email *
              - textbox "Email" [ref=e680]:
                - /placeholder: ""
            - generic [ref=e681]:
              - generic [ref=e682]: Country of Residence *
              - generic [ref=e683]:
                - combobox "Country of Residence" [ref=e684] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e685]:
              - generic [ref=e686]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e688]:
                - /placeholder: ""
            - generic [ref=e689]:
              - generic [ref=e690]: Phone number
              - textbox "Phone number" [ref=e692]:
                - /placeholder: ""
            - generic [ref=e693]:
              - generic [ref=e694]:
                - text: When do you want to move into your home?
                - generic [ref=e695]: "*"
              - generic [ref=e696]:
                - combobox "When do you want to move into your home?" [ref=e697] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e698]:
              - generic [ref=e699]:
                - text: Are you a first time homebuyer?
                - generic [ref=e700]: "*"
              - generic [ref=e701]:
                - combobox "Are you a first time homebuyer?" [ref=e702] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e703]:
              - generic [ref=e704]:
                - text: How many bedrooms do you need?
                - generic [ref=e705]: "*"
              - generic [ref=e706]:
                - combobox "How many bedrooms do you need?" [ref=e707] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e708]:
              - generic [ref=e709]:
                - text: What is your budget?
                - generic [ref=e710]: "*"
              - generic [ref=e711]:
                - combobox "What is your budget?" [ref=e712] [cursor=pointer]:
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
            - generic [ref=e714] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e715]
              - generic [ref=e716]: I am a Real Estate Agent
            - generic [ref=e718] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e719]'
              - generic [ref=e720]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e721]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e722]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e723]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e724]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e725]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e727] [cursor=pointer]
    - contentinfo "footer" [ref=e728]:
      - generic [ref=e730]:
        - generic [ref=e731]:
          - generic [ref=e732]:
            - heading "Explore" [level=2] [ref=e733]
            - list [ref=e735]:
              - listitem [ref=e736]:
                - link "Find My Home" [ref=e737]:
                  - /url: /search
              - listitem [ref=e738]:
                - link "Design Studio" [ref=e739]:
                  - /url: /design-studio
              - listitem [ref=e740]:
                - link "Customer Care" [ref=e741]:
                  - /url: /customer-care
          - generic [ref=e743]:
            - heading "About Mattamy" [level=2] [ref=e744]
            - list [ref=e746]:
              - listitem [ref=e747]:
                - link "About Us" [ref=e748]:
                  - /url: /about/about-mattamy
              - listitem [ref=e749]:
                - link "Contact Us" [ref=e750]:
                  - /url: /contact
              - listitem [ref=e751]:
                - link "Careers" [ref=e752]:
                  - /url: /about/careers
              - listitem [ref=e753]:
                - link "Media and Investor Relations" [ref=e754]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e756]:
            - heading "Connect With Us" [level=2] [ref=e757]
            - generic [ref=e759]:
              - link "Facebook (opens in a new tab)" [ref=e760]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e761]
              - link "Instagram (opens in a new tab)" [ref=e763]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e764]
              - link "Youtube (opens in a new tab)" [ref=e766]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e767]
              - link "Pinterest (opens in a new tab)" [ref=e769]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e770]
              - link "Linkedin (opens in a new tab)" [ref=e772]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e773]
        - generic [ref=e776]:
          - paragraph [ref=e777]:
            - link "Accessibility" [ref=e778]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e779]: "|"
            - button "Cookie Settings" [ref=e780] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e781]: "|"
            - link "Legal Disclaimers" [ref=e782]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e783]: "|"
            - link "Privacy Policy" [ref=e784]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e785]: "|"
            - link "Terms and Conditions" [ref=e786]:
              - /url: /terms-and-conditions
          - paragraph [ref=e787]: ©2024 Mattamy Homes
  - iframe [ref=e789]:
    - generic [active] [ref=f12e1]:
      - generic:
        - generic:
          - generic:
            - button [ref=f12e2]
            - img "AtlasRTX Digital Assistant icon" [ref=f12e5]:
              - text: Chat with Us
              - strong [ref=f12e8]: "1"
            - button [ref=f12e9]
```

# Test source

```ts
  577 | export async function fillLeadFormFields(
  578 |   form: Locator,
  579 |   data: LeadFieldData,
  580 |   options: FillLeadOptions = {},
  581 | ): Promise<void> {
  582 |   const emailName = options.emailName ?? /^email/i;
  583 | 
  584 |   await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), data.firstName);
  585 |   await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), data.lastName);
  586 |   await fillIfPresent(form.getByRole('textbox', { name: emailName }), data.email);
  587 |   await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), data.phone);
  588 |   await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), data.zip);
  589 | 
  590 |   if (options.selectCountry !== false) {
  591 |     await selectCountryIfPresent(form, data.country);
  592 |   }
  593 | 
  594 |   if (options.selectCommunity) {
  595 |     await selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community/i }).first());
  596 |   }
  597 | 
  598 |   if (options.selectPlan) {
  599 |     await selectFirstOptionIfPresent(
  600 |       form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
  601 |     );
  602 |   }
  603 | 
  604 |   if (options.checkConsent !== false) {
  605 |     await checkConsentIfPresent(form);
  606 |   }
  607 | }
  608 | 
  609 | /**
  610 |  * Assert the expected side-modal form fields for a standard Mattamy lead form.
  611 |  * The common fields are always checked, optional community/plan fields are controlled
  612 |  * by options, and Canada ScheduleAVisit form-specific fields are validated by form id.
  613 |  */
  614 | export async function expectSideModalFormFields(
  615 |   form: Locator,
  616 |   options: SideModalFormOptions = {},
  617 | ): Promise<void> {
  618 |   const initialErrorCount = test.info().errors.length;
  619 |   const timeout = options.timeout ?? 10000;
  620 | 
  621 |   // Asserted unconditionally: every Mattamy lead form collects these, so an
  622 |   // "…IfPresent" check here would let a form that rendered no fields at all pass
  623 |   // a field-validation test. Only genuinely optional fields stay conditional,
  624 |   // and they branch on a known condition (country / form id) rather than on
  625 |   // "did the locator happen to match".
  626 |   const requiredFields: Array<[Locator, string]> = [
  627 |     [form.getByRole('textbox', { name: /first name/i }).first(), 'First name'],
  628 |     [form.getByRole('textbox', { name: /last name/i }).first(), 'Last name'],
  629 |     [form.getByRole('textbox', { name: /^email/i }).first(), 'Email'],
  630 |     [form.getByRole('textbox', { name: /zip|postal/i }).first(), 'Zip/Postal Code'],
  631 |     [form.getByRole('textbox', { name: /phone/i }).first(), 'Phone number'],
  632 |   ];
  633 | 
  634 |   if (options.expectCommunity) {
  635 |     requiredFields.push([form.getByRole('combobox', { name: /community/i }).first(), 'Community']);
  636 |   }
  637 | 
  638 |   if (options.expectPlan) {
  639 |     requiredFields.push([
  640 |       form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
  641 |       'Suite/Floorplan/Plan',
  642 |     ]);
  643 |   }
  644 | 
  645 |   // These four dropdowns are optional on the US / custom forms but required on the Canada
  646 |   // (ScheduleAVisit) forms, so their visibility is only asserted for Canada forms.
  647 |   if (await isCanadaForm(form)) {
  648 |     requiredFields.push(
  649 |       [findSelectByLabel(form, /bedroom/i, 'bedroom'), 'Bedroom Count'],
  650 |       [findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move'), 'Desired Move Date'],
  651 |       [findSelectByLabel(form, /budget/i, 'budget'), 'Budget'],
  652 |       [
  653 |         findSelectByLabel(form, /first.?time.*home.?buyer|first time homebuyer/i, 'buyer'),
  654 |         'First Time Home Buyer',
  655 |       ],
  656 |     );
  657 |   }
  658 | 
  659 |   requiredFields.push([getSubmitButton(form), 'Submit button']);
  660 | 
  661 |   await Promise.all([
  662 |     ...requiredFields.map(([field, label]) =>
  663 |       expectFieldVisible(field, label, timeout, { soft: true }),
  664 |     ),
  665 |     // Country of Residence is not rendered on every form variant.
  666 |     expectFieldVisibleIfPresent(
  667 |       form.getByRole('combobox', { name: /country of residence/i }).first(),
  668 |       'Country of Residence',
  669 |       timeout,
  670 |       { soft: true },
  671 |     ),
  672 |   ]);
  673 | 
  674 |   expect(
  675 |     test.info().errors.slice(initialErrorCount),
  676 |     'Side modal form field audit should have no assertion failures',
> 677 |   ).toHaveLength(0);
      |     ^ Error: Side modal form field audit should have no assertion failures
  678 | }
  679 | 
  680 | /** Fill a side modal form with invalid-email data using the shared profile and form-id branching. */
  681 | export async function fillInvalidSideModalForm(
  682 |   form: Locator,
  683 |   profile: LeadFormProfileKey,
  684 |   options: FillLeadOptions = {},
  685 | ): Promise<void> {
  686 |   await fillLeadFormFields(form, getInvalidLeadData(profile), options);
  687 | }
  688 | 
  689 | /** Fill a side modal form with valid data using the shared profile, including any extra dropdowns present. */
  690 | export async function fillValidSideModalForm(
  691 |   form: Locator,
  692 |   profile: LeadFormProfileKey,
  693 |   options: FillLeadOptions = {},
  694 | ): Promise<ExtraLeadFields> {
  695 |   return fillLeadFormByFormId(form, getValidLeadData(profile), options);
  696 | }
  697 | 
  698 | /*
  699 |  * Extra lead fields: Bedroom Count, Desired Move Date, New Budget and First Time Home Buyer.
  700 |  *
  701 |  * All four render as dropdowns on the US / custom forms (optional there) and on the Canada
  702 |  * (ScheduleAVisit) forms (required there). The helpers fill whichever are present and return the
  703 |  * chosen values so callers can capture them as submission evidence.
  704 |  *
  705 |  * The first three get a random valid value. First Time Home Buyer alternates by iteration (odd
  706 |  * attempt -> Yes, even -> No) when an attempt number is supplied, and is random otherwise.
  707 |  */
  708 | 
  709 | /** Selected values for the extra lead fields; '' for any field that is absent from the form. */
  710 | export type ExtraLeadFields = {
  711 |   bedroomCount: string;
  712 |   desiredMoveDate: string;
  713 |   newBudget: string;
  714 |   firstTimeHomeBuyer: string;
  715 | };
  716 | 
  717 | /** Read the lead form's id/name (checks the element itself, its <form>, and any FormInstance ancestor/descendant). */
  718 | export async function getFormId(form: Locator): Promise<string> {
  719 |   const rawFormId = await form
  720 |     .evaluate((element) => {
  721 |       const container = element instanceof HTMLElement ? element : null;
  722 |       const candidates = [
  723 |         container,
  724 |         container?.closest('form'),
  725 |         container?.closest('[id*="FormInstance"]'),
  726 |         container?.querySelector('form'),
  727 |         container?.querySelector('[id*="FormInstance"]'),
  728 |       ].filter(Boolean) as HTMLElement[];
  729 | 
  730 |       for (const candidate of candidates) {
  731 |         for (const attributeName of ['id', 'name', 'data-form-id', 'data-formid', 'data-testid']) {
  732 |           const value = candidate.getAttribute(attributeName);
  733 | 
  734 |           if (value?.trim()) {
  735 |             return value;
  736 |           }
  737 |         }
  738 |       }
  739 | 
  740 |       return '';
  741 |     })
  742 |     .catch(() => '');
  743 | 
  744 |   return rawFormId ?? '';
  745 | }
  746 | 
  747 | /** True when the lead form belongs to the ScheduleAVisit Canada site (its form id contains "Canada"). */
  748 | export async function isCanadaForm(form: Locator): Promise<boolean> {
  749 |   return /canada/i.test(await getFormId(form));
  750 | }
  751 | 
  752 | /**
  753 |  * Fill a lead form: the standard fields plus whichever of the four extra dropdowns (Bedroom Count,
  754 |  * Desired Move Date, New Budget and First Time Home Buyer) the form renders. The extra fields are
  755 |  * optional on US / custom forms and required on Canada (ScheduleAVisit) forms, so filling those
  756 |  * that are present covers both. Each extra dropdown gets a valid option, so required fields never
  757 |  * block submission. Returns the extra field values chosen (all '' when none are present) so callers
  758 |  * can capture them as evidence. Pass an attempt number to alternate First Time Home Buyer by
  759 |  * iteration (odd -> Yes, even -> No).
  760 |  */
  761 | export async function fillLeadFormByFormId(
  762 |   form: Locator,
  763 |   data: LeadFieldData,
  764 |   options: FillLeadOptions = {},
  765 |   attempt?: number,
  766 | ): Promise<ExtraLeadFields> {
  767 |   await fillLeadFormFields(form, data, options);
  768 | 
  769 |   return fillExtraLeadFieldsIfPresent(form, attempt);
  770 | }
  771 | 
  772 | /**
  773 |  * Fill whichever of the four extra dropdowns (Bedroom Count, Desired Move Date, New Budget and
  774 |  * First Time Home Buyer) are present, returning the values chosen (all '' when none are present).
  775 |  * The fields are optional on US / custom forms and required on Canada (ScheduleAVisit) forms, so
  776 |  * this fills them regardless of the form's country. Use it after filling the standard fields with a
  777 |  * custom, field-level fill method (i.e. where {@link fillLeadFormByFormId} can't be used directly).
```