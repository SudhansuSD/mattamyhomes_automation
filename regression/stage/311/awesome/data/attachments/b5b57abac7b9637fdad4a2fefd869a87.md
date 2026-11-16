# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aboutUsPages.spec.ts >> Mattamy Homes - CAN Header About Us Links >> About Us Page Validation >> @regression | CAN | Media and Investor Relations page should load with valid UI and functionality
- Location: tests/aboutUsPages.spec.ts:54:11

# Error details

```
Error: Expected a link matching /mediaroom\.com/i

expect(received).toBeTruthy()

Received: false

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - banner [ref=e7]:
      - generic [ref=e8]:
        - link "Mattamy logo. Go to HomePage" [ref=e9] [cursor=pointer]:
          - /url: /
          - figure [ref=e10]:
            - img "Mattamy logo" [ref=e11]
        - navigation [ref=e12]:
          - generic [ref=e13]:
            - button "Find Your Dream Home" [ref=e15] [cursor=pointer]:
              - paragraph [ref=e16]:
                - text: Find Your Dream Home
                - img [ref=e17]
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
          - link "Sustainability" [ref=e20] [cursor=pointer]:
            - /url: /about/sustainability
            - paragraph [ref=e21]: Sustainability
          - button "Resources" [ref=e24] [cursor=pointer]:
            - paragraph [ref=e25]:
              - text: Resources
              - img [ref=e26]
          - link "Customer Care" [ref=e29] [cursor=pointer]:
            - /url: /customer-care
            - paragraph [ref=e30]: Customer Care
          - button "About" [ref=e33] [cursor=pointer]:
            - paragraph [ref=e34]:
              - text: About
              - img [ref=e35]
          - link "Contact Us" [ref=e38] [cursor=pointer]:
            - /url: /contact
            - paragraph [ref=e39]: Contact Us
        - generic [ref=e40]:
          - button "Go to Favorites Page" [ref=e41] [cursor=pointer]:
            - img "Favorite Icon" [ref=e42]
          - button "Select your country. CANADA country is selected" [ref=e47] [cursor=pointer]:
            - generic [ref=e49]: CANADA
            - img [ref=e51]
    - main [ref=e53]:
      - generic [ref=e57]:
        - heading "Media and Investor Relations" [level=1] [ref=e58]
        - paragraph [ref=e61]: Resources, company news releases and contact information for media and investors.
      - img "image with White mug with blue Mattamy Homes logo on it, being displayed on a wooden coffee table" [ref=e66]
      - generic [ref=e68]:
        - heading "News Releases" [level=2] [ref=e70]
        - generic [ref=e72]: Loading data...
      - generic [ref=e73]:
        - heading "Media Resources" [level=2] [ref=e75]
        - generic [ref=e78]:
          - heading "Mattamy Homes Fact Sheet" [level=2] [ref=e79]
          - link "Mattamy Homes Fact Sheet Download PDF" [ref=e82] [cursor=pointer]:
            - /url: /dfsmedia/a2b99d47a71047839a5a4241f44710ce/86358-source/mattamy-homes-f24-fact-sheet
            - generic [ref=e83]: Download PDF
      - generic [ref=e85]:
        - heading "Media and Investor Contacts" [level=3] [ref=e87]
        - generic [ref=e88]:
          - generic [ref=e90]:
            - heading "Investors" [level=3] [ref=e91]
            - generic [ref=e93]:
              - img [ref=e95]
              - link "Email to bondholders@mattamycorp.com" [ref=e98] [cursor=pointer]:
                - /url: mailto:bondholders@mattamycorp.com
                - text: bondholders@mattamycorp.com
          - generic [ref=e100]:
            - heading "Media" [level=3] [ref=e101]
            - generic [ref=e103]:
              - img [ref=e105]
              - link "Email to media@mattamycorp.com" [ref=e108] [cursor=pointer]:
                - /url: mailto:media@mattamycorp.com
                - text: media@mattamycorp.com
      - generic [ref=e110]:
        - generic [ref=e111]:
          - heading "Investors' Certificate for Request to Access Conference Calls and Financial Reports" [level=3] [ref=e112]
          - paragraph [ref=e113]: Pursuant to section 4.03 of the Indenture (the “Indenture”) dated November 15, 2012, among Mattamy Group Corporation (“Mattamy”), certain Subsidiary Guarantors, Computershare as Trustee, relating to Mattamy’s US$ 6.50% Senior Notes due 2020 (the “US$ Notes”) and C$ 6.875% Senior Notes due 2020 (the “C$ Notes” and together with the US$ Notes, the “Notes”), Mattamy is required to provide access to financial reports and quarterly conference calls under certain conditions.
        - group [ref=e114]:
          - generic [ref=e115]:
            - generic [ref=e116]:
              - generic [ref=e118]: "To request access to conference calls and financial reports, please select an option below to help us identify who you are. Select all that apply:"
              - group [ref=e119]:
                - generic [ref=e121]:
                  - checkbox "A benefical owner of Notes" [ref=e122]
                  - generic [ref=e123]: A benefical owner of Notes
                - generic [ref=e125]:
                  - checkbox "A \"qualified institutional buyer\" within the meaning of Rule 144A(a)(1) under the U.S. Securities Act of 1933, ad amended;" [ref=e126]
                  - generic [ref=e127]: A "qualified institutional buyer" within the meaning of Rule 144A(a)(1) under the U.S. Securities Act of 1933, ad amended;
                - generic [ref=e129]:
                  - checkbox "A prospective investor in the Notes or other securities of Mattamy and not a \"U.S. person\" within the meaning of Rule 902(k) of Regulation S under the U.S. Securities Act of 1933, as amended; or" [ref=e130]
                  - generic [ref=e131]: A prospective investor in the Notes or other securities of Mattamy and not a "U.S. person" within the meaning of Rule 902(k) of Regulation S under the U.S. Securities Act of 1933, as amended; or
                - generic [ref=e133]:
                  - checkbox "A security analyst" [ref=e134]
                  - generic [ref=e135]: A security analyst
              - group [ref=e136]:
                - generic "Amount" [ref=e137]:
                  - generic [ref=e138]:
                    - generic [ref=e139]: Amount
                    - textbox "Amount" [ref=e140]:
                      - /placeholder: ""
                - generic "Currency" [ref=e141]:
                  - generic [ref=e142]:
                    - generic [ref=e143]: Currency
                    - combobox "Currency" [ref=e144]:
                      - option [disabled] [selected]
                      - option "USD"
                      - option "CAD"
                  - generic:
                    - img
                - generic "Date" [ref=e145]:
                  - generic [ref=e146]:
                    - generic [ref=e147]: Date
                    - textbox "Date" [ref=e148]:
                      - /placeholder: ""
            - generic [ref=e149]:
              - generic [ref=e151]: Please, check the box below to confirm and agree*
              - group
              - group
            - heading "Required fields are marked with*" [level=6] [ref=e152]
            - generic [ref=e153]:
              - generic [ref=e154]:
                - checkbox "I am not a competitor of Mattamy or any of its subsidiaries or acting on behalf of such a competitor field is required" [ref=e155]
                - generic [ref=e156]: I am not a competitor of Mattamy or any of its subsidiaries or acting on behalf of such a competitor
              - text: "*"
            - generic "Name of company / entity" [ref=e157]:
              - generic [ref=e158]:
                - generic [ref=e159]: Name of company / entity *
                - textbox "Name of company / entity field is required" [ref=e160]:
                  - /placeholder: ""
            - generic "Name of authorized signatory" [ref=e161]:
              - generic [ref=e162]:
                - generic [ref=e163]: Name of authorized signatory *
                - textbox "Name of authorized signatory field is required" [ref=e164]:
                  - /placeholder: ""
            - generic "Title of authorized signatory" [ref=e165]:
              - generic [ref=e166]:
                - generic [ref=e167]: Title of authorized signatory *
                - textbox "Title of authorized signatory field is required" [ref=e168]:
                  - /placeholder: ""
            - generic "Email address" [ref=e169]:
              - generic [ref=e170]:
                - generic [ref=e171]: Email address *
                - textbox "Email address field is required" [ref=e172]:
                  - /placeholder: ""
            - generic "Closing date" [ref=e173]:
              - generic [ref=e174]:
                - generic [ref=e175]: Closing date *
                - textbox "Closing date field is required" [ref=e176]:
                  - /placeholder: ""
            - button "SUBMIT" [ref=e178] [cursor=pointer]
        - paragraph [ref=e180]:
          - text: If you have questions or concerns please contact Darryl Dawe at
          - link "bondholders@mattamycorp.com" [ref=e181] [cursor=pointer]:
            - /url: mailto:bondholders@mattamycorp.com
          - text: .
    - contentinfo "footer" [ref=e182]:
      - generic [ref=e184]:
        - generic [ref=e185]:
          - generic [ref=e186]:
            - heading "Explore" [level=2] [ref=e187]
            - list [ref=e189]:
              - listitem [ref=e190]:
                - link "Mattamy Homes USA" [ref=e191] [cursor=pointer]:
                  - /url: https://stagemh-sc.exsquared.com/us
              - listitem [ref=e192]:
                - link "Mattamy Homes Canada" [ref=e193] [cursor=pointer]:
                  - /url: https://stagemh-sc.exsquared.com/ca
              - listitem [ref=e194]:
                - link "Design Studio" [ref=e195] [cursor=pointer]:
                  - /url: /design-studio
              - listitem [ref=e196]:
                - link "Customer Care" [ref=e197] [cursor=pointer]:
                  - /url: /customer-care
              - listitem [ref=e198]:
                - link "Blog" [ref=e199] [cursor=pointer]:
                  - /url: /new-blog
          - generic [ref=e201]:
            - heading "About Mattamy" [level=2] [ref=e202]
            - list [ref=e204]:
              - listitem [ref=e205]:
                - link "About Us" [ref=e206] [cursor=pointer]:
                  - /url: /about/about-mattamy
              - listitem [ref=e207]:
                - link "Contact Us" [ref=e208] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e209]:
                - link "Careers" [ref=e210] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e211]:
                - link "Media and Investor Relations" [ref=e212] [cursor=pointer]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e214]:
            - heading "Connect With Us" [level=2] [ref=e215]
            - generic [ref=e217]:
              - link "Facebook (opens in a new tab)" [ref=e218] [cursor=pointer]:
                - /url: https://www.facebook.com/MattamyHomes
                - img [ref=e219]
              - link "Instagram (opens in a new tab)" [ref=e221] [cursor=pointer]:
                - /url: https://www.instagram.com/mattamyhomes/
                - img [ref=e222]
              - link "Youtube (opens in a new tab)" [ref=e224] [cursor=pointer]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e225]
              - link "Pinterest (opens in a new tab)" [ref=e227] [cursor=pointer]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e228]
              - link "Linkedin (opens in a new tab)" [ref=e230] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e231]
        - generic [ref=e234]:
          - paragraph [ref=e235]:
            - link "Accessibility" [ref=e236] [cursor=pointer]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e237]: "|"
            - button "Cookie Settings" [ref=e238] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e239]: "|"
            - link "Legal Disclaimers" [ref=e240] [cursor=pointer]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e241]: "|"
            - link "Privacy Policy" [ref=e242] [cursor=pointer]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e243]: "|"
            - link "Terms and Conditions" [ref=e244] [cursor=pointer]:
              - /url: /terms-and-conditions
          - paragraph [ref=e245]: ©2024 Mattamy Homes
```

