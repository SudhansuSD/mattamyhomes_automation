import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

const isVsCodePlaywrightRun = Boolean(process.env.PW_TEST_REPORTER);

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
    video: 'retain-on-failure',
  },
  workers: 3,
  fullyParallel: false,
  timeout: 50 * 60 * 1000,
  projects: [
    {
      name: 'Chromium',
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
    {
      name: 'Mobile Chrome - Pixel 7',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        browserName: 'webkit',
      },
    },
  ],
  reporter: isVsCodePlaywrightRun
    ? [['line']]
    : [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['allure-playwright', { resultsDir: 'allure-results' }],
      ],
});
