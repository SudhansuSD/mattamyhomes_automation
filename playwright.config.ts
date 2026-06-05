import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const isVsCodePlaywrightRun = Boolean(process.env.PW_TEST_REPORTER);
const allureResultsDir = path.resolve(__dirname, 'allure-results');

if (!isVsCodePlaywrightRun) {
  fs.rmSync(allureResultsDir, { recursive: true, force: true });
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  testIgnore: ['appium/**'],
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
  workers: 1,
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
  reporter: isVsCodePlaywrightRun
    ? [['line']]
    : [
      ['html', { outputFolder: 'playwright-report', open: 'never' }],
      ['json', { outputFile: 'test-results/results.json' }],
      ['./reporters/MattamyAutomationReporter.ts'],
      ['allure-playwright', { resultsDir: 'allure-results' }],
    ],
});
