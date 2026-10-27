import { expect, Locator, Page } from '@playwright/test';
import { escapeRegex, getPathnameFromHref } from '../utils/web/pageObjectUtils';

/**
 * The Quick Move-In Homes / Floorplans tabs in a community's Available Homes section.
 *
 * The tabs only exist when the community has both kinds of inventory. A community with no quick
 * move-in homes renders no tabs at all and shows its floorplans directly, so "no tabs" is a valid
 * state with its own expectations rather than a missing feature.
 */
export type HomeTypeTabsDeps = {
  report: (message: string, value?: unknown) => Promise<void>;
  waitForPageReady: () => Promise<void>;
};

export type HomeType = 'qmi' | 'floorplans';

const HOME_TYPES: Record<
  HomeType,
  { label: string; tabName: RegExp; heading: RegExp; liveRegion: RegExp }
> = {
  qmi: {
    label: 'Quick Move-In Homes',
    tabName: /Quick Move-In Homes/i,
    heading: /Quick Move-In Homes ready when you are/i,
    liveRegion: /quick move-in homes/i,
  },
  floorplans: {
    label: 'Floorplans',
    tabName: /Floorplans/i,
    heading: /Explore available floorplans/i,
    liveRegion: /floorplans/i,
  },
};

const TIMEOUT = 15_000;

export class HomeTypeTabs {
  private readonly page: Page;
  private readonly deps: HomeTypeTabsDeps;

  /** Sets up the tab checks for one community page. */
  constructor(page: Page, deps: HomeTypeTabsDeps) {
    this.page = page;
    this.deps = deps;
  }

  /** The Available Homes section that holds the tabs and both listings. */
  private get section(): Locator {
    return this.page.locator('#availablehomes').first();
  }

  /** The Home type radio group. */
  private get tabGroup(): Locator {
    return this.section.getByRole('radiogroup', { name: /^Home type$/i });
  }

  /** The tab for one home type. */
  private tab(type: HomeType): Locator {
    return this.tabGroup.getByRole('radio', { name: HOME_TYPES[type].tabName });
  }

  /**
   * The heading of one home type's listing.
   *
   * Matched by tag and text rather than by role, because role queries skip hidden elements and the
   * inactive tab's heading has to be asserted hidden, not just absent.
   */
  private heading(type: HomeType): Locator {
    return this.section.locator('h2, h3').filter({ hasText: HOME_TYPES[type].heading });
  }

  /** The "Showing X of N ..." live region of one home type's listing. */
  private liveRegion(type: HomeType): Locator {
    return this.section.locator('[aria-live]').filter({ hasText: HOME_TYPES[type].liveRegion });
  }

  /** Brings the section on screen and waits for its listing to render. */
  async waitForRendered(): Promise<void> {
    await expect(this.section, 'Available Homes section should be on the page').toBeAttached({
      timeout: TIMEOUT,
    });
    await this.section.scrollIntoViewIfNeeded();
    await this.deps.waitForPageReady();

    // Every listing renders a "Showing X of N" live region, tabbed or not, so its arrival is the
    // signal that the section has hydrated and the presence of the tabs can be read.
    await expect(
      this.section.locator('[aria-live]').first(),
      'Available Homes section should render its listing',
    ).toBeAttached({ timeout: TIMEOUT });
  }

  /** True when the community shows the Quick Move-In Homes / Floorplans tabs. */
  async hasTabs(): Promise<boolean> {
    await this.waitForRendered();

    return (await this.tabGroup.count()) > 0;
  }

  /** Switches to one home type's tab and checks it is the selected one. */
  async select(type: HomeType): Promise<void> {
    const tab = this.tab(type);

    await expect(tab, `${HOME_TYPES[type].label} tab should be visible`).toBeVisible({
      timeout: TIMEOUT,
    });

    if ((await tab.getAttribute('aria-checked')) !== 'true') {
      await tab.scrollIntoViewIfNeeded();
      await tab.click();
    }

    await expect(tab, `${HOME_TYPES[type].label} tab should be selected`).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(
      this.heading(type).first(),
      `${HOME_TYPES[type].label} listing should show once its tab is selected`,
    ).toBeVisible({ timeout: TIMEOUT });
  }

  /** Shows the floorplans listing, selecting its tab when the community has tabs. */
  async showFloorplans(): Promise<void> {
    if (await this.hasTabs()) {
      await this.select('floorplans');
    }
  }

  /** Shows the quick move-in listing, or returns false when the community has no QMI inventory. */
  async showQuickMoveIns(): Promise<boolean> {
    if (!(await this.hasTabs())) {
      await this.deps.report(
        'Community has no quick move-in inventory - Home type tabs not rendered',
      );
      return false;
    }

    await this.select('qmi');

    return true;
  }

  /** Visible card hrefs of one home type inside the section. */
  async visibleCardHrefs(type: HomeType): Promise<string[]> {
    return this.cardHrefs(type, this.section.locator('a[href]').filter({ visible: true }));
  }

  /** Every card href of one home type inside the section, hidden ones included. */
  private async allCardHrefs(type: HomeType): Promise<string[]> {
    return this.cardHrefs(type, this.section.locator('a[href]'));
  }

