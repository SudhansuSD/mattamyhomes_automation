# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communityPage.spec.ts >> Community Detail - Landmarke >> Lead Form >> Get Information Form Validation >> @smoke @regression | USA | Validate Get Information CTA opens community sideModalForm
- Location: tests/communityPage.spec.ts:87:11

# Error details

```
TimeoutError: page.goto: Timeout 90000ms exceeded.
Call log:
  - navigating to "https://mattamyhomes.com/arizona/phoenix/san-tan-valley/landmarke-50s", waiting until "domcontentloaded"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e7]:
    - generic [ref=e10]:
      - img [ref=e13]
      - paragraph [ref=e15]:
        - text: Save with an FHA Below-Market Fixed Rate -
        - link "Going on Now!" [ref=e16] [cursor=pointer]:
          - /url: https://mattamyhomes.com/arizona/phoenix/promos/move
  - generic [ref=e18]:
    - banner [ref=e19]:
      - generic [ref=e20]:
        - link [ref=e21] [cursor=pointer]:
          - /url: /
          - figure [ref=e22]:
            - img [ref=e23]
        - navigation [ref=e24]:
          - generic [ref=e25]:
            - button [ref=e27] [cursor=pointer]:
              - paragraph [ref=e28]:
                - text: Find Your Dream Home
                - img [ref=e29]
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
                        - text: Bradenton
                        - generic:
                          - img
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
                        - text: Texas
                        - generic:
                          - img
                  - generic:
                    - button:
                      - menuitem:
                        - text: Dallas-Fort Worth
                        - generic:
                          - img
          - link [ref=e32] [cursor=pointer]:
            - /url: /design-studio
            - paragraph [ref=e33]: Design Studio
          - button [ref=e36] [cursor=pointer]:
            - paragraph [ref=e37]:
              - text: Homebuying
              - img [ref=e38]
          - link [ref=e41] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e42]: Customer Care
          - button [ref=e45] [cursor=pointer]:
            - paragraph [ref=e46]:
              - text: About
              - img [ref=e47]
          - link [ref=e50] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e51]: Contact Us
        - generic [ref=e52]:
          - button [ref=e53] [cursor=pointer]:
            - img [ref=e54]
          - button [ref=e59] [cursor=pointer]:
            - generic [ref=e61]: USA
            - img [ref=e63]
    - main [ref=e65]:
      - generic [ref=e67]:
        - generic [ref=e68]:
          - heading [level=2] [ref=e69]: Landmarke
          - generic [ref=e70]:
            - link [ref=e71] [cursor=pointer]:
              - /url: https://maps.google.com/maps?cid=662989070378364335
              - img [ref=e72]
              - generic [ref=e74]:
                - text: 38389 N. Sandpiper Court, San Tan Valley AZ 85140
                - img [ref=e75]
            - link [ref=e78] [cursor=pointer]:
              - /url: tel:6029008591
              - img [ref=e79]
              - generic [ref=e81]: 602-900-8591
            - link [ref=e82] [cursor=pointer]:
              - /url: mailto:landmarke.phx@mattamycorp.com
              - img [ref=e83]
              - generic [ref=e86]: landmarke.phx@mattamycorp.com
        - generic [ref=e87]:
          - link [ref=e88] [cursor=pointer]:
            - generic [ref=e89]: Schedule Appointment
          - link [ref=e90] [cursor=pointer]:
            - generic [ref=e91]: Get Information
      - generic [ref=e94]:
        - paragraph [ref=e95]: Now Selling
        - generic [ref=e96]:
          - heading [level=1] [ref=e97]: Landmarke
          - button [ref=e99] [cursor=pointer]:
            - img [ref=e100]
        - generic [ref=e102]: Now Selling! Masterfully designed single-family homes in a premier East Valley location.
        - button [ref=e103] [cursor=pointer]:
          - generic [ref=e104]: Get Information
      - region [ref=e107]:
        - generic [ref=e108]:
          - generic [ref=e109]: New Home Gallery
          - generic [ref=e110]:
            - generic [ref=e111]: 38389 N. Sandpiper Court, San Tan Valley, AZ 85140
            - generic [ref=e112]: 602-900-8591
          - generic [ref=e113]:
            - link [ref=e114] [cursor=pointer]:
              - /url: tel:6029008591
              - img [ref=e115]
            - link [ref=e117] [cursor=pointer]:
              - /url: mailto:landmarke.phx@mattamycorp.com
              - img [ref=e118]
            - button [ref=e121] [cursor=pointer]: Hours
            - link [ref=e122] [cursor=pointer]:
              - /url: https://maps.google.com/maps?cid=662989070378364335
              - img [ref=e123]
              - generic [ref=e125]: Directions
            - button [ref=e126] [cursor=pointer]: Schedule an Appointment
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
        - generic [ref=e127]:
          - generic [ref=e128]:
            - heading [level=3] [ref=e129]: Discover our homes
            - paragraph [ref=e130]: Explore floorplans and quick move-in homes ready for you.
          - generic [ref=e131]:
            - link [ref=e132] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Phoenix&country=USA&community=Landmarke &hideMap=true
              - text: View 11 Floorplans
            - link [ref=e133] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Phoenix&country=USA&community=Landmarke &hideMap=true
              - text: View 12 Quick Move-Ins
      - generic [ref=e137]:
        - img [ref=e138]
        - generic [ref=e139]:
          - heading [level=2] [ref=e140]: 4.99%/5.727% APR
          - text: FHA Below-Market Fixed Rate
        - generic [ref=e141]:
          - heading [level=3] [ref=e142]: Save with an FHA below-market fixed rate on your new home
          - generic [ref=e143]: Buy Now, Move Now with a low fixed rate available on select homes when using Mattamy Home Funding, LLC.
        - link [ref=e145] [cursor=pointer]:
          - /url: https://mattamyhomes.com/arizona/phoenix/promos/move
          - generic [ref=e146]: View Details
      - generic [ref=e148]:
        - generic [ref=e151]:
          - heading [level=2] [ref=e152]: Designed For the Way You Live
          - generic [ref=e154]:
            - generic [ref=e155]: Now Selling in San Tan Valley, AZ! Offering brand new single-family homes from our Sapphire and Ruby Collection in a premier East Valley location. Explore single and two story floorplans spanning from 1,837 to over 3,700 square feet, that offer maximum livability and comfort. The centralized community park offers expansive open turf ar...
            - button [expanded] [ref=e156] [cursor=pointer]: More+
        - generic [ref=e158]:
          - paragraph [ref=e159]: Home Details
          - generic [ref=e160]:
            - img [ref=e161]
            - generic [ref=e163]:
              - generic [ref=e164]: Home Types
              - generic [ref=e165]: Single Family
          - generic [ref=e166]:
            - generic [ref=e167]:
              - img [ref=e168]
              - generic [ref=e170]:
                - generic [ref=e171]: Bedrooms
                - generic [ref=e172]: 3 - 4
            - generic [ref=e173]:
              - img [ref=e174]
              - generic [ref=e176]:
                - generic [ref=e177]: Full Bathrooms
                - generic [ref=e178]: 2 - 3
            - generic [ref=e179]:
              - img [ref=e180]
              - generic [ref=e193]:
                - generic [ref=e194]: Half Bathrooms
                - generic [ref=e195]: "1"
            - generic [ref=e196]:
              - img [ref=e197]
              - generic [ref=e199]:
                - generic [ref=e200]: Sq. Ft.
                - generic [ref=e201]: 1837 - 3798
            - generic [ref=e202]:
              - img [ref=e203]
              - generic [ref=e213]:
                - generic [ref=e214]: Stories
                - generic [ref=e215]: 1 - 2
            - generic [ref=e216]:
              - img [ref=e217]
              - generic [ref=e224]:
                - generic [ref=e225]: Garages
                - generic [ref=e226]: 2 - 3
      - generic [ref=e232]:
        - generic [ref=e233]:
          - heading [level=3] [ref=e234]: Sign Up For Community Updates
          - generic [ref=e236]: Required fields are marked with *
          - separator [ref=e237]
        - group [ref=e238]:
          - generic [ref=e239]:
            - textbox [ref=e240]
            - textbox [ref=e241]
            - generic [ref=e242]:
              - generic [ref=e243]: First name *
              - textbox [ref=e245]
            - generic [ref=e246]:
              - generic [ref=e247]: Last name *
              - textbox [ref=e249]
            - generic [ref=e250]:
              - generic [ref=e251]: Email *
              - textbox [ref=e253]
            - generic [ref=e254]:
              - generic [ref=e255]: Country of Residence *
              - generic [ref=e256]:
                - combobox [ref=e257] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e258]:
              - generic [ref=e259]: Zip/Postal Code *
              - textbox [ref=e261]
            - generic [ref=e262]:
              - generic [ref=e263]: Phone number
              - textbox [ref=e265]
            - generic [ref=e266]:
              - generic [ref=e267]: When do you want to move into your home?
              - generic [ref=e268]:
                - combobox [ref=e269] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e270]:
              - generic [ref=e271]: How many bedrooms do you need?
              - generic [ref=e272]:
                - combobox [ref=e273] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e274]:
              - generic [ref=e275]: What is your budget?
              - generic [ref=e276]:
                - combobox [ref=e277] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e279] [cursor=pointer]:
              - checkbox [ref=e280]
              - generic [ref=e281]: I am a Real Estate Agent
            - generic [ref=e283] [cursor=pointer]:
              - checkbox [ref=e284]
              - generic [ref=e285]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link [ref=e286]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link [ref=e287]:
                  - /url: /privacy-policy
                  - text: Privacy Policy
                - text: ","
                - link [ref=e288]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: ","
                - link [ref=e289]:
                  - /url: /sms-terms-of-service
                  - text: SMS Terms of Service
                - text: ", and/or"
                - link [ref=e290]:
                  - /url: /contact-us
                  - text: Contact Us
                - text: .
            - button [ref=e292] [cursor=pointer]: SUBMIT
      - generic [ref=e295]:
        - generic [ref=e297]:
          - heading [level=2] [ref=e298]: Quick Move-In Homes ready when you are
          - generic [ref=e299]: If time is of the essence, then our Quick Move-In Homes are for you.
          - link [ref=e301] [cursor=pointer]:
            - /url: /search?productType=qmi&metro=Phoenix&country=USA&community=Landmarke &hideMap=true
            - generic [ref=e302]: View all
        - generic [ref=e303]:
          - generic [ref=e304]:
            - generic [ref=e307] [cursor=pointer]:
              - generic [ref=e309]:
                - paragraph [ref=e312]: Ready Now
                - paragraph [ref=e313]:
                  - img [ref=e315]
                - paragraph [ref=e317]: $455,025
                - img [ref=e318]
                - button [ref=e319]:
                  - img [ref=e320]
              - link [ref=e322]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/810-w-angelina-dr
                - generic [ref=e323]: Aqua Floorplan | Single Family
                - generic [ref=e324]: 810 W ANGELINA DR
                - generic [ref=e325]:
                  - paragraph [ref=e328]: 1,837 Sq. Ft.
                  - generic [ref=e329]:
                    - paragraph [ref=e330]: 3 Beds
                    - generic [ref=e331]: "|"
                    - paragraph [ref=e332]: 2 Baths
                  - paragraph [ref=e335]: 2 Car Garage
            - generic [ref=e338] [cursor=pointer]:
              - generic [ref=e340]:
                - paragraph [ref=e343]: Ready January 2027
                - paragraph [ref=e345]: $459,140
                - img [ref=e346]
                - button [ref=e347]:
                  - img [ref=e348]
              - link [ref=e350]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/aqua/796-w-angelina-dr
                - generic [ref=e351]: Aqua Floorplan | Single Family
                - generic [ref=e352]: 796 W ANGELINA DR
                - generic [ref=e353]:
                  - paragraph [ref=e356]: 1,837 Sq. Ft.
                  - generic [ref=e357]:
                    - paragraph [ref=e358]: 3 Beds
                    - generic [ref=e359]: "|"
                    - paragraph [ref=e360]: 2 Baths
                  - paragraph [ref=e363]: 2 Car Garage
            - generic [ref=e366] [cursor=pointer]:
              - generic [ref=e368]:
                - paragraph [ref=e371]: Ready Now
                - paragraph [ref=e372]:
                  - img [ref=e374]
                - paragraph [ref=e376]:
                  - text: $488,990 Was $490,040
                  - generic [ref=e377]: Save
                  - text: $1,050
                - img [ref=e378]
                - button [ref=e379]:
                  - img [ref=e380]
              - link [ref=e382]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/cobalt/841-w-angelina-dr
                - generic [ref=e383]: Cobalt Floorplan | Single Family
                - generic [ref=e384]: 841 W ANGELINA DR
                - generic [ref=e385]:
                  - paragraph [ref=e388]: 2,344 Sq. Ft.
                  - generic [ref=e389]:
                    - paragraph [ref=e390]: 4 Beds
                    - generic [ref=e391]: "|"
                    - paragraph [ref=e392]: 3 Baths
                  - paragraph [ref=e395]: 2 Car Garage
            - generic [ref=e398] [cursor=pointer]:
              - generic [ref=e400]:
                - paragraph [ref=e403]: Ready January 2027
                - paragraph [ref=e405]: $498,445
                - img [ref=e406]
                - button [ref=e407]:
                  - img [ref=e408]
              - link [ref=e410]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/cobalt/797-w-angelina-dr
                - generic [ref=e411]: Cobalt Floorplan | Single Family
                - generic [ref=e412]: 797 W ANGELINA DR
                - generic [ref=e413]:
                  - paragraph [ref=e416]: 2,344 Sq. Ft.
                  - generic [ref=e417]:
                    - paragraph [ref=e418]: 4 Beds
                    - generic [ref=e419]: "|"
                    - paragraph [ref=e420]: 3 Baths
                  - paragraph [ref=e423]: 2 Car Garage
            - generic [ref=e426] [cursor=pointer]:
              - generic [ref=e428]:
                - paragraph [ref=e431]: Ready Now
                - paragraph [ref=e432]:
                  - img [ref=e434]
                - paragraph [ref=e436]:
                  - text: $499,999 Was $503,735
                  - generic [ref=e437]: Save
                  - text: $3,736
                - img [ref=e438]
                - button [ref=e439]:
                  - img [ref=e440]
              - link [ref=e442]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/cobalt/826-w-angelina-dr
                - generic [ref=e443]: Cobalt Floorplan | Single Family
                - generic [ref=e444]: 826 W ANGELINA DR
                - generic [ref=e445]:
                  - paragraph [ref=e448]: 2,344 Sq. Ft.
                  - generic [ref=e449]:
                    - paragraph [ref=e450]: 4 Beds
                    - generic [ref=e451]: "|"
                    - paragraph [ref=e452]: 3 Baths
                  - paragraph [ref=e455]: 2 Car Garage
            - generic [ref=e458] [cursor=pointer]:
              - generic [ref=e460]:
                - paragraph [ref=e463]: Ready December 2026
                - paragraph [ref=e465]: $529,806
                - img [ref=e466]
                - button [ref=e467]:
                  - img [ref=e468]
              - link [ref=e470]:
                - /url: /arizona/phoenix/san-tan-valley/landmarke-50s/lagoon/827-w-angelina-dr
                - generic [ref=e471]: Lagoon Floorplan | Single Family
                - generic [ref=e472]: 827 W ANGELINA DR
                - generic [ref=e473]:
                  - paragraph [ref=e476]: 2,653 Sq. Ft.
                  - generic [ref=e477]:
                    - paragraph [ref=e478]: 4 Beds
                    - generic [ref=e479]: "|"
                    - paragraph [ref=e480]: 2 Baths
                  - generic [ref=e481]:
                    - paragraph [ref=e482]: 1 Half Bath
                    - generic [ref=e483]: "|"
                    - paragraph [ref=e485]: 3 Car Garage
          - button [ref=e487] [cursor=pointer]:
            - paragraph [ref=e489]: SHOW MORE
      - generic [ref=e492]:
        - heading [level=2] [ref=e493]: Schedule an appointment
        - generic [ref=e494]:
          - button [ref=e496] [cursor=pointer]:
            - generic [ref=e497]: IN-PERSON
          - button [ref=e498] [cursor=pointer]:
            - generic [ref=e499]: VIRTUAL
      - generic [ref=e502]:
        - heading [level=2] [ref=e503]: Self-guided tours available
        - link [ref=e506] [cursor=pointer]:
          - /url: https://mattamy.utourhomes.com/visitor?community=37d7e258-9f64-4f6b-aec3-e51d1574b33f&rootUrl=community&lang=en
          - generic [ref=e507]: Self-Guided Tour
      - generic [ref=e509]:
        - heading [level=2] [ref=e510]: Your destination - for work, play and life
        - generic [ref=e511]:
          - article [ref=e512]:
            - heading [level=3] [ref=e514]: Outdoor Amenities
            - paragraph [ref=e515]: Enjoy proposed outdoor covered gathering spaces.
          - article [ref=e516]:
            - heading [level=3] [ref=e518]: Open space
            - paragraph [ref=e519]: Stretch out in the open turf areas around the community.
          - article [ref=e520]:
            - heading [level=3] [ref=e522]: Play Structures
            - paragraph [ref=e523]: Spend some time at one of the communities shaded play structures.
          - article [ref=e524]:
            - heading [level=3] [ref=e526]: Sports Court
            - paragraph [ref=e527]: Enjoy a friendly game of bocce ball on one of the proposed courts.
          - article [ref=e528]:
            - heading [level=3] [ref=e530]: Walking Trails
            - paragraph [ref=e531]: Enjoy over a mile of walking trails meandering through the community.
      - generic [ref=e536]:
        - img [ref=e541]
        - generic [ref=e544]:
          - heading [level=2] [ref=e545]: HERS Index
          - generic [ref=e547]:
            - paragraph [ref=e548]: The Home Energy Rating System (HERS) is the industry standard scoring system that measures a home’s energy efficiency on a scale from zero to 150. A typical existing home score is 130 and a reference home is 100.
            - paragraph [ref=e549]: Landmarke has an average HERS score of 51. The lower the HERS score the more you save! Click below to learn more.
          - link [ref=e551] [cursor=pointer]:
            - /url: https://dam.mattamyhomes.com/digizuitecore/legacyservice/api/assetstream/156928/10061.pdf
            - generic [ref=e552]:
              - text: Learn More
              - img [ref=e553]
      - generic [ref=e557]:
        - heading [level=2] [ref=e558]: Thoughtfully designed with you in mind
        - generic [ref=e559]: Explore the community or model homes by selecting from the options below.
        - generic [ref=e561]:
          - radiogroup [ref=e563]:
            - radio [checked] [ref=e564] [cursor=pointer]:
              - paragraph [ref=e565]: Community Gallery
            - generic [ref=e566]: "|"
            - radio [ref=e567] [cursor=pointer]:
              - paragraph [ref=e568]: Cobalt
            - generic [ref=e569]: "|"
            - radio [ref=e570] [cursor=pointer]:
              - paragraph [ref=e571]: Garnet
            - generic [ref=e572]: "|"
            - radio [ref=e573] [cursor=pointer]:
              - paragraph [ref=e574]: Mahogany
            - generic [ref=e575]: "|"
            - radio [ref=e576] [cursor=pointer]:
              - paragraph [ref=e577]: Pacific
            - paragraph [ref=e578]: Slide has changed view to 0
          - generic [ref=e579]:
            - generic [ref=e581]:
              - button [ref=e583] [cursor=pointer]:
                - img [ref=e584]
              - generic [ref=e587]:
                - button [ref=e592] [cursor=pointer]
                - button [ref=e597] [cursor=pointer]
                - button [ref=e602] [cursor=pointer]
                - button [ref=e607] [cursor=pointer]
                - button [ref=e612] [cursor=pointer]
                - button [ref=e617] [cursor=pointer]
                - button [ref=e622] [cursor=pointer]
                - button [ref=e627] [cursor=pointer]
                - button [ref=e632] [cursor=pointer]
                - button [ref=e637] [cursor=pointer]
                - button [ref=e642] [cursor=pointer]
                - button [ref=e647] [cursor=pointer]
                - button [ref=e652] [cursor=pointer]
                - button [ref=e657] [cursor=pointer]
                - button [ref=e662] [cursor=pointer]
                - button [ref=e667] [cursor=pointer]
                - button [ref=e672] [cursor=pointer]
                - button [ref=e677] [cursor=pointer]
                - button [ref=e682] [cursor=pointer]
                - button [ref=e687] [cursor=pointer]
                - button [ref=e692] [cursor=pointer]
              - button [ref=e694] [cursor=pointer]:
                - img [ref=e695]
            - paragraph [ref=e698]:
              - generic [ref=e699]: Slide number
              - text: 1/19
      - generic [ref=e701]:
        - heading [level=2] [ref=e702]: Conveniently located to fit your needs
        - generic [ref=e703]:
          - article [ref=e704]:
            - heading [level=3] [ref=e706]: Dining
            - paragraph [ref=e707]:
              - generic [ref=e708]: You’re never far from a variety of great restaurants, cafes and eateries.
          - article [ref=e709]:
            - heading [level=3] [ref=e711]: Schools
            - paragraph [ref=e712]:
              - generic [ref=e713]: Great selection of local public schools as well as top-rated Charter Schools.
          - article [ref=e714]:
            - heading [level=3] [ref=e716]: Entertainment
            - paragraph [ref=e717]: Enjoy the areas Agritainment destinations like Schnepf Farms, Queen Creek Olive Mill and Hayden Flour Mill.
          - article [ref=e718]:
            - heading [level=3] [ref=e720]: Conveniences
            - paragraph [ref=e721]: Enjoy close proximity to everyday conveniences and necessities like grocery stores, drugstores and more.
          - article [ref=e722]:
            - heading [level=3] [ref=e724]: Location
            - paragraph [ref=e725]: Premier east valley location, near major employers and great access to SR-24 connecting to Loop 202.
          - article [ref=e726]:
            - heading [level=3] [ref=e728]: Medical centers
            - paragraph [ref=e729]:
              - generic [ref=e730]: Rest assured knowing you’re close by great medical centers like Banner Ironwood, just over 1 mile away.
          - article [ref=e731]:
            - heading [level=3] [ref=e733]: Outdoor recreation
            - paragraph [ref=e734]: Outdoor enthusiasts will enjoy the natural setting, close to parks, bike trails, golf courses and more.
          - article [ref=e735]:
            - heading [level=3] [ref=e737]: Retail
            - paragraph [ref=e738]:
              - generic [ref=e739]: Nearby Queen Creek Marketplace, Queen Creek District, and Cornerstone at Queen Creek for your retail needs.
      - generic [ref=e741]:
        - heading [level=2] [ref=e742]: Explore the community
        - generic [ref=e743]: Take a closer look at the community sitemap and get familiar with our available offerings.
        - generic [ref=e744]:
          - button [ref=e745] [cursor=pointer]:
            - img [ref=e746]
          - iframe [ref=e751]:
            - generic [ref=f16e3]:
              - generic [ref=f16e5]:
                - generic [ref=f16e11]:
                  - button "Hide UI" [ref=f16e12] [cursor=pointer]:
                    - img [ref=f16e14]
                  - button "Reset" [ref=f16e15] [cursor=pointer]:
                    - img [ref=f16e17]
                  - button "Print" [ref=f16e18] [cursor=pointer]:
                    - img [ref=f16e20]
                  - generic [ref=f16e21]:
                    - button "Increase Zoom" [ref=f16e22] [cursor=pointer]:
                      - img [ref=f16e24]
                    - button "Decrease Zoom" [ref=f16e25] [cursor=pointer]:
                      - img [ref=f16e27]
                  - generic "position controls" [ref=f16e29]:
                    - button "move map up" [ref=f16e30] [cursor=pointer]
                    - generic [ref=f16e32]:
                      - button "move map left" [ref=f16e33] [cursor=pointer]
                      - button "move map right" [ref=f16e36] [cursor=pointer]
                    - button "move map down" [ref=f16e38] [cursor=pointer]
                - generic [ref=f16e40]:
                  - generic [ref=f16e41]:
                    - generic [ref=f16e42]:
                      - img [ref=f16e44]
                      - generic [ref=f16e45]:
                        - text: Landmarke
                        - text: SITE MAP
                    - generic [ref=f16e46]:
                      - generic [ref=f16e47]: "Neighborhood:"
                      - combobox "Select Neighborhood" [disabled] [ref=f16e48]:
                        - generic [ref=f16e49]:
                          - generic [ref=f16e51]: Ruby Collection
                          - img [ref=f16e54]
                  - generic [ref=f16e55]:
                    - generic [ref=f16e57]:
                      - button "Homesite Search" [ref=f16e58] [cursor=pointer]
                      - button "Homesite Details"
                    - generic [ref=f16e60]:
                      - generic [ref=f16e63]:
                        - generic [ref=f16e64]:
                          - generic [ref=f16e65]:
                            - heading "Homesite Status" [level=2] [ref=f16e66]
                            - generic [ref=f16e67]: All
                          - button "Collapse Homesite Status" [ref=f16e68] [cursor=pointer]:
                            - img [ref=f16e70]
                        - generic [ref=f16e73]:
                          - generic [ref=f16e75]:
                            - img [ref=f16e77]
                            - generic [ref=f16e78]: Show All
                            - checkbox "Show All" [checked] [ref=f16e81] [cursor=pointer]
                          - generic [ref=f16e82]:
                            - generic [ref=f16e83]:
                              - generic [ref=f16e85]: Quick Move-In
                              - generic [ref=f16e86]: "12"
                              - checkbox "Quick Move-In" [checked] [ref=f16e89] [cursor=pointer]
                            - generic [ref=f16e90]:
                              - generic [ref=f16e92]: Quick Start Home
                              - generic [ref=f16e93]: "0"
                              - checkbox "Quick Start Home" [checked] [ref=f16e96] [cursor=pointer]
                            - generic [ref=f16e97]:
                              - generic [ref=f16e99]: Available
                              - generic [ref=f16e100]: "82"
                              - checkbox "Available" [checked] [ref=f16e103] [cursor=pointer]
                            - generic [ref=f16e104]:
                              - generic [ref=f16e106]: Sold
                              - generic [ref=f16e107]: "80"
                              - checkbox "Sold" [checked] [ref=f16e110] [cursor=pointer]
                            - generic [ref=f16e111]:
                              - generic [ref=f16e113]: Future
                              - generic [ref=f16e114]: "76"
                              - checkbox "Future" [checked] [ref=f16e117] [cursor=pointer]
                            - generic [ref=f16e118]:
                              - generic [ref=f16e120]: Models
                              - generic [ref=f16e121]: "4"
                              - checkbox "Models" [checked] [ref=f16e124] [cursor=pointer]
                      - generic [ref=f16e127]:
                        - generic [ref=f16e128]:
                          - generic [ref=f16e129]:
                            - checkbox [ref=f16e132] [cursor=pointer]
                            - heading "Tag Filter" [level=2] [ref=f16e133]
                          - button "Collapse Tag Filter" [ref=f16e134] [cursor=pointer]:
                            - img [ref=f16e136]
                        - combobox "Select a tag" [ref=f16e140]:
                          - generic [ref=f16e141] [cursor=pointer]:
                            - generic [ref=f16e142]: Select a tag
                            - img [ref=f16e145]
                  - button "Close Side Menu" [ref=f16e147] [cursor=pointer]:
                    - img [ref=f16e149]
              - generic:
                - generic:
                  - generic:
                    - img
      - generic [ref=e753]:
        - heading [level=2] [ref=e754]: Building Better
        - generic [ref=e756]: We build homes that provide additional comfort and greater savings thanks to innovative solutions.
        - generic [ref=e757]:
          - button [ref=e758] [cursor=pointer]:
            - img [ref=e759]
          - iframe [ref=e764]:
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
                    - button "Spray Foam Insulation" [ref=f8e26] [cursor=pointer]:
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
                        - button "Spray Foam Insulation" [ref=f8e132] [cursor=pointer]:
                          - generic [ref=f8e133]:
                            - heading "Spray Foam Insulation" [level=3] [ref=f8e134]
                            - paragraph [ref=f8e136]: Cathedral spray foam roof deck attic insulation brings ducts and HVAC equipment into conditioned space - Lowering cooling costs while keeping dust and bugs out.
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
      - generic [ref=e767]:
        - heading [level=2] [ref=e768]: Frequently Asked Questions
        - link [ref=e771] [cursor=pointer]:
          - /url: https://mattamyhomes.com/arizona/phoenix/san-tan-valley/landmarke-50s/FAQs
          - generic [ref=e772]: View FAQs
      - generic [ref=e777]:
        - img [ref=e782]
        - generic [ref=e785]:
          - heading [level=2] [ref=e786]: Mattamy Homes in Phoenix
          - generic [ref=e787]: Phoenix, Arizona’s sunny skies, trendsetting neighborhoods and endless outdoor adventures have made it one of the fastest-growing areas.
          - link [ref=e789] [cursor=pointer]:
            - /url: /arizona/phoenix
            - generic [ref=e790]: Learn More
      - generic [ref=e796]:
        - generic [ref=e797]:
          - heading [level=3] [ref=e798]: Sign Up For Community Updates
          - generic [ref=e800]: Required fields are marked with *
          - separator [ref=e801]
        - group [ref=e802]:
          - generic [ref=e803]:
            - textbox [ref=e804]
            - textbox [ref=e805]
            - generic [ref=e806]:
              - generic [ref=e807]: First name *
              - textbox [ref=e809]
            - generic [ref=e810]:
              - generic [ref=e811]: Last name *
              - textbox [ref=e813]
            - generic [ref=e814]:
              - generic [ref=e815]: Email *
              - textbox [ref=e817]
            - generic [ref=e818]:
              - generic [ref=e819]: Country of Residence *
              - generic [ref=e820]:
                - combobox [ref=e821] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e822]:
              - generic [ref=e823]: Zip/Postal Code *
              - textbox [ref=e825]
            - generic [ref=e826]:
              - generic [ref=e827]: Phone number
              - textbox [ref=e829]
            - generic [ref=e830]:
              - generic [ref=e831]: When do you want to move into your home?
              - generic [ref=e832]:
                - combobox [ref=e833] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e834]:
              - generic [ref=e835]: How many bedrooms do you need?
              - generic [ref=e836]:
                - combobox [ref=e837] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e838]:
              - generic [ref=e839]: What is your budget?
              - generic [ref=e840]:
                - combobox [ref=e841] [cursor=pointer]
                - generic:
                  - img
            - generic [ref=e843] [cursor=pointer]:
              - checkbox [ref=e844]
              - generic [ref=e845]: I am a Real Estate Agent
            - generic [ref=e847] [cursor=pointer]:
              - checkbox [ref=e848]
              - generic [ref=e849]:
                - text: "By entering my phone number and/or email address and checking the box, I confirm I would like to receive promotional emails and/or text messages (SMS) from Mattamy Homes and its affiliates. Msg/data rates may apply. Consent is not a condition of purchase. I can opt out anytime (i.e. SMS: reply STOP or use any other method described in our"
                - link [ref=e850]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: "; email: use unsubscribe link). Mattamy and our providers may collect campaign engagement data to improve our marketing efforts. For more information, see our"
                - link [ref=e851]:
                  - /url: /privacy-policy
                  - text: Privacy Policy
                - text: ","
                - link [ref=e852]:
                  - /url: /sms-privacy-policy
                  - text: SMS Privacy Policy
                - text: ","
                - link [ref=e853]:
                  - /url: /sms-terms-of-service
                  - text: SMS Terms of Service
                - text: ", and/or"
                - link [ref=e854]:
                  - /url: /contact-us
                  - text: Contact Us
                - text: .
            - button [ref=e856] [cursor=pointer]: SUBMIT
      - button [ref=e858] [cursor=pointer]:
        - generic [ref=e859]: View promotions
        - img [ref=e860]
    - contentinfo [ref=e862]:
      - generic [ref=e864]:
        - generic [ref=e865]:
          - generic [ref=e866]:
            - heading [level=2] [ref=e867]: Explore
            - list [ref=e869]:
              - listitem [ref=e870]:
                - link [ref=e871] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/us
                  - text: Mattamy Homes USA
              - listitem [ref=e872]:
                - link [ref=e873] [cursor=pointer]:
                  - /url: https://mattamyhomes.com/ca
                  - text: Mattamy Homes Canada
              - listitem [ref=e874]:
                - link [ref=e875] [cursor=pointer]:
                  - /url: /design-studio
                  - text: Design Studio
              - listitem [ref=e876]:
                - link [ref=e877] [cursor=pointer]:
                  - /url: /customer-care
                  - text: Customer Care
          - generic [ref=e879]:
            - heading [level=2] [ref=e880]: About Mattamy
            - list [ref=e882]:
              - listitem [ref=e883]:
                - link [ref=e884] [cursor=pointer]:
                  - /url: /about/about-mattamy
                  - text: About Us
              - listitem [ref=e885]:
                - link [ref=e886] [cursor=pointer]:
                  - /url: /contact
                  - text: Contact Us
              - listitem [ref=e887]:
                - link [ref=e888] [cursor=pointer]:
                  - /url: /about/careers
                  - text: Careers
              - listitem [ref=e889]:
                - link [ref=e890] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
                  - text: Media and Investor Relations
          - generic [ref=e892]:
            - heading [level=2] [ref=e893]: Connect With Us
            - generic [ref=e895]:
              - link [ref=e896] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomesUSA
                - img [ref=e897]
              - link [ref=e899] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomesusa/
                - img [ref=e900]
              - link [ref=e902] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e903]
              - link [ref=e905] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e906]
              - link [ref=e908] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e909]
        - generic [ref=e912]:
          - paragraph [ref=e913]:
            - link [ref=e914] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e915]: "|"
            - button [ref=e916] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e917]: "|"
            - link [ref=e918] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e919]: "|"
            - link [ref=e920] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e921]: "|"
            - link [ref=e922] [cursor=pointer]:
              - /url: /terms-and-conditions
              - text: Terms and Conditions
          - paragraph [ref=e923]:
            - img [ref=e924]
            - text: Copyright © 2026 Mattamy Homes. All rights reserved.
  - dialog "National promotion" [ref=e926]:
    - dialog "National promotion" [ref=e928]:
      - generic [ref=e929]:
        - button "Close national promotion popup" [ref=e931] [cursor=pointer]:
          - img "Close Icon" [ref=e932]
        - img "Mattamy Homes MOVE Savings Event featuring a low rate and limited-time savings on select new homes." [ref=e935]
        - generic [ref=e936]:
          - paragraph [ref=e939]: Save with an FHA Below-Market Fixed Rate - Going on Now!
          - link "View Offers" [ref=e941] [cursor=pointer]:
            - /url: https://mattamyhomes.com/arizona/phoenix/promos/move
            - generic [ref=e942]: View Offers
  - iframe [ref=e944]:
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
  87  |   }
  88  | 
  89  |   /** Country key this page object should use for country-specific expectations. */
  90  |   protected get locationKey(): LocationKey {
  91  |     return this.locationOverride ?? (this.location.country as LocationKey);
  92  |   }
  93  | 
  94  |   // Navigation
  95  | 
  96  |   /** Opens this page object's URL and clears the usual overlays on arrival. */
  97  |   async navigate(overrideLocation?: LocationKey): Promise<void> {
  98  |     const { baseURL, envName } = getEnvConfig();
  99  |     const location = getLocationConfig(overrideLocation ?? this.locationOverride);
  100 | 
  101 |     const targetUrl = `${baseURL}${location.homeURL}?${location.queryParam}`;
  102 | 
  103 |     await test.step(`Open Mattamy Homes home page for ${location.country} in ${envName}`, async () => {
  104 |       await this.registerConsentDialogHandlers();
  105 |       let response: PlaywrightResponse | null = null;
  106 |       try {
  107 |         response = await this.page.goto(targetUrl, {
  108 |           waitUntil: 'domcontentloaded',
  109 |           timeout: 90_000,
  110 |         });
  111 |       } catch (_error) {
  112 |         const currentUrl = this.page.url();
  113 |         const current = new URL(currentUrl);
  114 |         const target = new URL(targetUrl);
  115 |         const sameHost =
  116 |           current.hostname.replace(/^www\./i, '') === target.hostname.replace(/^www\./i, '');
  117 |         const reachedTarget =
  118 |           sameHost &&
  119 |           current.pathname === target.pathname &&
  120 |           current.searchParams.get('country') === target.searchParams.get('country');
  121 |         const domIsUsable = await this.page
  122 |           .evaluate(() => document.readyState !== 'loading')
  123 |           .catch(() => false);
  124 | 
  125 |         if (!reachedTarget || !domIsUsable) {
  126 |           await this.reportValue('Page not usable after navigation; retrying', targetUrl);
  127 |           response = await this.page.goto(targetUrl, {
  128 |             waitUntil: 'domcontentloaded',
  129 |             timeout: 90_000,
  130 |           });
  131 |         } else {
  132 |           await this.reportValue('Navigation timed out after render; continuing from', currentUrl);
  133 |         }
  134 |       }
  135 | 
  136 |       // Checked outside the try: a 4xx/5xx is not a navigation timeout, and
  137 |       // letting the catch above swallow it is what turns a server error into a
  138 |       // misleading locator failure much later in the test.
  139 |       this.expectNavigationServed(response, targetUrl);
  140 | 
  141 |       await this.acceptCookiesIfPresent();
  142 | 
  143 |       // Use the shared load handler rather than an inline wait.
  144 |       await this.waitForPageReady();
  145 | 
  146 |       // Recover from a blank render before handing control back.
  147 |       await this.ensurePageRendered();
  148 | 
  149 |       // Clear the National-promotion overlay centrally, not in each page object: it
  150 |       // appears a beat after navigation as a full-screen dialog and swallows clicks.
  151 |       // appearTimeout gives it that beat; when it never shows, the wait is all it costs.
  152 |       await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
  153 |     });
  154 |   }
  155 | 
  156 |   /**
  157 |    * Fails the test when the server did not actually serve the page.
  158 |    *
  159 |    * A 4xx/5xx still renders a document, so an unchecked navigation leaves the
  160 |    * suite hunting for content on the browser's error page and reporting
  161 |    * "element(s) not found" 15s later instead of naming the status.
  162 |    *
  163 |    * A null response means a same-document navigation, which has no response of
  164 |    * its own and nothing to check.
  165 |    */
  166 |   protected expectNavigationServed(response: PlaywrightResponse | null, url: string): void {
  167 |     if (!response) {
  168 |       return;
  169 |     }
  170 | 
  171 |     expect(
  172 |       response.status(),
  173 |       `${url} should be served without a client/server error before its content is validated`,
  174 |     ).toBeLessThan(400);
  175 |   }
  176 | 
  177 |   /**
  178 |    * Opens a URL and checks the server served it.
  179 |    *
  180 |    * The shared entry point for page objects that navigate straight to their own
  181 |    * URL instead of going through {@link navigate}.
  182 |    */
  183 |   protected async gotoAndVerifyResponse(
  184 |     url: string,
  185 |     options: { waitUntil?: 'domcontentloaded' | 'load' | 'commit'; timeout?: number } = {},
  186 |   ): Promise<PlaywrightResponse | null> {
> 187 |     const response = await this.page.goto(url, {
      |                                      ^ TimeoutError: page.goto: Timeout 90000ms exceeded.
  188 |       waitUntil: options.waitUntil ?? 'domcontentloaded',
  189 |       timeout: options.timeout ?? 90_000,
  190 |     });
  191 | 
  192 |     this.expectNavigationServed(response, url);
  193 | 
  194 |     return response;
  195 |   }
  196 | 
  197 |   /**
  198 |    * Waits for the app to paint. Returns whether it did.
  199 |    *
  200 |    * The site ships an anti-flicker guard that sets `body.style.visibility =
  201 |    * "hidden"` in the document head and clears it only from `window.onload`, so
  202 |    * until the last image, iframe and third-party script has settled EVERY
  203 |    * element on the page is correctly reported hidden - the header, the search
  204 |    * box, the lead forms, all of it. Measured on STAGE that gate clears in 10-17s
  205 |    * on a healthy connection, which is why nothing may conclude "blank page"
  206 |    * inside the ordinary assertion window: doing so turns one slow load into a
  207 |    * pile of unrelated-looking "element is not visible" failures.
  208 |    *
  209 |    * Non-throwing, so callers decide what a page that never painted means for
  210 |    * them.
  211 |    */
  212 |   protected async waitForAppPainted(timeout = BasePage.APP_PAINT_TIMEOUT): Promise<boolean> {
  213 |     if (await this.pollBodyVisible(timeout)) {
  214 |       return true;
  215 |     }
  216 | 
  217 |     // The guard is the site's own inline style, so a body still hidden after the
  218 |     // full window is recoverable without touching anything else on the page.
  219 |     if (!(await this.clearAppPaintGuardIfStuck())) {
  220 |       return false;
  221 |     }
  222 | 
  223 |     return this.pollBodyVisible(5_000);
  224 |   }
  225 | 
  226 |   /** Waits for the site to stop rendering <body> with visibility:hidden. */
  227 |   private async pollBodyVisible(timeout: number): Promise<boolean> {
  228 |     return this.page
  229 |       .waitForFunction(
  230 |         () => !!document.body && getComputedStyle(document.body).visibility !== 'hidden',
  231 |         null,
  232 |         {
  233 |           timeout,
  234 |           polling: 250,
  235 |         },
  236 |       )
  237 |       .then(() => true)
  238 |       .catch(() => false);
  239 |   }
  240 | 
  241 |   /**
  242 |    * Drops the site's anti-flicker guard when the load event never arrives.
  243 |    *
  244 |    * `<body style="visibility: hidden">` ships in the HTML and the site clears it
  245 |    * from its own `window.onload` handler. WebKit can leave that load event
  246 |    * pending for good - `document.readyState` sits at "interactive" with no
  247 |    * requests outstanding - so a fully rendered DOM stays invisible and every
  248 |    * visibility assertion fails for a reason that has nothing to do with the page
  249 |    * under test.
  250 |    *
  251 |    * Deliberately narrow: it clears the inline attribute only, and only while
  252 |    * that attribute is what hides the body. A body hidden by a stylesheet, by a
  253 |    * parent, or one that rendered nothing at all is left exactly as it is, so a
  254 |    * genuinely blank page still fails.
  255 |    */
  256 |   protected async clearAppPaintGuardIfStuck(): Promise<boolean> {
  257 |     const cleared = await this.page
  258 |       .evaluate(() => {
  259 |         const body = document.body;
  260 | 
  261 |         if (!body || body.style.visibility !== 'hidden' || body.childElementCount === 0) {
  262 |           return false;
  263 |         }
  264 | 
  265 |         body.style.removeProperty('visibility');
  266 | 
  267 |         return getComputedStyle(body).visibility !== 'hidden';
  268 |       })
  269 |       .catch(() => false);
  270 | 
  271 |     if (cleared) {
  272 |       await this.reportValue(
  273 |         "Cleared the site's window.onload flicker guard - the load event never fired, so <body> stayed hidden over a rendered DOM",
  274 |         this.page.url(),
  275 |       );
  276 |     }
  277 | 
  278 |     return cleared;
  279 |   }
  280 | 
  281 |   /**
  282 |    * Reloads the page when the app never painted.
  283 |    *
  284 |    * The HTML shell can load - so the title is right and the page looks fine -
  285 |    * while the SPA renders nothing, leaving every locator to time out. Never
  286 |    * throws: if it is still blank after the retries, the normal assertions say so.
  287 |    *
```