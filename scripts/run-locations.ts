/**
 * Runs Playwright once per platform, browser and location, then builds one Allure report.
 * Specs resolve location at import time, so each country needs its own process.
 *
 * `LOCATION=CAN npm test`  -> Canada only
 * `npm test`               -> every location
 * Extra CLI args are forwarded to `playwright test`.
 */
import { spawnSync } from 'node:child_process';
import { getBrowserProjectKey, parseBrowserList } from '../config/browserSelection';
import process from 'node:process';
import { getEnv, loadEnv, isCI } from '../config/env';
import { getLocationsToRun } from '../config/locations/locationConfig';
import generateAllureReport from './generate-allure-report';
import { REPO_ROOT } from './allurePaths';

loadEnv();

const PLAYWRIGHT_CLI = require.resolve('@playwright/test/cli');

type Platform = 'web' | 'mobile';

/** Platforms to run from PLATFORMS (default web); each runs in its own process. */
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

/** Browsers a platform runs under, from the comma-separated BROWSER or MOBILE_BROWSER. */
function getBrowsersForPlatform(platform: Platform): string[] {
  if (platform === 'web') {
    return parseBrowserList(getEnv('BROWSER', 'chromium'));
  }

  // Defaults to iPhone 14 on WebKit, the engine every iOS browser uses.
  return parseBrowserList(getEnv('MOBILE_BROWSER', 'mobile-safari'));
}

type LocationPass = {
  platform: Platform;
  browser: string;
  browserTotal: number;
  location: string;
  index: number;
  total: number;
  // Whether an earlier pass already wrote to this platform's results dir.
  keepResults: boolean;
};

/** Run `playwright test` for one platform + browser + location and return its exit code. */
function runLocation(pass: LocationPass, args: string[]): number {
  const { platform, browser, browserTotal, location, index, total, keepResults } = pass;
  const banner = total > 1 ? ` (pass ${index + 1} of ${total})` : '';
  console.log(`\n[${platform}] Running BROWSER=${browser} LOCATION=${location}${banner}\n`);

  const result = spawnSync(process.execPath, [PLAYWRIGHT_CLI, 'test', ...args], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      BROWSER: browser,
      BROWSER_PASS_TOTAL: String(browserTotal),
      LOCATION: location,
      LOCATION_PASS_INDEX: String(index),
      LOCATION_PASS_TOTAL: String(total),
      // Keeps earlier passes' results; each platform's first pass still clears its own dir.
      ALLURE_KEEP_RESULTS: keepResults ? '1' : '',
      // The report is built once, after the last pass.
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
    const browsers = getBrowsersForPlatform(platform);

    if (browsers.length > 1) {
      console.log(`[${platform}] Browsers: ${browsers.join(', ')}`);
    }

    for (const [browserIndex, browser] of browsers.entries()) {
      const args = [...baseArgs];
      const browserProject = getBrowserProjectKey(browser);

      // Deselects @chrome-only tests on non-Chromium browsers (mobile included) rather than skipping them.
      if (browserProject !== 'chromium' && !args.some((arg) => arg.startsWith('--grep-invert'))) {
        args.push('--grep-invert', '@chrome-only');
        console.log(`[${platform}] Non-Chrome run (${browser}) — deselecting @chrome-only tests.`);
      }

      for (const [index, location] of locations.entries()) {
        const status = runLocation(
          {
            platform,
            browser,
            browserTotal: browsers.length,
            location,
            index,
            total: locations.length,
            keepResults: browserIndex > 0 || index > 0,
          },
          args,
        );
        // Continues past a failed pass but keeps its exit code.
        if (status !== 0) exitCode = status;
      }
    }
  }

  // On CI a workflow step generates the report.
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
