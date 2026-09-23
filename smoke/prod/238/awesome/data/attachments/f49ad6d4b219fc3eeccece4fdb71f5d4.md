# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: QMIPage.spec.ts >> QMI Detail Page Tests - CAN >> Lead Form >> @smoke @regression @qmi-form-fields | CAN | Validate QMI side modal form fields
- Location: tests/QMIPage.spec.ts:108:9

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('//div[@id=\'detailsBlockBar\']/following-sibling::div[1]').getByRole('heading', { level: 1 })
Expected pattern: /55 Yorkstone Terrace SW/i
Received string:  "Maclaren"
Timeout: 15000ms

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('//div[@id=\'detailsBlockBar\']/following-sibling::div[1]').getByRole('heading', { level: 1 })
    19 × locator resolved to <h1 class="TitleDetailsBlock__Heading-sc-1rr2dxz-1 cZsLzR flex text-3xl font-bold font-trade-gothic-20 leading-tiny mt-1 text-mattamy-blue ">…</h1>
       - unexpected value "Maclaren"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e7]:
    - generic [ref=e12]:
      - text: Government Tax Rebates Available on New Homes!
      - link "Learn More" [ref=e13] [cursor=pointer]:
        - /url: http://mattamyhomes.com/promos/government-rebates
  - generic [ref=e15]:
    - banner [ref=e17]:
      - generic [ref=e18]:
        - link "Maclaren Plan Mattamy logo at Yorkville in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e19] [cursor=pointer]:
          - /url: /
          - figure [ref=e20]:
            - img "Maclaren Plan Mattamy logo at Yorkville in Calgary Alberta by Mattamy Homes" [ref=e21]
        - navigation [ref=e22]:
          - generic [ref=e23]:
            - button "Find Your Dream Home" [ref=e25] [cursor=pointer]:
              - paragraph [ref=e26]:
                - text: Find Your Dream Home
                - img [ref=e27]
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
          - link "Sustainability" [ref=e30] [cursor=pointer]:
            - /url: /about/sustainability
            - paragraph [ref=e31]: Sustainability
          - button "Resources" [ref=e34] [cursor=pointer]:
            - paragraph [ref=e35]:
              - text: Resources
              - img [ref=e36]
          - link "Customer Care" [ref=e39] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e40]: Customer Care
          - button "About" [ref=e43] [cursor=pointer]:
            - paragraph [ref=e44]:
              - text: About
              - img [ref=e45]
          - link "Contact Us" [ref=e48] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e49]: Contact Us
        - generic [ref=e50]:
          - button "Go to Favorites Page" [ref=e51] [cursor=pointer]:
            - img "Favorite Icon" [ref=e52]
          - button "Select your country. CANADA country is selected" [ref=e57] [cursor=pointer]:
            - generic [ref=e59]: CANADA
            - img [ref=e61]
    - main [ref=e63]:
      - generic [ref=e65]:
        - generic [ref=e67]:
          - generic [ref=e68]:
            - text: Alberta
            - img [ref=e69]
          - generic [ref=e71]:
            - link "Calgary" [ref=e72] [cursor=pointer]:
              - /url: /alberta/calgary
            - img [ref=e73]
          - generic [ref=e75]:
            - text: Calgary
            - img [ref=e76]
          - generic [ref=e78]:
            - link "Yorkville" [ref=e79] [cursor=pointer]:
              - /url: /alberta/calgary/calgary/yorkville
            - img [ref=e80]
          - generic [ref=e82]: Maclaren
        - link "STAY UPDATED" [ref=e84] [cursor=pointer]:
          - generic [ref=e85]: STAY UPDATED
      - generic [ref=e87]:
        - generic [ref=e88]:
          - heading "Maclaren" [level=1] [ref=e91]:
            - generic [ref=e92]: Maclaren
          - paragraph [ref=e93]:
            - generic [ref=e94]: 3 Beds|
            - generic [ref=e95]: 2 Baths|
            - generic [ref=e96]: 1 Half Bath|
            - generic [ref=e97]: 2,155-2,164 Sq. Ft.|
            - generic [ref=e98]: 2 Car Garage
            - generic [ref=e99]: "|"
            - generic [ref=e100]: 44' Single Family Home
        - generic [ref=e101]:
          - paragraph [ref=e102]: Starting from
          - paragraph [ref=e103]:
            - generic [ref=e104]: $720,990
          - generic [ref=e105]:
            - img "Calculator Icon" [ref=e106]
            - button "Estimated Monthly Mortgage $3,221" [ref=e114] [cursor=pointer]
            - img [ref=e115]
            - button [ref=e117] [cursor=pointer]:
              - img [ref=e118]
      - 'region "Images and videos of: Maclaren" [ref=e124]':
        - generic [ref=e125]:
          - button "Previous slide on Multiblock" [ref=e127] [cursor=pointer]:
            - img [ref=e128]
          - generic [ref=e131]:
            - img "Rendering of the Prairie elevation for the Maclaren Model" [ref=e137]
            - img [ref=e145]
          - button "Next slide of Multiblock" [ref=e147] [cursor=pointer]:
            - img [ref=e148]
        - radiogroup "Content type" [ref=e150] [cursor=pointer]:
          - radio "Select 360 Toursfilter" [ref=e151]:
            - img [ref=e153]
            - generic [ref=e156]: 360 Tours
          - radio "Select Photosfilter" [ref=e157]:
            - img [ref=e159]
            - generic [ref=e162]: Photos
        - paragraph [ref=e164]: 1/4
      - generic [ref=e166]:
        - heading "Interactive Floorplan" [level=2] [ref=e167]
        - generic [ref=e169]: The floorplan below is keyboard accessible with consideration for colour contrast and button sizes. A text alternative document, complete with full floorplan dimensions, features and details, to be used with a screen reader, is available upon request for any floorplan. Please contact accessibility@mattamycorp.com to request a text alternative document of this floorplan. Please note, this is not a sales email. For information regarding purchasing, please visit our Contact Us Page. Any emails requesting sales information sent to accessibility@mattamycorp.com, will be disregarded.
        - generic [ref=e170]:
          - button "Resize Iframe" [ref=e171] [cursor=pointer]:
            - img "Resize Icon" [ref=e172]
          - iframe [ref=e177]:
            - generic [ref=f24e2]:
              - generic [ref=f24e3]:
                - generic:
                  - generic [ref=f24e5]:
                    - generic:
                      - generic [ref=f24e6]:
                        - generic [ref=f24e8] [cursor=pointer]:
                          - generic:
                            - generic:
                              - img
                        - button [ref=f24e9] [cursor=pointer]
                      - generic "Floor Plan" [ref=f24e10]:
                        - img [ref=f24e11]
                  - generic:
                    - generic:
                      - generic:
                        - generic "Floor Plan":
                          - img
                  - generic:
                    - generic:
                      - generic:
                        - generic "Floor Plan":
                          - img
              - generic:
                - text: "| | | |"
                - generic [ref=f24e12]:
                  - generic [ref=f24e13]:
                    - generic [ref=f24e14]:
                      - button "Architect's Choice Options" [ref=f24e15] [cursor=pointer]:
                        - generic [ref=f24e16]: Architect's Choice Options
                        - generic [ref=f24e18]:
                          - generic:
                            - generic:
                              - img
                      - generic [ref=f24e22]:
                        - generic [ref=f24e23]: Elevation Craftsman
                        - button "Change" [ref=f24e24] [cursor=pointer]:
                          - generic [ref=f24e25]:
                            - generic:
                              - generic:
                                - img
                          - generic [ref=f24e26]: Change
                      - generic [ref=f24e29]:
                        - button "Reset Options" [ref=f24e31] [cursor=pointer]:
                          - generic [ref=f24e33]:
                            - generic:
                              - generic:
                                - img
                          - generic [ref=f24e34]: Reset Options
                        - generic [ref=f24e36]:
                          - button "Ground Floor" [ref=f24e37] [cursor=pointer]:
                            - generic [ref=f24e38]:
                              - generic:
                                - generic:
                                  - img
                            - heading "Ground Floor" [level=3] [ref=f24e39]
                          - button "Side Door Entry" [ref=f24e44] [cursor=pointer]:
                            - generic [ref=f24e45]: Side Door Entry
                        - generic [ref=f24e48]:
                          - button "Second Floor" [ref=f24e49] [cursor=pointer]:
                            - generic [ref=f24e50]:
                              - generic:
                                - generic:
                                  - img
                            - heading "Second Floor" [level=3] [ref=f24e51]
                          - generic [ref=f24e54]:
                            - button "Fourth Bedroom in Lieu of Loft" [ref=f24e56] [cursor=pointer]:
                              - generic [ref=f24e57]: Fourth Bedroom in Lieu of Loft
                            - button "Bath Oasis" [ref=f24e59] [cursor=pointer]:
                              - generic [ref=f24e60]: Bath Oasis
                        - generic [ref=f24e63]:
                          - button "Basement" [ref=f24e64] [cursor=pointer]:
                            - generic [ref=f24e65]:
                              - generic:
                                - generic:
                                  - img
                            - heading "Basement" [level=3] [ref=f24e66]
                          - generic [ref=f24e69]:
                            - button "Next Step" [ref=f24e71] [cursor=pointer]:
                              - generic [ref=f24e72]: Next Step
                            - button "Finished Basement" [ref=f24e74] [cursor=pointer]:
                              - generic [ref=f24e75]: Finished Basement
                            - button "Secondary Suite in Basement" [ref=f24e77] [cursor=pointer]:
                              - generic [ref=f24e78]: Secondary Suite in Basement
                    - button "Suggested Layouts" [ref=f24e81] [cursor=pointer]:
                      - generic [ref=f24e82]: Suggested Layouts
                      - generic [ref=f24e84]:
                        - generic:
                          - generic:
                            - img
                    - button "Furniture Planner" [ref=f24e86] [cursor=pointer]:
                      - generic [ref=f24e87]: Furniture Planner
                      - generic [ref=f24e89]:
                        - generic:
                          - generic:
                            - img
                    - button "Compare Plans" [ref=f24e91] [cursor=pointer]:
                      - generic [ref=f24e92]: Compare Plans
                      - generic [ref=f24e94]:
                        - generic:
                          - generic:
                            - img
                  - generic [ref=f24e96] [cursor=pointer]:
                    - generic:
                      - generic:
                        - img
              - generic [ref=f24e99]:
                - generic [ref=f24e100]:
                  - generic [ref=f24e101]:
                    - generic [ref=f24e102] [cursor=pointer]:
                      - generic:
                        - generic:
                          - img
                    - heading "Maclaren" [level=1] [ref=f24e103]
                  - generic [ref=f24e105] [cursor=pointer]:
                    - generic "Selected Floor Ground Floor" [ref=f24e106]:
                      - generic [ref=f24e107]: Ground Floor
                      - generic [ref=f24e109]:
                        - generic:
                          - generic:
                            - img
                    - generic:
                      - generic "Select floor Second Floor":
                        - generic: Second Floor
                      - generic "Select floor Basement":
                        - generic: Basement
                - generic [ref=f24e111]:
                  - generic [ref=f24e113]:
                    - button "Download" [ref=f24e114] [cursor=pointer]:
                      - generic [ref=f24e115]:
                        - generic:
                          - generic:
                            - img
                      - generic [ref=f24e116]: Download
                    - button "Print" [ref=f24e117] [cursor=pointer]:
                      - generic [ref=f24e118]:
                        - generic:
                          - generic:
                            - img
                      - generic [ref=f24e119]: Print
                    - button "Share" [ref=f24e120] [cursor=pointer]:
                      - generic [ref=f24e121]:
                        - generic:
                          - generic:
                            - img
                      - generic [ref=f24e122]: Share
                  - generic [ref=f24e124]:
                    - generic [ref=f24e125]:
                      - generic [ref=f24e126]: "3"
                      - generic [ref=f24e127]: Floors
                      - text: "|"
                    - generic [ref=f24e128]:
                      - generic [ref=f24e129]: "3"
                      - generic [ref=f24e130]: Bedrooms
                      - text: "|"
                    - generic [ref=f24e131]:
                      - generic [ref=f24e132]: "2.5"
                      - generic [ref=f24e133]: Bathrooms
                      - text: "|"
                    - generic [ref=f24e134]:
                      - generic [ref=f24e135]: "2"
                      - generic [ref=f24e136]: Car Garage
                      - text: "|"
                    - generic [ref=f24e137]:
                      - generic [ref=f24e138]: 2,155
                      - generic [ref=f24e139]: Sq. Ft.
              - generic [ref=f24e140]:
                - generic [ref=f24e141]:
                  - button "Hide Interface" [ref=f24e142] [cursor=pointer]:
                    - generic [ref=f24e143]:
                      - generic:
                        - generic:
                          - img
                  - button "Hide Hotspots" [ref=f24e144] [cursor=pointer]:
                    - generic [ref=f24e145]:
                      - generic:
                        - generic:
                          - img
                  - button "Flip Floorplan" [ref=f24e146] [cursor=pointer]:
                    - generic [ref=f24e147]:
                      - generic:
                        - generic:
                          - img
                  - button "Measure Tool" [ref=f24e148] [cursor=pointer]:
                    - generic [ref=f24e149]:
                      - generic:
                        - generic:
                          - img
                  - button "Text Tool" [ref=f24e150] [cursor=pointer]:
                    - generic [ref=f24e151]:
                      - generic:
                        - generic:
                          - img
                  - button "Reset All Changes" [ref=f24e152] [cursor=pointer]:
                    - generic [ref=f24e153]:
                      - generic:
                        - generic:
                          - img
                - generic [ref=f24e157]:
                  - slider [ref=f24e160] [cursor=pointer]:
                    - generic [ref=f24e161]:
                      - generic:
                        - generic:
                          - img
                  - generic [ref=f24e163]: 100%
      - generic [ref=e179]:
        - heading "Exterior Styles" [level=2] [ref=e180]
        - generic [ref=e181]: Exterior styles to suit your personal taste.
        - generic [ref=e182]:
          - figure [ref=e183]:
            - img "2 story single family Craftsman style home with light beige and cream exterior, brown roof, many windows, white trim, front porch, double car garage" [ref=e185]
            - generic [ref=e186]: craftsman
          - figure [ref=e187]:
            - img "2 story single family Georgian Colonial style home with light grey and grey exterior, grey roof, white trim, many windows, front porch, double car garage" [ref=e189]
            - generic [ref=e190]: georgian-colonial
          - figure [ref=e191]:
            - img "2 story single family Prairie style home with muted green and dark grey exterior, dark brown roof, many windows, front porch, double car garage" [ref=e193]
            - generic [ref=e194]: prairie
      - generic [ref=e197]:
        - generic [ref=e198]:
          - heading "Home Design Details" [level=2] [ref=e199]
          - button "Collapse Information" [expanded] [ref=e200] [cursor=pointer]
        - generic [ref=e205]:
          - generic [ref=e206]: As part of our WideLotTM collection, the Maclaren amplifies living space through shorter hallways and brighter windows. Enter through a welcoming foyer and den to find yourself in an open and inspiring living space. The kitchen wows with an oversized island and charming breakfast bar. Enjoy the convenience of a pantry, powder room and ...
          - button "Show more" [ref=e207] [cursor=pointer]: More+
      - generic [ref=e210]:
        - generic [ref=e211]:
          - heading "Home Features" [level=2] [ref=e212]
          - button "Collapse Information" [expanded] [ref=e213] [cursor=pointer]
        - generic [ref=e218]:
          - generic [ref=e220]: ecobee
          - generic [ref=e222]: Stop & Drop w/ Bench in Mudroom
          - generic [ref=e224]: Den in Foyer
          - generic [ref=e226]: Walk-In Closets in All Bedrooms
          - generic [ref=e228]: Walk-In Pantry
      - generic [ref=e232]:
        - paragraph [ref=e234]: Mortgage Calculator
        - button "Get Started Expand calculator" [ref=e237] [cursor=pointer]:
          - generic [ref=e238]: Get Started
      - generic [ref=e242]:
        - generic [ref=e243]:
          - heading "We're with you all the way to the front door" [level=2] [ref=e244]
          - button "Collapse Information" [expanded] [ref=e245] [cursor=pointer]
        - generic [ref=e249]:
          - generic [ref=e250]: Mattamy Homes focuses every part of the homebuying experience around you, and obtaining financing is no exception. Mattamy financing partners work closely with you throughout the process — ensuring coordination, communication and peace of mind.
          - link "Learn More" [ref=e251] [cursor=pointer]:
            - /url: /homebuying/financing
            - button "Learn More" [ref=e252]:
              - generic [ref=e253]: Learn More
      - generic [ref=e256]:
        - generic [ref=e258]:
          - heading "Quick Move-In Homes ready when you are" [level=2] [ref=e259]
          - generic [ref=e260]: If time is of the essence, then our Quick Move-In Homes are for you.
          - link "View all" [ref=e262] [cursor=pointer]:
            - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
            - generic [ref=e263]: View all
        - generic [ref=e268] [cursor=pointer]:
          - generic [ref=e270]:
            - paragraph [ref=e273]: Ready Now
            - paragraph [ref=e275]: $499,990
            - img "Ripley End townhome model with prairie elevation. 4 large windows sits above porch with 1 large window to the right side of door." [ref=e276]
            - button "Mark as favorite" [ref=e277]:
              - img "Favorite Icon" [ref=e278]
          - link "Yorkville Ripley End Floorplan | Attached 38 Yorkville Drive SW 1,469 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage" [ref=e280]:
            - /url: /alberta/calgary/calgary/yorkville/ripley-end/38-yorkville-drive-sw
            - generic [ref=e281]: Ripley End Floorplan | Attached
            - generic [ref=e282]: 38 Yorkville Drive SW
            - generic [ref=e283]:
              - paragraph [ref=e286]: 1,469 Sq. Ft.
              - generic [ref=e287]:
                - paragraph [ref=e288]: 3 Beds
                - generic [ref=e289]: "|"
                - paragraph [ref=e290]: 2 Baths
              - generic [ref=e291]:
                - paragraph [ref=e292]: 1 Half Bath
                - generic [ref=e293]: "|"
                - paragraph [ref=e295]: 2 Car Garage
      - generic [ref=e299]:
        - generic [ref=e301]:
          - generic [ref=e303]:
            - heading "Mattamy Store" [level=3] [ref=e304]
            - generic [ref=e305]:
              - generic [ref=e306]:
                - img [ref=e308]
                - link "Go to 19515 Sheriff King Street SW Calgary Alberta T2X 0T9. Opens in Googlemaps" [ref=e311] [cursor=pointer]:
                  - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
                  - paragraph [ref=e312]: 19515 Sheriff King Street SW
                  - paragraph [ref=e313]:
                    - text: Calgary, AB T2X 0T9
                    - img "OpenNewTab Icon" [ref=e314]
              - generic [ref=e317]:
                - img [ref=e319]
                - link "Call to 403-471-1538" [ref=e321] [cursor=pointer]:
                  - /url: tel:403-471-1538
                  - text: 403-471-1538
          - generic [ref=e322]:
            - heading "Hours" [level=3] [ref=e323]
            - generic [ref=e324]:
              - img [ref=e326]
              - button "Show Schedule" [ref=e329] [cursor=pointer]:
                - paragraph [ref=e330]: Closed Now
                - img [ref=e332]
        - generic [ref=e335]:
          - generic [ref=e336]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e337]
            - generic [ref=e339]: Required fields are marked with *
            - separator [ref=e340]
          - group [ref=e341]:
            - generic [ref=e342]:
              - textbox "username" [ref=e343]:
                - /placeholder: ""
              - textbox "company" [ref=e344]:
                - /placeholder: ""
              - generic [ref=e345]:
                - generic [ref=e346]: First name *
                - textbox "First name" [ref=e348]:
                  - /placeholder: ""
              - generic [ref=e349]:
                - generic [ref=e350]: Last name *
                - textbox "Last name" [ref=e352]:
                  - /placeholder: ""
              - generic [ref=e353]:
                - generic [ref=e354]: Email *
                - textbox "Email" [ref=e356]:
                  - /placeholder: ""
              - generic [ref=e357]:
                - generic [ref=e358]: Country of Residence *
                - generic [ref=e359]:
                  - combobox "Country of Residence" [ref=e360] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "Canada"
                    - option "United States"
                    - option "Other"
                  - generic:
                    - img
              - generic [ref=e361]:
                - generic [ref=e362]: Zip/Postal Code *
                - textbox "Zip/Postal Code" [ref=e364]:
                  - /placeholder: ""
              - generic [ref=e365]:
                - generic [ref=e366]: Phone number
                - textbox "Phone number" [ref=e368]:
                  - /placeholder: ""
              - generic [ref=e369]:
                - generic [ref=e370]: When do you want to move into your home?
                - generic [ref=e371]:
                  - combobox "When do you want to move into your home?" [ref=e372] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "0-3 Months"
                    - option "3-6 Months"
                    - option "6-12 Months"
                    - option "12+ Months"
                  - generic:
                    - img
              - generic [ref=e373]:
                - generic [ref=e374]: How many bedrooms do you need?
                - generic [ref=e375]:
                  - combobox "How many bedrooms do you need?" [ref=e376] [cursor=pointer]:
                    - option [disabled] [selected]
                    - option "1"
                    - option "2"
                    - option "3"
                    - option "4"
                    - option "5+"
                  - generic:
                    - img
              - generic [ref=e377]:
                - generic [ref=e378]: What is your budget?
                - generic [ref=e379]:
                  - combobox "What is your budget?" [ref=e380] [cursor=pointer]:
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
              - generic [ref=e382] [cursor=pointer]:
                - checkbox "I am a Real Estate Agent" [ref=e383]
                - generic [ref=e384]: I am a Real Estate Agent
              - generic [ref=e386] [cursor=pointer]:
                - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e387]'
                - generic [ref=e388]:
                  - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                  - link "SMS Privacy Policy" [ref=e389]:
                    - /url: /sms-privacy-policy
                  - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                  - link "Privacy Policy" [ref=e390]:
                    - /url: /privacy-policy
                  - text: ","
                  - link "SMS Privacy Policy" [ref=e391]:
                    - /url: /sms-privacy-policy
                  - text: ","
                  - link "SMS Terms of Service" [ref=e392]:
                    - /url: /sms-terms-of-service
                  - text: ", and/or"
                  - link "Contact Us" [ref=e393]:
                    - /url: /contact-us
                  - text: .
              - button "SUBMIT" [ref=e395] [cursor=pointer]
      - generic [ref=e398]:
        - generic [ref=e399] [cursor=pointer]:
          - generic [ref=e400]:
            - generic [ref=e401]: New home rebates available!
            - img "Click Here New home rebates available!" [ref=e403]
          - button "Get Rebate Estimate" [ref=e404]:
            - generic [ref=e405]: Get Rebate Estimate
        - button "x" [ref=e406] [cursor=pointer]
      - button "View promotions" [ref=e408] [cursor=pointer]:
        - generic [ref=e409]: View promotions
        - img [ref=e410]
    - contentinfo "footer" [ref=e412]:
      - generic [ref=e414]:
        - generic [ref=e415]:
          - generic [ref=e416]:
            - heading "Explore" [level=2] [ref=e417]
            - list [ref=e419]:
              - listitem [ref=e420]:
                - link "Find My Home" [ref=e421] [cursor=pointer]:
                  - /url: /search
              - listitem [ref=e422]:
                - link "Design Studio" [ref=e423] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e424]:
                - link "Customer Care" [ref=e425] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e427]:
            - heading "About Mattamy" [level=2] [ref=e428]
            - list [ref=e430]:
              - listitem [ref=e431]:
                - link "About Us" [ref=e432] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e433]:
                - link "Contact Us" [ref=e434] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e435]:
                - link "Careers" [ref=e436] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e437]:
                - link "Media and Investor Relations" [ref=e438] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e440]:
            - heading "Connect With Us" [level=2] [ref=e441]
            - generic [ref=e443]:
              - link "Facebook (opens in a new tab)" [ref=e444] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomes
                - img [ref=e445]
              - link "Instagram (opens in a new tab)" [ref=e447] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomes/
                - img [ref=e448]
              - link "Youtube (opens in a new tab)" [ref=e450] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e451]
              - link "Pinterest (opens in a new tab)" [ref=e453] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e454]
              - link "Linkedin (opens in a new tab)" [ref=e456] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e457]
        - generic [ref=e460]:
          - paragraph [ref=e461]:
            - link "Accessibility" [ref=e462] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e463]: "|"
            - button "Cookie Settings" [ref=e464] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e465]: "|"
            - link "Legal Disclaimers" [ref=e466] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e467]: "|"
            - link "Privacy Policy" [ref=e468] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e469]: "|"
            - link "Terms and Conditions" [ref=e470] [cursor=pointer]:
              - /url: /terms-and-conditions
          - paragraph [ref=e471]: ©2026 Mattamy Homes
  - iframe [ref=e473]:
    - generic [active] [ref=f25e1]:
      - generic:
        - generic:
          - generic:
            - button [ref=f25e2]
            - img "AtlasRTX Digital Assistant icon" [ref=f25e5]:
              - text: Chat with Us
              - strong [ref=f25e8]: "1"
            - button [ref=f25e9]
