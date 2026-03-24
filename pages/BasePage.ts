import { Page, Locator, expect } from '@playwright/test';
import { getEnvConfig } from '../config/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations';

/* ==========================================================
   Base Page – Shared Navigation & Common Utilities
========================================================== */

export class BasePage {

  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* ==========================================================
     Navigation
  ========================================================== */

  async navigate(overrideLocation?: LocationKey): Promise<void> {

    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(overrideLocation);

    const targetUrl = `${baseURL}/?${location.queryParam}`;

    console.log(
      `[NAVIGATE] ENV=${envName} | COUNTRY=${location.country} | URL=${targetUrl}`
    );

    await this.page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.acceptCookiesIfPresent();

    // 🔹 Use common load handler instead of inline wait
    await this.waitForPageReady();
  }

  /* ==========================================================
     Common Load Stabilization
  ========================================================== */

  protected async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // same behavior as before
  }

  /* ==========================================================
     Cookie Handling
  ========================================================== */

  async acceptCookiesIfPresent(): Promise<void> {

    const acceptBtn = this.page.locator('#onetrust-accept-btn-handler');

    const isVisible = await acceptBtn
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isVisible) {
      await acceptBtn.click();
      console.log('Cookie banner accepted');
    }
  }

  /* ==========================================================
  Scroll Handler 
  ========================================================== */

  protected async scrollTo(locator: Locator): Promise<void> {

    await locator.waitFor({ state: 'attached', timeout: 10000 });

    await locator.evaluate((el) => {
      el.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'nearest'
      });
    });

    await this.page.waitForTimeout(800);
  }
  /* ==========================================================
  Helper
  ========================================================== */

  protected buildFullUrl(relativeUrl: string | null): string {
    if (!relativeUrl) throw new Error('URL is null');
    return new URL(relativeUrl, this.page.url()).href;

  }

  /* ==========================================================
     Utils (NEW - stable reusable helpers)
  ========================================================== */

  protected async clickElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();

    await Promise.all([
      this.waitForPageReady(), // SPA-safe wait
      locator.click()
    ]);
  }

  protected async isSectionVisible(locator: Locator, timeout = 7000): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout });
      return true;
    } catch {
      return false;
    }
  }


}