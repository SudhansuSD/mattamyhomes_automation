# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homePage.spec.ts >> Mattamy Homes - CAN >> Page Load >> @smoke @regression | CAN | Validate hero media on Home Page
- Location: tests/homePage.spec.ts:46:9

# Error details

```
Error: Masthead should declare a hero image source for phone viewports

expect(received).toBeTruthy()

Received: ""
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - link "Skip to main content" [ref=e2] [cursor=pointer]
    - link "Skip to footer" [ref=e3] [cursor=pointer]
  - region "national notification" [ref=e7]:
    - generic [ref=e12]:
      - text: Government Tax Rebates Available on New Homes!
      - link "Learn More" [ref=e13]:
        - /url: http://mattamyhomes.com/promos/government-rebates
  - generic [ref=e15]:
    - banner [ref=e16]:
      - generic [ref=e17]:
        - link "Mattamy logo. Go to HomePage" [ref=e18]:
          - /url: /
          - figure [ref=e19]:
            - img "Mattamy logo" [ref=e20]
        - button "Navigation menu." [ref=e21] [cursor=pointer]:
          - img [ref=e22]
    - main [ref=e24]:
      - generic [ref=e25]:
        - generic:
          - heading "Home. Where moments matter most." [level=1]
          - textbox "Search by City or Community Name" [ref=e30]
          - link "Navigate to more information on this page." [ref=e31] [cursor=pointer]:
            - img [ref=e32]
      - generic [ref=e37]:
        - img [ref=e43]
        - generic [ref=e47]:
          - heading "Built for Who You're Becoming" [level=2] [ref=e48]
          - generic [ref=e50]:
            - paragraph [ref=e51]: Life doesn't come together all at once. Every new chapter brings new possibilities, and the home you choose today should be ready to support where tomorrow takes you. That's the thinking behind every Mattamy home and community.
            - paragraph [ref=e52]
            - text: Discover how Mattamy builds for every chapter ahead.
          - link "Learn More" [ref=e54] [cursor=pointer]:
            - /url: https://mattamyhomes.com/built-for-becoming
            - generic [ref=e55]: Learn More
      - generic [ref=e56]:
        - generic [ref=e57]:
          - heading "Explore our locations near you" [level=2] [ref=e58]
          - generic [ref=e59]: We build homes in hundreds of communities across North America. Explore our locations and find the home and area that best fit your lifestyle.
        - generic [ref=e60]:
          - generic [ref=e63]:
            - generic [ref=e69]:
              - generic [ref=e71]:
                - link "Calgary Alberta Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains. View Calgary information.":
                  - /url: /alberta/calgary
                  - img "View of Calgary by the water with high-rise buildings and a bridge" [ref=e72]
              - generic [ref=e74]:
                - paragraph [ref=e75]: Alberta
                - heading "Calgary" [level=2] [ref=e76]
              - link "Calgary Alberta Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains. View Calgary information." [ref=e78]:
                - /url: /alberta/calgary
                - generic [ref=e79]:
                  - paragraph [ref=e80]: Alberta
                  - heading "Calgary" [level=2] [ref=e81]
                  - paragraph [ref=e82]: Experience vibrancy, rich culture and inspiring landscapes at the foothills of Canada's Rocky Mountains.
                - generic [ref=e84]: Find my home
            - generic [ref=e90]:
              - img [ref=e93]
              - generic [ref=e95]:
                - paragraph [ref=e96]: Alberta
                - heading [level=2] [ref=e97]: Edmonton
              - link [ref=e99]:
                - /url: /alberta/edmonton
                - generic [ref=e100]:
                  - paragraph [ref=e101]: Alberta
                  - heading [level=2] [ref=e102]: Edmonton
                  - paragraph [ref=e103]: Enjoy amazing urban amenities, landscapes and nature in a city at the heart of Alberta's wilderness.
                - generic [ref=e105]: Find my home
            - generic [ref=e111]:
              - img [ref=e114]
              - generic [ref=e116]:
                - paragraph [ref=e117]: Ontario
                - heading [level=2] [ref=e118]: Greater Toronto Area
              - link [ref=e120]:
                - /url: /ontario/gta
                - generic [ref=e121]:
                  - paragraph [ref=e122]: Ontario
                  - heading [level=2] [ref=e123]: Greater Toronto Area
                  - paragraph [ref=e124]: Discover the cultural diversity, rich heritage and vibrant energy of the country's largest metropolitan area.
                - generic [ref=e126]: Find my home
            - generic [ref=e132]:
              - img [ref=e135]
              - generic [ref=e137]:
                - paragraph [ref=e138]: Ontario
                - heading [level=2] [ref=e139]: Kitchener-Waterloo-Guelph
              - link [ref=e141]:
                - /url: /ontario/kitchener-waterloo-guelph
                - generic [ref=e142]:
                  - paragraph [ref=e143]: Ontario
                  - heading [level=2] [ref=e144]: Kitchener-Waterloo-Guelph
                  - paragraph [ref=e145]: Enjoy the quaint life in these cities, that offer easy access to stunning nature, convenient amenities and prosperous opportunity.
                - generic [ref=e147]: Find my home
            - generic [ref=e153]:
              - img [ref=e156]
              - generic [ref=e158]:
                - paragraph [ref=e159]: Ontario
                - heading [level=2] [ref=e160]: Ottawa
              - link [ref=e162]:
                - /url: /ontario/ottawa
                - generic [ref=e163]:
                  - paragraph [ref=e164]: Ontario
                  - heading [level=2] [ref=e165]: Ottawa
                  - paragraph [ref=e166]: Live life to the fullest and create unforgettable memories in the country's hottest housing market.
                - generic [ref=e168]: Find my home
            - generic [ref=e174]:
              - img [ref=e177]
              - generic [ref=e179]:
                - paragraph [ref=e180]: Ontario
                - heading [level=2] [ref=e181]: Simcoe
              - link [ref=e183]:
                - /url: /ontario/simcoe
                - generic [ref=e184]:
                  - paragraph [ref=e185]: Ontario
                  - heading [level=2] [ref=e186]: Simcoe
                  - paragraph [ref=e187]: Discover the expansive green spaces, city conveniences and inviting feel of the beautiful Simcoe County region.
                - generic [ref=e189]: Find my home
          - button "Previous story panel.":
            - img
          - button "Next story panel." [ref=e190] [cursor=pointer]:
            - img [ref=e191]
    - contentinfo "footer" [ref=e193]:
      - generic [ref=e195]:
        - generic [ref=e196]:
          - generic [ref=e197]:
            - heading "Explore" [level=2] [ref=e198]
            - list [ref=e200]:
              - listitem [ref=e201]:
                - link "Mattamy Homes USA" [ref=e202]:
                  - /url: https://mattamyhomes.com/us
              - listitem [ref=e203]:
                - link "Mattamy Homes Canada" [ref=e204]:
                  - /url: https://mattamyhomes.com/ca
              - listitem [ref=e205]:
                - link "Design Studio" [ref=e206]:
                  - /url: /design-studio
              - listitem [ref=e207]:
                - link "Customer Care" [ref=e208]:
                  - /url: /customer-care
          - generic [ref=e210]:
            - heading "About Mattamy" [level=2] [ref=e211]
            - list [ref=e213]:
              - listitem [ref=e214]:
                - link "About Us" [ref=e215]:
                  - /url: /about/about-mattamy
              - listitem [ref=e216]:
                - link "Contact Us" [ref=e217]:
                  - /url: /contact
              - listitem [ref=e218]:
                - link "Careers" [ref=e219]:
                  - /url: /about/careers
              - listitem [ref=e220]:
                - link "Media and Investor Relations" [ref=e221]:
                  - /url: /about/media-and-investor-relations
          - generic [ref=e223]:
            - heading "Connect With Us" [level=2] [ref=e224]
            - generic [ref=e226]:
              - link "Facebook (opens in a new tab)" [ref=e227]:
                - /url: fb://profile/MattamyHomes
                - img [ref=e228]
              - link "Instagram (opens in a new tab)" [ref=e230]:
                - /url: instagram://user?username=mattamyhomes
                - img [ref=e231]
              - link "Youtube (opens in a new tab)" [ref=e233]:
                - /url: https://www.youtube.com/user/MattamyHomesOnline
                - img [ref=e234]
              - link "Pinterest (opens in a new tab)" [ref=e236]:
                - /url: https://www.pinterest.com/mattamyhomes/
                - img [ref=e237]
              - link "Linkedin (opens in a new tab)" [ref=e239]:
                - /url: https://www.linkedin.com/company/mattamy-homes
                - img [ref=e240]
        - generic [ref=e243]:
          - paragraph [ref=e244]:
            - link "Accessibility" [ref=e245]:
              - /url: /accessibility
              - text: Accessibility
              - generic [ref=e246]: "|"
            - button "Cookie Settings" [ref=e247] [cursor=pointer]:
              - text: Cookie Settings
              - generic [ref=e248]: "|"
            - link "Legal Disclaimers" [ref=e249]:
              - /url: /legal-disclaimers
              - text: Legal Disclaimers
              - generic [ref=e250]: "|"
            - link "Privacy Policy" [ref=e251]:
              - /url: /privacy-policies
              - text: Privacy Policy
              - generic [ref=e252]: "|"
            - link "Terms and Conditions" [ref=e253]:
              - /url: /terms-and-conditions
          - paragraph [ref=e254]: ©2026 Mattamy Homes
```