  /**
   * Card hrefs of one home type among the given links.
   *
   * Told apart by depth under the community path: a floorplan card sits one segment below it
   * (/community/plan) and a quick move-in card two below (/community/plan/address).
   */
  private async cardHrefs(type: HomeType, links: Locator): Promise<string[]> {
    const communityPath = getPathnameFromHref(this.page.url());
    const depth = type === 'qmi' ? '[^/]+/[^/]+' : '[^/]+';
    const pattern = new RegExp(`^${escapeRegex(communityPath)}/${depth}$`, 'i');
    const hrefs = await links.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href') ?? ''),
    );

    return [
      ...new Set(hrefs.filter((href) => pattern.test(getPathnameFromHref(href, this.page.url())))),
    ];
  }

  /** Reads the inventory count a tab announces in its accessible name. */
  private async tabCount(type: HomeType): Promise<number> {
    const label = (await this.tab(type).getAttribute('aria-label')) ?? '';
    const count = label.match(/(\d+)\s+available/i)?.[1];

    expect(
      count,
      `${HOME_TYPES[type].label} tab should announce its count: "${label}"`,
    ).toBeTruthy();

    return Number(count);
  }

  /** Reads the total a listing's "Showing X of N" live region reports. */
  private async liveRegionTotal(type: HomeType): Promise<number> {
    const text = (await this.liveRegion(type).first().textContent()) ?? '';
    const total = text.match(/of\s+(\d+)/i)?.[1];

    expect(
      total,
      `${HOME_TYPES[type].label} listing should report its total: "${text}"`,
    ).toBeTruthy();

    return Number(total);
  }

  /** Checks the tabs match the inventory: two tabs with QMI homes, none without. */
  async verifyTabsMatchInventory(): Promise<void> {
    if (await this.hasTabs()) {
      await this.verifyTabbedListing();
    } else {
      await this.verifyFloorplansOnlyListing();
    }
  }

  /** Checks both tabs, their counts, and that each shows only its own listing. */
  private async verifyTabbedListing(): Promise<void> {
    await expect(
      this.tabGroup.getByRole('radio'),
      'Home type should offer exactly the Quick Move-In Homes and Floorplans tabs',
    ).toHaveCount(2);
    await expect(
      this.tab('qmi'),
      'Quick Move-In Homes tab should be selected by default',
    ).toHaveAttribute('aria-checked', 'true');

    for (const type of ['floorplans', 'qmi'] as const) {
      const other: HomeType = type === 'qmi' ? 'floorplans' : 'qmi';

      await this.select(type);

      await expect(
        this.tab(other),
        `${HOME_TYPES[other].label} tab should be deselected`,
      ).toHaveAttribute('aria-checked', 'false');
      await expect(
        this.heading(other).first(),
        `${HOME_TYPES[other].label} listing should be hidden while ${HOME_TYPES[type].label} is selected`,
      ).toBeHidden();

      const count = await this.tabCount(type);

      expect(
        count,
        `${HOME_TYPES[type].label} tab should only render with inventory to show`,
      ).toBeGreaterThan(0);
      expect(
        await this.liveRegionTotal(type),
        `${HOME_TYPES[type].label} listing total should match the count on its tab`,
      ).toBe(count);

      await expect
        .poll(async () => (await this.visibleCardHrefs(type)).length, {
          message: `${HOME_TYPES[type].label} tab should show at least one card`,
          timeout: TIMEOUT,
        })
        .toBeGreaterThan(0);
      expect(
        await this.visibleCardHrefs(other),
        `No ${HOME_TYPES[other].label} card should show under the ${HOME_TYPES[type].label} tab`,
      ).toEqual([]);

      await this.deps.report(`${HOME_TYPES[type].label} tab`, `${count} available`);
    }
  }

  /** Checks a community without QMI inventory shows its floorplans directly and nothing else. */
  private async verifyFloorplansOnlyListing(): Promise<void> {
    await this.deps.report(
      'Home type tabs not rendered - community has no quick move-in inventory',
    );

    await expect(
      this.heading('floorplans').first(),
      'Without Home type tabs the floorplans listing should show directly',
    ).toBeVisible({ timeout: TIMEOUT });
    await expect
      .poll(async () => (await this.visibleCardHrefs('floorplans')).length, {
        message: 'Floorplans listing should show at least one card',
        timeout: TIMEOUT,
      })
      .toBeGreaterThan(0);

    // The tabs are missing because there is no QMI inventory - so no part of a QMI listing may be
    // rendered either, hidden or not. Any of these means the tabs failed to render for a community
    // that does have quick move-in homes.
    await expect(
      this.heading('qmi'),
      'No Quick Move-In Homes listing should render without the tabs',
    ).toHaveCount(0);
    await expect(
      this.liveRegion('qmi'),
      'No Quick Move-In Homes count should render without the tabs',
    ).toHaveCount(0);
    expect(
      await this.allCardHrefs('qmi'),
      'No Quick Move-In Homes card should render without the tabs',
    ).toEqual([]);

    await this.deps.report(
      'Floorplans shown directly',
      `${(await this.visibleCardHrefs('floorplans')).length} visible card(s)`,
    );
  }
}
