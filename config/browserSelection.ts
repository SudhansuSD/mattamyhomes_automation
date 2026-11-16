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

/**
 * Splits a comma-separated browser selection (`chromium,firefox`) into its
 * entries. The runner accepts a list per platform and gives each entry its own
 * Playwright process, so a single process only ever sees one value.
 */
export function parseBrowserList(rawBrowsers: string): string[] {
  return [
    ...new Set(
      rawBrowsers
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

/** Display name for a browser selection; a list reads as "Chrome + Firefox". */
export function getBrowserDisplayName(rawBrowser = getEnv('BROWSER', 'chromium')): string {
  const names = parseBrowserList(rawBrowser).map(
    (browser) => BROWSER_DISPLAY_NAMES[getBrowserProjectKey(browser)],
  );

  return names.join(' + ') || BROWSER_DISPLAY_NAMES.chromium;
}

/** Display name of the device profile the mobile pass runs under. */
export function getMobileBrowserDisplayName(): string {
  return getBrowserDisplayName(getEnv('MOBILE_BROWSER', 'mobile-safari'));
}

/**
 * Names the browser(s) a run covers, in web-then-mobile order.
 *
 * Callers pass the coverage they can actually prove - which results directories
 * received results, or which stream a report is being built for - because a
 * two-platform run named after BROWSER alone reads as web-only, and the email
 * header is the one summary most recipients ever see. Falls back to the web
 * browser when a caller can prove neither, so a run that produced no results at
 * all still names something.
 */
export function getBrowserCoverageLabel(coversWeb: boolean, coversMobile: boolean): string {
  const labels = [
    ...(coversWeb ? [getBrowserDisplayName()] : []),
    ...(coversMobile ? [getMobileBrowserDisplayName()] : []),
  ];

  return labels.join(' + ') || getBrowserDisplayName();
}
