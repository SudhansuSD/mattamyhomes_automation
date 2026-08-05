import { defineConfig, type ReporterDescription } from '@playwright/test';
import process from 'node:process';
import { DESKTOP_ALLURE_RESULTS_DIR } from './scripts/allurePaths';
import { getBoolEnv, loadEnv } from './config/env';
import { LOCATION_AGNOSTIC_SPEC_GLOBS } from './config/locations/locationAgnosticSpecs';

// Load .env (repo-root anchored) so ENV / BROWSER / CI-related vars are
// available regardless of the directory the command was launched from.
loadEnv();

// GitHub Actions (and other CI) sets CI=true. Used only to enable CI-specific
// behaviour; local execution keeps its existing defaults.
const isCI = !!process.env.CI;

// Headless whenever CI runs, or locally ONLY when the command asks for it:
//   HEADLESS=1 npx playwright test ...
// Local runs without that stay headed exactly as before. (Playwright's CLI has
// --headed but no --headless, so a config-level opt-in is the only way to ask for
// headless from the command line.)
//
// Viewport and window args follow this rather than isCI: a headless browser
// ignores --start-maximized, so with viewport:null it falls back to a small window
// and renders the MOBILE navigation, breaking desktop-only flows.
const isHeadless = isCI || getBoolEnv('HEADLESS');

// scripts/run-locations.ts runs one Playwright process per location when no
// LOCATION is given. Those passes would otherwise overwrite each other's HTML
// report and test-results/ (both are cleaned at the start of every run), so
// each pass gets its own subfolder. A single-location run keeps the old paths.
const locationPassTotal = Number(process.env.LOCATION_PASS_TOTAL ?? '1');
const locationSuffix =
  locationPassTotal > 1 ? `/${(process.env.LOCATION ?? 'unknown').toUpperCase()}` : '';

// Location-agnostic specs run in the first pass only. Ignoring them keeps them
// out of collection entirely, so no duplicate (skipped) Allure results are
// written that would collide with the real results from the first pass.
const isLaterLocationPass = Number(process.env.LOCATION_PASS_INDEX ?? '0') > 0;
const testIgnore = ['appium/**', 'mobile/**'];
if (isLaterLocationPass) {
  testIgnore.push(...LOCATION_AGNOSTIC_SPEC_GLOBS);
}

// NOTE: Clearing the Allure results dir is done in globalSetup (main process,
// once) — NOT here. Top-level side effects run in every worker, so a worker
// restart after a failing test would otherwise wipe results mid-run.
delete process.env.PW_TEST_REPORTER;

// Desktop browser projects. "Chrome" (chromium) is the only project locally,
// so `npx playwright test` behaves exactly as before. Firefox and WebKit are
// added ONLY under CI so the manual workflow's browser matrix works without
// forcing extra browsers on local runs.
type BrowserName = 'chromium' | 'firefox' | 'webkit';
const projects: { name: string; use: { browserName: BrowserName } }[] = [
  { name: 'Chrome', use: { browserName: 'chromium' } },
];
if (isCI) {
  projects.push(
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  );
}

// Reporters. Local reporters are unchanged; the Playwright HTML reporter is
// added ONLY under CI so the workflow can upload it as an artifact.
const reporter: ReporterDescription[] = [
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
  // Clear stale Allure results once, in the main process, before any tests.
  globalSetup: './scripts/playwrightGlobalSetup.ts',
  // After a local `npx playwright test`, build the desktop Allure HTML report.
  // Disabled under CI, where the workflow generates the report as an explicit
  // step (and uploads it as an artifact).
  globalTeardown: process.env.CI ? undefined : './scripts/playwrightGlobalTeardown.ts',
  use: {
    // baseURL: 'https://mattamyhomes.com/',
    headless: isHeadless,
    // Headless does not honor --start-maximized, so pin a deterministic desktop
    // size; headed runs keep the maximized real window.
    viewport: isHeadless ? { width: 1920, height: 1080 } : null,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Playwright defaults both to 0 (no limit), which lets a single action on a
    // hidden/unstable element retry until the whole test slot is burned. Cap
    // them so such a hang fails fast with a usable call log instead.
    actionTimeout: 30_000,
    navigationTimeout: 90_000,
    launchOptions: {
      args: isHeadless ? [] : ['--start-maximized'],
    },
    video: 'off',
  },
  workers: process.env.CI ? 2 : 1,
  fullyParallel: false,
  // Per-test budget (Playwright applies `timeout` to each test, not to the run -
  // a whole-run cap would be `globalTimeout`). Observed tests run ~1-2 min, so
  // 5 min leaves headroom while still surfacing a hang as a failure. Raise it
  // for a genuinely slow suite at the spec or describe level instead of here:
  //   test.describe.configure({ timeout: 10 * 60 * 1000 })
  //   test.setTimeout(8 * 60 * 1000)
  timeout: 5 * 60 * 1000,
  // Retry once under CI to absorb flakiness; no retries locally (unchanged).
  retries: isCI ? 0 : 0,
  projects,
  reporter,
});
