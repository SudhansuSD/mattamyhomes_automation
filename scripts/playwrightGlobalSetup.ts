import fs from 'node:fs';
import type { FullConfig } from '@playwright/test';
import { DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR } from './allurePaths';
import { isMobileBrowserProject } from '../config/browserSelection';
import { getBoolEnv } from '../config/env';

// Clears this platform's stale Allure results once per run. It lives here, not in
// playwright.config.ts, because workers re-import the config and would wipe results on restart.
// ALLURE_KEEP_RESULTS=1 keeps earlier location passes so one report covers them all.
export default async function globalSetup(_config: FullConfig): Promise<void> {
  const resultsDir = isMobileBrowserProject()
    ? MOBILE_ALLURE_RESULTS_DIR
    : DESKTOP_ALLURE_RESULTS_DIR;

  if (getBoolEnv('ALLURE_KEEP_RESULTS')) {
    console.log('[allure] ALLURE_KEEP_RESULTS=1 → keeping results from the previous location pass');
    return;
  }

  fs.rmSync(resultsDir, { recursive: true, force: true });
}
