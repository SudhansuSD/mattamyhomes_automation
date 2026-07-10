---
name: desktop-to-appium-mobile
description: Generate or convert WebdriverIO + Appium mobile-web tests and page objects for Android Chrome, reusing this repo's mobile framework. Two entry modes — (A) convert an existing desktop Playwright test to mobile, or (B) generate a mobile spec + page object for a page from scratch (e.g. "Generate mobile test and page object for the market page"). This skill is mobile-specific, so the request must name mobile explicitly (mobile / Android / Appium / phone); a device-agnostic "generate test and page object for <page>" is web by default and handled by the url-feature-automation-generator skill instead. Applies mobile-friendly adaptations (hamburger nav, scroll-into-view, script-driven clicks, cookie/promo dismissal, eager load, session-loss recovery, source-only fallback), runs a mobile-feasibility check on every candidate test, and adds mobile-specific coverage the desktop suite cannot have. Use when asked to "convert this desktop test to mobile", "add a mobile version of a flow", "make a flow mobile-friendly", or "generate mobile test and page object for <page>". Reuses existing mobile page objects/config; adds a new mobile page object only for new functionality.
---

# Desktop Web → Appium Mobile Browser Skill

Produce mobile-web tests that run on real Android Chrome through Appium + WebdriverIO, **reusing the existing framework** and only adding mobile-specific handling where the desktop approach does not work on a phone. The desktop Playwright suite stays untouched and still runs with `npm test`.

## Two Entry Modes

Pick the mode from how the user phrases the request:

- **Mode A — Convert** an existing desktop test. Triggers: "convert `tests/QMIPage.spec.ts` to mobile", "add a mobile version of the plan flow", "make the home test mobile-friendly". Source of truth = the existing desktop spec + page object.
- **Mode B — Generate from a page.** Triggers: "Generate **mobile** test and page object for the market page", "create mobile tests for the community page", "build a mobile page object + spec for <page> on Android". Source of truth = the page itself (its desktop page object if one exists, otherwise the live URL/feature). Use this when the user names a *page/feature* rather than an existing spec file.

**Device must be explicit.** Because the repo also has a web generator (`url-feature-automation-generator`), a device-agnostic "generate test and page object for <page>" is ambiguous and defaults to web. Only run this skill when the request names the mobile target — **mobile**, **Android**, **Appium**, or **phone**. If the user says a bare "generate test and page object for <page>" without a device, ask whether they mean web or mobile before proceeding.

Both modes share steps 3–7 below. The only difference is where the test inventory comes from (step 1/2).

## The Two Stacks (what you are targeting)

| | Desktop (reference) | Mobile (target) |
|---|---|---|
| Runner | Playwright (`@playwright/test`) | WebdriverIO + Mocha |
| Spec | `tests/<area>.spec.ts` | `tests/mobile/mobileWeb.<area>.spec.js` |
| Page object | `pages/<Area>Page.ts` extends `SearchablePage`/`BasePage` | `pages/mobile/MobileWeb<Area>Page.js` extends `MobileWebBasePage` |
| Language | TypeScript, ESM imports | CommonJS (`require` / `module.exports`) |
| API | `page.locator()`, `expect()` | `this.driver.execute()` DOM eval, `node:assert/strict` |
| Navigate | `await pageObj.navigate()` | `await pageObj.open()` |
| Grouping | `test.describe` / `test()` / `test.step()` | `describe` / `it()` + step-log vocabulary |
| Config | `getLocationConfig()` / `getEnvConfig()` | `getLocationConfig()` / `getEnvConfig()` (same) |

## Workflow

### 1. Establish the test inventory and check what mobile already exists

- **Mode A:** Read the desktop spec (`tests/<area>.spec.ts`) and its page object (`pages/<Area>Page.ts`). The inventory = every `test()` in that spec.
- **Mode B:** Read the matching desktop page object (`pages/<Area>Page.ts`) and desktop spec (`tests/<area>.spec.ts`) if they exist — reuse their business methods, section grouping, and test IDs as the blueprint. If neither exists, inventory the page's features directly (hero, nav, cards/sections, search links, media, forms, footer) using the live URL.
- Always check `pages/mobile/` and `tests/mobile/` first. Existing mobile page objects: `MobileWebHomePage`, `MobileWebCommunityPage`, `MobileWebMPCPage`, `MobileWebPlanPage`, `MobileWebQMIPage`, `MobileWebSearchPage`. If a mobile page object/spec for this area already exists, **extend it** — add methods, do not duplicate.
- Only create a new `pages/mobile/MobileWeb<Area>Page.js` when the page has no mobile model yet.

