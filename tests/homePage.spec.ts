import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Header } from '../pages/Header';
import { Footer } from '../pages/Footer';
import { QMIPage } from '../pages/QMIPage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

test.describe(`Mattamy Homes - ${location.country}`, () => {

  test('Home page should load correctly', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigate();
    await homePage.verifyPageLoaded();
  });

  test('Header navigation should be visible', async ({ page }) => {
    const homePage = new HomePage(page);
    const header = new Header(page);

    await homePage.navigate();
    await header.verifyHeaderLinksVisible();
  });

  test('Footer should be visible with Privacy Policy link', async ({ page }) => {
    const homePage = new HomePage(page);
    const footer = new Footer(page);

    await homePage.navigate();
    await footer.verifyFooterLoaded();
  });

  test('Search market functionality should work', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigate();
    await homePage.searchByMarket(location.market);
    await homePage.verifySearchByMarket();
  });

  test('Search by community functionality should work', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigate();
    await homePage.searchByCommunity(location.community);
    await homePage.verifySearchByCommunity();
  });

  test('Search by QMI home functionality should work', async ({ page }) => {
    const qmiPage = new QMIPage(page);

    await qmiPage.navigate();
    await qmiPage.searchByQMI(location.qmiAddress);
    await qmiPage.verifySearchByQMI();
  });

});
