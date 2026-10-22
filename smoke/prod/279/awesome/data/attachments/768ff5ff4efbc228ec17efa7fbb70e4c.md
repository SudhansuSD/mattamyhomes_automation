# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communityPage.spec.ts >> Community Detail - Yorkville >> Navigation Validation >> @smoke @regression | CAN | Validate plans navigation
- Location: tests/communityPage.spec.ts:70:9

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('a[href*="/brinkley"]').first()
    - locator resolved to <a class="mx-5 my-4 flex flex-col w-auto" href="/alberta/calgary/calgary/yorkville/brinkley-i" aria-label="Yorkville Attached Brinkley I 1,424 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage ">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

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
    - banner [ref=e16]:
      - generic [ref=e17]:
        - link "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e18] [cursor=pointer]:
          - /url: /
          - figure [ref=e19]:
            - img "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes" [ref=e20]
        - navigation [ref=e21]:
          - generic [ref=e22]:
            - button "Find Your Dream Home" [ref=e24] [cursor=pointer]:
              - paragraph [ref=e25]:
                - text: Find Your Dream Home
                - img [ref=e26]
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
          - link "Sustainability" [ref=e29] [cursor=pointer]:
            - /url: /about/sustainability
            - paragraph [ref=e30]: Sustainability
          - button "Resources" [ref=e33] [cursor=pointer]:
            - paragraph [ref=e34]:
              - text: Resources
              - img [ref=e35]
          - link "Customer Care" [ref=e38] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e39]: Customer Care
          - button "About" [ref=e42] [cursor=pointer]:
            - paragraph [ref=e43]:
              - text: About
              - img [ref=e44]
          - link "Contact Us" [ref=e47] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e48]: Contact Us
        - generic [ref=e49]:
          - button "Go to Favorites Page" [ref=e50] [cursor=pointer]:
            - img "Favorite Icon" [ref=e51]
          - button "Select your country. CANADA country is selected" [ref=e56] [cursor=pointer]:
            - generic [ref=e58]: CANADA
            - img [ref=e60]
    - main [ref=e62]:
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]: Yorkville
          - generic [ref=e67]:
            - link [ref=e68] [cursor=pointer]:
              - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
              - img [ref=e69]
              - generic [ref=e71]:
                - text: 19515 Sheriff King Street SW, Calgary AB T2X 0T9
                - img [ref=e72]
            - link [ref=e75] [cursor=pointer]:
              - /url: tel:4034711538
              - img [ref=e76]
              - generic [ref=e78]: 403-471-1538
            - link [ref=e79] [cursor=pointer]:
              - /url: mailto:sls_yorkville@mattamycorp.com
              - img [ref=e80]
              - generic [ref=e83]: sls_yorkville@mattamycorp.com
        - link [ref=e85] [cursor=pointer]:
          - generic [ref=e86]: STAY UPDATED
      - generic [ref=e89]:
        - paragraph [ref=e90]: Now Selling
        - generic [ref=e91]:
          - heading "Yorkville" [level=1] [ref=e92]
          - button "Add to favorites" [ref=e94] [cursor=pointer]:
            - img [ref=e95]
        - generic [ref=e97]: Discover Yorkville, where timeless architecture, sustainable design, and a vibrant Central Park bring every season to life.
        - button "Stay updated about this community" [ref=e98] [cursor=pointer]:
          - generic [ref=e99]: STAY UPDATED
      - region "Sales center contact and quick links" [ref=e102]:
        - generic [ref=e103]:
          - generic [ref=e104]: Mattamy Store
          - generic [ref=e105]:
            - generic [ref=e106]: 19515 Sheriff King Street SW, Calgary, AB T2X 0T9
            - generic [ref=e107]: 403-471-1538
          - generic [ref=e108]:
            - link "Call 403-471-1538" [ref=e109] [cursor=pointer]:
              - /url: tel:4034711538
              - img "Call Icon" [ref=e110]
            - link "Email sls_yorkville@mattamycorp.com" [ref=e112] [cursor=pointer]:
              - /url: mailto:sls_yorkville@mattamycorp.com
              - img "Mail Icon" [ref=e113]
            - button "Hours" [ref=e116] [cursor=pointer]
            - link "Get directions to sales center, opens in new tab" [ref=e117] [cursor=pointer]:
              - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
              - img "Map Location Icon" [ref=e118]
              - generic [ref=e120]: Directions
        - generic [ref=e121]:
          - generic [ref=e122]:
            - heading "Discover our homes" [level=2] [ref=e123]
            - paragraph [ref=e124]: Explore floorplans and quick move-in homes ready for you.
          - generic [ref=e125]:
            - link "View 26 Floorplans" [ref=e126] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
            - link "View 4 Quick Move-Ins" [ref=e127] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
      - generic [ref=e129]:
        - generic [ref=e131]:
          - img "Yorkville logo Circular icon containing a minimalist drawing of mountains and the sun above the text reading \"Yorkville\"" [ref=e133]
          - generic [ref=e134]:
            - heading "Welcome to Yorkville in Calgary." [level=2] [ref=e135]
            - generic [ref=e136]:
              - generic [ref=e137]:
                - paragraph [ref=e139]: Yorkville is a community designed around memorable moments, meaningful connections and year-round enjoyment. At its heart is Calgary's only all-season central park, creating a vibrant backdrop for play, recreation and everyday gathering. Surrounded by pathways, natural spaces and convenient amenities, Yorkville offers a lifestyle that...
                - button "Show more" [ref=e140] [cursor=pointer]: More+
              - paragraph
              - paragraph
        - generic [ref=e142]:
          - paragraph [ref=e143]: Home Details
          - generic [ref=e144]:
            - img [ref=e145]
            - generic [ref=e147]:
              - generic [ref=e148]: Home Types
              - generic [ref=e149]: Attached | Townhome | Detached
          - generic [ref=e150]:
            - generic [ref=e151]:
              - img [ref=e152]
              - generic [ref=e154]:
                - generic [ref=e155]: Bedrooms
                - generic [ref=e156]: 3 - 5
            - generic [ref=e157]:
              - img [ref=e158]
              - generic [ref=e160]:
                - generic [ref=e161]: Full Bathrooms
                - generic [ref=e162]: 2 - 3
            - generic [ref=e163]:
              - img [ref=e164]
              - generic [ref=e177]:
                - generic [ref=e178]: Half Bathrooms
                - generic [ref=e179]: "1"
            - generic [ref=e180]:
              - img [ref=e181]
              - generic [ref=e183]:
                - generic [ref=e184]: Sq. Ft.
                - generic [ref=e185]: 1342 - 2875
            - generic [ref=e186]:
              - img [ref=e187]
              - generic [ref=e197]:
                - generic [ref=e198]: Stories
                - generic [ref=e199]: "2"
            - generic [ref=e200]:
              - img [ref=e201]
              - generic [ref=e208]:
                - generic [ref=e209]: Garages
                - generic [ref=e210]: "2"
      - generic [ref=e216]:
        - generic [ref=e217]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e218]
          - generic [ref=e220]: Required fields are marked with *
          - separator [ref=e221]
        - group [ref=e222]:
          - generic [ref=e223]:
            - textbox "username" [ref=e224]:
              - /placeholder: ""
            - textbox "company" [ref=e225]:
              - /placeholder: ""
            - generic [ref=e226]:
              - generic [ref=e227]: First name *
              - textbox "First name" [ref=e229]:
                - /placeholder: ""
            - generic [ref=e230]:
              - generic [ref=e231]: Last name *
              - textbox "Last name" [ref=e233]:
                - /placeholder: ""
            - generic [ref=e234]:
              - generic [ref=e235]: Email *
              - textbox "Email" [ref=e237]:
                - /placeholder: ""
            - generic [ref=e238]:
              - generic [ref=e239]: Country of Residence *
              - generic [ref=e240]:
                - combobox "Country of Residence" [ref=e241] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e242]:
              - generic [ref=e243]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e245]:
                - /placeholder: ""
            - generic [ref=e246]:
              - generic [ref=e247]: Phone number
              - textbox "Phone number" [ref=e249]:
                - /placeholder: ""
            - generic [ref=e250]:
              - generic [ref=e251]: When do you want to move into your home? *
              - generic [ref=e252]:
                - combobox "When do you want to move into your home?" [ref=e253] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e254]:
              - generic [ref=e255]: Are you a first time homebuyer? *
              - generic [ref=e256]:
                - combobox "Are you a first time homebuyer?" [ref=e257] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e258]:
              - generic [ref=e259]: How many bedrooms do you need? *
              - generic [ref=e260]:
                - combobox "How many bedrooms do you need?" [ref=e261] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e262]:
              - generic [ref=e263]: What is your budget? *
              - generic [ref=e264]:
                - combobox "What is your budget?" [ref=e265] [cursor=pointer]:
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
            - generic [ref=e267] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e268]
              - generic [ref=e269]: I am a Real Estate Agent
            - generic [ref=e271] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e272]'
              - generic [ref=e273]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e274]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e275]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e276]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e277]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e278]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e280] [cursor=pointer]
      - generic [ref=e282]:
        - radiogroup "Home type" [ref=e284]:
          - radio "Show Quick Move-In Homes, 4 available" [checked] [ref=e285] [cursor=pointer]:
            - generic:
              - generic: "4"
            - generic: Quick Move-In Homes
          - radio "Show Floorplans, 26 available" [ref=e286] [cursor=pointer]:
            - generic:
              - generic: "26"
            - generic: Floorplans
        - generic [ref=e287]:
          - generic [ref=e289]:
            - heading "Quick Move-In Homes ready when you are" [level=2] [ref=e290]
            - generic [ref=e291]: If time is of the essence, then our Quick Move-In Homes are for you.
            - link "View all" [ref=e293] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
              - generic [ref=e294]: View all
          - generic [ref=e295]:
            - paragraph [ref=e296]: Showing 4 of 4 quick move-in homes
            - generic [ref=e297]:
              - generic [ref=e300] [cursor=pointer]:
                - generic [ref=e302]:
                  - paragraph [ref=e305]: Ready Now
                  - paragraph [ref=e307]: $452,990
                  - img "Brooke townhome model with prairie elevation. 4 large windows sits above porch with a large window to the left side of door." [ref=e308]
                  - button "Mark as favorite" [ref=e309]:
                    - img "Favorite Icon" [ref=e310]
                - link "Yorkville Brooke Floorplan | Attached 30 Yorkville Drive SW 1,342 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage" [ref=e312]:
                  - /url: /alberta/calgary/calgary/yorkville/brooke/30-yorkville-drive-sw
                  - generic [ref=e313]: Brooke Floorplan | Attached
                  - generic [ref=e314]: 30 Yorkville Drive SW
                  - generic [ref=e315]:
                    - paragraph [ref=e318]: 1,342 Sq. Ft.
                    - generic [ref=e319]:
                      - paragraph [ref=e320]: 3 Beds
                      - generic [ref=e321]: "|"
                      - paragraph [ref=e322]: 2 Baths
                    - generic [ref=e323]:
                      - paragraph [ref=e324]: 1 Half Bath
                      - generic [ref=e325]: "|"
                      - paragraph [ref=e327]: 2 Car Garage
              - generic [ref=e330] [cursor=pointer]:
                - generic [ref=e332]:
                  - paragraph [ref=e335]: Ready Now
                  - paragraph [ref=e337]: $485,990
                  - img "Rendering of the Prairie elevation for the Finch Model" [ref=e338]
                  - button "Mark as favorite" [ref=e339]:
                    - img "Favorite Icon" [ref=e340]
                - link "Yorkville Finch Floorplan | Attached 33 Yorkstone Gardens SW 1,366 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 0 Car Garage" [ref=e342]:
                  - /url: /alberta/calgary/calgary/yorkville/finch/33-yorkstone-gardens-sw
                  - generic [ref=e343]: Finch Floorplan | Attached
                  - generic [ref=e344]: 33 Yorkstone Gardens SW
                  - generic [ref=e345]:
                    - paragraph [ref=e348]: 1,366 Sq. Ft.
                    - generic [ref=e349]:
                      - paragraph [ref=e350]: 3 Beds
                      - generic [ref=e351]: "|"
                      - paragraph [ref=e352]: 2 Baths
                    - paragraph [ref=e354]: 1 Half Bath
              - generic [ref=e357] [cursor=pointer]:
                - generic [ref=e359]:
                  - paragraph [ref=e362]: Ready November 2026
                  - paragraph [ref=e364]: $515,990
                  - img "Rendering of the Craftsman elevation for the Starling Model" [ref=e365]
                  - button "Mark as favorite" [ref=e366]:
                    - img "Favorite Icon" [ref=e367]
                - link "Yorkville Starling Floorplan | Attached 37 Yorkstone Gardens SW 1,635 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 0 Car Garage" [ref=e369]:
                  - /url: /alberta/calgary/calgary/yorkville/starling/37-yorkstone-gardens-sw
                  - generic [ref=e370]: Starling Floorplan | Attached
                  - generic [ref=e371]: 37 Yorkstone Gardens SW
                  - generic [ref=e372]:
                    - paragraph [ref=e375]: 1,635 Sq. Ft.
                    - generic [ref=e376]:
                      - paragraph [ref=e377]: 3 Beds
                      - generic [ref=e378]: "|"
                      - paragraph [ref=e379]: 2 Baths
                    - paragraph [ref=e381]: 1 Half Bath
              - generic [ref=e384] [cursor=pointer]:
                - generic [ref=e386]:
                  - paragraph [ref=e389]: Ready Now
                  - paragraph [ref=e391]: $823,990
                  - img "Smythe Craftsman Elevation Rendering" [ref=e392]
                  - button "Mark as favorite" [ref=e393]:
                    - img "Favorite Icon" [ref=e394]
                - link "Yorkville Smythe Floorplan | Detached 49 Yorklyn Heath SW 2,673 Sq. Ft. 4 Beds 2 Baths 1 Half Bath 2 Car Garage" [ref=e396]:
                  - /url: /alberta/calgary/calgary/yorkville/smythe/49-yorklyn-heath-sw
                  - generic [ref=e397]: Smythe Floorplan | Detached
                  - generic [ref=e398]: 49 Yorklyn Heath SW
                  - generic [ref=e399]:
                    - paragraph [ref=e402]: 2,673 Sq. Ft.
                    - generic [ref=e403]:
                      - paragraph [ref=e404]: 4 Beds
                      - generic [ref=e405]: "|"
                      - paragraph [ref=e406]: 2 Baths
                    - generic [ref=e407]:
                      - paragraph [ref=e408]: 1 Half Bath
                      - generic [ref=e409]: "|"
                      - paragraph [ref=e411]: 2 Car Garage
      - generic [ref=e414]:
        - article [ref=e415]:
          - heading "Golf" [level=3] [ref=e417]
          - paragraph [ref=e418]: Enjoy weekend downtime at Sirocco Golf Club.
        - article [ref=e419]:
          - heading "Transit" [level=3] [ref=e421]
          - paragraph [ref=e422]: Commutes are a breeze with multiple transit stops just outside the community.
        - article [ref=e423]:
          - heading "Nature" [level=3] [ref=e425]
          - paragraph [ref=e426]: Enjoy the outdoors at Fish Creek Provincial Park or along the Rotary/Mattamy Greenway.
        - article [ref=e427]:
          - heading "Parks" [level=3] [ref=e429]
          - paragraph [ref=e430]: Direct access to Central Park, Calgary’s only all-season, all-abilities park.
        - article [ref=e431]:
          - heading "Shopping" [level=3] [ref=e433]
          - paragraph [ref=e434]: Close to several shopping complexes with groceries and more across the street.
        - article [ref=e435]:
          - heading "Recreation" [level=3] [ref=e437]
          - paragraph [ref=e438]: Find family fun at recreation centres, Granary Road and Spruce Meadows.
      - generic [ref=e439]:
        - generic [ref=e443]:
          - 'img "Your Basement Has Ambitions: Free Finished Basement & Suite-Ready Upgrades*" [ref=e448]'
          - generic [ref=e451]:
            - heading "More Space. More Possibility." [level=2] [ref=e452]
            - generic [ref=e454]:
              - paragraph [ref=e455]: For a limited time, get a free finished basement with suite-ready upgrades* or upgrade to a fully developed legal basement suite starting at only $20,000.* Enjoy more space today or unlock rental income potential that could help offset your monthly mortgage payments.
              - paragraph [ref=e456]
              - paragraph [ref=e457]: "*Terms and conditions apply."
            - link "LEARN MORE" [ref=e459] [cursor=pointer]:
              - /url: https://mattamyhomes.com/alberta/calgary/promos/free-basement
              - generic [ref=e460]: LEARN MORE
        - generic [ref=e464]:
          - img "Better Living headline, person sitting on chair in living room looking towards window with sunlight coming in" [ref=e469]
          - generic [ref=e472]:
            - heading "Solar Power Made Simple!" [level=2] [ref=e473]
            - paragraph [ref=e476]: Turn sunlight into savings with solar panels, now included on all newly built Calgary homes! Learn more about how generating your own solar power can help lower your energy bills and contribute to a healthier planet.
            - link "LEARN MORE" [ref=e478] [cursor=pointer]:
              - /url: https://mattamyhomes.com/alberta/calgary/promos/solar-initiative
              - generic [ref=e479]: LEARN MORE
        - generic [ref=e483]:
          - img "Aerial view of houses with solar panels on roof, trees in background" [ref=e488]
          - generic [ref=e491]:
            - heading "Where Value Grows" [level=2] [ref=e492]
            - paragraph [ref=e495]:
              - text: Find the home that perfectly suits your life in Yorkville. With the option of Hardie Board exteriors, your home is built to withstand all the elements. For those who need more room to grow, our
              - strong [ref=e496]: WideLot
              - text: ™ options offer larger, brighter rooms, better flow between spaces and inviting front porches to help you connect with neighbours. Plus, as part of our mission to make sustainable living easier and more accessible for all, solar panels are now included on all new homes in Calgary – this is where sunshine creates savings.
        - generic [ref=e500]:
          - img "Aerial image of Central Park with playground, pathways, grass and trees" [ref=e505]
          - generic [ref=e508]:
            - heading "Where Nature Is Nearby" [level=2] [ref=e509]
            - generic [ref=e510]: Nature is just steps away in Yorkville’s Central Park. This 4-acre green space is Calgary’s only all-season, all-abilities park. It offers something for everyone with a skate park, a playground, ping-pong tables, a puddle rink and more. When you want to venture further, Fish Creek Provincial Park is a short drive away and the Rotary/Mattamy Greenway connects you to the city on foot or bike. This is where nature is part of every day.
        - generic [ref=e514]:
          - img "Father and two children at grocery store with shopping cart" [ref=e519]
          - generic [ref=e522]:
            - heading "Where Errands Are Easy" [level=2] [ref=e523]
            - generic [ref=e524]: Just across the street from Yorkville, you’ll find groceries, a pharmacy, restaurants, fitness/yoga centres and local medical clinics. Multiple transit routes are within walking distance and a short drive will lead you to shopping centres, schools, libraries, recreation complexes and more. This is where everything you need is at your fingertips.
      - generic [ref=e526]:
        - heading "Thoughtfully designed with you in mind" [level=2] [ref=e527]
        - generic [ref=e528]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e530]:
          - generic [ref=e531]:
            - radiogroup "Content type" [ref=e533] [cursor=pointer]:
              - radio "Videos" [ref=e534]:
                - img [ref=e536]
                - generic [ref=e539]: Videos
              - radio "360 Tours" [ref=e540]:
                - img [ref=e542]
                - generic [ref=e545]: 360 Tours
              - radio "Photos" [ref=e546]:
                - img [ref=e548]
                - generic [ref=e551]: Photos
            - radiogroup "Content type" [ref=e552]:
              - radio "Community Gallery" [checked] [ref=e553] [cursor=pointer]:
                - paragraph [ref=e554]: Community Gallery
              - generic [ref=e555]: "|"
              - radio "Fullerton" [ref=e556] [cursor=pointer]:
                - paragraph [ref=e557]: Fullerton
              - generic [ref=e558]: "|"
              - radio "Monarch" [ref=e559] [cursor=pointer]:
                - paragraph [ref=e560]: Monarch
              - generic [ref=e561]: "|"
              - radio "Smythe" [ref=e562] [cursor=pointer]:
                - paragraph [ref=e563]: Smythe
              - paragraph [ref=e564]: Slide has changed view to 0
          - generic [ref=e565]:
            - generic [ref=e567]:
              - button "Previous slide of Gallery" [ref=e569] [cursor=pointer]:
                - img [ref=e570]
              - generic [ref=e573]:
                - button [ref=e578] [cursor=pointer]
                - iframe [ref=e583]:
                  - generic [ref=f115e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f115e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f115e3]
                - iframe [ref=e588]:
                  - generic [ref=f116e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f116e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f116e3]
                - iframe [ref=e593]:
                  - generic [ref=f117e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f117e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f117e3]
                - button [ref=e598] [cursor=pointer]
                - button [ref=e603] [cursor=pointer]
                - button [ref=e608] [cursor=pointer]
                - button [ref=e613] [cursor=pointer]
                - button [ref=e618] [cursor=pointer]
                - button [ref=e623] [cursor=pointer]
                - button [ref=e628] [cursor=pointer]
                - button [ref=e633] [cursor=pointer]
                - button [ref=e638] [cursor=pointer]
                - button [ref=e643] [cursor=pointer]
                - button [ref=e648] [cursor=pointer]
                - button [ref=e653] [cursor=pointer]
                - button [ref=e658] [cursor=pointer]
                - button [ref=e663] [cursor=pointer]
                - iframe [ref=e668]:
                  - generic [active] [ref=f118e1]:
                    - main [ref=f118e2]:
                      - generic [ref=f118e3]:
                        - generic [ref=f118e4]:
                          - img "Icon for my.matterport.com" [ref=f118e5]
                          - heading "my.matterport.com" [level=1] [ref=f118e6]
                        - heading "Performing security verification" [level=2] [ref=f118e7]
                        - paragraph [ref=f118e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f118e13]:
                      - generic [ref=f118e15]:
                        - generic [ref=f118e17]:
                          - text: "Ray ID:"
                          - code [ref=f118e18]: a4e7987a8b2bfbed
                        - generic [ref=f118e19]:
                          - generic [ref=f118e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f118e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f118e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e673]:
                  - generic [ref=f119e3] [cursor=pointer]:
                    - img [ref=f119e4]
                    - generic [ref=f119e5]:
                      - generic [ref=f119e6]: CLICK TO EXPLORE
                      - generic [ref=f119e7]:
                        - img [ref=f119e8]
                        - img [ref=f119e9]
                - iframe [ref=e678]:
                  - generic [active] [ref=f120e1]:
                    - main [ref=f120e2]:
                      - generic [ref=f120e3]:
                        - generic [ref=f120e4]:
                          - img "Icon for my.matterport.com" [ref=f120e5]
                          - heading "my.matterport.com" [level=1] [ref=f120e6]
                        - heading "Performing security verification" [level=2] [ref=f120e7]
                        - paragraph [ref=f120e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f120e13]:
                      - generic [ref=f120e15]:
                        - generic [ref=f120e17]:
                          - text: "Ray ID:"
                          - code [ref=f120e18]: a4e7987a8b37fbed
                        - generic [ref=f120e19]:
                          - generic [ref=f120e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f120e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f120e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e683]:
                  - generic [active] [ref=f121e1]:
                    - main [ref=f121e2]:
                      - generic [ref=f121e3]:
                        - generic [ref=f121e4]:
                          - img "Icon for my.matterport.com" [ref=f121e5]
                          - heading "my.matterport.com" [level=1] [ref=f121e6]
                        - heading "Performing security verification" [level=2] [ref=f121e7]
                        - paragraph [ref=f121e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f121e13]:
                      - generic [ref=f121e15]:
                        - generic [ref=f121e17]:
                          - text: "Ray ID:"
                          - code [ref=f121e18]: a4e7987a8b3bfbed
                        - generic [ref=f121e19]:
                          - generic [ref=f121e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f121e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f121e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e688]:
                  - generic [ref=f122e3] [cursor=pointer]:
                    - img [ref=f122e4]
                    - generic [ref=f122e5]:
                      - generic [ref=f122e6]: CLICK TO EXPLORE
                      - generic [ref=f122e7]:
                        - img [ref=f122e8]
                        - img [ref=f122e9]
                - iframe [ref=e693]:
                  - generic [active] [ref=f123e1]:
                    - main [ref=f123e2]:
                      - generic [ref=f123e3]:
                        - generic [ref=f123e4]:
                          - img "Icon for my.matterport.com" [ref=f123e5]
                          - heading "my.matterport.com" [level=1] [ref=f123e6]
                        - heading "Performing security verification" [level=2] [ref=f123e7]
                        - paragraph [ref=f123e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f123e13]:
                      - generic [ref=f123e15]:
                        - generic [ref=f123e17]:
                          - text: "Ray ID:"
                          - code [ref=f123e18]: a4e7987a9b4cfbed
                        - generic [ref=f123e19]:
                          - generic [ref=f123e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f123e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f123e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e698]:
                  - generic [active] [ref=f124e1]:
                    - main [ref=f124e2]:
                      - generic [ref=f124e3]:
                        - generic [ref=f124e4]:
                          - img "Icon for my.matterport.com" [ref=f124e5]
                          - heading "my.matterport.com" [level=1] [ref=f124e6]
                        - heading "Performing security verification" [level=2] [ref=f124e7]
                        - paragraph [ref=f124e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f124e13]:
                      - generic [ref=f124e15]:
                        - generic [ref=f124e17]:
                          - text: "Ray ID:"
                          - code [ref=f124e18]: a4e7987a9b54fbed
                        - generic [ref=f124e19]:
                          - generic [ref=f124e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f124e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f124e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e703]:
                  - generic [active] [ref=f125e1]:
                    - main [ref=f125e2]:
                      - generic [ref=f125e3]:
                        - generic [ref=f125e4]:
                          - img "Icon for my.matterport.com" [ref=f125e5]
                          - heading "my.matterport.com" [level=1] [ref=f125e6]
                        - heading "Performing security verification" [level=2] [ref=f125e7]
                        - paragraph [ref=f125e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f125e13]:
                      - generic [ref=f125e15]:
                        - generic [ref=f125e17]:
                          - text: "Ray ID:"
                          - code [ref=f125e18]: a4e7987aab5dfbed
                        - generic [ref=f125e19]:
                          - generic [ref=f125e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f125e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f125e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e708]:
                  - generic [ref=f126e3] [cursor=pointer]:
                    - img [ref=f126e4]
                    - generic [ref=f126e5]:
                      - generic [ref=f126e6]: CLICK TO EXPLORE
                      - generic [ref=f126e7]:
                        - img [ref=f126e8]
                        - img [ref=f126e9]
                - iframe [ref=e713]:
                  - generic [active] [ref=f127e1]:
                    - main [ref=f127e2]:
                      - generic [ref=f127e3]:
                        - generic [ref=f127e4]:
                          - img "Icon for my.matterport.com" [ref=f127e5]
                          - heading "my.matterport.com" [level=1] [ref=f127e6]
                        - heading "Performing security verification" [level=2] [ref=f127e7]
                        - paragraph [ref=f127e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                    - contentinfo [ref=f127e13]:
                      - generic [ref=f127e15]:
                        - generic [ref=f127e17]:
                          - text: "Ray ID:"
                          - code [ref=f127e18]: a4e7987abb8cfbed
                        - generic [ref=f127e19]:
                          - generic [ref=f127e20]:
                            - text: Performance and Security by
                            - link "Cloudflare, opens in a new tab" [ref=f127e21] [cursor=pointer]:
                              - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                              - text: Cloudflare
                          - link "Privacy, opens in a new tab" [ref=f127e23] [cursor=pointer]:
                            - /url: https://www.cloudflare.com/privacypolicy/
                            - text: Privacy
                - iframe [ref=e718]:
                  - generic [ref=f128e3] [cursor=pointer]:
                    - img [ref=f128e4]
                    - generic [ref=f128e5]:
                      - generic [ref=f128e6]: CLICK TO EXPLORE
                      - generic [ref=f128e7]:
                        - img [ref=f128e8]
                        - img [ref=f128e9]
                - iframe [ref=e723]:
                  - generic [ref=f129e3] [cursor=pointer]:
                    - img [ref=f129e4]
                    - generic [ref=f129e5]:
                      - generic [ref=f129e6]: CLICK TO EXPLORE
                      - generic [ref=f129e7]:
                        - img [ref=f129e8]
                        - img [ref=f129e9]
                - iframe [ref=e728]:
                  - generic [ref=f130e14]:
                    - generic [ref=f130e32]: Finch
                    - generic [ref=f130e41]: LIVING ROOM
                    - generic [ref=f130e46]:
                      - generic [ref=f130e51]:
                        - img
                      - generic [ref=f130e56]:
                        - img
                      - generic [ref=f130e61]:
                        - img
                    - generic [ref=f130e80]:
                      - generic [ref=f130e83]: DISCLAIMER
                      - paragraph [ref=f130e84]
                      - generic [ref=f130e86]: All illustrations are artist’s concept. Specifications, terms, and conditions are subject to change without notice.
                - iframe [ref=e733]:
                  - generic [ref=f131e3] [cursor=pointer]:
                    - img [ref=f131e4]
                    - generic [ref=f131e5]:
                      - generic [ref=f131e6]: CLICK TO EXPLORE
                      - generic [ref=f131e7]:
                        - img [ref=f131e8]
                        - img [ref=f131e9]
                - iframe [ref=e738]:
                  - generic [ref=f132e3] [cursor=pointer]:
                    - img [ref=f132e4]
                    - generic [ref=f132e5]:
                      - generic [ref=f132e6]: CLICK TO EXPLORE
                      - generic [ref=f132e7]:
                        - img [ref=f132e8]
                        - img [ref=f132e9]
                - iframe [ref=e743]:
                  - generic [ref=f133e3] [cursor=pointer]:
                    - img [ref=f133e4]
                    - generic [ref=f133e5]:
                      - generic [ref=f133e6]: CLICK TO EXPLORE
                      - generic [ref=f133e7]:
                        - img [ref=f133e8]
                        - img [ref=f133e9]
                - iframe [ref=e748]:
                  - generic [ref=f134e3] [cursor=pointer]:
                    - img [ref=f134e4]
                    - generic [ref=f134e5]:
                      - generic [ref=f134e6]: CLICK TO EXPLORE
                      - generic [ref=f134e7]:
                        - img [ref=f134e8]
                        - img [ref=f134e9]
                - iframe [ref=e753]:
                  - generic [ref=f135e3] [cursor=pointer]:
                    - img [ref=f135e4]
                    - generic [ref=f135e5]:
                      - generic [ref=f135e6]: CLICK TO EXPLORE
                      - generic [ref=f135e7]:
                        - img [ref=f135e8]
                        - img [ref=f135e9]
                - button [ref=e758] [cursor=pointer]
                - button [ref=e763] [cursor=pointer]
                - button [ref=e768] [cursor=pointer]
                - button [ref=e773] [cursor=pointer]
                - button [ref=e778] [cursor=pointer]
                - button [ref=e783] [cursor=pointer]
                - button [ref=e788] [cursor=pointer]
                - button [ref=e793] [cursor=pointer]
                - button [ref=e798] [cursor=pointer]
                - button [ref=e803] [cursor=pointer]
                - button [ref=e808] [cursor=pointer]
                - button [ref=e813] [cursor=pointer]
                - button [ref=e818] [cursor=pointer]
                - iframe [ref=e823]:
                  - generic [ref=f136e1]:
                    - heading "We couldn't verify the security of your connection." [level=1] [ref=f136e2]
                    - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f136e3]
              - button "Next slide of Gallery" [ref=e825] [cursor=pointer]:
                - img [ref=e826]
            - generic [ref=e828]: Yorkville Central Park Promotion Video
            - paragraph [ref=e830]:
              - generic [ref=e831]: Slide number
              - text: 1/48
        - generic [ref=e832]:
          - generic [ref=e833]:
            - text: "Transcript:"
            - 'link "Download Yorkville Central Park: Grand Opening Event (.txt file) transcript" [ref=e834] [cursor=pointer]':
              - /url: blob:https://mattamyhomes.com/a6318dbe-f3b6-4687-ab3c-cd5469a21033
              - text: "Yorkville Central Park: Grand Opening Event (.txt file)"
          - generic [ref=e835]:
            - text: "Transcript:"
            - link "Download Yorkville in Calgary Alberta (.txt file) transcript" [ref=e836] [cursor=pointer]:
              - /url: blob:https://mattamyhomes.com/d728538a-fd6a-4869-a1fc-4fe1f3d229ab
              - text: Yorkville in Calgary Alberta (.txt file)
          - generic [ref=e837]:
            - text: "Transcript:"
            - link "Download The Mattamy/Rotary Greenway (.txt file) transcript" [ref=e838] [cursor=pointer]:
              - /url: blob:https://mattamyhomes.com/4d30e953-6b1a-4b1d-ae1b-6728a5ee8e9e
              - text: The Mattamy/Rotary Greenway (.txt file)
      - generic [ref=e841]:
        - heading "Conveniently located to fit your needs" [level=2] [ref=e842]
        - button "Nearby Services" [ref=e847] [cursor=pointer]:
          - generic [ref=e849]: What's Nearby
          - button "Nearby Services dropdown list" [ref=e850]:
            - img [ref=e851]
      - generic [ref=e862]:
        - heading "Explore the community" [level=2] [ref=e863]
        - generic [ref=e864]: Take a closer look at the community sitemap and get familiar with our available offerings.
        - generic [ref=e865]:
          - button "Resize Iframe" [ref=e866] [cursor=pointer]:
            - img "Resize Icon" [ref=e867]
          - iframe [ref=e872]:
            - generic [ref=f243e3]:
              - generic [ref=f243e5]:
                - generic [ref=f243e11]:
                  - button "Hide UI" [ref=f243e12] [cursor=pointer]:
                    - img [ref=f243e14]
                  - button "Reset" [ref=f243e15] [cursor=pointer]:
                    - img [ref=f243e17]
                  - button "Print" [ref=f243e18] [cursor=pointer]:
                    - img [ref=f243e20]
                  - generic [ref=f243e21]:
                    - button "Increase Zoom" [ref=f243e22] [cursor=pointer]:
                      - img [ref=f243e24]
                    - button "Decrease Zoom" [ref=f243e25] [cursor=pointer]:
                      - img [ref=f243e27]
                  - generic "position controls" [ref=f243e29]:
                    - button "move map up" [ref=f243e30] [cursor=pointer]
                    - generic [ref=f243e32]:
                      - button "move map left" [ref=f243e33] [cursor=pointer]
                      - button "move map right" [ref=f243e36] [cursor=pointer]
                    - button "move map down" [ref=f243e38] [cursor=pointer]
                - generic [ref=f243e40]:
                  - generic [ref=f243e41]:
                    - generic [ref=f243e42]:
                      - img [ref=f243e44]
                      - generic [ref=f243e45]:
                        - text: Yorkville
                        - text: SITE MAP
                    - generic [ref=f243e46]:
                      - generic [ref=f243e47]: "Neighborhood:"
                      - combobox "Select Neighborhood" [disabled] [ref=f243e48]:
                        - generic [ref=f243e49]:
                          - generic [ref=f243e51]: Yorkville
                          - img [ref=f243e54]
                  - generic [ref=f243e55]:
                    - generic [ref=f243e57]:
                      - button "Homesite Search" [ref=f243e58] [cursor=pointer]
                      - button "Homesite Details"
                    - generic [ref=f243e60]:
                      - generic [ref=f243e63]:
                        - generic [ref=f243e64]:
                          - generic [ref=f243e65]:
                            - heading "Homesite Status" [level=2] [ref=f243e66]
                            - generic [ref=f243e67]: All
                          - button "Collapse Homesite Status" [ref=f243e68] [cursor=pointer]:
                            - img [ref=f243e70]
                        - generic [ref=f243e73]:
                          - generic [ref=f243e75]:
                            - img [ref=f243e77]
                            - generic [ref=f243e78]: Show All
                            - checkbox "Show All" [checked] [ref=f243e81] [cursor=pointer]
                          - generic [ref=f243e82]:
                            - generic [ref=f243e84]:
                              - generic [ref=f243e85]:
                                - generic [ref=f243e86]:
                                  - heading "Available" [level=2] [ref=f243e87]
                                  - generic [ref=f243e88]:
                                    - generic [ref=f243e89]: "65"
                                    - checkbox "Available" [checked] [ref=f243e92] [cursor=pointer]
                                - button "Collapse Available" [ref=f243e93] [cursor=pointer]:
                                  - img [ref=f243e95]
                              - generic [ref=f243e98]:
                                - generic [ref=f243e99]:
                                  - generic [ref=f243e101]: Pre-Sale
                                  - generic [ref=f243e102]: "13"
                                  - checkbox "Pre-Sale" [checked] [ref=f243e105] [cursor=pointer]
                                - generic [ref=f243e106]:
                                  - generic [ref=f243e108]: Quick Move-In
                                  - generic [ref=f243e109]: "9"
                                  - checkbox "Quick Move-In" [checked] [ref=f243e112] [cursor=pointer]
                                - generic [ref=f243e113]:
                                  - generic [ref=f243e115]: Spec Home
                                  - generic [ref=f243e116]: "43"
                                  - checkbox "Spec Home" [checked] [ref=f243e119] [cursor=pointer]
                            - generic [ref=f243e120]:
                              - generic [ref=f243e122]: Sold
                              - generic [ref=f243e123]: "185"
                              - checkbox "Sold" [checked] [ref=f243e126] [cursor=pointer]
                            - generic [ref=f243e127]:
                              - generic [ref=f243e129]: Conditionally Sold
                              - generic [ref=f243e130]: "12"
                              - checkbox "Conditionally Sold" [checked] [ref=f243e133] [cursor=pointer]
                            - generic [ref=f243e134]:
                              - generic [ref=f243e136]: Show Homes
                              - generic [ref=f243e137]: "3"
                              - checkbox "Show Homes" [checked] [ref=f243e140] [cursor=pointer]
                            - generic [ref=f243e141]:
                              - generic [ref=f243e143]: Future
                              - generic [ref=f243e144]: "200"
                              - checkbox "Future" [checked] [ref=f243e147] [cursor=pointer]
                      - generic [ref=f243e150]:
                        - generic [ref=f243e151]:
                          - generic [ref=f243e152]:
                            - checkbox [ref=f243e155] [cursor=pointer]
                            - heading "Tag Filter" [level=2] [ref=f243e156]
                          - button "Collapse Tag Filter" [ref=f243e157] [cursor=pointer]:
                            - img [ref=f243e159]
                        - combobox "Select a tag" [ref=f243e163]:
                          - generic [ref=f243e164] [cursor=pointer]:
                            - generic [ref=f243e165]: Select a tag
                            - img [ref=f243e168]
                      - generic [ref=f243e171]:
                        - generic [ref=f243e172]:
                          - generic [ref=f243e173]:
                            - checkbox "Enable Floorplan Filters" [ref=f243e176] [cursor=pointer]
                            - heading "Floorplan Filters" [level=2] [ref=f243e177]
                            - generic [ref=f243e178]: All
                          - button "Collapse Floorplan Filters" [ref=f243e179] [cursor=pointer]:
                            - img [ref=f243e181]
                        - generic [ref=f243e182]:
                          - generic [ref=f243e183]:
                            - img [ref=f243e185]
                            - generic [ref=f243e186]: "--"
                          - generic [ref=f243e187]:
                            - img [ref=f243e189]
                            - generic [ref=f243e190]: "--"
                          - generic [ref=f243e191]:
                            - img [ref=f243e193]
                            - generic [ref=f243e194]: "--"
                          - generic [ref=f243e195]:
                            - img [ref=f243e197]
                            - generic [ref=f243e198]: "--"
                          - generic [ref=f243e199]:
                            - img [ref=f243e201]
                            - generic [ref=f243e202]: "--"
                          - generic [ref=f243e203]:
                            - img [ref=f243e205]
                            - generic [ref=f243e206]: "--"
                          - generic [ref=f243e207]:
                            - img [ref=f243e209]
                            - generic [ref=f243e210]: "--"
                        - generic [ref=f243e213]:
                          - generic [ref=f243e214]:
                            - generic [ref=f243e215]: "Filter by:"
                            - button "Reset All" [ref=f243e217] [cursor=pointer]:
                              - img [ref=f243e219]
                              - generic [ref=f243e220]: Reset All
                          - generic [ref=f243e221]:
                            - generic [ref=f243e222]:
                              - generic [ref=f243e223]:
                                - img [ref=f243e225]
                                - text: Floorplan
                              - combobox "Select Floorplan Filter" [ref=f243e226]:
                                - generic [ref=f243e227] [cursor=pointer]:
                                  - generic [ref=f243e229]: View All
                                  - img [ref=f243e232]
                            - generic [ref=f243e233]:
                              - generic [ref=f243e234]:
                                - img [ref=f243e236]
                                - text: Price
                              - generic [ref=f243e237]: From
                              - combobox "Select Minimum Price Filter" [ref=f243e238]:
                                - generic [ref=f243e239] [cursor=pointer]:
                                  - generic [ref=f243e241]: "--"
                                  - img [ref=f243e244]
                            - generic [ref=f243e245]:
                              - generic [ref=f243e247]: To
                              - combobox "Select Maximum Price Filter" [ref=f243e248]:
                                - generic [ref=f243e249] [cursor=pointer]:
                                  - generic [ref=f243e251]: "--"
                                  - img [ref=f243e254]
                            - generic [ref=f243e255]:
                              - generic [ref=f243e256]:
                                - img [ref=f243e258]
                                - text: Floors
                              - generic [ref=f243e259]:
                                - button "Decrease Floors":
                                  - generic:
                                    - img
                                - generic [ref=f243e260]: "--"
                                - button "Increase Floors" [ref=f243e261] [cursor=pointer]:
                                  - img [ref=f243e263]
                            - generic [ref=f243e264]:
                              - generic [ref=f243e265]:
                                - img [ref=f243e267]
                                - text: Bedrooms
                              - generic [ref=f243e268]:
                                - button "Decrease Bedrooms":
                                  - generic:
                                    - img
                                - generic [ref=f243e269]: "--"
                                - button "Increase Bedrooms" [ref=f243e270] [cursor=pointer]:
                                  - img [ref=f243e272]
                            - generic [ref=f243e273]:
                              - generic [ref=f243e274]:
                                - img [ref=f243e276]
                                - text: Bathrooms
                              - generic [ref=f243e277]:
                                - button "Decrease Bathrooms":
                                  - generic:
                                    - img
                                - generic [ref=f243e278]: "--"
                                - button "Increase Bathrooms" [ref=f243e279] [cursor=pointer]:
                                  - img [ref=f243e281]
                            - generic [ref=f243e282]:
                              - generic [ref=f243e283]:
                                - img [ref=f243e285]
                                - text: Car Garage
                              - generic [ref=f243e286]:
                                - button "Decrease Garage Size":
                                  - generic:
                                    - img
                                - generic [ref=f243e287]: "--"
                                - button "Increase Garage Size" [ref=f243e288] [cursor=pointer]:
                                  - img [ref=f243e290]
                            - generic [ref=f243e291]:
                              - generic [ref=f243e292]:
                                - img [ref=f243e294]
                                - text: Square Feet
                              - generic [ref=f243e295]: From
                              - combobox "Select Minimum Square Foot Filter" [ref=f243e296]:
                                - generic [ref=f243e297] [cursor=pointer]:
                                  - generic [ref=f243e299]: "--"
                                  - img [ref=f243e302]
                            - generic [ref=f243e303]:
                              - generic [ref=f243e305]: To
                              - combobox "Select Maximum Square Foot Filter" [ref=f243e306]:
                                - generic [ref=f243e307] [cursor=pointer]:
                                  - generic [ref=f243e309]: "--"
                                  - img [ref=f243e312]
                  - button "Close Side Menu" [ref=f243e314] [cursor=pointer]:
                    - img [ref=f243e316]
              - generic:
                - generic:
                  - generic:
                    - img
      - generic [ref=e877]:
        - img "View of Calgary by the water with high-rise buildings and a bridge" [ref=e882]
        - generic [ref=e885]:
          - heading "Mattamy Homes in Calgary" [level=2] [ref=e886]
          - generic [ref=e887]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
          - link "Learn More About Living in Calgary" [ref=e889] [cursor=pointer]:
            - /url: /alberta/calgary
            - generic [ref=e890]: Learn More About Living in Calgary
      - button "View promotions" [ref=e892] [cursor=pointer]:
        - generic [ref=e893]: View promotions
        - img [ref=e894]
      - generic [ref=e897]:
        - generic [ref=e898] [cursor=pointer]:
          - generic [ref=e899]:
            - generic [ref=e900]: New home rebates available!
            - img "Click Here New home rebates available!" [ref=e902]
          - button "Get Rebate Estimate" [ref=e903]:
            - generic [ref=e904]: Get Rebate Estimate
        - button "x" [ref=e905] [cursor=pointer]
    - contentinfo "footer" [ref=e906]:
      - generic [ref=e908]:
        - generic [ref=e909]:
          - generic [ref=e910]:
            - heading "Explore" [level=2] [ref=e911]
            - list [ref=e913]:
              - listitem [ref=e914]:
                - link "Mattamy Homes USA" [ref=e915] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/us
              - listitem [ref=e916]:
                - link "Mattamy Homes Canada" [ref=e917] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/ca
              - listitem [ref=e918]:
                - link "Design Studio" [ref=e919] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e920]:
                - link "Customer Care" [ref=e921] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e923]:
            - heading "About Mattamy" [level=2] [ref=e924]
            - list [ref=e926]:
              - listitem [ref=e927]:
                - link "About Us" [ref=e928] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e929]:
                - link "Contact Us" [ref=e930] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e931]:
                - link "Careers" [ref=e932] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e933]:
                - link "Media and Investor Relations" [ref=e934] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e936]:
            - heading "Connect With Us" [level=2] [ref=e937]
            - generic [ref=e939]:
              - link "Facebook (opens in a new tab)" [ref=e940] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomes
                - img [ref=e941]
              - link "Instagram (opens in a new tab)" [ref=e943] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomes/
                - img [ref=e944]
              - link "Youtube (opens in a new tab)" [ref=e946] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e947]
              - link "Pinterest (opens in a new tab)" [ref=e949] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e950]
              - link "Linkedin (opens in a new tab)" [ref=e952] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e953]
        - generic [ref=e956]:
          - paragraph [ref=e957]:
            - link "Accessibility" [ref=e958] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e959]: "|"
            - button "Cookie Settings" [ref=e960] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e961]: "|"
            - link "Legal Disclaimers" [ref=e962] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e963]: "|"
            - link "Privacy Policy" [ref=e964] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e965]: "|"
            - link "Terms and Conditions" [ref=e966] [cursor=pointer]:
              - /url: /terms-and-conditions
          - paragraph [ref=e967]: ©2026 Mattamy Homes
