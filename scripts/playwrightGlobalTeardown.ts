import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import type { FullConfig } from '@playwright/test';
import generateAllureReport, { recordPassLocation } from './generate-allure-report';
import {
  DESKTOP_ALLURE_REPORT_DIR,
  DESKTOP_ALLURE_RESULTS_DIR,
  MOBILE_ALLURE_REPORT_DIR,
  MOBILE_ALLURE_RESULTS_DIR,
  REPO_ROOT,
} from './allurePaths';
import { isMobileBrowserProject } from '../config/browserSelection';
import { getBoolEnv, isCI } from '../config/env';
import { mergeLeadApiCaptures } from '../utils/evidence/leadApiCapture';
import { mergeProfanityEvidence } from '../utils/evidence/profanityEvidenceStore';

/**
 * Merges evidence shards into their workbooks (the single xlsx writer), then builds this
 * platform's Allure report unless on CI or ALLURE_SKIP_REPORT=1. ALLURE_OPEN=1 serves it.
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

  // Recorded before the early return: only this pass knows which location it ran under.
  recordPassLocation(
    isMobileBrowserProject() ? MOBILE_ALLURE_RESULTS_DIR : DESKTOP_ALLURE_RESULTS_DIR,
    (process.env.LOCATION ?? '').trim().toUpperCase(),
  );

  if (isCI || getBoolEnv('ALLURE_SKIP_REPORT')) {
    return;
  }

  // Builds the report for the platform this run used.
  const isMobileRun = isMobileBrowserProject();
  const reportDir = isMobileRun ? MOBILE_ALLURE_REPORT_DIR : DESKTOP_ALLURE_REPORT_DIR;
  const platformName = isMobileRun ? 'Mobile' : 'Desktop';

  await generateAllureReport(isMobileRun ? 'mobile' : 'desktop');

  const indexPath = path.join(reportDir, 'awesome', 'index.html');
  console.log(`\n[allure] ${platformName} HTML report generated:\n         ${indexPath}`);

  if (getBoolEnv('ALLURE_OPEN')) {
    console.log('[allure] ALLURE_OPEN=1 -> opening report (Ctrl+C to stop)...\n');
    const allureBin = path.resolve(
      REPO_ROOT,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'allure.cmd' : 'allure',
    );
    execSync(`"${allureBin}" open "${reportDir}"`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
  } else {
    console.log('[allure] Open it with:  npm run allure:open   (or: npm run allure:watch)\n');
  }
}
