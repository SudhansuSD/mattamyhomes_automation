# Appium Mobile Browser Testing

This repo has a separate Appium/WebdriverIO lane for Android Chrome mobile browser testing. Desktop Playwright tests are unchanged and still run with `npm test`.

## Covered Mobile Flows

- Home page load and hero section validation
- Hamburger menu navigation
- Find Your Home market selection and filter controls
- Community page load, breadcrumb, and contact/action bar
- Community form required-field and invalid-email validation

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

- This setup tests website behavior in real Android Chrome through Appium and UiAutomator2.
- BrowserStack is intentionally not configured.
- The mobile page objects mirror the desktop business methods where practical while keeping Appium-only selectors and session handling under `pages/mobile`.
