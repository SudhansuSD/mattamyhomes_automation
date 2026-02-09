import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    readonly heroSection: Locator;
    readonly header: Locator;

    constructor(page: Page) {
        super(page);
        this.heroSection = page.locator('section').first();
        this.header = page.locator('header');
    }

    async verifyPageLoaded() {
        // Business-ready signal (not full load)
        await this.heroSection.waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.page).toHaveTitle(/Mattamy Homes/i);

        try {
            await expect(this.header).toBeVisible({ timeout: 30000 });
        } catch {
            console.warn('Header not visible within 30s — continuing');
        }
    }

    // -----------------------------
    // Market Search
    // -----------------------------
    async searchByMarket(market: string) {
        const searchBox = this.page.getByPlaceholder(/Search by City/i);

        await searchBox.click();
        await searchBox.fill(''); // reset
        await searchBox.pressSequentially(market, { delay: 500 });


        let searchedMarket: Locator;

        if (market === 'Calgary') {
            searchedMarket = this.page.getByText('Calgary, AB');
        } else if (market === 'GTA') {
            searchedMarket = this.page.getByText('GTA, ON');
        } else {
            searchedMarket = this.page.getByText('Phoenix, AZ');
        }

        await expect(searchedMarket.first()).toBeVisible({ timeout: 15000 });

        // 🔑 KEY FIX → stop Playwright waiting for navigation
        await searchedMarket.first().click({ noWaitAfter: true });

        // ✅ Wait for SPA routing signal
        await this.page.waitForURL(
            url => url.toString().includes('metro='),
            { timeout: 20000 }
        );
    }

    async verifySearchByMarket() {
        const url = new URL(this.page.url());
        if (this.page.url().includes('country=CAN')) {
            expect(url.searchParams.get('metro')).toMatch(/Calgary|GTA/i);
        } else {
            expect(url.searchParams.get('metro')).toMatch(/Phoenix/i);
        }
    }

    // -----------------------------
    // Community Search
    // -----------------------------
    async searchByCommunity(community: string) {

        const searchBox = this.page.getByPlaceholder(/Search by City/i);
        let searchedCommunity: Locator;
        await searchBox.click();
        await searchBox.fill('');
        await searchBox.pressSequentially(community, { delay: 500 });

        if (community === 'Yorkville') {
            searchedCommunity = this.page.getByText(/Yorkville/i);
        } else if (community === 'Blackhawk') {
            searchedCommunity = this.page.getByText(/Blackhawk/i);
        } else {
            throw new Error(`Unknown community: ${community}`);
        }

        await expect(searchedCommunity.first()).toBeVisible({ timeout: 15000 });

        // 🔑 Same fix here
        await searchedCommunity.first().click({ noWaitAfter: true });
    }

    async verifySearchByCommunity() {
        const heading = this.page.locator('h1');

        // Ensure page content is ready
        await expect(heading).toBeVisible({ timeout: 20000 });

        const countryContainer = this.page.locator('#countryContainer');
        await expect(countryContainer).toBeVisible({ timeout: 10000 });

        const countryText = (await countryContainer.textContent())?.toUpperCase() || '';

        if (countryText.includes('CANADA')) {
            await expect(heading).toContainText(/Yorkville/i);
        } else if (countryText.includes('USA')) {
            await expect(heading).toContainText(/Blackhawk/i);
        } else {
            throw new Error(`Unknown country detected: ${countryText}`);
        }
    }
    async searchByQMI(qmiHome: string) {
        const searchBox = this.page.getByPlaceholder(/Search by City/i);
        await searchBox.click();
        await searchBox.fill('');
        await searchBox.pressSequentially(qmiHome, { delay: 500 });

        let searchedQMI: Locator;
        if (qmiHome === '1230 148 Avenue') {
            searchedQMI = this.page.getByText(/1230 148 Avenue/i);
        } else if (qmiHome === '123 Appalachian') {
            searchedQMI = this.page.getByText(/123 Appalachian/i);
        } else {
            throw new Error(`Unknown QMI Home: ${qmiHome}`);
        }
        await expect(searchedQMI.first()).toBeVisible({ timeout: 15000 });

        // 🔑 Same fix here
        await searchedQMI.first().click({ noWaitAfter: true });
    }
}

// import { Page, Locator, expect } from '@playwright/test';
// import { BasePage } from './BasePage';

// export class HomePage extends BasePage {
//   readonly heroSection: Locator;
//   readonly header: Locator;
//   readonly searchBox: Locator;

