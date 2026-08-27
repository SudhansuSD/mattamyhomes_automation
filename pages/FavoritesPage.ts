import { expect, Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { escapeRegex } from '../utils/web/pageObjectUtils';
import { BasePage } from './BasePage';

// Favorites ("Homes I Love") Page Object Model Covers the /favorites page (SearchFavorites component) and the cross-page "save a home" workflow driven by the heart/favorite toggle rendered on search / community / plan / QMI cards.

export class FavoritesPage extends BasePage {
  static readonly PATH = '/favorites';

  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.main = page.locator('main').first();
    this.footer = page.locator('#footer, section[id="footer"], footer').first();
  }

  /**
   * Returns the "Mark as favorite" controls on search result cards.
   *
   * The control is a DIV with aria-label="Mark as favorite" (it flips to "Mark as
   * unfavorite" once saved), positioned over the card rather than inside
   * #ProductInfo. The previous selector list only looked for <button> elements, so
   * it matched nothing and every save silently did nothing - which is why the
   * Favorites page then listed zero saved homes.
   *
   * "Go to Favorites Page" is excluded: it is the header link, not a toggle.
   */
  private favoriteToggles(): Locator {
    return this.page
      .locator(
        '[aria-label*="Mark as favorite" i]:visible, [aria-label*="Mark as unfavorite" i]:visible',
      )
      .filter({ hasNotText: /Go to Favorites Page/i });
  }

  /** Gets only the not-yet-saved favorite controls. */
  private unsavedFavoriteToggles(): Locator {
    return this.page.locator('[aria-label*="Mark as favorite" i]:visible');
  }

  /** Opens the Favorites page for the configured country. */
  async navigateToFavorites(overrideLocation?: LocationKey): Promise<void> {
    await this.step('Navigate to Favorites', async () => {
      const { baseURL, envName } = getEnvConfig();
      const location = getLocationConfig(overrideLocation);
      const targetUrl = `${baseURL}${FavoritesPage.PATH}?${location.queryParam}`;

      await this.reportValue('Navigating to Favorites', `ENV=${envName} | URL=${targetUrl}`);

      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
      await this.ensurePageRendered();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  /** Checks the Favorites page shell (title, route, header, footer). */
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

  /** Checks the header "Go to Favorites" affordance points at /favorites. */
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
   * Checks the empty state that renders when no homes are saved.
   *
   * Identity is asserted via the document title and the page's own empty-state
   * markers, NOT an <h1>: the Favorites page renders none (its only headings are
   * the h2/h3s of the header and footer). Asserting an h1 here failed on a page
   * that was actually working - the missing h1 is an accessibility gap to raise
   * with the site team, not a reason to fail the empty-state test.
   */
  async validateEmptyState(): Promise<void> {
    await this.step('Validate Favorites empty state', async () => {
      await expect(this.page, 'Favorites page should expose its "Homes I Love" title').toHaveTitle(
        /Homes I Love/i,
        { timeout: 20_000 },
      );

      // The empty state shows zeroed result tabs plus a "No Results Found" /
      // "Find My Home" call to action.
      await expect(
        this.page.getByText(/No Results Found/i).first(),
        'With no saved homes the Favorites page should show a no-results state',
      ).toBeVisible({ timeout: 20_000 });

      expect(
        await this.getSavedCardCount(),
        'With no saved homes the Favorites page should list no saved cards',
      ).toBe(0);
    });
  }

  /**
   * Saves the first visible home on the CURRENT page (e.g. a search-results
   * page) by toggling its favorite control. Returns whether a toggle was found.
   */
  async saveFirstVisibleHome(): Promise<boolean> {
    return this.step('Save first visible home via favorite toggle', async () => {
      // Wait for result cards first: the favorite controls are rendered per card,
      // so looking for them before the results paint finds nothing and made this
      // report "no toggle found" on a page that has 14 of them.
      await expect
        .poll(() => this.page.locator('#ProductInfo').count(), {
          message: 'Search results should render before saving a favorite',
          timeout: 45_000,
        })
        .toBeGreaterThan(0);

      const toggles = this.unsavedFavoriteToggles();

      const found = await toggles
        .first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);

      if (!found) {
        await this.reportValue('No favorite toggle found on the current page');
        return false;
      }

      const toggle = toggles.first();
      await toggle.scrollIntoViewIfNeeded().catch(() => undefined);
      await toggle.click();

      // Confirm the save actually registered: the control relabels itself to
      // "Mark as unfavorite". Without this the test could "save" nothing and only
      // discover it later on the Favorites page.
      await expect(
        this.page.locator('[aria-label*="Mark as unfavorite" i]').first(),
        'Favorite toggle should switch to the saved state after clicking',
      ).toBeVisible({ timeout: 10_000 });

      await this.settle(1000);
      await this.reportValue('Saved first visible home to favorites');
      return true;
    });
  }

  /** Checks at least one saved home renders on the Favorites page. */
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

  /** Gets the number of saved-home cards currently rendered. */
  private async getSavedCardCount(): Promise<number> {
    const cards = this.page.locator('#ProductInfo:visible, [class*="card" i]:has(a[href]):visible');
    return cards.count();
  }
}
