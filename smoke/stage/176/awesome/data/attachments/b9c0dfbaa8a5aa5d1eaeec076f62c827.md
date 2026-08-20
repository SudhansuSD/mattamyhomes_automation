# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communityPage.spec.ts >> Community Detail - Landmarke >> Lead Form >> Footer Form Validation >> @smoke @regression | USA | Validate footer form required field errors
- Location: tests/communityPage.spec.ts:153:11

# Error details

```
Error: Footer community form not present - page rendered only one in-page form
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]: TEST
      - paragraph [ref=e13]: Don't Miss Out On
    - button "Notification banner" [expanded] [ref=e14] [cursor=pointer]:
      - img [ref=e15]
  - region "notification" [ref=e19]:
    - paragraph [ref=e22]: test
    - button "Close notification banner" [ref=e23] [cursor=pointer]:
      - img "Close Icon" [ref=e24]
  - generic [ref=e27]:
    - banner [ref=e28]:
      - generic [ref=e29]:
        - link [ref=e30] [cursor=pointer]:
          - /url: /
          - figure [ref=e31]:
            - img [ref=e32]
        - navigation [ref=e33]:
          - generic [ref=e34]:
            - button [ref=e36] [cursor=pointer]:
              - paragraph [ref=e37]:
                - text: Find Your Dream Home
                - img [ref=e38]
            - generic:
              - generic:
                - generic:
                  - heading [level=3]:
                    - button:
                      - generic:
                        - text: Arizona
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Phoenix
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Tucson
                        - generic:
                          - img
                - generic:
                  - heading [level=3]:
                    - button:
                      - generic:
                        - text: Florida
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Fort Lauderdale
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Jacksonville-St. Augustine
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Naples-Fort Myers
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Orlando
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Palm Beach
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Palm City-Stuart
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Port St. Lucie
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Sarasota
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Tampa
                        - generic:
                          - img
                - generic:
                  - heading [level=3]:
                    - button:
                      - generic:
                        - text: North Carolina
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Charlotte
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Raleigh
                        - generic:
                          - img
                - generic:
                  - heading [level=3]:
                    - button:
                      - generic:
                        - text: South Carolina
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Clover
                        - generic:
                          - img
                    - button:
                      - menuitem:
                        - text: Rock Hill
                        - generic:
                          - img
                - generic:
                  - heading [level=3]:
                    - button:
                      - generic:
                        - text: Texas
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Dallas-Fort Worth
                        - generic:
                          - img
          - link [ref=e41] [cursor=pointer]:
            - /url: /design-studio
            - paragraph [ref=e42]: Design Studio
          - button [ref=e45] [cursor=pointer]:
            - paragraph [ref=e46]:
              - text: Homebuying
              - img [ref=e47]
          - link [ref=e50] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e51]: Customer Care
          - button [ref=e54] [cursor=pointer]:
            - paragraph [ref=e55]:
              - text: About
              - img [ref=e56]
          - link [ref=e59] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e60]: Contact Us
        - generic [ref=e61]:
          - button [ref=e62] [cursor=pointer]:
            - img [ref=e63]
          - button [ref=e68] [cursor=pointer]:
            - generic [ref=e70]: USA
            - img [ref=e72]
    - main [ref=e74]:
      - generic [ref=e76]:
        - generic [ref=e77]:
          - heading [level=2] [ref=e78]: Landmarke
          - generic [ref=e79]:
            - link [ref=e80] [cursor=pointer]:
              - /url: https://maps.google.com/maps?cid=662989070378364335
              - img [ref=e81]
              - generic [ref=e83]:
                - text: 38389 N. Sandpiper Court, San Tan Valley AZ 85140
                - img [ref=e84]
            - link [ref=e87] [cursor=pointer]:
              - /url: tel:6029008591
              - img [ref=e88]
              - generic [ref=e90]: 602-900-8591
            - link [ref=e91] [cursor=pointer]:
              - /url: mailto:landmarke.phx@mattamycorp.com
              - img [ref=e92]
              - generic [ref=e95]: landmarke.phx@mattamycorp.com
        - generic [ref=e96]:
          - link [ref=e97] [cursor=pointer]:
            - generic [ref=e98]: Schedule Appointment
          - link [ref=e99] [cursor=pointer]:
            - generic [ref=e100]: Get Information
      - generic [ref=e103]:
        - paragraph [ref=e104]: Now Selling
        - generic [ref=e105]:
          - heading [level=1] [ref=e106]: Landmarke
          - button [ref=e108] [cursor=pointer]:
            - img [ref=e109]
        - generic [ref=e111]: Now Selling! Masterfully designed single-family homes in a premier East Valley location.
        - button [ref=e112] [cursor=pointer]:
          - generic [ref=e113]: Get Information
      - region [ref=e116]:
        - generic [ref=e117]:
          - generic [ref=e118]: New Home Gallery
          - generic [ref=e119]:
            - generic [ref=e120]: 38389 N. Sandpiper Court, San Tan Valley, AZ 85140
            - generic [ref=e121]: 602-900-8591
          - generic [ref=e122]:
            - link [ref=e123] [cursor=pointer]:
              - /url: tel:6029008591
              - img [ref=e124]
            - link [ref=e126] [cursor=pointer]:
              - /url: mailto:landmarke.phx@mattamycorp.com
              - img [ref=e127]
            - button [ref=e130] [cursor=pointer]: Hours
            - link [ref=e131] [cursor=pointer]:
              - /url: https://maps.google.com/maps?cid=662989070378364335
              - img [ref=e132]
              - generic [ref=e134]: Directions
            - button [ref=e135] [cursor=pointer]: Schedule an Appointment
          - dialog:
            - generic:
              - generic: Mon
              - generic:
                - generic: 10:00am - 6:00pm
              - generic: Tue
              - generic:
                - generic: 10:00am - 6:00pm
              - generic: Wed
              - generic:
                - generic: 1:00pm - 6:00pm
              - generic: Thu
              - generic:
                - generic: 10:00am - 6:00pm
              - generic: Fri
              - generic:
                - generic: 10:00am - 6:00pm
              - generic: Sat
              - generic:
                - generic: 10:00am - 6:00pm
              - generic: Sun
              - generic:
                - generic: 10:00am - 6:00pm
        - generic [ref=e136]:
          - generic [ref=e137]:
            - heading [level=3] [ref=e138]: Discover our homes
            - paragraph [ref=e139]: Explore floorplans and quick move-in homes ready for you.
          - generic [ref=e140]:
            - link [ref=e141] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Phoenix&country=USA&community=Landmarke &hideMap=true
              - text: View 11 Floorplans
            - link [ref=e142] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Phoenix&country=USA&community=Landmarke &hideMap=true
              - text: View 21 Quick Move-Ins
      - generic [ref=e146]:
        - img [ref=e147]
        - generic [ref=e148]:
          - heading [level=2] [ref=e149]: 4.99%XXX APR
          - text: FHA Below-Market Rate
        - generic [ref=e150]:
          - heading [level=3] [ref=e151]: Save with a FHA below-market rate on your new home
          - generic [ref=e152]: Buy now, move now with a low fixed rate available on selected homes when using Mattamy Homes funding, LLC.
        - link [ref=e154] [cursor=pointer]:
          - /url: /arizona/phoenix/promos/hometown-heroes
          - generic [ref=e155]: View Details
      - generic [ref=e157]:
        - generic [ref=e160]:
          - heading [level=2] [ref=e161]: Designed For the Way You Live
          - generic [ref=e163]:
            - generic [ref=e164]: Coming soon to San Tan Valley, AZ! Offering brand new single-family homes from our Sapphire and Ruby Collection in a premier East Valley location. Explore single and two story floorplans spanning from 1,837 to over 3,700 square feet, that offer maximum livability and comfort. The centralized community park will offer expansive open tur...
            - button [expanded] [ref=e165] [cursor=pointer]: More+
        - generic [ref=e167]:
          - paragraph [ref=e168]: Home Details
          - generic [ref=e169]:
            - img [ref=e170]
            - generic [ref=e172]:
              - generic [ref=e173]: Home Types
              - generic [ref=e174]: Single Family
          - generic [ref=e175]:
            - generic [ref=e176]:
              - img [ref=e177]
              - generic [ref=e179]:
                - generic [ref=e180]: Bedrooms
                - generic [ref=e181]: 3 - 4
            - generic [ref=e182]:
              - img [ref=e183]
              - generic [ref=e185]:
                - generic [ref=e186]: Full Bathrooms
                - generic [ref=e187]: 2 - 3
            - generic [ref=e188]:
              - img [ref=e189]
              - generic [ref=e202]:
                - generic [ref=e203]: Half Bathrooms
                - generic [ref=e204]: "1"
            - generic [ref=e205]:
              - img [ref=e206]
              - generic [ref=e208]:
                - generic [ref=e209]: Sq. Ft.
                - generic [ref=e210]: 1837 - 3798
            - generic [ref=e211]:
              - img [ref=e212]
              - generic [ref=e222]:
                - generic [ref=e223]: Stories
                - generic [ref=e224]: 1 - 2
            - generic [ref=e225]:
              - img [ref=e226]
              - generic [ref=e233]:
                - generic [ref=e234]: Garages
                - generic [ref=e235]: 2 - 3
      - generic [ref=e241]:
        - generic [ref=e242]:
          - heading [level=3] [ref=e243]: Sign Up For Community Updates
          - generic [ref=e245]: Required fields are marked with *
          - separator [ref=e246]
        - group [ref=e247]:
          - generic [ref=e248]:
            - textbox [ref=e249]
            - textbox [ref=e250]
            - generic [ref=e251]:
              - generic [ref=e252]: First name *
              - textbox [ref=e254]
            - generic [ref=e255]:
              - generic [ref=e256]: Last name *
              - textbox [ref=e258]
            - generic [ref=e259]:
              - generic [ref=e260]: Email *
              - textbox [ref=e262]
            - generic [ref=e263]:
              - generic [ref=e264]: Country of Residence *
              - generic [ref=e265]:
                - combobox [ref=e266] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e267]:
              - generic [ref=e268]: Zip/Postal Code *
              - textbox [ref=e270]
            - generic [ref=e271]:
              - generic [ref=e272]: Phone number
              - textbox [ref=e274]
            - generic [ref=e275]:
              - generic [ref=e276]: When do you want to move into your home?
              - generic [ref=e277]:
                - combobox [ref=e278] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e279]:
              - generic [ref=e280]: How many bedrooms do you need?
              - generic [ref=e281]:
                - combobox [ref=e282] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e283]:
              - generic [ref=e284]: What is your budget?
              - generic [ref=e285]:
                - combobox [ref=e286] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e288] [cursor=pointer]:
              - checkbox [ref=e289]
              - generic [ref=e290]: I am a Real Estate Agent
            - generic [ref=e292] [cursor=pointer]:
              - checkbox [ref=e293]
              - generic [ref=e294]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link [ref=e295]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link [ref=e296]:
                  - /url: /privacy-policy
                  - text: Privacy Policy
                - text: ","
                - link [ref=e297]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: ","
                - link [ref=e298]:
                  - /url: /sms-terms-of-service
                  - text: SMS Terms of Service
                - text: ", and/or"
                - link [ref=e299]:
                  - /url: /contact-us
                  - text: Contact Us
                - text: .
            - button [ref=e301] [cursor=pointer]: SUBMIT
      - generic [ref=e304]:
        - generic [ref=e306]:
          - heading [level=2] [ref=e307]: Quick Move-In Homes ready when you are
          - generic [ref=e308]: If time is of the essence, then our Quick Move-In Homes are for you.
          - link [ref=e310] [cursor=pointer]:
            - /url: /search?productType=qmi&metro=Phoenix&country=USA&community=Landmarke &hideMap=true
            - generic [ref=e311]: View all
        - generic [ref=e312]:
          - generic [ref=e313]:
            - generic [ref=e316] [cursor=pointer]:
              - generic [ref=e318]:
                - paragraph [ref=e319]:
                  - paragraph [ref=e321]: Self-Tour
                - paragraph [ref=e324]: Ready Now
                - paragraph [ref=e326]: $429,999
                - img [ref=e327]
                - button [ref=e328]:
                  - img [ref=e329]
              - link [ref=e331]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/839-w-riparian-dr
                - generic [ref=e332]: Aqua Floorplan | Single Family
                - generic [ref=e333]: 839 W RIPARIAN DR
                - generic [ref=e334]:
                  - paragraph [ref=e337]: 1,837 Sq. Ft.
                  - generic [ref=e338]:
                    - paragraph [ref=e339]: 3 Beds
                    - generic [ref=e340]: "|"
                    - paragraph [ref=e341]: 2 Baths
                  - paragraph [ref=e344]: 2 Car Garage
            - generic [ref=e347] [cursor=pointer]:
              - generic [ref=e349]:
                - paragraph [ref=e352]: Ready Now
                - paragraph [ref=e354]: $472,648
                - img [ref=e355]
                - button [ref=e356]:
                  - img [ref=e357]
              - link [ref=e359]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/793-w-riparian-dr
                - generic [ref=e360]: Aqua Floorplan | Single Family
                - generic [ref=e361]: 793 W RIPARIAN DR
                - generic [ref=e362]:
                  - paragraph [ref=e365]: 1,837 Sq. Ft.
                  - generic [ref=e366]:
                    - paragraph [ref=e367]: 3 Beds
                    - generic [ref=e368]: "|"
                    - paragraph [ref=e369]: 2 Baths
                  - paragraph [ref=e372]: 2 Car Garage
            - generic [ref=e375] [cursor=pointer]:
              - generic [ref=e377]:
                - paragraph [ref=e378]:
                  - paragraph [ref=e380]: Self-Tour
                - paragraph [ref=e383]: Ready Now
                - paragraph [ref=e385]: $487,040
                - img [ref=e386]
                - button [ref=e387]:
                  - img [ref=e388]
              - link [ref=e390]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/azure/823-w-riparian-dr
                - generic [ref=e391]: Azure Floorplan | Single Family
                - generic [ref=e392]: 823 W RIPARIAN DR
                - generic [ref=e393]:
                  - paragraph [ref=e396]: 2,064 Sq. Ft.
                  - generic [ref=e397]:
                    - paragraph [ref=e398]: 3 Beds
                    - generic [ref=e399]: "|"
                    - paragraph [ref=e400]: 2 Baths
                  - paragraph [ref=e403]: 3 Car Garage
            - generic [ref=e406] [cursor=pointer]:
              - generic [ref=e408]:
                - paragraph [ref=e411]: Ready Now
                - paragraph [ref=e413]: $493,402
                - img [ref=e414]
                - button [ref=e415]:
                  - img [ref=e416]
              - link [ref=e418]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/760-w-riparian-dr
                - generic [ref=e419]: Aqua Floorplan | Single Family
                - generic [ref=e420]: 760 W RIPARIAN DR
                - generic [ref=e421]:
                  - paragraph [ref=e424]: 1,837 Sq. Ft.
                  - generic [ref=e425]:
                    - paragraph [ref=e426]: 3 Beds
                    - generic [ref=e427]: "|"
                    - paragraph [ref=e428]: 2 Baths
                  - paragraph [ref=e431]: 2 Car Garage
            - generic [ref=e434] [cursor=pointer]:
              - generic [ref=e436]:
                - paragraph [ref=e439]: Ready Now
                - paragraph [ref=e441]: $507,970
                - img [ref=e442]
                - button [ref=e443]:
                  - img [ref=e444]
              - link [ref=e446]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/azure/779-w-riparian-dr
                - generic [ref=e447]: Azure Floorplan | Single Family
                - generic [ref=e448]: 779 W RIPARIAN DR
                - generic [ref=e449]:
                  - paragraph [ref=e452]: 2,064 Sq. Ft.
                  - generic [ref=e453]:
                    - paragraph [ref=e454]: 3 Beds
                    - generic [ref=e455]: "|"
                    - paragraph [ref=e456]: 2 Baths
                  - paragraph [ref=e459]: 3 Car Garage
            - generic [ref=e462] [cursor=pointer]:
              - generic [ref=e464]:
                - paragraph [ref=e467]: Ready Now
                - paragraph [ref=e469]: $520,000
                - img [ref=e470]
                - button [ref=e471]:
                  - img [ref=e472]
              - link [ref=e474]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/blush/312-w-flax-dr
                - generic [ref=e475]: Blush Floorplan | Single Family
                - generic [ref=e476]: 312 W FLAX DR
                - generic [ref=e477]:
                  - paragraph [ref=e480]: 2,471 Sq. Ft.
                  - generic [ref=e481]:
                    - paragraph [ref=e482]: 3 Beds
                    - generic [ref=e483]: "|"
                    - paragraph [ref=e484]: 2 Baths
                  - generic [ref=e485]:
                    - paragraph [ref=e486]: 1 Half Bath
                    - generic [ref=e487]: "|"
                    - paragraph [ref=e489]: 3 Car Garage
          - button [ref=e491] [cursor=pointer]:
            - paragraph [ref=e493]: SHOW MORE
      - generic [ref=e496]:
        - heading [level=2] [ref=e497]: Schedule an appointment
        - generic [ref=e498]:
          - button [ref=e500] [cursor=pointer]:
            - generic [ref=e501]: IN-PERSON
          - button [ref=e502] [cursor=pointer]:
            - generic [ref=e503]: VIRTUAL
      - generic [ref=e505]:
        - heading [level=2] [ref=e506]: Your destination - for work, play and life
        - generic [ref=e507]:
          - article [ref=e508]:
            - heading [level=3] [ref=e510]: Outdoor Amenities
            - paragraph [ref=e511]: Enjoy proposed outdoor covered gathering spaces.
          - article [ref=e512]:
            - heading [level=3] [ref=e514]: Open space
            - paragraph [ref=e515]: Stretch out in the open turf areas around the community.
          - article [ref=e516]:
            - heading [level=3] [ref=e518]: Play Structures
            - paragraph [ref=e519]: Spend some time at one of the communities shaded play structures.
          - article [ref=e520]:
            - heading [level=3] [ref=e522]: Sports Court
            - paragraph [ref=e523]: Enjoy a friendly game of bocce ball on one of the proposed courts.
          - article [ref=e524]:
            - heading [level=3] [ref=e526]: Walking Trails
            - paragraph [ref=e527]: Enjoy over a mile of walking trails meandering through the community.
      - generic [ref=e528]:
        - generic [ref=e532]:
          - img [ref=e537]
          - generic [ref=e540]:
            - heading [level=2] [ref=e541]: Proudly Named an ENERGY STAR® Partner of the Year
            - generic [ref=e542]: Mattamy Homes Phoenix is proud to be named an ENERGY STAR® Partner of the Year, the highest level of recognition given by the EPA. Learn more about how Mattamy is building energy-efficient homes across Phoenix.
            - link [ref=e544] [cursor=pointer]:
              - /url: https://mattamyhomes.com/arizona/phoenix/energystar-partner-2024
              - generic [ref=e545]: Energy Star Award Winner
        - generic [ref=e549]:
          - img [ref=e554]
          - generic [ref=e557]:
            - heading [level=2] [ref=e558]: HERS Index
            - generic [ref=e560]:
              - paragraph [ref=e561]: The Home Energy Rating System (HERS) is the industry standard scoring system that measures a home’s energy efficiency on a scale from zero to 150. A typical existing home score is 130 and a typical new home is 100.
              - paragraph [ref=e562]: Landmarke has an average HERS score of 51. The lower the HERS score the more you save! Click below to learn more.
            - link [ref=e564] [cursor=pointer]:
              - /url: https://dam.mattamyhomes.com/digizuitecore/legacyservice/api/assetstream/107359/10061.pdf
              - generic [ref=e565]:
                - text: Learn More
                - img [ref=e566]
      - generic [ref=e570]:
        - heading [level=2] [ref=e571]: Thoughtfully designed with you in mind
        - generic [ref=e572]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e574]:
          - radiogroup [ref=e576]:
            - radio [checked] [ref=e577] [cursor=pointer]:
              - paragraph [ref=e578]: Community Gallery
            - generic [ref=e579]: "|"
            - radio [ref=e580] [cursor=pointer]:
              - paragraph [ref=e581]: Cobalt
            - generic [ref=e582]: "|"
            - radio [ref=e583] [cursor=pointer]:
              - paragraph [ref=e584]: Garnet
            - generic [ref=e585]: "|"
            - radio [ref=e586] [cursor=pointer]:
              - paragraph [ref=e587]: Mahogany
            - generic [ref=e588]: "|"
            - radio [ref=e589] [cursor=pointer]:
              - paragraph [ref=e590]: Pacific
            - paragraph [ref=e591]: Slide has changed view to 0
          - generic [ref=e592]:
            - generic [ref=e594]:
              - button [ref=e596] [cursor=pointer]:
                - img [ref=e597]
              - generic [ref=e600]:
                - button [ref=e605] [cursor=pointer]
                - button [ref=e610] [cursor=pointer]
                - button [ref=e615] [cursor=pointer]
                - button [ref=e620] [cursor=pointer]
                - button [ref=e625] [cursor=pointer]
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
                - button [ref=e700] [cursor=pointer]
                - button [ref=e705] [cursor=pointer]
              - button [ref=e707] [cursor=pointer]:
                - img [ref=e708]
            - generic [ref=e710]: Exterior 1
            - paragraph [ref=e712]:
              - generic [ref=e713]: Slide number
              - text: 1/19
      - generic [ref=e715]:
        - heading [level=2] [ref=e716]: Conveniently located to fit your needs
        - generic [ref=e717]:
          - article [ref=e718]:
            - heading [level=3] [ref=e720]: Dining
            - paragraph [ref=e721]:
              - generic [ref=e722]: You’re never far from a variety of great restaurants, cafes and eateries.
          - article [ref=e723]:
            - heading [level=3] [ref=e725]: Schools
            - paragraph [ref=e726]:
              - generic [ref=e727]: Great selection of local public schools as well as top-rated Charter Schools.
          - article [ref=e728]:
            - heading [level=3] [ref=e730]: Entertainment
            - paragraph [ref=e731]: Enjoy the areas Agritainment destinations like Schnepf Farms, Queen Creek Olive Mill and Hayden Flour Mill.
          - article [ref=e732]:
            - heading [level=3] [ref=e734]: Conveniences
            - paragraph [ref=e735]: Enjoy close proximity to everyday conveniences and necessities like grocery stores, drugstores and more.
          - article [ref=e736]:
            - heading [level=3] [ref=e738]: Location
            - paragraph [ref=e739]: Premier east valley location, near major employers and great access to SR-24 connecting to Loop 202.
          - article [ref=e740]:
            - heading [level=3] [ref=e742]: Medical centers
            - paragraph [ref=e743]:
              - generic [ref=e744]: Rest assured knowing you’re close by great medical centers like Banner Ironwood, just over 1 mile away.
          - article [ref=e745]:
            - heading [level=3] [ref=e747]: Outdoor recreation
            - paragraph [ref=e748]: Outdoor enthusiasts will enjoy the natural setting, close to parks, bike trails, golf courses and more.
          - article [ref=e749]:
            - heading [level=3] [ref=e751]: Retail
            - paragraph [ref=e752]:
              - generic [ref=e753]: Nearby Queen Creek Marketplace, Queen Creek District, and Cornerstone at Queen Creek for your retail needs.
      - generic [ref=e755]:
        - heading [level=2] [ref=e756]: Explore the community
        - generic [ref=e757]: Take a closer look at the community sitemap and get familiar with our available offerings.
        - generic [ref=e758]:
          - button [ref=e759] [cursor=pointer]:
            - img [ref=e760]
          - iframe [ref=e765]:
            - generic [ref=f19e3]:
              - generic [ref=f19e5]:
                - generic [ref=f19e11]:
                  - button "Hide UI" [ref=f19e12] [cursor=pointer]:
                    - img [ref=f19e14]
                  - button "Reset" [ref=f19e15] [cursor=pointer]:
                    - img [ref=f19e17]
                  - button "Print" [ref=f19e18] [cursor=pointer]:
                    - img [ref=f19e20]
                  - generic [ref=f19e21]:
                    - button "Increase Zoom" [ref=f19e22] [cursor=pointer]:
                      - img [ref=f19e24]
                    - button "Decrease Zoom" [ref=f19e25] [cursor=pointer]:
                      - img [ref=f19e27]
                  - generic "position controls" [ref=f19e29]:
                    - button "move map up" [ref=f19e30] [cursor=pointer]
                    - generic [ref=f19e32]:
                      - button "move map left" [ref=f19e33] [cursor=pointer]
                      - button "move map right" [ref=f19e36] [cursor=pointer]
                    - button "move map down" [ref=f19e38] [cursor=pointer]
                - generic [ref=f19e40]:
                  - generic [ref=f19e41]:
                    - generic [ref=f19e42]:
                      - img [ref=f19e44]
                      - generic [ref=f19e45]:
                        - text: Landmarke
                        - text: SITE MAP
                    - generic [ref=f19e46]:
                      - generic [ref=f19e47]: "Neighborhood:"
                      - combobox "Select Neighborhood" [disabled] [ref=f19e48]:
                        - generic [ref=f19e49]:
                          - generic [ref=f19e51]: Ruby Collection
                          - img [ref=f19e54]
                  - generic [ref=f19e55]:
                    - generic [ref=f19e57]:
                      - button "Homesite Search" [ref=f19e58] [cursor=pointer]
                      - button "Homesite Details"
                    - generic [ref=f19e60]:
                      - generic [ref=f19e63]:
                        - generic [ref=f19e64]:
                          - generic [ref=f19e65]:
                            - heading "Homesite Status" [level=2] [ref=f19e66]
                            - generic [ref=f19e67]: All
                          - button "Collapse Homesite Status" [ref=f19e68] [cursor=pointer]:
                            - img [ref=f19e70]
                        - generic [ref=f19e73]:
                          - generic [ref=f19e75]:
                            - img [ref=f19e77]
                            - generic [ref=f19e78]: Show All
                            - checkbox "Show All" [checked] [ref=f19e81] [cursor=pointer]
                          - generic [ref=f19e82]:
                            - generic [ref=f19e83]:
                              - generic [ref=f19e85]: Quick Move-In
                              - generic [ref=f19e86]: "12"
                              - checkbox "Quick Move-In" [checked] [ref=f19e89] [cursor=pointer]
                            - generic [ref=f19e90]:
                              - generic [ref=f19e92]: Quick Start Home
                              - generic [ref=f19e93]: "0"
                              - checkbox "Quick Start Home" [checked] [ref=f19e96] [cursor=pointer]
                            - generic [ref=f19e97]:
                              - generic [ref=f19e99]: Available
                              - generic [ref=f19e100]: "40"
                              - checkbox "Available" [checked] [ref=f19e103] [cursor=pointer]
                            - generic [ref=f19e104]:
                              - generic [ref=f19e106]: Sold
                              - generic [ref=f19e107]: "76"
                              - checkbox "Sold" [checked] [ref=f19e110] [cursor=pointer]
                            - generic [ref=f19e111]:
                              - generic [ref=f19e113]: Future
                              - generic [ref=f19e114]: "122"
                              - checkbox "Future" [checked] [ref=f19e117] [cursor=pointer]
                            - generic [ref=f19e118]:
                              - generic [ref=f19e120]: Models
                              - generic [ref=f19e121]: "4"
                              - checkbox "Models" [checked] [ref=f19e124] [cursor=pointer]
                      - generic [ref=f19e127]:
                        - generic [ref=f19e128]:
                          - generic [ref=f19e129]:
                            - checkbox [ref=f19e132] [cursor=pointer]
                            - heading "Tag Filter" [level=2] [ref=f19e133]
                          - button "Collapse Tag Filter" [ref=f19e134] [cursor=pointer]:
                            - img [ref=f19e136]
                        - combobox "Select a tag" [ref=f19e140]:
                          - generic [ref=f19e141] [cursor=pointer]:
                            - generic [ref=f19e142]: Select a tag
                            - img [ref=f19e145]
                  - button "Close Side Menu" [ref=f19e147] [cursor=pointer]:
                    - img [ref=f19e149]
              - generic:
                - generic:
                  - generic:
                    - img
      - generic [ref=e767]:
        - heading [level=2] [ref=e768]: Building Better
        - generic [ref=e770]: We build homes that provide additional comfort and greater savings thanks to innovative solutions.
        - generic [ref=e771]:
          - button [ref=e772] [cursor=pointer]:
            - img [ref=e773]
          - iframe [ref=e778]:
            - generic [ref=f8e3]:
              - generic [ref=f8e5]:
                - generic [ref=f8e7]:
                  - img [ref=f8e8]
                  - generic:
                    - button "HERS-Rated Homes" [ref=f8e10] [cursor=pointer]:
                      - img [ref=f8e12]
                    - button "ENERGY STAR® Certified Homes" [ref=f8e14] [cursor=pointer]:
                      - img [ref=f8e16]
                    - button "ENERGY STAR® Certified Appliances" [ref=f8e18] [cursor=pointer]:
                      - img [ref=f8e20]
                    - button "WaterSense Low-Flow Fixtures" [ref=f8e22] [cursor=pointer]:
                      - img [ref=f8e24]
                    - button "Radiant Barrier" [ref=f8e26] [cursor=pointer]:
                      - img [ref=f8e28]
                    - button "Low Water-Use Landscaping" [ref=f8e30] [cursor=pointer]:
                      - img [ref=f8e32]
                    - button "Low VOC Materials" [ref=f8e34] [cursor=pointer]:
                      - img [ref=f8e36]
                    - button "PEX Plumbing" [ref=f8e38] [cursor=pointer]:
                      - img [ref=f8e40]
                    - button "Sealed Insulated Ducts" [ref=f8e42] [cursor=pointer]:
                      - img [ref=f8e44]
                    - button "MERV 8 Air Filters" [ref=f8e46] [cursor=pointer]:
                      - img [ref=f8e48]
                    - button "100% LED Light Bulbs*" [ref=f8e50] [cursor=pointer]:
                      - img [ref=f8e52]
                    - button "Independent Energy Inspection and Testing Program" [ref=f8e54] [cursor=pointer]:
                      - img [ref=f8e56]
                    - button "EcoBee® Smart Thermostat with Amazon Alexa" [ref=f8e58] [cursor=pointer]:
                      - img [ref=f8e60]
                    - button "Insulated Garage Doors" [ref=f8e62] [cursor=pointer]:
                      - img [ref=f8e64]
                    - button "Dual-Pane Low-E Windows" [ref=f8e66] [cursor=pointer]:
                      - img [ref=f8e68]
                    - button "Fresh Air Supply" [ref=f8e70] [cursor=pointer]:
                      - img [ref=f8e72]
                    - button "Right-Sized Climate Insulation" [ref=f8e74] [cursor=pointer]:
                      - img [ref=f8e76]
                    - button "Right-Sized Heating and Cooling System" [ref=f8e78] [cursor=pointer]:
                      - img [ref=f8e80]
                    - button "Disclaimer" [ref=f8e82] [cursor=pointer]:
                      - img [ref=f8e84]
                - generic [ref=f8e85]:
                  - generic [ref=f8e87]:
                    - img [ref=f8e89]
                    - generic [ref=f8e90]: BUILDING BETTER
                  - generic [ref=f8e94]:
                    - generic [ref=f8e95]:
                      - generic [ref=f8e96]:
                        - img [ref=f8e98]
                        - heading "At Mattamy, we’re proud to build homes that provide additional comfort and greater savings thanks to innovative, high-efficiency features that are also better for the environment. This means, you’ll enjoy lower utility bills, a healthier living environment, and a reduced carbon footprint." [level=2] [ref=f8e99]
                      - button "Collapse" [ref=f8e100] [cursor=pointer]:
                        - img [ref=f8e102]
                    - list [ref=f8e106]:
                      - listitem [ref=f8e107]:
                        - button "HERS-Rated Homes" [ref=f8e108] [cursor=pointer]:
                          - generic [ref=f8e109]:
                            - heading "HERS-Rated Homes" [level=3] [ref=f8e110]
                            - paragraph [ref=f8e112]: All homes achieve a HERS rating of 58 or lower, making them at least 42% more energy efficient than industry standards of new build homes. Ask your New Home Counselor for community and plan-specific HERS ratings.
                      - listitem [ref=f8e113]:
                        - button "ENERGY STAR® Certified Homes" [ref=f8e114] [cursor=pointer]:
                          - generic [ref=f8e115]:
                            - heading "ENERGY STAR® Certified Homes" [level=3] [ref=f8e116]
                            - paragraph [ref=f8e118]: All homes are ENERGY STAR® certified, making them more energy efficient than standard construction.
                      - listitem [ref=f8e119]:
                        - button "ENERGY STAR® Certified Appliances" [ref=f8e120] [cursor=pointer]:
                          - generic [ref=f8e121]:
                            - heading "ENERGY STAR® Certified Appliances" [level=3] [ref=f8e122]
                            - paragraph [ref=f8e124]: Enjoy appliances from the Whirlpool® family that look great, feature incredible performance, and will help you save on your utility bill.
                      - listitem [ref=f8e125]:
                        - button "WaterSense Low-Flow Fixtures" [ref=f8e126] [cursor=pointer]:
                          - generic [ref=f8e127]:
                            - heading "WaterSense Low-Flow Fixtures" [level=3] [ref=f8e128]
                            - paragraph [ref=f8e130]: Faucets, toilets, and more designed to reduce water waste.
                      - listitem [ref=f8e131]:
                        - button "Radiant Barrier" [ref=f8e132] [cursor=pointer]:
                          - generic [ref=f8e133]:
                            - heading "Radiant Barrier" [level=3] [ref=f8e134]
                            - paragraph [ref=f8e136]: Attic material that reflects heat, lowering cooling costs and increasing your home’s comfort.
                      - listitem [ref=f8e137]:
                        - button "Low Water-Use Landscaping" [ref=f8e138] [cursor=pointer]:
                          - generic [ref=f8e139]:
                            - heading "Low Water-Use Landscaping" [level=3] [ref=f8e140]
                            - paragraph [ref=f8e142]: Mattamy installs landscaping that is not only beautiful, but also mindful of the amount of water needed to maintain it, saving this previous resource and your water bill.
                      - listitem [ref=f8e143]:
                        - button "Low VOC Materials" [ref=f8e144] [cursor=pointer]:
                          - generic [ref=f8e145]:
                            - heading "Low VOC Materials" [level=3] [ref=f8e146]
                            - paragraph [ref=f8e148]: Using materials with low VOC throughout your home helps reduce the amount of toxic chemicals these materials and finishes emit.
                      - listitem [ref=f8e149]:
                        - button "PEX Plumbing" [ref=f8e150] [cursor=pointer]:
                          - generic [ref=f8e151]:
                            - heading "PEX Plumbing" [level=3] [ref=f8e152]
                            - paragraph [ref=f8e154]: Resists scale build-up and doesn’t pit or corrode when exposed to acidic water. Its tubing also doesn’t transfer heat as readily as copper, conserving energy.
                      - listitem [ref=f8e155]:
                        - button "Sealed Insulated Ducts" [ref=f8e156] [cursor=pointer]:
                          - generic [ref=f8e157]:
                            - heading "Sealed Insulated Ducts" [level=3] [ref=f8e158]
                            - paragraph [ref=f8e160]: Sealing and insulating ducts helps reduce air leakage, which increases heating and cooling system efficiency, lowering your energy bills.
                      - listitem [ref=f8e161]:
                        - button "MERV 8 Air Filters" [ref=f8e162] [cursor=pointer]:
                          - generic [ref=f8e163]:
                            - heading "MERV 8 Air Filters" [level=3] [ref=f8e164]
                            - paragraph [ref=f8e166]: Removes more particles from your home’s air than lower-rated air filters, creating a healthier living environment.
                      - listitem [ref=f8e167]:
                        - button "100% LED Light Bulbs*" [ref=f8e168] [cursor=pointer]:
                          - generic [ref=f8e169]:
                            - heading "100% LED Light Bulbs*" [level=3] [ref=f8e170]
                            - paragraph [ref=f8e172]: Light bulbs that consume less electricity and emit less heat, that also last significantly longer than other types of light bulbs.
                      - listitem [ref=f8e173]:
                        - button "Independent Energy Inspection and Testing Program" [ref=f8e174] [cursor=pointer]:
                          - generic [ref=f8e175]:
                            - heading "Independent Energy Inspection and Testing Program" [level=3] [ref=f8e176]
                            - paragraph [ref=f8e178]: Rest assured knowing that your home has been inspected and tested by a trained third-party energy rater.
                      - listitem [ref=f8e179]:
                        - button "EcoBee® Smart Thermostat with Amazon Alexa" [ref=f8e180] [cursor=pointer]:
                          - generic [ref=f8e181]:
                            - heading "EcoBee® Smart Thermostat with Amazon Alexa" [level=3] [ref=f8e182]
                            - paragraph [ref=f8e184]: Control your home’s temperature, as well as other smart-enabled home products, with your voice or your smartphone. EcoBee® thermostats are ENERGY STAR® certified.
                      - listitem [ref=f8e185]:
                        - button "Insulated Garage Doors" [ref=f8e186] [cursor=pointer]:
                          - generic [ref=f8e187]:
                            - heading "Insulated Garage Doors" [level=3] [ref=f8e188]
                            - paragraph [ref=f8e190]: A more durable door that helps save energy by moderating the temperature in your garage, reducing the energy needed to heat and cool the rest of your home.
                      - listitem [ref=f8e191]:
                        - button "Dual-Pane Low-E Windows" [ref=f8e192] [cursor=pointer]:
                          - generic [ref=f8e193]:
                            - heading "Dual-Pane Low-E Windows" [level=3] [ref=f8e194]
                            - paragraph [ref=f8e196]: A clear coating applied to the inside of window glass that reflects heat, keeping your home’s temperature more consistent, while also protecting your decor from UV fading.
                      - listitem [ref=f8e197]:
                        - button "Fresh Air Supply" [ref=f8e198] [cursor=pointer]:
                          - generic [ref=f8e199]:
                            - heading "Fresh Air Supply" [level=3] [ref=f8e200]
                            - paragraph [ref=f8e202]: All homes have an ENERGY STAR®-compliant mechanical ventilation system that provides outside air to reduce indoor air pollutants.
                      - listitem [ref=f8e203]:
                        - button "Right-Sized Climate Insulation" [ref=f8e204] [cursor=pointer]:
                          - generic [ref=f8e205]:
                            - heading "Right-Sized Climate Insulation" [level=3] [ref=f8e206]
                            - paragraph [ref=f8e208]: All homes are built using the appropriately sized insulation ratings in your walls and attic to weather the extreme Arizona climate.
                      - listitem [ref=f8e209]:
                        - button "Right-Sized Heating and Cooling System" [ref=f8e210] [cursor=pointer]:
                          - generic [ref=f8e211]:
                            - heading "Right-Sized Heating and Cooling System" [level=3] [ref=f8e212]
                            - paragraph [ref=f8e214]: Heating and cooling equipment and associated duct work are sized and installed correctly to maximize comfort and performance.
                      - listitem [ref=f8e215]:
                        - button "Disclaimer" [ref=f8e216] [cursor=pointer]:
                          - generic [ref=f8e217]:
                            - heading "Disclaimer" [level=3] [ref=f8e218]
                            - generic [ref=f8e219]:
                              - paragraph [ref=f8e220]:
                                - strong [ref=f8e222]: "*Within conditioned living space. May not include decorative fixtures, ceiling fans and/or other decorative lighting."
                              - paragraph [ref=f8e223]:
                                - strong [ref=f8e225]: "Mattamy Homes reserves the right to substitute equipment, products, parts, appliances, brand names and materials with items of equal or higher value and quality. All statements above reflect Mattamy Homes built within the Phoenix Metro area only. Savings and performance claims are not a guarantee of actual savings and performance. Actual energy savings/performance of any home or any of its features may vary widely, depending in part on location, occupant behavior and changes in energy provider rates and programs. Please speak with a Mattamy Homes New Home Counselor for full details. ROC #249191B."
                  - button "Close Side Menu" [ref=f8e227] [cursor=pointer]:
                    - img [ref=f8e229]
              - generic:
                - generic:
                  - generic:
                    - img
      - generic [ref=e783]:
        - img [ref=e788]
        - generic [ref=e791]:
          - heading [level=2] [ref=e792]: Mattamy Homes in Phoenix
          - generic [ref=e793]: Phoenix, Arizona’s sunny skies, trendsetting neighborhoods and endless outdoor adventures have made it one of the fastest-growing areas.
          - link [ref=e795] [cursor=pointer]:
            - /url: /arizona/phoenix
            - generic [ref=e796]: Learn More
      - generic [ref=e802]:
        - generic [ref=e803]:
          - heading [level=3] [ref=e804]: Sign Up For Community Updates
          - generic [ref=e806]: Required fields are marked with *
          - separator [ref=e807]
        - group [ref=e808]:
          - generic [ref=e809]:
            - textbox [ref=e810]
            - textbox [ref=e811]
            - generic [ref=e812]:
              - generic [ref=e813]: First name *
              - textbox [ref=e815]
            - generic [ref=e816]:
              - generic [ref=e817]: Last name *
              - textbox [ref=e819]
            - generic [ref=e820]:
              - generic [ref=e821]: Email *
              - textbox [ref=e823]
            - generic [ref=e824]:
              - generic [ref=e825]: Country of Residence *
              - generic [ref=e826]:
                - combobox [ref=e827] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e828]:
              - generic [ref=e829]: Zip/Postal Code *
              - textbox [ref=e831]
            - generic [ref=e832]:
              - generic [ref=e833]: Phone number
              - textbox [ref=e835]
            - generic [ref=e836]:
              - generic [ref=e837]: When do you want to move into your home?
              - generic [ref=e838]:
                - combobox [ref=e839] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e840]:
              - generic [ref=e841]: How many bedrooms do you need?
              - generic [ref=e842]:
                - combobox [ref=e843] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e844]:
              - generic [ref=e845]: What is your budget?
              - generic [ref=e846]:
                - combobox [ref=e847] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e849] [cursor=pointer]:
              - checkbox [ref=e850]
              - generic [ref=e851]: I am a Real Estate Agent
            - generic [ref=e853] [cursor=pointer]:
              - checkbox [ref=e854]
              - generic [ref=e855]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link [ref=e856]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link [ref=e857]:
                  - /url: /privacy-policy
                  - text: Privacy Policy
                - text: ","
                - link [ref=e858]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: ","
                - link [ref=e859]:
                  - /url: /sms-terms-of-service
                  - text: SMS Terms of Service
                - text: ", and/or"
                - link [ref=e860]:
                  - /url: /contact-us
                  - text: Contact Us
                - text: .
            - button [ref=e862] [cursor=pointer]: SUBMIT
      - button [ref=e864] [cursor=pointer]:
        - generic [ref=e865]: View promotions
        - img [ref=e866]
    - contentinfo [ref=e868]:
      - generic [ref=e870]:
        - generic [ref=e871]:
          - generic [ref=e872]:
            - heading [level=2] [ref=e873]: Explore
            - list [ref=e875]:
              - listitem [ref=e876]:
                - link [ref=e877] [cursor=pointer]:
                  - /url: /search
                  - text: Find My Home
              - listitem [ref=e878]:
                - link [ref=e879] [cursor=pointer]:
                  - /url: /design-studio
                  - text: Design Studio
              - listitem [ref=e880]:
                - link [ref=e881] [cursor=pointer]:
                  - /url: /customer-care
                  - text: Customer Care
          - generic [ref=e883]:
            - heading [level=2] [ref=e884]: About Mattamy
            - list [ref=e886]:
              - listitem [ref=e887]:
                - link [ref=e888] [cursor=pointer]:
                  - /url: /about/about-mattamy
                  - text: About Us
              - listitem [ref=e889]:
                - link [ref=e890] [cursor=pointer]:
                  - /url: /contact
                  - text: Contact Us
              - listitem [ref=e891]:
                - link [ref=e892] [cursor=pointer]:
                  - /url: /about/careers
                  - text: Careers
              - listitem [ref=e893]:
                - link [ref=e894] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
                  - text: Media and Investor Relations
          - generic [ref=e896]:
            - heading [level=2] [ref=e897]: Connect With Us
            - generic [ref=e899]:
              - link [ref=e900] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomesUSA
                - img [ref=e901]
              - link [ref=e903] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomesusa/
                - img [ref=e904]
              - link [ref=e906] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e907]
              - link [ref=e909] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e910]
              - link [ref=e912] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e913]
        - generic [ref=e916]:
          - paragraph [ref=e917]:
            - link [ref=e918] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e919]: "|"
            - button [ref=e920] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e921]: "|"
            - link [ref=e922] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e923]: "|"
            - link [ref=e924] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e925]: "|"
            - link [ref=e926] [cursor=pointer]:
              - /url: /terms-and-conditions
              - text: Terms and Conditions
              - generic [ref=e927]: "|"
            - link [ref=e928] [cursor=pointer]:
              - /url: /about/about-mattamy
              - text: About Us
          - paragraph [ref=e929]:
            - img [ref=e930]
            - text: Copyright © 2025 Mattamy Homes. All rights reserved.
  - iframe [ref=e932]:
    - generic [active] [ref=f21e1]:
      - generic:
        - generic:
          - generic:
            - button [ref=f21e2]
            - img "AtlasRTX Digital Assistant icon" [ref=f21e5]:
              - text: Chat with Us
              - strong [ref=f21e8]: "1"
            - button [ref=f21e9]
```

