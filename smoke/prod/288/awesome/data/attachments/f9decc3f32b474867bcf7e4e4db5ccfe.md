# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communityPage.spec.ts >> Community Detail - Yorkville >> Navigation Validation >> @smoke @regression | CAN | Validate plans navigation
- Location: tests/communityPage.spec.ts:76:9

# Error details

```
Error: Floorplans tab should be selected

expect(locator).toHaveAttribute(expected) failed

Locator:  locator('#availablehomes').first().getByRole('radiogroup', { name: /^Home type$/i }).getByRole('radio', { name: /Floorplans/i })
Expected: "true"
Received: "false"
Timeout:  15000ms

Call log:
  - Floorplans tab should be selected with timeout 15000ms
  - waiting for locator('#availablehomes').first().getByRole('radiogroup', { name: /^Home type$/i }).getByRole('radio', { name: /Floorplans/i })
    18 × locator resolved to <button role="radio" type="button" tabindex="-1" id="floorplans" aria-checked="false" aria-label="Show Floorplans, 26 available" class="HomeTypeSections__Tab-sc-13npl9x-1 dNyjrl flex items-center justify-center gap-2 md:gap-4 text-center md:whitespace-nowrap cursor-pointer">…</button>
       - unexpected value "false"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e6] [cursor=pointer]:
        - /url: /
        - figure [ref=e7]:
          - img "Yorkville Mattamy logo in Calgary Alberta by Mattamy Homes" [ref=e8]
      - button "Navigation menu." [ref=e9] [cursor=pointer]:
        - img [ref=e10]
  - main [ref=e12]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: Yorkville
        - link [ref=e18] [cursor=pointer]:
          - /url: https://maps.google.com/maps?q=19515 Sheriff King Street SW, Calgary AB T2X 0T9
          - img [ref=e19]
          - generic [ref=e21]:
            - text: 19515 Sheriff King Street SW, Calgary AB T2X 0T9
            - img [ref=e22]
      - link [ref=e26] [cursor=pointer]:
        - generic [ref=e27]: STAY UPDATED
    - generic [ref=e30]:
      - paragraph [ref=e31]: Now Selling
      - generic [ref=e32]:
        - heading "Yorkville" [level=1] [ref=e33]
        - button "Add to favorites" [ref=e35] [cursor=pointer]:
          - img [ref=e36]
      - generic [ref=e38]: Discover Yorkville, where timeless architecture, sustainable design, and a vibrant Central Park bring every season to life.
      - button "Stay updated about this community" [ref=e39] [cursor=pointer]:
        - generic [ref=e40]: STAY UPDATED
    - region "Sales center contact and quick links" [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]: Mattamy Store
        - generic [ref=e46]:
          - generic [ref=e47]: 19515 Sheriff King Street SW, Calgary, AB T2X 0T9
          - generic [ref=e48]: 403-471-1538
        - generic [ref=e49]:
          - link "Call 403-471-1538" [ref=e50] [cursor=pointer]:
            - /url: tel:4034711538
            - img "Call Icon" [ref=e51]
          - link "Email sls_yorkville@mattamycorp.com" [ref=e53] [cursor=pointer]:
            - /url: mailto:sls_yorkville@mattamycorp.com
            - img "Mail Icon" [ref=e54]
          - button "Hours" [ref=e57] [cursor=pointer]
          - link "Get directions to sales center, opens in new tab" [ref=e58] [cursor=pointer]:
            - /url: https://www.google.com/maps/place/Mattamy+Homes+-+Yorkville/@50.8764291,-114.073834,17z/data=!3m1!4b1!4m6!3m5!1s0x537175ed93d2f151:0x403a433574372d94!8m2!3d50.8764257!4d-114.0712591!16s%2Fg%2F11gf31szvt?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D
            - img "Map Location Icon" [ref=e59]
            - text: Directions
      - generic [ref=e61]:
        - generic [ref=e62]:
          - heading "Discover our homes" [level=2] [ref=e63]
          - paragraph [ref=e64]: Explore floorplans and quick move-in homes ready for you.
        - generic [ref=e65]:
          - link "View 26 Floorplans" [ref=e66] [cursor=pointer]:
            - /url: /search?productType=plan&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
          - link "View 3 Quick Move-Ins" [ref=e67] [cursor=pointer]:
            - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
    - generic [ref=e69]:
      - generic [ref=e71]:
        - img "Yorkville logo Circular icon containing a minimalist drawing of mountains and the sun above the text reading \"Yorkville\"" [ref=e73]
        - generic [ref=e74]:
          - heading "Welcome to Yorkville in Calgary." [level=2] [ref=e75]
          - generic [ref=e76]:
            - generic [ref=e77]:
              - text: Yorkville is a community designed around memorable moments, meaningful connections and year-round enjoyment. At its heart is Calgary's only all-season central park, creating a vibrant backdrop for play, recreation and everyday gathering. Surround...
              - button "Show more" [ref=e78] [cursor=pointer]: More+
            - paragraph
            - paragraph
      - generic [ref=e80]:
        - paragraph [ref=e81]: Home Details
        - generic [ref=e82]:
          - img [ref=e83]
          - generic [ref=e85]:
            - generic [ref=e86]: Home Types
            - generic [ref=e87]: Attached | Townhome | Detached
        - generic [ref=e88]:
          - generic [ref=e89]:
            - img [ref=e90]
            - generic [ref=e92]:
              - generic [ref=e93]: Bedrooms
              - generic [ref=e94]: 3 - 5
          - generic [ref=e95]:
            - img [ref=e96]
            - generic [ref=e98]:
              - generic [ref=e99]: Full Bathrooms
              - generic [ref=e100]: 2 - 3
          - generic [ref=e101]:
            - img [ref=e102]
            - generic [ref=e115]:
              - generic [ref=e116]: Half Bathrooms
              - generic [ref=e117]: "1"
          - generic [ref=e118]:
            - img [ref=e119]
            - generic [ref=e121]:
              - generic [ref=e122]: Sq. Ft.
              - generic [ref=e123]: 1342 - 2875
          - generic [ref=e124]:
            - img [ref=e125]
            - generic [ref=e135]:
              - generic [ref=e136]: Stories
              - generic [ref=e137]: "2"
          - generic [ref=e138]:
            - img [ref=e139]
            - generic [ref=e146]:
              - generic [ref=e147]: Garages
              - generic [ref=e148]: "2"
    - generic [ref=e154]:
      - generic [ref=e155]:
        - heading "Sign Up For Community Updates" [level=3] [ref=e156]
        - generic [ref=e158]: Required fields are marked with *
        - separator [ref=e159]
      - group [ref=e160]:
        - generic [ref=e161]:
          - generic [ref=e162]:
            - text: community-code
            - textbox "community-code" [ref=e163]:
              - /placeholder: ""
          - generic [ref=e164]:
            - text: company
            - textbox "company" [ref=e165]:
              - /placeholder: ""
          - generic [ref=e166]:
            - generic [ref=e167]: First name *
            - generic [ref=e168]:
              - text: First name
              - textbox "First name" [ref=e169]:
                - /placeholder: First name*
          - generic [ref=e170]:
            - generic [ref=e171]: Last name *
            - generic [ref=e172]:
              - text: Last name
              - textbox "Last name" [ref=e173]:
                - /placeholder: Last name*
          - generic [ref=e174]:
            - generic [ref=e175]: Email *
            - generic [ref=e176]:
              - text: Email
              - textbox "Email" [ref=e177]:
                - /placeholder: Email address *
          - generic [ref=e178]:
            - generic [ref=e179]: Country of Residence *
            - generic [ref=e180]:
              - text: Country of Residence *
              - combobox "Country of Residence *" [ref=e181]:
                - option [selected]
                - option "Canada"
                - option "United States"
                - option "Other"
              - generic:
                - img
          - generic [ref=e182]:
            - generic [ref=e183]: Zip/Postal Code *
            - generic [ref=e184]:
              - text: Zip/Postal Code *
              - textbox "Zip/Postal Code *" [ref=e185]:
                - /placeholder: Zip/Postal Code*
          - generic [ref=e186]:
            - generic [ref=e187]: Phone number
            - generic [ref=e188]:
              - text: Phone number
              - textbox "Phone number" [ref=e189]
          - generic [ref=e190]:
            - generic [ref=e191]: Additional questions or special requirements
            - generic [ref=e192]:
              - generic [ref=e193]: Additional questions or special requirements
              - textbox "Additional questions or special requirements" [ref=e194]
          - generic [ref=e195]:
            - generic [ref=e196]: When do you want to move into your home? *
            - generic [ref=e197]:
              - text: When do you want to move into your home?
              - combobox "When do you want to move into your home?" [ref=e198]:
                - option [selected]
                - option "0-3 Months"
                - option "3-6 Months"
                - option "6-12 Months"
                - option "12+ Months"
              - generic:
                - img
          - generic [ref=e199]:
            - generic [ref=e200]: Are you a first time homebuyer? *
            - generic [ref=e201]:
              - text: Are you a first time homebuyer?
              - combobox "Are you a first time homebuyer?" [ref=e202]:
                - option [selected]
                - option "No"
                - option "Yes"
              - generic:
                - img
          - generic [ref=e203]:
            - generic [ref=e204]: How many bedrooms do you need? *
            - generic [ref=e205]:
              - text: How many bedrooms do you need?
              - combobox "How many bedrooms do you need?" [ref=e206]:
                - option [selected]
                - option "1"
                - option "2"
                - option "3"
                - option "4"
                - option "5+"
              - generic:
                - img
          - generic [ref=e207]:
            - generic [ref=e208]: What is your budget? *
            - generic [ref=e209]:
              - text: What is your budget?
              - combobox "What is your budget?" [ref=e210]:
                - option [selected]
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
          - generic [ref=e212]:
            - checkbox "I am a Real Estate Agent" [ref=e213]
            - text: I am a Real Estate Agent
          - generic [ref=e215]:
            - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy, SMS Privacy Policy, SMS Terms of Service, and/or Contact Us." [ref=e216]'
            - generic [ref=e217]:
              - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
              - link "SMS Privacy Policy" [ref=e218] [cursor=pointer]:
                - /url: /sms-privacy-policy
              - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
              - link "Privacy Policy" [ref=e219] [cursor=pointer]:
                - /url: /privacy-policy
              - text: ","
              - link "SMS Privacy Policy" [ref=e220] [cursor=pointer]:
                - /url: /sms-privacy-policy
              - text: ","
              - link "SMS Terms of Service" [ref=e221] [cursor=pointer]:
                - /url: /sms-terms-of-service
              - text: ", and/or"
              - link "Contact Us" [ref=e222] [cursor=pointer]:
                - /url: /contact-us
              - text: .
          - button "SUBMIT" [ref=e224] [cursor=pointer]
    - generic [ref=e225]:
      - generic [ref=e226]:
        - radiogroup "Home type" [ref=e228]:
          - radio "Show Quick Move-In Homes, 3 available" [checked] [ref=e229] [cursor=pointer]:
            - generic [ref=e231]: "3"
            - generic [ref=e232]: Quick Move-In
          - radio "Show Floorplans, 26 available" [active] [ref=e233] [cursor=pointer]:
            - generic [ref=e235]: "26"
            - generic [ref=e236]: Floorplans
        - generic [ref=e239]:
          - heading "Quick Move-In Homes ready when you are" [level=2] [ref=e240]
          - generic [ref=e241]: If time is of the essence, then our Quick Move-In Homes are for you.
      - generic [ref=e243]:
        - generic [ref=e244]:
          - paragraph [ref=e247]: Ready Now
          - generic [ref=e249] [cursor=pointer]:
            - link "Brooke townhome model with prairie elevation. 4 large windows sits above porch with a large window to the left side of door." [ref=e252]:
              - /url: /alberta/calgary/calgary/yorkville/brooke/30-yorkville-drive-sw
              - img "Brooke townhome model with prairie elevation. 4 large windows sits above porch with a large window to the left side of door." [ref=e255]
            - link "View 30 Yorkville Drive SW information.Brooke Floorplan | Attached 1,342 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 2 Car Garage $452,990" [ref=e257]:
              - /url: /alberta/calgary/calgary/yorkville/brooke/30-yorkville-drive-sw
              - generic [ref=e258]: 30 Yorkville Drive SW
              - generic [ref=e259]: Brooke Floorplan | Attached
              - generic [ref=e262]:
                - paragraph [ref=e264]: 1,342 Sq. Ft.|3 Beds|2 Baths
                - paragraph [ref=e266]: 1 Half Bath|2 Car Garage
                - paragraph [ref=e268]: $452,990
            - button "Mark as favorite" [ref=e269]:
              - img "Favorite Icon" [ref=e270]
        - generic [ref=e272]:
          - paragraph [ref=e275]: Ready Now
          - generic [ref=e277] [cursor=pointer]:
            - link "Rendering of the Prairie elevation for the Finch Model" [ref=e280]:
              - /url: /alberta/calgary/calgary/yorkville/finch/33-yorkstone-gardens-sw
              - img "Rendering of the Prairie elevation for the Finch Model" [ref=e283]
            - link "View 33 Yorkstone Gardens SW information.Finch Floorplan | Attached 1,366 Sq. Ft. 3 Beds 2 Baths 1 Half Bath 0 Car Garage $485,990" [ref=e285]:
              - /url: /alberta/calgary/calgary/yorkville/finch/33-yorkstone-gardens-sw
              - generic [ref=e286]: 33 Yorkstone Gardens SW
              - generic [ref=e287]: Finch Floorplan | Attached
              - generic [ref=e290]:
                - paragraph [ref=e292]: 1,366 Sq. Ft.|3 Beds|2 Baths
                - paragraph [ref=e294]: 1 Half Bath|
                - paragraph [ref=e296]: $485,990
            - button "Mark as favorite" [ref=e297]:
              - img "Favorite Icon" [ref=e298]
        - generic [ref=e300]:
          - paragraph [ref=e303]: Ready Now
          - generic [ref=e305] [cursor=pointer]:
            - link "2 story Craftsman style detached home with light grey exterior, yellow and grey accents, brown roof, white trim, front porch, double car garage" [ref=e308]:
              - /url: /alberta/calgary/calgary/yorkville/armstrong/20-yorklyn-heath-sw
              - img "2 story Craftsman style detached home with light grey exterior, yellow and grey accents, brown roof, white trim, front porch, double car garage" [ref=e311]
            - link "View 20 Yorklyn Heath SW information.Armstrong Floorplan | Detached 2,875 Sq. Ft. 4 Beds 2 Baths 1 Half Bath 2 Car Garage $876,857" [ref=e313]:
              - /url: /alberta/calgary/calgary/yorkville/armstrong/20-yorklyn-heath-sw
              - generic [ref=e314]: 20 Yorklyn Heath SW
              - generic [ref=e315]: Armstrong Floorplan | Detached
              - generic [ref=e318]:
                - paragraph [ref=e320]: 2,875 Sq. Ft.|4 Beds|2 Baths
                - paragraph [ref=e322]: 1 Half Bath|2 Car Garage
                - paragraph [ref=e324]: $876,857
            - button "Mark as favorite" [ref=e325]:
              - img "Favorite Icon" [ref=e326]
        - generic [ref=e328]:
          - link "View all" [ref=e329] [cursor=pointer]:
            - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Yorkville&hideMap=true
            - generic [ref=e330]: View all
          - paragraph [ref=e331]: Showing 3 of 3 quick move-in homes
    - generic [ref=e334]:
      - article [ref=e335]:
        - heading "Golf" [level=3] [ref=e337]
        - paragraph [ref=e338]: Enjoy weekend downtime at Sirocco Golf Club.
      - article [ref=e339]:
        - heading "Transit" [level=3] [ref=e341]
        - paragraph [ref=e342]: Commutes are a breeze with multiple transit stops just outside the community.
      - article [ref=e343]:
        - heading "Nature" [level=3] [ref=e345]
        - paragraph [ref=e346]: Enjoy the outdoors at Fish Creek Provincial Park or along the Rotary/Mattamy Greenway.
      - article [ref=e347]:
        - heading "Parks" [level=3] [ref=e349]
        - paragraph [ref=e350]: Direct access to Central Park, Calgary’s only all-season, all-abilities park.
      - article [ref=e351]:
        - heading "Shopping" [level=3] [ref=e353]
        - paragraph [ref=e354]: Close to several shopping complexes with groceries and more across the street.
      - article [ref=e355]:
        - heading "Recreation" [level=3] [ref=e357]
        - paragraph [ref=e358]: Find family fun at recreation centres, Granary Road and Spruce Meadows.
    - generic [ref=e359]:
      - generic [ref=e362]:
        - 'img "Your Basement Has Ambitions: Free Finished Basement & Suite-Ready Upgrades*" [ref=e368]'
        - generic [ref=e372]:
          - heading "More Space. More Possibility." [level=2] [ref=e373]
          - generic [ref=e375]:
            - paragraph [ref=e376]: For a limited time, get a free finished basement with suite-ready upgrades* or upgrade to a fully developed legal basement suite starting at only $20,000.* Enjoy more space today or unlock rental income potential that could help offset your monthly mortgage payments.
            - paragraph [ref=e377]
            - paragraph [ref=e378]: "*Terms and conditions apply."
          - link "LEARN MORE" [ref=e380] [cursor=pointer]:
            - /url: https://mattamyhomes.com/alberta/calgary/promos/free-basement
            - generic [ref=e381]: LEARN MORE
      - generic [ref=e384]:
        - img "Better Living headline, person sitting on chair in living room looking towards window with sunlight coming in" [ref=e390]
        - generic [ref=e394]:
          - heading "Solar Power Made Simple!" [level=2] [ref=e395]
          - paragraph [ref=e398]: Turn sunlight into savings with solar panels, now included on all newly built Calgary homes! Learn more about how generating your own solar power can help lower your energy bills and contribute to a healthier planet.
          - link "LEARN MORE" [ref=e400] [cursor=pointer]:
            - /url: https://mattamyhomes.com/alberta/calgary/promos/solar-initiative
            - generic [ref=e401]: LEARN MORE
      - generic [ref=e404]:
        - img "Aerial view of houses with solar panels on roof, trees in background" [ref=e410]
        - generic [ref=e414]:
          - heading "Where Value Grows" [level=2] [ref=e415]
          - paragraph [ref=e418]:
            - text: Find the home that perfectly suits your life in Yorkville. With the option of Hardie Board exteriors, your home is built to withstand all the elements. For those who need more room to grow, our
            - strong [ref=e419]: WideLot
            - text: ™ options offer larger, brighter rooms, better flow between spaces and inviting front porches to help you connect with neighbours. Plus, as part of our mission to make sustainable living easier and more accessible for all, solar panels are now included on all new homes in Calgary – this is where sunshine creates savings.
      - generic [ref=e422]:
        - img "Aerial image of Central Park with playground, pathways, grass and trees" [ref=e428]
        - generic [ref=e432]:
          - heading "Where Nature Is Nearby" [level=2] [ref=e433]
          - generic [ref=e434]: Nature is just steps away in Yorkville’s Central Park. This 4-acre green space is Calgary’s only all-season, all-abilities park. It offers something for everyone with a skate park, a playground, ping-pong tables, a puddle rink and more. When you want to venture further, Fish Creek Provincial Park is a short drive away and the Rotary/Mattamy Greenway connects you to the city on foot or bike. This is where nature is part of every day.
      - generic [ref=e437]:
        - img "Father and two children at grocery store with shopping cart" [ref=e443]
        - generic [ref=e447]:
          - heading "Where Errands Are Easy" [level=2] [ref=e448]
          - generic [ref=e449]: Just across the street from Yorkville, you’ll find groceries, a pharmacy, restaurants, fitness/yoga centres and local medical clinics. Multiple transit routes are within walking distance and a short drive will lead you to shopping centres, schools, libraries, recreation complexes and more. This is where everything you need is at your fingertips.
    - generic [ref=e451]:
      - heading "Thoughtfully designed with you in mind" [level=2] [ref=e452]
      - generic [ref=e453]: Explore the community or model homes by selecting from the options below.
      - generic [ref=e455]:
        - generic [ref=e456]:
          - radiogroup "Content type" [ref=e458] [cursor=pointer]:
            - radio "Videos" [ref=e459]:
              - img [ref=e461]
              - generic [ref=e464]: Videos
            - radio "360 Tours" [ref=e465]:
              - img [ref=e467]
              - generic [ref=e470]: 360 Tours
            - radio "Photos" [ref=e471]:
              - img [ref=e473]
              - generic [ref=e476]: Photos
          - radiogroup "Content type" [ref=e477]:
            - generic [ref=e478] [cursor=pointer]:
              - text: Community Gallery
              - img [ref=e479]
            - paragraph [ref=e481]: Slide has changed view to 0
        - generic:
          - button "Community Gallery" [ref=e482] [cursor=pointer]
          - button "Fullerton" [ref=e483] [cursor=pointer]
          - button "Monarch" [ref=e484] [cursor=pointer]
          - button "Smythe" [ref=e485] [cursor=pointer]
        - radiogroup "Content type" [ref=e486] [cursor=pointer]:
          - radio "Videos" [ref=e487]:
            - img [ref=e489]
            - generic [ref=e492]: Videos
          - radio "360 Tours" [ref=e493]:
            - img [ref=e495]
            - generic [ref=e498]: 360 Tours
          - radio "Photos" [ref=e499]:
            - img [ref=e501]
            - generic [ref=e504]: Photos
        - generic [ref=e505]:
          - generic [ref=e507]:
            - generic [ref=e508] [cursor=pointer]: ←
            - generic [ref=e510]:
              - button [ref=e515] [cursor=pointer]
              - iframe [ref=e520]:
                - generic [ref=f5e1]:
                  - heading "We couldn't verify the security of your connection." [level=1] [ref=f5e2]
                  - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f5e3]
              - iframe [ref=e525]:
                - generic [ref=f6e1]:
                  - heading "We couldn't verify the security of your connection." [level=1] [ref=f6e2]
                  - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f6e3]
              - iframe [ref=e530]:
                - generic [ref=f7e1]:
                  - heading "We couldn't verify the security of your connection." [level=1] [ref=f7e2]
                  - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f7e3]
              - button [ref=e535] [cursor=pointer]
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
              - iframe [ref=e605]:
                - generic [active] [ref=f8e1]:
                  - main [ref=f8e2]:
                    - generic [ref=f8e3]:
                      - generic [ref=f8e4]:
                        - img "Icon for my.matterport.com" [ref=f8e5]
                        - heading "my.matterport.com" [level=1] [ref=f8e6]
                      - heading "Performing security verification" [level=2] [ref=f8e7]
                      - paragraph [ref=f8e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f8e13]:
                    - generic [ref=f8e15]:
                      - generic [ref=f8e17]:
                        - text: "Ray ID:"
                        - code [ref=f8e18]: a51022fa5d212bab
                      - generic [ref=f8e19]:
                        - generic [ref=f8e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f8e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f8e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e610]:
                - generic [ref=f9e3] [cursor=pointer]:
                  - img [ref=f9e4]
                  - generic [ref=f9e5]:
                    - generic [ref=f9e6]: CLICK TO EXPLORE
                    - generic [ref=f9e7]:
                      - img [ref=f9e8]
                      - img [ref=f9e9]
              - iframe [ref=e615]:
                - generic [active] [ref=f10e1]:
                  - main [ref=f10e2]:
                    - generic [ref=f10e3]:
                      - generic [ref=f10e4]:
                        - img "Icon for my.matterport.com" [ref=f10e5]
                        - heading "my.matterport.com" [level=1] [ref=f10e6]
                      - heading "Performing security verification" [level=2] [ref=f10e7]
                      - paragraph [ref=f10e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f10e13]:
                    - generic [ref=f10e15]:
                      - generic [ref=f10e17]:
                        - text: "Ray ID:"
                        - code [ref=f10e18]: a51022fa5d3b2bab
                      - generic [ref=f10e19]:
                        - generic [ref=f10e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f10e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f10e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e620]:
                - generic [active] [ref=f11e1]:
                  - main [ref=f11e2]:
                    - generic [ref=f11e3]:
                      - generic [ref=f11e4]:
                        - img "Icon for my.matterport.com" [ref=f11e5]
                        - heading "my.matterport.com" [level=1] [ref=f11e6]
                      - heading "Performing security verification" [level=2] [ref=f11e7]
                      - paragraph [ref=f11e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f11e13]:
                    - generic [ref=f11e15]:
                      - generic [ref=f11e17]:
                        - text: "Ray ID:"
                        - code [ref=f11e18]: a51022fa5d372bab
                      - generic [ref=f11e19]:
                        - generic [ref=f11e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f11e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f11e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e625]:
                - generic [ref=f12e3] [cursor=pointer]:
                  - img [ref=f12e4]
                  - generic [ref=f12e5]:
                    - generic [ref=f12e6]: CLICK TO EXPLORE
                    - generic [ref=f12e7]:
                      - img [ref=f12e8]
                      - img [ref=f12e9]
              - iframe [ref=e630]:
                - generic [active] [ref=f13e1]:
                  - main [ref=f13e2]:
                    - generic [ref=f13e3]:
                      - generic [ref=f13e4]:
                        - img "Icon for my.matterport.com" [ref=f13e5]
                        - heading "my.matterport.com" [level=1] [ref=f13e6]
                      - heading "Performing security verification" [level=2] [ref=f13e7]
                      - paragraph [ref=f13e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f13e13]:
                    - generic [ref=f13e15]:
                      - generic [ref=f13e17]:
                        - text: "Ray ID:"
                        - code [ref=f13e18]: a51022fa5d2d2bab
                      - generic [ref=f13e19]:
                        - generic [ref=f13e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f13e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f13e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e635]:
                - generic [active] [ref=f14e1]:
                  - main [ref=f14e2]:
                    - generic [ref=f14e3]:
                      - generic [ref=f14e4]:
                        - img "Icon for my.matterport.com" [ref=f14e5]
                        - heading "my.matterport.com" [level=1] [ref=f14e6]
                      - heading "Performing security verification" [level=2] [ref=f14e7]
                      - paragraph [ref=f14e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f14e13]:
                    - generic [ref=f14e15]:
                      - generic [ref=f14e17]:
                        - text: "Ray ID:"
                        - code [ref=f14e18]: a51022fa5d302bab
                      - generic [ref=f14e19]:
                        - generic [ref=f14e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f14e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f14e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e640]:
                - generic [active] [ref=f15e1]:
                  - main [ref=f15e2]:
                    - generic [ref=f15e3]:
                      - generic [ref=f15e4]:
                        - img "Icon for my.matterport.com" [ref=f15e5]
                        - heading "my.matterport.com" [level=1] [ref=f15e6]
                      - heading "Performing security verification" [level=2] [ref=f15e7]
                      - paragraph [ref=f15e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f15e13]:
                    - generic [ref=f15e15]:
                      - generic [ref=f15e17]:
                        - text: "Ray ID:"
                        - code [ref=f15e18]: a51022fa5d292bab
                      - generic [ref=f15e19]:
                        - generic [ref=f15e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f15e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f15e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e645]:
                - generic [ref=f16e3] [cursor=pointer]:
                  - img [ref=f16e4]
                  - generic [ref=f16e5]:
                    - generic [ref=f16e6]: CLICK TO EXPLORE
                    - generic [ref=f16e7]:
                      - img [ref=f16e8]
                      - img [ref=f16e9]
              - iframe [ref=e650]:
                - generic [active] [ref=f17e1]:
                  - main [ref=f17e2]:
                    - generic [ref=f17e3]:
                      - generic [ref=f17e4]:
                        - img "Icon for my.matterport.com" [ref=f17e5]
                        - heading "my.matterport.com" [level=1] [ref=f17e6]
                      - heading "Performing security verification" [level=2] [ref=f17e7]
                      - paragraph [ref=f17e8]: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
                  - contentinfo [ref=f17e13]:
                    - generic [ref=f17e15]:
                      - generic [ref=f17e17]:
                        - text: "Ray ID:"
                        - code [ref=f17e18]: a51022fa5d252bab
                      - generic [ref=f17e19]:
                        - generic [ref=f17e20]:
                          - text: Performance and Security by
                          - link "Cloudflare, opens in a new tab" [ref=f17e21] [cursor=pointer]:
                            - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
                            - text: Cloudflare
                        - link "Privacy, opens in a new tab" [ref=f17e23] [cursor=pointer]:
                          - /url: https://www.cloudflare.com/privacypolicy/
                          - text: Privacy
              - iframe [ref=e655]:
                - generic [ref=f18e3] [cursor=pointer]:
                  - img [ref=f18e4]
                  - generic [ref=f18e5]:
                    - generic [ref=f18e6]: CLICK TO EXPLORE
                    - generic [ref=f18e7]:
                      - img [ref=f18e8]
                      - img [ref=f18e9]
              - iframe [ref=e660]:
                - generic [ref=f19e3] [cursor=pointer]:
                  - img [ref=f19e4]
                  - generic [ref=f19e5]:
                    - generic [ref=f19e6]: CLICK TO EXPLORE
                    - generic [ref=f19e7]:
                      - img [ref=f19e8]
                      - img [ref=f19e9]
              - iframe [ref=e665]:
                - generic [ref=f20e14]:
                  - generic [ref=f20e32]: Finch
                  - generic [ref=f20e41]: LIVING ROOM
                  - generic [ref=f20e46]:
                    - generic [ref=f20e51]:
                      - img
                    - generic [ref=f20e56]:
                      - img
                    - generic [ref=f20e61]:
                      - img
                  - generic [ref=f20e79]:
                    - generic [ref=f20e82]: DISCLAIMER
                    - paragraph [ref=f20e83]
                    - generic [ref=f20e85]: All illustrations are artist’s concept. Specifications, terms, and conditions are subject to change without notice.
              - iframe [ref=e670]:
                - generic [ref=f21e3] [cursor=pointer]:
                  - img [ref=f21e4]
                  - generic [ref=f21e5]:
                    - generic [ref=f21e6]: CLICK TO EXPLORE
                    - generic [ref=f21e7]:
                      - img [ref=f21e8]
                      - img [ref=f21e9]
              - iframe [ref=e675]:
                - generic [ref=f22e3] [cursor=pointer]:
                  - img [ref=f22e4]
                  - generic [ref=f22e5]:
                    - generic [ref=f22e6]: CLICK TO EXPLORE
                    - generic [ref=f22e7]:
                      - img [ref=f22e8]
                      - img [ref=f22e9]
              - iframe [ref=e680]:
                - generic [ref=f23e3] [cursor=pointer]:
                  - img [ref=f23e4]
                  - generic [ref=f23e5]:
                    - generic [ref=f23e6]: CLICK TO EXPLORE
                    - generic [ref=f23e7]:
                      - img [ref=f23e8]
                      - img [ref=f23e9]
              - iframe [ref=e685]:
                - generic [ref=f24e3] [cursor=pointer]:
                  - img [ref=f24e4]
                  - generic [ref=f24e5]:
                    - generic [ref=f24e6]: CLICK TO EXPLORE
                    - generic [ref=f24e7]:
                      - img [ref=f24e8]
                      - img [ref=f24e9]
              - iframe [ref=e690]:
                - generic [ref=f25e3] [cursor=pointer]:
                  - img [ref=f25e4]
                  - generic [ref=f25e5]:
                    - generic [ref=f25e6]: CLICK TO EXPLORE
                    - generic [ref=f25e7]:
                      - img [ref=f25e8]
                      - img [ref=f25e9]
              - button [ref=e695] [cursor=pointer]
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
              - iframe [ref=e760]:
                - generic [ref=f26e1]:
                  - heading "We couldn't verify the security of your connection." [level=1] [ref=f26e2]
                  - heading "Access to this content has been restricted. Contact your internet service provider for help." [level=2] [ref=f26e3]
            - generic [ref=e761] [cursor=pointer]: →
          - paragraph [ref=e763]:
            - generic [ref=e764]: Slide number
            - text: 1/48
      - generic [ref=e765]:
        - generic [ref=e766]:
          - text: "Transcript:"
          - 'link "Download Yorkville Central Park: Grand Opening Event (.txt file) transcript" [ref=e767] [cursor=pointer]':
            - /url: ""
            - text: "Yorkville Central Park: Grand Opening Event (.txt file)"
        - generic [ref=e768]:
          - text: "Transcript:"
          - link "Download Yorkville in Calgary Alberta (.txt file) transcript" [ref=e769] [cursor=pointer]:
            - /url: ""
            - text: Yorkville in Calgary Alberta (.txt file)
        - generic [ref=e770]:
          - text: "Transcript:"
          - link "Download The Mattamy/Rotary Greenway (.txt file) transcript" [ref=e771] [cursor=pointer]:
            - /url: ""
            - text: The Mattamy/Rotary Greenway (.txt file)
    - generic [ref=e774]:
      - heading "Conveniently located to fit your needs" [level=2] [ref=e775]
      - button "Nearby Services" [ref=e780] [cursor=pointer]:
        - generic [ref=e782]: What's Nearby
        - button "Nearby Services dropdown list" [ref=e783]:
          - img [ref=e784]
    - generic [ref=e794]:
      - heading "Explore the community" [level=2] [ref=e795]
      - generic [ref=e796]: Take a closer look at the community sitemap and get familiar with our available offerings.
      - button "VIEW SITEMAP" [ref=e797] [cursor=pointer]:
        - generic [ref=e798]: VIEW SITEMAP
    - generic [ref=e802]:
      - img "View of Calgary by the water with high-rise buildings and a bridge" [ref=e808]
      - generic [ref=e813]:
        - heading "Mattamy Homes in Calgary" [level=2] [ref=e814]
        - generic [ref=e815]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
        - link "Learn More About Living in Calgary" [ref=e817] [cursor=pointer]:
          - /url: /alberta/calgary
          - generic [ref=e818]: Learn More About Living in Calgary
    - generic [ref=e820]:
      - generic [ref=e821] [cursor=pointer]:
        - generic [ref=e822]:
          - generic [ref=e823]: New home rebates available!
          - img "Click Here New home rebates available!" [ref=e825]
        - button "Get Rebate Estimate" [ref=e826]:
          - generic [ref=e827]: Get Rebate Estimate
      - button "x" [ref=e828] [cursor=pointer]
  - contentinfo "footer" [ref=e829]:
    - generic [ref=e831]:
      - generic [ref=e832]:
        - generic [ref=e833]:
          - heading "Explore" [level=2] [ref=e834]
          - list [ref=e836]:
            - listitem [ref=e837]:
              - link "Mattamy Homes USA" [ref=e838] [cursor=pointer]:
                - /url: https://mattamyhomes.com/us
            - listitem [ref=e839]:
              - link "Mattamy Homes Canada" [ref=e840] [cursor=pointer]:
                - /url: https://mattamyhomes.com/ca
            - listitem [ref=e841]:
              - link "Design Studio" [ref=e842] [cursor=pointer]:
                - /url: /design-studio
            - listitem [ref=e843]:
              - link "Customer Care" [ref=e844] [cursor=pointer]:
                - /url: /customer-care
        - generic [ref=e846]:
          - heading "About Mattamy" [level=2] [ref=e847]
          - list [ref=e849]:
            - listitem [ref=e850]:
              - link "About Us" [ref=e851] [cursor=pointer]:
                - /url: /about/about-mattamy
            - listitem [ref=e852]:
              - link "Contact Us" [ref=e853] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e854]:
              - link "Careers" [ref=e855] [cursor=pointer]:
                - /url: /about/careers
            - listitem [ref=e856]:
              - link "Media and Investor Relations" [ref=e857] [cursor=pointer]:
                - /url: /about/media-and-investor-relations
        - generic [ref=e859]:
          - heading "Connect With Us" [level=2] [ref=e860]
          - generic [ref=e862]:
            - link "Facebook (opens in a new tab)" [ref=e863] [cursor=pointer]:
              - /url: https://www.facebook.com/MattamyHomes
              - img [ref=e864]
            - link "Instagram (opens in a new tab)" [ref=e866] [cursor=pointer]:
              - /url: https://www.instagram.com/mattamyhomes/
              - img [ref=e867]
            - link "Youtube (opens in a new tab)" [ref=e869] [cursor=pointer]:
              - /url: https://www.youtube.com/user/MattamyHomesOnline
              - img [ref=e870]
            - link "Pinterest (opens in a new tab)" [ref=e872] [cursor=pointer]:
              - /url: https://www.pinterest.com/mattamyhomes/
              - img [ref=e873]
            - link "Linkedin (opens in a new tab)" [ref=e875] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/mattamy-homes
              - img [ref=e876]
      - generic [ref=e879]:
        - paragraph [ref=e880]:
          - link "Accessibility" [ref=e881] [cursor=pointer]:
            - /url: /accessibility
            - text: Accessibility
            - generic [ref=e882]: "|"
          - button "Cookie Settings" [ref=e883] [cursor=pointer]:
            - text: Cookie Settings
            - generic [ref=e884]: "|"
          - link "Legal Disclaimers" [ref=e885] [cursor=pointer]:
            - /url: /legal-disclaimers
            - text: Legal Disclaimers
            - generic [ref=e886]: "|"
          - link "Privacy Policy" [ref=e887] [cursor=pointer]:
            - /url: /privacy-policies
            - text: Privacy Policy
            - generic [ref=e888]: "|"
          - link "Terms and Conditions" [ref=e889] [cursor=pointer]:
            - /url: /terms-and-conditions
        - paragraph [ref=e890]: ©2026 Mattamy Homes
```