# Test source

```ts
  76  |       await this.validatePageShell(link, expectation);
  77  |       await this.validatePageContent(expectation);
  78  |       await this.validateVisibleLinksHaveDestinations();
  79  |       await expectation.validate?.(this);
  80  |     });
  81  |   }
  82  | 
  83  |   /**
  84  |    * Lightweight validation for a top-level static About link (e.g. CAN's
  85  |    * Sustainability), checking route, shell and meaningful content without the
  86  |    * country-specific content expectations used by validateAboutPage.
  87  |    */
  88  |   async validateTopLevelAboutPage(link: HeaderNavigationLink): Promise<void> {
  89  |     await this.step(`Validate top-level About page: ${link.name}`, async () => {
  90  |       await this.waitForPageReady();
  91  | 
  92  |       await this.assertPageUrl(
  93  |         new RegExp(`${escapeRegex(link.url)}/?$`),
  94  |         `${link.name} should keep the expected route`,
  95  |       );
  96  |       await this.assertAttached(
  97  |         this.header,
  98  |         `${link.name} should keep the global header mounted`,
  99  |         15_000,
  100 |       );
  101 |       await this.assertAttached(
  102 |         this.main,
  103 |         `${link.name} should render a main content area`,
  104 |         15_000,
  105 |       );
  106 |       await this.assertAttached(
  107 |         this.footer,
  108 |         `${link.name} should keep the global footer mounted`,
  109 |         15_000,
  110 |       );
  111 |       await this.assertHeadingVisible(undefined, `${link.name} should expose a visible H1`, 20_000);
  112 | 
  113 |       await expect
  114 |         .poll(async () => (await this.getMainText()).length, {
  115 |           message: `${link.name} should render meaningful visible content`,
  116 |           timeout: 20000,
  117 |         })
  118 |         .toBeGreaterThan(120);
  119 |     });
  120 |   }
  121 | 
  122 |   /** Checks the title, route, header, main and footer are all in place. */
  123 |   async validatePageShell(
  124 |     link: HeaderNavigationLink,
  125 |     expectation: AboutPageExpectation,
  126 |   ): Promise<void> {
  127 |     await this.step(`Validate page shell: ${link.name}`, async () => {
  128 |       await this.waitForPageReady();
  129 | 
  130 |       await this.assertPageTitle(
  131 |         expectation.title,
  132 |         `${link.name} title should match expected value`,
  133 |       );
  134 |       await this.assertPageUrl(
  135 |         new RegExp(`${escapeRegex(link.url)}/?$`),
  136 |         `${link.name} should keep the expected route without a country query parameter`,
  137 |       );
  138 |       await this.assertAttached(
  139 |         this.header,
  140 |         `${link.name} should keep the global header mounted`,
  141 |         15_000,
  142 |       );
  143 |       await this.assertAttached(
  144 |         this.main,
  145 |         `${link.name} should render a main content area`,
  146 |         15_000,
  147 |       );
  148 |       await this.assertAttached(
  149 |         this.footer,
  150 |         `${link.name} should keep the global footer mounted`,
  151 |         15_000,
  152 |       );
  153 |     });
  154 |   }
  155 | 
  156 |   /** Checks the page renders real text, plus the headings, links and buttons it should have. */
  157 |   async validatePageContent(expectation: AboutPageExpectation): Promise<void> {
  158 |     await this.step('Validate page content, headings, links and buttons', async () => {
  159 |       await expect
  160 |         .poll(async () => this.getVisibleMainContentLength(), {
  161 |           message: 'About page should render meaningful visible content',
  162 |           timeout: 20000,
  163 |         })
  164 |         .toBeGreaterThan(120);
  165 | 
  166 |       for (const heading of expectation.headings) {
  167 |         await expect
  168 |           .poll(async () => heading.test(await this.getMainText()), {
  169 |             message: `Expected About page content matching ${heading}`,
  170 |             timeout: 15000,
  171 |           })
  172 |           .toBeTruthy();
  173 |       }
  174 | 
  175 |       for (const linkPattern of expectation.links ?? []) {
> 176 |         await expect
      |         ^ Error: Expected a link matching /mediaroom\.com/i
  177 |           .poll(async () => this.hasAnyLinkMatching(linkPattern), {
  178 |             message: `Expected a link matching ${linkPattern}`,
  179 |             timeout: 15000,
  180 |           })
  181 |           .toBeTruthy();
  182 | 
  183 |         await this.reportValue('Link pattern validated', linkPattern.source);
  184 |       }
  185 | 
  186 |       for (const buttonPattern of expectation.buttons ?? []) {
  187 |         await expect
  188 |           .poll(async () => this.hasAnyButtonMatching(buttonPattern), {
  189 |             message: `Expected a button matching ${buttonPattern}`,
  190 |             timeout: 15000,
  191 |           })
  192 |           .toBeTruthy();
  193 |       }
  194 |     });
  195 |   }
  196 | 
  197 |   /** Checks the Community Involvement extras: SHOW MORE and the foundation link. */
  198 |   async validateCommunityInvolvementFunctionality(): Promise<void> {
  199 |     await this.step('Validate Community Involvement functionality', async () => {
  200 |       await this.validateShowMore();
  201 |       await this.validateExternalLinkIfPresent(/petergilganfoundation\.org/i);
  202 |     });
  203 |   }
  204 | 
  205 |   /** Checks the Sustainability page links to its report and its two sub-pages. */
  206 |   async validateSustainabilityFunctionality(): Promise<void> {
  207 |     await this.step('Validate Sustainability functionality', async () => {
  208 |       await this.validateVisibleHref(/sustainabilityreport|assetstream|dfsmedia/i);
  209 |       await this.validateVisibleHref(/\/about\/sustainability\/message-from-our-founder/i);
  210 |       await this.validateVisibleHref(/\/about\/sustainability\/responsible-management/i);
  211 |     });
  212 |   }
  213 | 
  214 |   /** Checks the news releases, fact sheet, contact emails and investor form. */
  215 |   async validateMediaAndInvestorFunctionality(): Promise<void> {
  216 |     await this.step('Validate Media and Investor Relations functionality', async () => {
  217 |       const releaseLinks = this.main.locator('a[href*="mediaroom.com"]:visible');
  218 |       await this.assertVisible(
  219 |         releaseLinks.first(),
  220 |         'News Releases should list visible release links',
  221 |         15_000,
  222 |       );
  223 | 
  224 |       const releaseCount = await releaseLinks.count();
  225 |       const seeMoreButton = this.main.getByRole('button', { name: /See More Releases/i });
  226 | 
  227 |       if (await seeMoreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
  228 |         await seeMoreButton.click();
  229 |         await expect
  230 |           .poll(() => releaseLinks.count(), {
  231 |             message: 'See More Releases should not reduce the release list',
  232 |             timeout: 10000,
  233 |           })
  234 |           .toBeGreaterThanOrEqual(releaseCount);
  235 |       }
  236 | 
  237 |       await this.validateVisibleHref(/\/dfsmedia\/.+fact-sheet/i);
  238 |       await this.validateVisibleHref(/^mailto:bondholders@mattamycorp\.com$/i);
  239 |       await this.validateVisibleHref(/^mailto:media@mattamycorp\.com$/i);
  240 |       await this.validateInvestorForm();
  241 |     });
  242 |   }
  243 | 
  244 |   /** Checks the Careers extras: early-careers link, photo carousel and Apply Today. */
  245 |   async validateCareersFunctionality(): Promise<void> {
  246 |     await this.step('Validate Careers functionality', async () => {
  247 |       await this.validateLinkIfPresent(/\/about\/careers\/early-careers/i);
  248 | 
  249 |       // No SHOW MORE check: the only one on /about/careers belongs to the
  250 |       // embedded third-party job board, not to us.
  251 | 
  252 |       const nextSlideButton = this.main.getByRole('button', { name: /Next slide/i }).first();
  253 | 
  254 |       if (await nextSlideButton.isVisible({ timeout: 3000 }).catch(() => false)) {
  255 |         await nextSlideButton.scrollIntoViewIfNeeded();
  256 |         await nextSlideButton.click();
  257 |         await this.assertVisible(
  258 |           nextSlideButton,
  259 |           'Career carousel next control should remain usable after click',
  260 |           5_000,
  261 |         );
  262 |       }
  263 | 
  264 |       const previousSlideButton = this.main
  265 |         .getByRole('button', { name: /Previous slide/i })
  266 |         .first();
  267 | 
  268 |       if (await previousSlideButton.isVisible({ timeout: 3000 }).catch(() => false)) {
  269 |         await previousSlideButton.scrollIntoViewIfNeeded();
  270 |         await previousSlideButton.click();
  271 |         await expect(
  272 |           previousSlideButton,
  273 |           'Career carousel previous control should remain usable after click',
  274 |         ).toBeVisible({ timeout: 5000 });
  275 |       }
  276 | 
```