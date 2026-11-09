# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: condoCommunity.spec.ts >> Condo Community Detail - CAN >> Content Validation >> @smoke @regression | CAN | Validate available condo floorplans section when available
- Location: tests/condoCommunity.spec.ts:70:9

# Error details

```
Error: Explore available floorplans should render at least one visible floorplan link

expect(locator).toBeVisible() failed

Locator:  locator('section').filter({ has: getByRole('heading', { name: /Explore available floorplans|Available floorplans|Floorplans/i }).first() }).first().locator('a[href]').filter({ hasNotText: /view all/i }).first()
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Explore available floorplans should render at least one visible floorplan link with timeout 10000ms
  - waiting for locator('section').filter({ has: getByRole('heading', { name: /Explore available floorplans|Available floorplans|Floorplans/i }).first() }).first().locator('a[href]').filter({ hasNotText: /view all/i }).first()
    13 × locator resolved to <a class="mx-5 my-4 flex flex-col w-auto" href="/ontario/gta/burlington/martha-james-condominiums/MJ2B/308-2088-james-street" aria-label="Martha James Condominiums MJ2B Floorplan |  308-2088 James Street 650 Sq. Ft. 1 Bed 2 Baths 0 Half Bath 0 Car Garage ">…</a>
       - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e6]:
    - generic [ref=e12]:
      - text: Government Tax Rebates Available on New Homes!
      - link "Learn More" [ref=e13] [cursor=pointer]:
        - /url: http://mattamyhomes.com/promos/government-rebates
  - generic [ref=e15]:
    - banner [ref=e16]:
      - generic [ref=e17]:
        - link "Martha James Condominiums Mattamy logo in Burlington Ontario by Mattamy Homes. Go to HomePage" [ref=e18] [cursor=pointer]:
          - /url: /
          - figure [ref=e19]:
            - img "Martha James Condominiums Mattamy logo in Burlington Ontario by Mattamy Homes" [ref=e20]
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
    - link "Navigate to Top." [ref=e62] [cursor=pointer]:
      - img [ref=e63]
    - main [ref=e65]:
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]: Martha James Condominiums
          - generic [ref=e70]:
            - link "Go to 1388 Dundas Street West, Oakville ON L6M 4L8. Opens in GoogleMaps" [ref=e71] [cursor=pointer]:
              - /url: https://maps.google.com/maps?q=43.453831254877,-79.756406318446
              - img "Map Location Icon" [ref=e72]
              - generic [ref=e74]:
                - text: 1388 Dundas Street West, Oakville ON L6M 4L8
                - img "OpenNewTab Icon" [ref=e75]
            - link "Call to 416-630-8282" [ref=e78] [cursor=pointer]:
              - /url: tel:4166308282
              - img "Call Icon" [ref=e79]
              - generic [ref=e81]: 416-630-8282
            - link "Email to condosales@mattamycorp.com" [ref=e82] [cursor=pointer]:
              - /url: mailto:condosales@mattamycorp.com
              - img "Mail Icon" [ref=e83]
              - generic [ref=e86]: condosales@mattamycorp.com
        - generic [ref=e87]:
          - link "Schedule Appointment" [ref=e88] [cursor=pointer]:
            - generic [ref=e89]: Schedule Appointment
          - link "Stay Updated" [ref=e90] [cursor=pointer]:
            - generic [ref=e91]: Stay Updated
      - generic [ref=e94]:
        - paragraph [ref=e95]: Limited Availability
        - heading "Martha James Condominiums" [level=1] [ref=e97]
        - generic [ref=e98]: Premier Condo Living, Steps from Burlington’s Waterfront and Vibrant Downtown
        - button "Stay updated about this community" [ref=e99] [cursor=pointer]:
          - generic [ref=e100]: Stay Updated
      - region "Sales center contact and quick links" [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e105]: Contact Us
          - generic [ref=e106]:
            - generic [ref=e107]: 1388 Dundas Street West, Oakville, ON L6M 4L8
            - generic [ref=e108]: 416-630-8282
          - generic [ref=e109]:
            - link "Call 416-630-8282" [ref=e110] [cursor=pointer]:
              - /url: tel:4166308282
              - img "Call Icon" [ref=e111]
            - link "Email condosales@mattamycorp.com" [ref=e113] [cursor=pointer]:
              - /url: mailto:condosales@mattamycorp.com
              - img "Mail Icon" [ref=e114]
            - button "Hours" [ref=e117] [cursor=pointer]
            - link "Get directions to sales center, opens in new tab" [ref=e118] [cursor=pointer]:
              - /url: https://maps.google.com/maps?q=43.453831254877,-79.756406318446
              - img "Map Location Icon" [ref=e119]
              - generic [ref=e121]: Directions
            - button "Schedule an Appointment" [ref=e122] [cursor=pointer]
        - generic [ref=e123]:
          - generic [ref=e124]:
            - heading "Discover our homes" [level=2] [ref=e125]
            - paragraph [ref=e126]: Explore floorplans and quick move-in homes ready for you.
          - generic [ref=e127]:
            - link "View 6 Floorplans" [ref=e128] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
            - link "View 3 Quick Move-Ins" [ref=e129] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
      - generic [ref=e131]:
        - generic [ref=e134]:
          - heading "Welcome to Martha James Condominiums" [level=2] [ref=e135]
          - generic [ref=e136]:
            - generic [ref=e137]:
              - generic [ref=e138]: Set in a mature park side neighbourhood, steps from Brant Street and only moments from Lake Ontario, Martha James is Burlington’s most intimate new condominium. Endowed with breathtaking lake views, life-enhancing amenities, and flexible suites - Martha James is designed with you in mind. Step outside and explore the vibrant streets of...
              - button "Show more" [ref=e139] [cursor=pointer]: More+
            - paragraph
            - paragraph
        - generic [ref=e141]:
          - paragraph [ref=e142]: Home Details
          - generic [ref=e143]:
            - generic [ref=e144]:
              - img [ref=e145]
              - generic [ref=e147]:
                - generic [ref=e148]: Bedrooms
                - generic [ref=e149]: 1 to 2 + Den
            - generic [ref=e150]:
              - img [ref=e151]
              - generic [ref=e153]:
                - generic [ref=e154]: Full Bathrooms
                - generic [ref=e155]: 1 - 2
            - generic [ref=e156]:
              - img [ref=e157]
              - generic [ref=e159]:
                - generic [ref=e160]: Sq. Ft.
                - generic [ref=e161]: 425 - 857
            - generic [ref=e162]:
              - img [ref=e163]
              - generic [ref=e173]:
                - generic [ref=e174]: Stories
                - generic [ref=e175]: "1"
      - generic [ref=e181]:
        - generic [ref=e182]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e183]
          - generic [ref=e185]: Required fields are marked with *
          - separator [ref=e186]
        - group [ref=e187]:
          - generic [ref=e188]:
            - textbox [ref=e189]
            - textbox "company" [ref=e190]:
              - /placeholder: ""
            - generic [ref=e191]:
              - generic [ref=e192]: First name *
              - textbox "First name" [ref=e194]:
                - /placeholder: ""
            - generic [ref=e195]:
              - generic [ref=e196]: Last name *
              - textbox "Last name" [ref=e198]:
                - /placeholder: ""
            - generic [ref=e199]:
              - generic [ref=e200]: Email *
              - textbox "Email" [ref=e202]:
                - /placeholder: ""
            - generic [ref=e203]:
              - generic [ref=e204]: Country of Residence *
              - generic [ref=e205]:
                - combobox "Country of Residence" [ref=e206] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e207]:
              - generic [ref=e208]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e210]:
                - /placeholder: ""
            - generic [ref=e211]:
              - generic [ref=e212]: Phone number
              - textbox "Phone number" [ref=e214]:
                - /placeholder: ""
            - generic [ref=e215]:
              - generic [ref=e216]: When do you want to move into your home? *
              - generic [ref=e217]:
                - combobox "When do you want to move into your home?" [ref=e218] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e219]:
              - generic [ref=e220]: Are you a first time homebuyer? *
              - generic [ref=e221]:
                - combobox "Are you a first time homebuyer?" [ref=e222] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e223]:
              - generic [ref=e224]: How many bedrooms do you need? *
              - generic [ref=e225]:
                - combobox "How many bedrooms do you need?" [ref=e226] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e227]:
              - generic [ref=e228]: What is your budget? *
              - generic [ref=e229]:
                - combobox "What is your budget?" [ref=e230] [cursor=pointer]:
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
            - generic [ref=e232] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e233]
              - generic [ref=e234]: I am a Real Estate Agent
            - generic [ref=e236] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e237]'
              - generic [ref=e238]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e239]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e240]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e241]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e242]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e243]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e245] [cursor=pointer]
      - generic [ref=e247]:
        - radiogroup "Home type" [ref=e249]:
          - radio "Show Quick Move-In Homes, 3 available" [ref=e250] [cursor=pointer]:
            - generic:
              - generic: "3"
            - generic: Quick Move-In Homes
          - radio "Show Floorplans, 6 available" [checked] [active] [ref=e251] [cursor=pointer]:
            - generic:
              - generic: "6"
            - generic: Floorplans
        - generic [ref=e252]:
          - generic [ref=e254]:
            - heading "Explore available floorplans" [level=2] [ref=e255]
            - generic [ref=e256]: Take a look at the variety of plans this community offers.
            - link "View all" [ref=e258] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
              - generic [ref=e259]: View all
          - generic [ref=e260]:
            - paragraph [ref=e261]: Showing 6 of 6 floorplans
            - generic [ref=e262]:
              - generic [ref=e265] [cursor=pointer]:
                - generic [ref=e267]:
                  - paragraph [ref=e269]: Inquire for Pricing
                  - img "Martha James M1DD Floorplan" [ref=e270]
                  - button "Mark as favorite" [ref=e271]:
                    - img "Favorite Icon" [ref=e272]
                - link "Martha James Condominiums M1DD 579 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage" [ref=e274]:
                  - /url: /ontario/gta/burlington/martha-james-condominiums/m1dd
                  - generic [ref=e275]: M1DD
                  - generic [ref=e276]:
                    - paragraph [ref=e279]: 579 Sq. Ft.
                    - generic [ref=e280]:
                      - paragraph [ref=e281]: 1 Bed
                      - generic [ref=e282]: "|"
                      - paragraph [ref=e283]: 1 Bath
              - generic [ref=e287] [cursor=pointer]:
                - generic [ref=e289]:
                  - paragraph [ref=e291]: Inquire for Pricing
                  - img "Martha James M1JA Floorplan" [ref=e292]
                  - button "Mark as favorite" [ref=e293]:
                    - img "Favorite Icon" [ref=e294]
                - link "Martha James Condominiums MJ1A 425 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage" [ref=e296]:
                  - /url: /ontario/gta/burlington/martha-james-condominiums/mj1a
                  - generic [ref=e297]: MJ1A
                  - generic [ref=e298]:
                    - paragraph [ref=e301]: 425 Sq. Ft.
                    - generic [ref=e302]:
                      - paragraph [ref=e303]: 1 Bed
                      - generic [ref=e304]: "|"
                      - paragraph [ref=e305]: 1 Bath
              - generic [ref=e309] [cursor=pointer]:
                - generic [ref=e311]:
                  - paragraph [ref=e313]: Inquire for Pricing
                  - button "Mark as favorite" [ref=e314]:
                    - img "Favorite Icon" [ref=e315]
                - link "Martha James Condominiums MJ2B 650 Sq. Ft. 1 Bed 2 Baths 0 Half Bath 0 Car Garage" [ref=e317]:
                  - /url: /ontario/gta/burlington/martha-james-condominiums/MJ2B
                  - generic [ref=e318]: MJ2B
                  - generic [ref=e319]:
                    - paragraph [ref=e322]: 650 Sq. Ft.
                    - generic [ref=e323]:
                      - paragraph [ref=e324]: 1 Bed
                      - generic [ref=e325]: "|"
                      - paragraph [ref=e326]: 2 Baths
              - generic [ref=e330] [cursor=pointer]:
                - generic [ref=e332]:
                  - paragraph [ref=e334]: Inquire for Pricing
                  - img "Martha James M2JH Floorplan" [ref=e335]
                  - button "Mark as favorite" [ref=e336]:
                    - img "Favorite Icon" [ref=e337]
                - link "Martha James Condominiums MJ2H 809 Sq. Ft. 2 Beds 2 Baths 0 Half Bath 0 Car Garage" [ref=e339]:
                  - /url: /ontario/gta/burlington/martha-james-condominiums/mj2h
                  - generic [ref=e340]: MJ2H
                  - generic [ref=e341]:
                    - paragraph [ref=e344]: 809 Sq. Ft.
                    - generic [ref=e345]:
                      - paragraph [ref=e346]: 2 Beds
                      - generic [ref=e347]: "|"
                      - paragraph [ref=e348]: 2 Baths
              - generic [ref=e352] [cursor=pointer]:
                - generic [ref=e354]:
                  - paragraph [ref=e356]: Inquire for Pricing
                  - button "Mark as favorite" [ref=e357]:
                    - img "Favorite Icon" [ref=e358]
                - link "Martha James Condominiums MJ2J 857 Sq. Ft. 2 Beds 2 Baths 0 Half Bath 0 Car Garage" [ref=e360]:
                  - /url: /ontario/gta/burlington/martha-james-condominiums/MJ2J
                  - generic [ref=e361]: MJ2J
                  - generic [ref=e362]:
                    - paragraph [ref=e365]: 857 Sq. Ft.
                    - generic [ref=e366]:
                      - paragraph [ref=e367]: 2 Beds
                      - generic [ref=e368]: "|"
                      - paragraph [ref=e369]: 2 Baths
              - generic [ref=e373] [cursor=pointer]:
                - generic [ref=e375]:
                  - paragraph [ref=e377]: Inquire for Pricing
                  - button "Mark as favorite" [ref=e378]:
                    - img "Favorite Icon" [ref=e379]
                - link "Martha James Condominiums PH03 809 Sq. Ft. 2 Beds 2 Baths 0 Half Bath 0 Car Garage" [ref=e381]:
                  - /url: /ontario/gta/burlington/martha-james-condominiums/PH03
                  - generic [ref=e382]: PH03
                  - generic [ref=e383]:
                    - paragraph [ref=e386]: 809 Sq. Ft.
                    - generic [ref=e387]:
                      - paragraph [ref=e388]: 2 Beds
                      - generic [ref=e389]: "|"
                      - paragraph [ref=e390]: 2 Baths
      - generic [ref=e394]:
        - heading "Schedule an appointment" [level=2] [ref=e395]
        - generic [ref=e396]:
          - button "IN-PERSON" [ref=e398] [cursor=pointer]:
            - generic [ref=e399]: IN-PERSON
          - button "PHONE CALL" [ref=e400] [cursor=pointer]:
            - generic [ref=e401]: PHONE CALL
      - generic [ref=e403]:
        - heading "Your destination - for work, play and life" [level=2] [ref=e404]
        - generic [ref=e405]:
          - article [ref=e406]:
            - heading "Community Garden" [level=3] [ref=e408]
            - paragraph [ref=e409]: Let your green thumb thrive at the rooftop community garden.
          - article [ref=e410]:
            - heading "Connectivity" [level=3] [ref=e412]
            - paragraph [ref=e413]: Access to major highways and the Burlington GO Station makes commuting a breeze.
          - article [ref=e414]:
            - heading "Fitness Centre" [level=3] [ref=e416]
            - paragraph [ref=e417]: Enjoy morning yoga on the rooftop or weights in the fitness studio.
          - article [ref=e418]:
            - heading "Nature" [level=3] [ref=e420]
            - paragraph [ref=e421]: Minutes from the majestic Brant Pier and surrounded by parks and trails.
          - article [ref=e422]:
            - heading "Rooftop Lounge" [level=3] [ref=e424]
            - paragraph [ref=e425]: Entertain with outdoor BBQs on the stunning rooftop.
          - article [ref=e426]:
            - heading "Social Lounge" [level=3] [ref=e428]
            - paragraph [ref=e429]: Transitions from dynamic coworking space during the day to the ideal entertainment spot for family and friends.
      - generic [ref=e430]:
        - generic [ref=e434]:
          - img "Overhead view of Burlington by the lake." [ref=e439]
          - generic [ref=e442]:
            - heading "Everyday Perfection" [level=2] [ref=e443]
            - generic [ref=e445]:
              - paragraph [ref=e446]: Meticulously designed, Martha James Condominiums introduces elegance to your everyday living. Open-concept suites with airy 9’ ceilings and thoughtfully designed floorplans with beautifully refined finishes will inspire life to unfold splendidly. Drawing you and your visitors into a warm welcome, the impressive lobby and concierge service makes a stunning statement.
              - paragraph [ref=e447]: Wake up to sun salutations on the rooftop, let your green thumb thrive in the community garden or get your sweat on in the performance inducing fitness studio. The flexible, well-appointed social lounge takes working from home to the next level and seamlessly transitions into the ideal spot to entertain. The rooftop lounge with expansive lake views provides the perfect backdrop for, alfresco dining or simply unwinding.
        - generic [ref=e451]:
          - img "A couple biking alongside the water." [ref=e456]
          - generic [ref=e459]:
            - heading "The Charm of Burlington" [level=2] [ref=e460]
            - generic [ref=e461]: The spectacular lakefront, abundance of lush parks and trails, easy access to GO Transit and major highways, and family-friendly neighbourhoods have made Burlington one of the most desired cities in the GTHA. Toronto is a short 40-minute commute, perfect for those seeking a quiet life with all the conveniences of an urban setting.
        - generic [ref=e465]:
          - img "The exterior of Martha James Condominiums, surrounded by green space and roads." [ref=e470]
          - generic [ref=e473]:
            - heading "Martha James Brochure" [level=2] [ref=e474]
            - generic [ref=e475]: Learn more about Martha James Condominiums, the surrounding community, and imagine your life here!
            - link "Discover Martha James" [ref=e477] [cursor=pointer]:
              - /url: /dfsmedia/a2b99d47a71047839a5a4241f44710ce/98988-source/gtu-marthajames-brochure
              - generic [ref=e478]: Discover Martha James
      - generic [ref=e480]:
        - heading "Thoughtfully designed with you in mind" [level=2] [ref=e481]
        - generic [ref=e482]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e484]:
          - radiogroup "Content type" [ref=e486]:
            - radio "Community Gallery" [checked] [ref=e487] [cursor=pointer]:
              - paragraph [ref=e488]: Community Gallery
            - paragraph [ref=e489]: Slide has changed view to 0
          - generic [ref=e490]:
            - generic [ref=e492]:
              - button "Previous slide of Gallery" [ref=e494] [cursor=pointer]:
                - img [ref=e495]
              - generic [ref=e498]:
                - button [ref=e503] [cursor=pointer]
                - button "The lobby of Martha James with a large window, seating, and a white marble service desk." [ref=e508] [cursor=pointer]
                - button [ref=e513] [cursor=pointer]
                - button [ref=e518] [cursor=pointer]
                - button [ref=e523] [cursor=pointer]
                - button [ref=e528] [cursor=pointer]
                - button [ref=e533] [cursor=pointer]
                - button [ref=e538] [cursor=pointer]
                - button [ref=e543] [cursor=pointer]
                - button [ref=e548] [cursor=pointer]
                - button [ref=e553] [cursor=pointer]
                - button [ref=e558] [cursor=pointer]
                - button [ref=e563] [cursor=pointer]
                - button [ref=e568] [cursor=pointer]
                - button [ref=e573] [cursor=pointer]
                - button [ref=e578] [cursor=pointer]
                - button [ref=e583] [cursor=pointer]
              - button "Next slide of Gallery" [ref=e585] [cursor=pointer]:
                - img [ref=e586]
            - generic [ref=e588]: Lobby
            - paragraph [ref=e590]:
              - generic [ref=e591]: Slide number
              - text: 1/15
      - generic [ref=e593]:
        - heading "Conveniently located to fit your needs" [level=2] [ref=e594]
        - generic [ref=e595]:
          - article [ref=e596]:
            - heading "Brant Street Pier" [level=3] [ref=e598]
            - paragraph [ref=e599]: 1400 Lakeshore Rd., Burlington, ON, L7S 1Y2
          - article [ref=e600]:
            - heading "Burlington Golf & Country Club" [level=3] [ref=e602]
            - paragraph [ref=e603]: 422 North Shore Blvd E, Burlington, ON, L7T 1W9
          - article [ref=e604]:
            - heading "Burlington Go Station" [level=3] [ref=e606]
            - paragraph [ref=e607]: 2101 Fairview St, Burlington, ON L7R 2C8
          - article [ref=e608]:
            - heading "The Burlington Performing Arts Centre" [level=3] [ref=e610]
            - paragraph [ref=e611]: 440 Locust St, Burlington, ON L7S 1T7
          - article [ref=e612]:
            - heading "Central Public School" [level=3] [ref=e614]
            - paragraph [ref=e615]: 638 Brant St, Burlington, ON, L7R 2H2
          - article [ref=e616]:
            - heading "Fortinos" [level=3] [ref=e618]
            - paragraph [ref=e619]: 1059 Plains Rd E, Burlington, ON L7T 4K1
          - article [ref=e620]:
            - heading "Goodlife" [level=3] [ref=e622]
            - paragraph [ref=e623]: 777 Guelph Line 2nd Floor, Burlington, ON, L7R 3N2
          - article [ref=e624]:
            - heading "Joseph Brant Hospital" [level=3] [ref=e626]
            - paragraph [ref=e627]: 1245 Lakeshore Rd, Burlington, ON, L7S 0A2
        - button "SHOW MORE" [ref=e629] [cursor=pointer]:
          - paragraph [ref=e631]: SHOW MORE
      - generic [ref=e636]:
        - img "An rendering image of the Toronto Skyline with the CN Tower and Rogers centre in the distance beyond Lake Ontario. In the foreground, there is a lush green park with lots of trees and people dotted throughout." [ref=e641]
        - generic [ref=e644]:
          - heading "Mattamy Homes in The GTA" [level=2] [ref=e645]
          - generic [ref=e646]: Discover the cultural diversity, rich heritage and vibrant energy of Canada's largest metropolitan area.
          - link "Learn More About Living in The GTA" [ref=e648] [cursor=pointer]:
            - /url: /ontario/gta
            - generic [ref=e649]: Learn More About Living in The GTA
    - contentinfo "footer" [ref=e650]:
      - generic [ref=e652]:
        - generic [ref=e653]:
          - generic [ref=e654]:
            - heading "Explore" [level=2] [ref=e655]
            - list [ref=e657]:
              - listitem [ref=e658]:
                - link "Mattamy Homes USA" [ref=e659] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/us
              - listitem [ref=e660]:
                - link "Mattamy Homes Canada" [ref=e661] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/ca
              - listitem [ref=e662]:
                - link "Design Studio" [ref=e663] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e664]:
                - link "Customer Care" [ref=e665] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e667]:
            - heading "About Mattamy" [level=2] [ref=e668]
            - list [ref=e670]:
              - listitem [ref=e671]:
                - link "About Us" [ref=e672] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e673]:
                - link "Contact Us" [ref=e674] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e675]:
                - link "Careers" [ref=e676] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e677]:
                - link "Media and Investor Relations" [ref=e678] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e680]:
            - heading "Connect With Us" [level=2] [ref=e681]
            - generic [ref=e683]:
              - link "Facebook (opens in a new tab)" [ref=e684] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomes
                - img [ref=e685]
              - link "Instagram (opens in a new tab)" [ref=e687] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomes/
                - img [ref=e688]
              - link "Youtube (opens in a new tab)" [ref=e690] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e691]
              - link "Pinterest (opens in a new tab)" [ref=e693] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e694]
              - link "Linkedin (opens in a new tab)" [ref=e696] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e697]
        - generic [ref=e700]:
          - paragraph [ref=e701]:
            - link "Accessibility" [ref=e702] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e703]: "|"
            - button "Cookie Settings" [ref=e704] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e705]: "|"
            - link "Legal Disclaimers" [ref=e706] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e707]: "|"
            - link "Privacy Policy" [ref=e708] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e709]: "|"
            - link "Terms and Conditions" [ref=e710] [cursor=pointer]:
              - /url: /terms-and-conditions
          - paragraph [ref=e711]: ©2026 Mattamy Homes
```

