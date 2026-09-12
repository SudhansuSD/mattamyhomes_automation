# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: QMIPage.spec.ts >> QMI Detail Page Tests - USA >> Lead Form >> @smoke @regression @qmi-form-fields | USA | Validate QMI side modal form fields
- Location: tests/QMIPage.spec.ts:108:9

# Error details

```
Error: Comments field should be visible

expect(locator).toBeVisible() failed

Locator:  locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByRole('textbox', { name: /additional questions|comment|message|special requirement/i }).or(locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().locator('textarea')).first()
Expected: visible
Received: hidden
Timeout:  20000ms

Call log:
  - Comments field should be visible with timeout 20000ms
  - waiting for locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByRole('textbox', { name: /additional questions|comment|message|special requirement/i }).or(locator('#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().locator('textarea')).first()
    23 × locator resolved to <textarea rows="4" disabled placeholder="" maxlength="512" name="aditional-requirements" class="placeholder_mattamy_blue" aria-label="Additional questions or special requirements" data-field-title="Additional questions or special requirements" id="fxb_af52a839-a98f-4a52-a686-d738832225c5_Fields_fbcdf249-5a94-4a95-9f6f-456381776300__Value-FormsModalInstance0"></textarea>
       - unexpected value "hidden"

```

```
Error: Side modal form field audit should have no assertion failures

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"cause": undefined, "message": "Error: Comments field should be visible·
expect(locator).toBeVisible() failed·
Locator:  locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('textbox', { name: /additional questions|comment|message|special requirement/i }).or(locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().locator('textarea')).first()
Expected: visible
Received: hidden
Timeout:  20000ms·
Call log:
  - Comments field should be visible with timeout 20000ms
  - waiting for locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('textbox', { name: /additional questions|comment|message|special requirement/i }).or(locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().locator('textarea')).first()
    23 × locator resolved to <textarea rows=\"4\" disabled placeholder=\"\" maxlength=\"512\" name=\"aditional-requirements\" class=\"placeholder_mattamy_blue\" aria-label=\"Additional questions or special requirements\" data-field-title=\"Additional questions or special requirements\" id=\"fxb_af52a839-a98f-4a52-a686-d738832225c5_Fields_fbcdf249-5a94-4a95-9f6f-456381776300__Value-FormsModalInstance0\"></textarea>
       - unexpected value \"hidden\"
", "stack": "Error: Comments field should be visible·
expect(locator).toBeVisible() failed·
Locator:  locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('textbox', { name: /additional questions|comment|message|special requirement/i }).or(locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().locator('textarea')).first()
Expected: visible
Received: hidden
Timeout:  20000ms·
Call log:
  - Comments field should be visible with timeout 20000ms
  - waiting for locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByRole('textbox', { name: /additional questions|comment|message|special requirement/i }).or(locator('#ModalForm:visible, [id*=\"ModalForm\"]:visible, .ReactModal__Content:visible, [role=\"dialog\"]:visible, aside:visible, [class*=\"drawer\" i]:visible, [class*=\"sidebar\" i]:visible').filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().locator('textarea')).first()
    23 × locator resolved to <textarea rows=\"4\" disabled placeholder=\"\" maxlength=\"512\" name=\"aditional-requirements\" class=\"placeholder_mattamy_blue\" aria-label=\"Additional questions or special requirements\" data-field-title=\"Additional questions or special requirements\" id=\"fxb_af52a839-a98f-4a52-a686-d738832225c5_Fields_fbcdf249-5a94-4a95-9f6f-456381776300__Value-FormsModalInstance0\"></textarea>
       - unexpected value \"hidden\"·
    at expectFieldVisible (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:446:19)
    at map (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:649:7)
    at expectSideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:648:45)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/pages/QMIPage.ts:407:38
    at QMIPage.verifySideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/pages/QMIPage.ts:400:5)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/QMIPage.spec.ts:110:9
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/QMIPage.spec.ts:109:7"}]
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
        - link "294 W Flax Dr Quick Move-In Mattamy logo at Landmarke in San Tan Valley Arizona by Mattamy Homes. Go to HomePage" [ref=e9]:
          - /url: /
          - figure [ref=e10]:
            - img "294 W Flax Dr Quick Move-In Mattamy logo at Landmarke in San Tan Valley Arizona by Mattamy Homes" [ref=e11]
        - button "Navigation menu." [ref=e12] [cursor=pointer]:
          - img [ref=e13]
    - link "Navigate to Top." [ref=e15] [cursor=pointer]:
      - img [ref=e16]
    - main [ref=e18]:
      - link "Go to Crimson" [ref=e24]:
        - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/crimson
        - text: Crimson
      - 'region "Images and videos of: 294 W FLAX DR" [ref=e28]':
        - generic [ref=e31]:
          - img "Elevation Front with window and garage" [ref=e37]
          - img [ref=e60]
        - radiogroup "Content type" [ref=e61] [cursor=pointer]:
          - radio "Select 360 Toursfilter" [ref=e62]:
            - img [ref=e64]
            - generic [ref=e67]: 360 Tours
          - radio "Select Photosfilter" [ref=e68]:
            - img [ref=e70]
            - generic [ref=e73]: Photos
        - paragraph [ref=e75]: Flex Room
        - img "message flag logo image" [ref=e77]
        - paragraph [ref=e79]: Ready Now
        - paragraph [ref=e81]: 1/19
      - generic [ref=e83]:
        - generic [ref=e84]:
          - link "294 W FLAX DR" [ref=e86]:
            - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/crimson/294-w-flax-dr#sitemap
            - heading "294 W FLAX DR" [level=1] [ref=e87]:
              - generic [ref=e88]: 294 W FLAX DR
          - paragraph [ref=e89]:
            - generic [ref=e90]: 4 Beds|
            - generic [ref=e91]: 3 Baths
          - paragraph [ref=e93]:
            - generic [ref=e94]: 2,657 Sq. Ft.|
            - generic [ref=e95]: 3 Car Garage
            - generic [ref=e96]: "|"
            - 'link "Homesite: 1203" [ref=e97]':
              - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/crimson/294-w-flax-dr#sitemap
              - generic [ref=e98]: "Homesite: 1203"
        - generic [ref=e99]:
          - paragraph [ref=e100]:
            - generic [ref=e101]: $603,003
          - generic [ref=e102]:
            - img "Calculator Icon" [ref=e103]
            - button "Estimated P&I $3,120" [ref=e111] [cursor=pointer]
            - img [ref=e112]
          - link "Get Pre-Qualified OpenNewTab Icon" [ref=e115] [cursor=pointer]:
            - /url: https://apply.mattamyhf.com/#/milestones?referrerId=matphx%40mattamyhf.com&loanType=MORTGAGE
            - generic [ref=e116]:
              - text: Get Pre-Qualified
              - img "OpenNewTab Icon" [ref=e117]
      - generic [ref=e121]:
        - heading "Interactive Floorplan" [level=2] [ref=e122]
        - generic [ref=e124]: Create your dream home with our selection of options, and use the furniture tool to design each room.
        - button "View Floorplan" [ref=e126] [cursor=pointer]:
          - generic [ref=e127]: View Floorplan
      - generic [ref=e129]:
        - heading "Explore the community" [level=2] [ref=e130]
        - generic [ref=e131]: Take a closer look at the community sitemap and get familiar with our available offerings.
        - button "VIEW SITEMAP" [ref=e132] [cursor=pointer]:
          - generic [ref=e133]: VIEW SITEMAP
      - generic [ref=e136]:
        - generic [ref=e137]:
          - heading "Home Design Details" [level=2] [ref=e138]
          - button "Collapse Information" [expanded] [ref=e139] [cursor=pointer]
        - generic [ref=e144]: Desert Modern Elevation.
      - generic [ref=e148]:
        - heading "Curated Home Features" [level=2] [ref=e149]
        - button "Expand for more information" [ref=e150] [cursor=pointer]
      - generic [ref=e156]:
        - heading "Green Home Features" [level=2] [ref=e157]
        - button "Expand for more information" [ref=e158] [cursor=pointer]
      - generic [ref=e164]:
        - paragraph [ref=e166]: Mortgage Calculator
        - button "Get Started Expand calculator" [ref=e169] [cursor=pointer]:
          - generic [ref=e170]: Get Started
      - generic [ref=e175]:
        - heading "We're with you all the way to the front door" [level=2] [ref=e176]
        - button "Expand for more information" [ref=e177] [cursor=pointer]
      - generic [ref=e183]:
        - generic [ref=e185]:
          - generic [ref=e187]:
            - heading "New Home Gallery" [level=3] [ref=e188]
            - generic [ref=e190]:
              - generic [ref=e191]:
                - img [ref=e193]
                - link "Go to 38389 N. Sandpiper Court San Tan Valley Arizona 85140. Opens in Googlemaps" [ref=e196]:
                  - /url: https://maps.google.com/maps?cid=662989070378364335
                  - text: Directions
              - generic [ref=e197]:
                - img [ref=e199]
                - link "Call to 602-900-8591" [ref=e201]:
                  - /url: tel:602-900-8591
                  - text: Call
          - generic [ref=e202]:
            - heading "Hours" [level=3] [ref=e203]
            - generic [ref=e204]:
              - img [ref=e206]
              - button "Show Schedule" [ref=e209] [cursor=pointer]:
                - paragraph [ref=e210]: Closed Now
                - img [ref=e212]
        - generic [ref=e215]:
          - generic [ref=e216]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e217]
            - generic [ref=e219]: Required fields are marked with *
            - separator [ref=e220]
          - group [ref=e221]:
            - generic [ref=e222]:
              - textbox "username" [ref=e223]:
                - /placeholder: ""
              - textbox "company" [ref=e224]:
                - /placeholder: ""
              - generic [ref=e225]:
                - generic [ref=e226]: First name *
                - textbox "First name" [ref=e228]:
                  - /placeholder: ""
              - generic [ref=e229]:
                - generic [ref=e230]: Last name *
                - textbox "Last name" [ref=e232]:
                  - /placeholder: ""
              - generic [ref=e233]:
                - generic [ref=e234]: Email *
                - textbox "Email" [ref=e236]:
                  - /placeholder: ""
              - generic [ref=e237]:
                - generic [ref=e238]: Country of Residence *
                - generic [ref=e239]:
                  - combobox "Country of Residence" [ref=e240] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "Canada"
                    - option "United States"
                    - option "Other"
                  - generic:
                    - img
              - generic [ref=e241]:
                - generic [ref=e242]: Zip/Postal Code *
                - textbox "Zip/Postal Code" [ref=e244]:
                  - /placeholder: ""
              - generic [ref=e245]:
                - generic [ref=e246]: Phone number
                - textbox "Phone number" [ref=e248]:
                  - /placeholder: ""
              - generic [ref=e249]:
                - generic [ref=e250]: When do you want to move into your home?
                - generic [ref=e251]:
                  - combobox "When do you want to move into your home?" [ref=e252] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "0-3 Months"
                    - option "3-6 Months"
                    - option "6-12 Months"
                    - option "12+ Months"
                  - generic:
                    - img
              - generic [ref=e253]:
                - generic [ref=e254]: How many bedrooms do you need?
                - generic [ref=e255]:
                  - combobox "How many bedrooms do you need?" [ref=e256] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "1"
                    - option "2"
                    - option "3"
                    - option "4"
                    - option "5+"
                  - generic:
                    - img
              - generic [ref=e257]:
                - generic [ref=e258]: What is your budget?
                - generic [ref=e259]:
                  - combobox "What is your budget?" [ref=e260] [cursor=pointer]:
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
              - generic [ref=e262] [cursor=pointer]:
                - checkbox "I am a Real Estate Agent" [ref=e263]
                - generic [ref=e264]: I am a Real Estate Agent
              - generic [ref=e266] [cursor=pointer]:
                - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e267]'
                - generic [ref=e268]:
                  - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                  - link "SMS Privacy Policy" [ref=e269]:
                    - /url: /sms-privacy-policy
                  - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                  - link "Privacy Policy" [ref=e270]:
                    - /url: /privacy-policy
                  - text: ","
                  - link "SMS Privacy Policy" [ref=e271]:
                    - /url: /sms-privacy-policy
                  - text: ","
                  - link "SMS Terms of Service" [ref=e272]:
                    - /url: /sms-terms-of-service
                  - text: ", and/or"
                  - link "Contact Us" [ref=e273]:
                    - /url: /contact-us
                  - text: .
              - button "SUBMIT" [ref=e275] [cursor=pointer]
      - generic [ref=e278]:
        - button [ref=e279] [cursor=pointer]:
          - img [ref=e280]
        - generic [ref=e284]:
          - generic [ref=e285]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e286]
            - generic [ref=e288]: Required fields are marked with *
            - separator [ref=e289]
          - generic [ref=e290]:
            - textbox "username" [ref=e291]:
              - /placeholder: ""
            - textbox "company" [ref=e292]:
              - /placeholder: ""
            - generic [ref=e293]:
              - generic [ref=e294]: First name *
              - textbox "First name" [ref=e296]:
                - /placeholder: ""
            - generic [ref=e297]:
              - generic [ref=e298]: Last name *
              - textbox "Last name" [ref=e300]:
                - /placeholder: ""
            - generic [ref=e301]:
              - generic [ref=e302]: Email *
              - textbox "Email" [ref=e304]:
                - /placeholder: ""
            - generic [ref=e305]:
              - generic [ref=e306]: Country of Residence *
              - generic [ref=e307]:
                - combobox "Country of Residence" [ref=e308] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e309]:
              - generic [ref=e310]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e312]:
                - /placeholder: ""
            - generic [ref=e313]:
              - generic [ref=e314]: Phone number
              - textbox "Phone number" [ref=e316]:
                - /placeholder: ""
            - generic [ref=e317]:
              - generic [ref=e318]: When do you want to move into your home?
              - generic [ref=e319]:
                - combobox "When do you want to move into your home?" [ref=e320] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e321]:
              - generic [ref=e322]: How many bedrooms do you need?
              - generic [ref=e323]:
                - combobox "How many bedrooms do you need?" [ref=e324] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e325]:
              - generic [ref=e326]: What is your budget?
              - generic [ref=e327]:
                - combobox "What is your budget?" [ref=e328] [cursor=pointer]:
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
            - generic [ref=e330] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e331]
              - generic [ref=e332]: I am a Real Estate Agent
            - generic [ref=e334] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e335]'
              - generic [ref=e336]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e337]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e338]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e339]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e340]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e341]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e343] [cursor=pointer]
      - generic [ref=e344]:
        - generic [ref=e348]:
          - heading "Quick Move-In Homes ready when you are" [level=2] [ref=e349]
          - generic [ref=e350]: If time is of the essence, then our Quick Move-In Homes are for you.
          - link "View all" [ref=e352] [cursor=pointer]:
            - /url: /search?productType=qmi&metro=Phoenix&country=USA&community=Landmarke &hideMap=true
            - generic [ref=e353]: View all
        - generic [ref=e355]:
          - generic [ref=e356]:
            - generic [ref=e357]:
              - paragraph [ref=e359]: Ready Now
              - paragraph [ref=e361]: Self-Tour
            - generic [ref=e363]:
              - link "Elevation Front with garage, door and window" [ref=e366]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/839-w-riparian-dr
                - img "Elevation Front with garage, door and window" [ref=e369]
              - link "View 839 W RIPARIAN DR information.Aqua Floorplan | Single Family 1,837 Sq. Ft. 3 Beds 2 Baths 0 Half Bath 2 Car Garage $429,999" [ref=e371]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/839-w-riparian-dr
                - generic [ref=e372]: 839 W RIPARIAN DR
                - generic [ref=e373]: Aqua Floorplan | Single Family
                - generic [ref=e376]:
                  - paragraph [ref=e378]: 1,837 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e380]: 2 Car Garage
                  - paragraph [ref=e382]: $429,999
              - button "Mark as favorite" [ref=e383] [cursor=pointer]:
                - img "Favorite Icon" [ref=e384]
          - generic [ref=e386]:
            - paragraph [ref=e389]: Ready Now
            - generic [ref=e391]:
              - link "Elevation Front with garage, window, door and exterior stone" [ref=e394]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/793-w-riparian-dr
                - img "Elevation Front with garage, window, door and exterior stone" [ref=e397]
              - link "View 793 W RIPARIAN DR information.Aqua Floorplan | Single Family 1,837 Sq. Ft. 3 Beds 2 Baths 0 Half Bath 2 Car Garage $472,648" [ref=e399]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/793-w-riparian-dr
                - generic [ref=e400]: 793 W RIPARIAN DR
                - generic [ref=e401]: Aqua Floorplan | Single Family
                - generic [ref=e404]:
                  - paragraph [ref=e406]: 1,837 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e408]: 2 Car Garage
                  - paragraph [ref=e410]: $472,648
              - button "Mark as favorite" [ref=e411] [cursor=pointer]:
                - img "Favorite Icon" [ref=e412]
          - generic [ref=e414]:
            - generic [ref=e415]:
              - paragraph [ref=e417]: Ready Now
              - paragraph [ref=e419]: Self-Tour
            - generic [ref=e421]:
              - link "Elevation Front with garage and window" [ref=e424]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/azure/823-w-riparian-dr
                - img "Elevation Front with garage and window" [ref=e427]
              - link "View 823 W RIPARIAN DR information.Azure Floorplan | Single Family 2,064 Sq. Ft. 3 Beds 2 Baths 0 Half Bath 3 Car Garage $487,040" [ref=e429]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/azure/823-w-riparian-dr
                - generic [ref=e430]: 823 W RIPARIAN DR
                - generic [ref=e431]: Azure Floorplan | Single Family
                - generic [ref=e434]:
                  - paragraph [ref=e436]: 2,064 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e438]: 3 Car Garage
                  - paragraph [ref=e440]: $487,040
              - button "Mark as favorite" [ref=e441] [cursor=pointer]:
                - img "Favorite Icon" [ref=e442]
          - generic [ref=e444]:
            - paragraph [ref=e447]: Ready Now
            - generic [ref=e449]:
              - link "Elevation Front with window, garage and door" [ref=e452]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/760-w-riparian-dr
                - img "Elevation Front with window, garage and door" [ref=e455]
              - link "View 760 W RIPARIAN DR information.Aqua Floorplan | Single Family 1,837 Sq. Ft. 3 Beds 2 Baths 0 Half Bath 2 Car Garage $493,402" [ref=e457]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/760-w-riparian-dr
                - generic [ref=e458]: 760 W RIPARIAN DR
                - generic [ref=e459]: Aqua Floorplan | Single Family
                - generic [ref=e462]:
                  - paragraph [ref=e464]: 1,837 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e466]: 2 Car Garage
                  - paragraph [ref=e468]: $493,402
              - button "Mark as favorite" [ref=e469] [cursor=pointer]:
                - img "Favorite Icon" [ref=e470]
          - button "SHOW MORE" [ref=e472] [cursor=pointer]:
            - paragraph [ref=e474]: SHOW MORE
      - generic [ref=e476]:
        - heading "294 W FLAX DR" [level=2] [ref=e478]
        - generic [ref=e479]:
          - link "Contact Us" [ref=e480] [cursor=pointer]:
            - generic [ref=e481]: Contact Us
          - link "Get Information" [active] [ref=e482] [cursor=pointer]:
            - generic [ref=e483]: Get Information
      - button "View promotions" [ref=e485] [cursor=pointer]:
        - generic [ref=e486]: View promotions
        - img [ref=e487]
    - contentinfo "footer" [ref=e489]:
      - generic [ref=e491]:
        - generic [ref=e492]:
          - generic [ref=e493]:
            - heading "Explore" [level=2] [ref=e494]
            - list [ref=e496]:
              - listitem [ref=e497]:
                - link "Find My Home" [ref=e498]:
                  - /url: /search
              - listitem [ref=e499]:
                - link "Design Studio" [ref=e500]:
                  - /url: /design-studio
              - listitem [ref=e501]:
                - link "Customer Care" [ref=e502]:
                  - /url: /customer-care
          - generic [ref=e504]:
            - heading "About Mattamy" [level=2] [ref=e505]
            - list [ref=e507]:
              - listitem [ref=e508]:
                - link "About Us" [ref=e509]:
                  - /url: /about/about-mattamy
              - listitem [ref=e510]:
                - link "Contact Us" [ref=e511]:
                  - /url: /contact
              - listitem [ref=e512]:
                - link "Careers" [ref=e513]:
                  - /url: /about/careers
              - listitem [ref=e514]:
                - link "Media and Investor Relations" [ref=e515]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e517]:
            - heading "Connect With Us" [level=2] [ref=e518]
            - generic [ref=e520]:
              - link "Facebook (opens in a new tab)" [ref=e521]:
                - /url: fb://profile/MattamyHomesUSA
                - img [ref=e522]
              - link "Instagram (opens in a new tab)" [ref=e524]:
                - /url: instagram://user?username=mattamyhomesusa
                - img [ref=e525]
              - link "Youtube (opens in a new tab)" [ref=e527]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e528]
              - link "Pinterest (opens in a new tab)" [ref=e530]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e531]
              - link "Linkedin (opens in a new tab)" [ref=e533]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e534]
        - generic [ref=e537]:
          - paragraph [ref=e538]:
            - link "Accessibility" [ref=e539]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e540]: "|"
            - button "Cookie Settings" [ref=e541] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e542]: "|"
            - link "Legal Disclaimers" [ref=e543]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e544]: "|"
            - link "Privacy Policy" [ref=e545]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e546]: "|"
            - link "Terms and Conditions" [ref=e547]:
              - /url: /terms-and-conditions
              - text: Terms and Conditions
              - generic [ref=e548]: "|"
            - link "About Us" [ref=e549]:
              - /url: /about/about-mattamy
          - paragraph [ref=e550]:
            - img "copyright disclaimer logo" [ref=e551]
            - text: Copyright © 2025 Mattamy Homes. All rights reserved.
  - iframe [ref=e553]:
    - generic [active] [ref=f11e1]:
      - generic:
        - generic:
          - generic:
            - button [ref=f11e2]
            - generic [ref=f11e3]:
              - button "Close" [ref=f11e4]:
                - img [ref=f11e6]
              - application "AtlasRTX Digital Assistant" [ref=f11e9]:
                - generic [ref=f11e11]:
                  - text: It looks like you're interested in this lovely move-in ready home. Here is a quick overview of what it has to offer.
                  - emphasis [ref=f11e12]: Quick Move-In Home
                  - strong [ref=f11e13]: CRIMSON PLAN
                  - text: 294 W FLAX DR San Tan Valley, AZ 85140
                  - emphasis [ref=f11e14]: AVAILABLE NOW
                  - text: Priced at $603,003
                  - emphasis [ref=f11e15]: 4 bedrooms
                  - text: •
                  - emphasis [ref=f11e16]: 3 full bathrooms
                  - text: •
                  - emphasis [ref=f11e17]: 2657 square feet
                  - text: •
                  - emphasis [ref=f11e18]: 3 garage spaces
                  - text: What would you like to know about this home?
              - img "AtlasRTX Digital Assistant icon" [ref=f11e20]:
                - text: Chat with Us
                - strong [ref=f11e23]: "1"
            - button [ref=f11e24]
```

