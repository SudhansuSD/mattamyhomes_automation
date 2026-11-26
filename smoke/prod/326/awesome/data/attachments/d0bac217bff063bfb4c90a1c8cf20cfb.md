# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communityPage.spec.ts >> Community Detail - Yorkville >> Lead Form >> Get Information Form Validation >> @smoke @regression | CAN | Validate community sideModalForm fields
- Location: tests/communityPage.spec.ts:99:11

# Error details

```
Error: Are you a first time homebuyer? required-field error should be visible

expect(locator).toBeVisible() failed

Locator: locator('#ModalForm, [id*="ModalForm"], .ReactModal__Content, [role="dialog"], aside, [class*="drawer" i], [class*="sidebar" i]').filter({ visible: true }).filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByText(/Are you a first time homebuyer\?\s*(?:is\s*)?Required/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Are you a first time homebuyer? required-field error should be visible with timeout 10000ms
  - waiting for locator('#ModalForm, [id*="ModalForm"], .ReactModal__Content, [role="dialog"], aside, [class*="drawer" i], [class*="sidebar" i]').filter({ visible: true }).filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).and(locator(':not([aria-label*="promotion" i]):not([aria-label*="notification" i])')).first().getByText(/Are you a first time homebuyer\?\s*(?:is\s*)?Required/i).first()

```

