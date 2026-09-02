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
import { DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR } from './scripts/allurePaths';
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

/*
 * Web and mobile are separate report streams, not one mixed pile.
 *
 * Exactly one project runs per Playwright process (see `projects` below), so the
 * selected BROWSER decides which Allure results dir this run writes to -
 * allure-results/desktop or allure-results/mobile - and the existing
 * desktop/mobile/merged report generators pick them up unchanged. Trace and
 * screenshot output is split the same way so a mobile failure's artifacts cannot
 * overwrite the desktop run's for the same test name.
 */
const isMobileRun = isMobileBrowserProject();
const allureResultsDir = isMobileRun ? MOBILE_ALLURE_RESULTS_DIR : DESKTOP_ALLURE_RESULTS_DIR;
const platformSuffix = isMobileRun ? '/mobile' : '/desktop';

// Location-agnostic specs are ignored after pass 0 so later passes do not write
// duplicate Allure entries for specs that are not location-specific.

const isLaterLocationPass = getNumberEnv('LOCATION_PASS_INDEX', 0) > 0;
const testIgnore: string[] = [];
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
  /*
   * Mobile web, as a device profile of this framework rather than a separate
   * stack. The device descriptors carry viewport, device pixel ratio, touch and
   * user agent, and their `viewport` overrides the desktop default in `use`
   * below - so these must never be given the desktop viewport or the phone
   * layout under test disappears.
   *
   * `metadata.platform` is what labels a result Web or Mobile in the report, so
   * it is read from the running project rather than inferred from BROWSER.
   */
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
      // WebKit, not Chromium. WebKit is the engine every iOS browser is
      // required to use, so an iPhone profile on Chromium would emulate the
      // screen while rendering with the wrong engine - which is precisely the
      // iOS-specific breakage these tests exist to catch. `devices['iPhone 14']`
      // already defaults to webkit; naming it keeps that explicit alongside the
      // other projects, which all set browserName directly.
      browserName: 'webkit',
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
      resultsDir: allureResultsDir,
      detail: false,
      suiteTitle: true,
    },
  ],
];
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
   * Serial by default, and a deliberate reliability choice.
   *
   * The limit is rendering, not CPU. These pages ship 350-600KB of SSR HTML and
   * hydrate client side, and concurrency starves that: the four static legal
   * pages pass 7/7 serially and lose 1-2 to "heading not found" at two or four
   * workers, on the same machine minutes apart. Parallelism buys about 1.4x wall
   * clock and pays for it by turning passing tests red, so raise PW_WORKERS only
   * for a run whose failures you are willing to re-check serially.
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
