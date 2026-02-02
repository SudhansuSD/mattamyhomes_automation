// import { Page } from '@playwright/test';
// import { getEnvConfig } from '../config/testConfig';
// import { CountryCode } from '../utils/country';

// export class BasePage {
//   constructor(protected page: Page) {}

//   async navigate(country: CountryCode): Promise<void> {
//     const { baseURL, envName } = getEnvConfig();
//     const url = `${baseURL}/?country=${country}`;

//     console.log(
//       `[NAVIGATE] ENV=${envName} | COUNTRY=${country} | URL=${url}`
//     );

//     // 🔁 Avoid redundant navigation
//     try {
//       const currentUrl = this.page.url();
//       if (currentUrl && currentUrl.includes(`country=${country}`)) {
//         console.log('[NAVIGATE] Already on correct country page. Skipping.');
//         return;
//       }
//     } catch {
//       // Ignore if page not initialized yet
//     }

//     // 🌐 Navigate
//     await this.page.goto(url, {
//       waitUntil: 'domcontentloaded',
//       timeout: 90_000
//     });

//     // ✅ Application readiness (not just page load)
//     await Promise.all([
//       this.page.waitForSelector('header', { timeout: 90_000 }),
//       this.page.waitForLoadState('networkidle', { timeout: 90_000 })
//     ]);
//   }
// }
import { Page } from '@playwright/test';
import { getEnvConfig } from '../config/testConfig';
import { getLocationConfig, LocationKey } from '../config/locations';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(overrideLocation?: LocationKey): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(overrideLocation);

    const url = `${baseURL}/?${location.queryParam}`;

    console.log(
      `[NAVIGATE] ENV=${envName} | COUNTRY=${location.country} | URL=${url}`
    );

    // 🔁 Avoid redundant navigation
    try {
      const currentUrl = this.page.url();
      if (currentUrl && currentUrl.includes(location.queryParam)) {
        console.log('[NAVIGATE] Already on correct country page. Skipping.');
        return;
      }
    } catch {
      // ignore
    }

    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    // await Promise.all([
    //   this.page.waitForSelector('header', { timeout: 90_000 }),
    //   this.page.waitForLoadState('networkidle', { timeout: 90_000 })
    // ]);
  }
}
