import { getEnv } from './env';

export type BrowserProjectKey = 'chromium' | 'firefox' | 'webkit';

const BROWSER_SELECTIONS: Record<string, BrowserProjectKey> = {
  chrome: 'chromium',
  chromium: 'chromium',
  firefox: 'firefox',
  webkit: 'webkit',
};

const BROWSER_DISPLAY_NAMES = {
  chromium: 'Chrome',
  firefox: 'Firefox',
  webkit: 'WebKit',
} as const satisfies Record<BrowserProjectKey, string>;

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
