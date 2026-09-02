# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: condoCommunity.spec.ts >> Condo Community Detail - CAN >> Lead Form >> Get Information Form Validation >> @smoke @regression | CAN | Validate Get Information CTA opens condo community sideModalForm
- Location: tests/condoCommunity.spec.ts:95:11

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="Search"]:not(#vendor-search-handler):visible').first()
    - locator resolved to <input type="text" id="mastheadSeachBox" placeholder="Search by City or Community Name" class="font-graphie text-mattamy-gray bg-white h-60-mattamy px-5 md:px-10 w-full h-full rounded"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <span class="richtext">…</span> from <div id="national-notification-banner">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="w-full h-full absolute  inset-0 top-0 right-0 left-0 bottom-0 overflow-hidden">…</div> intercepts pointer events
  - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <button role="link" data-aos="fade-down" data-aos-delay="1000" data-aos-anchor="header" aria-label="Navigate to more information on this page." class="IconButton__Button-sc-9hv72t-0 bOTdW rounded-full flex justify-center items-center bg-white text-action-blue w-16 h-16 absolute left-0 right-0 m-auto bottom-0 lg:mb-5 pointer-events-auto aos-init aos-animate">…</button> intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span>…</span> from <div id="national-notification-banner">…</div> subtree intercepts pointer events
  13 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="Container-sc-fruoo6-0 Header__StyledContainer-sc-1j2i34t-2 ciZHnc container h-full relative  flex items-center justify-between lg:max-w-full lg:px-0 z-40">…</div> from <div>…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button role="link" data-aos="fade-down" data-aos-delay="1000" data-aos-anchor="header" aria-label="Navigate to more information on this page." class="IconButton__Button-sc-9hv72t-0 bOTdW rounded-full flex justify-center items-center bg-white text-action-blue w-16 h-16 absolute left-0 right-0 m-auto bottom-0 lg:mb-5 pointer-events-auto aos-init aos-animate">…</button> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <span>…</span> from <div id="national-notification-banner">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <span>…</span> from <div id="national-notification-banner">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="Container-sc-fruoo6-0 Header__StyledContainer-sc-1j2i34t-2 ciZHnc container h-full relative  flex items-center justify-between lg:max-w-full lg:px-0 z-40">…</div> from <div>…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <button role="link" data-aos="fade-down" data-aos-delay="1000" data-aos-anchor="header" aria-label="Navigate to more information on this page." class="IconButton__Button-sc-9hv72t-0 bOTdW rounded-full flex justify-center items-center bg-white text-action-blue w-16 h-16 absolute left-0 right-0 m-auto bottom-0 lg:mb-5 pointer-events-auto aos-init aos-animate">…</button> intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e6]:
    - generic [ref=e11]:
      - text: Government Tax Rebates Available on New Homes!
      - link "Learn More" [ref=e12]:
        - /url: http://mattamyhomes.com/promos/government-rebates
  - generic [ref=e14]:
    - banner [ref=e15]:
      - generic [ref=e16]:
        - link "Mattamy logo. Go to HomePage" [ref=e17]:
          - /url: /
          - figure [ref=e18]:
            - img "Mattamy logo" [ref=e19]
        - button "Navigation menu." [ref=e20] [cursor=pointer]:
          - img [ref=e21]
    - main [ref=e23]:
      - generic [ref=e24]:
        - generic:
          - heading "Home. Where moments matter most." [level=1]
          - textbox "Search by City or Community Name" [ref=e29]
          - link "Navigate to more information on this page." [ref=e30] [cursor=pointer]:
            - img [ref=e31]
      - generic [ref=e36]:
        - img [ref=e42]
        - generic [ref=e46]:
          - heading "Built for Who You're Becoming" [level=2] [ref=e47]
          - generic [ref=e49]:
            - paragraph [ref=e50]: Life doesn't come together all at once. Every new chapter brings new possibilities, and the home you choose today should be ready to support where tomorrow takes you. That's the thinking behind every Mattamy home and community.
            - paragraph [ref=e51]
            - text: Discover how Mattamy builds for every chapter ahead.
          - link "Learn More" [ref=e53] [cursor=pointer]:
            - /url: https://mattamyhomes.com/built-for-becoming
            - generic [ref=e54]: Learn More
      - generic [ref=e55]:
        - generic [ref=e56]:
          - heading "Explore our locations near you" [level=2] [ref=e57]
          - generic [ref=e58]: We build homes in hundreds of communities across North America. Explore our locations and find the home and area that best fit your lifestyle.
        - generic [ref=e59]:
          - generic [ref=e62]:
            - generic [ref=e68]:
              - generic [ref=e70]:
                - link "Calgary Alberta Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains. View Calgary information.":
                  - /url: /alberta/calgary
                  - img "View of Calgary by the water with high-rise buildings and a bridge" [ref=e71]
              - generic [ref=e73]:
                - paragraph [ref=e74]: Alberta
                - heading "Calgary" [level=2] [ref=e75]
              - link "Calgary Alberta Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains. View Calgary information." [ref=e77]:
                - /url: /alberta/calgary
                - generic [ref=e78]:
                  - paragraph [ref=e79]: Alberta
                  - heading "Calgary" [level=2] [ref=e80]
                  - paragraph [ref=e81]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
                - generic [ref=e83]: Find my home
            - generic [ref=e89]:
              - img [ref=e92]
              - generic [ref=e94]:
                - paragraph [ref=e95]: Alberta
                - heading [level=2] [ref=e96]: Edmonton
              - link [ref=e98]:
                - /url: /alberta/edmonton
                - generic [ref=e99]:
                  - paragraph [ref=e100]: Alberta
                  - heading [level=2] [ref=e101]: Edmonton
                  - paragraph [ref=e102]: Enjoy amazing urban amenities, landscapes and nature in a city at the heart of Alberta's wilderness.
                - generic [ref=e104]: Find my home
            - generic [ref=e110]:
              - img [ref=e113]
              - generic [ref=e115]:
                - paragraph [ref=e116]: Ontario
                - heading [level=2] [ref=e117]: Greater Toronto Area
              - link [ref=e119]:
                - /url: /ontario/gta
                - generic [ref=e120]:
                  - paragraph [ref=e121]: Ontario
                  - heading [level=2] [ref=e122]: Greater Toronto Area
                  - paragraph [ref=e123]: Discover the cultural diversity, rich heritage and vibrant energy of the country's largest metropolitan area.
                - generic [ref=e125]: Find my home
            - generic [ref=e131]:
              - img [ref=e134]
              - generic [ref=e136]:
                - paragraph [ref=e137]: Ontario
                - heading [level=2] [ref=e138]: Kitchener-Waterloo-Guelph
              - link [ref=e140]:
                - /url: /ontario/kitchener-waterloo-guelph
                - generic [ref=e141]:
                  - paragraph [ref=e142]: Ontario
                  - heading [level=2] [ref=e143]: Kitchener-Waterloo-Guelph
                  - paragraph [ref=e144]: Enjoy the quaint life in these cities, that offer easy access to stunning nature, convenient amenities and prosperous opportunity.
                - generic [ref=e146]: Find my home
            - generic [ref=e152]:
              - img [ref=e155]
              - generic [ref=e157]:
                - paragraph [ref=e158]: Ontario
                - heading [level=2] [ref=e159]: Ottawa
              - link [ref=e161]:
                - /url: /ontario/ottawa
                - generic [ref=e162]:
                  - paragraph [ref=e163]: Ontario
                  - heading [level=2] [ref=e164]: Ottawa
                  - paragraph [ref=e165]: Live life to the fullest and create unforgettable memories in the country's hottest housing market.
                - generic [ref=e167]: Find my home
            - generic [ref=e173]:
              - img [ref=e176]
              - generic [ref=e178]:
                - paragraph [ref=e179]: Ontario
                - heading [level=2] [ref=e180]: Simcoe
              - link [ref=e182]:
                - /url: /ontario/simcoe
                - generic [ref=e183]:
                  - paragraph [ref=e184]: Ontario
                  - heading [level=2] [ref=e185]: Simcoe
                  - paragraph [ref=e186]: Discover the expansive green spaces, city conveniences and inviting feel of the beautiful Simcoe County region.
                - generic [ref=e188]: Find my home
          - button "Previous story panel.":
            - img
          - button "Next story panel." [ref=e189] [cursor=pointer]:
            - img [ref=e190]
    - contentinfo "footer" [ref=e192]:
      - generic [ref=e194]:
        - generic [ref=e195]:
          - generic [ref=e196]:
            - heading "Explore" [level=2] [ref=e197]
            - list [ref=e199]:
              - listitem [ref=e200]:
                - link "Find My Home" [ref=e201]:
                  - /url: /search
              - listitem [ref=e202]:
                - link "Design Studio" [ref=e203]:
                  - /url: /design-studio
              - listitem [ref=e204]:
                - link "Customer Care" [ref=e205]:
                  - /url: /customer-care
          - generic [ref=e207]:
            - heading "About Mattamy" [level=2] [ref=e208]
            - list [ref=e210]:
              - listitem [ref=e211]:
                - link "About Us" [ref=e212]:
                  - /url: /about/about-mattamy
              - listitem [ref=e213]:
                - link "Contact Us" [ref=e214]:
                  - /url: /contact
              - listitem [ref=e215]:
                - link "Careers" [ref=e216]:
                  - /url: /about/careers
              - listitem [ref=e217]:
                - link "Media and Investor Relations" [ref=e218]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e220]:
            - heading "Connect With Us" [level=2] [ref=e221]
            - generic [ref=e223]:
              - link "Facebook (opens in a new tab)" [ref=e224]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e225]
              - link "Instagram (opens in a new tab)" [ref=e227]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e228]
              - link "Youtube (opens in a new tab)" [ref=e230]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e231]
              - link "Pinterest (opens in a new tab)" [ref=e233]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e234]
              - link "Linkedin (opens in a new tab)" [ref=e236]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e237]
        - generic [ref=e240]:
          - paragraph [ref=e241]:
            - link "Accessibility" [ref=e242]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e243]: "|"
            - button "Cookie Settings" [ref=e244] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e245]: "|"
            - link "Legal Disclaimers" [ref=e246]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e247]: "|"
            - link "Privacy Policy" [ref=e248]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e249]: "|"
            - link "Terms and Conditions" [ref=e250]:
              - /url: /terms-and-conditions
          - paragraph [ref=e251]: ©2026 Mattamy Homes
  - iframe [active] [ref=e253]:
    - generic [ref=f5e1]:
      - generic:
        - generic:
          - generic:
            - button [ref=f5e2]
            - generic [ref=f5e3]:
              - button "Close" [ref=f5e4]:
                - img [ref=f5e6]
              - application "AtlasRTX Digital Assistant" [ref=f5e9]:
                - generic [ref=f5e11]: Good afternoon! I am Tammy, Mattamy's digital assistant, here to help with your home search. How can I assist you today?
              - img "AtlasRTX Digital Assistant icon" [active] [ref=f5e13] [cursor=pointer]:
                - text: Chat with Us
                - strong [ref=f5e16]: "1"
            - button [ref=f5e17]
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