### 2. Run the mobile-feasibility check (do this before writing any test)

For each candidate test, classify it — this is the core judgment of the skill, not an afterthought. Report the classification in step 7.

- **Feasible as-is** — pure content/layout/nav/URL assertions (page loads, hero renders, cards have name+URL, footer links, search lands on the right URL). Convert directly with mobile adaptations.
- **Feasible with a mobile alternative** — the desktop *interaction* won't work on a phone, but the *intent* still can:
  - Direct header-link clicks → open the hamburger first (`openHamburgerMenu()`), then click.
  - Typed desktop search → `searchFromHomeAutocompleteWithRetry()` with a direct `/search?...` URL fallback.
  - Hover/tooltip/right-click → replace with tap/scroll-into-view + click, or assert the underlying state directly.
  - Multi-column/side-by-side layout assertions → assert presence + stacked order instead of coordinates.
  - Locator `.click()` on possibly-offscreen elements → `driver.execute` visible-element click + `scrollIntoView`.
- **Environment/data-gated** — mirror the desktop guards exactly. E.g. lead-form submission skips on `PROD`; some market lead forms skip on `CAN` (`getEnvConfig().envName`, `getLocationConfig().country`). Keep the same skips; never silently drop them.
- **Not feasible / low-value on mobile** — skip with `logSkip(...)` and an explicit reason (e.g. desktop-only mega-menu hover states, pixel-exact desktop grid). State it in the report; do not fake a pass.
- **Source-only fallback** — the emulator sometimes returns a source-only DOM (`snapshot.isSourceOnly`). Every rendered-element assertion needs a `bodyText` fallback branch (see `MobileWebHomePage.validateHeroSection`).

### 3. Add mobile-specific coverage the desktop suite cannot have

Beyond mirroring desktop tests, add checks that only make sense on a phone:

- **Hamburger navigation** opens and exposes the key nav links (`verifyHeaderLinksVisible` pattern).
- **Autoplay hero video is mobile-safe** — if a hero `<video autoplay>` exists it must also be `muted` + `playsinline` (see `validateHeroSection`).
- **Android Chrome user agent + viewport** — assert `navigator.userAgent` matches `/Android/i` and `/Chrome/i`, and viewport width/height > 0 (see `verifyLoaded`).
- **Stacked/scrolled layout** — sections that sit side-by-side on desktop must be reachable via `scrollIntoView`/`window.scrollTo` on mobile.
- **Cookie + promo overlays** don't block taps — rely on `acceptCookiesIfVisible()` / `dismissPromoPopupIfPresent()` / `closeCookiePreferencesIfVisible()`.
- **Session-loss resilience** — wrap flows that can crash the renderer with the `searchAndValidateByValue` / `isSessionLostError` + `reloadSessionAfterLoss()` retry pattern.

### 4. Build the mobile page object on `MobileWebBasePage`

Reuse the base helpers instead of reimplementing them (all live in `pages/mobile/MobileWebBasePage.js`):

- `open(path)` — navigates, waits for ready, dismisses cookies + promo popups.
- `navigateTo(path)` / `resolveNavigationUrl(path)` / `waitForPageReady()` / `waitForBodyText()` / `getBodyText()` / `getSnapshot()`.
- `acceptCookiesIfVisible()` / `removeCookieOverlays()` / `closeCookiePreferencesIfVisible()` / `dismissPromoPopupIfPresent()` / `dismissBlockingOverlaysIfPresent()`.
- `clickVisibleByText(pattern, selectors, label)` for resilient, visible-only clicks.
- `assertNoErrorPage(snapshot)`, `isSessionLostError()`, `reloadSessionAfterLoss()`.
- Step-log vocabulary — `logStep`, `logClick`, `logScriptClick`, `logChange`, `logOpen`, `logResult`, `logValidate`, `logSkip`. **Never `console.log` in page objects** (see [[allure-step-reporting-convention]]).
- Every method gets a one-line `/** ... */` comment above it (see [[method-comment-convention]]).

