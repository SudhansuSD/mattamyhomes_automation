import { Page } from '@playwright/test';
import { getEnvConfig } from '../config/testConfig';
import { getLocationConfig, LocationKey } from '../config/locations';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(overrideLocation?: LocationKey): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(overrideLocation);

    const targetUrl = `${baseURL}/?${location.queryParam}`;

    console.log(
      `[NAVIGATE] ENV=${envName} | COUNTRY=${location.country} | URL=${targetUrl}`
    );

    // Always navigate — avoid clever skips
    await this.page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    // Minimal, reliable stabilization
    await this.page.waitForTimeout(1000);
  }
}
