import { Page } from '@playwright/test';
import { BASE_URL } from '../config/testConfig';
import { CountryCode } from '../utils/country';

export class BasePage {
  constructor(protected page: Page) { }

  async navigate(country: CountryCode): Promise<void> {
    const url = `${BASE_URL}/?country=${country}`;
    console.log(`Navigating to: ${url}`);
    // Avoid redundant navigation when already on the correct country page
    try {
      const current = this.page.url();
      if (current && current.includes(`country=${country}`)) {
        console.log('Already on target country page — skipping navigate.');
        return;
      }
    } catch (e) {
      // ignore if page.url() is not available yet
    }

    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });

    // ✅ Wait for actual app readiness
    await this.page.waitForSelector('header', {
      timeout: 90000,
    });
  }
}