Conventions to follow:
- CommonJS: `const { MobileWebBasePage } = require('./MobileWebBasePage');` … `module.exports = { MobileWeb<Area>Page };`.
- Pull test data from `getLocationConfig()` / `getEnvConfig()` — never hardcode markets, communities, addresses, or URLs.
- Expose intent-named methods (`verifyLoaded`, `validateHeroSection`, `validateCommunityCards`, `searchByX`, `verifySearchByX`) so the spec reads like the desktop one.
- For pages reached by navigating to a config URL (market/community/plan/qmi), model `open()`/`navigateToX()` from the desktop page object's navigation, then assert with `getSnapshot()` + source-only fallback.

### 5. Mirror the spec structure (keep IDs/tags/sections)

Match the desktop spec one-to-one so coverage maps cleanly (see `tests/mobile/mobileWeb.home.spec.js` for the exact shape):

- CommonJS `require`, `describe` with `this.timeout(300000)`, section-wise nested `describe`s matching the desktop grouping.
- Same test IDs and tags in titles (`TC-01 | @ci @smoke @regression | ...`).
- `beforeEach` instantiates the mobile page object, loads `getLocationConfig()`, and calls `open()` (or `navigateToX()`).
- One `it()` per desktop `test()`; each `test.step(...)` becomes a page-object method call (the method emits its own step-log lines).
- Preserve the desktop `test.skip(...)` guards as the same conditional skips (PROD / CAN, etc.).
- Fail hard on real problems (assert) — matching the desktop intent (see [[mobile-test-conventions]]).

### 6. Register and run

- Add the new spec to the `specs` array in `wdio.mobile.conf.js`.
- Add an npm script mirroring the existing ones in `package.json`:
  `"test:mobile:android:<area>": "wdio run wdio.mobile.conf.js --spec ./tests/mobile/mobileWeb.<area>.spec.js"`.
- Verify on a running emulator/device (`adb devices` must show `device`):

```powershell
npm run test:mobile:android              # full mobile suite
npm run test:mobile:android:<area>       # focused new spec
```

See [docs/appium-mobile-browser-testing.md](../../docs/appium-mobile-browser-testing.md) for prerequisites (Android SDK, `adb devices`, Appium driver) and troubleshooting.

### 7. Report

State:
- Files created/updated (page object, spec, `wdio.mobile.conf.js`, `package.json`).
- The test inventory with its **feasibility classification** (feasible / mobile-alternative / env-gated / skipped-with-reason) — this is the required deliverable, not optional.
- The mobile-specific tests added (step 3) that have no desktop equivalent.
- Mobile adaptations applied.
- The run command, and confirmation the desktop Playwright suite is unchanged.

## Worked Example — "Generate mobile test and page object for the market page"

1. Read `pages/MarketPage.ts` + `tests/marketPage.spec.ts`; confirm no `MobileWebMarketPage` exists yet.
2. Feasibility pass on the desktop market tests:
   - `verifyMarketPage`, `validateCommunityCards`, `validateDiscoverOurHomesSection`, `validateHeroContent`, `validateMarketSearchLinks` → **feasible** (content/URL/cards) with scroll-into-view + source-only fallback.
   - `validateFirstCommunityCardNavigation` → **mobile alternative** (visible-element `driver.execute` click + `scrollIntoView`).
   - Lead-form tests → **env-gated** (skip on `CAN`; submission skips on `PROD`) — keep identical guards.
   - `validateImageAndVideoUrlsReturn200` → **feasible**; also add the mobile-only autoplay-`muted`+`playsinline` hero check.
3. Add mobile-specific: hamburger nav exposure, Android UA/viewport, stacked section scroll.
4. Create `pages/mobile/MobileWebMarketPage.js` extending `MobileWebBasePage`, driven by `getLocationConfig().markets`.
5. Create `tests/mobile/mobileWeb.market.spec.js` mirroring the desktop section grouping and IDs.
6. Register in `wdio.mobile.conf.js` + add `test:mobile:android:market`.
7. Report inventory + classifications + run command.

## Guardrails

- Do not duplicate the framework — reuse desktop config/data and existing `pages/mobile` objects.
- Add mobile config/specs in parallel; never modify or break the desktop Playwright setup.
- Android Chrome only (UiAutomator2). Do not add iOS Safari or BrowserStack unless explicitly requested.
- Never silently drop a desktop test — every one is either converted, given a mobile alternative, env-gated, or explicitly skipped-with-reason in the report.