# Test source

```ts
  916  |   private getSubmitButton(form: Locator): Locator {
  917  |     return getLeadFormSubmitButton(form);
  918  |   }
  919  | 
  920  |   /**
  921  |    * Clicks this page's submit button - it takes a looser label - without waiting on the third-party
  922  |    * request behind it.
  923  |    */
  924  |   private async clickSubmit(form: Locator): Promise<void> {
  925  |     await clickSubmit(this.page, form, TIMEOUT.short, {
  926  |       submitButton: this.getSubmitButton(form),
  927  |       settle: (ms) => this.settle(ms),
  928  |     });
  929  |   }
  930  | 
  931  |   // Floorplan Section Helpers
  932  | 
  933  |   /** Returns the available floorplans section, or null when the page has none. */
  934  |   private async getAvailableFloorplansSection(): Promise<Locator | null> {
  935  |     const heading = this.page
  936  |       .getByRole('heading', {
  937  |         name: TEXT.availableFloorplansHeading,
  938  |       })
  939  |       .first();
  940  | 
  941  |     await heading.waitFor({ state: 'attached', timeout: TIMEOUT.medium }).catch(() => undefined);
  942  | 
  943  |     if (!(await heading.count())) {
  944  |       return null;
  945  |     }
  946  | 
  947  |     const section = this.page.locator('section').filter({ has: heading }).first();
  948  | 
  949  |     if (await section.count()) {
  950  |       return section;
  951  |     }
  952  | 
  953  |     return heading.locator('xpath=ancestor::div[1]');
  954  |   }
  955  | 
  956  |   /** Checks the floorplan links in a section and records them in the report. */
  957  |   private async verifyAvailableFloorplanLinks(
  958  |     section: Locator,
  959  |     condoCommunityPath: string,
  960  |   ): Promise<void> {
  961  |     const links = section.locator('a[href]');
  962  |     const linkCount = await links.count();
  963  |     const loggedHrefs = new Set<string>();
  964  |     // A quick move-in card sits two segments below the community (/community/plan/address); it
  965  |     // belongs to the hidden Quick Move-In Homes tab, not to this listing.
  966  |     const qmiCardPath = new RegExp(`^${escapeRegex(condoCommunityPath)}/[^/]+/[^/]+$`, 'i');
  967  |     let floorplanLinkCount = 0;
  968  | 
  969  |     for (let i = 0; i < linkCount; i++) {
  970  |       const link = links.nth(i);
  971  |       const linkText = (await link.innerText().catch(() => '')).trim();
  972  |       const href = await link.getAttribute('href');
  973  | 
  974  |       if (TEXT.viewAll.test(linkText) || isIgnorableHref(href)) {
  975  |         continue;
  976  |       }
  977  | 
  978  |       const pathname = getPathnameFromHref(href!, this.page.url());
  979  | 
  980  |       if (loggedHrefs.has(pathname) || qmiCardPath.test(pathname)) {
  981  |         continue;
  982  |       }
  983  | 
  984  |       loggedHrefs.add(pathname);
  985  |       floorplanLinkCount++;
  986  | 
  987  |       // Attached, not visible: this section renders as a horizontally scrolling
  988  |       // carousel once the community has more floorplans than fit the track, and
  989  |       // its off-track slides are legitimately hidden. Requiring every slide to be
  990  |       // visible failed on exactly that (link 3 resolved, reported hidden, retried
  991  |       // 13x). Visibility of the module itself is asserted once, below.
  992  |       await expect(link, `Floorplan link ${floorplanLinkCount} should be attached`).toBeAttached({
  993  |         timeout: TIMEOUT.short,
  994  |       });
  995  |       expect(href, `Floorplan link ${floorplanLinkCount} href missing`).toBeTruthy();
  996  |       expect(
  997  |         pathname,
  998  |         `Floorplan link ${floorplanLinkCount} should contain condo community path`,
  999  |       ).toContain(condoCommunityPath);
  1000 | 
  1001 |       const planName = this.getPlanNameFromHref(href!);
  1002 | 
  1003 |       await this.reportValue(`${floorplanLinkCount}. ${planName}`, this.buildFullUrl(href!));
  1004 |     }
  1005 | 
  1006 |     expect(
  1007 |       floorplanLinkCount,
  1008 |       'Explore available floorplans should include at least one floorplan link',
  1009 |     ).toBeGreaterThan(0);
  1010 | 
  1011 |     // The module has to be on screen, not just in the DOM - asserted on the first
  1012 |     // floorplan link, which the carousel always keeps on its visible track.
  1013 |     await expect(
  1014 |       links.filter({ hasNotText: TEXT.viewAll }).first(),
  1015 |       'Explore available floorplans should render at least one visible floorplan link',
> 1016 |     ).toBeVisible({ timeout: TIMEOUT.short });
       |       ^ Error: Explore available floorplans should render at least one visible floorplan link
  1017 | 
  1018 |     await this.reportValue(`Validated ${floorplanLinkCount} condo floorplan link(s)`);
  1019 |   }
  1020 | 
  1021 |   /** Follows the floorplans View All link and checks where it lands. */
  1022 |   private async verifyAvailableFloorplansViewAll(
  1023 |     section: Locator,
  1024 |     expectedCommunity: string,
  1025 |   ): Promise<void> {
  1026 |     // Visible only: with QMI inventory the section also holds the Quick Move-In Homes tab's own
  1027 |     // View All, hidden while the Floorplans tab is selected.
  1028 |     const viewAllLink = section
  1029 |       .locator('a[href]')
  1030 |       .filter({
  1031 |         hasText: TEXT.viewAll,
  1032 |         visible: true,
  1033 |       })
  1034 |       .first();
  1035 | 
  1036 |     await expect(viewAllLink, 'Explore available floorplans View All link missing').toBeVisible({
  1037 |       timeout: TIMEOUT.short,
  1038 |     });
  1039 | 
  1040 |     const href = await viewAllLink.getAttribute('href');
  1041 | 
  1042 |     expect(href, 'Explore available floorplans View All href missing').toBeTruthy();
  1043 |     expect(
  1044 |       href,
  1045 |       'Explore available floorplans View All should not be an anchor/contact link',
  1046 |     ).not.toMatch(/^(#|mailto:|tel:|javascript:)/i);
  1047 | 
  1048 |     await this.reportValue('View All floorplans CTA URL', href);
  1049 | 
  1050 |     await Promise.all([this.page.waitForLoadState('domcontentloaded'), viewAllLink.click()]);
  1051 | 
  1052 |     await this.waitForPageReady();
  1053 |     await expect(this.page, 'View All should redirect to Find Your Home/search page').toHaveURL(
  1054 |       /\/search|find-your-home/i,
  1055 |     );
  1056 | 
  1057 |     // Read the query through URLSearchParams rather than decoding the raw URL: the search page
  1058 |     // re-writes its query with spaces as "+", which percent-decoding leaves in place, so a URL that
  1059 |     // does carry "Martha James Condominiums" reads as though it carries nothing and the check falls
  1060 |     // through to the page text - which on a phone lists no cards to read it from.
  1061 |     const expectedCommunityText = expectedCommunity.toLowerCase();
  1062 |     const carriesCommunity = [...new URL(this.page.url()).searchParams.values()].some((value) =>
  1063 |       value.toLowerCase().includes(expectedCommunityText),
  1064 |     );
  1065 | 
  1066 |     if (carriesCommunity) {
  1067 |       await this.reportValue('View All search filters by condo community', this.page.url());
  1068 | 
  1069 |       return;
  1070 |     }
  1071 | 
  1072 |     await expect(this.body, 'FYH page should contain the condo community name').toContainText(
  1073 |       new RegExp(escapeRegex(expectedCommunity), 'i'),
  1074 |       {
  1075 |         timeout: TIMEOUT.long,
  1076 |       },
  1077 |     );
  1078 |   }
  1079 | 
  1080 |   // Shared Helpers
  1081 | 
  1082 |   /** Checks a field is visible, but only when the form renders it. */
  1083 |   private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
  1084 |     if (await field.count()) {
  1085 |       await expect(field.first(), `${label} field should be visible`).toBeVisible({
  1086 |         timeout: TIMEOUT.short,
  1087 |       });
  1088 |     }
  1089 |   }
  1090 | 
  1091 |   /** Checks the main heading contains this text. */
  1092 |   private async expectHeadingContains(expectedText: string): Promise<void> {
  1093 |     await expect(this.heading).toContainText(new RegExp(escapeRegex(expectedText), 'i'));
  1094 |   }
  1095 | 
  1096 |   /** Builds a readable plan name from a floorplan URL. */
  1097 |   private getPlanNameFromHref(href: string): string {
  1098 |     const pathname = getPathnameFromHref(href, this.page.url());
  1099 |     const slug = pathname.split('/').filter(Boolean).pop();
  1100 | 
  1101 |     return slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Condo plan';
  1102 |   }
  1103 | }
  1104 | 
```