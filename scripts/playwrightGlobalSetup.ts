import fs from 'node:fs';
import type { FullConfig } from '@playwright/test';
import { DESKTOP_ALLURE_RESULTS_DIR } from './allurePaths';
import { getBoolEnv } from '../config/env';

/**
 * Playwright global setup — runs exactly ONCE in the main process before any
 * tests, and NEVER in a worker (or on worker restart).
 *
 * This is the correct place to clear stale Allure results. Doing it at the top
 * level of playwright.config.ts was a bug: the config module is re-imported by
 * every worker, so when a failing test caused Playwright to restart its worker,
 * the restart wiped the results already written for earlier tests (including
 * the failures) — leaving only the tests that ran after the last restart in the
 * report.
 *
 * ALLURE_KEEP_RESULTS=1 (set by scripts/run-locations.ts for every pass after
 * the first) preserves the results already written for earlier locations, so a
 * multi-location run produces one report covering all of them.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  if (getBoolEnv('ALLURE_KEEP_RESULTS')) {
    console.log('[allure] ALLURE_KEEP_RESULTS=1 → keeping results from the previous location pass');
    return;
  }

  fs.rmSync(DESKTOP_ALLURE_RESULTS_DIR, { recursive: true, force: true });
}
