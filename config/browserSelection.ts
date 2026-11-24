import { getEnv } from './env';

export type BrowserProjectKey = 'chromium' | 'firefox' | 'webkit' | 'mobileChrome' | 'mobileSafari';

/** Accepted BROWSER values; `mobile-safari` uses WebKit because that is the iOS engine. */
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

/** True for the phone device profiles. */
export function isMobileBrowserProject(
  browser: BrowserProjectKey = getBrowserProjectKey(),
): boolean {
  return browser === 'mobileChrome' || browser === 'mobileSafari';
}

/** Maps the BROWSER value to a project key, throwing on unknown values. */
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

/** Splits a comma-separated browser list into unique entries. */
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

/** Names the browsers a run covered (web then mobile), defaulting to the web browser. */
export function getBrowserCoverageLabel(coversWeb: boolean, coversMobile: boolean): string {
  const labels = [
    ...(coversWeb ? [getBrowserDisplayName()] : []),
    ...(coversMobile ? [getMobileBrowserDisplayName()] : []),
  ];

  return labels.join(' + ') || getBrowserDisplayName();
}