```

# Test source

```ts
  101 |       .locator('section')
  102 |       .filter({
  103 |         has: this.uTourTitle,
  104 |       })
  105 |       .first();
  106 |     this.uTourCta = this.uTourSection
  107 |       .locator('a[href*="utourhomes.com/visitor"]')
  108 |       .filter({ hasText: /Schedule a Self-Guided Tour/i })
  109 |       .first();
  110 |     this.interactiveFloorPlanSection = this.getSectionByHeading(
  111 |       /Interactive Floorplan|Floor Plan/i,
  112 |     );
  113 |     this.communitySitemapSection = this.getSectionByHeading(/Explore the community/i);
  114 |     this.homeDesignDetailsSection = this.getSectionByHeading(/Home Design Details/i);
  115 |     this.homeFeaturesSection = this.getSectionByHeading(/Home Features/i);
  116 |     // The site does not head this block consistently - USA QMI pages call it
  117 |     // "New Home Gallery", not "Sales Office" - so match all the variants.
  118 |     this.salesOfficeSection = page
  119 |       .locator('section')
  120 |       .filter({
  121 |         has: page.getByRole('heading', {
  122 |           name: /Showhome Parade|Sales Office|Sales Centre|New Home Gallery/i,
  123 |         }),
  124 |       })
  125 |       .first();
  126 |     this.relatedQmiSection = this.getSectionByHeading(/Quick Move-In Homes ready when you are/i);
  127 |     this.relatedQmiCards = this.relatedQmiSection.locator('a[href*="/"][href*="-"]').filter({
  128 |       hasText: /Beds|Baths|Garage|Sq\.?\s*Ft\./i,
  129 |     });
  130 |     this.successDialogModal = page.locator('.ReactModal__Content');
  131 |   }
  132 | 
  133 |   /** The visible quick move-in lead forms that have a submit button. */
  134 |   private get leadFormDialogOrSidebar(): Locator {
  135 |     return (
  136 |       this.page
  137 |         .locator(
  138 |           '#ModalForm:visible, [id*="ModalForm"]:visible, .ReactModal__Content:visible, [role="dialog"]:visible, aside:visible, [class*="drawer" i]:visible, [class*="sidebar" i]:visible',
  139 |         )
  140 |         // A Submit button, not just any input, is what separates a lead form from
  141 |         // the page's other dialogs - the National-promotion overlay is a
  142 |         // full-screen role="dialog" with inputs, so it matches everything else here. Matched
  143 |         // by CSS rather than by role (see SUBMIT_BUTTON_SELECTOR): the promotion
  144 |         // popup aria-hides the whole page while it is up, which left this filter
  145 |         // matching nothing and an open side modal reporting as "did not open".
  146 |         // and(), not filter({ hasNot }): the aria-label sits on the overlay
  147 |         // itself, and hasNot only inspects descendants.
  148 |         .filter({ has: this.page.locator(SUBMIT_BUTTON_SELECTOR) })
  149 |         .and(
  150 |           this.page.locator(
  151 |             ':not([aria-label*="promotion" i]):not([aria-label*="notification" i])',
  152 |           ),
  153 |         )
  154 |     );
  155 |   }
  156 | 
  157 |   /** The thank-you message shown after the form is submitted. */
  158 |   private get formSuccessMessage(): Locator {
  159 |     return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  160 |   }
  161 | 
  162 |   // Navigation and Page Load
  163 | 
  164 |   /** Checks the quick move-in page loaded with its heading and breadcrumb. */
  165 |   async verifyPageLoaded(): Promise<void> {
  166 |     await this.step('Verify QMI detail page loaded', async () => {
  167 |       await expect(this.heading).toBeVisible({
  168 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  169 |       });
  170 |       await expect(this.breadcrumb).toBeVisible();
  171 |     });
  172 |   }
  173 | 
  174 |   // Search Result Validation
  175 | 
  176 |   /** Checks a search from the home page lands on the right quick move-in home. */
  177 |   async verifySearchByQMI(expectedAddress: string): Promise<void> {
  178 |     await this.step(`Verify QMI search redirects to '${expectedAddress}'`, async () => {
  179 |       await this.waitForPageReady();
  180 |       await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
  181 |       const reachedQmiUrl = await this.page
  182 |         .waitForURL(QMIPage.QMI_URL_PATTERN, { timeout: 60_000 })
  183 |         .then(() => true)
  184 |         .catch(() => QMIPage.QMI_URL_PATTERN.test(this.page.url()));
  185 | 
  186 |       if (!reachedQmiUrl) {
  187 |         await this.reportValue(
  188 |           'QMI URL did not stabilize after search; navigating directly to configured QMI path',
  189 |         );
  190 |         await this.page.goto(this.buildFullUrl(location.qmiPath), {
  191 |           waitUntil: 'domcontentloaded',
  192 |           timeout: 90_000,
  193 |         });
  194 |         await this.waitForPageReady();
  195 |         await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
  196 |       }
  197 | 
  198 |       await expect(this.heading).toBeVisible({
  199 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  200 |       });
> 201 |       await expect(this.heading).toContainText(new RegExp(escapeRegex(expectedAddress), 'i'));
      |                                  ^ Error: expect(locator).toContainText(expected) failed
  202 |     });
  203 |   }
  204 | 
  205 |   /** Checks the URL path matches the configured quick move-in home exactly. */
  206 |   async verifyExactQmiUrl(): Promise<void> {
  207 |     await this.step('Verify QMI URL path matches configured path', async () => {
  208 |       const currentPath = new URL(this.page.url()).pathname;
  209 |       expect(currentPath).toBe(location.qmiPath);
  210 |     });
  211 |   }
  212 | 
  213 |   // Hero and Summary
  214 | 
  215 |   /** Checks the hero shows the heading, address and summary stats. */
  216 |   async verifyHeroSection(): Promise<void> {
  217 |     await this.step('Verify QMI hero section, heading & stats', async () => {
  218 |       await expect(this.heroSection).toBeVisible({
  219 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  220 |       });
  221 |       await expect(this.heading).toBeVisible({
  222 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  223 |       });
  224 |       await expect(this.heading).toContainText(new RegExp(escapeRegex(location.qmiAddress), 'i'), {
  225 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  226 |       });
  227 |       await expect(this.propertyStats).toBeVisible();
  228 |     });
  229 |   }
  230 | 
  231 |   /** Checks the breadcrumb is visible. */
  232 |   async verifyBreadcrumb(): Promise<void> {
  233 |     await this.step('Verify breadcrumb is visible', async () => {
  234 |       await expect(this.breadcrumb).toBeVisible();
  235 |     });
  236 |   }
  237 | 
  238 |   /** Checks the hero lists beds, baths, garage or half bath, square footage and price. */
  239 |   async verifyHeroHomeFacts(): Promise<void> {
  240 |     await this.step('Verify hero home facts (beds, baths, sq.ft., price)', async () => {
  241 |       await expect(this.heroDetails).toBeVisible({
  242 |         timeout: QMIPage.PAGE_LOAD_TIMEOUT,
  243 |       });
  244 |       await expect(this.heroDetails).toContainText(/\d+\s+Beds?/i);
  245 |       await expect(this.heroDetails).toContainText(/\d+\s+Baths?/i);
  246 |       await expect(this.heroDetails).toContainText(/Half Bath|Garage/i);
  247 |       await expect(this.heroDetails).toContainText(/[\d,]+\s+Sq\.?\s*Ft\.?/i);
  248 |       await expect(this.heroDetails).toContainText(/\$[\d,]+/);
  249 |     });
  250 |   }
  251 | 
  252 |   // Price and CTA
  253 | 
  254 |   /** Checks the price and the Get Information CTA are visible. */
  255 |   async verifyPriceOrCTA(): Promise<void> {
  256 |     await this.step('Verify price section & Get Information CTA', async () => {
  257 |       await expect(this.priceSection.first()).toBeVisible();
  258 |       await expect(this.getInformationCta).toBeVisible();
  259 |     });
  260 |   }
  261 | 
  262 |   /** Checks the Get Information CTA opens the side modal form. */
  263 |   async verifyGetInformationCtaOpensLeadForm(): Promise<void> {
  264 |     await this.step('Verify Get Information CTA opens lead form', async () => {
  265 |       const form = await this.openGetInformationLeadForm('QMI Get Information side modal form');
  266 | 
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
```