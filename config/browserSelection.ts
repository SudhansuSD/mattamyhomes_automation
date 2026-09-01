import { getEnv } from './env';

export type BrowserProjectKey = 'chromium' | 'firefox' | 'webkit' | 'mobileChrome' | 'mobileSafari';

/**
 * Accepted BROWSER values, including the mobile-web device profiles.
 *
 * Mobile web is a device profile of this framework, not a separate stack: the
 * same specs and page objects run at a phone viewport. `mobile-safari` runs on
 * WebKit because WebKit *is* the iOS browser engine - running iPhone tests on
 * Chromium would emulate the screen while testing the wrong renderer, which is
 * the coverage that matters most on iOS.
 */
const BROWSER_SELECTIONS: Record<string, BrowserProjectKey> = {
  chrome: 'chromium',
  chromium: 'chromium',
  firefox: 'firefox',
  webkit: 'webkit',
  'mobile-chrome': 'mobileChrome',
  android: 'mobileChrome',
  'mobile-safari': 'mobileSafari',
  ios: 'mobileSafari',
  iphone: 'mobileSafari',
};

const BROWSER_DISPLAY_NAMES = {
  chromium: 'Chrome',
  firefox: 'Firefox',
  webkit: 'WebKit',
  mobileChrome: 'Mobile Chrome (Pixel 7)',
  mobileSafari: 'Mobile Safari (iPhone 14)',
} as const satisfies Record<BrowserProjectKey, string>;

/** True for the phone-viewport device profiles, which share the mobile-web layout. */
export function isMobileBrowserProject(
  browser: BrowserProjectKey = getBrowserProjectKey(),
): boolean {
  return browser === 'mobileChrome' || browser === 'mobileSafari';
}

export function getBrowserProjectKey(
  rawBrowser = getEnv('BROWSER', 'chromium'),
): BrowserProjectKey {
  const selection = rawBrowser.trim().toLowerCase();
  const browser = BROWSER_SELECTIONS[selection];

  if (!browser) {
    throw new Error(
      `Unsupported BROWSER="${rawBrowser}". Use ${Object.keys(BROWSER_SELECTIONS).join(', ')}.`,
    );
  }

  return browser;
}

export function getBrowserDisplayName(rawBrowser = getEnv('BROWSER', 'chromium')): string {
  return BROWSER_DISPLAY_NAMES[getBrowserProjectKey(rawBrowser)];
}
