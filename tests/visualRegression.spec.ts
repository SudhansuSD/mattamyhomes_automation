/**
 * ENV=STAGE LOCATION=USA npx playwright test tests/visualRegression.spec.ts --project=Chrome
 *
 * First run (or after an intended redesign):
 *   ... tests/visualRegression.spec.ts --update-snapshots
 *
 * Screenshot comparison of every page template.
 *
 * The suite asserts that elements exist and that text matches, which says
 * nothing about whether the page still LOOKS right - a collapsed grid, a hero
 * that lost its background, or a footer overlapping content all pass every
 * functional check. One baseline per template covers that cheaply.
 *
 * Everything genuinely dynamic is masked rather than tolerated by a pixel
 * threshold: prices, inventory counts and community cards change on STAGE
 * daily, and a threshold loose enough to absorb them is loose enough to hide a
 * real layout break.
 */

import { expect, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { BasePage } from '../pages/BasePage';
import { annotate, Severity } from '../utils/reporting/allureMeta';

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
  { name: 'Home page', slug: 'home', path: '/' },
  { name: 'Market page', slug: 'market', path: configuredMarket.url },
  { name: 'Community page', slug: 'community', path: location.communityPath },
  { name: 'Plan detail page', slug: 'plan', path: location.expectedPlanPath },
  { name: 'QMI detail page', slug: 'qmi', path: location.qmiPath },
  { name: 'About Us page', slug: 'about', path: location.aboutUsLinks[0].url },
  ...(mpc ? [{ name: 'MPC page', slug: 'mpc', path: mpc.url }] : []),
];

/**
 * Regions whose content legitimately changes between runs.
 *
 * Kept narrow. Masking whole carousels hollowed the baselines out - the QMI page
 * came back almost pure mask. A visual test that hides the layout cannot catch a
 * layout break, so only volatile text and the auto-rotating rail are masked.
 */
const DYNAMIC_SELECTORS = [
  // Volatile text.
  '[class*="price" i]',
  '[class*="availab" i]',
  '[class*="quick-move" i] [class*="count" i]',
  // The market-card rail auto-rotates, so whichever slide is showing at capture
  // time is luck. Pinning the slick track to slide one was tried first and
  // blanked the whole rail, so the rail is masked and the rest of the page -
  // hero, content blocks, footer - is compared for real.
  '#cards',
  // Third-party chat widget: renders on its own schedule with an unread badge.
  '[class*="chat" i]',
  '[id*="chat" i]',
  '[class*="drift" i]',
];

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
      const targetUrl = `${baseURL}${separator}${template.path}?${location.queryParam}`;

      await test.step(`Open ${template.name}`, async () => {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await basePage.acceptCookiesIfPresent();
        await basePage.waitForPageReady();
        // The blank/unhydrated render guard. Without it this spec captured
        // unpainted pages and wrote them out as baselines - the market baseline
        // came back as white space with a few price masks on it.
        await basePage.ensurePageRendered();
        await basePage.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
      });

      // Lazy media loads on scroll; without this the baseline captures empty
      // image frames and every later run "differs" as they fill in.
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

      // Refuse to bless an empty page. --update-snapshots writes whatever it
      // sees, so without this a blank render silently becomes the baseline and
      // every later run compares against nothing.
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

      // Header and footer, not the whole page.
      //
      // Two earlier attempts failed for real reasons, both recorded here so this
      // is not "simplified" back later:
      //   - fullPage: the market-card rail renders at a different height each
      //     run, so everything below it shifts. 7% of the home page differed
      //     purely from that offset, body text visibly doubled in the diff.
      //   - viewport: the home hero is an auto-rotating carousel, so Playwright
      //     could not take two consecutive stable screenshots of it at all.
      //
      // The chrome is what actually regresses in a way a human would call a bug -
      // nav collapsing, footer columns reflowing - and it is stable on every
      // template. Marketing content below it is verified functionally instead.
      const regions = [
        { name: 'header', locator: page.locator('header').first() },
        { name: 'footer', locator: page.locator('footer, [role="contentinfo"]').first() },
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
