import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import nodemailer from 'nodemailer';
import {
  DESKTOP_ALLURE_REPORT_DIR,
  DESKTOP_ALLURE_RESULTS_DIR,
  MERGED_ALLURE_REPORT_DIR,
  MOBILE_ALLURE_RESULTS_DIR,
  getPlatformCoverage,
} from './allurePaths';
import { loadEnv } from '../config/env';
import { getBrowserCoverageLabel } from '../config/browserSelection';
import { getEnvConfig } from '../config/environments/envConfig';

loadEnv();

type TestStatus = 'passed' | 'failed' | 'broken' | 'skipped' | 'unknown';

type AllureResult = {
  uuid?: string;
  name?: string;
  fullName?: string;
  historyId?: string;
  testCaseId?: string;
  status?: TestStatus;
  statusDetails?: {
    message?: string;
    trace?: string;
  };
  start?: number;
  stop?: number;
  labels?: Array<{
    name?: string;
    value?: string;
  }>;
};

type AllureReportSummary = {
  statistic?: Partial<Record<TestStatus | 'total', number>>;
} & Partial<Record<TestStatus | 'total', number>>;

type AllureReportError = {
  message?: string;
  trace?: string;
};

type AllureReportStep = {
  status?: TestStatus;
  error?: AllureReportError;
  message?: string;
  trace?: string;
  steps?: AllureReportStep[];
};

type AllureReportTestCase = {
  name?: string;
  fullName?: string;
  status?: TestStatus;
  /** True on a superseded attempt. Allure writes every attempt to `data/test-results`, but counts only the final one. */
  isRetry?: boolean;
  /** How many superseded attempts this final result has; above zero means the test only settled on a retry. */
  retriesCount?: number;
  /** The superseded attempts themselves, newest first - where a flaky test's failure text lives. */
  retries?: AllureReportTestCase[];
  error?: AllureReportError;
  steps?: AllureReportStep[];
  setup?: AllureReportStep[];
  teardown?: AllureReportStep[];
  labels?: Array<{
    name?: string;
    value?: string;
  }>;
};

type ExecutionSummary = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  /** Tests a retry turned green - counted under Passed, and listed on their own so they stay visible. */
  flaky: number;
  passPercentage: number;
  environment: string;
  browser: string;
  executionDateTime: string;
  reportUrl: string;
  /** Root of the published report site — the catalog of all retained builds. */
  reportSiteUrl: string;
  /** CI build number this report belongs to; empty for local runs. */
  buildNumber: string;
  runType: string;
  /** Every scenario that was still red after its last attempt. */
  failedTests: ReportedTest[];
  /** Every scenario that failed an attempt and then passed - counted as passed, reported as flaky. */
  flakyTests: ReportedTest[];
  /** Every scenario that did not run, with the reason it was skipped. Never folded into passed. */
  skippedTests: ReportedTest[];
};

type ReportedTest = {
  name: string;
  /** Spec file and line, shown under the scenario name; empty when it is the only label available. */
  location: string;
  message: string;
  /** True when a retry of this scenario went on to pass - counted as passed, reported, not excused. */
  recoveredOnRetry: boolean;
};

