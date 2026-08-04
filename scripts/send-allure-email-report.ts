import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import nodemailer from 'nodemailer';
import { DESKTOP_ALLURE_REPORT_DIR, DESKTOP_ALLURE_RESULTS_DIR } from './allurePaths';
import { loadEnv } from '../config/env';
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

type AllureReportTestCase = {
  name?: string;
  fullName?: string;
  status?: TestStatus;
  statusMessage?: string;
  statusTrace?: string;
  labels?: Array<{
    name?: string;
    value?: string;
  }>;
  testStage?: {
    statusMessage?: string;
    statusTrace?: string;
  };
};

type ExecutionSummary = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passPercentage: number;
  environment: string;
  browser: string;
  executionDateTime: string;
  reportUrl: string;
  runType: string;
  failedTests: Array<{
    name: string;
    message: string;
  }>;
};

const chartPath = path.resolve(os.tmpdir(), 'test-summary-chart.png');
const chartCid = 'test-summary-chart';
const RUN_TYPE_LABEL = 'runType';
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

function readAllureResults(): AllureResult[] {
  const results: AllureResult[] = [];

  const resultFiles = collectResultFiles(DESKTOP_ALLURE_RESULTS_DIR);

  if (resultFiles.length === 0) {
    console.warn(`Allure results folder not found or empty: ${DESKTOP_ALLURE_RESULTS_DIR}`);
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
  const summaryPath = path.join(DESKTOP_ALLURE_REPORT_DIR, 'awesome', 'widgets', 'statistic.json');

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

function readAllureReportFailedTests(): ExecutionSummary['failedTests'] {
  const testCaseDir = path.join(DESKTOP_ALLURE_REPORT_DIR, 'awesome', 'data', 'test-results');
  const failedTests: ExecutionSummary['failedTests'] = [];

  for (const testCasePath of collectJsonFiles(testCaseDir)) {
    try {
      const testCase = JSON.parse(fs.readFileSync(testCasePath, 'utf8')) as AllureReportTestCase;

      if (testCase.status !== 'failed' && testCase.status !== 'broken') {
        continue;
      }

      failedTests.push({
        name: testCase.fullName || testCase.name || 'Unnamed test',
        message:
          testCase.statusMessage ||
          testCase.testStage?.statusMessage ||
          testCase.statusTrace ||
          testCase.testStage?.statusTrace ||
          'No failure message available',
      });
    } catch (error) {
      console.warn(`Unable to read Allure report test case ${testCasePath}:`, error);
    }
  }

  return failedTests;
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

function readAllureReportRunType(): string {
  const testCaseDir = path.join(DESKTOP_ALLURE_REPORT_DIR, 'awesome', 'data', 'test-results');
  const testCases: AllureReportTestCase[] = [];

  for (const testCasePath of collectJsonFiles(testCaseDir)) {
    try {
      testCases.push(JSON.parse(fs.readFileSync(testCasePath, 'utf8')) as AllureReportTestCase);
    } catch (error) {
      console.warn(`Unable to read Allure report test case ${testCasePath}:`, error);
    }
  }

  return getRunTypeFromLabels(testCases);
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
  counts: { passed: number; failed: number; broken: number; skipped: number; total: number },
  failedTests: ExecutionSummary['failedTests'],
  runType: string,
): ExecutionSummary {
  const failed = counts.failed + counts.broken;
  const passPercentage = getPassPercentage(counts.passed, counts.failed, counts.broken);

  return {
    total: counts.total,
    passed: counts.passed,
    failed,
    skipped: counts.skipped,
    passPercentage,
    environment: getEnvConfig().envName,
    browser: getEnv('BROWSER', 'Chrome'),
    executionDateTime: new Date().toLocaleString('en-US'),
    reportUrl: getEnv('ALLURE_REPORT_URL', ''),
    runType,
    failedTests,
  };
}

function buildSummaryFromReport(): ExecutionSummary | null {
  const reportSummary = readAllureReportSummary();
  const statistic = reportSummary?.statistic ?? reportSummary;

  if (!statistic || typeof statistic.total !== 'number') {
    return null;
  }

  return buildSummaryFromCounts(
    {
      passed: statistic.passed ?? 0,
      failed: statistic.failed ?? 0,
      broken: statistic.broken ?? 0,
      skipped: statistic.skipped ?? 0,
      total: statistic.total,
    },
    readAllureReportFailedTests(),
    readAllureReportRunType(),
  );
}

function buildSummaryFromResults(results: AllureResult[]): ExecutionSummary {
  const finalResults = dedupeRetries(results);
  const passed = finalResults.filter((result) => result.status === 'passed').length;
  const failedCount = finalResults.filter((result) => result.status === 'failed').length;
  const broken = finalResults.filter((result) => result.status === 'broken').length;
  const skipped = finalResults.filter((result) => result.status === 'skipped').length;
  const total = finalResults.length;
  const failedTests = finalResults
    .filter((result) => result.status === 'failed' || result.status === 'broken')
    .map((result) => ({
      name: result.fullName || result.name || 'Unnamed test',
      message: result.statusDetails?.message || 'No failure message available',
    }));

  return buildSummaryFromCounts(
    {
      passed,
      failed: failedCount,
      broken,
      skipped,
      total,
    },
    failedTests,
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
  const rows = [
    ['Total Tests', summary.total],
    ['Passed Tests', summary.passed],
    ['Failed Tests', summary.failed],
    ['Skipped Tests', summary.skipped],
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

function renderFailedTests(summary: ExecutionSummary): string {
  if (summary.failedTests.length === 0) {
    return '<p class="empty-state">No failed scenarios were found.</p>';
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Failed Scenario</th>
          <th>Error Summary</th>
        </tr>
      </thead>
      <tbody>
        ${summary.failedTests
          .map(
            (test, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(test.name)}</td>
                <td>${escapeHtml(test.message).slice(0, 500)}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function buildEmailHtml(summary: ExecutionSummary): string {
  const reportLink = summary.reportUrl
    ? `<a class="button" href="${escapeHtml(summary.reportUrl)}" target="_blank" rel="noopener noreferrer">View Allure HTML Report</a>`
    : '<span class="missing-link">Report link not configured</span>';

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
            width: 23%;
            min-width: 130px;
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
            <h1>Automation Test Execution Report</h1>
            <p>Hi Team,</p>
            <p>The automation test execution has been completed. Please find the execution summary below.</p>

            <div class="metric-row">
              <div class="metric">Total<strong>${summary.total}</strong></div>
              <div class="metric">Passed<strong>${summary.passed}</strong></div>
              <div class="metric">Failed<strong>${summary.failed}</strong></div>
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

            <h2>Allure HTML Report</h2>
            ${reportLink}

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
    subject: `Automation Test Execution Report - ${summary.environment} - ${summary.passPercentage}% Passed`,
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
    passPercentage: summary.passPercentage,
    environment: summary.environment,
    browser: summary.browser,
    runType: summary.runType,
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
