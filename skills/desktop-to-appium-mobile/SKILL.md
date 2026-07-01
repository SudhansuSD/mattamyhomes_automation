---
name: desktop-to-appium-mobile
description: Convert an existing desktop Playwright test (and its page object) into the WebdriverIO + Appium mobile-web equivalent for Android Chrome, applying mobile-friendly adaptations (hamburger nav, scroll-into-view, script-driven clicks, cookie/promo dismissal, eager load, session-loss recovery, source-only fallback). Use when asked to "convert this desktop test to mobile", add a mobile version of a desktop flow, or make a flow run mobile-friendly. Reuses existing mobile page objects and config; adds a new mobile page object only for new functionality.
---

# Desktop Web → Appium Mobile Browser Skill

Turn a desktop Playwright spec into its mobile-web counterpart that runs on real Android Chrome through Appium + WebdriverIO, **reusing the existing framework** and only adding mobile-specific handling where the desktop approach does not work on a phone.

## When To Use

When the user says things like "convert `tests/QMIPage.spec.ts` to mobile", "add a mobile version of the plan flow", or "make the home test mobile-friendly". The desktop suite stays untouched and continues to run with `npm test`.

## The Two Stacks (what you are converting between)

| | Desktop (source) | Mobile (target) |
|---|---|---|
| Runner | Playwright (`@playwright/test`) | WebdriverIO + Mocha |
| Spec | `tests/<area>.spec.ts` | `tests/mobile/mobileWeb.<area>.spec.js` |
| Page object | `pages/<Area>Page.ts` extends `SearchablePage`/`BasePage` | `pages/mobile/MobileWeb<Area>Page.js` extends `MobileWebBasePage` |
| Language | TypeScript, ESM imports | CommonJS (`require` / `module.exports`) |
| API | `page.locator()`, `expect()` | `this.driver.execute()` DOM eval, `node:assert/strict` |
| Navigate | `await pageObj.navigate()` | `await pageObj.open()` |
| Grouping | `test.describe` / `test()` / `test.step()` | `describe` / `it()` + step-log vocabulary |
| Config | `getLocationConfig()` | `getLocationConfig()` (same) |

## Conversion Workflow

### 1. Read the desktop source and check what mobile already exists

- Read the desktop spec (`tests/<area>.spec.ts`) and its page object (`pages/<Area>Page.ts`).
- Check `pages/mobile/` and `tests/mobile/` first. If a mobile page object/spec for this area already exists, **extend it** — do not create a duplicate. Add new methods to the existing `MobileWeb<Area>Page` when the behavior belongs to a page already modeled.
- Only create a new `pages/mobile/MobileWeb<Area>Page.js` when the desktop flow covers a page/feature with no mobile model yet (new functionality).

### 2. Mirror the spec structure (keep IDs/tags/sections)

Match the desktop spec one-to-one so coverage maps cleanly:

- Same test IDs and tags in titles (`HOME-001 | @ci @smoke @regression | ...`).
- Same section-wise `describe` grouping as the web spec.
- `beforeEach` instantiates the mobile page object and calls `open()`.
- One `it()` per desktop `test()`; convert each `test.step(...)` into a method call plus a step-log line (`logStep` / `logValidate` / `logResult`).
- Fail hard on real problems (assert), don't soft-skip — matching the desktop intent.

### 3. Build the mobile page object on `MobileWebBasePage`

Reuse the base helpers instead of reimplementing them:

- `open(path)` — navigates, waits for ready, dismisses cookies + promo popups.
- `waitForPageReady()` / `waitForBodyText()` / `getBodyText()` / `getSnapshot()`.
- `acceptCookiesIfVisible()` / `removeCookieOverlays()` / `closeCookiePreferencesIfVisible()`.
- `dismissPromoPopupIfPresent()` / `dismissBlockingOverlaysIfPresent()`.
- `clickVisibleByText(pattern, selectors, label)` for resilient, visible-only clicks.
- `assertNoErrorPage(snapshot)` and the step-log vocabulary (`logClick`, `logScriptClick`, `logChange`, `logOpen`, `logResult`, `logValidate`, `logSkip`).

Expose intent-named methods (`verifyLoaded`, `validateHeroSection`, `searchByX`, `verifySearchByX`) so the spec reads like the desktop one.

### 4. Apply mobile-friendly adaptations (the actual point of the conversion)

Translate each desktop interaction into a phone-appropriate one:

- **Navigation collapses into a hamburger.** Desktop header links that are directly visible must be reached via `openHamburgerMenu()` before asserting nav. Scroll to top before opening the menu.
- **Scroll, don't assume in-view.** Use `scrollIntoView({ block: 'center' })` / `window.scrollTo(...)` before validating hero, market cards, or footer.
- **Clicks via visible-element evaluation.** Replace Playwright locator clicks with `driver.execute` that filters by `getComputedStyle`/`getBoundingClientRect` visibility, then `scrollIntoView` + `click()`; log script-driven clicks with `logScriptClick`.
- **Search uses autocomplete-from-home with a direct-URL fallback.** Reuse `searchFromHomeAutocompleteWithRetry()` (and the `shouldUseHomeAutocomplete()` / direct `/search?...` fallback pattern) instead of desktop typed-search.
- **Source-only DOM fallback.** The emulator sometimes returns a source-only snapshot (`snapshot.isSourceOnly`); assert against body text in that case instead of rendered elements.
- **Resilience is built in.** Rely on `pageLoadStrategy: 'eager'`, navigation settle pauses (`APPIUM_NAVIGATION_SETTLE_MS`), and session-loss recovery (`isSessionLostError` + `reloadSessionAfterLoss()` / `searchAndValidateByValue`'s retry). Keep media checks mobile-aware (autoplay video must also be `muted` + `playsinline`).
- **Keep selectors stable.** Prefer roles, `aria-label`, and stable text; add a mobile-only selector only where the desktop one has no mobile equivalent.

### 5. Register and run

- Add the new spec to the `specs` array in `wdio.mobile.conf.js` (and an npm `test:mobile:android:<area>` script if focused running is wanted).
- Verify on a running emulator/device:

```powershell
npm run test:mobile:android            # full mobile suite
npm run test:mobile:android:home       # focused example
```

See [docs/appium-mobile-browser-testing.md](../../docs/appium-mobile-browser-testing.md) for prerequisites (Android SDK, `adb devices`, Appium driver) and troubleshooting.

### 6. Report

State the files created/updated, the desktop test → mobile test mapping, the mobile-specific adaptations made, and the run command. Confirm the desktop suite is unchanged.

## Guardrails

- Do not duplicate the framework — reuse desktop config/data and existing `pages/mobile` objects.
- Add mobile config/specs in parallel; never modify or break the desktop Playwright setup.
- Android Chrome only (UiAutomator2). Do not add iOS Safari or BrowserStack unless explicitly requested.
