# Appium Mobile Browser Testing

This repo has a separate Appium/WebdriverIO lane for mobile browser testing on **Android Chrome** and **iOS Safari**. The same specs and page objects run on both platforms; pick the target with the `MOBILE_PLATFORM` environment variable (`android` — the default — or `ios`). Desktop Playwright tests are unchanged and still run with `npm test`.

> **Platform selection:** `MOBILE_PLATFORM=android` (default) runs Chrome via UiAutomator2; `MOBILE_PLATFORM=ios` runs Safari via XCUITest. The `test:mobile:android:*` npm scripts default to Android; the `test:mobile:ios:*` scripts set `MOBILE_PLATFORM=ios` for you. iOS can only run on macOS with Xcode (see [Running on iOS](#running-on-ios-safari)).

## Covered Mobile Flows

- Home page load and hero section validation
- Hamburger menu navigation
- Find Your Home market selection and filter controls
- Community page load, breadcrumb, and contact/action bar
- Community form required-field and invalid-email validation
- Market page navigation, hero, community cards, Discover Our Homes, and lead-form submission
- MPC, plan, and QMI detail pages, search results, and their lead forms

All flows run on both Android Chrome and iOS Safari from the same specs.

## Prerequisites

Install and configure these on the test machine:

- Android Studio or Android SDK command-line tools
- `ANDROID_HOME` pointing to the Android SDK folder
- `%ANDROID_HOME%\platform-tools` added to `PATH`
- A running Android emulator or a USB-connected Android device with Chrome installed

Check the device connection:

```powershell
adb devices
```

Install the Appium Android driver if needed:

```powershell
npm run appium:driver:install
```

Check Appium Android readiness:

```powershell
npm run appium:doctor:android
```

## Run Commands

Run the full Android Chrome mobile web suite:

```powershell
npm run test:mobile:android
```

Run focused mobile flows:

```powershell
npm run test:mobile:android:home
npm run test:mobile:android:search
npm run test:mobile:android:community
npm run test:mobile:android:forms
```

Optional environment values:

```powershell
$env:ENV = "STAGE"
$env:LOCATION = "USA"
$env:APPIUM_DEVICE_NAME = "Android Emulator"
$env:APPIUM_UDID = "emulator-5554"
$env:APPIUM_HOST = "127.0.0.1"
$env:APPIUM_PORT = "4723"
npm run test:mobile:android
```

Command Prompt:

```cmd
set ENV=STAGE
set LOCATION=USA
set APPIUM_DEVICE_NAME=Android Emulator
set APPIUM_UDID=emulator-5554
set APPIUM_HOST=127.0.0.1
set APPIUM_PORT=4723
npm run test:mobile:android
```

## Running on iOS (Safari)

iOS Safari testing runs through the same specs/page objects, selected with `MOBILE_PLATFORM=ios`. It uses the XCUITest driver and a Safari session instead of Chrome/UiAutomator2.

### iOS prerequisites

iOS automation **requires macOS** — it cannot run on Windows or Linux. On a Mac:

- Xcode + Command Line Tools installed (`xcode-select --install`)
- An iOS Simulator (open Xcode → Settings → Platforms, or install via `xcodebuild -downloadPlatform iOS`), or a provisioned real device
- Node + this repo's `npm install`

Install the Appium iOS driver:

```bash
npm run appium:driver:install:ios
```

Check Appium iOS readiness (surfaces missing Xcode/simulator dependencies):

```bash
npm run appium:doctor:ios
```

List available simulators to pick a device name / OS version:

```bash
xcrun simctl list devices available
```

### iOS run commands

Run the full iOS Safari mobile web suite:

```bash
npm run test:mobile:ios
```

Run focused iOS flows:

```bash
npm run test:mobile:ios:home
npm run test:mobile:ios:search
npm run test:mobile:ios:community
npm run test:mobile:ios:market
npm run test:mobile:ios:mpc
npm run test:mobile:ios:plan
npm run test:mobile:ios:qmi
```

Target a specific simulator / OS version (defaults are `iPhone 15` / `17.0`), and optionally a real device UDID:

```bash
export MOBILE_PLATFORM=ios
export APPIUM_DEVICE_NAME="iPhone 15"
export APPIUM_PLATFORM_VERSION="17.0"
export APPIUM_UDID="<device-udid>"   # optional; omit for a named simulator
npm run test:mobile:ios
```

### iOS notes and known caveats

- **`APPIUM_DEVICE_NAME` / `APPIUM_PLATFORM_VERSION` must match a simulator you actually have installed** — otherwise the session fails to create. Confirm with `xcrun simctl list devices available`.
- There is **no adb-style profile reset on iOS**. The Android `beforeSession` clears `com.android.chrome`; on iOS that hook is a no-op and Appium's fresh Safari session provides the clean slate.
- The mobile browser-context check (`verifyLoaded`) asserts the user agent per platform via `utils/mobilePlatform.js` — iPhone/iPad + Safari on iOS, Android + Chrome on Android.
- **iPad caveat:** iPadOS Safari can request the *desktop* site and report a `Macintosh` user agent (no `iPad` token). The current iOS UA matcher targets `iPhone/iPad/iPod`; if you specifically test an iPad, widen the `device` pattern in `utils/mobilePlatform.js` after checking the real UA.
- `pageLoadStrategy: "eager"` is applied on Android only; iOS uses the default strategy.

## Chrome Profile

Each session starts from a clean Chrome profile: `beforeSession` force-stops and clears
`com.android.chrome` (`appium:noReset: false`). Caching the profile was tried and turned
out slower and flakier — Chrome restored the previous run's heavy tab and stalled the
renderer while loading the next page, so clean-per-session is the default.

## Troubleshooting ADB Startup

Make sure the emulator or device is connected and ready before running the suite. Appium
creates the Chrome session against the configured `APPIUM_UDID`, so it must be listed as
`device`:

```powershell
adb devices
```

If the device is listed as `offline`, refresh the ADB connection and wait for it:

```powershell
adb reconnect offline
adb -s emulator-5554 wait-for-device
adb devices
```

If it stays offline, cold boot the emulator from Android Studio Device Manager, unlock the
Android screen after startup, and run `adb devices` again until the state is `device`.

## Notes

- This setup tests website behavior in real mobile browsers through Appium — Android Chrome (UiAutomator2) and iOS Safari (XCUITest).
- Platform selection is centralized in `utils/mobilePlatform.js`; capabilities are built per platform in `wdio.mobile.conf.js`.
- BrowserStack is intentionally not configured.
- The mobile page objects mirror the desktop business methods where practical while keeping Appium-only selectors and session handling under `pages/mobile`.
