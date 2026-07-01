import path from 'node:path';

export const REPO_ROOT = path.resolve(__dirname, '..');

export const ALLURE_RESULTS_ROOT = path.resolve(REPO_ROOT, 'allure-results');
export const DESKTOP_ALLURE_RESULTS_DIR = path.resolve(ALLURE_RESULTS_ROOT, 'desktop');
export const MOBILE_ALLURE_RESULTS_DIR = path.resolve(ALLURE_RESULTS_ROOT, 'mobile');

export const ALLURE_REPORT_ROOT = path.resolve(REPO_ROOT, 'allure-report');
export const DESKTOP_ALLURE_REPORT_DIR = path.resolve(ALLURE_REPORT_ROOT, 'desktop');
export const MOBILE_ALLURE_REPORT_DIR = path.resolve(ALLURE_REPORT_ROOT, 'mobile');
export const MERGED_ALLURE_REPORT_DIR = path.resolve(ALLURE_REPORT_ROOT, 'merged');
