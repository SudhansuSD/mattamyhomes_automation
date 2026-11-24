import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
  type ReporterDescription,
} from '@playwright/test';
import process from 'node:process';
import {
  getBrowserProjectKey,
  isMobileBrowserProject,
  type BrowserProjectKey,
} from './config/browserSelection';
import { getEnvConfig } from './config/environments/envConfig';
import { getChromiumTrackerBlockArgs } from './config/environments/thirdPartyTrackers';
import { DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR } from './scripts/allurePaths';
import { getBoolEnv, getNumberEnv, isCI, loadEnv } from './config/env';
import { LOCATION_AGNOSTIC_SPEC_GLOBS } from './config/locations/locationAgnosticSpecs';

loadEnv();

// CI is always headless; locally set HEADLESS=1. Headless ignores
// --start-maximized, so it gets a fixed desktop viewport to avoid mobile nav.
const isHeadless = isCI || getBoolEnv('HEADLESS');
const allowNonProdHttpsErrors = getEnvConfig().envName !== 'PROD';

// Multi-location runs keep each pass in its own report/results folder.
const locationPassTotal = getNumberEnv('LOCATION_PASS_TOTAL', 1);
const location = process.env.LOCATION?.trim();
if (locationPassTotal > 1 && !location) {
  throw new Error('LOCATION must be set when LOCATION_PASS_TOTAL is greater than 1.');
}
const locationSuffix = locationPassTotal > 1 && location ? `/${location.toUpperCase()}` : '';

const isMobileRun = isMobileBrowserProject();
const allureResultsDir = isMobileRun ? MOBILE_ALLURE_RESULTS_DIR : DESKTOP_ALLURE_RESULTS_DIR;
// Playwright empties outputDir each run, so each browser pass gets its own folder.
const browserSuffix = getNumberEnv('BROWSER_PASS_TOTAL', 1) > 1 ? `/${getBrowserProjectKey()}` : '';
const platformSuffix = `${isMobileRun ? '/mobile' : '/desktop'}${browserSuffix}`;

// Location-agnostic specs run only in the first pass to avoid duplicate Allure entries.
const isLaterLocationPass = getNumberEnv('LOCATION_PASS_INDEX', 0) > 0;
const testIgnore: string[] = [];
if (isLaterLocationPass) {
  testIgnore.push(...LOCATION_AGNOSTIC_SPEC_GLOBS);
}

type Project = NonNullable<PlaywrightTestConfig['projects']>[number];
const desktopViewport = { width: 1920, height: 1080 };

// Renderer-stability flags (large SSR pages crashed the renderer) plus tracker blocking.
const chromiumStabilityArgs = [
  '--disable-dev-shm-usage',
  '--disable-features=site-per-process,IsolateOrigins',
  ...getChromiumTrackerBlockArgs(),
];

const projectsByBrowser = {
  chromium: {
    name: 'Chrome',
    metadata: { platform: 'web', browserLabel: 'Chrome' },
    use: {
      browserName: 'chromium',
      launchOptions: {
        args: isHeadless ? chromiumStabilityArgs : ['--start-maximized', ...chromiumStabilityArgs],
      },
    },
  },
  firefox: {
    name: 'firefox',
    metadata: { platform: 'web', browserLabel: 'Firefox' },
    use: {
      browserName: 'firefox',
      viewport: isHeadless ? undefined : desktopViewport,
    },
  },
  webkit: {
    name: 'webkit',
    metadata: { platform: 'web', browserLabel: 'WebKit' },
    use: {
      browserName: 'webkit',
      viewport: isHeadless ? undefined : desktopViewport,
    },
  },

  mobileChrome: {
    name: 'Mobile Chrome',
    metadata: { platform: 'mobile', browserLabel: 'Mobile Chrome (Pixel 7)' },
    use: {
      ...devices['Pixel 7'],
      browserName: 'chromium',
      // No --start-maximized here: it fights the emulated device viewport.
      launchOptions: { args: chromiumStabilityArgs },
    },
  },
  mobileSafari: {
    name: 'Mobile Safari',
    metadata: { platform: 'mobile', browserLabel: 'Mobile Safari (iPhone 14)' },
    use: {
      ...devices['iPhone 14'],
      browserName: 'webkit',
      ignoreHTTPSErrors: allowNonProdHttpsErrors,
    },
  },
} satisfies Record<BrowserProjectKey, Project>;

const projects = [projectsByBrowser[getBrowserProjectKey()]];

const reporter: ReporterDescription[] = [
  // Before allure-playwright so the hung-action detail reaches the Allure error.
  ['./utils/reporting/timeoutDiagnosticsReporter.ts'],
  // Before allure-playwright so Allure sees runtime skip reasons.
  ['./utils/reporting/skipReasonReporter.ts'],
  ['list'],
  [
    'allure-playwright',
    {
      resultsDir: allureResultsDir,
      detail: false,
      suiteTitle: true,
    },
  ],
];
// Last, so it prunes only after other reporters have copied their attachments.
reporter.push(['./utils/reporting/flakyTracePruner.ts']);
if (isCI) {
  reporter.push([
    'html',
    { outputFolder: `playwright-report${platformSuffix}${locationSuffix}`, open: 'never' },
  ]);
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore,
  outputDir: `test-results${platformSuffix}${locationSuffix}`,
  globalSetup: './scripts/playwrightGlobalSetup.ts',
  // Also runs on CI: it merges the evidence shards into the xlsx.
  globalTeardown: './scripts/playwrightGlobalTeardown.ts',
  // Block a committed `test.only` on CI; allow it locally for debugging.
  forbidOnly: isCI,
  use: {
    headless: isHeadless,
    viewport: isHeadless ? desktopViewport : null,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Default is no limit, so one stuck action could eat the whole test timeout.
    actionTimeout: 30_000,
    navigationTimeout: 90_000,
    video: 'off',
  },
  // One central timeout for web-first assertions.
  expect: { timeout: 15_000 },

  workers: getNumberEnv('PW_WORKERS', 2),
  fullyParallel: true,
  timeout: 5 * 60 * 1000,

  // Retries are opt-in so instability stays visible in Allure.
  retries: Math.max(0, Math.trunc(getNumberEnv('PW_RETRIES', 0))),
  projects,
  reporter,
});
