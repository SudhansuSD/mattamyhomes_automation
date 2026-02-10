import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  use: {
    // baseURL: 'https://mattamyhomes.com/',
    headless: process.env.CI ? true : false
,   // see browser UI
    viewport: null,    // IMPORTANT: full screen

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--start-maximized'],
    },
    video: 'retain-on-failure',

  },
  workers: 1, // 🔒 force single worker
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
  ],
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]

  ],
});
