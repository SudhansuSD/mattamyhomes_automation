import { defineConfig, type ReporterDescription } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { DESKTOP_ALLURE_RESULTS_DIR } from './scripts/allurePaths';

const repoRoot = __dirname;

// GitHub Actions (and other CI) sets CI=true. Used only to enable CI-specific
// behaviour; local execution keeps its existing defaults.
const isCI = !!process.env.CI;

delete process.env.PW_TEST_REPORTER;
fs.rmSync(DESKTOP_ALLURE_RESULTS_DIR, { recursive: true, force: true });

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
  globalTeardown: process.env.CI ? undefined : './scripts/generate-allure-report.ts',
  use: {
    // baseURL: 'https://mattamyhomes.com/',
    headless: process.env.CI ? true : false,
    viewport: null,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--start-maximized'],
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
