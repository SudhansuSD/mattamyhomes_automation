import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import type { FullConfig } from '@playwright/test';
import generateAllureReport from './generate-allure-report';
import { DESKTOP_ALLURE_REPORT_DIR, REPO_ROOT } from './allurePaths';
import { getBoolEnv, isCI } from '../config/env';
import { mergeLeadApiCaptures } from '../utils/evidence/leadApiCapture';
import { mergeProfanityEvidence } from '../utils/evidence/profanityEvidenceStore';

/**
 * Playwright global teardown — runs after every `npx playwright test`.
 *
 * Two jobs:
 *
 * 1. Merge the lead-API capture shards into the evidence workbook. Workers each
 *    append to their own shard during the run (see utils/evidence/leadApiCapture.ts);
 *    this is the single-writer point that folds them into the xlsx. It runs on
 *    CI as well as locally, which is why the config registers this teardown
 *    unconditionally.
 *
 * 2. Build the desktop Allure HTML report so a plain `npx playwright test`
 *    produces `allure-report/desktop/` with no extra command. We call
 *    generateAllureReport('desktop') EXPLICITLY (Playwright would otherwise pass
 *    its FullConfig object as the argument), then print where the report is.
 *
 *    Allure HTML must be served (file:// won't render), so we print the open
 *    command. Set ALLURE_OPEN=1 to launch the Allure server automatically after
 *    the run (this blocks until you stop it — handy for "run and show me").
 *
 *    ALLURE_SKIP_REPORT=1 (set by scripts/run-locations.ts) suppresses this: a
 *    multi-location run builds the report once, after the last location pass,
 *    instead of rebuilding it from partial results after every pass. CI skips it
 *    too — the workflow publishes results with its own steps.
 */
export default async function globalTeardown(_config: FullConfig): Promise<void> {
  // An evidence-merge problem must not mask the test outcome.
  try {
    const merged = await mergeLeadApiCaptures();

    if (merged) {
      console.log(
        `\n[lead-api] Merged ${merged.rowsMerged} captured lead API call(s) into:\n           ${merged.outputFile}`,
      );
    }
  } catch (error) {
    console.error('[lead-api] Failed to merge lead API captures into the workbook:', error);
  }

  try {
    const merged = await mergeProfanityEvidence();

    if (merged) {
      console.log(
        `\n[profanity] Merged ${merged.rowsMerged} evidence row(s) into:\n            ${merged.outputFile}`,
      );
    }
  } catch (error) {
    console.error('[profanity] Failed to merge profanity evidence into the workbook:', error);
  }

  if (isCI || getBoolEnv('ALLURE_SKIP_REPORT')) {
    return;
  }

  await generateAllureReport('desktop');

  const indexPath = path.join(DESKTOP_ALLURE_REPORT_DIR, 'awesome', 'index.html');
  console.log(`\n[allure] Desktop HTML report generated:\n         ${indexPath}`);

  if (getBoolEnv('ALLURE_OPEN')) {
    console.log('[allure] ALLURE_OPEN=1 -> opening report (Ctrl+C to stop)...\n');
    const allureBin = path.resolve(
      REPO_ROOT,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'allure.cmd' : 'allure',
    );
    execSync(`"${allureBin}" open "${DESKTOP_ALLURE_REPORT_DIR}"`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
  } else {
    console.log('[allure] Open it with:  npm run allure:open   (or: npm run allure:watch)\n');
  }
}