```
Error: Required-field error audit should have no assertion failures

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"cause": undefined, "message": "Error: Are you a first time homebuyer? required-field error should be visible·
expect(locator).toBeVisible() failed·
Locator: locator('#ModalForm, [id*=\"ModalForm\"], .ReactModal__Content, [role=\"dialog\"], aside, [class*=\"drawer\" i], [class*=\"sidebar\" i]').filter({ visible: true }).filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByText(/Are you a first time homebuyer\\?\\s*(?:is\\s*)?Required/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found·
Call log:
  - Are you a first time homebuyer? required-field error should be visible with timeout 10000ms
  - waiting for locator('#ModalForm, [id*=\"ModalForm\"], .ReactModal__Content, [role=\"dialog\"], aside, [class*=\"drawer\" i], [class*=\"sidebar\" i]').filter({ visible: true }).filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByText(/Are you a first time homebuyer\\?\\s*(?:is\\s*)?Required/i).first()
", "stack": "Error: Are you a first time homebuyer? required-field error should be visible·
expect(locator).toBeVisible() failed·
Locator: locator('#ModalForm, [id*=\"ModalForm\"], .ReactModal__Content, [role=\"dialog\"], aside, [class*=\"drawer\" i], [class*=\"sidebar\" i]').filter({ visible: true }).filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByText(/Are you a first time homebuyer\\?\\s*(?:is\\s*)?Required/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found·
Call log:
  - Are you a first time homebuyer? required-field error should be visible with timeout 10000ms
  - waiting for locator('#ModalForm, [id*=\"ModalForm\"], .ReactModal__Content, [role=\"dialog\"], aside, [class*=\"drawer\" i], [class*=\"sidebar\" i]').filter({ visible: true }).filter({ has: locator('button[type=\"submit\"], input[type=\"submit\"], button:has-text(\"Submit\"), [role=\"button\"]:has-text(\"Submit\")') }).and(locator(':not([aria-label*=\"promotion\" i]):not([aria-label*=\"notification\" i])')).first().getByText(/Are you a first time homebuyer\\?\\s*(?:is\\s*)?Required/i).first()·
    at expectRequiredErrorsInForm (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:521:8)
    at expectSideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/utils/leadform/leadFormHelper.ts:642:3)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/pages/CommunityPage.ts:1184:7
    at CommunityPage.verifySideModalFormFields (/__w/mattamyhomes_automation/mattamyhomes_automation/pages/CommunityPage.ts:1175:5)
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/communityPage.spec.ts:101:11
    at /__w/mattamyhomes_automation/mattamyhomes_automation/tests/communityPage.spec.ts:100:9"}]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e6]:
    - generic [ref=e11]:
      - text: Government Tax Rebates Available on New Homes!
      - link "Learn More" [ref=e12]:
        - /url: http://mattamyhomes.com/promos/government-rebates
  - generic [ref=e14]:
    - banner [ref=e15]:
      - generic [ref=e16]:
        - link "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e17]:
          - /url: /
          - figure [ref=e18]:
            - img "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes" [ref=e19]
        - button "Navigation menu." [ref=e20] [cursor=pointer]:
          - img [ref=e21]
    - main [ref=e23]:
      - generic [ref=e25]:
        - generic [ref=e27]: Yorkville
        - generic [ref=e28]:
          - link [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: Contact Us
          - link [ref=e31] [cursor=pointer]:
            - generic [ref=e32]: STAY UPDATED
      - generic [ref=e35]:
        - paragraph [ref=e36]: Now Selling
        - generic [ref=e37]:
          - heading "Yorkville" [level=1] [ref=e38]
          - button "Add to favorites" [ref=e40] [cursor=pointer]:
            - img [ref=e41]
        - generic [ref=e43]: Discover Yorkville, where timeless architecture, sustainable design, and a vibrant Central Park bring every season to life.
        - button "Stay updated about this community" [ref=e44] [cursor=pointer]:
          - generic [ref=e45]: STAY UPDATED
      - region "Sales center contact and quick links" [ref=e48]:
        - generic [ref=e49]:
          - heading "Mattamy Store" [level=2] [ref=e50]
          - generic [ref=e51]:
            - generic [ref=e52]: 19515 Sheriff King Street SW, Calgary, AB T2X 0T9
            - generic [ref=e53]: 403-471-1538
          - generic [ref=e54]:
            - link "Call 403-471-1538" [ref=e55] [cursor=pointer]:
              - /url: tel:4034711538
              - img "Call Icon" [ref=e56]
            - link "Email sls_yorkville@mattamycorp.com" [ref=e58] [cursor=pointer]:
              - /url: mailto:sls_yorkville@mattamycorp.com
              - img "Mail Icon" [ref=e59]
            - button "Hours" [ref=e62] [cursor=pointer]
            - link "Get directions to sales center, opens in new tab" [ref=e63] [cursor=pointer]:
              - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
              - img "Map Location Icon" [ref=e64]
              - generic [ref=e66]: Directions
        - generic [ref=e68]:
          - link "View 26 Floorplans" [ref=e69]:
            - /url: /search?productType=plan&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
          - link "View 4 Quick Move-Ins" [ref=e70]:
            - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
      - generic [ref=e72]:
        - generic [ref=e74]:
          - img "Yorkville logo Circular icon containing a minimalist drawing of mountains and the sun above the text reading \"Yorkville\"" [ref=e76]
          - generic [ref=e77]:
            - heading "Welcome to Yorkville in Calgary." [level=2] [ref=e78]
            - generic [ref=e79]:
              - generic [ref=e80]:
                - paragraph [ref=e82]: Yorkville is a community designed around memorable moments, meaningful connections and year-round enjoyment. At its heart is Calgary's only all-season central park, creating a vibrant backdrop for play, recreation and everyday gathering. Surround...
                - button "Show more" [ref=e83] [cursor=pointer]: More+
              - paragraph
              - paragraph
        - generic [ref=e85]:
          - heading "Home Details" [level=2] [ref=e86]
          - generic [ref=e87]:
            - img [ref=e88]
            - generic [ref=e90]:
              - generic [ref=e91]: Home Types
              - generic [ref=e92]: Attached | Townhome | Detached
          - generic [ref=e93]:
            - generic [ref=e94]:
              - img [ref=e95]
              - generic [ref=e97]:
                - generic [ref=e98]: Bedrooms
                - generic [ref=e99]: 3 - 5
            - generic [ref=e100]:
              - img [ref=e101]
              - generic [ref=e103]:
                - generic [ref=e104]: Full Bathrooms
                - generic [ref=e105]: 2 - 3
            - generic [ref=e106]:
              - img [ref=e107]
              - generic [ref=e120]:
                - generic [ref=e121]: Half Bathrooms
                - generic [ref=e122]: "1"
            - generic [ref=e123]:
              - img [ref=e124]
              - generic [ref=e126]:
                - generic [ref=e127]: Sq. Ft.
                - generic [ref=e128]: 1342 - 2875
            - generic [ref=e129]:
              - img [ref=e130]
              - generic [ref=e140]:
                - generic [ref=e141]: Stories
                - generic [ref=e142]: "2"
            - generic [ref=e143]:
              - img [ref=e144]
              - generic [ref=e151]:
                - generic [ref=e152]: Garages
                - generic [ref=e153]: "2"
      - generic [ref=e159]:
        - generic [ref=e160]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e161]
          - generic [ref=e163]: Required fields are marked with *
          - separator [ref=e164]
        - group [ref=e165]:
          - generic [ref=e166]:
            - textbox [ref=e167]
            - textbox "company" [ref=e168]:
              - /placeholder: ""
            - generic [ref=e169]:
              - generic [ref=e170]: First name *
              - textbox "First name" [ref=e172]:
                - /placeholder: ""
            - generic [ref=e173]:
              - generic [ref=e174]: Last name *
              - textbox "Last name" [ref=e176]:
                - /placeholder: ""
            - generic [ref=e177]:
              - generic [ref=e178]: Email *
              - textbox "Email" [ref=e180]:
                - /placeholder: ""
            - generic [ref=e181]:
              - generic [ref=e182]: Country of Residence *
              - generic [ref=e183]:
                - combobox "Country of Residence" [ref=e184] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e185]:
              - generic [ref=e186]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e188]:
                - /placeholder: ""
            - generic [ref=e189]:
              - generic [ref=e190]: Phone number
              - textbox "Phone number" [ref=e192]:
                - /placeholder: ""
            - generic [ref=e193]:
              - generic [ref=e194]:
                - text: When do you want to move into your home?
                - generic [ref=e195]: "*"
              - generic [ref=e196]:
                - combobox "When do you want to move into your home?" [ref=e197] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e198]:
              - generic [ref=e199]:
                - text: Are you a first time homebuyer?
                - generic [ref=e200]: "*"
              - generic [ref=e201]:
                - combobox "Are you a first time homebuyer?" [ref=e202] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e203]:
              - generic [ref=e204]:
                - text: How many bedrooms do you need?
                - generic [ref=e205]: "*"
              - generic [ref=e206]:
                - combobox "How many bedrooms do you need?" [ref=e207] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e208]:
              - generic [ref=e209]:
                - text: What is your budget?
                - generic [ref=e210]: "*"
              - generic [ref=e211]:
                - combobox "What is your budget?" [ref=e212] [cursor=pointer]:
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
            - generic [ref=e214] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e215]
              - generic [ref=e216]: I am a Real Estate Agent
            - generic [ref=e218] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e219]'
              - generic [ref=e220]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e221]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e222]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e223]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e224]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e225]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e227] [cursor=pointer]
      - generic [ref=e228]:
        - generic [ref=e229]:
          - radiogroup "Home type" [ref=e231]:
            - radio "Show Quick Move-In Homes, 4 available" [checked] [ref=e232] [cursor=pointer]:
              - generic:
                - generic: "4"
              - generic: Quick Move-In
            - radio "Show Floorplans, 26 available" [ref=e233] [cursor=pointer]:
              - generic:
                - generic: "26"
              - generic: Floorplans
          - generic [ref=e236]:
            - heading "Quick Move-In Homes ready when you are" [level=2] [ref=e237]
            - generic [ref=e238]: If time is of the essence, then our Quick Move-In Homes are for you.
        - generic [ref=e240]:
          - generic [ref=e241]:
            - paragraph [ref=e244]: Ready Now
            - generic [ref=e246]:
              - link "Ripley End townhome model with prairie elevation. 4 large windows sits above porch with 1 large window to the right side of door." [ref=e249]:
                - /url: /alberta/calgary/calgary/yorkville/ripley-end/38-yorkville-drive-sw
                - img "Ripley End townhome model with prairie elevation. 4 large windows sits above porch with 1 large window to the right side of door." [ref=e252]
              - link "View 38 Yorkville Drive SW information.Ripley End Floorplan | Attached 1,469 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage $472,990" [ref=e254]:
                - /url: /alberta/calgary/calgary/yorkville/ripley-end/38-yorkville-drive-sw
                - generic [ref=e255]: 38 Yorkville Drive SW
                - generic [ref=e256]: Ripley End Floorplan | Attached
                - generic [ref=e259]:
                  - paragraph [ref=e261]: 1,469 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e263]: 1 Half Bath|2 Car Garage
                  - paragraph [ref=e265]: $472,990
              - button "Mark as favorite" [ref=e266] [cursor=pointer]:
                - img "Favorite Icon" [ref=e267]
          - generic [ref=e269]:
            - paragraph [ref=e272]: Ready Now
            - generic [ref=e274]:
              - link "Rendering of the Prairie elevation for the Finch Model" [ref=e277]:
                - /url: /alberta/calgary/calgary/yorkville/finch/33-yorkstone-gardens-sw
                - img "Rendering of the Prairie elevation for the Finch Model" [ref=e280]
              - link "View 33 Yorkstone Gardens SW information.Finch Floorplan | Attached 1,366 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 0 Car Garage $485,990" [ref=e282]:
                - /url: /alberta/calgary/calgary/yorkville/finch/33-yorkstone-gardens-sw
                - generic [ref=e283]: 33 Yorkstone Gardens SW
                - generic [ref=e284]: Finch Floorplan | Attached
                - generic [ref=e287]:
                  - paragraph [ref=e289]: 1,366 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e291]: 1 Half Bath|
                  - paragraph [ref=e293]: $485,990
              - button "Mark as favorite" [ref=e294] [cursor=pointer]:
                - img "Favorite Icon" [ref=e295]
          - generic [ref=e297]:
            - paragraph [ref=e300]: Ready Now
            - generic [ref=e302]:
              - link "Craftsman Elevation Rendering of the Brinkley II. Includes 1 medium sized window and 1 large window on the second floor. The pathway to the home leads you from the side walk to the spacious front porch." [ref=e305]:
                - /url: /alberta/calgary/calgary/yorkville/brinkley-ii/14-yorkville-drive-sw
                - img "Craftsman Elevation Rendering of the Brinkley II. Includes 1 medium sized window and 1 large window on the second floor. The pathway to the home leads you from the side walk to the spacious front porch." [ref=e308]
              - link "View 14 Yorkville Drive SW information.Brinkley II Floorplan | Attached 1,459 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage $499,990" [ref=e310]:
                - /url: /alberta/calgary/calgary/yorkville/brinkley-ii/14-yorkville-drive-sw
                - generic [ref=e311]: 14 Yorkville Drive SW
                - generic [ref=e312]: Brinkley II Floorplan | Attached
                - generic [ref=e315]:
                  - paragraph [ref=e317]: 1,459 Sq. Ft.|3 Beds|2 Baths
                  - paragraph [ref=e319]: 1 Half Bath|2 Car Garage
                  - paragraph [ref=e321]: $499,990
              - button "Mark as favorite" [ref=e322] [cursor=pointer]:
                - img "Favorite Icon" [ref=e323]
          - generic [ref=e325]:
            - paragraph [ref=e328]: Ready Now
            - generic [ref=e330]:
              - link "Bishop Craftsman Elevation Rendering" [ref=e333]:
                - /url: /alberta/calgary/calgary/yorkville/bishop/20531-yorklyn-street-sw
                - img "Bishop Craftsman Elevation Rendering" [ref=e336]
              - link "View 20531 Yorklyn Street SW information.Bishop Floorplan | Detached 2,769 Sq. Ft. 5 Beds 3 Baths 1 Half Bath 2 Car Garage $804,990" [ref=e338]:
                - /url: /alberta/calgary/calgary/yorkville/bishop/20531-yorklyn-street-sw
                - generic [ref=e339]: 20531 Yorklyn Street SW
                - generic [ref=e340]: Bishop Floorplan | Detached
                - generic [ref=e343]:
                  - paragraph [ref=e345]: 2,769 Sq. Ft.|5 Beds|3 Baths
                  - paragraph [ref=e347]: 1 Half Bath|2 Car Garage
                  - paragraph [ref=e349]: $804,990
              - button "Mark as favorite" [ref=e350] [cursor=pointer]:
                - img "Favorite Icon" [ref=e351]
          - generic [ref=e353]:
            - link "View all" [ref=e354] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
              - generic [ref=e355]: View all
            - paragraph [ref=e356]: Showing 4 of 4 quick move-in homes
      - generic [ref=e359]:
        - article [ref=e360]:
          - heading "Golf" [level=3] [ref=e362]
          - paragraph [ref=e363]: Enjoy weekend downtime at Sirocco Golf Club.
        - article [ref=e364]:
          - heading "Transit" [level=3] [ref=e366]
          - paragraph [ref=e367]: Commutes are a breeze with multiple transit stops just outside the community.
        - article [ref=e368]:
          - heading "Nature" [level=3] [ref=e370]
          - paragraph [ref=e371]: Enjoy the outdoors at Fish Creek Provincial Park or along the Rotary/Mattamy Greenway.
        - article [ref=e372]:
          - heading "Parks" [level=3] [ref=e374]
          - paragraph [ref=e375]: Direct access to Central Park, Calgary’s only all-season, all-abilities park.
        - article [ref=e376]:
          - heading "Shopping" [level=3] [ref=e378]
          - paragraph [ref=e379]: Close to several shopping complexes with groceries and more across the street.
        - article [ref=e380]:
          - heading "Recreation" [level=3] [ref=e382]
          - paragraph [ref=e383]: Find family fun at recreation centres, Granary Road and Spruce Meadows.
      - generic [ref=e384]:
        - generic [ref=e387]:
          - 'img "Your Basement Has Ambitions: Free Finished Basement & Suite-Ready Upgrades*" [ref=e393]'
          - generic [ref=e397]:
            - heading "More Space. More Possibility." [level=2] [ref=e398]
            - generic [ref=e400]:
              - paragraph [ref=e401]: For a limited time, get a free finished basement with suite-ready upgrades* or upgrade to a fully developed legal basement suite starting at only $20,000.* Enjoy more space today or unlock rental income potential that could help offset your monthly mortgage payments.
              - paragraph [ref=e402]
              - paragraph [ref=e403]: "*Terms and conditions apply."
            - link "LEARN MORE" [ref=e405] [cursor=pointer]:
              - /url: https://mattamyhomes.com/alberta/calgary/promos/free-basement
              - generic [ref=e406]: LEARN MORE
        - generic [ref=e409]:
          - img "Better Living headline, person sitting on chair in living room looking towards window with sunlight coming in" [ref=e415]
          - generic [ref=e419]:
            - heading "Solar Power Made Simple!" [level=2] [ref=e420]
            - paragraph [ref=e423]: Turn sunlight into savings with solar panels, now included on all newly built Calgary homes! Learn more about how generating your own solar power can help lower your energy bills and contribute to a healthier planet.
            - link "LEARN MORE" [ref=e425] [cursor=pointer]:
              - /url: https://mattamyhomes.com/alberta/calgary/promos/solar-initiative
              - generic [ref=e426]: LEARN MORE
        - generic [ref=e429]:
          - img "Aerial view of houses with solar panels on roof, trees in background" [ref=e435]
          - generic [ref=e439]:
            - heading "Where Value Grows" [level=2] [ref=e440]
            - paragraph [ref=e443]:
              - text: Find the home that perfectly suits your life in Yorkville. With the option of Hardie Board exteriors, your home is built to withstand all the elements. For those who need more room to grow, our
              - strong [ref=e444]: WideLot
              - text: ™ options offer larger, brighter rooms, better flow between spaces and inviting front porches to help you connect with neighbours. Plus, as part of our mission to make sustainable living easier and more accessible for all, solar panels are now included on all new homes in Calgary – this is where sunshine creates savings.
        - generic [ref=e447]:
          - img "Aerial image of Central Park with playground, pathways, grass and trees" [ref=e453]
          - generic [ref=e457]:
            - heading "Where Nature Is Nearby" [level=2] [ref=e458]
            - generic [ref=e459]: Nature is just steps away in Yorkville’s Central Park. This 4-acre green space is Calgary’s only all-season, all-abilities park. It offers something for everyone with a skate park, a playground, ping-pong tables, a puddle rink and more. When you want to venture further, Fish Creek Provincial Park is a short drive away and the Rotary/Mattamy Greenway connects you to the city on foot or bike. This is where nature is part of every day.
        - generic [ref=e462]:
          - img "Father and two children at grocery store with shopping cart" [ref=e468]
          - generic [ref=e472]:
            - heading "Where Errands Are Easy" [level=2] [ref=e473]
            - generic [ref=e474]: Just across the street from Yorkville, you’ll find groceries, a pharmacy, restaurants, fitness/yoga centres and local medical clinics. Multiple transit routes are within walking distance and a short drive will lead you to shopping centres, schools, libraries, recreation complexes and more. This is where everything you need is at your fingertips.
      - generic [ref=e476]:
        - heading "Thoughtfully designed with you in mind" [level=2] [ref=e477]
        - generic [ref=e478]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e480]:
          - radiogroup "Content type" [ref=e482]:
            - generic [ref=e483] [cursor=pointer]:
              - text: Community Gallery
              - img [ref=e484]
            - paragraph [ref=e486]: Slide has changed view to 0
          - generic:
            - button "Community Gallery" [ref=e487] [cursor=pointer]
            - button "Fullerton" [ref=e488] [cursor=pointer]
            - button "Monarch" [ref=e489] [cursor=pointer]
            - button "Smythe" [ref=e490] [cursor=pointer]
          - radiogroup "Content type" [ref=e491] [cursor=pointer]:
            - radio "Videos" [ref=e492]:
              - img [ref=e494]
              - generic [ref=e497]: Videos
            - radio "360 Tours" [ref=e498]:
              - img [ref=e500]
              - generic [ref=e503]: 360 Tours
            - radio "Photos" [ref=e504]:
              - img [ref=e506]
              - generic [ref=e509]: Photos
          - generic [ref=e510]:
            - generic [ref=e515]:
              - button [ref=e520] [cursor=pointer]
              - iframe [ref=e525]:
                - generic [ref=f90e1]:
                  - heading "We couldn't verify the security of your connection." [level=1] [ref=f90e2]
                  - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f90e3]
              - iframe [ref=e530]:
                - generic [ref=f91e1]:
                  - heading "We couldn't verify the security of your connection." [level=1] [ref=f91e2]
                  - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f91e3]
              - iframe [ref=e535]:
                - generic [ref=f92e2]:
                  - generic:
                    - generic:
                      - img
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - img
                    - generic:
                      - img
                      - generic: Playing in picture-in-picture
                  - generic:
                    - generic:
                      - generic:
                        - 'link "The Rotary/Mattamy Greenway: An Urban Pathway Network Connecting the City of Calgary"':
                          - /url: https://vimeo.com/793022759?fl=pl&fe=ti
                        - generic: "The Rotary/Mattamy Greenway: An Urban Pathway Network Connecting the City of Calgary"
                      - link "Mattamy Homes":
                        - /url: https://vimeo.com/user30910553?fl=pl&fe=by
                        - generic: Mattamy Homes
                    - generic:
                      - generic:
                        - generic:
                          - generic:
                            - generic: More options
                          - button "More options" [ref=f92e9] [cursor=pointer]:
                            - img
                    - generic:
                      - button "Play" [ref=f92e11] [cursor=pointer]:
                        - img [ref=f92e12]
                        - generic:
                          - generic: Play
                          - img [ref=f92e15]
                      - generic [ref=f92e21]:
                        - generic [ref=f92e22]:
                          - slider "Progress Bar" [ref=f92e23] [cursor=pointer]
                          - generic:
                            - generic:
                              - generic: 00:00
                          - generic [ref=f92e28]: 02:28
                        - generic [ref=f92e29]:
                          - generic [ref=f92e30]:
                            - generic [ref=f92e31]:
                              - button:
                                - img
                            - slider
                          - generic:
                            - button:
                              - img
                              - generic: CC/subtitles
                          - generic:
                            - button:
                              - img
                              - generic: Settings
                          - generic:
                            - button:
                              - img
                              - generic: Speed
                          - generic:
                            - button:
                              - img
                              - generic: Transcript
                          - generic:
                            - button:
                              - img
                              - generic: Fullscreen
                          - button "Show controls" [ref=f92e33] [cursor=pointer]:
                            - img [ref=f92e34]
                            - generic:
                              - generic: Show controls
                          - link "Watch on Vimeo" [ref=f92e36]:
                            - /url: https://vimeo.com/793022759?fl=pl&fe=vl
                            - img [ref=f92e37]
              - button [ref=e540] [cursor=pointer]
              - button [ref=e545] [cursor=pointer]
              - button [ref=e550] [cursor=pointer]
              - button [ref=e555] [cursor=pointer]
              - button [ref=e560] [cursor=pointer]
              - button [ref=e565] [cursor=pointer]
              - button [ref=e570] [cursor=pointer]
              - button [ref=e575] [cursor=pointer]
              - button [ref=e580] [cursor=pointer]
              - button [ref=e585] [cursor=pointer]
              - button [ref=e590] [cursor=pointer]
              - button [ref=e595] [cursor=pointer]
              - button [ref=e600] [cursor=pointer]
              - button [ref=e605] [cursor=pointer]
              - iframe [ref=e610]:
                - main "145 Carrington Circle NW" [ref=f93e3]:
                  - generic "145 Carrington Circle NW" [ref=f93e5]
                  - generic [ref=f93e6] [cursor=pointer]:
                    - heading "145 Carrington Circle NW" [level=1] [ref=f93e9]
                    - generic [ref=f93e11]:
                      - img [ref=f93e12]
                      - button "Play" [ref=f93e15]:
                        - img [ref=f93e16]
                    - generic [ref=f93e18]:
                      - generic [ref=f93e19]: Powered by
                      - img "Matterport logo." [ref=f93e20]
              - iframe [ref=e615]:
                - generic [ref=f94e3] [cursor=pointer]:
                  - img [ref=f94e4]
                  - generic [ref=f94e5]:
                    - generic [ref=f94e6]: CLICK TO EXPLORE
                    - generic [ref=f94e7]:
                      - img [ref=f94e8]
                      - img [ref=f94e9]
              - iframe [ref=e620]:
                - main "Smythe" [ref=f95e3]:
                  - generic "Smythe" [ref=f95e5]
                  - generic [ref=f95e6] [cursor=pointer]:
                    - heading "Smythe" [level=1] [ref=f95e9]
                    - generic [ref=f95e11]:
                      - img [ref=f95e12]
                      - button "Play" [ref=f95e15]:
                        - img [ref=f95e16]
                    - generic [ref=f95e18]:
                      - generic [ref=f95e19]: Powered by
                      - img "Matterport logo." [ref=f95e20]
              - iframe [ref=e625]:
                - generic [active] [ref=f96e1]:
                  - main [ref=f96e2]:
                    - generic [ref=f96e3]:
                      - generic [ref=f96e4]:
                        - img "Icon for my.matterport.com" [ref=f96e5]
                        - heading "my.matterport.com" [level=1] [ref=f96e6]
                      - heading "Performing security verification" [level=2] [ref=f96e7]
                      - paragraph [ref=f96e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f96e13]:
                    - generic [ref=f96e15]:
                      - generic [ref=f96e17]:
                        - text: "Ray ID:"
                        - code [ref=f96e18]: a609d5d91b7d649b
                      - generic [ref=f96e19]:
                        - generic [ref=f96e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f96e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f96e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e630]:
                - generic [ref=f97e3] [cursor=pointer]:
                  - img [ref=f97e4]
                  - generic [ref=f97e5]:
                    - generic [ref=f97e6]: CLICK TO EXPLORE
                    - generic [ref=f97e7]:
                      - img [ref=f97e8]
                      - img [ref=f97e9]
              - iframe [ref=e635]:
                - main "127 Carrington Circle NW" [ref=f98e3]:
                  - generic "127 Carrington Circle NW" [ref=f98e5]
                  - generic [ref=f98e6] [cursor=pointer]:
                    - heading "127 Carrington Circle NW" [level=1] [ref=f98e9]
                    - generic [ref=f98e11]:
                      - img [ref=f98e12]
                      - button "Play" [ref=f98e15]:
                        - img [ref=f98e16]
                    - generic [ref=f98e18]:
                      - generic [ref=f98e19]: Powered by
                      - img "Matterport logo." [ref=f98e20]
              - iframe [ref=e640]:
                - main "135 Carrington Circle NW" [ref=f99e3]:
                  - generic "135 Carrington Circle NW" [ref=f99e5]
                  - generic [ref=f99e6] [cursor=pointer]:
                    - heading "135 Carrington Circle NW" [level=1] [ref=f99e9]
                    - generic [ref=f99e11]:
                      - img [ref=f99e12]
                      - button "Play" [ref=f99e15]:
                        - img [ref=f99e16]
                    - generic [ref=f99e18]:
                      - generic [ref=f99e19]: Powered by
                      - img "Matterport logo." [ref=f99e20]
              - iframe [ref=e645]:
                - main "39 Cityscape Common NE" [ref=f100e3]:
                  - generic "39 Cityscape Common NE" [ref=f100e5]
                  - generic [ref=f100e6] [cursor=pointer]:
                    - heading "39 Cityscape Common NE" [level=1] [ref=f100e9]
                    - generic [ref=f100e11]:
                      - img [ref=f100e12]
                      - button "Play" [ref=f100e15]:
                        - img [ref=f100e16]
                    - generic [ref=f100e18]:
                      - generic [ref=f100e19]: Powered by
                      - img "Matterport logo." [ref=f100e20]
              - iframe [ref=e650]:
                - generic [ref=f101e3] [cursor=pointer]:
                  - img [ref=f101e4]
                  - generic [ref=f101e5]:
                    - generic [ref=f101e6]: CLICK TO EXPLORE
                    - generic [ref=f101e7]:
                      - img [ref=f101e8]
                      - img [ref=f101e9]
              - iframe [ref=e655]:
                - generic [active] [ref=f102e1]:
                  - main [ref=f102e2]:
                    - generic [ref=f102e3]:
                      - generic [ref=f102e4]:
                        - img "Icon for my.matterport.com" [ref=f102e5]
                        - heading "my.matterport.com" [level=1] [ref=f102e6]
                      - heading "Performing security verification" [level=2] [ref=f102e7]
                      - paragraph [ref=f102e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f102e13]:
                    - generic [ref=f102e15]:
                      - generic [ref=f102e17]:
                        - text: "Ray ID:"
                        - code [ref=f102e18]: a609d5d96d25649b
                      - generic [ref=f102e19]:
                        - generic [ref=f102e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f102e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f102e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e660]:
                - generic [ref=f103e3] [cursor=pointer]:
                  - img [ref=f103e4]
                  - generic [ref=f103e5]:
                    - generic [ref=f103e6]: CLICK TO EXPLORE
                    - generic [ref=f103e7]:
                      - img [ref=f103e8]
                      - img [ref=f103e9]
              - iframe [ref=e665]:
                - generic [ref=f104e3] [cursor=pointer]:
                  - img [ref=f104e4]
                  - generic [ref=f104e5]:
                    - generic [ref=f104e6]: CLICK TO EXPLORE
                    - generic [ref=f104e7]:
                      - img [ref=f104e8]
                      - img [ref=f104e9]
              - iframe [ref=e670]:
                - generic [ref=f105e13]:
                  - generic [ref=f105e32]: LIVING ROOM
                  - generic [ref=f105e40]: Finch
                  - generic [ref=f105e45]:
                    - generic [ref=f105e50]:
                      - img
                    - generic [ref=f105e55]:
                      - img
                    - generic [ref=f105e60]:
                      - img
                  - generic [ref=f105e78]:
                    - generic [ref=f105e81]: Disclaimer
                    - paragraph [ref=f105e82]
                    - generic [ref=f105e84]: All illustrations are artist’s concept. Specifications, terms, and conditions are subject to change without notice.
              - iframe [ref=e675]:
                - generic [ref=f106e3] [cursor=pointer]:
                  - img [ref=f106e4]
                  - generic [ref=f106e5]:
                    - generic [ref=f106e6]: CLICK TO EXPLORE
                    - generic [ref=f106e7]:
                      - img [ref=f106e8]
                      - img [ref=f106e9]
              - iframe [ref=e680]:
                - generic [ref=f107e3] [cursor=pointer]:
                  - img [ref=f107e4]
                  - generic [ref=f107e5]:
                    - generic [ref=f107e6]: CLICK TO EXPLORE
                    - generic [ref=f107e7]:
                      - img [ref=f107e8]
                      - img [ref=f107e9]
              - iframe [ref=e685]:
                - generic [ref=f108e3] [cursor=pointer]:
                  - img [ref=f108e4]
                  - generic [ref=f108e5]:
                    - generic [ref=f108e6]: CLICK TO EXPLORE
                    - generic [ref=f108e7]:
                      - img [ref=f108e8]
                      - img [ref=f108e9]
              - iframe [ref=e690]:
                - generic [ref=f109e3] [cursor=pointer]:
                  - img [ref=f109e4]
                  - generic [ref=f109e5]:
                    - generic [ref=f109e6]: CLICK TO EXPLORE
                    - generic [ref=f109e7]:
                      - img [ref=f109e8]
                      - img [ref=f109e9]
              - iframe [ref=e695]:
                - generic [ref=f110e3] [cursor=pointer]:
                  - img [ref=f110e4]
                  - generic [ref=f110e5]:
                    - generic [ref=f110e6]: CLICK TO EXPLORE
                    - generic [ref=f110e7]:
                      - img [ref=f110e8]
                      - img [ref=f110e9]
              - button [ref=e700] [cursor=pointer]
              - button [ref=e705] [cursor=pointer]
              - button [ref=e710] [cursor=pointer]
              - button [ref=e715] [cursor=pointer]
              - button [ref=e720] [cursor=pointer]
              - button [ref=e725] [cursor=pointer]
              - button [ref=e730] [cursor=pointer]
              - button [ref=e735] [cursor=pointer]
              - button [ref=e740] [cursor=pointer]
              - button [ref=e745] [cursor=pointer]
              - button [ref=e750] [cursor=pointer]
              - button [ref=e755] [cursor=pointer]
              - button [ref=e760] [cursor=pointer]
              - iframe [ref=e765]:
                - generic [ref=f111e1]:
                  - heading "We couldn't verify the security of your connection." [level=1] [ref=f111e2]
                  - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f111e3]
            - generic [ref=e767]: Yorkville Central Park Promotion Video
            - paragraph [ref=e769]:
              - generic [ref=e770]: Slide number
              - text: 1/48
        - generic [ref=e771]:
          - generic [ref=e772]:
            - text: "Transcript:"
            - 'link "Download Yorkville Central Park: Grand Opening Event (.txt file) transcript" [ref=e773]':
              - /url: blob:https://mattamyhomes.com/a828f8c3-2c30-4cb8-a9f3-4d0082cf3e7b
              - text: "Yorkville Central Park: Grand Opening Event (.txt file)"
          - generic [ref=e774]:
            - text: "Transcript:"
            - link "Download Yorkville in Calgary Alberta (.txt file) transcript" [ref=e775]:
              - /url: blob:https://mattamyhomes.com/8e5ad9b5-2f05-4636-9bf0-f2025c6dea52
              - text: Yorkville in Calgary Alberta (.txt file)
          - generic [ref=e776]:
            - text: "Transcript:"
            - link "Download The Mattamy/Rotary Greenway (.txt file) transcript" [ref=e777]:
              - /url: blob:https://mattamyhomes.com/8b85cf88-66c9-4293-94bf-c5ec3950766d
              - text: The Mattamy/Rotary Greenway (.txt file)
      - generic [ref=e780]:
        - heading "Conveniently located to fit your needs" [level=2] [ref=e781]
        - button "Nearby Services dropdown list" [ref=e786] [cursor=pointer]:
          - generic [ref=e788]: What's Nearby
          - img [ref=e790]
        - generic [ref=e794]:
          - generic [ref=e800]:
            - button "+" [ref=e801] [cursor=pointer]
            - button "-" [ref=e802] [cursor=pointer]
          - generic [ref=e803]:
            - button "Move map up" [ref=e805] [cursor=pointer]:
              - img [ref=e806]
            - button "Move map left" [ref=e809] [cursor=pointer]:
              - img [ref=e810]
            - button "Reset map" [ref=e812] [cursor=pointer]:
              - img [ref=e813]
            - button "Move map right" [ref=e816] [cursor=pointer]:
              - img [ref=e817]
            - button "Move map down" [ref=e820] [cursor=pointer]:
              - img [ref=e821]
      - generic [ref=e825]:
        - heading "Explore the community" [level=2] [ref=e826]
        - generic [ref=e827]: Take a closer look at the community sitemap and get familiar with our available offerings.
        - button "VIEW SITEMAP" [ref=e828] [cursor=pointer]:
          - generic [ref=e829]: VIEW SITEMAP
      - generic [ref=e833]:
        - img "View of Calgary by the water with high-rise buildings and a bridge" [ref=e839]
        - generic [ref=e844]:
          - heading "Mattamy Homes in Calgary" [level=2] [ref=e845]
          - generic [ref=e846]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
          - link "Learn More About Living in Calgary" [ref=e848] [cursor=pointer]:
            - /url: /alberta/calgary
            - generic [ref=e849]: Learn More About Living in Calgary
      - generic [ref=e852]:
        - button [ref=e853] [cursor=pointer]:
          - img [ref=e854]
        - generic [ref=e858]:
          - generic [ref=e859]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e860]
            - generic [ref=e862]: Required fields are marked with *
            - separator [ref=e863]
          - generic [ref=e864]:
            - textbox [ref=e865]
            - textbox "company" [ref=e866]:
              - /placeholder: ""
            - generic [ref=e867]:
              - generic [ref=e868]: First name *
              - textbox "First name" [ref=e870]:
                - /placeholder: ""
              - generic [ref=e871]:
                - img [ref=e872]
                - generic [ref=e874]: "Error: First name is Required"
            - generic [ref=e875]:
              - generic [ref=e876]: Last name *
              - textbox "Last name" [ref=e878]:
                - /placeholder: ""
              - generic [ref=e879]:
                - img [ref=e880]
                - generic [ref=e882]: "Error: Last name is Required"
            - generic [ref=e883]:
              - generic [ref=e884]: Email *
              - textbox "Email" [ref=e886]:
                - /placeholder: ""
              - generic [ref=e887]:
                - img [ref=e888]
                - generic [ref=e890]: "Error: Email is Required"
            - generic [ref=e891]:
              - generic [ref=e892]: Country of Residence *
              - generic [ref=e893]:
                - combobox "Country of Residence" [ref=e894] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
              - generic [ref=e895]:
                - img [ref=e896]
                - generic [ref=e898]: "Error: Country of Residence is Required"
            - generic [ref=e899]:
              - generic [ref=e900]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e902]:
                - /placeholder: ""
              - generic [ref=e903]:
                - img [ref=e904]
                - generic [ref=e906]: "Error: Zip/Postal Code is Required"
            - generic [ref=e907]:
              - generic [ref=e908]: Phone number
              - textbox "Phone number" [ref=e910]:
                - /placeholder: ""
            - generic [ref=e911]:
              - generic [ref=e912]:
                - text: When do you want to move into your home?
                - generic [ref=e913]: "*"
              - generic [ref=e914]:
                - combobox "When do you want to move into your home?" [ref=e915] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
              - generic [ref=e916]:
                - img [ref=e917]
                - generic [ref=e919]: "Error: When do you want to move into your home? is Required"
            - generic [ref=e920]:
              - generic [ref=e921]:
                - text: Are you a first time homebuyer?
                - generic [ref=e922]: "*"
              - generic [ref=e923]:
                - combobox "Are you a first time homebuyer?" [ref=e924] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e925]:
              - generic [ref=e926]:
                - text: How many bedrooms do you need?
                - generic [ref=e927]: "*"
              - generic [ref=e928]:
                - combobox "How many bedrooms do you need?" [ref=e929] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
              - generic [ref=e930]:
                - img [ref=e931]
                - generic [ref=e933]: "Error: How many bedrooms do you need? is Required"
            - generic [ref=e934]:
              - generic [ref=e935]:
                - text: What is your budget?
                - generic [ref=e936]: "*"
              - generic [ref=e937]:
                - combobox "What is your budget?" [ref=e938] [cursor=pointer]:
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
              - generic [ref=e939]:
                - img [ref=e940]
                - generic [ref=e942]: "Error: What is your budget? is Required"
            - generic [ref=e944] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e945]
              - generic [ref=e946]: I am a Real Estate Agent
            - generic [ref=e948] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e949]'
              - generic [ref=e950]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e951]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e952]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e953]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e954]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e955]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e957] [cursor=pointer]
      - button "View promotions" [ref=e959] [cursor=pointer]:
        - generic [ref=e960]: View promotions
        - img [ref=e961]
      - generic [ref=e965] [cursor=pointer]:
        - button "New home rebates available!" [ref=e966]:
          - generic [ref=e968]:
            - img "Click Here New home rebates available!" [ref=e971]
            - generic [ref=e974]: click here
        - generic [ref=e975]: "1"
        - img [ref=e977]
    - contentinfo "footer" [ref=e979]:
      - generic [ref=e981]:
        - generic [ref=e982]:
          - generic [ref=e983]:
            - heading "Explore" [level=2] [ref=e984]
            - list [ref=e986]:
              - listitem [ref=e987]:
                - link "Mattamy Homes USA" [ref=e988]:
                  - /url: https://mattamyhomes.com/us
              - listitem [ref=e989]:
                - link "Mattamy Homes Canada" [ref=e990]:
                  - /url: https://mattamyhomes.com/ca
              - listitem [ref=e991]:
                - link "Design Studio" [ref=e992]:
                  - /url: /design-studio
              - listitem [ref=e993]:
                - link "Customer Care" [ref=e994]:
                  - /url: /customer-care
          - generic [ref=e996]:
            - heading "About Mattamy" [level=2] [ref=e997]
            - list [ref=e999]:
              - listitem [ref=e1000]:
                - link "About Us" [ref=e1001]:
                  - /url: /about/about-mattamy
              - listitem [ref=e1002]:
                - link "Contact Us" [ref=e1003]:
                  - /url: /contact
              - listitem [ref=e1004]:
                - link "Careers" [ref=e1005]:
                  - /url: /about/careers
              - listitem [ref=e1006]:
                - link "Media and Investor Relations" [ref=e1007]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e1009]:
            - heading "Connect With Us" [level=2] [ref=e1010]
            - generic [ref=e1012]:
              - link "Facebook (opens in a new tab)" [ref=e1013]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e1014]
              - link "Instagram (opens in a new tab)" [ref=e1016]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e1017]
              - link "Youtube (opens in a new tab)" [ref=e1019]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e1020]
              - link "Pinterest (opens in a new tab)" [ref=e1022]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e1023]
              - link "Linkedin (opens in a new tab)" [ref=e1025]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e1026]
        - generic [ref=e1029]:
          - paragraph [ref=e1030]:
            - link "Accessibility" [ref=e1031]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e1032]: "|"
            - button "Cookie Settings" [ref=e1033] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e1034]: "|"
            - link "Legal Disclaimers" [ref=e1035]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e1036]: "|"
            - link "Privacy Policy" [ref=e1037]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e1038]: "|"
            - link "Terms and Conditions" [ref=e1039]:
              - /url: /terms-and-conditions
          - paragraph [ref=e1040]: ©2026 Mattamy Homes
```

