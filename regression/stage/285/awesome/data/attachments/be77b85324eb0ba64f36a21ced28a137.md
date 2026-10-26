# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketPage.spec.ts >> Market page tests - CAN >> Configured market deep validation - Calgary >> @regression | CAN | Validate Discover Our Homes section
- Location: tests/marketPage.spec.ts:118:9

# Error details

```
Error: Discover Our Homes section was not found on https://stagemh-sc.exsquared.com/alberta/calgary.

This is treated as a failure because "market.discoverOurHomesSection" is not declared optional for CAN.
If this feature genuinely does not exist there, add it to OPTIONAL_BY_LOCATION in
config/features/featureExpectations.ts under "CAN". Otherwise the locator or the
page itself is broken - which is exactly what this assertion exists to surface.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e7]:
        - link "Mattamy logo in Calgary Alberta by Mattamy Homes. Go to HomePage" [ref=e8] [cursor=pointer]:
          - /url: /
          - figure [ref=e9]:
            - img "Mattamy logo in Calgary Alberta by Mattamy Homes" [ref=e10]
        - navigation [ref=e11]
        - generic [ref=e12]:
          - button "Go to Favorites Page" [ref=e13] [cursor=pointer]:
            - img "Favorite Icon" [ref=e14]
          - button "Select your country. CANADA country is selected" [ref=e19] [cursor=pointer]:
            - generic [ref=e21]: CANADA
            - img [ref=e23]
    - link "Navigate to Top." [ref=e25] [cursor=pointer]:
      - img [ref=e26]
    - main [ref=e28]:
      - generic [ref=e31]:
        - heading "Calgary" [level=1] [ref=e32]
        - generic [ref=e33]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
        - link "Navigate to more information on this page." [ref=e34] [cursor=pointer]:
          - img [ref=e35]
      - region "Sales center contact and quick links" [ref=e39]:
        - paragraph [ref=e41]:
          - generic [ref=e42]: "New Homes in Calgary, Alberta:"
          - text: Explore 9 quick move-in homes across 4 communities in
          - link "Airdrie" [ref=e43] [cursor=pointer]:
            - /url: /search?productType=community&metro=Calgary&country=CAN&community=All&hideMap=false&homeType=All&city=Airdrie
          - text: ","
          - link "Calgary" [ref=e44] [cursor=pointer]:
            - /url: /search?productType=community&metro=Calgary&country=CAN&community=All&hideMap=false&homeType=All&city=Calgary
          - text: and
          - link "Northwest Calgary" [ref=e45] [cursor=pointer]:
            - /url: /search?productType=community&metro=Calgary&country=CAN&community=All&hideMap=false&homeType=All&city=Northwest%20Calgary
          - text: . Attached and detached, 2–5 bedrooms, from $101
        - generic [ref=e46]:
          - generic [ref=e47]:
            - heading "Discover our homes" [level=2] [ref=e48]
            - paragraph [ref=e49]: Explore floorplans and quick move-in homes ready for you.
          - generic [ref=e50]:
            - link "View 86 Floorplans" [ref=e51] [cursor=pointer]:
              - /url: /search?productType=plan&metro=Calgary&country=CAN&community=Calgary&hideMap=true
            - link "View 9 Quick Move-Ins" [ref=e52] [cursor=pointer]:
              - /url: /search?productType=qmi&metro=Calgary&country=CAN&community=Calgary&hideMap=true
      - generic [ref=e54]:
        - heading "Welcome to Calgary" [level=2] [ref=e55]
        - paragraph [ref=e58]: What's it like to make Calgary your home? For starters, you'll always enjoy a breath of fresh air! Not only is Calgary a consistently top scorer in stability, healthcare, culture, environment, education and infrastructure, it's also an impeccably clean city with a view of the Rocky Mountains that will take your breath away. In Calgary, you'll never be far from nature, year-round outdoor recreation and all the urban amenities you could want. Enjoy great shopping, world-class restaurants and an exciting art culture scene - all within your reach! Choose Calgary as your home and find a life of abundance, comfort and daily inspiration.
      - generic [ref=e59]:
        - generic [ref=e60]:
          - heading "Explore communities in this market area" [level=2] [ref=e61]
          - generic [ref=e62]: People live in houses. And we live together in neighborhoods. The Mattamy way is an approach to home and community design that prioritizes how you really live.
        - generic [ref=e64]:
          - listitem [ref=e65]:
            - link "Carrington Northwest Calgary, Alberta Experience inspired living at Carrington, a unique place to live, play and grow. - TESTStarting from $523,990. View Carrington information." [ref=e67] [cursor=pointer]:
              - /url: /alberta/calgary/calgary/carrington
              - generic [ref=e68]:
                - img "Kitchen with grey cabinets, pendant lights, steel appliances, white countertops, kitchen island, next to dining room table" [ref=e71]
                - generic [ref=e72]:
                  - generic [ref=e73]:
                    - paragraph [ref=e76]: Now Selling
                    - generic [ref=e77]: Carrington
                    - generic [ref=e79]:
                      - paragraph [ref=e81]: Northwest Calgary, Alberta
                      - paragraph [ref=e83]: Experience inspired living at Carrington, a unique place to live, play and grow. - TEST
                  - button "Starting from $523,990" [ref=e84]:
                    - generic [ref=e85]: Starting from $523,990
          - listitem [ref=e86]:
            - link "Cityscape Calgary, Alberta Natural beauty meets urban living at Cityscape, surrounding a lovely environmental reserve. Starting from $512,990. View Cityscape information." [ref=e88] [cursor=pointer]:
              - /url: /alberta/calgary/calgary/cityscape
              - generic [ref=e89]:
                - img "Open kitchen with white cabinets, dark tile backsplash, pendant light over dining area and kitchen island, white marble countertops, dark wood flooring" [ref=e92]
                - generic [ref=e93]:
                  - generic [ref=e94]:
                    - paragraph [ref=e97]: Now Selling
                    - generic [ref=e98]: Cityscape
                    - generic [ref=e100]:
                      - paragraph [ref=e102]: Calgary, Alberta
                      - paragraph [ref=e104]: Natural beauty meets urban living at Cityscape, surrounding a lovely environmental reserve.
                  - button "Starting from $512,990" [ref=e105]:
                    - generic [ref=e106]: Starting from $512,990
          - listitem [ref=e107]:
            - link "Southwinds Airdrie, Alberta Feel the natural grace of Southwinds, welcomed by an amazing environmental reserve.Starting from $101. View Southwinds information." [ref=e109] [cursor=pointer]:
              - /url: /alberta/calgary/airdrie/southwinds
              - generic [ref=e110]:
                - img "Kitchen with Fridge" [ref=e113]
                - generic [ref=e114]:
                  - generic [ref=e115]:
                    - paragraph [ref=e118]: Now Selling
                    - generic [ref=e119]: Southwinds
                    - generic [ref=e121]:
                      - paragraph [ref=e123]: Airdrie, Alberta
                      - paragraph [ref=e125]: Feel the natural grace of Southwinds, welcomed by an amazing environmental reserve.
                  - button "Starting from $101" [ref=e126]:
                    - generic [ref=e127]: Starting from $101
          - listitem [ref=e128]:
            - link "Yorkville Calgary, Alberta nullStarting from $469,990. View Yorkville information." [ref=e130] [cursor=pointer]:
              - /url: /alberta/calgary/calgary/yorkville
              - generic [ref=e131]:
                - img "Row of homes at dusk, black fence, flagpoles" [ref=e134]
                - generic [ref=e135]:
                  - generic [ref=e136]:
                    - paragraph [ref=e139]: Now Selling
                    - generic [ref=e140]: Yorkville
                    - paragraph [ref=e144]: Calgary, Alberta
                  - button "Starting from $469,990" [ref=e145]:
                    - generic [ref=e146]: Starting from $469,990
      - generic [ref=e149]:
        - heading "Experience the Mattamy Difference in Alberta" [level=2] [ref=e150]
        - paragraph [ref=e153]: Unlock the life you want in a home and community that inspires you every day.
      - generic [ref=e158]:
        - generic [ref=e161]:
          - generic [ref=e162]:
            - button "Previous slide on Multiblock" [ref=e164] [cursor=pointer]:
              - img [ref=e165]
            - generic [ref=e168]:
              - img [ref=e172]
              - img "The Mattamy Difference" [ref=e176]
              - img [ref=e180]
              - img [ref=e184]
              - img [ref=e188]
              - img [ref=e192]
            - button "Next slide of Multiblock" [ref=e194] [cursor=pointer]:
              - img [ref=e195]
          - paragraph [ref=e198]: 1/4
        - log [ref=e200]:
          - generic [ref=e201]:
            - heading "Building Homes, Creating Communities" [level=2] [ref=e202]
            - paragraph [ref=e205]: For 45 years and counting, we’ve been building for how you truly live. From innovative designs to personalized customer care, Mattamy redefines what it means to feel at home. Scroll through to discover how we go beyond building houses to create thriving communities that are thoughtfully designed for the way you live.
      - generic [ref=e207]:
        - heading "Explore the incredible amenities offered by the city of Calgary." [level=2] [ref=e208]
        - generic [ref=e209]:
          - article [ref=e210]:
            - heading "Arenas and Athletic Parks" [level=3] [ref=e212]
            - paragraph [ref=e213]: Find hockey rinks, soccer arenas and other athletic parks across Calgary.
          - article [ref=e214]:
            - heading "Parks" [level=3] [ref=e216]
            - paragraph [ref=e217]: Explore Calgary's many public parks, including Edworthy Park and Riley Park.
          - article [ref=e218]:
            - heading "Shopping Malls" [level=3] [ref=e220]
            - paragraph [ref=e221]: CF Chinook Centre is your go-to shopping, dining and entertainment destination.
          - article [ref=e222]:
            - heading "Proximity to Nature" [level=3] [ref=e224]
            - paragraph [ref=e225]: Calgary is close to the Banff National Park and many hiking and fishing spots.
          - article [ref=e226]:
            - heading "Art Centres" [level=3] [ref=e228]
            - paragraph [ref=e229]: Experience the city's art and culture with many galleries and museums in Calgary.
          - article [ref=e230]:
            - heading "Golf Courses" [level=3] [ref=e232]
            - paragraph [ref=e233]: Tee up and play a game of 18 holes at the seven Fairways in Calgary.
          - article [ref=e234]:
            - heading "Pools and Splash Parks" [level=3] [ref=e236]
            - paragraph [ref=e237]: Beat the summer heat with multiple indoor and outdoor pools and splash parks.
          - article [ref=e238]:
            - heading "Education" [level=3] [ref=e240]
            - paragraph [ref=e241]: Calgary has many established schools for all ages, including the University of Calgary.
      - generic [ref=e246]:
        - img "Woman in a cowboy hat, blue button up, and jeans, rides a brown horse and turns a sharp corner around a large barrel" [ref=e251]
        - generic [ref=e254]:
          - heading "Calgary Stampede - HELLO" [level=2] [ref=e255]
          - generic [ref=e256]: For 10 days in July, the city transforms into one of Canada's premiere celebrations - a tribute to the Old West filled with cowboy hats, music, food and culture that's been dubbed "The Greatest Outdoor Show on Earth." The Calgary Stampede helps to preserve and celebrate Western heritage, culture and community spirit. Filled with parades, bronco rides, special events and music, the Stampede is truly an event unlike any other.
      - generic [ref=e261]:
        - img "Overhead view of The Rocky Mountains with blue river surrounded by many trees, large mountains, and blue sky" [ref=e266]
        - generic [ref=e269]:
          - heading "Rocky Mountains" [level=2] [ref=e270]
          - generic [ref=e271]: "The Rocky Mountains Natural Region is 49,070 square km in size, encompassing 7.4 percent of Alberta. It is located on the South-Western border of the province, reaching from the top of Willmore Wilderness Park to the bottom of Waterton Lakes National Park. The unmistakable snowcapped peaks of the Rockies are at the core of Alberta's cultural identity: housing wildlife, providing clean water and playing a major role in Alberta's economy."
      - generic [ref=e276]:
        - img "Top of the Calgary Tower stands beside other tall buildings with pink, purple, and blue sunset in the back" [ref=e281]
        - generic [ref=e284]:
          - heading "Calgary Tower" [level=2] [ref=e285]
          - generic [ref=e286]: Calgary Tower is a free-standing 191-metre tall observation deck in downtown Calgary, offering panoramic views of the city. Originally called Huskey Tower, Calgary Tower was built to honour Canada's centennial year of 1967 and to promote growth in the downtown area. It was opened to the public in 1968 as the tallest building in Canada outside of Toronto. There are 802 steps inside the tower leading to the top.
      - generic [ref=e291]:
        - img "People with their hands in the middle." [ref=e296]
        - generic [ref=e299]:
          - heading "Mattamy’s Calgary Community Investments" [level=2] [ref=e300]
          - paragraph [ref=e303]: At Mattamy, we believe that at the heart of every great community are the welcoming people doing inspiring things. Read more about our community investments and sponsorships below.
          - link "Learn More" [ref=e305] [cursor=pointer]:
            - /url: /alberta/calgary/sponsorships
            - generic [ref=e306]: Learn More
      - generic [ref=e309]:
        - heading "Part of the Community" [level=2] [ref=e310]
        - generic [ref=e311]: We care deeply about making a difference in the communities where we live and work.
      - generic [ref=e316]:
        - generic [ref=e319]:
          - generic [ref=e320]:
            - button "Previous slide on Multiblock" [ref=e322] [cursor=pointer]:
              - img [ref=e323]
            - generic [ref=e326]:
              - img [ref=e330]
              - img "Overhead view of construction workers looking over notebook with construction supplies around them" [ref=e334]
              - img [ref=e338]
              - img [ref=e342]
              - img [ref=e346]
              - img [ref=e350]
              - img [ref=e354]
              - img [ref=e358]
            - button "Next slide of Multiblock" [ref=e360] [cursor=pointer]:
              - img [ref=e361]
          - paragraph [ref=e364]: 1/6
        - log [ref=e366]:
          - generic [ref=e367]:
            - heading "We believe in safety before anything else" [level=2] [ref=e368]
            - generic [ref=e369]: We’re proud to share that we are a finalist for this year’s BILD Alberta’s Safety Leadership Award, a recognition presented to companies with an innovative approach to safety and employees dedicated to promoting safety on the job and in our communities.
      - generic [ref=e372]:
        - heading "Discover the incredible Mattamy communities in Calgary" [level=2] [ref=e373]
        - generic [ref=e376]: Experience life in the city as a member of one of Mattamy's outstanding Calgary communities, including Southwinds, Cityscape, Carrington and many more.
      - generic [ref=e379] [cursor=pointer]:
        - button "New home rebates available!" [ref=e380]:
          - generic [ref=e382]:
            - img "Click Here New home rebates available!" [ref=e385]
            - generic [ref=e388]: click here
        - generic [ref=e389]: "1"
        - img [ref=e391]
    - contentinfo "footer" [ref=e393]:
      - generic [ref=e395]:
        - generic [ref=e396]:
          - generic [ref=e397]:
            - heading "Explore" [level=2] [ref=e398]
            - list [ref=e400]:
              - listitem [ref=e401]:
                - link "Mattamy Homes USA" [ref=e402] [cursor=pointer]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e403]:
                - link "Mattamy Homes Canada" [ref=e404] [cursor=pointer]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e405]:
                - link "Design Studio" [ref=e406] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e407]:
                - link "Customer Care" [ref=e408] [cursor=pointer]:
                  - /url: /customer-care
          - generic [ref=e410]:
            - heading "About Mattamy" [level=2] [ref=e411]
            - list [ref=e413]:
              - listitem [ref=e414]:
                - link "About Us" [ref=e415] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e416]:
                - link "Contact Us" [ref=e417] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e418]:
                - link "Careers" [ref=e419] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e420]:
                - link "Media and Investor Relations" [ref=e421] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e423]:
            - heading "Connect With Us" [level=2] [ref=e424]
            - generic [ref=e426]:
              - link "Facebook (opens in a new tab)" [ref=e427] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomesUSA
                - img [ref=e428]
              - link "Instagram (opens in a new tab)" [ref=e430] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomesusa/
                - img [ref=e431]
              - link "Youtube (opens in a new tab)" [ref=e433] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e434]
              - link "Pinterest (opens in a new tab)" [ref=e436] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e437]
              - link "Linkedin (opens in a new tab)" [ref=e439] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e440]
        - generic [ref=e443]:
          - paragraph [ref=e444]:
            - link "Accessibility" [ref=e445] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e446]: "|"
            - button "Cookie Settings" [ref=e447] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e448]: "|"
            - link "Legal Disclaimers" [ref=e449] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e450]: "|"
            - link "Privacy Policy" [ref=e451] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e452]: "|"
            - link "Terms and Conditions" [ref=e453] [cursor=pointer]:
              - /url: /terms-and-conditions
              - text: Terms and Conditions
              - generic [ref=e454]: "|"
            - link "About Us" [ref=e455] [cursor=pointer]:
              - /url: /about/about-mattamy
          - paragraph [ref=e456]: Copyright © 2025 Mattamy Homes. All rights reserved.
```

