# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communityPage.spec.ts >> Community Detail - Yorkville >> Lead Form >> Get Information Form Validation >> @smoke @regression | CAN | Validate community sideModalForm fields
- Location: tests/communityPage.spec.ts:99:11

# Error details

```
Test timeout of 300000ms exceeded.
```

```
Error: Side modal form field audit should have no assertion failures

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"cause": undefined, "message": "Test timeout of 300000ms exceeded.", "stack": "Test timeout of 300000ms exceeded."}]
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
      - link "Learn More" [ref=e12] [cursor=pointer]:
        - /url: http://mattamyhomes.com/promos/government-rebates
  - generic [ref=e14]:
    - banner [ref=e15]:
      - generic [ref=e16]:
        - link "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e17] [cursor=pointer]:
          - /url: /
          - figure [ref=e18]:
            - img "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes" [ref=e19]
        - navigation [ref=e20]:
          - generic [ref=e21]:
            - button "Find Your Dream Home" [ref=e23] [cursor=pointer]:
              - paragraph [ref=e24]:
                - text: Find Your Dream Home
                - img [ref=e25]
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
          - link "Sustainability" [ref=e28] [cursor=pointer]:
            - /url: /about/sustainability
            - paragraph [ref=e29]: Sustainability
          - button "Resources" [ref=e32] [cursor=pointer]:
            - paragraph [ref=e33]:
              - text: Resources
              - img [ref=e34]
          - link "Customer Care" [ref=e37] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e38]: Customer Care
          - button "About" [ref=e41] [cursor=pointer]:
            - paragraph [ref=e42]:
              - text: About
              - img [ref=e43]
          - link "Contact Us" [ref=e46] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e47]: Contact Us
        - generic [ref=e48]:
          - button "Go to Favorites Page" [ref=e49] [cursor=pointer]:
            - img "Favorite Icon" [ref=e50]
          - button "Select your country. CANADA country is selected" [ref=e55] [cursor=pointer]:
            - generic [ref=e57]: CANADA
            - img [ref=e59]
    - main [ref=e61]:
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]: Yorkville
          - generic [ref=e66]:
            - link [ref=e67] [cursor=pointer]:
              - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
              - img [ref=e68]
              - generic [ref=e70]:
                - text: 19515 Sheriff King Street SW, Calgary AB T2X 0T9
                - img [ref=e71]
            - link [ref=e74] [cursor=pointer]:
              - /url: tel:4034711538
              - img [ref=e75]
              - generic [ref=e77]: 403-471-1538
            - link [ref=e78] [cursor=pointer]:
              - /url: mailto:sls_yorkville@mattamycorp.com
              - img [ref=e79]
              - generic [ref=e82]: sls_yorkville@mattamycorp.com
        - link [ref=e84] [cursor=pointer]:
          - generic [ref=e85]: STAY UPDATED
      - generic [ref=e88]:
        - paragraph [ref=e89]: Now Selling
        - generic [ref=e90]:
          - heading "Yorkville" [level=1] [ref=e91]
          - button "Add to favorites" [ref=e93] [cursor=pointer]:
            - img [ref=e94]
        - generic [ref=e96]: Discover Yorkville, where timeless architecture, sustainable design, and a vibrant Central Park bring every season to life.
        - button "Stay updated about this community" [ref=e97] [cursor=pointer]:
          - generic [ref=e98]: STAY UPDATED
      - region "Sales center contact and quick links" [ref=e101]:
        - generic [ref=e102]:
          - heading "Mattamy Store" [level=2] [ref=e103]
          - generic [ref=e104]:
            - generic [ref=e105]: 19515 Sheriff King Street SW, Calgary, AB T2X 0T9
            - generic [ref=e106]: 403-471-1538
          - generic [ref=e107]:
            - link "Call 403-471-1538" [ref=e108] [cursor=pointer]:
              - /url: tel:4034711538
              - img "Call Icon" [ref=e109]
            - link "Email sls_yorkville@mattamycorp.com" [ref=e111] [cursor=pointer]:
              - /url: mailto:sls_yorkville@mattamycorp.com
              - img "Mail Icon" [ref=e112]
            - button "Hours" [ref=e115] [cursor=pointer]
            - link "Get directions to sales center, opens in new tab" [ref=e116] [cursor=pointer]:
              - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
              - img "Map Location Icon" [ref=e117]
              - generic [ref=e119]: Directions
        - generic [ref=e120]:
          - generic [ref=e121]:
            - heading "Discover our homes" [level=2] [ref=e122]
            - paragraph [ref=e123]: Explore floorplans and quick move-in homes ready for you.
          - generic [ref=e124]:
            - link "View 26 Floorplans" [ref=e125] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
            - link "View 5 Quick Move-Ins" [ref=e126] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
      - generic [ref=e128]:
        - generic [ref=e130]:
          - img "Yorkville logo Circular icon containing a minimalist drawing of mountains and the sun above the text reading \"Yorkville\"" [ref=e132]
          - generic [ref=e133]:
            - heading "Welcome to Yorkville in Calgary." [level=2] [ref=e134]
            - generic [ref=e135]:
              - generic [ref=e136]:
                - paragraph [ref=e138]: Yorkville is a community designed around memorable moments, meaningful connections and year-round enjoyment. At its heart is Calgary's only all-season central park, creating a vibrant backdrop for play, recreation and everyday gathering. Surrounded by pathways, natural spaces and convenient amenities, Yorkville offers a lifestyle that...
                - button "Show more" [ref=e139] [cursor=pointer]: More+
              - paragraph
              - paragraph
        - generic [ref=e141]:
          - heading "Home Details" [level=2] [ref=e142]
          - generic [ref=e143]:
            - img [ref=e144]
            - generic [ref=e146]:
              - generic [ref=e147]: Home Types
              - generic [ref=e148]: Attached | Townhome | Detached
          - generic [ref=e149]:
            - generic [ref=e150]:
              - img [ref=e151]
              - generic [ref=e153]:
                - generic [ref=e154]: Bedrooms
                - generic [ref=e155]: 3 - 5
            - generic [ref=e156]:
              - img [ref=e157]
              - generic [ref=e159]:
                - generic [ref=e160]: Full Bathrooms
                - generic [ref=e161]: 2 - 3
            - generic [ref=e162]:
              - img [ref=e163]
              - generic [ref=e176]:
                - generic [ref=e177]: Half Bathrooms
                - generic [ref=e178]: "1"
            - generic [ref=e179]:
              - img [ref=e180]
              - generic [ref=e182]:
                - generic [ref=e183]: Sq. Ft.
                - generic [ref=e184]: 1342 - 2875
            - generic [ref=e185]:
              - img [ref=e186]
              - generic [ref=e196]:
                - generic [ref=e197]: Stories
                - generic [ref=e198]: "2"
            - generic [ref=e199]:
              - img [ref=e200]
              - generic [ref=e207]:
                - generic [ref=e208]: Garages
                - generic [ref=e209]: "2"
      - generic [ref=e215]:
        - generic [ref=e216]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e217]
          - generic [ref=e219]: Required fields are marked with *
          - separator [ref=e220]
        - group [ref=e221]:
          - generic [ref=e222]:
            - textbox [ref=e223]
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
              - generic [ref=e250]: When do you want to move into your home? *
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
              - generic [ref=e254]: Are you a first time homebuyer? *
              - generic [ref=e255]:
                - combobox "Are you a first time homebuyer?" [ref=e256] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e257]:
              - generic [ref=e258]: How many bedrooms do you need? *
              - generic [ref=e259]:
                - combobox "How many bedrooms do you need?" [ref=e260] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e261]:
              - generic [ref=e262]: What is your budget? *
              - generic [ref=e263]:
                - combobox "What is your budget?" [ref=e264] [cursor=pointer]:
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
            - generic [ref=e266] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e267]
              - generic [ref=e268]: I am a Real Estate Agent
            - generic [ref=e270] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e271]'
              - generic [ref=e272]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e273]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e274]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e275]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e276]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e277]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e279] [cursor=pointer]
      - generic [ref=e281]:
        - radiogroup "Home type" [ref=e283]:
          - radio "Show Quick Move-In Homes, 5 available" [checked] [ref=e284] [cursor=pointer]:
            - generic:
              - generic: "5"
            - generic: Quick Move-In Homes
          - radio "Show Floorplans, 26 available" [ref=e285] [cursor=pointer]:
            - generic:
              - generic: "26"
            - generic: Floorplans
        - generic [ref=e286]:
          - generic [ref=e288]:
            - heading "Quick Move-In Homes ready when you are" [level=2] [ref=e289]
            - generic [ref=e290]: If time is of the essence, then our Quick Move-In Homes are for you.
            - link "View all" [ref=e292] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
              - generic [ref=e293]: View all
          - generic [ref=e294]:
            - paragraph [ref=e295]: Showing 5 of 5 quick move-in homes
            - generic [ref=e296]:
              - generic [ref=e299] [cursor=pointer]:
                - generic [ref=e301]:
                  - paragraph [ref=e304]: Ready Now
                  - paragraph [ref=e306]: $472,990
                  - img "Ripley End townhome model with prairie elevation. 4 large windows sits above porch with 1 large window to the right side of door." [ref=e307]
                  - button "Mark as favorite" [ref=e308]:
                    - img "Favorite Icon" [ref=e309]
                - link "Yorkville Ripley End Floorplan | Attached 38 Yorkville Drive SW 1,469 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage" [ref=e311]:
                  - /url: /alberta/calgary/calgary/yorkville/ripley-end/38-yorkville-drive-sw
                  - generic [ref=e312]: Ripley End Floorplan | Attached
                  - generic [ref=e313]: 38 Yorkville Drive SW
                  - generic [ref=e314]:
                    - paragraph [ref=e317]: 1,469 Sq. Ft.
                    - generic [ref=e318]:
                      - paragraph [ref=e319]: 3 Beds
                      - generic [ref=e320]: "|"
                      - paragraph [ref=e321]: 2 Baths
                    - generic [ref=e322]:
                      - paragraph [ref=e323]: 1 Half Bath
                      - generic [ref=e324]: "|"
                      - paragraph [ref=e326]: 2 Car Garage
              - generic [ref=e329] [cursor=pointer]:
                - generic [ref=e331]:
                  - paragraph [ref=e334]: Ready Now
                  - paragraph [ref=e336]: $485,990
                  - img "Rendering of the Prairie elevation for the Finch Model" [ref=e337]
                  - button "Mark as favorite" [ref=e338]:
                    - img "Favorite Icon" [ref=e339]
                - link "Yorkville Finch Floorplan | Attached 33 Yorkstone Gardens SW 1,366 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 0 Car Garage" [ref=e341]:
                  - /url: /alberta/calgary/calgary/yorkville/finch/33-yorkstone-gardens-sw
                  - generic [ref=e342]: Finch Floorplan | Attached
                  - generic [ref=e343]: 33 Yorkstone Gardens SW
                  - generic [ref=e344]:
                    - paragraph [ref=e347]: 1,366 Sq. Ft.
                    - generic [ref=e348]:
                      - paragraph [ref=e349]: 3 Beds
                      - generic [ref=e350]: "|"
                      - paragraph [ref=e351]: 2 Baths
                    - paragraph [ref=e353]: 1 Half Bath
              - generic [ref=e356] [cursor=pointer]:
                - generic [ref=e358]:
                  - paragraph [ref=e361]: Ready Now
                  - paragraph [ref=e363]: $499,990
                  - img "Craftsman Elevation Rendering of the Brinkley II. Includes 1 medium sized window and 1 large window on the second floor. The pathway to the home leads you from the side walk to the spacious front porch." [ref=e364]
                  - button "Mark as favorite" [ref=e365]:
                    - img "Favorite Icon" [ref=e366]
                - link "Yorkville Brinkley II Floorplan | Attached 14 Yorkville Drive SW 1,459 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage" [ref=e368]:
                  - /url: /alberta/calgary/calgary/yorkville/brinkley-ii/14-yorkville-drive-sw
                  - generic [ref=e369]: Brinkley II Floorplan | Attached
                  - generic [ref=e370]: 14 Yorkville Drive SW
                  - generic [ref=e371]:
                    - paragraph [ref=e374]: 1,459 Sq. Ft.
                    - generic [ref=e375]:
                      - paragraph [ref=e376]: 3 Beds
                      - generic [ref=e377]: "|"
                      - paragraph [ref=e378]: 2 Baths
                    - generic [ref=e379]:
                      - paragraph [ref=e380]: 1 Half Bath
                      - generic [ref=e381]: "|"
                      - paragraph [ref=e383]: 2 Car Garage
              - generic [ref=e386] [cursor=pointer]:
                - generic [ref=e388]:
                  - paragraph [ref=e391]: Ready December 2026
                  - paragraph [ref=e393]: $648,990
                  - img "Rendering of the Prairie elevation for the Fullerton Model" [ref=e394]
                  - button "Mark as favorite" [ref=e395]:
                    - img "Favorite Icon" [ref=e396]
                - link "Yorkville Fullerton Floorplan | Detached 20519 Yorklyn Street SW 2,043 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage" [ref=e398]:
                  - /url: /alberta/calgary/calgary/yorkville/fullerton/20519-yorklyn-street-sw
                  - generic [ref=e399]: Fullerton Floorplan | Detached
                  - generic [ref=e400]: 20519 Yorklyn Street SW
                  - generic [ref=e401]:
                    - paragraph [ref=e404]: 2,043 Sq. Ft.
                    - generic [ref=e405]:
                      - paragraph [ref=e406]: 3 Beds
                      - generic [ref=e407]: "|"
                      - paragraph [ref=e408]: 2 Baths
                    - generic [ref=e409]:
                      - paragraph [ref=e410]: 1 Half Bath
                      - generic [ref=e411]: "|"
                      - paragraph [ref=e413]: 2 Car Garage
              - generic [ref=e416] [cursor=pointer]:
                - generic [ref=e418]:
                  - paragraph [ref=e421]: Ready Now
                  - paragraph [ref=e423]: $804,990
                  - img "Bishop Craftsman Elevation Rendering" [ref=e424]
                  - button "Mark as favorite" [ref=e425]:
                    - img "Favorite Icon" [ref=e426]
                - link "Yorkville Bishop Floorplan | Detached 20531 Yorklyn Street SW 2,769 Sq. Ft. 5 Beds 3 Baths 1 Half Bath 2 Car Garage" [ref=e428]:
                  - /url: /alberta/calgary/calgary/yorkville/bishop/20531-yorklyn-street-sw
                  - generic [ref=e429]: Bishop Floorplan | Detached
                  - generic [ref=e430]: 20531 Yorklyn Street SW
                  - generic [ref=e431]:
                    - paragraph [ref=e434]: 2,769 Sq. Ft.
                    - generic [ref=e435]:
                      - paragraph [ref=e436]: 5 Beds
                      - generic [ref=e437]: "|"
                      - paragraph [ref=e438]: 3 Baths
                    - generic [ref=e439]:
                      - paragraph [ref=e440]: 1 Half Bath
                      - generic [ref=e441]: "|"
                      - paragraph [ref=e443]: 2 Car Garage
      - generic [ref=e446]:
        - article [ref=e447]:
          - heading "Golf" [level=3] [ref=e449]
          - paragraph [ref=e450]: Enjoy weekend downtime at Sirocco Golf Club.
        - article [ref=e451]:
          - heading "Transit" [level=3] [ref=e453]
          - paragraph [ref=e454]: Commutes are a breeze with multiple transit stops just outside the community.
        - article [ref=e455]:
          - heading "Nature" [level=3] [ref=e457]
          - paragraph [ref=e458]: Enjoy the outdoors at Fish Creek Provincial Park or along the Rotary/Mattamy Greenway.
        - article [ref=e459]:
          - heading "Parks" [level=3] [ref=e461]
          - paragraph [ref=e462]: Direct access to Central Park, Calgary’s only all-season, all-abilities park.
        - article [ref=e463]:
          - heading "Shopping" [level=3] [ref=e465]
          - paragraph [ref=e466]: Close to several shopping complexes with groceries and more across the street.
        - article [ref=e467]:
          - heading "Recreation" [level=3] [ref=e469]
          - paragraph [ref=e470]: Find family fun at recreation centres, Granary Road and Spruce Meadows.
      - generic [ref=e471]:
        - generic [ref=e475]:
          - 'img "Your Basement Has Ambitions: Free Finished Basement & Suite-Ready Upgrades*" [ref=e480]'
          - generic [ref=e483]:
            - heading "More Space. More Possibility." [level=2] [ref=e484]
            - generic [ref=e486]:
              - paragraph [ref=e487]: For a limited time, get a free finished basement with suite-ready upgrades* or upgrade to a fully developed legal basement suite starting at only $20,000.* Enjoy more space today or unlock rental income potential that could help offset your monthly mortgage payments.
              - paragraph [ref=e488]
              - paragraph [ref=e489]: "*Terms and conditions apply."
            - link "LEARN MORE" [ref=e491] [cursor=pointer]:
              - /url: https://mattamyhomes.com/alberta/calgary/promos/free-basement
              - generic [ref=e492]: LEARN MORE
        - generic [ref=e496]:
          - img "Better Living headline, person sitting on chair in living room looking towards window with sunlight coming in" [ref=e501]
          - generic [ref=e504]:
            - heading "Solar Power Made Simple!" [level=2] [ref=e505]
            - paragraph [ref=e508]: Turn sunlight into savings with solar panels, now included on all newly built Calgary homes! Learn more about how generating your own solar power can help lower your energy bills and contribute to a healthier planet.
            - link "LEARN MORE" [ref=e510] [cursor=pointer]:
              - /url: https://mattamyhomes.com/alberta/calgary/promos/solar-initiative
              - generic [ref=e511]: LEARN MORE
        - generic [ref=e515]:
          - img "Aerial view of houses with solar panels on roof, trees in background" [ref=e520]
          - generic [ref=e523]:
            - heading "Where Value Grows" [level=2] [ref=e524]
            - paragraph [ref=e527]:
              - text: Find the home that perfectly suits your life in Yorkville. With the option of Hardie Board exteriors, your home is built to withstand all the elements. For those who need more room to grow, our
              - strong [ref=e528]: WideLot
              - text: ™ options offer larger, brighter rooms, better flow between spaces and inviting front porches to help you connect with neighbours. Plus, as part of our mission to make sustainable living easier and more accessible for all, solar panels are now included on all new homes in Calgary – this is where sunshine creates savings.
        - generic [ref=e532]:
          - img "Aerial image of Central Park with playground, pathways, grass and trees" [ref=e537]
          - generic [ref=e540]:
            - heading "Where Nature Is Nearby" [level=2] [ref=e541]
            - generic [ref=e542]: Nature is just steps away in Yorkville’s Central Park. This 4-acre green space is Calgary’s only all-season, all-abilities park. It offers something for everyone with a skate park, a playground, ping-pong tables, a puddle rink and more. When you want to venture further, Fish Creek Provincial Park is a short drive away and the Rotary/Mattamy Greenway connects you to the city on foot or bike. This is where nature is part of every day.
        - generic [ref=e546]:
          - img "Father and two children at grocery store with shopping cart" [ref=e551]
          - generic [ref=e554]:
            - heading "Where Errands Are Easy" [level=2] [ref=e555]
            - generic [ref=e556]: Just across the street from Yorkville, you’ll find groceries, a pharmacy, restaurants, fitness/yoga centres and local medical clinics. Multiple transit routes are within walking distance and a short drive will lead you to shopping centres, schools, libraries, recreation complexes and more. This is where everything you need is at your fingertips.
      - generic [ref=e558]:
        - heading "Thoughtfully designed with you in mind" [level=2] [ref=e559]
        - generic [ref=e560]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e562]:
          - generic [ref=e563]:
            - radiogroup "Content type" [ref=e565] [cursor=pointer]:
              - radio "Videos" [ref=e566]:
                - img [ref=e568]
                - generic [ref=e571]: Videos
              - radio "360 Tours" [ref=e572]:
                - img [ref=e574]
                - generic [ref=e577]: 360 Tours
              - radio "Photos" [ref=e578]:
                - img [ref=e580]
                - generic [ref=e583]: Photos
            - radiogroup "Content type" [ref=e584]:
              - radio "Community Gallery" [checked] [ref=e585] [cursor=pointer]:
                - paragraph [ref=e586]: Community Gallery
              - generic [ref=e587]: "|"
              - radio "Fullerton" [ref=e588] [cursor=pointer]:
                - paragraph [ref=e589]: Fullerton
              - generic [ref=e590]: "|"
              - radio "Monarch" [ref=e591] [cursor=pointer]:
                - paragraph [ref=e592]: Monarch
              - generic [ref=e593]: "|"
              - radio "Smythe" [ref=e594] [cursor=pointer]:
                - paragraph [ref=e595]: Smythe
              - paragraph [ref=e596]: Slide has changed view to 0
          - generic [ref=e597]:
            - generic [ref=e599]:
              - button "Previous slide of Gallery" [ref=e601] [cursor=pointer]:
                - img [ref=e602]
              - generic [ref=e605]:
                - button [ref=e610] [cursor=pointer]
                - iframe [ref=e615]:
                  - generic [ref=f179e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f179e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f179e3]
                - iframe [ref=e620]:
                  - generic [ref=f180e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f180e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f180e3]
                - iframe [ref=e625]:
                  - generic [ref=f181e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f181e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f181e3]
                - button [ref=e630] [cursor=pointer]
                - button [ref=e635] [cursor=pointer]
                - button [ref=e640] [cursor=pointer]
                - button [ref=e645] [cursor=pointer]
                - button [ref=e650] [cursor=pointer]
                - button [ref=e655] [cursor=pointer]
                - button [ref=e660] [cursor=pointer]
                - button [ref=e665] [cursor=pointer]
                - button [ref=e670] [cursor=pointer]
                - button [ref=e675] [cursor=pointer]
                - button [ref=e680] [cursor=pointer]
                - button [ref=e685] [cursor=pointer]
                - button [ref=e690] [cursor=pointer]
                - button [ref=e695] [cursor=pointer]
                - iframe [ref=e700]:
                  - generic [active] [ref=f182e1]:
                    - main [ref=f182e2]:
                      - generic [ref=f182e3]:
                        - generic [ref=f182e4]:
                          - img "Icon for my.matterport.com" [ref=f182e5]
                          - heading "my.matterport.com" [level=1] [ref=f182e6]
                        - heading "Performing security verification" [level=2] [ref=f182e7]
                        - paragraph [ref=f182e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f182e13]:
                      - generic [ref=f182e15]:
                        - generic [ref=f182e17]:
                          - text: "Ray ID:"
                          - code [ref=f182e18]: a5f97632ad355823
                        - generic [ref=f182e19]:
                          - generic [ref=f182e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f182e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f182e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e705]:
                  - generic [ref=f183e3] [cursor=pointer]:
                    - img [ref=f183e4]
                    - generic [ref=f183e5]:
                      - generic [ref=f183e6]: CLICK TO EXPLORE
                      - generic [ref=f183e7]:
                        - img [ref=f183e8]
                        - img [ref=f183e9]
                - iframe [ref=e710]:
                  - generic [active] [ref=f184e1]:
                    - main [ref=f184e2]:
                      - generic [ref=f184e3]:
                        - generic [ref=f184e4]:
                          - img "Icon for my.matterport.com" [ref=f184e5]
                          - heading "my.matterport.com" [level=1] [ref=f184e6]
                        - heading "Performing security verification" [level=2] [ref=f184e7]
                        - paragraph [ref=f184e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                        - alert [ref=f184e13]:
                          - generic [ref=f184e14]:
                            - heading "Why is this verification taking longer?" [level=2] [ref=f184e15]
                            - paragraph [ref=f184e16]: This verification can take longer due to an older computer or a slow internet connection.
                            - paragraph [ref=f184e17]: "What to do next:"
                            - list [ref=f184e18]:
                              - listitem [ref=f184e19]: Wait briefly. Refreshing the page will restart the security verification and may take longer.
                              - listitem [ref=f184e20]:
                                - text: If the verification still does not complete,
                                - generic [ref=f184e21] [cursor=pointer]: refresh this page
                                - text: .
                              - listitem [ref=f184e22]:
                                - text: If you are still stuck on this page after a page refresh, refer to Cloudflare’s
                                - generic [ref=f184e23] [cursor=pointer]: troubleshooting documentation
                                - text: for more help.
                    - contentinfo [ref=f184e24]:
                      - generic [ref=f184e26]:
                        - generic [ref=f184e28]:
                          - text: "Ray ID:"
                          - code [ref=f184e29]: a5f97450efdf9716
                        - generic [ref=f184e30]:
                          - generic [ref=f184e31]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f184e32] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f184e34] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e715]:
                  - generic [active] [ref=f185e1]:
                    - main [ref=f185e2]:
                      - generic [ref=f185e3]:
                        - generic [ref=f185e4]:
                          - img "Icon for my.matterport.com" [ref=f185e5]
                          - heading "my.matterport.com" [level=1] [ref=f185e6]
                        - heading "Performing security verification" [level=2] [ref=f185e7]
                        - paragraph [ref=f185e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f185e15]:
                      - generic [ref=f185e17]:
                        - generic [ref=f185e19]:
                          - text: "Ray ID:"
                          - code [ref=f185e20]: a5f971a9ddd1f5a5
                        - generic [ref=f185e21]:
                          - generic [ref=f185e22]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f185e23] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f185e25] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e720]:
                  - generic [ref=f186e3] [cursor=pointer]:
                    - img [ref=f186e4]
                    - generic [ref=f186e5]:
                      - generic [ref=f186e6]: CLICK TO EXPLORE
                      - generic [ref=f186e7]:
                        - img [ref=f186e8]
                        - img [ref=f186e9]
                - iframe [ref=e725]:
                  - generic [active] [ref=f187e1]:
                    - main [ref=f187e2]:
                      - generic [ref=f187e3]:
                        - generic [ref=f187e4]:
                          - img "Icon for my.matterport.com" [ref=f187e5]
                          - heading "my.matterport.com" [level=1] [ref=f187e6]
                        - heading "Performing security verification" [level=2] [ref=f187e7]
                        - paragraph [ref=f187e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f187e15]:
                      - generic [ref=f187e17]:
                        - generic [ref=f187e19]:
                          - text: "Ray ID:"
                          - code [ref=f187e20]: a5f9717d6b22f5a5
                        - generic [ref=f187e21]:
                          - generic [ref=f187e22]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f187e23] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f187e25] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e730]:
                  - generic [active] [ref=f188e1]:
                    - main [ref=f188e2]:
                      - generic [ref=f188e3]:
                        - generic [ref=f188e4]:
                          - img "Icon for my.matterport.com" [ref=f188e5]
                          - heading "my.matterport.com" [level=1] [ref=f188e6]
                        - heading "Performing security verification" [level=2] [ref=f188e7]
                        - paragraph [ref=f188e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f188e15]:
                      - generic [ref=f188e17]:
                        - generic [ref=f188e19]:
                          - text: "Ray ID:"
                          - code [ref=f188e20]: a5f971ad3840f5a5
                        - generic [ref=f188e21]:
                          - generic [ref=f188e22]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f188e23] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f188e25] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e735]
                - iframe [ref=e740]:
                  - generic [ref=f190e3] [cursor=pointer]:
                    - img [ref=f190e4]
                    - generic [ref=f190e5]:
                      - generic [ref=f190e6]: CLICK TO EXPLORE
                      - generic [ref=f190e7]:
                        - img [ref=f190e8]
                        - img [ref=f190e9]
                - iframe [ref=e745]:
                  - generic [active] [ref=f191e1]:
                    - main [ref=f191e2]:
                      - generic [ref=f191e3]:
                        - generic [ref=f191e4]:
                          - img "Icon for my.matterport.com" [ref=f191e5]
                          - heading "my.matterport.com" [level=1] [ref=f191e6]
                        - heading "Performing security verification" [level=2] [ref=f191e7]
                        - paragraph [ref=f191e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f191e15]:
                      - generic [ref=f191e17]:
                        - generic [ref=f191e19]:
                          - text: "Ray ID:"
                          - code [ref=f191e20]: a5f971ab6eb2f5a5
                        - generic [ref=f191e21]:
                          - generic [ref=f191e22]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f191e23] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f191e25] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e750]:
                  - generic [ref=f192e3] [cursor=pointer]:
                    - img [ref=f192e4]
                    - generic [ref=f192e5]:
                      - generic [ref=f192e6]: CLICK TO EXPLORE
                      - generic [ref=f192e7]:
                        - img [ref=f192e8]
                        - img [ref=f192e9]
                - iframe [ref=e755]:
                  - generic [ref=f193e3] [cursor=pointer]:
                    - img [ref=f193e4]
                    - generic [ref=f193e5]:
                      - generic [ref=f193e6]: CLICK TO EXPLORE
                      - generic [ref=f193e7]:
                        - img [ref=f193e8]
                        - img [ref=f193e9]
                - iframe [ref=e760]:
                  - generic [ref=f194e14]:
                    - generic [ref=f194e32]: Finch
                    - generic [ref=f194e41]: LIVING ROOM
                    - generic [ref=f194e46]:
                      - generic [ref=f194e51]:
                        - img
                      - generic [ref=f194e56]:
                        - img
                      - generic [ref=f194e61]:
                        - img
                    - generic [ref=f194e80]:
                      - generic [ref=f194e83]: DISCLAIMER
                      - paragraph [ref=f194e84]
                      - generic [ref=f194e86]: All illustrations are artist’s concept. Specifications, terms, and conditions are subject to change without notice.
                - iframe [ref=e765]:
                  - generic [ref=f195e3] [cursor=pointer]:
                    - img [ref=f195e4]
                    - generic [ref=f195e5]:
                      - generic [ref=f195e6]: CLICK TO EXPLORE
                      - generic [ref=f195e7]:
                        - img [ref=f195e8]
                        - img [ref=f195e9]
                - iframe [ref=e770]:
                  - generic [ref=f196e3] [cursor=pointer]:
                    - img [ref=f196e4]
                    - generic [ref=f196e5]:
                      - generic [ref=f196e6]: CLICK TO EXPLORE
                      - generic [ref=f196e7]:
                        - img [ref=f196e8]
                        - img [ref=f196e9]
                - iframe [ref=e775]:
                  - generic [ref=f197e3] [cursor=pointer]:
                    - img [ref=f197e4]
                    - generic [ref=f197e5]:
                      - generic [ref=f197e6]: CLICK TO EXPLORE
                      - generic [ref=f197e7]:
                        - img [ref=f197e8]
                        - img [ref=f197e9]
                - iframe [ref=e780]:
                  - generic [ref=f198e3] [cursor=pointer]:
                    - img [ref=f198e4]
                    - generic [ref=f198e5]:
                      - generic [ref=f198e6]: CLICK TO EXPLORE
                      - generic [ref=f198e7]:
                        - img [ref=f198e8]
                        - img [ref=f198e9]
                - iframe [ref=e785]:
                  - generic [ref=f199e3] [cursor=pointer]:
                    - img [ref=f199e4]
                    - generic [ref=f199e5]:
                      - generic [ref=f199e6]: CLICK TO EXPLORE
                      - generic [ref=f199e7]:
                        - img [ref=f199e8]
                        - img [ref=f199e9]
                - button [ref=e790] [cursor=pointer]
                - button [ref=e795] [cursor=pointer]
                - button [ref=e800] [cursor=pointer]
                - button [ref=e805] [cursor=pointer]
                - button [ref=e810] [cursor=pointer]
                - button [ref=e815] [cursor=pointer]
                - button [ref=e820] [cursor=pointer]
                - button [ref=e825] [cursor=pointer]
                - button [ref=e830] [cursor=pointer]
                - button [ref=e835] [cursor=pointer]
                - button [ref=e840] [cursor=pointer]
                - button [ref=e845] [cursor=pointer]
                - button [ref=e850] [cursor=pointer]
                - iframe [ref=e855]:
                  - generic [ref=f200e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f200e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f200e3]
              - button "Next slide of Gallery" [ref=e857] [cursor=pointer]:
                - img [ref=e858]
            - generic [ref=e860]: Yorkville Central Park Promotion Video
            - paragraph [ref=e862]:
              - generic [ref=e863]: Slide number
              - text: 1/48
        - generic [ref=e864]:
          - generic [ref=e865]:
            - text: "Transcript:"
            - 'link "Download Yorkville Central Park: Grand Opening Event (.txt file) transcript" [ref=e866] [cursor=pointer]':
              - /url: blob:https://mattamyhomes.com/a4aa8f32-ab9a-49c8-8ddf-8f0f0c0f730d
              - text: "Yorkville Central Park: Grand Opening Event (.txt file)"
          - generic [ref=e867]:
            - text: "Transcript:"
            - link "Download Yorkville in Calgary Alberta (.txt file) transcript" [ref=e868] [cursor=pointer]:
              - /url: blob:https://mattamyhomes.com/8b5aa3af-5616-4b62-bee0-d3d99b3b0c55
              - text: Yorkville in Calgary Alberta (.txt file)
          - generic [ref=e869]:
            - text: "Transcript:"
            - link "Download The Mattamy/Rotary Greenway (.txt file) transcript" [ref=e870] [cursor=pointer]:
              - /url: blob:https://mattamyhomes.com/508f3f2a-a633-491c-bae0-c4c62f9bb18b
              - text: The Mattamy/Rotary Greenway (.txt file)
      - generic [ref=e873]:
        - heading "Conveniently located to fit your needs" [level=2] [ref=e874]
        - button "Nearby Services dropdown list" [ref=e879] [cursor=pointer]:
          - generic [ref=e881]: What's Nearby
          - img [ref=e883]
      - generic [ref=e894]:
        - heading "Explore the community" [level=2] [ref=e895]
        - generic [ref=e896]: Take a closer look at the community sitemap and get familiar with our available offerings.
        - generic [ref=e897]:
          - button "Resize Iframe" [ref=e898] [cursor=pointer]:
            - img "Resize Icon" [ref=e899]
          - iframe [ref=e904]:
            - generic [ref=f461e3]:
              - generic [ref=f461e5]:
                - generic [ref=f461e11]:
                  - button "Hide UI" [ref=f461e12] [cursor=pointer]:
                    - img [ref=f461e14]
                  - button "Reset" [ref=f461e15] [cursor=pointer]:
                    - img [ref=f461e17]
                  - button "Print" [ref=f461e18] [cursor=pointer]:
                    - img [ref=f461e20]
                  - generic [ref=f461e21]:
                    - button "Increase Zoom" [ref=f461e22] [cursor=pointer]:
                      - img [ref=f461e24]
                    - button "Decrease Zoom" [ref=f461e25] [cursor=pointer]:
                      - img [ref=f461e27]
                  - generic "position controls" [ref=f461e29]:
                    - button "move map up" [ref=f461e30] [cursor=pointer]
                    - generic [ref=f461e32]:
                      - button "move map left" [ref=f461e33] [cursor=pointer]
                      - button "move map right" [ref=f461e36] [cursor=pointer]
                    - button "move map down" [ref=f461e38] [cursor=pointer]
                - generic [ref=f461e40]:
                  - generic [ref=f461e41]:
                    - generic [ref=f461e42]:
                      - img [ref=f461e44]
                      - generic [ref=f461e45]:
                        - text: Yorkville
                        - text: SITE MAP
                    - generic [ref=f461e46]:
                      - generic [ref=f461e47]: "Neighborhood:"
                      - combobox "Select Neighborhood" [disabled] [ref=f461e48]:
                        - generic [ref=f461e49]:
                          - generic [ref=f461e51]: Yorkville
                          - img [ref=f461e54]
                  - generic [ref=f461e55]:
                    - generic [ref=f461e57]:
                      - button "Homesite Search" [ref=f461e58] [cursor=pointer]
                      - button "Homesite Details"
                    - generic [ref=f461e60]:
                      - generic [ref=f461e63]:
                        - generic [ref=f461e64]:
                          - generic [ref=f461e65]:
                            - heading "Homesite Status" [level=2] [ref=f461e66]
                            - generic [ref=f461e67]: All
                          - button "Collapse Homesite Status" [ref=f461e68] [cursor=pointer]:
                            - img [ref=f461e70]
                        - generic [ref=f461e73]:
                          - generic [ref=f461e75]:
                            - img [ref=f461e77]
                            - generic [ref=f461e78]: Show All
                            - checkbox "Show All" [checked] [ref=f461e81] [cursor=pointer]
                          - generic [ref=f461e82]:
                            - generic [ref=f461e84]:
                              - generic [ref=f461e85]:
                                - generic [ref=f461e86]:
                                  - heading "Available" [level=2] [ref=f461e87]
                                  - generic [ref=f461e88]:
                                    - generic [ref=f461e89]: "61"
                                    - checkbox "Available" [checked] [ref=f461e92] [cursor=pointer]
                                - button "Collapse Available" [ref=f461e93] [cursor=pointer]:
                                  - img [ref=f461e95]
                              - generic [ref=f461e98]:
                                - generic [ref=f461e99]:
                                  - generic [ref=f461e101]: Pre-Sale
                                  - generic [ref=f461e102]: "13"
                                  - checkbox "Pre-Sale" [checked] [ref=f461e105] [cursor=pointer]
                                - generic [ref=f461e106]:
                                  - generic [ref=f461e108]: Quick Move-In
                                  - generic [ref=f461e109]: "10"
                                  - checkbox "Quick Move-In" [checked] [ref=f461e112] [cursor=pointer]
                                - generic [ref=f461e113]:
                                  - generic [ref=f461e115]: Spec Home
                                  - generic [ref=f461e116]: "38"
                                  - checkbox "Spec Home" [checked] [ref=f461e119] [cursor=pointer]
                            - generic [ref=f461e120]:
                              - generic [ref=f461e122]: Sold
                              - generic [ref=f461e123]: "198"
                              - checkbox "Sold" [checked] [ref=f461e126] [cursor=pointer]
                            - generic [ref=f461e127]:
                              - generic [ref=f461e129]: Conditionally Sold
                              - generic [ref=f461e130]: "17"
                              - checkbox "Conditionally Sold" [checked] [ref=f461e133] [cursor=pointer]
                            - generic [ref=f461e134]:
                              - generic [ref=f461e136]: Show Homes
                              - generic [ref=f461e137]: "3"
                              - checkbox "Show Homes" [checked] [ref=f461e140] [cursor=pointer]
                            - generic [ref=f461e141]:
                              - generic [ref=f461e143]: Future
                              - generic [ref=f461e144]: "186"
                              - checkbox "Future" [checked] [ref=f461e147] [cursor=pointer]
                      - generic [ref=f461e150]:
                        - generic [ref=f461e151]:
                          - generic [ref=f461e152]:
                            - checkbox [ref=f461e155] [cursor=pointer]
                            - heading "Tag Filter" [level=2] [ref=f461e156]
                          - button "Collapse Tag Filter" [ref=f461e157] [cursor=pointer]:
                            - img [ref=f461e159]
                        - combobox "Select a tag" [ref=f461e163]:
                          - generic [ref=f461e164] [cursor=pointer]:
                            - generic [ref=f461e165]: Select a tag
                            - img [ref=f461e168]
                      - generic [ref=f461e171]:
                        - generic [ref=f461e172]:
                          - generic [ref=f461e173]:
                            - checkbox "Enable Floorplan Filters" [ref=f461e176] [cursor=pointer]
                            - heading "Floorplan Filters" [level=2] [ref=f461e177]
                            - generic [ref=f461e178]: All
                          - button "Collapse Floorplan Filters" [ref=f461e179] [cursor=pointer]:
                            - img [ref=f461e181]
                        - generic [ref=f461e182]:
                          - generic [ref=f461e183]:
                            - img [ref=f461e185]
                            - generic [ref=f461e186]: "--"
                          - generic [ref=f461e187]:
                            - img [ref=f461e189]
                            - generic [ref=f461e190]: "--"
                          - generic [ref=f461e191]:
                            - img [ref=f461e193]
                            - generic [ref=f461e194]: "--"
                          - generic [ref=f461e195]:
                            - img [ref=f461e197]
                            - generic [ref=f461e198]: "--"
                          - generic [ref=f461e199]:
                            - img [ref=f461e201]
                            - generic [ref=f461e202]: "--"
                          - generic [ref=f461e203]:
                            - img [ref=f461e205]
                            - generic [ref=f461e206]: "--"
                          - generic [ref=f461e207]:
                            - img [ref=f461e209]
                            - generic [ref=f461e210]: "--"
                        - generic [ref=f461e213]:
                          - generic [ref=f461e214]:
                            - generic [ref=f461e215]: "Filter by:"
                            - button "Reset All" [ref=f461e217] [cursor=pointer]:
                              - img [ref=f461e219]
                              - generic [ref=f461e220]: Reset All
                          - generic [ref=f461e221]:
                            - generic [ref=f461e222]:
                              - generic [ref=f461e223]:
                                - img [ref=f461e225]
                                - text: Floorplan
                              - combobox "Select Floorplan Filter" [ref=f461e226]:
                                - generic [ref=f461e227] [cursor=pointer]:
                                  - generic [ref=f461e229]: View All
                                  - img [ref=f461e232]
                            - generic [ref=f461e233]:
                              - generic [ref=f461e234]:
                                - img [ref=f461e236]
                                - text: Price
                              - generic [ref=f461e237]: From
                              - combobox "Select Minimum Price Filter" [ref=f461e238]:
                                - generic [ref=f461e239] [cursor=pointer]:
                                  - generic [ref=f461e241]: "--"
                                  - img [ref=f461e244]
                            - generic [ref=f461e245]:
                              - generic [ref=f461e247]: To
                              - combobox "Select Maximum Price Filter" [ref=f461e248]:
                                - generic [ref=f461e249] [cursor=pointer]:
                                  - generic [ref=f461e251]: "--"
                                  - img [ref=f461e254]
                            - generic [ref=f461e255]:
                              - generic [ref=f461e256]:
                                - img [ref=f461e258]
                                - text: Floors
                              - generic [ref=f461e259]:
                                - button "Decrease Floors":
                                  - generic:
                                    - img
                                - generic [ref=f461e260]: "--"
                                - button "Increase Floors" [ref=f461e261] [cursor=pointer]:
                                  - img [ref=f461e263]
                            - generic [ref=f461e264]:
                              - generic [ref=f461e265]:
                                - img [ref=f461e267]
                                - text: Bedrooms
                              - generic [ref=f461e268]:
                                - button "Decrease Bedrooms":
                                  - generic:
                                    - img
                                - generic [ref=f461e269]: "--"
                                - button "Increase Bedrooms" [ref=f461e270] [cursor=pointer]:
                                  - img [ref=f461e272]
                            - generic [ref=f461e273]:
                              - generic [ref=f461e274]:
                                - img [ref=f461e276]
                                - text: Bathrooms
                              - generic [ref=f461e277]:
                                - button "Decrease Bathrooms":
                                  - generic:
                                    - img
                                - generic [ref=f461e278]: "--"
                                - button "Increase Bathrooms" [ref=f461e279] [cursor=pointer]:
                                  - img [ref=f461e281]
                            - generic [ref=f461e282]:
                              - generic [ref=f461e283]:
                                - img [ref=f461e285]
                                - text: Car Garage
                              - generic [ref=f461e286]:
                                - button "Decrease Garage Size":
                                  - generic:
                                    - img
                                - generic [ref=f461e287]: "--"
                                - button "Increase Garage Size" [ref=f461e288] [cursor=pointer]:
                                  - img [ref=f461e290]
                            - generic [ref=f461e291]:
                              - generic [ref=f461e292]:
                                - img [ref=f461e294]
                                - text: Square Feet
                              - generic [ref=f461e295]: From
                              - combobox "Select Minimum Square Foot Filter" [ref=f461e296]:
                                - generic [ref=f461e297] [cursor=pointer]:
                                  - generic [ref=f461e299]: "--"
                                  - img [ref=f461e302]
                            - generic [ref=f461e303]:
                              - generic [ref=f461e305]: To
                              - combobox "Select Maximum Square Foot Filter" [ref=f461e306]:
                                - generic [ref=f461e307] [cursor=pointer]:
                                  - generic [ref=f461e309]: "--"
                                  - img [ref=f461e312]
                  - button "Close Side Menu" [ref=f461e314] [cursor=pointer]:
                    - img [ref=f461e316]
              - generic:
                - generic:
                  - generic:
                    - img
      - generic [ref=e909]:
        - img "View of Calgary by the water with high-rise buildings and a bridge" [ref=e914]
        - generic [ref=e917]:
          - heading "Mattamy Homes in Calgary" [level=2] [ref=e918]
          - generic [ref=e919]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
          - link "Learn More About Living in Calgary" [ref=e921] [cursor=pointer]:
            - /url: /alberta/calgary
            - generic [ref=e922]: Learn More About Living in Calgary
      - generic [ref=e925]:
        - button [ref=e926] [cursor=pointer]:
          - img [ref=e927]
        - generic [ref=e931]:
          - generic [ref=e932]:
            - heading "Sign Up For Community Updates" [level=3] [ref=e933]
            - generic [ref=e935]: Required fields are marked with *
            - separator [ref=e936]
          - generic [ref=e937]:
            - textbox [ref=e938]
            - textbox "company" [ref=e939]:
              - /placeholder: ""
            - generic [ref=e940]:
              - generic [ref=e941]: First name *
              - textbox "First name" [ref=e943]:
                - /placeholder: ""
              - generic [ref=e944]:
                - img [ref=e945]
                - generic [ref=e947]: "Error: First name is Required"
            - generic [ref=e948]:
              - generic [ref=e949]: Last name *
              - textbox "Last name" [ref=e951]:
                - /placeholder: ""
              - generic [ref=e952]:
                - img [ref=e953]
                - generic [ref=e955]: "Error: Last name is Required"
            - generic [ref=e956]:
              - generic [ref=e957]: Email *
              - textbox "Email" [ref=e959]:
                - /placeholder: ""
              - generic [ref=e960]:
                - img [ref=e961]
                - generic [ref=e963]: "Error: Email is Required"
            - generic [ref=e964]:
              - generic [ref=e965]: Country of Residence *
              - generic [ref=e966]:
                - combobox "Country of Residence" [ref=e967] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
              - generic [ref=e968]:
                - img [ref=e969]
                - generic [ref=e971]: "Error: Country of Residence is Required"
            - generic [ref=e972]:
              - generic [ref=e973]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e975]:
                - /placeholder: ""
              - generic [ref=e976]:
                - img [ref=e977]
                - generic [ref=e979]: "Error: Zip/Postal Code is Required"
            - generic [ref=e980]:
              - generic [ref=e981]: Phone number
              - textbox "Phone number" [ref=e983]:
                - /placeholder: ""
            - generic [ref=e984]:
              - generic [ref=e985]:
                - text: When do you want to move into your home?
                - generic [ref=e986]: "*"
              - generic [ref=e987]:
                - combobox "When do you want to move into your home?" [ref=e988] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
              - generic [ref=e989]:
                - img [ref=e990]
                - generic [ref=e992]: "Error: When do you want to move into your home? is Required"
            - generic [ref=e993]:
              - generic [ref=e994]:
                - text: Are you a first time homebuyer?
                - generic [ref=e995]: "*"
              - generic [ref=e996]:
                - combobox "Are you a first time homebuyer?" [ref=e997] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
              - generic [ref=e998]:
                - img [ref=e999]
                - generic [ref=e1001]: "Error: Are you a first time homebuyer? is Required"
            - generic [ref=e1002]:
              - generic [ref=e1003]:
                - text: How many bedrooms do you need?
                - generic [ref=e1004]: "*"
              - generic [ref=e1005]:
                - combobox "How many bedrooms do you need?" [ref=e1006] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
              - generic [ref=e1007]:
                - img [ref=e1008]
                - generic [ref=e1010]: "Error: How many bedrooms do you need? is Required"
            - generic [ref=e1011]:
              - generic [ref=e1012]:
                - text: What is your budget?
                - generic [ref=e1013]: "*"
              - generic [ref=e1014]:
                - combobox "What is your budget?" [ref=e1015] [cursor=pointer]:
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
              - generic [ref=e1016]:
                - img [ref=e1017]
                - generic [ref=e1019]: "Error: What is your budget? is Required"
            - generic [ref=e1021] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e1022]
              - generic [ref=e1023]: I am a Real Estate Agent
            - generic [ref=e1025] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e1026]'
              - generic [ref=e1027]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e1028]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e1029]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e1030]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e1031]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e1032]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e1034] [cursor=pointer]
      - button "View promotions" [ref=e1036] [cursor=pointer]:
        - generic [ref=e1037]: View promotions
        - img [ref=e1038]
      - generic [ref=e1042] [cursor=pointer]:
        - button "New home rebates available!" [ref=e1043]:
          - generic [ref=e1045]:
            - img "Click Here New home rebates available!" [ref=e1048]
            - generic [ref=e1051]: click here
        - generic [ref=e1052]: "1"
        - img [ref=e1054]
    - contentinfo "footer" [ref=e1056]:
      - generic [ref=e1058]:
        - generic [ref=e1059]:
          - generic [ref=e1060]:
            - heading "Explore" [level=2] [ref=e1061]
            - list [ref=e1063]:
              - listitem [ref=e1064]:
                - link "Mattamy Homes USA" [ref=e1065] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/us
              - listitem [ref=e1066]:
                - link "Mattamy Homes Canada" [ref=e1067] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/ca
              - listitem [ref=e1068]:
                - link "Design Studio" [ref=e1069] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e1070]:
                - link "Customer Care" [ref=e1071] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e1073]:
            - heading "About Mattamy" [level=2] [ref=e1074]
            - list [ref=e1076]:
              - listitem [ref=e1077]:
                - link "About Us" [ref=e1078] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e1079]:
                - link "Contact Us" [ref=e1080] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e1081]:
                - link "Careers" [ref=e1082] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e1083]:
                - link "Media and Investor Relations" [ref=e1084] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e1086]:
            - heading "Connect With Us" [level=2] [ref=e1087]
            - generic [ref=e1089]:
              - link "Facebook (opens in a new tab)" [ref=e1090] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomes
                - img [ref=e1091]
              - link "Instagram (opens in a new tab)" [ref=e1093] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomes/
                - img [ref=e1094]
              - link "Youtube (opens in a new tab)" [ref=e1096] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e1097]
              - link "Pinterest (opens in a new tab)" [ref=e1099] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e1100]
              - link "Linkedin (opens in a new tab)" [ref=e1102] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e1103]
        - generic [ref=e1106]:
          - paragraph [ref=e1107]:
            - link "Accessibility" [ref=e1108] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e1109]: "|"
            - button "Cookie Settings" [ref=e1110] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e1111]: "|"
            - link "Legal Disclaimers" [ref=e1112] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e1113]: "|"
            - link "Privacy Policy" [ref=e1114] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e1115]: "|"
            - link "Terms and Conditions" [ref=e1116] [cursor=pointer]:
              - /url: /terms-and-conditions
          - paragraph [ref=e1117]: ©2026 Mattamy Homes
```

