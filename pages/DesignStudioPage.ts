import { expect, Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { escapeRegex } from '../utils/pageObjectUtils';
import { BasePage } from './BasePage';

/* ==========================================================
   Design Studio Page Object Model

   Covers the /design-studio marketing page (ContentHero,
   ProductOverview, Market Selector and TitleCTA components).
========================================================== */

export class DesignStudioPage extends BasePage {
  static readonly PATH = '/design-studio';

  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;
  readonly marketSelector: Locator;

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.main = page.locator('main').first();
    this.footer = page.locator('#footer, section[id="footer"], footer').first();
    // Market Selector renders as a labelled combobox / dropdown control.
    this.marketSelector = page
      .locator(
        [
          'select',
          '[role="combobox"]',
          'button[aria-haspopup="listbox"]',
          'button[aria-label*="market" i]',
          '[aria-label*="select a market" i]',
        ].join(', '),
      )
      .first();
  }

  /** Navigates to the Design Studio page for the configured country. */
  async navigateToDesignStudio(overrideLocation?: LocationKey): Promise<void> {
    await this.step('Navigate to Design Studio', async () => {
      const { baseURL, envName } = getEnvConfig();
      const location = getLocationConfig(overrideLocation);
      const targetUrl = `${baseURL}${DesignStudioPage.PATH}?${location.queryParam}`;

      await this.reportValue('Navigating to Design Studio', `ENV=${envName} | URL=${targetUrl}`);

      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
      await this.ensurePageRendered();
    });
  }

  /** Validates the page shell (title, route, header, main and footer). */
  async validatePageShell(): Promise<void> {
    await this.step('Validate Design Studio page shell', async () => {
      await this.assertPageTitle(
        /Design Studio.*\| Mattamy Homes/i,
        'Design Studio title should match expected value',
      );
      await this.assertPageUrl(
        new RegExp(`${escapeRegex(DesignStudioPage.PATH)}(?:\\?.*)?$`, 'i'),
        'Design Studio should keep the expected route',
      );
      await this.assertAttached(
        this.header,
        'Design Studio should keep the global header mounted',
        15_000,
      );
      await this.assertAttached(
        this.main,
        'Design Studio should render a main content area',
        15_000,
      );
      await this.assertAttached(
        this.footer,
        'Design Studio should keep the global footer mounted',
        15_000,
      );
    });
  }

  /** Validates the hero and product-overview content renders meaningfully. */
  async validateContent(): Promise<void> {
    await this.step('Validate Design Studio content', async () => {
      await this.assertHeadingVisible(
        undefined,
        'Design Studio should expose a visible H1',
        20_000,
      );

      await expect
        .poll(async () => this.getMainTextLength(), {
          message: 'Design Studio should render meaningful visible content',
          timeout: 20000,
        })
        .toBeGreaterThan(120);

      await this.reportValue('Design Studio content length', await this.getMainTextLength());
    });
  }

  /** Validates the Market Selector is present and offers selectable options. */
  async validateMarketSelector(): Promise<void> {
    await this.step('Validate Design Studio Market Selector', async () => {
      await this.marketSelector.scrollIntoViewIfNeeded().catch(() => undefined);
      await this.assertVisible(
        this.marketSelector,
        'Design Studio should expose a Market Selector control',
        15_000,
      );

      const tagName = await this.marketSelector.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === 'select') {
        const optionCount = await this.marketSelector.locator('option').count();
        expect(
          optionCount,
          'Market Selector should offer selectable market options',
        ).toBeGreaterThan(1);
        return;
      }

      // Custom dropdown: open it and confirm a list of options renders.
      await this.marketSelector.click();
      await this.settle(1000);

      const options = this.page.locator(
        '[role="option"]:visible, [role="listbox"] a:visible, [role="menu"] button:visible',
      );
      await expect
        .poll(async () => options.count(), {
          message: 'Opening the Market Selector should reveal market options',
          timeout: 10000,
        })
        .toBeGreaterThan(0);
    });
  }

  /** Validates the primary Title CTA links to a real destination. */
  async validateTitleCta(): Promise<void> {
    await this.step('Validate Design Studio Title CTA', async () => {
      const cta = this.main
        .locator('a[href]:visible, button:visible')
        .filter({ hasText: /find|explore|search|get started|learn more|find your/i })
        .first();

      if (!(await cta.isVisible({ timeout: 5000 }).catch(() => false))) {
        await this.reportValue('No Title CTA found on Design Studio (skipping)');
        return;
      }

      await this.assertVisible(cta, 'Design Studio Title CTA should be visible');

      const href = await cta.getAttribute('href');
      if (href) {
        expect(href, 'Design Studio Title CTA should link to a site path or absolute URL').toMatch(
          /^(\/|https?:\/\/)/i,
        );
        await this.reportValue('Design Studio Title CTA', this.buildFullUrl(href));
      }
    });
  }

  /** Returns the normalized length of the main content text. */
  private async getMainTextLength(): Promise<number> {
    return this.main.evaluate(
      (main) => (main.textContent || '').replace(/\s+/g, ' ').trim().length,
    );
  }
}
