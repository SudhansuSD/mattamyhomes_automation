import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { MarketPage } from '../pages/MarketPage';




const location = getLocationConfig();


test.describe(`Market page tests - ${location.country}`, () => {

    test(`Validating ${location.country} markets: `, async ({ page }) => {

        const marketPage = new MarketPage(page);
        for (const market of location.markets) {
            await marketPage.navigateToMarket(market.url);
            await marketPage.verifyMarketPage(market);
        }
    });
    location.markets.forEach((market) => {

        test(`Validate market page: ${market.name}`, async ({ page }) => {

            const marketPage = new MarketPage(page);

            await marketPage.navigateToMarket(market.url);
            await marketPage.validateCommunityCards();

        });
        test(`Validate lead form on market page: ${market.name}`, async ({ page }) => {

            const marketPage = new MarketPage(page);
            await marketPage.navigateToMarket(market.url);
            await marketPage.validateLeadForm(market.name);

        });
    });
});