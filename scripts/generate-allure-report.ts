import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  DESKTOP_ALLURE_RESULTS_DIR,
  DESKTOP_ALLURE_REPORT_DIR,
  DESKTOP_ALLURE_HISTORY_FILE,
  MOBILE_ALLURE_RESULTS_DIR,
  MOBILE_ALLURE_REPORT_DIR,
  MOBILE_ALLURE_HISTORY_FILE,
  MERGED_ALLURE_REPORT_DIR,
  MERGED_ALLURE_HISTORY_FILE,
  REPO_ROOT,
} from './allurePaths';
import { loadEnv, getEnv } from '../config/env';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationsToRun } from '../config/locations/locationConfig';

loadEnv();

type ReportMode = 'desktop' | 'mobile' | 'merged';

const CATEGORIES_SOURCE = path.resolve(REPO_ROOT, 'config', 'allure', 'categories.json');
const ALLURE_CONFIG_FILE = path.resolve(REPO_ROOT, 'allurerc.mjs');
const ALLURE_HISTORY_FILE_NAME = 'history.jsonl';
const RUN_TYPE_LABEL = 'runType';
const RUN_TYPE_BY_KEY: Record<string, string> = {
  ci: 'CI',
  smoke: 'Smoke',
  regression: 'Regression',
  full: 'Full',
};

type AllureResultFile = {
  name?: string;
  fullName?: string;
  labels?: Array<{
    name?: string;
    value?: string;
  }>;
};

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
    TEST_ENV: env.envName,
    Environment: env.envName,
    BaseURL: env.baseURL,
    // Every location the run covered — a single value when LOCATION was given,
    // "USA, CAN" when it was not and run-locations.ts ran a pass for each.
    Location: getLocationsToRun().join(', '),
    RunType: getRunType(),
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
 * Preserve legacy Allure 2 history folders if a cached report still has them.
 * Allure 3 uses history.jsonl, which is preserved in prepareReportDirectory().
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

function prepareReportDirectory(reportDir: string, historyFilePath: string): string {
  const previousReportHistory = path.join(reportDir, ALLURE_HISTORY_FILE_NAME);

  fs.mkdirSync(path.dirname(historyFilePath), { recursive: true });

  if (!fs.existsSync(historyFilePath) && fs.existsSync(previousReportHistory)) {
    fs.copyFileSync(previousReportHistory, historyFilePath);
  }

  fs.rmSync(reportDir, { recursive: true, force: true });
  fs.mkdirSync(reportDir, { recursive: true });

  return historyFilePath;
}

function collectResultFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const collected: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collected.push(...collectResultFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('-result.json')) {
      collected.push(fullPath);
    }
  }

  return collected;
}

function getRunType(): string {
  const candidates = [
    process.env.TEST_SUITE,
    process.env.npm_lifecycle_event?.replace(/^test:/, ''),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const key = candidate?.toLowerCase() ?? '';
    if (RUN_TYPE_BY_KEY[key]) {
      return RUN_TYPE_BY_KEY[key];
    }
  }

  return 'Full';
}

function enrichRunTypeLabels(resultsDir: string, runType: string): void {
  for (const resultPath of collectResultFiles(resultsDir)) {
    try {
      const result = JSON.parse(fs.readFileSync(resultPath, 'utf8')) as AllureResultFile;
      const labels = result.labels ?? [];

      if (labels.some((label) => label.name === RUN_TYPE_LABEL && label.value === runType)) {
        continue;
      }

      result.labels = [...labels, { name: RUN_TYPE_LABEL, value: runType }];
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    } catch (error) {
      console.warn(`Unable to enrich Allure run type label for ${resultPath}:`, error);
    }
  }
}

function writeReportLandingPage(reportDir: string): void {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=./awesome/">
    <title>Mattamy Homes Automation Report</title>
  </head>
  <body>
    <p>Opening <a href="./awesome/">Allure Awesome report</a>. The charts-only dashboard is available at <a href="./dashboard/">dashboard</a>.</p>
  </body>
</html>
`;

  fs.writeFileSync(path.join(reportDir, 'index.html'), html);
}

function generateReport(resultsDirs: string[], reportDir: string, historyFilePath: string): void {
  const activeResults = resultsDirs.filter((dir) => hasAllureResults(dir));
  const runType = getRunType();

  if (!activeResults.length) {
    console.log(
      `Allure HTML report skipped: no Allure test result files were found for ${path.basename(reportDir)}.`,
    );
    return;
  }

  // Seed metadata widgets and keep legacy history compatible while Allure 3
  // reads/writes the current history.jsonl file through allurerc.mjs.
  for (const dir of activeResults) {
    seedAllureMetadata(dir, path.basename(reportDir));
    enrichRunTypeLabels(dir, runType);
    restoreHistory(dir, reportDir);
  }

  const allureCommand = path.resolve(
    REPO_ROOT,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'allure.cmd' : 'allure',
  );
  prepareReportDirectory(reportDir, historyFilePath);

  execSync(
    `"${allureCommand}" generate ${activeResults.map((dir) => `"${dir}"`).join(' ')} --config "${ALLURE_CONFIG_FILE}" --output "${reportDir}"`,
    {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        ALLURE_OUTPUT_DIR: reportDir,
        ALLURE_HISTORY_PATH: historyFilePath,
        ALLURE_REPORT_NAME: `Mattamy Homes Automation (${path.basename(reportDir)})`,
      },
    },
  );

  writeReportLandingPage(reportDir);
}

export default async function generateAllureReport(mode: ReportMode = 'desktop'): Promise<void> {
  switch (mode) {
    case 'mobile':
      generateReport(
        [MOBILE_ALLURE_RESULTS_DIR],
        MOBILE_ALLURE_REPORT_DIR,
        MOBILE_ALLURE_HISTORY_FILE,
      );
      return;
    case 'merged':
      generateReport(
        [DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR],
        MERGED_ALLURE_REPORT_DIR,
        MERGED_ALLURE_HISTORY_FILE,
      );
      return;
    case 'desktop':
    default:
      generateReport(
        [DESKTOP_ALLURE_RESULTS_DIR],
        DESKTOP_ALLURE_REPORT_DIR,
        DESKTOP_ALLURE_HISTORY_FILE,
      );
  }
}

if (require.main === module) {
  const mode = (process.argv[2] as ReportMode | undefined) ?? 'desktop';
  void generateAllureReport(mode);
}
