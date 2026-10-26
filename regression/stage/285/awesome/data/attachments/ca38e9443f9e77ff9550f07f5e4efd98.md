# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: condoCommunity.spec.ts >> Condo Community Detail - CAN >> Navigation and CTAs >> @regression | CAN | Validate primary register/contact CTAs
- Location: tests/condoCommunity.spec.ts:84:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('a, button').filter({ hasText: /register|contact|request|schedule|book|learn more/i }).first()
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('a, button').filter({ hasText: /register|contact|request|schedule|book|learn more/i }).first()
    13 × locator resolved to <a id="Contact Us" href="/contact" aria-label="Contact Us" class="Header__Link-sc-1j2i34t-6 iLJFLL font-normal font-trade-gothic-20 uppercase text-center text-white">…</a>
       - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
        - generic [ref=e26]: Martha James Condominiums
        - generic [ref=e27]:
          - link [ref=e28] [cursor=pointer]:
            - generic [ref=e29]: Contact Us
          - link [ref=e30] [cursor=pointer]:
            - generic [ref=e31]: Get Information
      - generic [ref=e34]:
        - paragraph [ref=e35]: Sold Out
        - heading "Martha James Condominiums" [level=1] [ref=e37]
        - generic [ref=e38]: Introducing Martha James Condominiums, premiere condo living just steps from the majestic waterfront and lively Downtown Burlington.
        - button "Stay updated about this community" [ref=e39] [cursor=pointer]:
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
                - button "Show more" [ref=e90] [cursor=pointer]: More+
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
            - textbox [ref=e146]
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
        - generic [ref=e215]:
          - generic [ref=e218]:
            - link "GTU_MarthaJames_Floorplan_M1BD_Suite1002" [ref=e221]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m1bd
              - img "GTU_MarthaJames_Floorplan_M1BD_Suite1002" [ref=e224]
            - link "View M1bd information.Condominium 578-579 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e226]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m1bd
              - generic [ref=e227]: M1bd
              - generic [ref=e228]: Condominium
              - generic [ref=e231]:
                - paragraph [ref=e233]: 578-579 Sq. Ft.|1 Bed|1 Bath
                - generic [ref=e234]:
                  - paragraph
                - paragraph [ref=e236]: Inquire for Pricing
            - button "Mark as favorite" [ref=e237] [cursor=pointer]:
              - img "Favorite Icon" [ref=e238]
          - generic [ref=e242]:
            - link "GTU_MarthaJames_Floorplan_M2AD-Suite505" [ref=e245]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m2ad
              - img "GTU_MarthaJames_Floorplan_M2AD-Suite505" [ref=e248]
            - link "View M2ad information.Condominium 946 Sq. Ft. 2 Beds 2 Baths 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e250]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m2ad
              - generic [ref=e251]: M2ad
              - generic [ref=e252]: Condominium
              - generic [ref=e255]:
                - paragraph [ref=e257]: 946 Sq. Ft.|2 Beds|2 Baths
                - generic [ref=e258]:
                  - paragraph
                - paragraph [ref=e260]: Inquire for Pricing
            - button "Mark as favorite" [ref=e261] [cursor=pointer]:
              - img "Favorite Icon" [ref=e262]
          - generic [ref=e266]:
            - link "GTU_MarthaJames_Floorplan_MJ1B-Suite1002" [ref=e269]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1b
              - img "GTU_MarthaJames_Floorplan_MJ1B-Suite1002" [ref=e272]
            - link "View Mj1b information.Condominium 529 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e274]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1b
              - generic [ref=e275]: Mj1b
              - generic [ref=e276]: Condominium
              - generic [ref=e279]:
                - paragraph [ref=e281]: 529 Sq. Ft.|1 Bed|1 Bath
                - generic [ref=e282]:
                  - paragraph
                - paragraph [ref=e284]: Inquire for Pricing
            - button "Mark as favorite" [ref=e285] [cursor=pointer]:
              - img "Favorite Icon" [ref=e286]
          - generic [ref=e290]:
            - link "GTU_MarthaJames_Floorplan_MJ1F-Suite211" [ref=e293]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1f
              - img "GTU_MarthaJames_Floorplan_MJ1F-Suite211" [ref=e296]
            - link "View Mj1f information.Condominium 566 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage Inquire for Pricing" [ref=e298]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1f
              - generic [ref=e299]: Mj1f
              - generic [ref=e300]: Condominium
              - generic [ref=e303]:
                - paragraph [ref=e305]: 566 Sq. Ft.|1 Bed|1 Bath
                - generic [ref=e306]:
                  - paragraph
                - paragraph [ref=e308]: Inquire for Pricing
            - button "Mark as favorite" [ref=e309] [cursor=pointer]:
              - img "Favorite Icon" [ref=e310]
          - generic [ref=e312]:
            - link "View all" [ref=e313] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
              - generic [ref=e314]: View all
            - paragraph [ref=e315]: Showing 4 of 4 floorplans
      - generic [ref=e318]:
        - heading "Calendly field validation" [level=2] [ref=e319]
        - generic [ref=e320]:
          - button "Video Test" [ref=e322] [cursor=pointer]:
            - generic [ref=e323]: Video Test
          - button "In Person" [ref=e324] [cursor=pointer]:
            - generic [ref=e325]: In Person
      - generic [ref=e327]:
        - heading "Your destination - for work, play and life" [level=2] [ref=e328]
        - generic [ref=e329]:
          - article [ref=e330]:
            - heading "Community Garden" [level=3] [ref=e332]
            - paragraph [ref=e333]: Let your green thumb thrive at the rooftop community garden.
          - article [ref=e334]:
            - heading "Connectivity" [level=3] [ref=e336]
            - paragraph [ref=e337]: Access to major highways and the Burlington GO Station makes commuting a breeze.
          - article [ref=e338]:
            - heading "Fitness Centre" [level=3] [ref=e340]
            - paragraph [ref=e341]: Enjoy morning yoga on the rooftop or weights in the fitness studio.
          - article [ref=e342]:
            - heading "Nature" [level=3] [ref=e344]
            - paragraph [ref=e345]: Minutes from the majestic Brant Pier and surrounded by parks and trails.
          - article [ref=e346]:
            - heading "Rooftop Lounge" [level=3] [ref=e348]
            - paragraph [ref=e349]: Entertain with outdoor BBQs on the stunning rooftop.
          - article [ref=e350]:
            - heading "Social Lounge" [level=3] [ref=e352]
            - paragraph [ref=e353]: Transitions from dynamic coworking space during the day to the ideal entertainment spot for family and friends.
      - generic [ref=e354]:
        - generic [ref=e357]:
          - img "The exterior of Martha James Condominiums, surrounded by green space and roads." [ref=e363]
          - generic [ref=e367]:
            - heading "Everyday Perfection" [level=2] [ref=e368]
            - generic [ref=e370]:
              - paragraph [ref=e371]: Meticulously designed, Martha James Condominiums introduces elegance to your everyday living. Open-concept suites with airy 9’ ceilings and thoughtfully designed floorplans with beautifully refined finishes will inspire life to unfold splendidly. Drawing you and your visitors into a warm welcome, the impressive lobby and concierge service makes a stunning statement.
              - paragraph [ref=e372]: Wake up to sun salutations on the rooftop, let your green thumb thrive in the community garden or get your sweat on in the performance inducing fitness studio. The flexible, well-appointed social lounge takes working from home to the next level and seamlessly transitions into the ideal spot to entertain. The rooftop lounge with expansive lake views provides the perfect backdrop for, alfresco dining or simply unwinding.
        - generic [ref=e375]:
          - img "A couple biking alongside the water." [ref=e381]
          - generic [ref=e385]:
            - heading "The Charm of Burlington" [level=2] [ref=e386]
            - generic [ref=e387]: The spectacular lakefront, abundance of lush parks and trails, easy access to GO Transit and major highways, and family-friendly neighbourhoods have made Burlington one of the most desired cities in the GTHA. Toronto is a short 40-minute commute, perfect for those seeking a quiet life with all the conveniences of an urban setting.
        - generic [ref=e390]:
          - img "The exterior of Martha James Condominiums, surrounded by green space and roads." [ref=e396]
          - generic [ref=e400]:
            - heading "Martha James Brochure" [level=2] [ref=e401]
            - generic [ref=e402]: Learn more about Martha James Condominiums, the surrounding community, and imagine your life here!
            - link "Discover Martha James" [ref=e404] [cursor=pointer]:
              - /url: /dfsmedia/a2b99d47a71047839a5a4241f44710ce/98988-source/gtu-marthajames-brochure
              - generic [ref=e405]: Discover Martha James
      - generic [ref=e407]:
        - heading "Thoughtfully designed with you in mind" [level=2] [ref=e408]
        - generic [ref=e409]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e411]:
          - radiogroup "Content type" [ref=e413]:
            - generic [ref=e414] [cursor=pointer]:
              - text: Community Gallery
              - img [ref=e415]
            - paragraph [ref=e417]: Slide has changed view to 0
          - button "Community Gallery" [ref=e418] [cursor=pointer]
          - generic [ref=e419]:
            - generic [ref=e424]:
              - button [ref=e429] [cursor=pointer]
              - button "The lobby of Martha James with a large window, seating, and a white marble service desk." [ref=e434] [cursor=pointer]
              - button [ref=e439] [cursor=pointer]
              - button [ref=e444] [cursor=pointer]
              - button [ref=e449] [cursor=pointer]
              - button [ref=e454] [cursor=pointer]
              - button [ref=e459] [cursor=pointer]
              - button [ref=e464] [cursor=pointer]
              - button [ref=e469] [cursor=pointer]
              - button [ref=e474] [cursor=pointer]
              - button [ref=e479] [cursor=pointer]
              - button [ref=e484] [cursor=pointer]
              - button [ref=e489] [cursor=pointer]
              - button [ref=e494] [cursor=pointer]
              - button [ref=e499] [cursor=pointer]
              - button [ref=e504] [cursor=pointer]
              - button [ref=e509] [cursor=pointer]
            - generic [ref=e511]: Lobby
            - paragraph [ref=e513]:
              - generic [ref=e514]: Slide number
              - text: 1/15
      - generic [ref=e516]:
        - heading "Conveniently located to fit your needs" [level=2] [ref=e517]
        - generic [ref=e518]:
          - article [ref=e519]:
            - heading "Brant Street Pier" [level=3] [ref=e521]
            - paragraph [ref=e522]: 1400 Lakeshore Rd., Burlington, ON, L7S 1Y2
          - article [ref=e523]:
            - heading "Burlington Golf & Country Club" [level=3] [ref=e525]
            - paragraph [ref=e526]: 422 North Shore Blvd E, Burlington, ON, L7T 1W9
          - article [ref=e527]:
            - heading "Burlington Go Station" [level=3] [ref=e529]
            - paragraph [ref=e530]: 2101 Fairview St, Burlington, ON L7R 2C8
          - article [ref=e531]:
            - heading "The Burlington Performing Arts Centre" [level=3] [ref=e533]
            - paragraph [ref=e534]: 440 Locust St, Burlington, ON L7S 1T7
          - article [ref=e535]:
            - heading "Central Public School" [level=3] [ref=e537]
            - paragraph [ref=e538]: 638 Brant St, Burlington, ON, L7R 2H2
          - article [ref=e539]:
            - heading "Fortinos" [level=3] [ref=e541]
            - paragraph [ref=e542]: 1059 Plains Rd E, Burlington, ON L7T 4K1
          - article [ref=e543]:
            - heading "Goodlife" [level=3] [ref=e545]
            - paragraph [ref=e546]: 777 Guelph Line 2nd Floor, Burlington, ON, L7R 3N2
          - article [ref=e547]:
            - heading "Joseph Brant Hospital" [level=3] [ref=e549]
            - paragraph [ref=e550]: 1245 Lakeshore Rd, Burlington, ON, L7S 0A2
          - article [ref=e551]:
            - heading "Kelly's Bake Shoppe" [level=3] [ref=e553]
            - paragraph [ref=e554]: 401 Brant St, Burlington, ON, L7R 2E9
        - button "SHOW MORE" [ref=e556] [cursor=pointer]:
          - paragraph [ref=e558]: SHOW MORE
      - generic [ref=e562]:
        - img "An rendering image of the Toronto Skyline with the CN Tower and Rogers centre in the distance beyond Lake Ontario. In the foreground, there is a lush green park with lots of trees and people dotted throughout." [ref=e568]
        - generic [ref=e573]:
          - heading "Mattamy Homes in The GTA" [level=2] [ref=e574]
          - generic [ref=e575]: Discover the cultural diversity, rich heritage and vibrant energy of Canada's largest metropolitan area.
          - link "Learn More About Living in The GTA" [ref=e577] [cursor=pointer]:
            - /url: /ontario/gta
            - generic [ref=e578]: Learn More About Living in The GTA
    - contentinfo "footer" [ref=e579]:
      - generic [ref=e581]:
        - generic [ref=e582]:
          - generic [ref=e583]:
            - heading "Explore" [level=2] [ref=e584]
            - list [ref=e586]:
              - listitem [ref=e587]:
                - link "Mattamy Homes USA" [ref=e588]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e589]:
                - link "Mattamy Homes Canada" [ref=e590]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e591]:
                - link "Design Studio" [ref=e592]:
                  - /url: /design-studio
              - listitem [ref=e593]:
                - link "Customer Care" [ref=e594]:
                  - /url: /customer-care
          - generic [ref=e596]:
            - heading "About Mattamy" [level=2] [ref=e597]
            - list [ref=e599]:
              - listitem [ref=e600]:
                - link "About Us" [ref=e601]:
                  - /url: /about/about-mattamy
              - listitem [ref=e602]:
                - link "Contact Us" [ref=e603]:
                  - /url: /contact
              - listitem [ref=e604]:
                - link "Careers" [ref=e605]:
                  - /url: /about/careers
              - listitem [ref=e606]:
                - link "Media and Investor Relations" [ref=e607]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e609]:
            - heading "Connect With Us" [level=2] [ref=e610]
            - generic [ref=e612]:
              - link "Facebook (opens in a new tab)" [ref=e613]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e614]
              - link "Instagram (opens in a new tab)" [ref=e616]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e617]
              - link "Youtube (opens in a new tab)" [ref=e619]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e620]
              - link "Pinterest (opens in a new tab)" [ref=e622]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e623]
              - link "Linkedin (opens in a new tab)" [ref=e625]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e626]
        - generic [ref=e629]:
          - paragraph [ref=e630]:
            - link "Accessibility" [ref=e631]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e632]: "|"
            - button "Cookie Settings" [ref=e633] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e634]: "|"
            - link "Legal Disclaimers" [ref=e635]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e636]: "|"
            - link "Privacy Policy" [ref=e637]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e638]: "|"
            - link "Terms and Conditions" [ref=e639]:
              - /url: /terms-and-conditions
          - paragraph [ref=e640]: ©2024 Mattamy Homes
