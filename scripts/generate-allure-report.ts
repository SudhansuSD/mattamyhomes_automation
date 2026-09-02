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
  hasAllureResults,
} from './allurePaths';
import { loadEnv, getEnv, getBoolEnv, isCI } from '../config/env';
import { getBrowserCoverageLabel } from '../config/browserSelection';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationsToRun } from '../config/locations/locationConfig';
import { LOCATION_AGNOSTIC_SPEC_GLOBS } from '../config/locations/locationAgnosticSpecs';

loadEnv();

type ReportMode = 'desktop' | 'mobile' | 'merged';

const CATEGORIES_SOURCE = path.resolve(REPO_ROOT, 'config', 'allure', 'categories.json');
const ALLURE_CONFIG_FILE = path.resolve(REPO_ROOT, 'allurerc.mjs');
const ALLURE_HISTORY_FILE_NAME = 'history.jsonl';
const RUN_TYPE_LABEL = 'runType';
const PARENT_SUITE_LABEL = 'parentSuite';
const EPIC_LABEL = 'epic';
const SUITE_LABEL = 'suite';
const AGNOSTIC_LOCATION = 'ALL';

/** Platform each results directory belongs to, as the report tree labels it. */
const PLATFORM_BY_RESULTS_DIR: Array<{ dir: string; platform: string }> = [
  { dir: MOBILE_ALLURE_RESULTS_DIR, platform: 'Mobile' },
  { dir: DESKTOP_ALLURE_RESULTS_DIR, platform: 'Web' },
];

function getPlatformForResultsDir(resultsDir: string): string {
  return (
    PLATFORM_BY_RESULTS_DIR.find((entry) => path.resolve(entry.dir) === path.resolve(resultsDir))
      ?.platform ?? 'Web'
  );
}
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

/** How each report stream names itself in its title and Suite row. */
const SUITE_NAME_BY_MODE: Record<ReportMode, string> = {
  desktop: 'desktop',
  mobile: 'mobile',
  merged: 'web + mobile',
};

/**
 * The browser(s) a report covers, named per its platform.
 *
 * The merged stream is named from the results that actually landed: it is built
 * from whichever results dirs have content, so a single-platform run produces a
 * valid merged report that must not claim coverage it does not hold.
 */
function getBrowserLabel(label: string): string {
  if (label === 'merged') {
    return getBrowserCoverageLabel(
      hasAllureResults(DESKTOP_ALLURE_RESULTS_DIR),
      hasAllureResults(MOBILE_ALLURE_RESULTS_DIR),
    );
  }

  return getBrowserCoverageLabel(label !== 'mobile', label === 'mobile');
}

