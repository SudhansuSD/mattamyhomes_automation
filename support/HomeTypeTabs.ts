import { expect, Locator, Page } from '@playwright/test';
import {
  escapeRegex,
  getFooter,
  getPathnameFromHref,
  scrollToUncoveredSpot,
} from '../utils/web/pageObjectUtils';

/** The QMI / Floorplans tabs in Available Homes; they exist only when a community has both kinds. */
export type HomeTypeTabsDeps = {
  report: (message: string, value?: unknown) => Promise<void>;
  waitForPageReady: () => Promise<void>;
};

export type HomeType = 'qmi' | 'floorplans';

/** What Available Homes lists: both kinds behind tabs, floorplans alone, or nothing. */
export type Inventory = 'tabbed' | 'floorplansOnly' | 'none';

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

const NO_INVENTORY_MESSAGE =
  'Community has no quick move-in homes or floorplans - Available Homes section not rendered';

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

  /** One home type's listing heading, matched by tag so a hidden one can still be asserted hidden. */
  private heading(type: HomeType): Locator {
    return this.section.locator('h2, h3').filter({ hasText: HOME_TYPES[type].heading });
  }

  /** The "Showing X of N ..." live region of one home type's listing. */
  private liveRegion(type: HomeType): Locator {
    return this.section.locator('[aria-live]').filter({ hasText: HOME_TYPES[type].liveRegion });
  }

  /** True when the page renders Available Homes; checked after the footer, so absence is final. */
  async hasSection(): Promise<boolean> {
    await expect(
      getFooter(this.page).first(),
      'Community page should render through to its footer',
    ).toBeAttached({ timeout: TIMEOUT });

    return (await this.section.count()) > 0;
  }

  /** Brings the section on screen and waits for its listing to render. */
  private async waitForRendered(): Promise<void> {
    await this.section.scrollIntoViewIfNeeded();
    await this.deps.waitForPageReady();

    // Every listing has a "Showing X of N" live region; its arrival means the section hydrated.
    await expect(
      this.section.locator('[aria-live]').first(),
      'Available Homes section should render its listing',
    ).toBeAttached({ timeout: TIMEOUT });
  }

  /** Reads which listings the community renders once the section has hydrated. */
  async inventory(): Promise<Inventory> {
    if (!(await this.hasSection())) {
      return 'none';
    }

    await this.waitForRendered();

    return (await this.tabGroup.count()) > 0 ? 'tabbed' : 'floorplansOnly';
  }

  /** Switches to one home type's tab and checks it is the selected one. */
  async select(type: HomeType): Promise<void> {
    const tab = this.tab(type);

    await expect(tab, `${HOME_TYPES[type].label} tab should be visible`).toBeVisible({
      timeout: TIMEOUT,
    });

    if ((await tab.getAttribute('aria-checked')) !== 'true') {
      // On a phone the tabs otherwise end up under the pinned banners or sticky bars.
      await scrollToUncoveredSpot(tab);
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

  /** Shows the floorplans listing, or returns false when the community has no inventory. */
  async showFloorplans(): Promise<boolean> {
    const inventory = await this.inventory();

    if (inventory === 'none') {
      await this.deps.report(NO_INVENTORY_MESSAGE);
      return false;
    }

    if (inventory === 'tabbed') {
      await this.select('floorplans');
    }

    return true;
  }

  /** Shows the quick move-in listing, or returns false when the community has no QMI inventory. */
  async showQuickMoveIns(): Promise<boolean> {
    const inventory = await this.inventory();

    if (inventory !== 'tabbed') {
      await this.deps.report(
        inventory === 'none'
          ? NO_INVENTORY_MESSAGE
          : 'Community has no quick move-in inventory - Home type tabs not rendered',
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

  /** Card hrefs of one home type, told apart by path depth (plan = 1 segment, QMI = 2). */
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

  /** Checks the tabs and listings match the community's inventory. */
  async verifyTabsMatchInventory(): Promise<void> {
    const inventory = await this.inventory();

    if (inventory === 'tabbed') {
      await this.verifyTabbedListing();
    } else if (inventory === 'floorplansOnly') {
      await this.verifyFloorplansOnlyListing();
    } else {
      await this.verifyNoInventory();
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

    // Any QMI listing here, even hidden, means the tabs failed to render for a community with QMIs.
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

  /** Checks a community without Available Homes shows no tabs or listing anywhere on the page. */
  async verifyNoInventory(): Promise<void> {
    await this.deps.report(NO_INVENTORY_MESSAGE);

    await expect(
      this.page.getByRole('radiogroup', { name: /^Home type$/i }),
      'No Home type tabs should render without the Available Homes section',
    ).toHaveCount(0);

    for (const type of ['qmi', 'floorplans'] as const) {
      await expect(
        this.page.locator('h2, h3').filter({ hasText: HOME_TYPES[type].heading }),
        `No ${HOME_TYPES[type].label} listing should render without the Available Homes section`,
      ).toHaveCount(0);
    }
  }
}
