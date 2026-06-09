import { expect, Locator, Page, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { escapeRegex } from '../utils/pageObjectUtils';

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

    await test.step(`Open Mattamy Homes home page for ${location.country} in ${envName}`, async () => {
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
    });
  }

  /* ==========================================================
     Common Load Stabilization
  ========================================================== */

  protected async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(3000); // same behavior as before
  }

  /* ==========================================================
     Shared Assertions
  ========================================================== */

  protected async assertPageLoaded(label = 'Page should be loaded'): Promise<void> {
    await test.step(label, async () => {
    await this.waitForPageReady();
    await expect(this.page, label).not.toHaveURL(/about:blank/i);
    });
  }

  protected async assertPageTitle(
    expectedTitle: string | RegExp,
    label = 'Page title should match expected value'
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(this.page, label).toHaveTitle(expectedTitle);
    });
  }

  protected async assertPageUrl(
    expectedUrl: string | RegExp,
    label = 'Page URL should match expected value',
    timeout = 60_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(this.page, label).toHaveURL(expectedUrl, { timeout });
    });
  }

  protected async assertPageUrlContains(
    expectedUrlPart: string,
    label = `Page URL should contain: ${expectedUrlPart}`,
    timeout = 60_000
  ): Promise<void> {
    await this.assertPageUrl(new RegExp(escapeRegex(expectedUrlPart), 'i'), label, timeout);
  }

  protected async assertPageUrlDoesNotMatch(
    unexpectedUrl: string | RegExp,
    label = 'Page URL should not match unexpected value'
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(this.page, label).not.toHaveURL(unexpectedUrl);
    });
  }

  protected async assertVisible(
    locator: Locator,
    label = 'Element should be visible',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toBeVisible({ timeout });
    });
  }

  protected async assertAttached(
    locator: Locator,
    label = 'Element should be attached',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toBeAttached({ timeout });
    });
  }

  protected async assertTextContains(
    locator: Locator,
    expectedText: string | RegExp,
    label = 'Element should contain expected text',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toContainText(expectedText, { timeout });
    });
  }

  protected async assertText(
    locator: Locator,
    expectedText: string | RegExp,
    label = 'Element text should match expected value',
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toHaveText(expectedText, { timeout });
    });
  }

  protected async assertBodyContains(
    expectedText: string | RegExp,
    label = 'Page body should contain expected text',
    timeout = 10_000
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('body'), expectedText, label, timeout);
  }

  protected async assertHeadingVisible(
    expectedName?: string | RegExp,
    label = 'Page heading should be visible',
    timeout = 20_000
  ): Promise<void> {
    const heading = expectedName
      ? this.page.getByRole('heading', { level: 1, name: expectedName }).first()
      : this.page.locator('h1').first();

    await this.assertVisible(heading, label, timeout);
  }

  protected async assertHeadingContains(
    expectedText: string | RegExp,
    label = 'Page heading should contain expected text',
    timeout = 20_000
  ): Promise<void> {
    await this.assertTextContains(this.page.locator('h1').first(), expectedText, label, timeout);
  }

  protected async assertAttribute(
    locator: Locator,
    attributeName: string,
    expectedValue: string | RegExp,
    label = `${attributeName} attribute should match expected value`,
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toHaveAttribute(attributeName, expectedValue, { timeout });
    });
  }

  protected async assertCount(
    locator: Locator,
    expectedCount: number,
    label = `Element count should be ${expectedCount}`,
    timeout = 10_000
  ): Promise<void> {
    await test.step(label, async () => {
    await expect(locator, label).toHaveCount(expectedCount, { timeout });
    });
  }

  protected assertTruthy<T>(
    value: T,
    label = 'Expected value should be present'
  ): asserts value is NonNullable<T> {
    expect(value, label).toBeTruthy();
  }

  protected assertGreaterThan(
    actual: number,
    minimum: number,
    label = `Expected value should be greater than ${minimum}`
  ): void {
    expect(actual, label).toBeGreaterThan(minimum);
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
      await acceptBtn.click({ force: true, timeout: 5000 }).catch(() => undefined);
      console.log('Cookie banner accepted');
    }

    const closeBtn = this.page
      .locator('.onetrust-close-btn-handler, #onetrust-close-btn-container button')
      .first();

    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.dispatchEvent('click').catch(async () => {
        await closeBtn.click({ force: true, timeout: 5000 }).catch(() => undefined);
      });
      await this.page.locator('#onetrust-banner-sdk, .ot-sdk-container')
        .first()
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => undefined);
      console.log('Cookie banner closed');
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
  protected formatPrice(price: number): string {
    return `$${price.toLocaleString('en-US')}`;
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

  protected normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[\u2013\u2014]/g, '-') // normalize dash
      .replace(/\s+/g, ' ')
      .replace(/\s*-\s*/g, '-')
      .trim();
  }
  protected formatPriceToUiLabel(price: number): string {
    if (price >= 1000000) {
      return `${price / 1000000}M`;
    } else if (price >= 1000) {
      return `${price / 1000}K`;
    }
    return `${price}`;

  }

}