# Test source

```ts
  66  | 
  67  |   // Initializes the home page and its hero, header, and market-card locators.
  68  |   constructor(page: Page) {
  69  |     super(page);
  70  | 
  71  |     this.heroSection = page.locator('#masthead');
  72  |     this.heroVideo = this.heroSection.locator('video').first();
  73  |     this.header = page.locator('header');
  74  | 
  75  |     this.marketCards = page.locator('#cards .slick-slide:not(.slick-cloned)');
  76  |   }
  77  | 
  78  |   // PAGE LOAD
  79  | 
  80  |   // Confirms the home page finished loading and shows the expected title.
  81  |   async verifyPageLoaded(): Promise<void> {
  82  |     await this.step('Verify home page loaded', async () => {
  83  |       await this.assertPageLoaded('Home page should finish loading');
  84  |       await this.assertPageTitle(/Mattamy Homes/i, 'Home page title should include Mattamy Homes');
  85  |     });
  86  |   }
  87  | 
  88  |   // Checks the masthead shows the hero media this viewport is meant to get - the video on desktop, the image on phones.
  89  |   async validateHeroMedia(): Promise<void> {
  90  |     await this.step('Validate hero media', async () => {
  91  |       await this.waitForPageReady();
  92  |       await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
  93  |       await this.assertVisible(this.heroSection, 'Hero section should be visible');
  94  |       await this.heroVideo.waitFor({ state: 'attached', timeout: 15000 });
  95  | 
  96  |       if (await this.isHeroImageViewport()) {
  97  |         await this.validateHeroImage();
  98  |         return;
  99  |       }
  100 | 
  101 |       await this.validateHeroVideoAutoplay();
  102 |     });
  103 |   }
  104 | 
  105 |   // Tells whether the viewport is narrow enough that the masthead uses the hero image instead of the video.
  106 |   private async isHeroImageViewport(): Promise<boolean> {
  107 |     // Falls back to the breakpoint itself, not 0, for the reason BasePage falls
  108 |     // back to the desktop width: a viewport that cannot be read runs the stricter
  109 |     // video checks rather than quietly settling for the image ones.
  110 |     const viewportWidth = await this.page
  111 |       .evaluate(() => window.innerWidth)
  112 |       .catch(() => HERO_VIDEO_MIN_WIDTH);
  113 | 
  114 |     return viewportWidth < HERO_VIDEO_MIN_WIDTH;
  115 |   }
  116 | 
  117 |   // Checks the phone masthead exposes its configured hero image in place of the video.
  118 |   private async validateHeroImage(): Promise<void> {
  119 |     await this.step('Validate hero image', async () => {
  120 |       const imageState = await this.getHeroImageState();
  121 | 
  122 |       await this.reportValue('Hero image URL', imageState.configuredImageUrl);
  123 | 
  124 |       this.expectHeroImageSource(imageState);
  125 |       await this.expectHeroImageRendered(imageState.configuredImageUrl);
  126 |     });
  127 |   }
  128 | 
  129 |   // Reads the masthead's configured phone image source and whether the desktop video is on screen.
  130 |   private async getHeroImageState(): Promise<HeroImageState> {
  131 |     return this.heroSection.evaluate((section: HTMLElement) => {
  132 |       // An empty source stays empty: resolved against the page it would become the page's own URL,
  133 |       // and a masthead with no image would then pass every source check below.
  134 |       const toAbsoluteUrl = (url: string) => {
  135 |         if (!url.trim()) {
  136 |           return '';
  137 |         }
  138 | 
  139 |         try {
  140 |           return new URL(url, window.location.href).href;
  141 |         } catch {
  142 |           return '';
  143 |         }
  144 |       };
  145 | 
  146 |       const configuredImageUrl = toAbsoluteUrl(section.getAttribute('background') ?? '');
  147 |       const video = section.querySelector('video');
  148 |       const preloadedImage = Array.from(
  149 |         document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]'),
  150 |       ).find((link) => toAbsoluteUrl(link.href) === configuredImageUrl);
  151 | 
  152 |       return {
  153 |         configuredImageUrl,
  154 |         posterImageUrl: toAbsoluteUrl(video?.getAttribute('poster') ?? ''),
  155 |         preloadedImageUrl: toAbsoluteUrl(preloadedImage?.href ?? ''),
  156 |         videoDisplayed: video ? window.getComputedStyle(video).display !== 'none' : false,
  157 |       };
  158 |     });
  159 |   }
  160 | 
  161 |   // Asserts the phone masthead uses the CMS image fallback, and that the video it replaces stays hidden.
  162 |   private expectHeroImageSource(imageState: HeroImageState): void {
  163 |     expect(
  164 |       imageState.configuredImageUrl,
  165 |       'Masthead should declare a hero image source for phone viewports',
> 166 |     ).toBeTruthy();
      |       ^ Error: Masthead should declare a hero image source for phone viewports
  167 | 
  168 |     expect(
  169 |       imageState.posterImageUrl,
  170 |       'Hidden hero video should carry the same poster image used for phone viewports',
  171 |     ).toBe(imageState.configuredImageUrl);
  172 | 
  173 |     expect(
  174 |       imageState.preloadedImageUrl,
  175 |       'Phone hero image should be preloaded before the hidden video fallback is needed',
  176 |     ).toBe(imageState.configuredImageUrl);
  177 | 
  178 |     expect(
  179 |       imageState.videoDisplayed,
  180 |       'Hero video should stay hidden on phone viewports, where the hero image replaces it',
  181 |     ).toBeFalsy();
  182 |   }
  183 | 
  184 |   // Confirms the browser decoded the hero image, rather than the URL merely being declared.
  185 |   private async expectHeroImageRendered(imageUrl: string): Promise<void> {
  186 |     const decodedWidth = await this.page.evaluate(async (url) => {
  187 |       const image = new Image();
  188 |       image.src = url;
  189 | 
  190 |       // Raced rather than awaited outright: a CDN that never answers would
  191 |       // otherwise hang here until the whole test times out, naming nothing.
  192 |       return Promise.race([
  193 |         image
  194 |           .decode()
  195 |           .then(() => image.naturalWidth)
  196 |           .catch(() => 0),
  197 |         new Promise<number>((resolve) => window.setTimeout(() => resolve(0), 15000)),
  198 |       ]);
  199 |     }, imageUrl);
  200 | 
  201 |     expect(
  202 |       decodedWidth,
  203 |       'Hero image should load from the CDN with real pixel dimensions',
  204 |     ).toBeGreaterThan(0);
  205 |   }
  206 | 
  207 |   // Checks that the hero video is configured for muted inline autoplay and actually plays.
  208 |   private async validateHeroVideoAutoplay(): Promise<void> {
  209 |     await this.step('Validate hero video autoplay', async () => {
  210 |       await this.assertVisible(this.heroVideo, 'Hero section video should be visible');
  211 | 
  212 |       const videoState = await this.getHeroVideoState();
  213 | 
  214 |       this.expectHeroVideoAutoplayAttributes(videoState);
  215 |       await this.expectHeroVideoReadyForPlayback();
  216 | 
  217 |       const playbackStartTime = await this.getHeroVideoPlaybackStartTime();
  218 |       await this.expectHeroVideoPlaybackProgress(playbackStartTime);
  219 |     });
  220 |   }
  221 | 
  222 |   // Reads the hero video element's autoplay-related attributes and source info from the DOM.
  223 |   private async getHeroVideoState(): Promise<HeroVideoState> {
  224 |     return this.heroVideo.evaluate((video: HTMLVideoElement) => ({
  225 |       autoplayAttribute: video.hasAttribute('autoplay'),
  226 |       autoplayProperty: video.autoplay,
  227 |       muted: video.muted,
  228 |       defaultMuted: video.defaultMuted,
  229 |       playsInlineAttribute:
  230 |         video.hasAttribute('playsinline') || video.hasAttribute('webkit-playsinline'),
  231 |       sourceCount: video.querySelectorAll('source').length,
  232 |       src: video.currentSrc || video.src,
  233 |     }));
  234 |   }
  235 | 
  236 |   // Asserts the captured video state has autoplay, muted, playsinline, and a playable source.
  237 |   private expectHeroVideoAutoplayAttributes(videoState: HeroVideoState): void {
  238 |     expect(
  239 |       videoState.autoplayAttribute || videoState.autoplayProperty,
  240 |       'Hero video should have autoplay enabled',
  241 |     ).toBeTruthy();
  242 | 
  243 |     expect(
  244 |       videoState.muted || videoState.defaultMuted,
  245 |       'Hero autoplay video should be muted so browsers allow autoplay',
  246 |     ).toBeTruthy();
  247 | 
  248 |     expect(
  249 |       videoState.playsInlineAttribute,
  250 |       'Hero autoplay video should include playsinline for mobile playback',
  251 |     ).toBeTruthy();
  252 | 
  253 |     expect(
  254 |       videoState.src || videoState.sourceCount > 0,
  255 |       'Hero video should have a playable source',
  256 |     ).toBeTruthy();
  257 |   }
  258 | 
  259 |   // Waits until the hero video has buffered enough data to begin playback.
  260 |   private async expectHeroVideoReadyForPlayback(): Promise<void> {
  261 |     await expect
  262 |       .poll(
  263 |         async () => this.heroVideo.evaluate((video: HTMLVideoElement) => video.readyState >= 2),
  264 |         {
  265 |           message: 'Hero video should load enough data to start playback',
  266 |           timeout: 15000,
```