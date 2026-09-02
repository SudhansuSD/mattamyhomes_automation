import fs from 'node:fs';
import path from 'node:path';

export const REPO_ROOT = path.resolve(__dirname, '..');

export const ALLURE_RESULTS_ROOT = path.resolve(REPO_ROOT, 'allure-results');
export const DESKTOP_ALLURE_RESULTS_DIR = path.resolve(ALLURE_RESULTS_ROOT, 'desktop');
export const MOBILE_ALLURE_RESULTS_DIR = path.resolve(ALLURE_RESULTS_ROOT, 'mobile');

export const ALLURE_REPORT_ROOT = path.resolve(REPO_ROOT, 'allure-report');
export const DESKTOP_ALLURE_REPORT_DIR = path.resolve(ALLURE_REPORT_ROOT, 'desktop');
export const MOBILE_ALLURE_REPORT_DIR = path.resolve(ALLURE_REPORT_ROOT, 'mobile');
export const MERGED_ALLURE_REPORT_DIR = path.resolve(ALLURE_REPORT_ROOT, 'merged');

export const ALLURE_HISTORY_ROOT = path.resolve(REPO_ROOT, '.allure-history');
export const DESKTOP_ALLURE_HISTORY_FILE = path.resolve(
  ALLURE_HISTORY_ROOT,
  'desktop-history.jsonl',
);
export const MOBILE_ALLURE_HISTORY_FILE = path.resolve(ALLURE_HISTORY_ROOT, 'mobile-history.jsonl');
export const MERGED_ALLURE_HISTORY_FILE = path.resolve(ALLURE_HISTORY_ROOT, 'merged-history.jsonl');

/**
 * True when a results dir holds at least one Allure result.
 *
 * Existence of the directory is not enough: every platform's first location
 * pass creates and clears its own dir, so an empty one means that platform did
 * not run rather than that it produced nothing.
 */
export function hasAllureResults(resultsDir: string): boolean {
  if (!fs.existsSync(resultsDir)) {
    return false;
  }

  // Recursive so a nested layout cannot read as "this platform did not run",
  // which would understate the coverage every report and the email are named for.
  return fs.readdirSync(resultsDir, { withFileTypes: true }).some((entry) => {
    const fullPath = path.join(resultsDir, entry.name);
    return entry.isDirectory() ? hasAllureResults(fullPath) : entry.name.endsWith('-result.json');
  });
}

/** Which platforms a finished run actually produced results for. */
export function getPlatformCoverage(): { web: boolean; mobile: boolean } {
  return {
    web: hasAllureResults(DESKTOP_ALLURE_RESULTS_DIR),
    mobile: hasAllureResults(MOBILE_ALLURE_RESULTS_DIR),
  };
}
