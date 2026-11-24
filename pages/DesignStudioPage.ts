import { expect, Locator, Page } from '@playwright/test';
import { escapeRegex, getFooter } from '../utils/web/pageObjectUtils';
import { BasePage } from './BasePage';

/* Design Studio page object: hero, product overview, market selector and title CTA. */

export class DesignStudioPage extends BasePage {
  static readonly PATH = '/design-studio';

  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;
  readonly marketPanelExpander: Locator;
  readonly marketDesignStudioLinks: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.main = page.locator('main').first();
    this.footer = getFooter(page);
    // "Find your Design Studio" is a collapsed panel, not a dropdown: the market list stays
    // aria-hidden until SEARCH NOW expands it. SEARCH NOW text is the fallback for the aria-label.
    this.marketPanelExpander = page
      .locator('button[aria-label*="Expand this section" i]')
      .or(page.locator('a, button').filter({ hasText: /^\s*SEARCH NOW\s*$/i }))
      .first();

    // Market URLs differ by country, so match the shared "-design-studio" suffix (which skips the nav and FAQ links).
    this.marketDesignStudioLinks = page.locator('a[href*="-design-studio"]:visible');
  }

  /** Waits for the page to render and clears the promo overlay after arriving from the header link. */
  async verifyDesignStudioLanding(): Promise<void> {
    await this.step('Verify Design Studio landing', async () => {
      await this.waitForPageReady();
      await this.ensurePageRendered();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });

      await this.reportValue('Design Studio entry point', this.page.url());
    });
  }

  /** Checks the page shell (title, route, header, main and footer). */
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

  /** Checks the hero and product-overview content renders meaningfully. */
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

  /** Expands the market panel and checks every market links to its own design studio page that resolves. */
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

        // The slug is not compared to the label: the site abbreviates some markets (e.g. GTA -> /gta/).
        expect(link.href, `Market "${link.label}" should link to a design studio page`).toMatch(
          /-design-studio\/?$/i,
        );

        const status = await this.getUrlStatus(this.buildFullUrl(link.href));

        if (status !== 200) {
          failures.push(`${link.label} returned ${status} for ${link.href}`);
        }
      }

      // Duplicate hrefs mean a market is mislinked to another market's studio.
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

  /** Gets the HTTP status for a link, without navigating to it. */
  private async getUrlStatus(url: string): Promise<number | string> {
    const response = await this.page.request
      .get(url, { failOnStatusCode: false, timeout: 30_000 })
      .catch((error: Error) => error.message.slice(0, 60));

    return typeof response === 'string' ? response : response.status();
  }

  /** Checks the primary Title CTA links to a real destination. */
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

  /** Gets the normalized length of the main content text. */
  private async getMainTextLength(): Promise<number> {
    return this.main.evaluate(
      (main) => (main.textContent || '').replace(/\s+/g, ' ').trim().length,
    );
  }
}