```

# Test source

```ts
  353 |       await this.ensurePageRendered();
  354 | 
  355 |       const communityHeading = this.page
  356 |         .locator('h1')
  357 |         .filter({ hasText: new RegExp(escapeRegex(expectedCommunity), 'i') })
  358 |         .first();
  359 | 
  360 |       await expect(communityHeading).toBeVisible({ timeout: 60000 });
  361 |     });
  362 |   }
  363 | 
  364 |   // CORE SECTION VALIDATION
  365 | 
  366 |   /** Checks every core section of the community page is present. */
  367 |   async verifyCoreSections(): Promise<void> {
  368 |     await this.step('Verify core community sections', async () => {
  369 |       await this.verifySection(
  370 |         this.availableHomesSection,
  371 |         'Available Homes',
  372 |         'community.availableHomesSection',
  373 |       );
  374 |       await this.verifySection(this.mapSection, 'Map', 'community.mapSection');
  375 |       await this.verifySection(this.contactSection, 'Contact', 'community.contactSection');
  376 |     });
  377 |   }
  378 |   /** Checks one core section. A missing section fails unless it is declared optional. */
  379 |   private async verifySection(locator: Locator, name: string, feature: FeatureKey): Promise<void> {
  380 |     if (
  381 |       !(await this.isFeaturePresent(locator, feature, `${name} section`, { state: 'attached' }))
  382 |     ) {
  383 |       return;
  384 |     }
  385 | 
  386 |     // Scroll safely
  387 |     const section = locator.first();
  388 |     await section.scrollIntoViewIfNeeded();
  389 | 
  390 |     // Wait for SPA render
  391 |     await this.waitForPageReady();
  392 | 
  393 |     // Assert visibility (with retry)
  394 |     await expect(section, `${name} section not visible`).toBeVisible({ timeout: 5000 });
  395 |   }
  396 | 
  397 |   // ALL NAV LINK VALIDATION
  398 | 
  399 |   /** Checks every in-page navigation link points somewhere real. */
  400 |   async verifyAllNavigationLinks(): Promise<void> {
  401 |     await this.step('Verify all navigation links have href', async () => {
  402 |       const linkCount = await this.navLinks.count();
  403 |       let validatedLinks = 0;
  404 | 
  405 |       for (let i = 0; i < linkCount; i++) {
  406 |         const link = this.navLinks.nth(i);
  407 |         const href = await link.getAttribute('href');
  408 | 
  409 |         if (!href || href.startsWith('#') || href.includes('mailto')) {
  410 |           continue;
  411 |         }
  412 | 
  413 |         expect(href).toBeTruthy();
  414 |         validatedLinks++;
  415 | 
  416 |         await this.reportValue(`Nav link ${validatedLinks}`, this.buildFullUrl(href));
  417 |       }
  418 | 
  419 |       await this.reportValue(`Validated ${validatedLinks} navigation link(s)`);
  420 |     });
  421 |   }
  422 | 
  423 |   // AVAILABLE HOMES NAVIGATION
  424 | 
  425 |   /** Checks the Available Homes link jumps to its section. */
  426 |   async verifyAvailableHomesNavigation(): Promise<void> {
  427 |     await this.step('Verify available homes navigation', async () => {
  428 |       const firstHome = this.page.locator('a[href*="/quick-move-in"]').first();
  429 | 
  430 |       if (await firstHome.count()) {
  431 |         const href = await firstHome.getAttribute('href');
  432 | 
  433 |         await Promise.all([this.page.waitForLoadState('domcontentloaded'), firstHome.click()]);
  434 | 
  435 |         await expect(this.page).toHaveURL(new RegExp(href!, 'i'));
  436 | 
  437 |         await this.page.goBack();
  438 |         await this.waitForPageReady();
  439 |       }
  440 |     });
  441 |   }
  442 | 
  443 |   // PLAN NAVIGATION
  444 | 
  445 |   /** Checks the Plans link jumps to its section. */
  446 |   async verifyPlansNavigation(): Promise<void> {
  447 |     await this.step('Verify plans navigation', async () => {
  448 |       const firstPlan = this.page.locator('a[href*="/brinkley"]').first();
  449 | 
  450 |       if (await firstPlan.count()) {
  451 |         const href = await firstPlan.getAttribute('href');
  452 | 
> 453 |         await Promise.all([this.page.waitForLoadState('domcontentloaded'), firstPlan.click()]);
      |                                                                                      ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  454 | 
  455 |         await expect(this.page).toHaveURL(new RegExp(href!, 'i'));
  456 | 
  457 |         await this.page.goBack();
  458 |         await this.waitForPageReady();
  459 |       }
  460 |     });
  461 |   }
  462 | 
  463 |   /**
  464 |    * Checks the Hours, Directions and Schedule an Appointment CTAs, where the community has them.
  465 |    */
  466 |   async verifyContactActionCtas(): Promise<void> {
  467 |     await this.step('Verify community contact action CTAs when available', async () => {
  468 |       await this.verifyHoursCta();
  469 |       await this.verifyDirectionsCta();
  470 |       await this.verifyScheduleAppointmentCta();
  471 |     });
  472 |   }
  473 | 
  474 |   /** Checks the Hours CTA shows opening hours, not just a label. */
  475 |   private async verifyHoursCta(): Promise<void> {
  476 |     const hoursCta = this.page.getByRole('button', { name: /^Hours$/i }).first();
  477 | 
  478 |     if (
  479 |       !(await this.isFeaturePresent(hoursCta, 'community.hoursCta', 'Hours CTA', { timeout: 3000 }))
  480 |     ) {
  481 |       return;
  482 |     }
  483 | 
  484 |     await this.scrollIntoCenter(hoursCta);
  485 |     await hoursCta.click();
  486 |     await this.waitForPageReady();
  487 | 
  488 |     const scheduleContext = this.page.locator('body');
  489 |     await expect(
  490 |       scheduleContext,
  491 |       'Hours CTA should expose open/closed status or a weekly schedule',
  492 |     ).toContainText(/Open|Closed|Mon|Tue|Wed|Thu|Fri|Sat|Sun|\d{1,2}:\d{2}/i, {
  493 |       timeout: 10000,
  494 |     });
  495 | 
  496 |     // Leave the page clean: the Hours panel stays open otherwise and covers the
  497 |     // Directions / Schedule an Appointment CTAs validated next, so their clicks
  498 |     // land on this dialog instead.
  499 |     await this.closeOpenDialogIfPresent('Sales center hours');
  500 |   }
  501 | 
  502 |   /**
  503 |    * Closes an open dialog so the next CTA validation starts from a clean page.
  504 |    *
  505 |    * Best-effort by design - a dialog that has already closed itself is fine.
  506 |    */
  507 |   private async closeOpenDialogIfPresent(label: string): Promise<void> {
  508 |     const dialog = this.page.locator(`[role="dialog"][aria-label="${label}"]:visible`).first();
  509 | 
  510 |     if (!(await dialog.count())) {
  511 |       return;
  512 |     }
  513 | 
  514 |     const closeButton = dialog
  515 |       .locator('button[aria-label*="close" i], button[class*="close" i]')
  516 |       .first();
  517 | 
  518 |     if (await closeButton.count()) {
  519 |       await closeButton.click().catch(() => undefined);
  520 |     } else {
  521 |       await this.page.keyboard.press('Escape').catch(() => undefined);
  522 |     }
  523 | 
  524 |     await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
  525 |   }
  526 | 
  527 |   /** Checks the Directions CTA links out to a map, without following it. */
  528 |   private async verifyDirectionsCta(): Promise<void> {
  529 |     // By accessible name, not text. It is a link wrapping an icon plus the word
  530 |     // "Directions", so /^Directions$/ failed on the markup whitespace.
  531 |     const directionsCta = this.page
  532 |       .getByRole('link', { name: /directions/i })
  533 |       .or(this.page.getByRole('button', { name: /directions/i }))
  534 |       .first();
  535 | 
  536 |     if (
  537 |       !(await this.isFeaturePresent(directionsCta, 'community.directionsCta', 'Directions CTA', {
  538 |         timeout: 3000,
  539 |       }))
  540 |     ) {
  541 |       return;
  542 |     }
  543 | 
  544 |     const href = await directionsCta.getAttribute('href');
  545 | 
  546 |     if (href) {
  547 |       expect(href, 'Directions CTA should link to a map or directions destination').toMatch(
  548 |         /maps|google|directions|bing|apple/i,
  549 |       );
  550 |       await this.reportValue('Directions CTA URL', href);
  551 |       return;
  552 |     }
  553 | 
```