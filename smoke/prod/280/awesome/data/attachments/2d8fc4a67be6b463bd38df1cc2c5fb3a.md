# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: planPage.spec.ts >> Plan Detail Page Tests - CAN >> UI & Functional Validation >> @smoke @regression | CAN | Validate Plan Detail page core content
- Location: tests/planPage.spec.ts:42:9

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="Search"]:not(#vendor-search-handler):visible').first()
    - locator resolved to <input type="text" id="mastheadSeachBox" placeholder="Search by City or Community Name" class="font-graphie text-mattamy-gray bg-white h-60-mattamy px-5 md:px-10 w-full h-full rounded"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <img class="object-cover rounded w-full h-full lg:-mt-16 lg:ml-20" src="https://prodmh.b-cdn.net//dfsmedia/a2b99d47a71047839a5a4241f44710ce/156505-50420/mhc-brand-campaign-the-moment-before-home-page-mulitblock-2050x1600"/> from <section class="Section-sc-4qwy3u-0 MultiBlocks__StyledSection-sc-x1zhw7-0 joMIvT lmtOmf flex flex-col items-center justify-start  w-screen">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <img class="object-cover rounded w-full h-full lg:-mt-16 lg:ml-20" src="https://prodmh.b-cdn.net//dfsmedia/a2b99d47a71047839a5a4241f44710ce/156505-50420/mhc-brand-campaign-the-moment-before-home-page-mulitblock-2050x1600"/> from <section class="Section-sc-4qwy3u-0 MultiBlocks__StyledSection-sc-x1zhw7-0 joMIvT lmtOmf flex flex-col items-center justify-start  w-screen">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <img class="object-cover rounded w-full h-full lg:-mt-16 lg:ml-20" src="https://prodmh.b-cdn.net//dfsmedia/a2b99d47a71047839a5a4241f44710ce/156505-50420/mhc-brand-campaign-the-moment-before-home-page-mulitblock-2050x1600"/> from <section class="Section-sc-4qwy3u-0 MultiBlocks__StyledSection-sc-x1zhw7-0 joMIvT lmtOmf flex flex-col items-center justify-start  w-screen">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to main content" [ref=e3]
    - link "Skip to footer" [ref=e4]
  - generic [ref=e6]:
    - banner [ref=e8]:
      - generic [ref=e9]:
        - link "Mattamy logo. Go to HomePage" [ref=e10]:
          - /url: /
          - figure [ref=e11]:
            - img "Mattamy logo" [ref=e12]
        - navigation [ref=e13]:
          - generic [ref=e14]:
            - button "Find Your Dream Home" [ref=e16]:
              - paragraph [ref=e17]:
                - text: Find Your Dream Home
                - img [ref=e18]
            - generic:
              - generic:
                - generic:
                  - generic:
                    - button:
                      - generic: Alberta
                  - generic:
                    - button:
                      - menuitem: Calgary
                    - button:
                      - menuitem: Edmonton
                - generic:
                  - generic:
                    - button:
                      - generic: Ontario
                  - generic:
                    - button:
                      - menuitem: Greater Toronto Area
                    - button:
                      - menuitem: Kitchener-Waterloo-Guelph
                    - button:
                      - menuitem: Ottawa
                    - button:
                      - menuitem: Simcoe
          - link "Sustainability" [ref=e22]:
            - /url: /about/sustainability
            - paragraph [ref=e23]: Sustainability
          - button "Resources" [ref=e27]:
            - paragraph [ref=e28]:
              - text: Resources
              - img [ref=e29]
          - link "Customer Care" [ref=e33]:
            - /url: /customer-care
            - paragraph [ref=e34]: Customer Care
          - button "About" [ref=e38]:
            - paragraph [ref=e39]:
              - text: About
              - img [ref=e40]
          - link "Contact Us" [ref=e44]:
            - /url: /contact
            - paragraph [ref=e45]: Contact Us
        - generic [ref=e47]:
          - button "Go to Favorites Page" [ref=e48]:
            - img "Favorite Icon" [ref=e49]
          - button "Select your country. CANADA country is selected" [ref=e54]:
            - generic [ref=e55]: CANADA
            - img [ref=e57]
        - button "Navigation menu." [ref=e59]:
          - img
    - link "Navigate to Top." [ref=e62]:
      - img
    - main [ref=e64]:
      - generic [ref=e68]:
        - heading "Home. Where moments matter most." [level=1] [ref=e69]
        - generic [ref=e70]: Find your new home and make memories that matter.
        - textbox "Search by City or Community Name" [ref=e74]
        - link "Navigate to more information on this page." [ref=e75]:
          - img
      - generic [ref=e80]:
        - img [ref=e86]
        - generic [ref=e90]:
          - heading "Built for Who You're Becoming" [level=2] [ref=e91]
          - generic [ref=e93]:
            - paragraph [ref=e94]: Life doesn't come together all at once. Every new chapter brings new possibilities, and the home you choose today should be ready to support where tomorrow takes you. That's the thinking behind every Mattamy home and community.
            - paragraph [ref=e95]
            - text: Discover how Mattamy builds for every chapter ahead.
          - link "Learn More" [ref=e97]:
            - /url: https://mattamyhomes.com/built-for-becoming
            - generic [ref=e98]: Learn More
      - generic [ref=e99]:
        - generic [ref=e100]:
          - heading "Explore our locations near you" [level=2] [ref=e101]
          - generic [ref=e102]: We build homes in hundreds of communities across North America. Explore our locations and find the home and area that best fit your lifestyle.
        - generic [ref=e103]:
          - generic [ref=e106]:
            - generic [ref=e112]:
              - link "Calgary Alberta Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains. View Calgary information." [ref=e115]:
                - /url: /alberta/calgary
                - img "View of Calgary by the water with high-rise buildings and a bridge" [ref=e117]
              - generic [ref=e118]:
                - paragraph [ref=e119]: Alberta
                - heading "Calgary" [level=2] [ref=e120]
              - link "Calgary Alberta Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains. View Calgary information." [ref=e122]:
                - /url: /alberta/calgary
                - generic [ref=e123]:
                  - paragraph [ref=e124]: Alberta
                  - heading "Calgary" [level=2] [ref=e125]
                  - paragraph [ref=e126]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
                - generic [ref=e128]: Find my home
            - generic [ref=e134]:
              - link [ref=e137]:
                - /url: /alberta/edmonton
                - img [ref=e139]
              - generic [ref=e140]:
                - paragraph [ref=e141]: Alberta
                - heading [level=2] [ref=e142]: Edmonton
              - link [ref=e144]:
                - /url: /alberta/edmonton
                - generic [ref=e145]:
                  - paragraph [ref=e146]: Alberta
                  - heading [level=2] [ref=e147]: Edmonton
                  - paragraph [ref=e148]: Enjoy amazing urban amenities, landscapes and nature in a city at the heart of Alberta's wilderness.
                - generic [ref=e150]: Find my home
            - generic [ref=e156]:
              - link [ref=e159]:
                - /url: /ontario/gta
                - img [ref=e161]
              - generic [ref=e162]:
                - paragraph [ref=e163]: Ontario
                - heading [level=2] [ref=e164]: Greater Toronto Area
              - link [ref=e166]:
                - /url: /ontario/gta
                - generic [ref=e167]:
                  - paragraph [ref=e168]: Ontario
                  - heading [level=2] [ref=e169]: Greater Toronto Area
                  - paragraph [ref=e170]: Discover the cultural diversity, rich heritage and vibrant energy of the country's largest metropolitan area.
                - generic [ref=e172]: Find my home
            - generic [ref=e178]:
              - link [ref=e181]:
                - /url: /ontario/kitchener-waterloo-guelph
                - img [ref=e183]
              - generic [ref=e184]:
                - paragraph [ref=e185]: Ontario
                - heading [level=2] [ref=e186]: Kitchener-Waterloo-Guelph
              - link [ref=e188]:
                - /url: /ontario/kitchener-waterloo-guelph
                - generic [ref=e189]:
                  - paragraph [ref=e190]: Ontario
                  - heading [level=2] [ref=e191]: Kitchener-Waterloo-Guelph
                  - paragraph [ref=e192]: Enjoy the quaint life in these cities, that offer easy access to stunning nature, convenient amenities and prosperous opportunity.
                - generic [ref=e194]: Find my home
            - generic [ref=e200]:
              - link [ref=e203]:
                - /url: /ontario/ottawa
                - img [ref=e205]
              - generic [ref=e206]:
                - paragraph [ref=e207]: Ontario
                - heading [level=2] [ref=e208]: Ottawa
              - link [ref=e210]:
                - /url: /ontario/ottawa
                - generic [ref=e211]:
                  - paragraph [ref=e212]: Ontario
                  - heading [level=2] [ref=e213]: Ottawa
                  - paragraph [ref=e214]: Live life to the fullest and create unforgettable memories in the country's hottest housing market.
                - generic [ref=e216]: Find my home
            - generic [ref=e222]:
              - link [ref=e225]:
                - /url: /ontario/simcoe
                - img [ref=e227]
              - generic [ref=e228]:
                - paragraph [ref=e229]: Ontario
                - heading [level=2] [ref=e230]: Simcoe
              - link [ref=e232]:
                - /url: /ontario/simcoe
                - generic [ref=e233]:
                  - paragraph [ref=e234]: Ontario
                  - heading [level=2] [ref=e235]: Simcoe
                  - paragraph [ref=e236]: Discover the expansive green spaces, city conveniences and inviting feel of the beautiful Simcoe County region.
                - generic [ref=e238]: Find my home
          - button "Previous story panel." [ref=e239]:
            - img
          - button "Next story panel." [ref=e241]:
            - img
    - contentinfo "footer" [ref=e243]:
      - generic [ref=e245]:
        - generic [ref=e246]:
          - generic [ref=e247]:
            - heading "Explore" [level=2] [ref=e248]
            - list [ref=e249]:
              - listitem [ref=e250]:
                - link "Mattamy Homes USA" [ref=e251]:
                  - /url: https://mattamyhomes.com/us
              - listitem [ref=e252]:
                - link "Mattamy Homes Canada" [ref=e253]:
                  - /url: https://mattamyhomes.com/ca
              - listitem [ref=e254]:
                - link "Design Studio" [ref=e255]:
                  - /url: /design-studio
              - listitem [ref=e256]:
                - link "Customer Care" [ref=e257]:
                  - /url: /customer-care
          - generic [ref=e259]:
            - heading "About Mattamy" [level=2] [ref=e260]
            - list [ref=e261]:
              - listitem [ref=e262]:
                - link "About Us" [ref=e263]:
                  - /url: /about/about-mattamy
              - listitem [ref=e264]:
                - link "Contact Us" [ref=e265]:
                  - /url: /contact
              - listitem [ref=e266]:
                - link "Careers" [ref=e267]:
                  - /url: /about/careers
              - listitem [ref=e268]:
                - link "Media and Investor Relations" [ref=e269]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e271]:
            - heading "Connect With Us" [level=2] [ref=e272]
            - generic [ref=e273]:
              - link "Facebook (opens in a new tab)" [ref=e274]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e275]
              - link "Instagram (opens in a new tab)" [ref=e277]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e278]
              - link "Youtube (opens in a new tab)" [ref=e280]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e281]
              - link "Pinterest (opens in a new tab)" [ref=e283]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e284]
              - link "Linkedin (opens in a new tab)" [ref=e286]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e287]
        - generic [ref=e289]:
          - paragraph [ref=e290]:
            - link "Accessibility" [ref=e291]:
              - /url: /accessibility
              - text: Accessibility|
            - button "Cookie Settings" [ref=e292]: Cookie Settings|
            - link "Legal Disclaimers" [ref=e293]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers|
            - link "Privacy Policy" [ref=e294]:
              - /url: /privacy-policies
              - text: Privacy Policy|
            - link "Terms and Conditions" [ref=e295]:
              - /url: /terms-and-conditions
          - paragraph [ref=e296]: ©2026 Mattamy Homes
