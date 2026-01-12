import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Header } from '../pages/Header';
import { Footer } from '../pages/Footer';

test.describe('Mattamy Homes – Canada', () => {

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
    await footer.scrollToFooter();
    await footer.verifyFooterLoaded();
  });
  test('Search market functionality should work', async ({ page }) => {

    const homePage = new HomePage(page);  
    await homePage.navigate();
    await homePage.verifySearchMarket("Calgary");
    
  } );

});