# Test source

```ts
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
  628 | 
  629 |   for (const [field, label] of dedupeFieldExpectations(optionalFields)) {
  630 |     if (await field.count()) {
  631 |       await expectFieldVisible(field, label, timeout, { soft: true });
  632 |     } else {
  633 |       skippedFields.push(label);
  634 |     }
  635 |   }
  636 | 
  637 |   if (skippedFields.length) {
  638 |     await reportValue(`Fields not rendered on ${formName} (skipped)`, skippedFields.join(', '));
  639 |   }
  640 | 
  641 |   await triggerFormValidationWithoutSubmit(form);
  642 |   await expectRequiredErrorsInForm(form, timeout);
  643 | 
  644 |   expect(
  645 |     test.info().errors.slice(initialErrorCount),
  646 |     'Side modal form field audit should have no assertion failures',
> 647 |   ).toHaveLength(0);
      |     ^ Error: Side modal form field audit should have no assertion failures
  648 | }
  649 | 
  650 | /** The fields without which the form is not a lead form at all. */
  651 | function getCoreSideModalFields(form: Locator): Array<[Locator, string]> {
  652 |   return [
  653 |     [form.getByRole('textbox', { name: /first name/i }).first(), 'First name'],
  654 |     [form.getByRole('textbox', { name: /last name/i }).first(), 'Last name'],
  655 |     [form.getByRole('textbox', { name: /^email/i }).first(), 'Email'],
  656 |     [getSubmitButton(form), 'Submit button'],
  657 |   ];
  658 | }
  659 | 
  660 | /** Locates a schema-declared lead-form field. */
  661 | function getLeadFormFieldLocator(form: Locator, field: LeadFormField): Locator {
  662 |   const locators: Record<LeadFormField, Locator> = {
  663 |     comments: findCommentsField(form),
  664 |     bedroomCount: findSelectByLabel(form, /bedroom/i, 'bedroom'),
  665 |     desiredMoveDate: findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move'),
  666 |     newBudget: findSelectByLabel(form, /budget/i, 'budget'),
  667 |     firstTimeHomeBuyer: findSelectByLabel(
  668 |       form,
  669 |       /first.?time.*home.?buyer|first time homebuyer/i,
  670 |       'buyer',
  671 |     ),
  672 |     countryOfResidence: findSelectByLabel(form, /country of residence/i, 'country'),
  673 |   };
  674 | 
  675 |   return locators[field];
  676 | }
  677 | 
  678 | /** Locates the comments / questions textarea. */
  679 | function findCommentsField(form: Locator): Locator {
  680 |   return form
  681 |     .getByRole('textbox', { name: /additional questions|comment|message|special requirement/i })
  682 |     .or(
  683 |       form.locator(
  684 |         [
  685 |           'textarea[aria-label*="additional" i]:not([disabled]):not([aria-disabled="true"]):visible',
  686 |           'textarea[aria-label*="comment" i]:not([disabled]):not([aria-disabled="true"]):visible',
  687 |           'textarea[aria-label*="message" i]:not([disabled]):not([aria-disabled="true"]):visible',
  688 |           'textarea[aria-label*="special requirement" i]:not([disabled]):not([aria-disabled="true"]):visible',
  689 |           'textarea[name*="comment" i]:not([disabled]):not([aria-disabled="true"]):visible',
  690 |           'textarea[name*="requirement" i]:not([disabled]):not([aria-disabled="true"]):visible',
  691 |         ].join(', '),
  692 |       ),
  693 |     );
  694 | }
  695 | 
  696 | /** Report label for a schema-declared lead-form field. */
  697 | function getLeadFormFieldLabel(field: LeadFormField): string {
  698 |   const labels: Record<LeadFormField, string> = {
  699 |     comments: 'Comments',
  700 |     bedroomCount: 'Bedroom Count',
  701 |     desiredMoveDate: 'Desired Move Date',
  702 |     newBudget: 'Budget',
  703 |     firstTimeHomeBuyer: 'First Time Home Buyer',
  704 |     countryOfResidence: 'Country of Residence',
  705 |   };
  706 | 
  707 |   return labels[field];
  708 | }
  709 | 
  710 | /** Drops field expectations whose label already appeared. */
  711 | function dedupeFieldExpectations(fields: Array<[Locator, string]>): Array<[Locator, string]> {
  712 |   const seenLabels = new Set<string>();
  713 | 
  714 |   return fields.filter(([, label]) => {
  715 |     if (seenLabels.has(label)) {
  716 |       return false;
  717 |     }
  718 | 
  719 |     seenLabels.add(label);
  720 |     return true;
  721 |   });
  722 | }
  723 | 
  724 | /** Fill a side modal form with a profile's invalid data. */
  725 | export async function fillInvalidSideModalForm(
  726 |   form: Locator,
  727 |   profile: LeadFormProfileKey,
  728 |   options: FillLeadOptions = {},
  729 | ): Promise<void> {
  730 |   await fillLeadFormFields(form, getInvalidLeadData(profile), options);
  731 | }
  732 | 
  733 | /** Fill a side modal form with a profile's valid data plus any extra dropdowns; `leadData` overrides values. */
  734 | export async function fillValidSideModalForm(
  735 |   form: Locator,
  736 |   profile: LeadFormProfileKey,
  737 |   options: FillLeadOptions = {},
  738 |   leadData: Partial<LeadFieldData> = {},
  739 | ): Promise<ExtraLeadFields> {
  740 |   return fillLeadFormByFormId(form, { ...getValidLeadData(profile), ...leadData }, options);
  741 | }
  742 | 
  743 | /* Extra lead dropdowns (bedrooms, move date, budget, first-time buyer): optional in the US, required in Canada. */
  744 | 
  745 | /** Selected values for the extra lead fields; '' for any field that is absent from the form. */
  746 | export type ExtraLeadFields = {
  747 |   bedroomCount: string;
```