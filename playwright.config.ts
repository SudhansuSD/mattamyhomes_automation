import { defineConfig, type ReporterDescription } from '@playwright/test';
import process from 'node:process';
import { DESKTOP_ALLURE_RESULTS_DIR } from './scripts/allurePaths';
import { loadEnv } from './config/env';

// Load .env (repo-root anchored) so TEST_ENV / BROWSER / CI-related vars are
// available regardless of the directory the command was launched from.
loadEnv();

// GitHub Actions (and other CI) sets CI=true. Used only to enable CI-specific
// behaviour; local execution keeps its existing defaults.
const isCI = !!process.env.CI;

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
  reporter.push(['html', { outputFolder: 'playwright-report', open: 'never' }]);
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore: ['appium/**', 'mobile/**'],
  // Clear stale Allure results once, in the main process, before any tests.
  globalSetup: './scripts/playwrightGlobalSetup.ts',
  // After a local `npx playwright test`, build the desktop Allure HTML report.
  // Disabled under CI, where the workflow generates the report as an explicit
  // step (and uploads it as an artifact).
  globalTeardown: process.env.CI ? undefined : './scripts/playwrightGlobalTeardown.ts',
  use: {
    // baseURL: 'https://mattamyhomes.com/',
    headless: process.env.CI ? true : false,
    // Headless Linux does not reliably honor --start-maximized. Keep CI at a
    // deterministic desktop size so responsive navigation stays in desktop mode.
    viewport: isCI ? { width: 1920, height: 1080 } : null,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: isCI ? [] : ['--start-maximized'],
    },
    video: 'off',
  },
  workers: process.env.CI ? 2 : 1,
  fullyParallel: false,
  timeout: 50 * 60 * 1000,
  // Retry once under CI to absorb flakiness; no retries locally (unchanged).
  retries: isCI ? 1 : 0,
  projects,
  reporter,
});
