import {
  defineConfig,
  type PlaywrightTestConfig,
  type ReporterDescription,
} from '@playwright/test';
import process from 'node:process';
import { getBrowserProjectKey, type BrowserProjectKey } from './config/browserSelection';
import { DESKTOP_ALLURE_RESULTS_DIR } from './scripts/allurePaths';
import { getBoolEnv, getNumberEnv, isCI, loadEnv } from './config/env';
import { LOCATION_AGNOSTIC_SPEC_GLOBS } from './config/locations/locationAgnosticSpecs';

loadEnv();

// CI is always headless; local runs opt in with HEADLESS=1. Viewport follows
// isHeadless, not isCI: headless ignores --start-maximized and otherwise falls
// back to a small window that renders mobile navigation.
const isHeadless = isCI || getBoolEnv('HEADLESS');

// Multi-location runs keep each pass in its own report/results folder.
const locationPassTotal = getNumberEnv('LOCATION_PASS_TOTAL', 1);
const location = process.env.LOCATION?.trim();
if (locationPassTotal > 1 && !location) {
  throw new Error('LOCATION must be set when LOCATION_PASS_TOTAL is greater than 1.');
}
const locationSuffix = locationPassTotal > 1 && location ? `/${location.toUpperCase()}` : '';

// Location-agnostic specs are ignored after pass 0 so later passes do not write
// duplicate Allure entries for specs that are not location-specific.

const isLaterLocationPass = getNumberEnv('LOCATION_PASS_INDEX', 0) > 0;
const testIgnore = ['appium/**', 'mobile/**'];
if (isLaterLocationPass) {
  testIgnore.push(...LOCATION_AGNOSTIC_SPEC_GLOBS);
}

type Project = NonNullable<PlaywrightTestConfig['projects']>[number];
const desktopViewport = { width: 1920, height: 1080 };

// Renderer-stability flags. These pages ship 350-600KB of SSR HTML and running
// more than one at a time surfaced as "page.goto: Page crashed" rather than as
// a test failure - the renderer being killed, not the product breaking.

const chromiumStabilityArgs = [
  '--disable-dev-shm-usage',
  '--disable-features=site-per-process,IsolateOrigins',
];

const projectsByBrowser = {
  chromium: {
    name: 'Chrome',
    use: {
      browserName: 'chromium',
      launchOptions: {
        args: isHeadless ? chromiumStabilityArgs : ['--start-maximized', ...chromiumStabilityArgs],
      },
    },
  },
  firefox: {
    name: 'firefox',
    use: {
      browserName: 'firefox',
      viewport: isHeadless ? undefined : desktopViewport,
    },
  },
  webkit: {
    name: 'webkit',
    use: {
      browserName: 'webkit',
      viewport: isHeadless ? undefined : desktopViewport,
    },
  },
} satisfies Record<BrowserProjectKey, Project>;

const projects = [projectsByBrowser[getBrowserProjectKey()]];

const reporter: ReporterDescription[] = [
  // Ahead of allure-playwright on purpose: it appends the hung-action detail to
  // the test error, and reporters share the TestResult in registration order.
  ['./utils/reporting/timeoutDiagnosticsReporter.ts'],
  ['list'],
  [
    'allure-playwright',
    {
      resultsDir: DESKTOP_ALLURE_RESULTS_DIR,
      detail: false,
      suiteTitle: true,
    },
  ],
];
if (isCI) {
  reporter.push(['html', { outputFolder: `playwright-report${locationSuffix}`, open: 'never' }]);
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore,
  outputDir: `test-results${locationSuffix}`,
  globalSetup: './scripts/playwrightGlobalSetup.ts',
  // Registered under CI too: teardown is what merges the per-worker lead-API
  // capture shards into the xlsx. It skips the Allure HTML build on CI itself.
  globalTeardown: './scripts/playwrightGlobalTeardown.ts',
  use: {
    headless: isHeadless,
    viewport: isHeadless ? desktopViewport : null,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Playwright defaults these to 0 (no limit), so a single unstable action or
    // navigation can otherwise consume the full per-test budget.
    actionTimeout: 30_000,
    navigationTimeout: 90_000,
    video: 'off',
  },
  // Govern web-first assertions centrally instead of scattering magic timeouts.
  expect: { timeout: 15_000 },
  /*
   * Parallel by default. This was serial because the lead-API evidence workbook
   * is written in teardown, and parallel writes would corrupt it. That is now
   * handled by the playwrightGlobalTeardown.ts merge, so parallelism is safe.
   */
  workers: getNumberEnv('PW_WORKERS', 1),
  fullyParallel: true,
  /*
   * Per-test budget. Kept at two minutes so a wedged page fails fast and does not consume the full CI job budget.
   */
  timeout: 5 * 60 * 1000,
  // Keep retries opt-in so staging instability remains visible in Allure trends.
  retries: Math.max(0, Math.trunc(getNumberEnv('PW_RETRIES', 0))),
  projects,
  reporter,
});