# Test source

```ts
  678 |       addressText,
  679 |       'Community address should include province/state and postal/ZIP details',
  680 |     ).toMatch(/\b[A-Z]{2}\b/);
  681 | 
  682 |     if (marketFromUrl) {
  683 |       expect(
  684 |         currentPath.toLowerCase(),
  685 |         'Community URL should include the current market/city context',
  686 |       ).toContain(toSlug(marketFromUrl));
  687 |       await expect(
  688 |         this.page.locator('body'),
  689 |         'Community page should include visible market/city context',
  690 |       ).toContainText(new RegExp(escapeRegex(marketFromUrl), 'i'), { timeout: 15000 });
  691 |     }
  692 | 
  693 |     await expect(
  694 |       this.heading,
  695 |       'Main heading should still show the current community',
  696 |     ).toContainText(new RegExp(escapeRegex(expectedCommunity), 'i'));
  697 |   }
  698 | 
  699 |   /** Verifies key attributes. */
  700 |   private async verifyKeyAttributes(): Promise<void> {
  701 |     const requiredAttributes = [
  702 |       /Home Types/i,
  703 |       /Bedrooms/i,
  704 |       /Full Bathrooms/i,
  705 |       /Sq\.?\s*Ft\./i,
  706 |       /Stories/i,
  707 |       /Garages/i,
  708 |     ];
  709 | 
  710 |     for (const attribute of requiredAttributes) {
  711 |       await expect(
  712 |         this.productOverviewSection,
  713 |         `Key attribute ${attribute} should render`,
  714 |       ).toContainText(attribute, { timeout: 10000 });
  715 |     }
  716 |   }
  717 | 
  718 |   /**
  719 |    * Fallback in-page form containers for pages that render a lead form without a
  720 |    * <form> tag. Same dialog exclusion as communityForms.
  721 |    */
  722 |   private get communityFormContainers(): Locator {
  723 |     return this.page
  724 |       .locator(
  725 |         [
  726 |           '[id^="Sitecore-ScheduleAVisit-FormInstance"]',
  727 |           '[id^="ScheduleAVisit-FormInstance"]',
  728 |           '#contact',
  729 |           'section',
  730 |           '[role="group"]',
  731 |         ]
  732 |           .map((selector) => `${selector}${CommunityPage.NOT_IN_DIALOG}`)
  733 |           .join(', '),
  734 |       )
  735 |       .filter({ has: this.page.getByRole('button', { name: /submit/i }) })
  736 |       .filter({ has: this.page.locator('input, select, textarea') });
  737 |   }
  738 | 
  739 |   /**
  740 |    * The in-page lead forms, in DOM order.
  741 |    *
  742 |    * Deliberately excludes anything inside the side modal / dialog: the primary
  743 |    * and footer forms are page content, and letting a dialog into this set is
  744 |    * what used to make "the primary form" mean different elements on different
  745 |    * runs. Prefers real <form> elements and falls back to the Sitecore /
  746 |    * ScheduleAVisit / #contact wrappers for the pages that render a lead form
  747 |    * without a <form> tag.
  748 |    */
  749 |   private async inPageForms(): Promise<Locator> {
  750 |     const forms = this.communityForms;
  751 | 
  752 |     return (await forms.count()) ? forms : this.communityFormContainers;
  753 |   }
  754 | 
  755 |   /**
  756 |    * The primary (top-most) in-page community form.
  757 |    *
  758 |    * Resolved by position within the in-page forms rather than by a global index,
  759 |    * so a newly rendered dialog cannot shift what this refers to.
  760 |    */
  761 |   private async primaryForm(): Promise<Locator> {
  762 |     return (await this.inPageForms()).first();
  763 |   }
  764 | 
  765 |   /**
  766 |    * The footer community form: the second in-page lead form.
  767 |    *
  768 |    * Positional, but within a single homogeneous set (in-page lead forms, never
  769 |    * dialogs) rather than counted across unrelated locator groups - the page can
  770 |    * render further forms below it (newsletter-style, no validation), so `.last()`
  771 |    * is not the same thing. Throws when the page has no second form rather than
  772 |    * quietly re-validating the primary one.
  773 |    */
  774 |   private async footerForm(): Promise<Locator> {
  775 |     const forms = await this.inPageForms();
  776 | 
  777 |     if ((await forms.count()) < 2) {
> 778 |       throw new Error('Footer community form not present - page rendered only one in-page form');
      |             ^ Error: Footer community form not present - page rendered only one in-page form
  779 |     }
  780 | 
  781 |     return forms.nth(1);
  782 |   }
  783 | 
  784 |   /** Opens lead form from get information CTA if present. */
  785 |   private async openLeadFormFromGetInformationCtaIfPresent(): Promise<void> {
  786 |     const cta = await this.resolveGetInformationCta();
  787 | 
  788 |     if (!cta || !(await cta.isVisible({ timeout: 5000 }).catch(() => false))) {
  789 |       return;
  790 |     }
  791 | 
  792 |     const previousUrl = this.page.url();
  793 | 
  794 |     await cta.scrollIntoViewIfNeeded();
  795 |     await cta.click();
  796 |     await this.waitForPageReady();
  797 | 
  798 |     await this.settle(1000);
  799 |     expect(
  800 |       this.page.url(),
  801 |       `Community lead-form CTA should keep the flow on page, not redirect from ${previousUrl}`,
  802 |     ).not.toMatch(/\/contact\/?($|[?#])/i);
  803 |   }
  804 | 
  805 |   /**
  806 |    * Resolves a named in-page form and asserts it is usable.
  807 |    *
  808 |    * Always returns a form or throws - callers do not need a null check.
  809 |    */
  810 |   private async getAvailableForm(
  811 |     resolveForm: () => Promise<Locator>,
  812 |     formName: string,
  813 |   ): Promise<Locator> {
  814 |     await this.dismissPromoPopupIfPresent({ appearTimeout: 3000 });
  815 | 
  816 |     let form = await resolveForm();
  817 | 
  818 |     if (!(await form.count())) {
  819 |       // Some layouts only render the in-page form after the lead-form CTA runs.
  820 |       await this.openLeadFormFromGetInformationCtaIfPresent();
  821 |       form = await resolveForm();
  822 |     }
  823 | 
  824 |     if (!(await form.count())) {
  825 |       throw new Error(`${formName} not present on the community page`);
  826 |     }
  827 | 
  828 |     // This scroll has a purpose (unlike the cosmetic ones removed elsewhere): the
  829 |     // footer form sits ~10,000px down and only hydrates once it enters the
  830 |     // viewport, so submitting without scrolling clicks a button whose React
  831 |     // handler is not attached yet and silently does nothing.
  832 |     await form.scrollIntoViewIfNeeded({ timeout: 10_000 });
  833 |     await this.settle(1000);
  834 | 
  835 |     await expect(
  836 |       form.getByRole('button', { name: /submit/i }).first(),
  837 |       `${formName} submit button should be visible`,
  838 |     ).toBeVisible({ timeout: 10000 });
  839 | 
  840 |     return form;
  841 |   }
  842 | 
  843 |   /**
  844 |    * Clicks the Get Information / Stay Updated CTA that opens the side modal form.
  845 |    *
  846 |    * The side modal is only rendered as a result of that click, so a missing or
  847 |    * unclickable CTA is a hard failure here rather than something the caller
  848 |    * later reports as a form that "did not open". Skipped only when a side modal
  849 |    * is already open (the locator is visible-filtered, so that is real).
  850 |    */
  851 |   private async openSideModalFromGetInformationCta(formName: string): Promise<void> {
  852 |     if (await this.leadFormDialogOrSidebar.count()) {
  853 |       return;
  854 |     }
  855 | 
  856 |     // The National-promotion overlay is a full-screen dialog that sits on top of
  857 |     // the CTA and swallows the click. Dismiss it rather than clicking through it
  858 |     // with force, so a genuinely unreachable CTA still fails.
  859 |     await this.dismissPromoPopupIfPresent({ appearTimeout: 3000 });
  860 | 
  861 |     const cta = await this.resolveGetInformationCta();
  862 | 
  863 |     if (!cta) {
  864 |       throw new Error(
  865 |         `No Get Information / Stay Updated CTA found on the community page to open ${formName}`,
  866 |       );
  867 |     }
  868 | 
  869 |     await expect(
  870 |       cta,
  871 |       `Get Information CTA should be visible before opening ${formName}`,
  872 |     ).toBeVisible({ timeout: 15000 });
  873 | 
  874 |     const previousUrl = this.page.url();
  875 | 
  876 |     // No manual scroll and no force: click() auto-scrolls and runs the
  877 |     // actionability checks, so a CTA covered by an overlay/banner fails here
  878 |     // with a call log instead of silently "clicking" and breaking downstream.
```