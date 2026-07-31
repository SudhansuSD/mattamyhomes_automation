import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import nodemailer from 'nodemailer';
import { ALLURE_RESULTS_ROOT } from './allurePaths';
import { loadEnv } from '../config/env';

loadEnv();

type TestStatus = 'passed' | 'failed' | 'skipped' | 'unknown';

type AllureResult = {
  name?: string;
  fullName?: string;
  status?: TestStatus | 'broken';
  statusDetails?: {
    message?: string;
    trace?: string;
  };
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
  passPercentage: number;
  environment: string;
  browser: string;
  executionDateTime: string;
  reportUrl: string;
  failedTests: Array<{
    name: string;
    message: string;
  }>;
};

const repoRoot = path.resolve(__dirname, '..');
const chartPath = path.resolve(os.tmpdir(), 'test-summary-chart.png');
const chartCid = 'test-summary-chart';

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

function readAllureResults(): AllureResult[] {
  const results: AllureResult[] = [];

  const resultFiles = collectResultFiles(ALLURE_RESULTS_ROOT);

  if (resultFiles.length === 0) {
    console.warn(`Allure results folder not found or empty: ${ALLURE_RESULTS_ROOT}`);
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

function buildSummary(results: AllureResult[]): ExecutionSummary {
  const passed = results.filter((result) => result.status === 'passed').length;
  const failed = results.filter(
    (result) => result.status === 'failed' || result.status === 'broken',
  ).length;
  const skipped = results.filter((result) => result.status === 'skipped').length;
  const total = results.length;
  const passPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failedTests = results
    .filter((result) => result.status === 'failed' || result.status === 'broken')
    .map((result) => ({
      name: result.fullName || result.name || 'Unnamed test',
      message: result.statusDetails?.message || 'No failure message available',
    }));

  return {
    total,
    passed,
    failed,
    skipped,
    passPercentage,
    environment: getEnv('TEST_ENV', getEnv('ENV', 'Not configured')),
    browser: getEnv('BROWSER', 'Chrome'),
    executionDateTime: new Date().toLocaleString('en-US'),
    reportUrl: getEnv('ALLURE_REPORT_URL', ''),
    failedTests,
  };
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