# Test source

```ts
  427 | 
  428 |     await field.focus({ timeout: 2000 }).catch(() => undefined);
  429 |     await field.blur({ timeout: 2000 }).catch(() => undefined);
  430 |   }
  431 | }
  432 | 
  433 | /** A visible field the form marks `required` / `aria-required="true"`. */
  434 | type RequiredField = {
  435 |   field: Locator;
  436 |   label: string;
  437 |   isChoice: boolean;
  438 | };
  439 | 
  440 | /** Fields the form itself marks required. */
  441 | const REQUIRED_FIELD_SELECTOR = ['input', 'select', 'textarea']
  442 |   .flatMap((tag) => [
  443 |     `${tag}[required]:not([required="false"]):not([disabled]):visible`,
  444 |     `${tag}[aria-required="true"]:not([disabled]):visible`,
  445 |   ])
  446 |   .join(', ');
  447 | 
  448 | /** Returns the visible fields the form marks as required, with the label their error names. */
  449 | async function getVisibleRequiredFields(form: Locator): Promise<RequiredField[]> {
  450 |   const fields = form.locator(REQUIRED_FIELD_SELECTOR);
  451 |   const count = await fields.count();
  452 |   const requiredFields: RequiredField[] = [];
  453 | 
  454 |   for (let index = 0; index < count; index++) {
  455 |     const field = fields.nth(index);
  456 |     const { label, isChoice } = await field.evaluate((element) => {
  457 |       const input = element as HTMLInputElement;
  458 |       // <label> first: a failed field's aria-label is rewritten to the error text.
  459 |       const rawLabel =
  460 |         input.labels?.[0]?.innerText || input.getAttribute('aria-label') || input.name || '';
  461 | 
  462 |       return {
  463 |         label: rawLabel
  464 |           .replace(/^\s*Error:\s*/i, '')
  465 |           .replace(/\s+is\s+Required.*$/i, '')
  466 |           .replace(/\*/g, '')
  467 |           .replace(/\s+/g, ' ')
  468 |           .trim(),
  469 |         isChoice: input.type === 'checkbox' || input.type === 'radio',
  470 |       };
  471 |     });
  472 | 
  473 |     requiredFields.push({ field, label, isChoice });
  474 |   }
  475 | 
  476 |   return requiredFields;
  477 | }
  478 | 
  479 | /** Assert each empty required field shows its "is Required" error; prefilled ones are reported, not failed. */
  480 | export async function expectRequiredErrorsInForm(form: Locator, timeout = 10000): Promise<void> {
  481 |   const initialErrorCount = test.info().errors.length;
  482 |   const requiredFields = await getVisibleRequiredFields(form);
  483 | 
  484 |   await reportValue(
  485 |     'Required fields marked on the form',
  486 |     requiredFields.map(({ label }) => label).join(', ') || '(none)',
  487 |   );
  488 | 
  489 |   expect(
  490 |     requiredFields.length,
  491 |     'Lead form should mark at least one field as required',
  492 |   ).toBeGreaterThan(0);
  493 | 
  494 |   for (const { field, label, isChoice } of requiredFields) {
  495 |     const state = await field.evaluate((element) => {
  496 |       const input = element as HTMLInputElement;
  497 |       const isChoiceInput = input.type === 'checkbox' || input.type === 'radio';
  498 | 
  499 |       return {
  500 |         isEmpty: isChoiceInput ? !input.checked : !input.value,
  501 |         valueMissing: input.validity.valueMissing,
  502 |       };
  503 |     });
  504 | 
  505 |     if (!state.isEmpty) {
  506 |       await reportValue(`${label} is required but prefilled`, 'no required error expected');
  507 |       continue;
  508 |     }
  509 | 
  510 |     expect.soft(state.valueMissing, `${label} should report a missing required value`).toBe(true);
  511 | 
  512 |     if (isChoice) {
  513 |       continue;
  514 |     }
  515 | 
  516 |     await expect
  517 |       .soft(
  518 |         form.getByText(new RegExp(`${escapeRegex(label)}\\s*(?:is\\s*)?Required`, 'i')).first(),
  519 |         `${label} required-field error should be visible`,
  520 |       )
  521 |       .toBeVisible({ timeout });
  522 |   }
  523 | 
  524 |   expect(
  525 |     test.info().errors.slice(initialErrorCount),
  526 |     'Required-field error audit should have no assertion failures',
> 527 |   ).toHaveLength(0);
      |     ^ Error: Required-field error audit should have no assertion failures
  528 | }
  529 | 
  530 | /** Assert invalid-email validation within a lead form. */
  531 | export async function expectInvalidEmailErrorInForm(form: Locator, timeout = 10000): Promise<void> {
  532 |   await expect(
  533 |     form
  534 |       .locator('text=/valid domain name|valid email|invalid email|Error:.*Email|Email.*Invalid/i')
  535 |       .first(),
  536 |   ).toBeVisible({ timeout });
  537 | }
  538 | 
  539 | // Composite fill (getByRole-based forms)
  540 | 
  541 | export type FillLeadOptions = {
  542 |   emailName?: RegExp;
  543 |   selectCountry?: boolean;
  544 |   selectCommunity?: boolean;
  545 |   selectPlan?: boolean;
  546 |   checkConsent?: boolean;
  547 | };
  548 | 
  549 | export type SideModalFormOptions = FillLeadOptions & {
  550 |   timeout?: number;
  551 |   formName?: string;
  552 |   location?: LocationKey;
  553 |   expectCommunity?: boolean;
  554 |   expectPlan?: boolean;
  555 | };
  556 | 
  557 | /** Fill a standard lead form from {@link LeadFieldData}, touching only the fields that are present. */
  558 | export async function fillLeadFormFields(
  559 |   form: Locator,
  560 |   data: LeadFieldData,
  561 |   options: FillLeadOptions = {},
  562 | ): Promise<void> {
  563 |   const emailName = options.emailName ?? /^email/i;
  564 | 
  565 |   await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), data.firstName);
  566 |   await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), data.lastName);
  567 |   await fillIfPresent(form.getByRole('textbox', { name: emailName }), data.email);
  568 |   await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), data.phone);
  569 |   await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), data.zip);
  570 | 
  571 |   if (options.selectCountry !== false) {
  572 |     await selectCountryIfPresent(form, data.country);
  573 |   }
  574 | 
  575 |   if (options.selectCommunity) {
  576 |     await selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community/i }).first());
  577 |   }
  578 | 
  579 |   if (options.selectPlan) {
  580 |     await selectFirstOptionIfPresent(
  581 |       form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
  582 |     );
  583 |   }
  584 | 
  585 |   if (options.checkConsent !== false) {
  586 |     await checkConsentIfPresent(form);
  587 |   }
  588 | }
  589 | 
  590 | /** Audit a side-modal lead form: core fields must render, others are checked if present, then required errors. */
  591 | export async function expectSideModalFormFields(
  592 |   form: Locator,
  593 |   options: SideModalFormOptions = {},
  594 | ): Promise<void> {
  595 |   const initialErrorCount = test.info().errors.length;
  596 |   const timeout = options.timeout ?? 10000;
  597 |   const location = options.location ?? (getLocationConfig().country as LocationKey);
  598 |   const formName = options.formName ?? 'side modal form';
  599 | 
  600 |   const optionalFields: Array<[Locator, string]> = [
  601 |     [form.getByRole('textbox', { name: /zip|postal/i }).first(), 'Zip/Postal Code'],
  602 |     [form.getByRole('textbox', { name: /phone/i }).first(), 'Phone number'],
  603 |     ...getExpectedLeadFormFields(location, formName).map((field): [Locator, string] => [
  604 |       getLeadFormFieldLocator(form, field).first(),
  605 |       getLeadFormFieldLabel(field),
  606 |     ]),
  607 |   ];
  608 | 
  609 |   if (options.expectCommunity) {
  610 |     optionalFields.push([form.getByRole('combobox', { name: /community/i }).first(), 'Community']);
  611 |   }
  612 | 
  613 |   if (options.expectPlan) {
  614 |     optionalFields.push([
  615 |       form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
  616 |       'Suite/Floorplan/Plan',
  617 |     ]);
  618 |   }
  619 | 
  620 |   // Core fields first, so a zero count on an optional field below means absent, not late.
  621 |   await Promise.all(
  622 |     getCoreSideModalFields(form).map(([field, label]) =>
  623 |       expectFieldVisible(field, label, timeout, { soft: true }),
  624 |     ),
  625 |   );
  626 | 
  627 |   const skippedFields: string[] = [];
```