const chartPath = path.resolve(os.tmpdir(), 'test-summary-chart.png');
/** ANSI color codes Playwright wraps around error text; built at runtime to keep the escape character out of source. */
const ANSI_ESCAPE_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const MAX_ERROR_SUMMARY_LENGTH = 300;
/** Machine detail Playwright prints beside the message: locator dumps, matcher calls, stack frames, call-log bullets. */
const MACHINE_DETAIL_PATTERN =
  /^(?:locator|expected|received|timeout|call log|snapshot|attachment|diff|selector|error message)\s*:|^(?:at\s|[-–+]\s|expect[\s(])/i;
/** A leading "Error:" / "AssertionError:" label adds nothing once the line stands on its own. */
const ERROR_LABEL_PATTERN = /^(?:[A-Za-z]*Error|Failed|Failure)\s*:\s*/;
/** A line still carrying code - matchers, locators, chained calls, markup - is not a readable summary. */
const CODE_FRAGMENT_PATTERN =
  /expect\(|locator\(|page\.[a-z]+\(|=>|\$\{|<\/?[a-z][^>]*>|\)\.(?:first|last|nth)\(/i;
const chartCid = 'test-summary-chart';
const RUN_TYPE_LABEL = 'runType';
/**
 * CI runners are UTC, so an unlabeled timestamp read as an hour - and for the 03:30 UTC nightly,
 * a whole calendar day - off from when the run was actually seen. Stamp the report in Central
 * time and keep the CST/CDT label, which also makes the daylight-saving shift visible rather
 * than looking like the schedule moved on its own.
 */
const REPORT_TIME_ZONE = 'America/Chicago';
const RUN_TYPE_BY_KEY: Record<string, string> = {
  ci: 'CI',
  smoke: 'Smoke',
  regression: 'Regression',
  full: 'Full',
};

function getEnv(name: string, fallback = ''): string {
  return process.env[name]?.trim() || fallback;
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function maskEmailList(value: string): string {
  const emails = parseList(value);
  if (emails.length === 0) {
    return 'not configured';
  }

  return `${emails.length} recipient(s) configured`;
}

function isGmailHost(host: string): boolean {
  return /gmail\.com$/i.test(host) || /smtp\.googlemail\.com$/i.test(host);
}

function buildSmtpHelpMessage(host: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (
    isGmailHost(host) &&
    /535|BadCredentials|Username and Password not accepted|EAUTH/i.test(message)
  ) {
    return [
      'Gmail SMTP authentication failed.',
      'Verify that EMAIL_USER is the full Gmail address and EMAIL_PASSWORD is a current Google App Password for that account.',
      'Regular Gmail account passwords usually fail here, especially when 2-Step Verification is enabled.',
      'After rotating the App Password in Google Account settings, update the GitHub Actions secret EMAIL_PASSWORD and rerun the workflow.',
    ].join(' ');
  }

  return `SMTP authentication failed for host "${host}". Verify EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, and EMAIL_PASSWORD.`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function collectJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const collected: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collected.push(...collectJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      collected.push(fullPath);
    }
  }

  return collected;
}

/**
 * The report the email summarizes: the merged web + mobile report when one was
 * built, else the desktop report.
 *
 * A run that covers a single platform never builds a merged report, so the
 * fallback keeps those emails working unchanged.
 */
function getSummaryReportDir(): string {
  const merged = path.join(MERGED_ALLURE_REPORT_DIR, 'awesome', 'widgets', 'statistic.json');

  return fs.existsSync(merged) ? MERGED_ALLURE_REPORT_DIR : DESKTOP_ALLURE_REPORT_DIR;
}

/**
 * The browser(s) the email header names, read from the platforms that actually
 * produced results rather than from BROWSER alone - the email summarizes the
 * whole run, so a web + mobile run named after the web engine understates it.
 */
function getCoveredBrowserLabel(): string {
  const { web, mobile } = getPlatformCoverage();
  return getBrowserCoverageLabel(web, mobile);
}

function readAllureResults(): AllureResult[] {
  const results: AllureResult[] = [];

  // Both platforms: the email covers the whole run, not one project.
  const resultFiles = [
    ...collectResultFiles(DESKTOP_ALLURE_RESULTS_DIR),
    ...collectResultFiles(MOBILE_ALLURE_RESULTS_DIR),
  ];

  if (resultFiles.length === 0) {
    console.warn(
      `Allure results folders not found or empty: ${DESKTOP_ALLURE_RESULTS_DIR}, ${MOBILE_ALLURE_RESULTS_DIR}`,
    );
    return results;
  }

  for (const resultPath of resultFiles) {
    try {
      results.push(JSON.parse(fs.readFileSync(resultPath, 'utf8')) as AllureResult);
    } catch (error) {
      console.warn(`Unable to read Allure result file ${resultPath}:`, error);
    }
  }

  return results;
}

function readAllureReportSummary(): AllureReportSummary | null {
  const summaryPath = path.join(getSummaryReportDir(), 'awesome', 'widgets', 'statistic.json');

  if (!fs.existsSync(summaryPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(summaryPath, 'utf8')) as AllureReportSummary;
  } catch (error) {
    console.warn(`Unable to read Allure report summary ${summaryPath}:`, error);
    return null;
  }
}

function readAllureReportTestCases(): AllureReportTestCase[] {
  const testCaseDir = path.join(getSummaryReportDir(), 'awesome', 'data', 'test-results');
  const testCases: AllureReportTestCase[] = [];

  for (const testCasePath of collectJsonFiles(testCaseDir)) {
    try {
      testCases.push(JSON.parse(fs.readFileSync(testCasePath, 'utf8')) as AllureReportTestCase);
    } catch (error) {
      console.warn(`Unable to read Allure report test case ${testCasePath}:`, error);
    }
  }

  return testCases;
}

/**
 * Playwright failure text arrives with ANSI color codes, matcher calls, locator dumps,
 * a stack trace, and a long "Call log" tail. An email reads as plain prose, so keep only
 * the human sentences and return an empty string when the failure carries none.
 */
function summarizeErrorText(message: string, trace: string): string {
  const lines = (message || trace)
    .replace(ANSI_ESCAPE_PATTERN, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Everything from "Call log:" onwards is the retry log, never a summary.
  const callLogIndex = lines.findIndex((line) => /^call log:/i.test(line));
  const meaningful = callLogIndex >= 0 ? lines.slice(0, callLogIndex) : lines;

  const prose = meaningful
    .filter((line) => !MACHINE_DETAIL_PATTERN.test(line))
    .map((line) => line.replace(ERROR_LABEL_PATTERN, '').trim())
    .filter((line) => line.length > 0 && !CODE_FRAGMENT_PATTERN.test(line));

  // Two sentences at most: the assertion message and the underlying cause.
  const summary = Array.from(new Set(prose))
    .slice(0, 2)
    .join(' - ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return summary.length > MAX_ERROR_SUMMARY_LENGTH
    ? `${summary.slice(0, MAX_ERROR_SUMMARY_LENGTH).trimEnd()}…`
    : summary;
}

/** A failing hook or step keeps its error off the test root, so walk nested steps too. */
function findStepError(steps: AllureReportStep[] | undefined): AllureReportError | null {
  for (const step of steps ?? []) {
    if (step.error?.message || step.error?.trace) {
      return step.error;
    }

    if (step.message || step.trace) {
      return { message: step.message, trace: step.trace };
    }

    const nestedError = findStepError(step.steps);
    if (nestedError) {
      return nestedError;
    }
  }

  return null;
}

/**
 * Error summary for a failed test: root error first, then the failing step, setup, or
 * teardown. Empty when no readable prose survives, so the email can hide the column.
 */
function getReportFailureMessage(testCase: AllureReportTestCase): string {
  const error =
    (testCase.error?.message || testCase.error?.trace ? testCase.error : null) ??
    findStepError(testCase.steps) ??
    findStepError(testCase.setup) ??
    findStepError(testCase.teardown);

  return error ? summarizeErrorText(error.message ?? '', error.trace ?? '') : '';
}

/**
 * Final attempts only. Allure writes one file per attempt into `data/test-results` and marks the
 * superseded ones `isRetry`, while `statistic.json` counts final attempts alone - so including
 * retries here listed scenarios under "Failed" that the counts reported as passed.
 */
function getVisibleTestCases(testCases: AllureReportTestCase[]): AllureReportTestCase[] {
  return testCases.filter((testCase) => !testCase.isRetry);
}

/** True for an attempt that ended red, whichever way Allure classified it. */
function isFailedStatus(status: TestStatus | undefined): boolean {
  return status === 'failed' || status === 'broken';
}

function describeReportTest(
  testCase: AllureReportTestCase,
  message: string,
  recoveredOnRetry: boolean,
): ReportedTest {
  return {
    name: testCase.name || testCase.fullName || 'Unnamed test',
    location: testCase.name && testCase.fullName ? testCase.fullName : '',
    message,
    recoveredOnRetry,
  };
}

/**
 * The error text for a scenario that failed, wherever the attempt that raised it
 * put it: on the test root, or - when a later attempt is the one on display - on
 * the most recent superseded attempt that ended red.
 */
function getReportErrorText(testCase: AllureReportTestCase): string {
  return (
    getReportFailureMessage(testCase) ||
    getReportFailureMessage(
      (testCase.retries ?? []).find((retry) => isFailedStatus(retry.status)) ?? {},
    )
  );
}

/**
 * The scenarios that were still red after their last attempt.
 *
 * A retry that also failed does not make a test flaky, so `recoveredOnRetry` is
 * false for every row here however many attempts it took to give up.
 */
function getReportFailedTests(testCases: AllureReportTestCase[]): ReportedTest[] {
  return testCases
    .filter((testCase) => isFailedStatus(testCase.status))
    .map((testCase) => describeReportTest(testCase, getReportErrorText(testCase), false));
}

/**
 * The scenarios that failed an attempt and then passed.
 *
 * `markRecoveredTestsAsFlaky()` leaves the surviving attempt passed, so these
 * arrive counted under Passed; `retriesCount` is what still identifies them, and
 * the failed attempt's error is carried through so the email can say what went
 * wrong before the retry cleared it.
 */
function getReportFlakyTests(testCases: AllureReportTestCase[]): ReportedTest[] {
  return testCases
    .filter((testCase) => testCase.status === 'passed' && (testCase.retriesCount ?? 0) > 0)
    .map((testCase) => describeReportTest(testCase, getReportErrorText(testCase), true));
}

/**
 * The reason a scenario did not run, as prose.
 *
 * A skip reason is already a written sentence, so it is trimmed rather than put
 * through the failure summarizer, which exists to strip locator dumps and stack
 * frames out of Playwright error text and would only chip away at this.
 */
function summarizeSkipReason(reason: string): string {
  const text = reason.replace(ANSI_ESCAPE_PATTERN, '').replace(/\s+/g, ' ').trim();

  return text.length > MAX_ERROR_SUMMARY_LENGTH
    ? `${text.slice(0, MAX_ERROR_SUMMARY_LENGTH).trimEnd()}…`
    : text;
}

/**
 * The scenarios that did not run, named with the reason each was skipped.
 *
 * Listed separately and never folded into passed: a skip is a scenario nobody
 * verified, and a country that does not surface a page reads very differently
 * from a check that was switched off and forgotten.
 */
function getReportSkippedTests(testCases: AllureReportTestCase[]): ReportedTest[] {
  return testCases
    .filter((testCase) => testCase.status === 'skipped')
    .map((testCase) =>
      describeReportTest(testCase, summarizeSkipReason(testCase.error?.message ?? ''), false),
    );
}

function getRunTypeFromEnv(): string {
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

function getRunTypeFromLabels(results: Array<Pick<AllureResult, 'labels'>>): string {
  for (const result of results) {
    const runType = result.labels?.find((label) => label.name === RUN_TYPE_LABEL)?.value;
    if (runType) {
      return runType;
    }
  }

  return getRunTypeFromEnv();
}

/**
 * Run timestamp in Central time, labeled. Falls back to a labeled UTC stamp if the runtime
 * ships without the timezone data - a missing timestamp must never cost us the whole email.
 */
function getExecutionDateTime(): string {
  const now = new Date();

  try {
    return now.toLocaleString('en-US', {
      timeZone: REPORT_TIME_ZONE,
      timeZoneName: 'short',
    });
  } catch (error) {
    console.warn(`Unable to format the execution time as ${REPORT_TIME_ZONE}:`, error);
    return `${now.toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;
  }
}

function getPassPercentage(passed: number, failed: number, broken: number): number {
  const executed = passed + failed + broken;
  return executed > 0 ? Math.round((passed / executed) * 100) : 0;
}

function getResultKey(result: AllureResult): string {
  return (
    result.historyId ||
    result.testCaseId ||
    result.fullName ||
    result.name ||
    result.uuid ||
    'unknown'
  );
}

function getResultTimestamp(result: AllureResult): number {
  return result.stop ?? result.start ?? 0;
}

function dedupeRetries(results: AllureResult[]): AllureResult[] {
  const latestByTest = new Map<string, AllureResult>();

  for (const result of results) {
    const key = getResultKey(result);
    const current = latestByTest.get(key);

    if (!current || getResultTimestamp(result) >= getResultTimestamp(current)) {
      latestByTest.set(key, result);
    }
  }

  return Array.from(latestByTest.values());
}

function buildSummaryFromCounts(
  counts: {
    passed: number;
    failed: number;
    broken: number;
    skipped: number;
    total: number;
  },
  tests: { failed: ReportedTest[]; flaky: ReportedTest[]; skipped: ReportedTest[] },
  runType: string,
): ExecutionSummary {
  const failed = counts.failed + counts.broken;
  const passPercentage = getPassPercentage(counts.passed, counts.failed, counts.broken);

  return {
    total: counts.total,
    passed: counts.passed,
    failed,
    skipped: counts.skipped,
    flaky: tests.flaky.length,
    passPercentage,
    environment: getEnvConfig().envName,
    browser: getCoveredBrowserLabel(),
    executionDateTime: getExecutionDateTime(),
    reportUrl: getEnv('ALLURE_REPORT_URL', ''),
    reportSiteUrl: getEnv('ALLURE_REPORT_SITE_URL', ''),
    buildNumber: getEnv('BUILD_NUMBER', getEnv('GITHUB_RUN_NUMBER', '')),
    runType,
    failedTests: tests.failed,
    flakyTests: tests.flaky,
    skippedTests: tests.skipped,
  };
}

function buildSummaryFromReport(): ExecutionSummary | null {
  const reportSummary = readAllureReportSummary();
  const statistic = reportSummary?.statistic ?? reportSummary;

  if (!statistic || typeof statistic.total !== 'number') {
    return null;
  }

  const testCases = getVisibleTestCases(readAllureReportTestCases());

  return buildSummaryFromCounts(
    {
      passed: statistic.passed ?? 0,
      failed: statistic.failed ?? 0,
      broken: statistic.broken ?? 0,
      skipped: statistic.skipped ?? 0,
      total: statistic.total,
    },
    {
      failed: getReportFailedTests(testCases),
      flaky: getReportFlakyTests(testCases),
      skipped: getReportSkippedTests(testCases),
    },
    getRunTypeFromLabels(testCases),
  );
}

/** Every attempt recorded per test, so a retry cannot hide the attempt that failed. */
function groupAttemptsByTest(results: AllureResult[]): Map<string, AllureResult[]> {
  const attempts = new Map<string, AllureResult[]>();

  for (const result of results) {
    const key = getResultKey(result);
    attempts.set(key, [...(attempts.get(key) ?? []), result]);
  }

  return attempts;
}

function describeResult(
  result: AllureResult,
  failedAttempt: AllureResult,
  recoveredOnRetry: boolean,
): ReportedTest {
  return {
    name: result.name || result.fullName || 'Unnamed test',
    location: result.name && result.fullName ? result.fullName : '',
    message: summarizeErrorText(
      failedAttempt.statusDetails?.message ?? '',
      failedAttempt.statusDetails?.trace ?? '',
    ),
    recoveredOnRetry,
  };
}

/**
 * Summary straight from the raw results, for a run whose report was not built.
 *
 * It applies the rule `markRecoveredTestsAsFlaky()` writes into the results the
 * report is generated from - a test that failed an attempt and then passed is
 * flaky and counts as passed, one still red after its last attempt is failed -
 * so the two paths cannot disagree about whether a run was clean.
 */
function buildSummaryFromResults(results: AllureResult[]): ExecutionSummary {
  const finalResults = dedupeRetries(results);
  const attemptsByTest = groupAttemptsByTest(results);

  const outcomes = finalResults.map((result) => {
    const failedAttempt = (attemptsByTest.get(getResultKey(result)) ?? []).find((attempt) =>
      isFailedStatus(attempt.status),
    );

    return {
      result,
      failedAttempt,
      // The surviving attempt decides the outcome; the error is still read off
      // the attempt that raised it, because a recovered test's final attempt
      // passed and carries no failure text of its own.
      status: result.status,
      recoveredOnRetry: Boolean(failedAttempt) && result.status === 'passed',
    };
  });

  const describeFailure = (outcome: (typeof outcomes)[number]): ReportedTest =>
    describeResult(
      outcome.result,
      outcome.failedAttempt ?? outcome.result,
      outcome.recoveredOnRetry,
    );

  const failedTests = outcomes
    .filter((outcome) => isFailedStatus(outcome.status))
    .map(describeFailure);

  const flakyTests = outcomes.filter((outcome) => outcome.recoveredOnRetry).map(describeFailure);

  const skippedTests = outcomes
    .filter((outcome) => outcome.status === 'skipped')
    .map((outcome) => ({
      ...describeResult(outcome.result, outcome.result, false),
      message: summarizeSkipReason(outcome.result.statusDetails?.message ?? ''),
    }));

  return buildSummaryFromCounts(
    {
      passed: outcomes.filter((outcome) => outcome.status === 'passed').length,
      failed: outcomes.filter((outcome) => outcome.status === 'failed').length,
      broken: outcomes.filter((outcome) => outcome.status === 'broken').length,
      skipped: outcomes.filter((outcome) => outcome.status === 'skipped').length,
      total: finalResults.length,
    },
    { failed: failedTests, flaky: flakyTests, skipped: skippedTests },
    getRunTypeFromLabels(finalResults),
  );
}

function buildSummary(results: AllureResult[]): ExecutionSummary {
  const reportSummary = buildSummaryFromReport();

  if (reportSummary) {
    return reportSummary;
  }

  return buildSummaryFromResults(results);
}

async function generateChart(summary: ExecutionSummary): Promise<string> {
  const chart = new ChartJSNodeCanvas({
    width: 720,
    height: 420,
    backgroundColour: 'white',
  });

  const buffer = await chart.renderToBuffer({
    type: 'doughnut',
    data: {
      labels: ['Passed', 'Failed', 'Skipped'],
      datasets: [
        {
          data: [summary.passed, summary.failed, summary.skipped],
          backgroundColor: ['#16a34a', '#dc2626', '#f59e0b'],
          borderColor: ['#ffffff', '#ffffff', '#ffffff'],
          borderWidth: 4,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#172033',
            font: {
              size: 16,
            },
          },
        },
        title: {
          display: true,
          text: `Execution Result - ${summary.passPercentage}% Passed`,
          color: '#172033',
          font: {
            size: 22,
            weight: 'bold',
          },
        },
      },
    },
  });

  fs.writeFileSync(chartPath, buffer);
  return chartPath;
}

function renderSummaryRows(summary: ExecutionSummary): string {
  const rows: Array<[string, string | number]> = [
    ...(summary.buildNumber ? [['Build', `#${summary.buildNumber}`] as [string, string]] : []),
    ['Total Tests', summary.total],
    ['Passed Tests', summary.passed],
    ['Failed Tests', summary.failed],
    ['Skipped Tests', summary.skipped],
    // Only worth a row when it happened - a permanent "0" reads as noise. These
    // are counted in Passed above; the row says how many of those needed a retry
    // to get there, which is the difference between a healthy suite and an
    // unstable one.
    ...(summary.flaky
      ? [['Flaky Tests (of which passed on retry)', summary.flaky] as [string, number]]
      : []),
    ['Pass Percentage', `${summary.passPercentage}%`],
    ['Environment', summary.environment],
    ['Browser', summary.browser],
    ['Run Type', summary.runType],
    ['Execution Date/Time', summary.executionDateTime],
  ];

  return rows
    .map(
      ([label, value]) => `
        <tr>
          <th>${escapeHtml(String(label))}</th>
          <td>${escapeHtml(String(value))}</td>
        </tr>
      `,
    )
    .join('');
}

/**
 * A table of scenarios and the error each one raised.
 *
 * Shared by the failed and the flaky sections: the two differ in what the reader
 * is being asked to do about them, not in what there is to show. With no
 * readable message on any row the error column is dead weight, so it is dropped
 * and the scenarios are listed alone.
 */
function renderScenarioTable(tests: ReportedTest[], heading: string): string {
  const hasErrorSummary = tests.some((test) => test.message.trim().length > 0);

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>${escapeHtml(heading)}</th>
          ${hasErrorSummary ? '<th>Error Summary</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${tests
          .map(
            (test, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  ${escapeHtml(test.name)}
                  ${test.location ? `<div class="scenario-location">${escapeHtml(test.location)}</div>` : ''}
                  ${test.recoveredOnRetry ? '<div class="retry-note">Passed on retry</div>' : ''}
                </td>
                ${hasErrorSummary ? `<td class="error-cell">${escapeHtml(test.message.trim()) || '&mdash;'}</td>` : ''}
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

/** The scenarios that were still red after their last attempt. */
function renderFailedTests(summary: ExecutionSummary): string {
  if (summary.failedTests.length === 0) {
    return '<p class="empty-state">No failed scenarios were found.</p>';
  }

  return renderScenarioTable(summary.failedTests, 'Failed Scenario');
}

/**
 * The scenarios a retry rescued, with the error the first attempt raised.
 *
 * A section of its own rather than a line in the totals: these count as passed,
 * so without it the only trace of the failure would be inside the Allure report.
 * The error is what says whether the run hit a real defect that happened to
 * clear or an unstable selector, and neither is excused by the retry. Present
 * only when a test actually recovered.
 */
function renderFlakyTests(summary: ExecutionSummary): string {
  if (summary.flakyTests.length === 0) {
    return '';
  }

  return `
    <h2>Flaky Scenarios</h2>
    <p>These failed an attempt and passed on retry. They are counted under Passed.</p>
    ${renderScenarioTable(summary.flakyTests, 'Flaky Scenario')}
  `;
}

/**
 * The scenarios nobody verified, with the reason each one was stood down.
 *
 * A section of its own rather than a line in the totals: the count says how many
 * went unchecked, and only the reasons say whether that was the intended
 * coverage. Present only when a test was skipped.
 */
function renderSkippedTests(summary: ExecutionSummary): string {
  if (summary.skippedTests.length === 0) {
    return '';
  }

  const hasReason = summary.skippedTests.some((test) => test.message.trim().length > 0);

  return `
            <h2>Skipped Scenarios</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Skipped Scenario</th>
                  ${hasReason ? '<th>Reason</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${summary.skippedTests
                  .map(
                    (test, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>
                          ${escapeHtml(test.name)}
                          ${test.location ? `<div class="scenario-location">${escapeHtml(test.location)}</div>` : ''}
                        </td>
                        ${hasReason ? `<td class="reason-cell">${escapeHtml(test.message.trim()) || '&mdash;'}</td>` : ''}
                      </tr>
                    `,
                  )
                  .join('')}
              </tbody>
            </table>
  `;
}

/**
 * Subject line that identifies the run on its own, so a mailbox full of reports
 * stays readable: "Automation Report - Regression - STAGE - Build #142 - 96% Passed".
 */
function buildSubject(summary: ExecutionSummary): string {
  return [
    'Automation Report',
    summary.runType,
    summary.environment,
    summary.buildNumber ? `Build #${summary.buildNumber}` : null,
    `${summary.passPercentage}% Passed`,
  ]
    .filter(Boolean)
    .join(' - ');
}

function buildEmailHtml(summary: ExecutionSummary): string {
  // const buildLabel = summary.buildNumber ? ` (Build #${summary.buildNumber})` : '';
  // ${escapeHtml(buildLabel)}
  const reportLink = summary.reportUrl
    ? `<a class="button" href="${escapeHtml(summary.reportUrl)}" target="_blank" rel="noopener noreferrer">View Full Report</a>`
    : '<span class="missing-link">Report link not configured</span>';

  // The catalog link is what makes previous runs reachable — this build's report
  // stays at its own permanent URL, and the catalog lists every retained build.
  const siteLink = summary.reportSiteUrl
    ? `<p><a href="${escapeHtml(summary.reportSiteUrl)}" target="_blank" rel="noopener noreferrer">Browse all previous builds</a></p>`
    : '';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f3f5f8;
            color: #172033;
            font-family: Arial, Helvetica, sans-serif;
          }
          .container {
            max-width: 840px;
            margin: 0 auto;
            padding: 28px 18px;
          }
          .panel {
            background: #ffffff;
            border: 1px solid #dce2ea;
            border-radius: 8px;
            padding: 28px;
          }
          h1 {
            margin: 0 0 12px;
            color: #0f2747;
            font-size: 26px;
          }
          h2 {
            margin: 28px 0 12px;
            color: #0f2747;
            font-size: 18px;
          }
          p {
            line-height: 1.55;
          }
          .metric-row {
            margin: 22px 0;
          }
          .metric {
            display: inline-block;
            width: 18.4%;
            min-width: 118px;
            margin: 0 1% 12px 0;
            padding: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-sizing: border-box;
          }
          .metric strong {
            display: block;
            margin-top: 6px;
            font-size: 24px;
            color: #0f2747;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          .data-table th,
          .data-table td {
            padding: 12px;
            border: 1px solid #dce2ea;
            text-align: left;
            vertical-align: top;
          }
          .data-table th {
            background: #eef3f8;
            color: #0f2747;
          }
          .chart {
            display: block;
            max-width: 100%;
            margin: 16px auto;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          .button {
            display: inline-block;
            margin-top: 14px;
            padding: 12px 18px;
            background: #0f5da8;
            color: #ffffff !important;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
          }
          .scenario-location {
            margin-top: 4px;
            color: #64748b;
            font-size: 12px;
          }
          .retry-note {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 8px;
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 10px;
            color: #92400e;
            font-size: 11px;
          }
          .reason-cell {
            color: #92400e;
            font-size: 13px;
            word-break: break-word;
          }
          .error-cell {
            color: #b91c1c;
            font-size: 13px;
            word-break: break-word;
          }
          .missing-link,
          .empty-state {
            color: #64748b;
            font-style: italic;
          }
          .footer {
            margin-top: 28px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="panel">
            <h1>Mattamy Homes Automation Test Execution Report</h1>
            <p>Hi Team,</p>
            <p>The automation test execution has been completed in ${escapeHtml(summary.environment)}. Please find the execution summary below.</p>

            <div class="metric-row">
              <div class="metric">Total<strong>${summary.total}</strong></div>
              <div class="metric">Passed<strong>${summary.passed}</strong></div>
              <div class="metric">Failed<strong>${summary.failed}</strong></div>
              <div class="metric">Skipped<strong>${summary.skipped}</strong></div>
              ${summary.flaky ? `<div class="metric">Flaky<strong>${summary.flaky}</strong></div>` : ''}
              <div class="metric">Pass %<strong>${summary.passPercentage}%</strong></div>
            </div>

            <h2>Execution Summary</h2>
            <table class="data-table">
              <tbody>${renderSummaryRows(summary)}</tbody>
            </table>

            <h2>Execution Chart</h2>
            <img class="chart" src="cid:${chartCid}" alt="Passed, failed, and skipped test chart" />

            <h2>Failed Scenarios</h2>
            ${renderFailedTests(summary)}
            ${renderFlakyTests(summary)}
            ${renderSkippedTests(summary)}

            <h2>Allure HTML Report</h2>
            ${reportLink}
            ${siteLink}

            <p class="footer">Regards,<br />QA Automation Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function sendEmail(summary: ExecutionSummary, chartFilePath: string): Promise<boolean> {
  const host = getEnv('EMAIL_HOST');
  const port = Number(getEnv('EMAIL_PORT', '587'));
  const user = getEnv('EMAIL_USER');
  const rawPassword = getEnv('EMAIL_PASSWORD');
  const password = isGmailHost(host) ? rawPassword.replace(/\s+/g, '') : rawPassword;
  const from = getEnv('EMAIL_FROM', user);
  const to = parseList(getEnv('EMAIL_TO'));
  const cc = parseList(getEnv('EMAIL_CC'));
  const secure = getEnv('EMAIL_SECURE', 'false').toLowerCase() === 'true';

  const missing = [
    ['EMAIL_HOST', host],
    ['EMAIL_USER', user],
    ['EMAIL_PASSWORD', password],
    ['EMAIL_FROM', from],
    ['EMAIL_TO', to.join(',')],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    console.warn(
      `Email report skipped. Missing required environment variables: ${missing.map(([name]) => name).join(', ')}`,
    );
    return false;
  }

  console.log('Email SMTP configuration:', {
    host,
    port,
    secure,
    userConfigured: Boolean(user),
    fromConfigured: Boolean(from),
    to: maskEmailList(getEnv('EMAIL_TO')),
    cc: maskEmailList(getEnv('EMAIL_CC')),
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: password,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully.');
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    const wrappedError = new Error(buildSmtpHelpMessage(host, error));
    (wrappedError as Error & { cause?: unknown }).cause = error;
    throw wrappedError;
  }

  await transporter.sendMail({
    from,
    to,
    cc: cc.length > 0 ? cc : undefined,
    subject: buildSubject(summary),
    html: buildEmailHtml(summary),
    attachments: [
      {
        filename: 'test-summary-chart.png',
        path: chartFilePath,
        cid: chartCid,
      },
    ],
  });

  return true;
}

export async function sendAllureEmailReport(): Promise<void> {
  const results = readAllureResults();
  const summary = buildSummary(results);
  const generatedChartPath = await generateChart(summary);

  console.log('Automation execution summary:', {
    total: summary.total,
    passed: summary.passed,
    failed: summary.failed,
    skipped: summary.skipped,
    flaky: summary.flaky,
    passPercentage: summary.passPercentage,
    environment: summary.environment,
    browser: summary.browser,
    runType: summary.runType,
    buildNumber: summary.buildNumber || 'local run',
    reportUrl: summary.reportUrl || 'Report link not configured',
  });

  const emailSent = await sendEmail(summary, generatedChartPath);
  console.log(
    emailSent ? 'Automation report email sent successfully.' : 'Automation report email skipped.',
  );
}

if (require.main === module) {
  sendAllureEmailReport().catch((error) => {
    console.error('Failed to send automation report email:', error);
    process.exitCode = 1;
  });
}