```

# Test source

```ts
  158 |     const location = this.location as LocationWithCondoPlan;
  159 |     let path: string | undefined;
  160 | 
  161 |     switch (searchType) {
  162 |       case 'community':
  163 |         path = location.communityPath;
  164 |         break;
  165 |       case 'plan':
  166 |         path = this.getPreferredPlanPath();
  167 |         break;
  168 |       case 'qmi':
  169 |         path = location.qmiPath;
  170 |         break;
  171 |       case 'condoPlan':
  172 |         path = location.condoPlan?.url;
  173 |         break;
  174 |       case 'condoCommunity':
  175 |         path = this.getCondoCommunityPath();
  176 |         break;
  177 |       default:
  178 |         path = undefined;
  179 |     }
  180 | 
  181 |     if (!path) {
  182 |       return false;
  183 |     }
  184 | 
  185 |     await this.reportValue(
  186 |       `No autocomplete result found - navigating directly to configured ${searchType} path: ${path}`,
  187 |     );
  188 |     await this.gotoSearchResultHref(path);
  189 |     return true;
  190 |   }
  191 | 
  192 |   // Clicks the matched suggestion and ensures navigation happened, falling back to its href or a market search.
  193 |   private async openMatchedSearchResult(
  194 |     matchedResult: Locator,
  195 |     value: string,
  196 |     searchType?: SearchType,
  197 |   ): Promise<void> {
  198 |     const context: SearchMatchContext = {
  199 |       href: await matchedResult.getAttribute('href'),
  200 |       previousUrl: this.page.url(),
  201 |     };
  202 | 
  203 |     await matchedResult.scrollIntoViewIfNeeded();
  204 | 
  205 |     const didClick = await matchedResult
  206 |       .click({ timeout: 5000 })
  207 |       .then(() => true)
  208 |       .catch(() => false);
  209 | 
  210 |     if (!didClick && context.href) {
  211 |       await this.gotoSearchResultHref(context.href);
  212 |       return;
  213 |     }
  214 | 
  215 |     const didNavigate = await this.didSearchResultNavigate(context.previousUrl);
  216 | 
  217 |     if (!didNavigate && searchType === 'market') {
  218 |       await this.navigateToMarketSearchResults(value);
  219 |       return;
  220 |     }
  221 | 
  222 |     if (!didNavigate && context.href) {
  223 |       await this.gotoSearchResultHref(context.href);
  224 |       return;
  225 |     }
  226 | 
  227 |     await this.waitForPageReady();
  228 |   }
  229 | 
  230 |   // Navigates directly to a search result href (resolved to a full URL) and waits for the page to settle.
  231 |   private async gotoSearchResultHref(href: string): Promise<void> {
  232 |     await this.gotoAndVerifyResponse(this.buildFullUrl(href));
  233 | 
  234 |     await this.waitForPageReady();
  235 |   }
  236 | 
  237 |   // Returns true if the URL changed from the previous one within the results timeout.
  238 |   private async didSearchResultNavigate(previousUrl: string): Promise<boolean> {
  239 |     return this.page
  240 |       .waitForURL((url) => url.toString() !== previousUrl, {
  241 |         timeout: this.SEARCH_RESULTS_TIMEOUT,
  242 |       })
  243 |       .then(() => true)
  244 |       .catch(() => false);
  245 |   }
  246 | 
  247 |   // Returns true if the given search box becomes visible within the input timeout.
  248 |   private async isSearchBoxVisible(searchBox: Locator): Promise<boolean> {
  249 |     return searchBox
  250 |       .waitFor({ state: 'visible', timeout: this.SEARCH_INPUT_TIMEOUT })
  251 |       .then(() => true)
  252 |       .catch(() => false);
  253 |   }
  254 | 
  255 |   // Scrolls to, focuses, and clears the search box so a fresh query can be typed.
  256 |   private async prepareSearchBox(searchBox: Locator): Promise<void> {
  257 |     await this.scrollTo(searchBox);
> 258 |     await searchBox.click();
      |                     ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  259 |     await searchBox.fill('');
  260 |   }
  261 | 
  262 |   // Reveals the search input if it is hidden behind the header search toggle, then returns the visible box.
  263 |   protected async ensureSearchBoxVisible(): Promise<Locator> {
  264 |     if (!(await this.isSearchBoxVisible(this.visibleSearchBox))) {
  265 |       const searchToggle = this.page.getByRole('button', { name: /search/i }).first();
  266 | 
  267 |       if (await searchToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
  268 |         await searchToggle.click().catch(() => undefined);
  269 |         await this.isSearchBoxVisible(this.visibleSearchBox);
  270 |       }
  271 |     }
  272 | 
  273 |     return this.visibleSearchBox;
  274 |   }
  275 | 
  276 |   // Attempts to make a hidden search box appear by toggling the search button or reloading the page.
  277 |   private async recoverSearchBoxVisibility(attempt: number): Promise<boolean> {
  278 |     await this.page.keyboard.press('Home').catch(() => undefined);
  279 | 
  280 |     const searchToggle = this.page.getByRole('button', { name: /search/i }).first();
  281 | 
  282 |     if (await searchToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
  283 |       await searchToggle.click().catch(() => undefined);
  284 | 
  285 |       if (await this.isSearchBoxVisible(this.visibleSearchBox)) {
  286 |         return true;
  287 |       }
  288 |     }
  289 | 
  290 |     if (attempt <= this.SEARCH_MAX_ATTEMPTS) {
  291 |       await this.reportValue(`Search box hidden on attempt ${attempt}; reloading before retry`);
  292 | 
  293 |       await this.page
  294 |         .reload({
  295 |           waitUntil: 'domcontentloaded',
  296 |           timeout: 90_000,
  297 |         })
  298 |         .catch(async (error) => {
  299 |           await this.reportValue(
  300 |             `Search input recovery reload failed: ${error instanceof Error ? error.message : String(error)}`,
  301 |           );
  302 |           await this.navigate();
  303 |         });
  304 | 
  305 |       await this.acceptCookiesIfPresent();
  306 |       await this.waitForPageReady();
  307 | 
  308 |       return this.isSearchBoxVisible(this.visibleSearchBox);
  309 |     }
  310 | 
  311 |     return false;
  312 |   }
  313 | 
  314 |   // Builds and opens the /search results URL for a market directly, bypassing autocomplete.
  315 |   private async navigateToMarketSearchResults(market: string): Promise<void> {
  316 |     const location = this.location;
  317 |     const { baseURL } = getEnvConfig();
  318 | 
  319 |     const searchParams = new URLSearchParams({
  320 |       community: 'All',
  321 |       country: location.country,
  322 |       hideMap: 'false',
  323 |       homeType: 'All',
  324 |       metro: market,
  325 |       productType: 'community',
  326 |     });
  327 | 
  328 |     await this.reportValue(
  329 |       `No autocomplete market result found - navigating to search results for: ${market}`,
  330 |     );
  331 | 
  332 |     await this.gotoAndVerifyResponse(`${baseURL}/search?${searchParams.toString()}`);
  333 | 
  334 |     await this.waitForPageReady();
  335 |   }
  336 | 
  337 |   // Resolves the best matching suggestion for the typed value, trying primary then fallback selectors.
  338 |   private async getSearchResult(value: string, searchType?: SearchType): Promise<Locator> {
  339 |     const primaryMatch = this.getSearchResultFromLocator(
  340 |       this.primarySearchResults,
  341 |       value,
  342 |       searchType,
  343 |     );
  344 | 
  345 |     if (await isLocatorVisible(primaryMatch)) {
  346 |       return primaryMatch;
  347 |     }
  348 | 
  349 |     return this.getSearchResultFromLocator(this.fallbackSearchResults, value, searchType);
  350 |   }
  351 | 
  352 |   // Filters a suggestion locator down to the entry matching the value, with per-search-type matching rules.
  353 |   private getSearchResultFromLocator(
  354 |     searchResults: Locator,
  355 |     value: string,
  356 |     searchType?: SearchType,
  357 |   ): Locator {
  358 |     const matchedResults = searchResults.filter({
```