```

# Test source

```ts
  202 |   // Search and Page Load
  203 | 
  204 |   /** Searches for a condo community from the home page search box. */
  205 |   async searchByCondoCommunity(condoCommunity: string): Promise<void> {
  206 |     await super.searchByCondoCommunity(condoCommunity);
  207 |   }
  208 | 
  209 |   /** Checks the search lands on the right condo community page. */
  210 |   async verifySearchByCondoCommunity(expectedCommunity: string): Promise<void> {
  211 |     await this.step(`Verify condo community search redirects to ${expectedCommunity}`, async () => {
  212 |       await this.waitForPageReady();
  213 | 
  214 |       await expect(this.heading).toBeVisible({ timeout: TIMEOUT.long });
  215 |       await this.expectHeadingContains(expectedCommunity);
  216 |       await expect(this.page).not.toHaveURL(/\?country=/i);
  217 |     });
  218 |   }
  219 | 
  220 |   // Page Content Validation
  221 | 
  222 |   /** Checks the hero names this community and reads as condo content. */
  223 |   async verifyHeroContent(expectedCommunity: string): Promise<void> {
  224 |     await this.step(`Verify hero content for ${expectedCommunity}`, async () => {
  225 |       await this.expectHeadingContains(expectedCommunity);
  226 |       await expect(this.hero).toBeVisible({ timeout: TIMEOUT.medium });
  227 |       await expect(this.body).toContainText(TEXT.condoHero, { timeout: TIMEOUT.medium });
  228 |     });
  229 |   }
  230 | 
  231 |   /** Checks the page shows its content section headings. */
  232 |   async verifyCondoPageSections(): Promise<void> {
  233 |     await this.step('Verify condo community section headings', async () => {
  234 |       const sectionHeadings = this.page.getByRole('heading', {
  235 |         name: TEXT.sectionHeading,
  236 |       });
  237 | 
  238 |       const count = await sectionHeadings.count();
  239 | 
  240 |       expect(count, 'Condo community page should include content section headings').toBeGreaterThan(
  241 |         0,
  242 |       );
  243 | 
  244 |       for (let i = 0; i < Math.min(count, 8); i++) {
  245 |         await expect(sectionHeadings.nth(i)).toBeVisible({ timeout: TIMEOUT.short });
  246 |       }
  247 |     });
  248 |   }
  249 | 
  250 |   /** Checks the page carries condo-specific copy and navigation. */
  251 |   async verifyCondoSpecificContent(): Promise<void> {
  252 |     await this.step('Verify condo-specific content and navigation', async () => {
  253 |       await expect(this.body).toContainText(TEXT.condo, { timeout: TIMEOUT.short });
  254 | 
  255 |       const condoRelatedLinks = this.navLinks.filter({
  256 |         hasText: TEXT.condoLink,
  257 |       });
  258 | 
  259 |       expect(
  260 |         await condoRelatedLinks.count(),
  261 |         'Condo community page should include condo-related navigation or CTAs',
  262 |       ).toBeGreaterThan(0);
  263 |     });
  264 |   }
  265 | 
  266 |   /** Checks every navigation link points somewhere real. */
  267 |   async verifyAllNavigationLinks(): Promise<void> {
  268 |     await this.step('Verify all navigation links have usable href', async () => {
  269 |       const linkCount = await this.navLinks.count();
  270 | 
  271 |       expect(linkCount, 'Condo community page should contain links').toBeGreaterThan(0);
  272 | 
  273 |       let validatedLinks = 0;
  274 | 
  275 |       for (let i = 0; i < linkCount; i++) {
  276 |         const href = await this.navLinks.nth(i).getAttribute('href');
  277 | 
  278 |         if (isIgnorableHref(href)) {
  279 |           continue;
  280 |         }
  281 | 
  282 |         expect(href, `Navigation link ${i + 1} href missing`).toBeTruthy();
  283 |         expect(href, `Navigation link ${i + 1} should not be javascript`).not.toMatch(
  284 |           /^javascript:/i,
  285 |         );
  286 | 
  287 |         validatedLinks++;
  288 |         await this.reportValue(`Nav link ${validatedLinks}`, this.buildFullUrl(href));
  289 |       }
  290 |     });
  291 |   }
  292 | 
  293 |   /** Checks the main register or contact CTA is on screen. */
  294 |   async verifyPrimaryCtas(): Promise<void> {
  295 |     await this.step('Verify primary register/contact CTA', async () => {
  296 |       const ctaCount = await this.registerOrContactButtons.count();
  297 | 
  298 |       expect(ctaCount, 'Condo community page should include register/contact CTAs').toBeGreaterThan(
  299 |         0,
  300 |       );
  301 | 
> 302 |       await expect(this.registerOrContactButtons.first()).toBeVisible({
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  303 |         timeout: TIMEOUT.short,
  304 |       });
  305 |     });
  306 |   }
  307 | 
  308 |   /** Checks the page talks about suites or floorplans. */
  309 |   async verifySuiteOrFloorplanContent(): Promise<void> {
  310 |     await this.step('Verify suite or floorplan content', async () => {
  311 |       const suiteContent = this.page.locator('section, div').filter({
  312 |         hasText: /suite|floorplan|floor plan|bedroom|bath|sq\.?\s*ft/i,
  313 |       });
  314 | 
  315 |       expect(
  316 |         await suiteContent.count(),
  317 |         'Condo community page should include suite or floorplan content',
  318 |       ).toBeGreaterThan(0);
  319 |     });
  320 |   }
  321 | 
  322 |   /** Checks the floorplans section lists plans and its View All link works. */
  323 |   async verifyAvailableFloorplansSection(expectedCommunity: string): Promise<void> {
  324 |     await this.step('Verify available floorplans section', async () => {
  325 |       await this.waitForPageReady();
  326 | 
  327 |       const section = await this.requireFeature(
  328 |         await this.getAvailableFloorplansSection(),
  329 |         'condoCommunity.availableFloorplansSection',
  330 |         'Explore available floorplans section',
  331 |       );
  332 | 
  333 |       if (!section) {
  334 |         return;
  335 |       }
  336 | 
  337 |       await section.scrollIntoViewIfNeeded();
  338 |       await this.waitForPageReady();
  339 |       await expect(section).toBeVisible({ timeout: TIMEOUT.short });
  340 | 
  341 |       const condoCommunityPath = getPathnameFromHref(this.page.url());
  342 | 
  343 |       await this.verifyAvailableFloorplanLinks(section, condoCommunityPath);
  344 |       await this.verifyAvailableFloorplansViewAll(section, expectedCommunity);
  345 |     });
  346 |   }
  347 | 
  348 |   /** Checks the gallery opens, moves between media and closes again. */
  349 |   async verifyGalleryModal(): Promise<void> {
  350 |     await this.step('Verify gallery modal if available', async () => {
  351 |       if (
  352 |         !(await this.isFeaturePresent(
  353 |           this.gallerySection,
  354 |           'condoCommunity.galleryModal',
  355 |           'Condo community gallery',
  356 |         ))
  357 |       ) {
  358 |         return;
  359 |       }
  360 | 
  361 |       await this.gallerySection.scrollIntoViewIfNeeded();
  362 |       await expect(this.gallerySection, 'Condo community gallery should be visible').toBeVisible({
  363 |         timeout: TIMEOUT.short,
  364 |       });
  365 | 
  366 |       const galleryImages = this.gallerySection.locator('img');
  367 |       const galleryImageCount = await galleryImages.count();
  368 | 
  369 |       expect(galleryImageCount, 'Condo community gallery should include media').toBeGreaterThan(0);
  370 | 
  371 |       const firstImage = galleryImages.first();
  372 |       await expect(firstImage, 'First condo community gallery image should be visible').toBeVisible(
  373 |         { timeout: TIMEOUT.short },
  374 |       );
  375 |       expect(
  376 |         await firstImage.getAttribute('src'),
  377 |         'First condo community gallery image src missing',
  378 |       ).toBeTruthy();
  379 | 
  380 |       if (!(await isLocatorVisible(this.galleryModalOpenButton, 5000))) {
  381 |         await this.reportValue(
  382 |           'Condo community gallery modal open button not present - skipping modal open validation',
  383 |         );
  384 |         return;
  385 |       }
  386 | 
  387 |       await this.galleryModalOpenButton.click();
  388 | 
  389 |       if (!(await isLocatorVisible(this.galleryModal, 5000))) {
  390 |         await this.reportValue(
  391 |           'Condo community gallery is available as an in-page carousel; modal not present - validating carousel navigation only',
  392 |         );
  393 |         await this.navigateInPageGalleryMediaIfAvailable();
  394 |         return;
  395 |       }
  396 | 
  397 |       await expect(this.galleryModal, 'Condo community gallery modal should open').toBeVisible({
  398 |         timeout: TIMEOUT.short,
  399 |       });
  400 |       await expect(
  401 |         this.galleryModal.locator('img, video, iframe, picture').first(),
  402 |         'Gallery modal should show media',
```