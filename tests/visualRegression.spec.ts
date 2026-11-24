// Screenshot baselines per page template; refresh with --update-snapshots after an intended redesign.
// Dynamic content is masked rather than absorbed by a loose pixel threshold that would hide real breaks.

import { expect, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { BasePage } from '../pages/BasePage';
import { annotate, Severity } from '../utils/reporting/allureMeta';
import { getFooter } from '../utils/web/pageObjectUtils';

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

type Template = { name: string; slug: string; path: string };

const TEMPLATES: Template[] = [
  { name: 'Home page', slug: 'home', path: location.homeURL },
  { name: 'Market page', slug: 'market', path: configuredMarket.url },
  { name: 'Community page', slug: 'community', path: location.communityPath },
  { name: 'Plan detail page', slug: 'plan', path: location.expectedPlanPath },
  { name: 'QMI detail page', slug: 'qmi', path: location.qmiPath },
  { name: 'About Us page', slug: 'about', path: location.aboutUsLinks[0].url },
  ...(mpc ? [{ name: 'MPC page', slug: 'mpc', path: mpc.url }] : []),
];

/** Regions that change between runs; kept narrow so masks do not hide the layout. */
const DYNAMIC_SELECTORS = [
  // Volatile text.
  '[class*="price" i]',
  '[class*="availab" i]',
  '[class*="quick-move" i] [class*="count" i]',
  // Auto-rotating market-card rail; pinning it to one slide blanks it, so mask it.
  '#cards',
];

/** Fixed-position chat overlays, hidden rather than masked because their size varies per run. */
const THIRD_PARTY_OVERLAY_SELECTORS = ['[class*="chat" i]', '[id*="chat" i]', '[class*="drift" i]'];

test.describe(`Visual regression - ${location.country}`, () => {
  for (const template of TEMPLATES) {
    test(`@visual @regression | ${location.country} | ${template.name} matches its baseline`, async ({
      page,
    }) => {
      test.setTimeout(3 * 60 * 1000);

      await annotate({
        location: location.country,
        feature: 'Visual Regression',
        owner: 'QA Automation',
        severity: Severity.NORMAL,
        tags: ['visual', 'regression'],
      });

      const basePage = new BasePage(page);
      const separator = template.path.startsWith('/') ? '' : '/';
      const targetUrl = `${baseURL}${separator}${template.path}`;

      await test.step(`Open ${template.name}`, async () => {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await basePage.acceptCookiesIfPresent();
        await basePage.waitForPageReady();
        // Guards against capturing an unpainted page as a baseline.
        await basePage.ensurePageRendered();
        await basePage.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
      });

      // Scroll through so lazy media loads before capture.
      await test.step('Load lazy media', async () => {
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            let y = 0;
            const step = () => {
              window.scrollTo(0, y);
              y += window.innerHeight;
              if (y < document.body.scrollHeight) {
                requestAnimationFrame(step);
              } else {
                window.scrollTo(0, 0);
                resolve();
              }
            };
            step();
          });
        });
        await basePage.waitForPageReady();
      });

      // Stop --update-snapshots from saving a blank page as the baseline.
      await test.step('Confirm the page actually rendered', async () => {
        await expect(
          page.getByRole('heading', { level: 1 }).first(),
          `${template.name} should render a level-1 heading before being captured`,
        ).toBeVisible({ timeout: 15000 });

        const textLength = await page.evaluate(
          () => (document.body?.innerText ?? '').trim().length,
        );
        expect(
          textLength,
          `${template.name} rendered only ${textLength} characters - refusing to capture a blank baseline`,
        ).toBeGreaterThan(500);
      });

      // Pin videos to frame 0 (the home header sits over a looping video) and hide
      // chat overlays; `animations: 'disabled'` does not stop media playback.
      await test.step('Pin media to a fixed frame', async () => {
        await page.evaluate(() => {
          document.querySelectorAll('video').forEach((video) => {
            video.pause();
            video.currentTime = 0;
          });
        });

        await page.addStyleTag({
          content: `${THIRD_PARTY_OVERLAY_SELECTORS.join(', ')} { display: none !important; }`,
        });

        await basePage.waitForPageReady();
      });

      // Capture header and footer only: full-page shifts with the rail's height and
      // the viewport hero carousel never stabilizes. Body content is checked functionally.
      const regions = [
        { name: 'header', locator: page.locator('header').first() },
        { name: 'footer', locator: getFooter(page) },
      ];

      for (const region of regions) {
        const visible = await region.locator
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => true)
          .catch(() => false);

        expect(visible, `${template.name} should render its ${region.name}`).toBe(true);

        await expect(region.locator).toHaveScreenshot(
          `${template.slug}-${location.country}-${region.name}.png`,
          {
            animations: 'disabled',
            caret: 'hide',
            mask: DYNAMIC_SELECTORS.map((selector) => page.locator(selector)),
            maxDiffPixelRatio: 0.02,
          },
        );
      }
    });
  }
});