# Test source

```ts
  21  |   | 'community.directionsCta'
  22  |   | 'community.scheduleAppointmentCta'
  23  |   // Market page
  24  |   | 'market.communitySection'
  25  |   | 'market.discoverOurHomesSection'
  26  |   // QMI page
  27  |   | 'qmi.salesOfficeSection'
  28  |   | 'qmi.salesOfficeMapLink'
  29  |   // Plan / condo plan
  30  |   | 'plan.mediaGallery'
  31  |   | 'condoPlan.showMoreFloorplans'
  32  |   // Condo community
  33  |   | 'condoCommunity.availableFloorplansSection'
  34  |   | 'condoCommunity.galleryModal'
  35  |   | 'condoCommunity.galleryModalMedia'
  36  |   | 'condoCommunity.inPageGalleryMedia'
  37  |   // MPC
  38  |   | 'mpc.imageGallery'
  39  |   | 'mpc.galleryModalMedia'
  40  |   // About Us
  41  |   | 'about.showMore'
  42  |   | 'about.investorForm'
  43  |   // Promo page
  44  |   | 'promo.leadForm';
  45  | 
  46  | type OptionalFeatureRules = Partial<Record<LocationKey, readonly FeatureKey[]>>;
  47  | 
  48  | /** Features that genuinely do not exist for a country, in every environment. */
  49  | const OPTIONAL_BY_LOCATION: OptionalFeatureRules = {
  50  |   // `promoURL` can point at any promotion, and not every promotion carries a
  51  |   // lead form - the form checks run when it is there and are skipped when not.
  52  |   USA: ['promo.leadForm'],
  53  |   CAN: [
  54  |     'promo.leadForm',
  55  |     // Canadian community pages have no appointment scheduling at all.
  56  |     'community.scheduleAppointmentCta',
  57  |     // Condo plan pages list every floorplan and link out to search with
  58  |     // "View all" instead of expanding in place.
  59  |     'condoPlan.showMoreFloorplans',
  60  |   ],
  61  | };
  62  | 
  63  | /** Per-environment exceptions, for content that only exists on one environment. */
  64  | const OPTIONAL_BY_ENVIRONMENT: Partial<Record<string, OptionalFeatureRules>> = {
  65  |   // PROD: { USA: ['market.discoverOurHomesSection'] },
  66  | };
  67  | 
  68  | /** True when this feature is allowed to be missing for the location being run. */
  69  | export function isFeatureOptional(feature: FeatureKey, location: LocationKey): boolean {
  70  |   const { envName } = getEnvConfig();
  71  | 
  72  |   if (OPTIONAL_BY_ENVIRONMENT[envName]?.[location]?.includes(feature)) {
  73  |     return true;
  74  |   }
  75  | 
  76  |   return OPTIONAL_BY_LOCATION[location]?.includes(feature) ?? false;
  77  | }
  78  | 
  79  | /** Failure text naming the key and file to edit if the absence is real. */
  80  | export function buildMissingFeatureMessage(
  81  |   feature: FeatureKey,
  82  |   description: string,
  83  |   location: LocationKey,
  84  |   pageUrl: string,
  85  | ): string {
  86  |   return [
  87  |     `${description} was not found on ${pageUrl}.`,
  88  |     '',
  89  |     `This is treated as a failure because "${feature}" is not declared optional for ${location}.`,
  90  |     'If this feature genuinely does not exist there, add it to OPTIONAL_BY_LOCATION in',
  91  |     `config/features/featureExpectations.ts under "${location}". Otherwise the locator or the`,
  92  |     'page itself is broken - which is exactly what this assertion exists to surface.',
  93  |   ].join('\n');
  94  | }
  95  | 
  96  | /**
  97  |  * The present / optional / missing decision.
  98  |  *
  99  |  * No Playwright types here on purpose, so desktop and mobile
  100 |  * share one rule instead of two copies that drift apart. Returns the value when
  101 |  * present, null when declared optional, throws when required and missing.
  102 |  */
  103 | export function resolveFeature<T>(
  104 |   value: T | null | undefined,
  105 |   feature: FeatureKey,
  106 |   description: string,
  107 |   location: LocationKey,
  108 |   pageUrl: string,
  109 | ): { value: T; skipMessage?: undefined } | { value: null; skipMessage: string } {
  110 |   if (value) {
  111 |     return { value };
  112 |   }
  113 | 
  114 |   if (isFeatureOptional(feature, location)) {
  115 |     return {
  116 |       value: null,
  117 |       skipMessage: `${description} not present (declared optional for ${location})`,
  118 |     };
  119 |   }
  120 | 
> 121 |   throw new Error(buildMissingFeatureMessage(feature, description, location, pageUrl));
      |         ^ Error: Discover Our Homes section was not found on https://stagemh-sc.exsquared.com/alberta/calgary.
  122 | }
  123 | 
```