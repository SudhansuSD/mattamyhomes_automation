---
name: desktop-to-appium-mobile
description: Convert or extend an existing desktop web automation framework to run the same website flows on real mobile browsers using Appium, while reusing existing page objects, locators, utilities, test data, and reporting standards.
---

# Desktop Web To Appium Mobile Browser Skill

## Purpose

Use this skill when the project already has desktop browser automation and the user wants to execute the same website flows on a real mobile browser using Appium.

The goal is to avoid duplicating the whole framework. Reuse existing:

- Page object methods
- Test data
- Locators wherever possible
- Common assertions
- Reporting setup
- Environment configuration
- CI/CD execution pattern

Add only the mobile-specific browser/session setup and mobile-specific handling where required.

---

## Expected Project Context

The existing repo may already contain:

- Desktop web tests
- Page objects
- Utility/helper methods
- Test data files
- Playwright, WebdriverIO, Selenium, or another browser automation setup
- Existing report generation
- Existing environment variables

The new Appium mobile-browser setup should be added in parallel without breaking desktop execution.

---

## Target Mobile Execution For This Project

The user is using Android Studio, so prioritize local Android execution.

Supported setup:

- Android Studio emulator with Chrome
- Real Android device with Chrome
- Appium server running locally
- UiAutomator2 driver
- WebdriverIO with TypeScript for Appium browser automation

Do not configure iOS Safari or BrowserStack unless explicitly requested later.
---

## Main Instruction

When asked to add mobile browser execution using Appium:

1. Inspect the existing automation framework structure.
2. Identify reusable desktop page objects and utilities.
3. Add Appium mobile configuration without replacing desktop configuration.
4. Create mobile-specific driver/session setup.
5. Create mobile test specs that call existing reusable business-flow methods.
6. Add only mobile-specific locators where desktop locators do not work.
7. Add clear run commands.
8. Update documentation.
9. Ensure desktop tests continue to run as before.

---

## Required Folder Structure

Prefer this structure unless the existing project already has a better convention:

```text
tests/
├── existing desktop tests
├── mobile/
│   ├── mobileWeb.home.spec.ts
│   ├── mobileWeb.community.spec.ts
│   └── mobileWeb.form.spec.ts

pages/
├── existing page objects
└── mobile/
    └── optional mobile-specific page objects only when needed

utils/
├── existing utilities
└── mobileDriver.ts

config/
├── desktop config files
└── appium.config.ts

.env
README.md