# Test source

```ts
  556 | // Composite fill (getByRole-based forms)
  557 | 
  558 | export type FillLeadOptions = {
  559 |   emailName?: RegExp;
  560 |   selectCountry?: boolean;
  561 |   selectCommunity?: boolean;
  562 |   selectPlan?: boolean;
  563 |   checkConsent?: boolean;
  564 | };
  565 | 
  566 | export type SideModalFormOptions = FillLeadOptions & {
  567 |   timeout?: number;
  568 |   formName?: string;
  569 |   location?: LocationKey;
  570 |   expectCommunity?: boolean;
  571 |   expectPlan?: boolean;
  572 | };
  573 | 
  574 | /**
  575 |  * Fill a standard getByRole-based lead form from {@link LeadFieldData}.
  576 |  * Each field is only touched when present, so the same call works for
  577 |  * forms with differing field sets.
  578 |  */
  579 | export async function fillLeadFormFields(
  580 |   form: Locator,
  581 |   data: LeadFieldData,
  582 |   options: FillLeadOptions = {},
  583 | ): Promise<void> {
  584 |   const emailName = options.emailName ?? /^email/i;
  585 | 
  586 |   await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), data.firstName);
  587 |   await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), data.lastName);
  588 |   await fillIfPresent(form.getByRole('textbox', { name: emailName }), data.email);
  589 |   await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), data.phone);
  590 |   await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), data.zip);
  591 | 
  592 |   if (options.selectCountry !== false) {
  593 |     await selectCountryIfPresent(form, data.country);
  594 |   }
  595 | 
  596 |   if (options.selectCommunity) {
  597 |     await selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community/i }).first());
  598 |   }
  599 | 
  600 |   if (options.selectPlan) {
  601 |     await selectFirstOptionIfPresent(
  602 |       form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
  603 |     );
  604 |   }
  605 | 
  606 |   if (options.checkConsent !== false) {
  607 |     await checkConsentIfPresent(form);
  608 |   }
  609 | }
  610 | 
  611 | /**
  612 |  * Assert the expected side-modal form fields for a standard Mattamy lead form.
  613 |  * The common fields are always checked, schema-required fields come from the
  614 |  * central form declaration, and community/plan dropdowns stay explicit because
  615 |  * they depend on the page context that opened the modal.
  616 |  */
  617 | export async function expectSideModalFormFields(
  618 |   form: Locator,
  619 |   options: SideModalFormOptions = {},
  620 | ): Promise<void> {
  621 |   const initialErrorCount = test.info().errors.length;
  622 |   const timeout = options.timeout ?? 10000;
  623 |   const location = options.location ?? (getLocationConfig().country as LocationKey);
  624 |   const formName = options.formName ?? 'side modal form';
  625 | 
  626 |   const requiredFields: Array<[Locator, string]> = [
  627 |     ...getBaseSideModalFieldExpectations(form),
  628 |     ...getExpectedLeadFormFields(location, formName).map((field): [Locator, string] => [
  629 |       getLeadFormFieldLocator(form, field).first(),
  630 |       getLeadFormFieldLabel(field),
  631 |     ]),
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
  645 |   requiredFields.push([getSubmitButton(form), 'Submit button']);
  646 | 
  647 |   await Promise.all(
  648 |     dedupeFieldExpectations(requiredFields).map(([field, label]) =>
  649 |       expectFieldVisible(field, label, timeout, { soft: true }),
  650 |     ),
  651 |   );
  652 | 
  653 |   expect(
  654 |     test.info().errors.slice(initialErrorCount),
  655 |     'Side modal form field audit should have no assertion failures',
> 656 |   ).toHaveLength(0);
      |     ^ Error: Side modal form field audit should have no assertion failures
  657 | }
  658 | 
  659 | function getBaseSideModalFieldExpectations(form: Locator): Array<[Locator, string]> {
  660 |   return [
  661 |     [form.getByRole('textbox', { name: /first name/i }).first(), 'First name'],
  662 |     [form.getByRole('textbox', { name: /last name/i }).first(), 'Last name'],
  663 |     [form.getByRole('textbox', { name: /^email/i }).first(), 'Email'],
  664 |     [form.getByRole('textbox', { name: /zip|postal/i }).first(), 'Zip/Postal Code'],
  665 |     [form.getByRole('textbox', { name: /phone/i }).first(), 'Phone number'],
  666 |   ];
  667 | }
  668 | 
  669 | function getLeadFormFieldLocator(form: Locator, field: LeadFormField): Locator {
  670 |   const locators: Record<LeadFormField, Locator> = {
  671 |     comments: form
  672 |       .getByRole('textbox', { name: /additional questions|comment|message|special requirement/i })
  673 |       .or(form.locator('textarea')),
  674 |     bedroomCount: findSelectByLabel(form, /bedroom/i, 'bedroom'),
  675 |     desiredMoveDate: findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move'),
  676 |     newBudget: findSelectByLabel(form, /budget/i, 'budget'),
  677 |     firstTimeHomeBuyer: findSelectByLabel(
  678 |       form,
  679 |       /first.?time.*home.?buyer|first time homebuyer/i,
  680 |       'buyer',
  681 |     ),
  682 |     countryOfResidence: findSelectByLabel(form, /country of residence/i, 'country'),
  683 |   };
  684 | 
  685 |   return locators[field];
  686 | }
  687 | 
  688 | function getLeadFormFieldLabel(field: LeadFormField): string {
  689 |   const labels: Record<LeadFormField, string> = {
  690 |     comments: 'Comments',
  691 |     bedroomCount: 'Bedroom Count',
  692 |     desiredMoveDate: 'Desired Move Date',
  693 |     newBudget: 'Budget',
  694 |     firstTimeHomeBuyer: 'First Time Home Buyer',
  695 |     countryOfResidence: 'Country of Residence',
  696 |   };
  697 | 
  698 |   return labels[field];
  699 | }
  700 | 
  701 | function dedupeFieldExpectations(fields: Array<[Locator, string]>): Array<[Locator, string]> {
  702 |   const seenLabels = new Set<string>();
  703 | 
  704 |   return fields.filter(([, label]) => {
  705 |     if (seenLabels.has(label)) {
  706 |       return false;
  707 |     }
  708 | 
  709 |     seenLabels.add(label);
  710 |     return true;
  711 |   });
  712 | }
  713 | 
  714 | /** Fill a side modal form with invalid-email data using the shared profile and form-id branching. */
  715 | export async function fillInvalidSideModalForm(
  716 |   form: Locator,
  717 |   profile: LeadFormProfileKey,
  718 |   options: FillLeadOptions = {},
  719 | ): Promise<void> {
  720 |   await fillLeadFormFields(form, getInvalidLeadData(profile), options);
  721 | }
  722 | 
  723 | /** Fill a side modal form with valid data using the shared profile, including any extra dropdowns present. */
  724 | export async function fillValidSideModalForm(
  725 |   form: Locator,
  726 |   profile: LeadFormProfileKey,
  727 |   options: FillLeadOptions = {},
  728 | ): Promise<ExtraLeadFields> {
  729 |   return fillLeadFormByFormId(form, getValidLeadData(profile), options);
  730 | }
  731 | 
  732 | /*
  733 |  * Extra lead fields: Bedroom Count, Desired Move Date, New Budget and First Time Home Buyer.
  734 |  *
  735 |  * All four render as dropdowns on the US / custom forms (optional there) and on the Canada
  736 |  * (ScheduleAVisit) forms (required there). The helpers fill whichever are present and return the
  737 |  * chosen values so callers can capture them as submission evidence.
  738 |  *
  739 |  * The first three get a random valid value. First Time Home Buyer alternates by iteration (odd
  740 |  * attempt -> Yes, even -> No) when an attempt number is supplied, and is random otherwise.
  741 |  */
  742 | 
  743 | /** Selected values for the extra lead fields; '' for any field that is absent from the form. */
  744 | export type ExtraLeadFields = {
  745 |   bedroomCount: string;
  746 |   desiredMoveDate: string;
  747 |   newBudget: string;
  748 |   firstTimeHomeBuyer: string;
  749 | };
  750 | 
  751 | /** Read the lead form's id/name (checks the element itself, its <form>, and any FormInstance ancestor/descendant). */
  752 | export async function getFormId(form: Locator): Promise<string> {
  753 |   const rawFormId = await form
  754 |     .evaluate((element) => {
  755 |       const container = element instanceof HTMLElement ? element : null;
  756 |       const candidates = [
```