# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: condoCommunity.spec.ts >> Condo Community Detail - CAN >> Lead Form >> Primary Condo Form Validation >> @smoke @regression | CAN | Validate primary condo form required field errors
- Location: tests/condoCommunity.spec.ts:143:11

# Error details

```
TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('form:not([role="dialog"] *):not(.ReactModal__Content *):not([id*="ModalForm"] *)').filter({ has: locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")') }).filter({ has: locator('input, select, textarea') }).first().locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")').first()
    - locator resolved to <button class="" type="submit" value="SUBMIT" id="fxb_6d1644d6-a1f4-4242-9e2e-23b9a6572f8d_beb8f9c3-9c49-44cc-a53c-eb8431af394d" name="fxb.6d1644d6-a1f4-4242-9e2e-23b9a6572f8d.beb8f9c3-9c49-44cc-a53c-eb8431af394d">SUBMIT</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div role="dialog" aria-modal="true" class="flex justify-center items-center bg-black-faded w-screen h-screen">…</div> from <div class="ReactModalPortal">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div role="dialog" aria-modal="true" class="flex justify-center items-center bg-black-faded w-screen h-screen">…</div> from <div class="ReactModalPortal">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    9 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div role="dialog" aria-modal="true" class="flex justify-center items-center bg-black-faded w-screen h-screen">…</div> from <div class="ReactModalPortal">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e6]:
    - generic [ref=e10]: I am a banner!
  - generic [ref=e12]:
    - banner [ref=e13]:
      - generic [ref=e14]:
        - link "Martha James Condominiums Mattamy logo in Burlington Ontario by Mattamy Homes. Go to HomePage" [ref=e15] [cursor=pointer]:
          - /url: /
          - figure [ref=e16]:
            - img "Martha James Condominiums Mattamy logo in Burlington Ontario by Mattamy Homes" [ref=e17]
        - navigation [ref=e18]
        - generic [ref=e19]:
          - button "Go to Favorites Page" [ref=e20] [cursor=pointer]:
            - img "Favorite Icon" [ref=e21]
          - button "Select your country. CANADA country is selected" [ref=e26] [cursor=pointer]:
            - generic [ref=e28]: CANADA
            - img [ref=e30]
    - link "Navigate to Top." [ref=e32] [cursor=pointer]:
      - img [ref=e33]
    - main [ref=e35]:
      - generic [ref=e37]:
        - generic [ref=e38]:
          - heading "Martha James Condominiums" [level=2] [ref=e39]
          - generic [ref=e40]:
            - link "Go to 1388 Dundas Street West, Oakville ON L6M 4L8. Opens in GoogleMaps" [ref=e41] [cursor=pointer]:
              - /url: https://maps.google.com/maps?q=43.453831254877,-79.756406318446
              - img "Map Location Icon" [ref=e42]
              - generic [ref=e44]:
                - text: 1388 Dundas Street West, Oakville ON L6M 4L8
                - img "OpenNewTab Icon" [ref=e45]
            - link "Call to 416-630-8282" [ref=e48] [cursor=pointer]:
              - /url: tel:4166308282
              - img "Call Icon" [ref=e49]
              - generic [ref=e51]: 416-630-8282
            - link "Email to condosales@mattamycorp.com" [ref=e52] [cursor=pointer]:
              - /url: mailto:condosales@mattamycorp.com
              - img "Mail Icon" [ref=e53]
              - generic [ref=e56]: condosales@mattamycorp.com
        - generic [ref=e57]:
          - link "Schedule Appointment" [ref=e58] [cursor=pointer]:
            - generic [ref=e59]: Schedule Appointment
          - link "Get Information" [ref=e60] [cursor=pointer]:
            - generic [ref=e61]: Get Information
      - generic [ref=e64]:
        - paragraph [ref=e65]: Sold Out
        - heading "Martha James Condominiums" [level=1] [ref=e67]
        - generic [ref=e68]: Introducing Martha James Condominiums, premiere condo living just steps from the majestic waterfront and lively Downtown Burlington.
        - button "Stay updated about this community" [ref=e69] [cursor=pointer]:
          - generic [ref=e70]: Get Information
      - region "Sales center contact and quick links" [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]: Contact Us
          - generic [ref=e76]:
            - generic [ref=e77]: 1388 Dundas Street West, Oakville, ON L6M 4L8
            - generic [ref=e78]: 416-630-8282
          - generic [ref=e79]:
            - link "Call 416-630-8282" [ref=e80] [cursor=pointer]:
              - /url: tel:4166308282
              - img "Call Icon" [ref=e81]
            - link "Email condosales@mattamycorp.com" [ref=e83] [cursor=pointer]:
              - /url: mailto:condosales@mattamycorp.com
              - img "Mail Icon" [ref=e84]
            - button "Hours" [ref=e87] [cursor=pointer]
            - link "Get directions to sales center, opens in new tab" [ref=e88] [cursor=pointer]:
              - /url: https://maps.google.com/maps?q=43.453831254877,-79.756406318446
              - img "Map Location Icon" [ref=e89]
              - generic [ref=e91]: Directions
            - button "Schedule an Appointment" [ref=e92] [cursor=pointer]
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
        - generic [ref=e93]:
          - generic [ref=e94]:
            - heading "Discover our homes" [level=3] [ref=e95]
            - paragraph [ref=e96]: Explore floorplans and quick move-in homes ready for you.
          - link "View 4 Floorplans" [ref=e98] [cursor=pointer]:
            - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
      - generic [ref=e102]:
        - img [ref=e103]
        - generic [ref=e104]:
          - heading "Condo Offer" [level=2] [ref=e105]
          - text: Offer test promo
        - generic [ref=e106]:
          - heading "Condo offer test" [level=3] [ref=e107]
          - generic [ref=e108]: testing promotion for condo
        - link "View Details" [ref=e110] [cursor=pointer]:
          - /url: /ontario/gta/promos/move-forward
          - generic [ref=e111]: View Details
      - generic [ref=e113]:
        - generic [ref=e115]:
          - 'img "Martha James Condominiums Logo: Text in cursive." [ref=e117]'
          - generic [ref=e118]:
            - heading "Welcome to Martha James Condominiums" [level=2] [ref=e119]
            - generic [ref=e120]:
              - generic [ref=e121]:
                - generic [ref=e122]: Set in a mature park side neighbourhood, steps from Brant Street and only moments from Lake Ontario, Martha James is Burlington’s most intimate new condominium. Endowed with breathtaking lake views, life-enhancing amenities, and flexible suites - Martha James is designed with you in mind. Step outside and explore the vibrant streets of...
                - button "Show more" [expanded] [ref=e123] [cursor=pointer]: More+
              - paragraph
              - paragraph
        - generic [ref=e125]:
          - paragraph [ref=e126]: Home Details
          - generic [ref=e127]:
            - img [ref=e128]
            - generic [ref=e130]:
              - generic [ref=e131]: Home Types
              - generic [ref=e132]: Condominium
          - generic [ref=e133]:
            - generic [ref=e134]:
              - img [ref=e135]
              - generic [ref=e137]:
                - generic [ref=e138]: Bedrooms
                - generic [ref=e139]: 1 to 2
            - generic [ref=e140]:
              - img [ref=e141]
              - generic [ref=e143]:
                - generic [ref=e144]: Full Bathrooms
                - generic [ref=e145]: 1 - 2
            - generic [ref=e146]:
              - img [ref=e147]
              - generic [ref=e149]:
                - generic [ref=e150]: Sq. Ft.
                - generic [ref=e151]: 529 - 946
            - generic [ref=e152]:
              - img [ref=e153]
              - generic [ref=e163]:
                - generic [ref=e164]: Stories
                - generic [ref=e165]: "1"
      - generic [ref=e171]:
        - generic [ref=e172]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e173]
          - generic [ref=e175]: Required fields are marked with *
          - separator [ref=e176]
        - group [ref=e177]:
          - generic [ref=e178]:
            - textbox "username" [ref=e179]:
              - /placeholder: ""
            - textbox "company" [ref=e180]:
              - /placeholder: ""
            - generic [ref=e181]:
              - generic [ref=e182]: First name *
              - textbox "First name" [ref=e184]:
                - /placeholder: ""
            - generic [ref=e185]:
              - generic [ref=e186]: Last name *
              - textbox "Last name" [ref=e188]:
                - /placeholder: ""
            - generic [ref=e189]:
              - generic [ref=e190]: Email *
              - textbox "Email" [ref=e192]:
                - /placeholder: ""
            - generic [ref=e193]:
              - generic [ref=e194]: Country of Residence *
              - generic [ref=e195]:
                - combobox "Country of Residence" [ref=e196] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e197]:
              - generic [ref=e198]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e200]:
                - /placeholder: ""
            - generic [ref=e201]:
              - generic [ref=e202]: Phone number
              - textbox "Phone number" [ref=e204]:
                - /placeholder: ""
            - generic [ref=e205]:
              - generic [ref=e206]: When do you want to move into your home? *
              - generic [ref=e207]:
                - combobox "When do you want to move into your home?" [ref=e208] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e209]:
              - generic [ref=e210]: Are you a first time homebuyer? *
              - generic [ref=e211]:
                - combobox "Are you a first time homebuyer?" [ref=e212] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e213]:
              - generic [ref=e214]: How many bedrooms do you need? *
              - generic [ref=e215]:
                - combobox "How many bedrooms do you need?" [ref=e216] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e217]:
              - generic [ref=e218]: What is your budget? *
              - generic [ref=e219]:
                - combobox "What is your budget?" [ref=e220] [cursor=pointer]:
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
            - generic [ref=e222] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e223]
              - generic [ref=e224]: I am a Real Estate Agent
            - generic [ref=e226] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e227]'
              - generic [ref=e228]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e229]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e230]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e231]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e232]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e233]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e235] [cursor=pointer]
      - generic [ref=e238]:
        - generic [ref=e240]:
          - heading "Explore available floorplans" [level=2] [ref=e241]
          - generic [ref=e242]: Take a look at the variety of plans this community offers.
          - link "View all" [ref=e244] [cursor=pointer]:
            - /url: /search?productType=plan&metro=Greater Toronto Area&country=CAN&community=Martha James Condominiums&hideMap=true
            - generic [ref=e245]: View all
        - generic [ref=e247]:
          - generic [ref=e250] [cursor=pointer]:
            - generic [ref=e252]:
              - paragraph [ref=e254]: Inquire for Pricing
              - img "GTU_MarthaJames_Floorplan_M1BD_Suite1002" [ref=e255]
              - button "Mark as favorite" [ref=e256]:
                - img "Favorite Icon" [ref=e257]
            - link "Martha James Condominiums Condominium M1bd 578-579 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage" [ref=e259]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m1bd
              - generic [ref=e260]: Condominium
              - generic [ref=e261]: M1bd
              - generic [ref=e262]:
                - paragraph [ref=e265]: 578-579 Sq. Ft.
                - generic [ref=e266]:
                  - paragraph [ref=e267]: 1 Bed
                  - generic [ref=e268]: "|"
                  - paragraph [ref=e269]: 1 Bath
          - generic [ref=e273] [cursor=pointer]:
            - generic [ref=e275]:
              - paragraph [ref=e277]: Inquire for Pricing
              - img "GTU_MarthaJames_Floorplan_M2AD-Suite505" [ref=e278]
              - button "Mark as favorite" [ref=e279]:
                - img "Favorite Icon" [ref=e280]
            - link "Martha James Condominiums Condominium M2ad 946 Sq. Ft. 2 Beds 2 Baths 0 Half Bath 0 Car Garage" [ref=e282]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/m2ad
              - generic [ref=e283]: Condominium
              - generic [ref=e284]: M2ad
              - generic [ref=e285]:
                - paragraph [ref=e288]: 946 Sq. Ft.
                - generic [ref=e289]:
                  - paragraph [ref=e290]: 2 Beds
                  - generic [ref=e291]: "|"
                  - paragraph [ref=e292]: 2 Baths
          - generic [ref=e296] [cursor=pointer]:
            - generic [ref=e298]:
              - paragraph [ref=e300]: Inquire for Pricing
              - img "GTU_MarthaJames_Floorplan_MJ1B-Suite1002" [ref=e301]
              - button "Mark as favorite" [ref=e302]:
                - img "Favorite Icon" [ref=e303]
            - link "Martha James Condominiums Condominium Mj1b 529 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage" [ref=e305]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1b
              - generic [ref=e306]: Condominium
              - generic [ref=e307]: Mj1b
              - generic [ref=e308]:
                - paragraph [ref=e311]: 529 Sq. Ft.
                - generic [ref=e312]:
                  - paragraph [ref=e313]: 1 Bed
                  - generic [ref=e314]: "|"
                  - paragraph [ref=e315]: 1 Bath
          - generic [ref=e319] [cursor=pointer]:
            - generic [ref=e321]:
              - paragraph [ref=e323]: Inquire for Pricing
              - img "GTU_MarthaJames_Floorplan_MJ1F-Suite211" [ref=e324]
              - button "Mark as favorite" [ref=e325]:
                - img "Favorite Icon" [ref=e326]
            - link "Martha James Condominiums Condominium Mj1f 566 Sq. Ft. 1 Bed 1 Bath 0 Half Bath 0 Car Garage" [ref=e328]:
              - /url: /ontario/gta/burlington/martha-james-condominiums/mj1f
              - generic [ref=e329]: Condominium
              - generic [ref=e330]: Mj1f
              - generic [ref=e331]:
                - paragraph [ref=e334]: 566 Sq. Ft.
                - generic [ref=e335]:
                  - paragraph [ref=e336]: 1 Bed
                  - generic [ref=e337]: "|"
                  - paragraph [ref=e338]: 1 Bath
      - generic [ref=e342]:
        - heading "Calendly field validation" [level=2] [ref=e343]
        - generic [ref=e344]:
          - button "Video Test" [ref=e346] [cursor=pointer]:
            - generic [ref=e347]: Video Test
          - button "In Person" [ref=e348] [cursor=pointer]:
            - generic [ref=e349]: In Person
      - generic [ref=e351]:
        - heading "Your destination - for work, play and life" [level=2] [ref=e352]
        - generic [ref=e353]:
          - article [ref=e354]:
            - heading "Community Garden" [level=3] [ref=e356]
            - paragraph [ref=e357]: Let your green thumb thrive at the rooftop community garden.
          - article [ref=e358]:
            - heading "Connectivity" [level=3] [ref=e360]
            - paragraph [ref=e361]: Access to major highways and the Burlington GO Station makes commuting a breeze.
          - article [ref=e362]:
            - heading "Fitness Centre" [level=3] [ref=e364]
            - paragraph [ref=e365]: Enjoy morning yoga on the rooftop or weights in the fitness studio.
          - article [ref=e366]:
            - heading "Nature" [level=3] [ref=e368]
            - paragraph [ref=e369]: Minutes from the majestic Brant Pier and surrounded by parks and trails.
          - article [ref=e370]:
            - heading "Rooftop Lounge" [level=3] [ref=e372]
            - paragraph [ref=e373]: Entertain with outdoor BBQs on the stunning rooftop.
          - article [ref=e374]:
            - heading "Social Lounge" [level=3] [ref=e376]
            - paragraph [ref=e377]: Transitions from dynamic coworking space during the day to the ideal entertainment spot for family and friends.
      - generic [ref=e378]:
        - generic [ref=e382]:
          - img "The exterior of Martha James Condominiums, surrounded by green space and roads." [ref=e387]
          - generic [ref=e390]:
            - heading "Everyday Perfection" [level=2] [ref=e391]
            - generic [ref=e393]:
              - paragraph [ref=e394]: Meticulously designed, Martha James Condominiums introduces elegance to your everyday living. Open-concept suites with airy 9’ ceilings and thoughtfully designed floorplans with beautifully refined finishes will inspire life to unfold splendidly. Drawing you and your visitors into a warm welcome, the impressive lobby and concierge service makes a stunning statement.
              - paragraph [ref=e395]: Wake up to sun salutations on the rooftop, let your green thumb thrive in the community garden or get your sweat on in the performance inducing fitness studio. The flexible, well-appointed social lounge takes working from home to the next level and seamlessly transitions into the ideal spot to entertain. The rooftop lounge with expansive lake views provides the perfect backdrop for, alfresco dining or simply unwinding.
        - generic [ref=e399]:
          - img "A couple biking alongside the water." [ref=e404]
          - generic [ref=e407]:
            - heading "The Charm of Burlington" [level=2] [ref=e408]
            - generic [ref=e409]: The spectacular lakefront, abundance of lush parks and trails, easy access to GO Transit and major highways, and family-friendly neighbourhoods have made Burlington one of the most desired cities in the GTHA. Toronto is a short 40-minute commute, perfect for those seeking a quiet life with all the conveniences of an urban setting.
        - generic [ref=e413]:
          - img "The exterior of Martha James Condominiums, surrounded by green space and roads." [ref=e418]
          - generic [ref=e421]:
            - heading "Martha James Brochure" [level=2] [ref=e422]
            - generic [ref=e423]: Learn more about Martha James Condominiums, the surrounding community, and imagine your life here!
            - link "Discover Martha James" [ref=e425] [cursor=pointer]:
              - /url: /dfsmedia/a2b99d47a71047839a5a4241f44710ce/98988-source/gtu-marthajames-brochure
              - generic [ref=e426]: Discover Martha James
      - generic [ref=e428]:
        - heading "Thoughtfully designed with you in mind" [level=2] [ref=e429]
        - generic [ref=e430]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e432]:
          - radiogroup "Content type" [ref=e434]:
            - radio "Community Gallery" [checked] [ref=e435] [cursor=pointer]:
              - paragraph [ref=e436]: Community Gallery
            - paragraph [ref=e437]: Slide has changed view to 0
          - generic [ref=e438]:
            - generic [ref=e440]:
              - button "Previous slide of Gallery" [ref=e442] [cursor=pointer]:
                - img [ref=e443]
              - generic [ref=e446]:
                - button [ref=e451] [cursor=pointer]
                - button "The lobby of Martha James with a large window, seating, and a white marble service desk." [ref=e456] [cursor=pointer]
                - button [ref=e461] [cursor=pointer]
                - button [ref=e466] [cursor=pointer]
                - button [ref=e471] [cursor=pointer]
                - button [ref=e476] [cursor=pointer]
                - button [ref=e481] [cursor=pointer]
                - button [ref=e486] [cursor=pointer]
                - button [ref=e491] [cursor=pointer]
                - button [ref=e496] [cursor=pointer]
                - button [ref=e501] [cursor=pointer]
                - button [ref=e506] [cursor=pointer]
                - button [ref=e511] [cursor=pointer]
                - button [ref=e516] [cursor=pointer]
                - button [ref=e521] [cursor=pointer]
                - button [ref=e526] [cursor=pointer]
                - button [ref=e531] [cursor=pointer]
              - button "Next slide of Gallery" [ref=e533] [cursor=pointer]:
                - img [ref=e534]
            - generic [ref=e536]: Lobby
            - paragraph [ref=e538]:
              - generic [ref=e539]: Slide number
              - text: 1/15
      - generic [ref=e541]:
        - heading "Conveniently located to fit your needs" [level=2] [ref=e542]
        - generic [ref=e543]:
          - article [ref=e544]:
            - heading "Brant Street Pier" [level=3] [ref=e546]
            - paragraph [ref=e547]: 1400 Lakeshore Rd., Burlington, ON, L7S 1Y2
          - article [ref=e548]:
            - heading "Burlington Golf & Country Club" [level=3] [ref=e550]
            - paragraph [ref=e551]: 422 North Shore Blvd E, Burlington, ON, L7T 1W9
          - article [ref=e552]:
            - heading "Burlington Go Station" [level=3] [ref=e554]
            - paragraph [ref=e555]: 2101 Fairview St, Burlington, ON L7R 2C8
          - article [ref=e556]:
            - heading "The Burlington Performing Arts Centre" [level=3] [ref=e558]
            - paragraph [ref=e559]: 440 Locust St, Burlington, ON L7S 1T7
          - article [ref=e560]:
            - heading "Central Public School" [level=3] [ref=e562]
            - paragraph [ref=e563]: 638 Brant St, Burlington, ON, L7R 2H2
          - article [ref=e564]:
            - heading "Fortinos" [level=3] [ref=e566]
            - paragraph [ref=e567]: 1059 Plains Rd E, Burlington, ON L7T 4K1
          - article [ref=e568]:
            - heading "Goodlife" [level=3] [ref=e570]
            - paragraph [ref=e571]: 777 Guelph Line 2nd Floor, Burlington, ON, L7R 3N2
          - article [ref=e572]:
            - heading "Joseph Brant Hospital" [level=3] [ref=e574]
            - paragraph [ref=e575]: 1245 Lakeshore Rd, Burlington, ON, L7S 0A2
        - button "SHOW MORE" [ref=e577] [cursor=pointer]:
          - paragraph [ref=e579]: SHOW MORE
      - generic [ref=e584]:
        - img "An rendering image of the Toronto Skyline with the CN Tower and Rogers centre in the distance beyond Lake Ontario. In the foreground, there is a lush green park with lots of trees and people dotted throughout." [ref=e589]
        - generic [ref=e592]:
          - heading "Mattamy Homes in The GTA" [level=2] [ref=e593]
          - generic [ref=e594]: Discover the cultural diversity, rich heritage and vibrant energy of Canada's largest metropolitan area.
          - link "Learn More About Living in The GTA" [ref=e596] [cursor=pointer]:
            - /url: /ontario/gta
            - generic [ref=e597]: Learn More About Living in The GTA
      - generic [ref=e603]:
        - generic [ref=e604]:
          - heading "Sign Up For Community Updates" [level=3] [ref=e605]
          - generic [ref=e607]: Required fields are marked with *
          - separator [ref=e608]
        - group [ref=e609]:
          - generic [ref=e610]:
            - textbox "username" [ref=e611]:
              - /placeholder: ""
            - textbox "company" [ref=e612]:
              - /placeholder: ""
            - generic [ref=e613]:
              - generic [ref=e614]: First name *
              - textbox "First name" [ref=e616]:
                - /placeholder: ""
            - generic [ref=e617]:
              - generic [ref=e618]: Last name *
              - textbox "Last name" [ref=e620]:
                - /placeholder: ""
            - generic [ref=e621]:
              - generic [ref=e622]: Email *
              - textbox "Email" [ref=e624]:
                - /placeholder: ""
            - generic [ref=e625]:
              - generic [ref=e626]: Country of Residence *
              - generic [ref=e627]:
                - combobox "Country of Residence" [ref=e628] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "Canada"
                  - option "United States"
                  - option "Other"
                - generic:
                  - img
            - generic [ref=e629]:
              - generic [ref=e630]: Zip/Postal Code *
              - textbox "Zip/Postal Code" [ref=e632]:
                - /placeholder: ""
            - generic [ref=e633]:
              - generic [ref=e634]: Phone number
              - textbox "Phone number" [ref=e636]:
                - /placeholder: ""
            - generic [ref=e637]:
              - generic [ref=e638]: When do you want to move into your home? *
              - generic [ref=e639]:
                - combobox "When do you want to move into your home?" [ref=e640] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "0-3 Months"
                  - option "3-6 Months"
                  - option "6-12 Months"
                  - option "12+ Months"
                - generic:
                  - img
            - generic [ref=e641]:
              - generic [ref=e642]: Are you a first time homebuyer? *
              - generic [ref=e643]:
                - combobox "Are you a first time homebuyer?" [ref=e644] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "No"
                  - option "Yes"
                - generic:
                  - img
            - generic [ref=e645]:
              - generic [ref=e646]: How many bedrooms do you need? *
              - generic [ref=e647]:
                - combobox "How many bedrooms do you need?" [ref=e648] [cursor=pointer]:
                  - option [disabled] [selected]
                  - option "1"
                  - option "2"
                  - option "3"
                  - option "4"
                  - option "5+"
                - generic:
                  - img
            - generic [ref=e649]:
              - generic [ref=e650]: What is your budget? *
              - generic [ref=e651]:
                - combobox "What is your budget?" [ref=e652] [cursor=pointer]:
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
            - generic [ref=e654] [cursor=pointer]:
              - checkbox "I am a Real Estate Agent" [ref=e655]
              - generic [ref=e656]: I am a Real Estate Agent
            - generic [ref=e658] [cursor=pointer]:
              - 'checkbox "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our SMS Privacy Policy ; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our Privacy Policy , SMS Privacy Policy , SMS Terms of Service , and/or Contact Us ." [ref=e659]'
              - generic [ref=e660]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link "SMS Privacy Policy" [ref=e661]:
                  - /url: /sms-privacy-policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link "Privacy Policy" [ref=e662]:
                  - /url: /privacy-policy
                - text: ","
                - link "SMS Privacy Policy" [ref=e663]:
                  - /url: /sms-privacy-policy
                - text: ","
                - link "SMS Terms of Service" [ref=e664]:
                  - /url: /sms-terms-of-service
                - text: ", and/or"
                - link "Contact Us" [ref=e665]:
                  - /url: /contact-us
                - text: .
            - button "SUBMIT" [ref=e667] [cursor=pointer]
    - contentinfo "footer" [ref=e668]:
      - generic [ref=e670]:
        - generic [ref=e671]:
          - generic [ref=e672]:
            - heading "Explore" [level=2] [ref=e673]
            - list [ref=e675]:
              - listitem [ref=e676]:
                - link "Find My Home" [ref=e677] [cursor=pointer]:
                  - /url: /search
              - listitem [ref=e678]:
                - link "Design Studio" [ref=e679] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e680]:
                - link "Customer Care" [ref=e681] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e683]:
            - heading "About Mattamy" [level=2] [ref=e684]
            - list [ref=e686]:
              - listitem [ref=e687]:
                - link "About Us" [ref=e688] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e689]:
                - link "Contact Us" [ref=e690] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e691]:
                - link "Careers" [ref=e692] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e693]:
                - link "Media and Investor Relations" [ref=e694] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e696]:
            - heading "Connect With Us" [level=2] [ref=e697]
            - generic [ref=e699]:
              - link "Facebook (opens in a new tab)" [ref=e700] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomesUSA
                - img [ref=e701]
              - link "Instagram (opens in a new tab)" [ref=e703] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomesusa/
                - img [ref=e704]
              - link "Youtube (opens in a new tab)" [ref=e706] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e707]
              - link "Pinterest (opens in a new tab)" [ref=e709] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e710]
              - link "Linkedin (opens in a new tab)" [ref=e712] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e713]
        - generic [ref=e716]:
          - paragraph [ref=e717]:
            - link "Accessibility" [ref=e718] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e719]: "|"
            - button "Cookie Settings" [ref=e720] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e721]: "|"
            - link "Legal Disclaimers" [ref=e722] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e723]: "|"
            - link "Privacy Policy" [ref=e724] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e725]: "|"
            - link "Terms and Conditions" [ref=e726] [cursor=pointer]:
              - /url: /terms-and-conditions
              - text: Terms and Conditions
              - generic [ref=e727]: "|"
            - link "About Us" [ref=e728] [cursor=pointer]:
              - /url: /about/about-mattamy
          - paragraph [ref=e729]: Copyright © 2025 Mattamy Homes. All rights reserved.
  - dialog [ref=e731]:
    - dialog [ref=e733]:
      - generic [ref=e734]:
        - generic [ref=e735]: Welcome to Mattamy Homes
        - generic [ref=e736]: Please tell us which country you are looking for a new home in.
        - generic [ref=e737]:
          - button "CANADA" [ref=e738] [cursor=pointer]:
            - generic [ref=e739]: CANADA
          - button "USA" [ref=e740] [cursor=pointer]:
            - generic [ref=e741]: USA
```

