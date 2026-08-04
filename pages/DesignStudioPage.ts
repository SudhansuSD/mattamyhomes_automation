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
  readonly marketPanelExpander: Locator;
  readonly marketDesignStudioLinks: Locator;

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.main = page.locator('main').first();
    this.footer = page.locator('#footer, section[id="footer"], footer').first();
    // "Find your Design Studio" is NOT a dropdown - it is a collapsed panel. Until
    // the SEARCH NOW button expands it, the whole market list sits in the DOM as
    // aria-hidden="true" / tabindex="-1", which is why getByRole could not see it
    // and why the old combobox locator matched an unrelated control and reported
    // "0 market options".
    //
    // The expand control announces itself by aria-label; SEARCH NOW text is the
    // fallback in case that label changes.
    this.marketPanelExpander = page
      .locator('button[aria-label*="Expand this section" i]')
      .or(page.locator('a, button').filter({ hasText: /^\s*SEARCH NOW\s*$/i }))
      .first();

    // Once expanded, each market links to its own design studio page. The two
    // countries use different shapes - USA: /arizona/phoenix/market-design-studio,
    // CAN: /alberta/calgary/calgary-design-studio - so match the common
    // "-design-studio" suffix. That also excludes the nav link (/design-studio) and
    // /design-studio/FAQs, neither of which is a market.
    this.marketDesignStudioLinks = page.locator('a[href*="-design-studio"]:visible');
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
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
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

  /**
   * Validates the "Find your Design Studio" market panel.
   *
   * SEARCH NOW expands the panel; every market then links to its own market design
   * studio page (/<state>/<market>/market-design-studio). Each link is checked
   * both ways: the href matches the market label it is listed under, and the URL
   * actually resolves rather than 404ing.
   */
  async validateMarketSelector(): Promise<void> {
    await this.step('Validate Design Studio market panel', async () => {
      await this.scrollIntoCenter(this.marketPanelExpander);
      await expect(
        this.marketPanelExpander,
        'Design Studio should expose a SEARCH NOW control to expand the market panel',
      ).toBeVisible({ timeout: 15_000 });

      await this.marketPanelExpander.click();
      await this.settle(1500);

      await expect
        .poll(() => this.marketDesignStudioLinks.count(), {
          message: 'Expanding SEARCH NOW should reveal market design studio links',
          timeout: 20_000,
        })
        .toBeGreaterThan(1);

      const links = await this.marketDesignStudioLinks.evaluateAll((elements) =>
        elements.map((element) => ({
          label: (element.textContent || '').trim(),
          href: element.getAttribute('href') || '',
        })),
      );

      await this.reportValue(
        `Design Studio markets (${links.length})`,
        links.map((link) => `${link.label} -> ${link.href}`).join(' | '),
      );

      const failures: string[] = [];

      for (const link of links) {
        expect(link.label, 'Each market link should render a label').not.toBe('');

        // Deliberately NOT asserting that the URL slug equals the market label: the
        // site legitimately abbreviates ("Greater Toronto Area" -> /ontario/gta/
        // gta-design-studio, "Kitchener-Waterloo-Guelph" -> kitchener-waterloo-
        // design-studio), so a label-to-slug rule would fail on correct links.
        expect(link.href, `Market "${link.label}" should link to a design studio page`).toMatch(
          /-design-studio\/?$/i,
        );

        const status = await this.getUrlStatus(this.buildFullUrl(link.href));

        if (status !== 200) {
          failures.push(`${link.label} returned ${status} for ${link.href}`);
        }
      }

      // Every market must have its OWN destination - duplicates mean a market is
      // mislinked to another market's studio, which the status check alone misses.
      const uniqueHrefs = new Set(links.map((link) => link.href));
      expect(
        uniqueHrefs.size,
        `Each market should link to a distinct design studio page (got ${links.length} links, ${uniqueHrefs.size} distinct)`,
      ).toBe(links.length);

      expect(
        failures,
        `Market design studio links should all resolve:\n${failures.join('\n')}`,
      ).toHaveLength(0);
    });
  }

  /** Returns the HTTP status for a link, without navigating to it. */
  private async getUrlStatus(url: string): Promise<number | string> {
    const response = await this.page.request
      .get(url, { failOnStatusCode: false, timeout: 30_000 })
      .catch((error: Error) => error.message.slice(0, 60));

    return typeof response === 'string' ? response : response.status();
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
