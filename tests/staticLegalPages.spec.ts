/**
 * ENV=PROD npx playwright test tests/staticLegalPages.spec.ts --project=Chromium
 * Static legal and policy page validation. These tests never submit forms in PROD.
 */

import { test } from '@playwright/test';
import { STATIC_LEGAL_PAGES, StaticLegalPage } from '../pages/StaticLegalPage';

test.describe('Mattamy Homes - Static Legal and Policy Pages', () => {
  for (const staticPageConfig of STATIC_LEGAL_PAGES) {
    test(`STATICLEGAL-001 | @smoke @regression | ${staticPageConfig.name} page should load with valid static content`, async ({ page }) => {
      const staticLegalPage = new StaticLegalPage(page);

      await test.step(`Navigate to ${staticPageConfig.name}`, async () => {
        await staticLegalPage.navigateToStaticPage(staticPageConfig);
      });

      await test.step('Verify route, title, global header, and footer are present', async () => {
        await staticLegalPage.validatePageShell(staticPageConfig);
      });

      await test.step('Verify expected headings and static body copy', async () => {
        await staticLegalPage.validateStaticContent(staticPageConfig);
      });

      await test.step('Verify required legal, policy, email, and document links', async () => {
        await staticLegalPage.validateRequiredLinks(staticPageConfig);
      });

      // await test.step('Verify page has no forms or submit actions', async () => {
      //   await staticLegalPage.validateNoFormsOrSubmitActions(staticPageConfig);
      // });
    });
  }
});