//   constructor(page: Page) {
//     super(page);
//     this.heroSection = page.locator('section').first();
//     this.header = page.locator('header');
//     this.searchBox = page.getByPlaceholder(/search by city/i);
//   }

//   // ----------------------------------
//   // Page Load
//   // ----------------------------------
//   async verifyPageLoaded() {
//     // DOM-level readiness (not animation dependent)
//     await expect.poll(
//       async () => await this.heroSection.count(),
//       { timeout: 30000 }
//     ).toBeGreaterThan(0);

//     await expect(this.page).toHaveTitle(/mattamy homes/i);
//   }

//   // ----------------------------------
//   // Market Search
//   // ----------------------------------
//   async searchByMarket(market: string) {
//     await this.typeIntoSearch(market);

//     const searchedMarket = this.getMarketLocator(market);

//     await expect.poll(
//       async () => await searchedMarket.count(),
//       { timeout: 20000 }
//     ).toBeGreaterThan(0);

//     await searchedMarket.first().click({ noWaitAfter: true });

//     // SPA-safe signal (query param only)
//     await this.page.waitForFunction(
//       () => window.location.search.includes('metro='),
//       { timeout: 20000 }
//     );
//   }

//   async verifySearchByMarket() {
//     const params = new URL(this.page.url()).searchParams;

//     if (params.get('country') === 'CAN') {
//       expect(params.get('metro')).toMatch(/calgary|gta/i);
//     } else {
//       expect(params.get('metro')).toMatch(/phoenix/i);
//     }
//   }

//   // ----------------------------------
//   // Community Search
//   // ----------------------------------
//   async searchByCommunity(community: string) {
//     await this.typeIntoSearch(community);

//     const searchedCommunity = this.getCommunityLocator(community);

//     await expect.poll(
//       async () => await searchedCommunity.count(),
//       { timeout: 20000 }
//     ).toBeGreaterThan(0);

//     await searchedCommunity.first().click({ noWaitAfter: true });
//   }

//   async verifySearchByCommunity() {
//     const heading = this.page.locator('h1');

//     await expect.poll(
//       async () => await heading.count(),
//       { timeout: 20000 }
//     ).toBeGreaterThan(0);

//     const countryContainer = this.page.locator('#countryContainer');

//     await expect.poll(
//       async () => await countryContainer.count(),
//       { timeout: 10000 }
//     ).toBeGreaterThan(0);

//     const countryText = (await countryContainer.textContent() || '').toUpperCase();

//     if (countryText.includes('CAN')) {
//       await expect(heading).toContainText(/yorkville/i);
//     } else if (countryText.includes('USA')) {
//       await expect(heading).toContainText(/blackhawk/i);
//     } else {
//       throw new Error(`Unknown country detected: ${countryText}`);
//     }
//   }

//   // ----------------------------------
//   // QMI Search
//   // ----------------------------------
//   async searchByQMI(qmiHome: string) {
//     await this.typeIntoSearch(qmiHome);

//     const searchedQMI = this.getQmiLocator(qmiHome);

//     await expect.poll(
//       async () => await searchedQMI.count(),
//       { timeout: 20000 }
//     ).toBeGreaterThan(0);

//     await searchedQMI.first().click({ noWaitAfter: true });
//   }

//   // ----------------------------------
//   // 🔧 Private helpers (KEY TO STABILITY)
//   // ----------------------------------
//   private async typeIntoSearch(value: string) {
//     await this.searchBox.click();
//     await this.searchBox.fill('');
//     await this.searchBox.type(value, { delay: 150 });
//   }

//   private getMarketLocator(market: string): Locator {
//     switch (market.toLowerCase()) {
//       case 'calgary':
//         return this.page.getByText(/calgary/i);
//       case 'gta':
//         return this.page.getByText(/gta/i);
//       case 'phoenix':
//         return this.page.getByText(/phoenix/i);
//       default:
//         throw new Error(`Unknown market: ${market}`);
//     }
//   }

//   private getCommunityLocator(community: string): Locator {
//     switch (community.toLowerCase()) {
//       case 'yorkville':
//         return this.page.getByText(/yorkville/i);
//       case 'blackhawk':
//         return this.page.getByText(/blackhawk/i);
//       default:
//         throw new Error(`Unknown community: ${community}`);
//     }
//   }

//   private getQmiLocator(qmiHome: string): Locator {
//     if (/1230 148/i.test(qmiHome)) {
//       return this.page.getByText(/1230 148/i);
//     }
//     if (/123 appalachian/i.test(qmiHome)) {
//       return this.page.getByText(/123 appalachian/i);
//     }
//     throw new Error(`Unknown QMI Home: ${qmiHome}`);
//   }
// }
