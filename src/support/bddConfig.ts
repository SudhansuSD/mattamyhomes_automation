import {
  Before,
  After,
  setWorldConstructor,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { SearchPage } from '../../pages/SearchPage';

export class CustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  homePage!: HomePage;
  searchPage!: SearchPage;
}

setWorldConstructor(CustomWorld);
setDefaultTimeout(60 * 1000);

Before(async function (this: CustomWorld) {
  // 🔹 1. Launch browser (headed mode)
  this.browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized',
      '--no-sandbox'
    ],
    
    // slowMo: 50,      // optional but helps stability
  });

  // 2️⃣ Create browser context  REQUIRED
  this.context = await this.browser.newContext({
    viewport: null,
    locale: 'en-US',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  });

  // 🔹 3. Create page
  this.page = await this.context.newPage();

  // 🔹 4. Bind page objects
  this.homePage = new HomePage(this.page);
  this.searchPage = new SearchPage(this.page);
});

After(async function (this: CustomWorld) {
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});
