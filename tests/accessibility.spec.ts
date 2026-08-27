/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/accessibility.spec.ts --project=Chrome
 *
 * WCAG 2.1 A/AA scan of every page template.
 *
 * One test per template so a contrast bug on one page does not hide a missing
 * label on another.
 */

import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { BasePage } from '../pages/BasePage';
import { annotate, Severity } from '../utils/reporting/allureMeta';
import { expectNoAccessibilityViolations } from '../utils/web/accessibility';

const location = getLocationConfig();
const { baseURL } = getEnvConfig();

const configuredMarket =
  location.markets.find((market) =>
    market.name
      .split('||')
      .map((name) => name.trim())
      .includes(location.market),
  ) ?? location.markets[0];

const mpc = 'mpc' in location ? location.mpc?.[0] : undefined;
const condoCommunity = 'condoPlan' in location ? location.condoPlan : undefined;

type Template = {
  name: string;
  path: string;
};

const TEMPLATES: Template[] = [
  { name: 'Home page', path: '/' },
  { name: 'Market page', path: configuredMarket.url },
  { name: 'Community page', path: location.communityPath },
  { name: 'Plan detail page', path: location.expectedPlanPath },
  { name: 'QMI detail page', path: location.qmiPath },
  { name: 'About Us page', path: location.aboutUsLinks[0].url },
  ...(mpc ? [{ name: 'MPC page', path: mpc.url }] : []),
  ...(condoCommunity ? [{ name: 'Condo plan page', path: condoCommunity.url }] : []),
];

test.describe(`Accessibility - ${location.country}`, () => {
  for (const template of TEMPLATES) {
    test(`@a11y @regression | ${location.country} | ${template.name} has no serious WCAG violations`, async ({
      page,
    }) => {
      await annotate({
        location: location.country,
        feature: 'Accessibility',
        owner: 'QA Automation',
        severity: Severity.CRITICAL,
        tags: ['a11y', 'regression'],
      });

      const basePage = new BasePage(page);
      const targetUrl = `${baseURL}${template.path.startsWith('/') ? '' : '/'}${template.path}?${location.queryParam}`;

      await test.step(`Open ${template.name}`, async () => {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await basePage.acceptCookiesIfPresent();
        await basePage.waitForPageReady();
        // Scan the page, not the overlays that sit on top of it.
        await basePage.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
      });

      await expectNoAccessibilityViolations(page, template.name);
    });
  }
});
