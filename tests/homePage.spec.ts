import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Header } from '../pages/Header';
import { Footer } from '../pages/Footer';
import { CountryCode } from '../utils/country';
const countries: CountryCode[] = ['CAN', 'USA'];

countries.forEach((country) =>{
test.describe(`Mattamy Homes – ${country}`, () => {

  test('Home page should load correctly', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigate(country);
    await homePage.verifyPageLoaded();
  });

  test('Header navigation should be visible', async ({ page }) => {
    const homePage = new HomePage(page);
    const header = new Header(page);

    await homePage.navigate(country);
    await header.verifyHeaderLinksVisible();
  });

  test('Footer should be visible with Privacy Policy link', async ({ page }) => {
    const homePage = new HomePage(page);
    const footer = new Footer(page);

    await homePage.navigate(country);
    await footer.verifyFooterLoaded();
  });
  test('Search market functionality should work', async ({ page }) => {

    const homePage = new HomePage(page);
    await homePage.navigate(country);
    await homePage.searchByMarket(country === 'CAN' ? 'Calgary' : 'Phoenix');
    await homePage.verifySearchByMarket();

  });
  test('Search by community functionality should work', async ({ page }) => {

    const homePage = new HomePage(page);
    await homePage.navigate(country);
    await homePage.searchByCommunity(country === 'CAN' ? 'Yorkville' : 'Blackhawk');
    await homePage.verifySearchByCommunity();
  });

}); 
});