# Test source

```ts
  300 |  * modal trigger as a link-style element with no href. Real href anchors are excluded so this helper
  301 |  * does not follow `/contact` or `#contact` paths and accidentally validate the primary/footer form.
  302 |  *
  303 |  * Matching on visible text and non-navigating controls keeps the real side-modal trigger, the same
  304 |  * way {@link SUBMIT_BUTTON_SELECTOR} sidesteps `aria-hidden` for form lookups.
  305 |  *
  306 |  * The detail pages also render duplicates of the same CTA inside two sticky quick-action containers,
  307 |  * `#detailsBlockBar` and `#anchor-cta`. Both sit off-canvas at a negative `top` until you scroll past
  308 |  * the hero, yet still report as visible. Clicking such a copy fails with "Element is outside of the
  309 |  * viewport", and it is a `role="link"` that can navigate to /contact, so both bars are excluded here.
  310 |  *
  311 |  * The exclusion names those containers rather than `[aria-hidden="true"]`: an open React modal
  312 |  * aria-hides the whole app root, so excluding that would leave no CTAs at all on a page whose promo
  313 |  * popup has not been dismissed yet.
  314 |  */
  315 | const NOT_IN_STICKY_BAR = ':not(#detailsBlockBar *):not(#anchor-cta *)';
  316 | export const GET_INFORMATION_CTA_SELECTOR = [
  317 |   `button${NOT_IN_STICKY_BAR}`,
  318 |   `a:not([href])${NOT_IN_STICKY_BAR}`,
  319 |   `a[href=""]${NOT_IN_STICKY_BAR}`,
  320 |   `a[href^="javascript:"]${NOT_IN_STICKY_BAR}`,
  321 | ].join(', ');
  322 | 
  323 | /** Get the "Get Information" CTAs that open the lead-form modal on the given page. */
  324 | export function getInformationCtas(page: Page): Locator {
  325 |   return page.locator(GET_INFORMATION_CTA_SELECTOR).filter({ hasText: GET_INFORMATION_CTA_TEXT });
  326 | }
  327 | 
  328 | /**
  329 |  * The plan detail / QMI / condo plan modal trigger, which lives in the breadcrumb bar:
  330 |  * `<button role="link" aria-label="Get Information">` on some pages and
  331 |  * `<button role="link" aria-label="Stay Updated">` on others, sometimes next to a real `<a href>`
  332 |  * "Schedule a Self-Guided Tour" link.
  333 |  *
  334 |  * Matched by container plus {@link GET_INFORMATION_CTA_TEXT} rather than by aria-label or class: the
  335 |  * label varies between the two wordings, and the styled-component class hashes
  336 |  * (`Button__StyledButton-sc-dz2fra-0` on one page, `sc-gGKoUb` on another) are build-specific.
  337 |  * Scoping to the breadcrumb is what stops the off-canvas copies from being picked by position.
  338 |  * Callers fall back to {@link getInformationCtas} for pages without a breadcrumb CTA.
  339 |  */
  340 | export function getBreadcrumbInformationCta(page: Page): Locator {
  341 |   return page.locator('#breadcrumb button').filter({ hasText: GET_INFORMATION_CTA_TEXT });
  342 | }
  343 | 
  344 | /**
  345 |  * The community / condo community modal trigger, which lives in the hero section:
  346 |  * `<button aria-label="Stay updated about this community">Stay Updated</button>` inside
  347 |  * `#HeaderPlanPage`. Unlike the off-canvas copies it carries no `role="link"`, but the container is
  348 |  * the stable part - the label wording and the styled-component classes both vary by page.
  349 |  *
  350 |  * It renders only once the hero is scrolled into view, so a lookup straight after navigation finds
  351 |  * nothing; callers reveal it first.
  352 |  */
  353 | export function getHeroInformationCta(page: Page): Locator {
  354 |   return page.locator('#HeaderPlanPage button').filter({ hasText: GET_INFORMATION_CTA_TEXT });
  355 | }
  356 | 
  357 | /** Get the lead-form submit button. */
  358 | export function getSubmitButton(form: Locator): Locator {
  359 |   return form.locator(SUBMIT_BUTTON_SELECTOR).first();
  360 | }
  361 | 
  362 | /** Assert a field is visible only when present in the form. */
  363 | export async function expectFieldVisibleIfPresent(
  364 |   field: Locator,
  365 |   label: string,
  366 |   timeout = 10000,
  367 | ): Promise<void> {
  368 |   if (await field.count()) {
  369 |     await expect(field.first(), `${label} field should be visible`).toBeVisible({ timeout });
  370 |   }
  371 | }
  372 | 
  373 | // Submit + validation
  374 | 
  375 | /**
  376 |  * Click a form submit button without waiting on third-party submit requests.
  377 |  *
  378 |  * `options.submitButton` overrides how the submit button is resolved (some forms
  379 |  * label theirs something other than "Submit").
  380 |  * `options.settle` overrides the post-click settle behavior. Without an override,
  381 |  * the helper waits for the DOM to go quiet instead of sleeping for a fixed time.
  382 |  */
  383 | export async function clickSubmit(
  384 |   page: Page,
  385 |   form: Locator,
  386 |   timeout = 10000,
  387 |   options: {
  388 |     submitButton?: Locator;
  389 |     settle?: (ms: number) => Promise<void>;
  390 |   } = {},
  391 | ): Promise<void> {
  392 |   const submitButton = options.submitButton ?? getSubmitButton(form);
  393 | 
  394 |   await expect(submitButton, 'Submit button should be visible before clicking').toBeVisible({
  395 |     timeout,
  396 |   });
  397 |   // No force: an overlay covering Submit means the form is not actually
  398 |   // submittable, which is a finding rather than something to click through.
  399 |   // noWaitAfter stays - the third-party submit request must not be awaited.
> 400 |   await submitButton.click({
      |                      ^ TimeoutError: locator.click: Timeout 5000ms exceeded.
  401 |     noWaitAfter: true,
  402 |     timeout: 5000,
  403 |   });
  404 | 
  405 |   if (options.settle) {
  406 |     await options.settle(800);
  407 |     return;
  408 |   }
  409 | 
  410 |   await settlePageDom(page, 800);
  411 | }
  412 | 
  413 | /** Assert expected required-field messages within a lead form. */
  414 | export async function expectRequiredErrorsInForm(form: Locator, timeout = 10000): Promise<void> {
  415 |   await expect(
  416 |     form.locator('text=/Error:\\s*First name is Required|First name.*Required/i').first(),
  417 |   ).toBeVisible({ timeout });
  418 |   await expect(
  419 |     form.locator('text=/Error:\\s*Last name is Required|Last name.*Required/i').first(),
  420 |   ).toBeVisible({ timeout });
  421 |   await expect(
  422 |     form.locator('text=/Error:\\s*Email is Required|Email.*Required/i').first(),
  423 |   ).toBeVisible({ timeout });
  424 |   await expect(
  425 |     form
  426 |       .locator('text=/Error:\\s*Country of Residence is Required|Country of Residence.*Required/i')
  427 |       .first(),
  428 |   ).toBeVisible({ timeout });
  429 |   await expect(
  430 |     form
  431 |       .locator(
  432 |         'text=/Error:\\s*Zip\\/Postal Code is Required|Zip\\/Postal Code.*Required|Postal.*Required/i',
  433 |       )
  434 |       .first(),
  435 |   ).toBeVisible({ timeout });
  436 | }
  437 | 
  438 | /** Assert invalid-email validation within a lead form. */
  439 | export async function expectInvalidEmailErrorInForm(form: Locator, timeout = 10000): Promise<void> {
  440 |   await expect(
  441 |     form
  442 |       .locator('text=/valid domain name|valid email|invalid email|Error:.*Email|Email.*Invalid/i')
  443 |       .first(),
  444 |   ).toBeVisible({ timeout });
  445 | }
  446 | 
  447 | // Composite fill (getByRole-based forms)
  448 | 
  449 | export type FillLeadOptions = {
  450 |   emailName?: RegExp;
  451 |   selectCountry?: boolean;
  452 |   selectCommunity?: boolean;
  453 |   selectPlan?: boolean;
  454 |   checkConsent?: boolean;
  455 | };
  456 | 
  457 | export type SideModalFormOptions = FillLeadOptions & {
  458 |   timeout?: number;
  459 |   expectCommunity?: boolean;
  460 |   expectPlan?: boolean;
  461 | };
  462 | 
  463 | /**
  464 |  * Fill a standard getByRole-based lead form from {@link LeadFieldData}.
  465 |  * Each field is only touched when present, so the same call works for
  466 |  * forms with differing field sets.
  467 |  */
  468 | export async function fillLeadFormFields(
  469 |   form: Locator,
  470 |   data: LeadFieldData,
  471 |   options: FillLeadOptions = {},
  472 | ): Promise<void> {
  473 |   const emailName = options.emailName ?? /^email/i;
  474 | 
  475 |   await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), data.firstName);
  476 |   await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), data.lastName);
  477 |   await fillIfPresent(form.getByRole('textbox', { name: emailName }), data.email);
  478 |   await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), data.phone);
  479 |   await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), data.zip);
  480 | 
  481 |   if (options.selectCountry !== false) {
  482 |     await selectCountryIfPresent(form, data.country);
  483 |   }
  484 | 
  485 |   if (options.selectCommunity) {
  486 |     await selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community/i }).first());
  487 |   }
  488 | 
  489 |   if (options.selectPlan) {
  490 |     await selectFirstOptionIfPresent(
  491 |       form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
  492 |     );
  493 |   }
  494 | 
  495 |   if (options.checkConsent !== false) {
  496 |     await checkConsentIfPresent(form);
  497 |   }
  498 | }
  499 | 
  500 | /**
```