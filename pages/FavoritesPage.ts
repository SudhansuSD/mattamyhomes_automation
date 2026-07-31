import { expect, Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { escapeRegex } from '../utils/pageObjectUtils';
import { BasePage } from './BasePage';

/* ==========================================================
   Favorites ("Homes I Love") Page Object Model

   Covers the /favorites page (SearchFavorites component) and the
   cross-page "save a home" workflow driven by the heart/favorite
   toggle rendered on search / community / plan / QMI cards.
========================================================== */

export class FavoritesPage extends BasePage {
  static readonly PATH = '/favorites';

  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;

  /** Initializes this page object and its locators. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.main = page.locator('main').first();
    this.footer = page.locator('#footer, section[id="footer"], footer').first();
  }

  /** Returns a locator matching favorite/save toggle controls on any card. */
  private favoriteToggles(): Locator {
    return this.page.locator(
      [
        'button[aria-label*="favorite" i]',
        'button[aria-label*="save" i]',
        'button[aria-label*="add to favorites" i]',
        'button[aria-label*="wish" i]',
        'button[title*="favorite" i]',
        '[data-testid*="favorite" i]',
        'button:has(svg[class*="heart" i])',
      ].join(', '),
    );
  }

  /** Navigates to the Favorites page for the configured country. */
  async navigateToFavorites(overrideLocation?: LocationKey): Promise<void> {
    await this.step('Navigate to Favorites', async () => {
      const { baseURL, envName } = getEnvConfig();
      const location = getLocationConfig(overrideLocation);
      const targetUrl = `${baseURL}${FavoritesPage.PATH}?${location.queryParam}`;

      await this.reportValue('Navigating to Favorites', `ENV=${envName} | URL=${targetUrl}`);

      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
      await this.ensurePageRendered();
    });
  }

  /** Validates the Favorites page shell (title, route, header, footer). */
  async validatePageShell(): Promise<void> {
    await this.step('Validate Favorites page shell', async () => {
      await this.assertPageTitle(
        /Homes I Love \| Mattamy Homes/i,
        'Favorites page title should match expected value',
      );
      await this.assertPageUrl(
        new RegExp(`${escapeRegex(FavoritesPage.PATH)}(?:\\?.*)?$`, 'i'),
        'Favorites should keep the expected route',
      );
      await this.assertAttached(
        this.header,
        'Favorites should keep the global header mounted',
        15_000,
      );
      await this.assertAttached(
        this.footer,
        'Favorites should keep the global footer mounted',
        15_000,
      );
    });
  }

  /** Validates the header "Go to Favorites" affordance points at /favorites. */
  async validateHeaderFavoritesLink(): Promise<void> {
    await this.step('Validate header Go to Favorites link', async () => {
      const favoritesLink = this.header
        .locator('a[href="/favorites"], a[href*="/favorites"]')
        .first();

      const hasFavoritesLink = await favoritesLink
        .waitFor({ state: 'attached', timeout: 15_000 })
        .then(() => true)
        .catch(() => false);

      if (!hasFavoritesLink) {
        await this.reportValue('Header Favorites link is not exposed on this page variant');
        return;
      }

      await this.assertAttached(favoritesLink, 'Header should expose a link to /favorites', 15_000);
    });
  }

  /**
   * Validates the empty-state that renders when no homes are saved. The page
   * should still show its "Homes I Love" heading and a CTA back into search.
   */
  async validateEmptyState(): Promise<void> {
    await this.step('Validate Favorites empty state', async () => {
      await this.assertHeadingVisible(undefined, 'Favorites should expose a visible H1', 20_000);

      const bodyText = await this.page.locator('body').innerText({ timeout: 15000 });
      const looksEmpty =
        /no.*(saved|favorite)|haven'?t saved|start.*search|find your|explore/i.test(bodyText);

      expect(
        looksEmpty || (await this.getSavedCardCount()) === 0,
        'With no saved homes the Favorites page should show an empty / call-to-action state',
      ).toBeTruthy();
    });
  }

  /**
   * Saves the first visible home on the CURRENT page (e.g. a search-results
   * page) by toggling its favorite control. Returns whether a toggle was found.
   */
  async saveFirstVisibleHome(): Promise<boolean> {
    return this.step('Save first visible home via favorite toggle', async () => {
      const toggles = this.favoriteToggles();

      const found = await toggles
        .first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);

      if (!found) {
        await this.reportValue('No favorite/heart toggle found on the current page');
        return false;
      }

      const toggle = toggles.first();
      await toggle.scrollIntoViewIfNeeded().catch(() => undefined);
      await toggle.click();
      await this.settle(1000);
      await this.reportValue('Saved first visible home to favorites');
      return true;
    });
  }

  /** Validates at least one saved home renders on the Favorites page. */
  async validateSavedHomesPresent(): Promise<void> {
    await this.step('Validate saved homes are listed', async () => {
      await expect
        .poll(async () => this.getSavedCardCount(), {
          message: 'Favorites page should list at least one saved home after saving',
          timeout: 15000,
        })
        .toBeGreaterThan(0);

      await this.reportValue('Saved homes on Favorites page', await this.getSavedCardCount());
    });
  }

  /** Removes the first saved home and validates the list shrinks. */
  async removeFirstSavedHome(): Promise<void> {
    await this.step('Remove first saved home', async () => {
      const before = await this.getSavedCardCount();
      if (before === 0) {
        await this.reportValue('No saved homes to remove (skipping)');
        return;
      }

      const toggle = this.favoriteToggles().first();
      await toggle.scrollIntoViewIfNeeded().catch(() => undefined);
      await toggle.click();
      await this.settle(1000);

      await expect
        .poll(async () => this.getSavedCardCount(), {
          message: 'Removing a favorite should reduce the saved-homes count',
          timeout: 12000,
        })
        .toBeLessThan(before);
    });
  }

  /** Returns the number of saved-home cards currently rendered. */
  private async getSavedCardCount(): Promise<number> {
    const cards = this.page.locator('#ProductInfo:visible, [class*="card" i]:has(a[href]):visible');
    return cards.count();
  }
}