# Test source

```ts
  14  | };
  15  | 
  16  | export type HomeType = 'qmi' | 'floorplans';
  17  | 
  18  | const HOME_TYPES: Record<
  19  |   HomeType,
  20  |   { label: string; tabName: RegExp; heading: RegExp; liveRegion: RegExp }
  21  | > = {
  22  |   qmi: {
  23  |     label: 'Quick Move-In Homes',
  24  |     tabName: /Quick Move-In Homes/i,
  25  |     heading: /Quick Move-In Homes ready when you are/i,
  26  |     liveRegion: /quick move-in homes/i,
  27  |   },
  28  |   floorplans: {
  29  |     label: 'Floorplans',
  30  |     tabName: /Floorplans/i,
  31  |     heading: /Explore available floorplans/i,
  32  |     liveRegion: /floorplans/i,
  33  |   },
  34  | };
  35  | 
  36  | const TIMEOUT = 15_000;
  37  | 
  38  | export class HomeTypeTabs {
  39  |   private readonly page: Page;
  40  |   private readonly deps: HomeTypeTabsDeps;
  41  | 
  42  |   /** Sets up the tab checks for one community page. */
  43  |   constructor(page: Page, deps: HomeTypeTabsDeps) {
  44  |     this.page = page;
  45  |     this.deps = deps;
  46  |   }
  47  | 
  48  |   /** The Available Homes section that holds the tabs and both listings. */
  49  |   private get section(): Locator {
  50  |     return this.page.locator('#availablehomes').first();
  51  |   }
  52  | 
  53  |   /** The Home type radio group. */
  54  |   private get tabGroup(): Locator {
  55  |     return this.section.getByRole('radiogroup', { name: /^Home type$/i });
  56  |   }
  57  | 
  58  |   /** The tab for one home type. */
  59  |   private tab(type: HomeType): Locator {
  60  |     return this.tabGroup.getByRole('radio', { name: HOME_TYPES[type].tabName });
  61  |   }
  62  | 
  63  |   /**
  64  |    * The heading of one home type's listing.
  65  |    *
  66  |    * Matched by tag and text rather than by role, because role queries skip hidden elements and the
  67  |    * inactive tab's heading has to be asserted hidden, not just absent.
  68  |    */
  69  |   private heading(type: HomeType): Locator {
  70  |     return this.section.locator('h2, h3').filter({ hasText: HOME_TYPES[type].heading });
  71  |   }
  72  | 
  73  |   /** The "Showing X of N ..." live region of one home type's listing. */
  74  |   private liveRegion(type: HomeType): Locator {
  75  |     return this.section.locator('[aria-live]').filter({ hasText: HOME_TYPES[type].liveRegion });
  76  |   }
  77  | 
  78  |   /** Brings the section on screen and waits for its listing to render. */
  79  |   async waitForRendered(): Promise<void> {
  80  |     await expect(this.section, 'Available Homes section should be on the page').toBeAttached({
  81  |       timeout: TIMEOUT,
  82  |     });
  83  |     await this.section.scrollIntoViewIfNeeded();
  84  |     await this.deps.waitForPageReady();
  85  | 
  86  |     // Every listing renders a "Showing X of N" live region, tabbed or not, so its arrival is the
  87  |     // signal that the section has hydrated and the presence of the tabs can be read.
  88  |     await expect(
  89  |       this.section.locator('[aria-live]').first(),
  90  |       'Available Homes section should render its listing',
  91  |     ).toBeAttached({ timeout: TIMEOUT });
  92  |   }
  93  | 
  94  |   /** True when the community shows the Quick Move-In Homes / Floorplans tabs. */
  95  |   async hasTabs(): Promise<boolean> {
  96  |     await this.waitForRendered();
  97  | 
  98  |     return (await this.tabGroup.count()) > 0;
  99  |   }
  100 | 
  101 |   /** Switches to one home type's tab and checks it is the selected one. */
  102 |   async select(type: HomeType): Promise<void> {
  103 |     const tab = this.tab(type);
  104 | 
  105 |     await expect(tab, `${HOME_TYPES[type].label} tab should be visible`).toBeVisible({
  106 |       timeout: TIMEOUT,
  107 |     });
  108 | 
  109 |     if ((await tab.getAttribute('aria-checked')) !== 'true') {
  110 |       await tab.scrollIntoViewIfNeeded();
  111 |       await tab.click();
  112 |     }
  113 | 
> 114 |     await expect(tab, `${HOME_TYPES[type].label} tab should be selected`).toHaveAttribute(
      |                                                                           ^ Error: Floorplans tab should be selected
  115 |       'aria-checked',
  116 |       'true',
  117 |     );
  118 |     await expect(
  119 |       this.heading(type).first(),
  120 |       `${HOME_TYPES[type].label} listing should show once its tab is selected`,
  121 |     ).toBeVisible({ timeout: TIMEOUT });
  122 |   }
  123 | 
  124 |   /** Shows the floorplans listing, selecting its tab when the community has tabs. */
  125 |   async showFloorplans(): Promise<void> {
  126 |     if (await this.hasTabs()) {
  127 |       await this.select('floorplans');
  128 |     }
  129 |   }
  130 | 
  131 |   /** Shows the quick move-in listing, or returns false when the community has no QMI inventory. */
  132 |   async showQuickMoveIns(): Promise<boolean> {
  133 |     if (!(await this.hasTabs())) {
  134 |       await this.deps.report(
  135 |         'Community has no quick move-in inventory - Home type tabs not rendered',
  136 |       );
  137 |       return false;
  138 |     }
  139 | 
  140 |     await this.select('qmi');
  141 | 
  142 |     return true;
  143 |   }
  144 | 
  145 |   /** Visible card hrefs of one home type inside the section. */
  146 |   async visibleCardHrefs(type: HomeType): Promise<string[]> {
  147 |     return this.cardHrefs(type, this.section.locator('a[href]').filter({ visible: true }));
  148 |   }
  149 | 
  150 |   /** Every card href of one home type inside the section, hidden ones included. */
  151 |   private async allCardHrefs(type: HomeType): Promise<string[]> {
  152 |     return this.cardHrefs(type, this.section.locator('a[href]'));
  153 |   }
  154 | 
  155 |   /**
  156 |    * Card hrefs of one home type among the given links.
  157 |    *
  158 |    * Told apart by depth under the community path: a floorplan card sits one segment below it
  159 |    * (/community/plan) and a quick move-in card two below (/community/plan/address).
  160 |    */
  161 |   private async cardHrefs(type: HomeType, links: Locator): Promise<string[]> {
  162 |     const communityPath = getPathnameFromHref(this.page.url());
  163 |     const depth = type === 'qmi' ? '[^/]+/[^/]+' : '[^/]+';
  164 |     const pattern = new RegExp(`^${escapeRegex(communityPath)}/${depth}$`, 'i');
  165 |     const hrefs = await links.evaluateAll((elements) =>
  166 |       elements.map((element) => element.getAttribute('href') ?? ''),
  167 |     );
  168 | 
  169 |     return [
  170 |       ...new Set(hrefs.filter((href) => pattern.test(getPathnameFromHref(href, this.page.url())))),
  171 |     ];
  172 |   }
  173 | 
  174 |   /** Reads the inventory count a tab announces in its accessible name. */
  175 |   private async tabCount(type: HomeType): Promise<number> {
  176 |     const label = (await this.tab(type).getAttribute('aria-label')) ?? '';
  177 |     const count = label.match(/(\d+)\s+available/i)?.[1];
  178 | 
  179 |     expect(
  180 |       count,
  181 |       `${HOME_TYPES[type].label} tab should announce its count: "${label}"`,
  182 |     ).toBeTruthy();
  183 | 
  184 |     return Number(count);
  185 |   }
  186 | 
  187 |   /** Reads the total a listing's "Showing X of N" live region reports. */
  188 |   private async liveRegionTotal(type: HomeType): Promise<number> {
  189 |     const text = (await this.liveRegion(type).first().textContent()) ?? '';
  190 |     const total = text.match(/of\s+(\d+)/i)?.[1];
  191 | 
  192 |     expect(
  193 |       total,
  194 |       `${HOME_TYPES[type].label} listing should report its total: "${text}"`,
  195 |     ).toBeTruthy();
  196 | 
  197 |     return Number(total);
  198 |   }
  199 | 
  200 |   /** Checks the tabs match the inventory: two tabs with QMI homes, none without. */
  201 |   async verifyTabsMatchInventory(): Promise<void> {
  202 |     if (await this.hasTabs()) {
  203 |       await this.verifyTabbedListing();
  204 |     } else {
  205 |       await this.verifyFloorplansOnlyListing();
  206 |     }
  207 |   }
  208 | 
  209 |   /** Checks both tabs, their counts, and that each shows only its own listing. */
  210 |   private async verifyTabbedListing(): Promise<void> {
  211 |     await expect(
  212 |       this.tabGroup.getByRole('radio'),
  213 |       'Home type should offer exactly the Quick Move-In Homes and Floorplans tabs',
  214 |     ).toHaveCount(2);
```