/** Human-readable name of the report stream a report dir holds. */
function getSuiteName(label: string): string {
  return SUITE_NAME_BY_MODE[label as ReportMode] ?? label;
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
    Suite: getSuiteName(label),
    Environment: env.envName,
    BaseURL: env.baseURL,
    // Every location the run covered — a single value when LOCATION was given,
    // "USA, CAN" when it was not and run-locations.ts ran a pass for each.
    Location: getLocationsToRun().join(', '),
    RunType: getRunType(),
    // Each stream names the Playwright project that produced it, so an iPhone
    // run is not labeled with a desktop browser, and the merged report names
    // both because it covers both.
    Browser: getBrowserLabel(label),
    AppVersion: getAppVersion(),
    Node: process.version,
    OS: `${process.platform} ${process.arch}`,
    // Stated in the report because "was that run headed?" is otherwise
    // unanswerable after the fact: CI forces headless, a local run is headed
    // unless HEADLESS is set.
    Display: isCI || getBoolEnv('HEADLESS') ? 'headless' : 'headed',
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

/**
 * Stamp the labels the report groups by onto every result in a stream.
 *
 * The results directory is the authority for the platform: everything in
 * allure-results/mobile ran on a phone profile whatever a test managed to
 * report about itself. A test that fails inside `beforeEach` never reaches
 * `annotate()`, so without this it keeps allure-playwright's project-name
 * parentSuite and lands outside the Web / Mobile split - which is where the
 * failures worth reading would end up.
 *
 * `epic` is only filled in when a test set none, so the 'ALL' that
 * location-agnostic specs declare survives.
 */
function enrichRunLabels(
  resultsDir: string,
  labelsToApply: { runType: string; platform: string; location: string },
): void {
  for (const resultPath of collectResultFiles(resultsDir)) {
    try {
      const result = JSON.parse(fs.readFileSync(resultPath, 'utf8')) as AllureResultFile;
      const labels = (result.labels ?? []).filter(
        (label) => label.name !== RUN_TYPE_LABEL && label.name !== PARENT_SUITE_LABEL,
      );

      labels.push({ name: RUN_TYPE_LABEL, value: labelsToApply.runType });
      labels.push({ name: PARENT_SUITE_LABEL, value: labelsToApply.platform });

      if (!labels.some((label) => label.name === EPIC_LABEL) && labelsToApply.location) {
        labels.push({ name: EPIC_LABEL, value: labelsToApply.location });
      }

      result.labels = labels;
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    } catch (error) {
      console.warn(`Unable to enrich Allure labels for ${resultPath}:`, error);
    }
  }
}

/** Collect every stylesheet the generated report ships. */
function collectStylesheets(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const collected: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collected.push(...collectStylesheets(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      collected.push(fullPath);
    }
  }

  return collected;
}

/**
 * Widen the report's content column.
 *
 * Allure Awesome hard-codes `max-width:920px` on the Report view's container, so
 * on a normal monitor the summary sits in a narrow centered strip with large empty
 * margins — while the Graphs view, which is not inside that container, fills the
 * window. The plugin exposes no CSS hook and its `layout: 'split'` option adds a
 * second pane rather than widening the content, so patching the generated
 * stylesheet is the only way to change it.
 *
 * The replacement keys on the exact `max-width:920px` token, NOT on the hashed
 * class names (`.b2XhjWBW`), which change on every Allure build. `max-width:1920px`
 * appears elsewhere in the same file and is deliberately left alone.
 *
 * Set ALLURE_REPORT_MAX_WIDTH to a CSS length to cap it instead ('1600px'), or to
 * 'default' to keep Allure's own 920px.
 */
function widenReportLayout(reportDir: string): void {
  const target = getEnv('ALLURE_REPORT_MAX_WIDTH', 'none');

  if (target.toLowerCase() === 'default') {
    return;
  }

  let replaced = 0;

  for (const stylesheet of collectStylesheets(reportDir)) {
    const css = fs.readFileSync(stylesheet, 'utf8');
    const matches = css.match(/max-width:920px/g);

    if (!matches) {
      continue;
    }

    fs.writeFileSync(stylesheet, css.replace(/max-width:920px/g, `max-width:${target}`));
    replaced += matches.length;
  }

  if (replaced) {
    console.log(`[allure] Widened report container: ${replaced} rule(s) -> max-width:${target}`);
  } else {
    // Not fatal, but worth surfacing: it almost certainly means an Allure upgrade
    // changed the value, and the report has quietly gone back to a narrow column.
    console.warn(
      '[allure] No "max-width:920px" rule found — Allure may have changed its layout CSS. ' +
        'Re-check widenReportLayout() in scripts/generate-allure-report.ts.',
    );
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

/**
 * Records the location on results whose test never reached `annotate()`.
 *
 * A test that fails inside `beforeEach` reports no labels of its own, so it
 * arrives without the location its pass ran under. Called per pass, where
 * LOCATION is known, rather than at report time, where a single value would have
 * to stand for every pass. Leaves an existing label alone so the 'ALL' that
 * location-agnostic specs declare survives.
 */
export function recordPassLocation(resultsDir: string, location: string): void {
  if (!location) {
    return;
  }

  for (const resultPath of collectResultFiles(resultsDir)) {
    try {
      const result = JSON.parse(fs.readFileSync(resultPath, 'utf8')) as AllureResultFile;
      const labels = result.labels ?? [];

      if (labels.some((label) => label.name === EPIC_LABEL)) {
        continue;
      }

      // A location-agnostic spec runs once per platform and belongs under ALL
      // whichever pass happened to execute it, so it must not inherit that
      // pass's country.
      const spec = labels.find((label) => label.name === SUITE_LABEL)?.value ?? '';
      const value = LOCATION_AGNOSTIC_SPEC_GLOBS.some((glob) => glob.endsWith(spec) && spec)
        ? AGNOSTIC_LOCATION
        : location;

      result.labels = [...labels, { name: EPIC_LABEL, value }];
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    } catch (error) {
      console.warn(`Unable to record the location label for ${resultPath}:`, error);
    }
  }
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
    enrichRunLabels(dir, {
      runType,
      platform: getPlatformForResultsDir(dir),
      location: getEnv('LOCATION').trim().toUpperCase(),
    });
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
        ALLURE_REPORT_NAME: `Mattamy Homes Automation (${getSuiteName(path.basename(reportDir))})`,
      },
    },
  );

  widenReportLayout(reportDir);
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
