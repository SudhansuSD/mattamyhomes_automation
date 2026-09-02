/**
 * Location-aware Playwright runner.
 *
 * `LOCATION=CAN npm test`  -> one Playwright run for Canada.
 * `npm test`               -> one run per location (USA, then CAN), producing a
 *                             SINGLE Allure report that covers both.
 *
 * Location is resolved at import time inside every spec (`getLocationConfig()`
 * at module scope), so a process can only ever represent one country. Covering
 * both therefore means one child Playwright process per location, with the
 * Allure results accumulated across passes and the HTML report built once at
 * the end:
 *   - pass 0 clears allure-results/desktop (normal globalSetup behavior)
 *   - later passes set ALLURE_KEEP_RESULTS=1 so they append instead of wiping
 *   - every pass sets ALLURE_SKIP_REPORT=1; this script generates the report
 *
 * Any extra CLI arguments are forwarded verbatim to `playwright test`, so
 * `npm test -- --grep @smoke --project=Chrome` keeps working.
 */
import { spawnSync } from 'node:child_process';
import { getBrowserProjectKey } from '../config/browserSelection';
import process from 'node:process';
import { getEnv, loadEnv, isCI } from '../config/env';
import { getLocationsToRun } from '../config/locations/locationConfig';
import generateAllureReport from './generate-allure-report';
import { REPO_ROOT } from './allurePaths';

loadEnv();

const PLAYWRIGHT_CLI = require.resolve('@playwright/test/cli');

type Platform = 'web' | 'mobile';

/**
 * Platforms this invocation should cover.
 *
 * `PLATFORMS=web,mobile` runs each in its own Playwright process, because the
 * platform is chosen by BROWSER and playwright.config.ts resolves exactly one
 * project - and one Allure results dir - per process. Defaults to web only, so
 * every existing command behaves as before unless it opts in.
 */
function getPlatformsToRun(): Platform[] {
  const raw = getEnv('PLATFORMS', 'web');
  const requested = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const platforms = requested.filter((value): value is Platform =>
    ['web', 'mobile'].includes(value),
  );

  if (platforms.length !== requested.length) {
    throw new Error(`Unsupported PLATFORMS="${raw}". Use web, mobile, or web,mobile.`);
  }

  return platforms.length ? [...new Set(platforms)] : ['web'];
}

/** The BROWSER value a platform pass runs under. */
function getBrowserForPlatform(platform: Platform): string {
  if (platform === 'web') {
    return getEnv('BROWSER', 'chromium');
  }

  // iPhone 14 on WebKit by default - WebKit is the engine every iOS browser
  // uses, so it is the mobile profile that catches the most.
  return getEnv('MOBILE_BROWSER', 'mobile-safari');
}

/** Run `playwright test` for one platform + location and return its exit code. */
function runLocation(
  platform: Platform,
  location: string,
  index: number,
  total: number,
  args: string[],
): number {
  const banner = total > 1 ? ` (pass ${index + 1} of ${total})` : '';
  console.log(`\n[${platform}] Running LOCATION=${location}${banner}\n`);

  const result = spawnSync(process.execPath, [PLAYWRIGHT_CLI, 'test', ...args], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      BROWSER: getBrowserForPlatform(platform),
      LOCATION: location,
      LOCATION_PASS_INDEX: String(index),
      LOCATION_PASS_TOTAL: String(total),
      // Keep results from earlier passes so the final report covers them all.
      // Per platform, not per run: each platform writes to its own results dir,
      // so its first pass must still clear that dir.
      ALLURE_KEEP_RESULTS: index > 0 ? '1' : '',
      // Build the HTML report once, after the last pass — not per pass.
      ALLURE_SKIP_REPORT: '1',
    },
  });

  if (result.error) {
    console.error(
      `[${platform}] Failed to start Playwright for ${location}:`,
      result.error.message,
    );
    return 1;
  }

  return result.status ?? 1;
}

async function main(): Promise<void> {
  const baseArgs = process.argv.slice(2);
  const locations = getLocationsToRun();
  const platforms = getPlatformsToRun();

  if (locations.length > 1) {
    console.log(`[locations] No LOCATION set — running all locations: ${locations.join(', ')}`);
  }
  if (platforms.length > 1) {
    console.log(`[platforms] Running: ${platforms.join(', ')}`);
  }

  let exitCode = 0;
  for (const platform of platforms) {
    // Resolved per platform: the mobile pass runs a different BROWSER, so
    // whether @chrome-only applies has to be decided inside this loop.
    const args = [...baseArgs];
    const browserProject = getBrowserProjectKey(getBrowserForPlatform(platform));

    // Deselect Chrome-only tests on firefox/webkit rather than reporting them as
    // skipped - "36 selected" is clearer than "42 passed, 6 skipped". The mobile
    // profiles are included: @chrome-only marks desktop-Chrome-specific flows.
    if (browserProject !== 'chromium' && !args.some((arg) => arg.startsWith('--grep-invert'))) {
      args.push('--grep-invert', '@chrome-only');
      console.log(`[${platform}] Non-Chrome run — deselecting @chrome-only tests.`);
    }

    for (const [index, location] of locations.entries()) {
      const status = runLocation(platform, location, index, locations.length, args);
      // Keep going so the report covers every location even if one pass fails,
      // but surface the failure in this process's exit code.
      if (status !== 0) exitCode = status;
    }
  }

  // Under CI the report is generated by an explicit workflow step (the same
  // reason playwright.config.ts disables globalTeardown there).
  if (!isCI) {
    for (const platform of platforms) {
      await generateAllureReport(platform === 'mobile' ? 'mobile' : 'desktop');
    }
    console.log(`\n[allure] Report covers: ${locations.join(', ')} on ${platforms.join(', ')}`);
    console.log('[allure] Open it with:  npm run allure:open\n');
  }

  process.exit(exitCode);
}

void main();
