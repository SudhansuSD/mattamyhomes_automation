import { defineConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { DESKTOP_ALLURE_RESULTS_DIR } from './scripts/allurePaths';

const repoRoot = __dirname;

delete process.env.PW_TEST_REPORTER;
fs.rmSync(DESKTOP_ALLURE_RESULTS_DIR, { recursive: true, force: true });

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
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    // {
    //   name: 'Firefox',
    //   use: { browserName: 'firefox' },
    // },
    // {
    //   name: 'WebKit',
    //   use: { browserName: 'webkit' },
    // },
  ],
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        resultsDir: DESKTOP_ALLURE_RESULTS_DIR,
        detail: false,
        suiteTitle: true,
      },
    ],
  ],
});
