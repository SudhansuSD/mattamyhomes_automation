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
