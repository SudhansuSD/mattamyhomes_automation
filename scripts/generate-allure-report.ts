import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  DESKTOP_ALLURE_RESULTS_DIR,
  DESKTOP_ALLURE_REPORT_DIR,
  MOBILE_ALLURE_RESULTS_DIR,
  MOBILE_ALLURE_REPORT_DIR,
  MERGED_ALLURE_REPORT_DIR,
  REPO_ROOT,
} from './allurePaths';
import { loadEnv, getEnv } from '../config/env';
import { getEnvConfig } from '../config/environments/envConfig';

loadEnv();

type ReportMode = 'desktop' | 'mobile' | 'merged';

const CATEGORIES_SOURCE = path.resolve(REPO_ROOT, 'config', 'allure', 'categories.json');

function hasAllureResults(resultsDir: string): boolean {
  if (!fs.existsSync(resultsDir)) {
    return false;
  }

  return fs.readdirSync(resultsDir).some((fileName) => fileName.endsWith('-result.json'));
}

/** Read the framework version from package.json for the report header. */
function getAppVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, 'package.json'), 'utf8'));
    return String(pkg.version ?? 'unknown');
  } catch {
    return 'unknown';
  }
}

/**
 * Seed a results dir with the widgets Allure needs for a rich, readable report:
 *  - categories.json  -> auto-groups known failure types
 *  - environment.properties -> the "Environment" widget (env, browser, base URL...)
 *  - executor.json (CI only) -> the "Executor" header (where/how it ran)
 */
function seedAllureMetadata(resultsDir: string, label: string): void {
  fs.mkdirSync(resultsDir, { recursive: true });

  // categories.json
  if (fs.existsSync(CATEGORIES_SOURCE)) {
    fs.copyFileSync(CATEGORIES_SOURCE, path.join(resultsDir, 'categories.json'));
  }

  // environment.properties
  const env = getEnvConfig();
  const properties: Record<string, string> = {
    Suite: label,
    TEST_ENV: getEnv('TEST_ENV', env.envName),
    Environment: env.envName,
    BaseURL: env.baseURL,
    Browser: getEnv(
      'BROWSER',
      label === 'mobile' ? getEnv('MOBILE_BROWSER_NAME', 'Chrome') : 'Chrome',
    ),
    AppVersion: getAppVersion(),
    Node: process.version,
    OS: `${process.platform} ${process.arch}`,
  };
  const propertiesText = Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  fs.writeFileSync(path.join(resultsDir, 'environment.properties'), `${propertiesText}\n`);

  // executor.json (CI only — needs the GitHub Actions context to be meaningful)
  if (process.env.CI && process.env.GITHUB_RUN_ID) {
    const server = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
    const repo = process.env.GITHUB_REPOSITORY ?? '';
    const runId = process.env.GITHUB_RUN_ID ?? '';
    const executor = {
      name: 'GitHub Actions',
      type: 'github',
      buildName: `${process.env.GITHUB_WORKFLOW ?? 'CI'} #${process.env.GITHUB_RUN_NUMBER ?? ''}`,
      buildUrl: repo && runId ? `${server}/${repo}/actions/runs/${runId}` : undefined,
      reportName: `Allure Report (${label})`,
    };
    fs.writeFileSync(path.join(resultsDir, 'executor.json'), JSON.stringify(executor, null, 2));
  }
}

/**
 * Carry the previous report's history/ back into the results dir so trend graphs
 * accumulate across runs instead of resetting to empty every time.
 */
function restoreHistory(resultsDir: string, reportDir: string): void {
  const previousHistory = path.join(reportDir, 'history');
  if (!fs.existsSync(previousHistory)) {
    return;
  }
  const targetHistory = path.join(resultsDir, 'history');
  fs.mkdirSync(targetHistory, { recursive: true });
  for (const entry of fs.readdirSync(previousHistory)) {
    fs.copyFileSync(path.join(previousHistory, entry), path.join(targetHistory, entry));
  }
}

function generateReport(resultsDirs: string[], reportDir: string): void {
  const activeResults = resultsDirs.filter((dir) => hasAllureResults(dir));

  if (!activeResults.length) {
    console.log(
      `Allure HTML report skipped: no Allure test result files were found for ${path.basename(reportDir)}.`,
    );
    return;
  }

  // Seed metadata widgets and carry history forward for each results dir so the
  // report has environment/executor/categories info and trend graphs persist.
  for (const dir of activeResults) {
    seedAllureMetadata(dir, path.basename(reportDir));
    restoreHistory(dir, reportDir);
  }

  const allureCommand = path.resolve(
    REPO_ROOT,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'allure.cmd' : 'allure',
  );

  execSync(
    `"${allureCommand}" generate ${activeResults.map((dir) => `"${dir}"`).join(' ')} --clean -o "${reportDir}"`,
    {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    },
  );
}

export default async function generateAllureReport(mode: ReportMode = 'desktop'): Promise<void> {
  switch (mode) {
    case 'mobile':
      generateReport([MOBILE_ALLURE_RESULTS_DIR], MOBILE_ALLURE_REPORT_DIR);
      return;
    case 'merged':
      generateReport(
        [DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR],
        MERGED_ALLURE_REPORT_DIR,
      );
      return;
    case 'desktop':
    default:
      generateReport([DESKTOP_ALLURE_RESULTS_DIR], DESKTOP_ALLURE_REPORT_DIR);
  }
}

if (require.main === module) {
  const mode = (process.argv[2] as ReportMode | undefined) ?? 'desktop';
  void generateAllureReport(mode);
}
