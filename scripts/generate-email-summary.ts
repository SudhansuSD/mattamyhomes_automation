import fs from 'node:fs';
import path from 'node:path';

type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

type TestCase = {
  id: string;
  title: string;
  module: string;
  status: TestStatus;
  failureReason: string;
};

type ModuleSummary = {
  module: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
};

const repoRoot = process.cwd();
const resultsPath = path.join(repoRoot, 'test-results', 'results.json');
const reportsDir = path.join(repoRoot, 'reports');
const outputPath = path.join(reportsDir, 'email-summary.html');

const envName = (process.env.ENV || process.env.TEST_ENV || 'STAGE').toUpperCase();
const locationName = (process.env.LOCATION || process.env.TEST_LOCATION || 'CAN').toUpperCase();
const suiteName = toTitleCase(process.env.TEST_SUITE || 'smoke');
const runUrl = process.env.GITHUB_RUN_URL || '';
const runActor = process.env.GITHUB_ACTOR || 'GitHub Actions';
const baseUrl = envName === 'PROD'
  ? 'https://www.mattamyhomes.com'
  : 'https://stagemh-sc.exsquared.com';

fs.mkdirSync(reportsDir, { recursive: true });

const results = readResults();
const cases = collectCases(results);
const modules = summarizeModules(cases);
const summary = summarizeCases(cases, results);
const failedCases = cases.filter(testCase => testCase.status === 'failed').slice(0, 20);

fs.writeFileSync(outputPath, buildHtml(summary, modules, failedCases), 'utf8');
console.log(`Email summary generated: ${outputPath}`);

function readResults(): any {
  if (!fs.existsSync(resultsPath)) {
    return { suites: [], stats: {}, errors: [{ message: 'Playwright results.json was not generated.' }] };
  }

  return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
}

function collectCases(report: any): TestCase[] {
  const collected: TestCase[] = [];
  let counter = 1;

  const visitSuite = (suite: any): void => {
    for (const spec of suite.specs || []) {
      const testCase = mapSpec(spec, counter);
      collected.push(testCase);
      counter += 1;
    }

    for (const child of suite.suites || []) {
      visitSuite(child);
    }
  };

  for (const suite of report.suites || []) {
    visitSuite(suite);
  }

  return collected;
}

function mapSpec(spec: any, index: number): TestCase {
  const statuses = (spec.tests || []).map((test: any) => test.status);
  const allResults = (spec.tests || []).flatMap((test: any) => test.results || []);
  const hasFailure = !spec.ok || statuses.includes('unexpected') || allResults.some((result: any) => result.status === 'failed' || result.error);
  const isSkipped = statuses.length > 0 && statuses.every((status: string) => status === 'skipped');
  const isFlaky = statuses.includes('flaky');
  const status: TestStatus = hasFailure ? 'failed' : isSkipped ? 'skipped' : isFlaky ? 'flaky' : 'passed';
  const reason = getFailureReason(allResults, hasFailure);

  return {
    id: `TC_${String(index).padStart(3, '0')}`,
    title: stripTags(spec.title || 'Untitled test'),
    module: moduleNameFromFile(spec.file || 'Unknown'),
    status,
    failureReason: reason,
  };
}

function getFailureReason(resultsList: any[], hasFailure: boolean): string {
  if (!hasFailure) return '';

  const failedResult = resultsList.find((result: any) => result.error || result.errors?.length);
  const message = failedResult?.error?.message || failedResult?.errors?.[0]?.message || 'Test failed. See detailed Playwright report for stack trace.';
  return cleanText(message).slice(0, 240);
}

function summarizeCases(casesList: TestCase[], report: any) {
  const total = casesList.length || Number(report.stats?.expected || 0) + Number(report.stats?.unexpected || 0) + Number(report.stats?.skipped || 0) + Number(report.stats?.flaky || 0);
  const passed = casesList.filter(testCase => testCase.status === 'passed').length || Number(report.stats?.expected || 0);
  const failed = casesList.filter(testCase => testCase.status === 'failed').length || Number(report.stats?.unexpected || 0);
  const skipped = casesList.filter(testCase => testCase.status === 'skipped').length || Number(report.stats?.skipped || 0);
  const passPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const overallStatus = failed > 0
    ? 'FAILED'
    : total === 0
      ? 'NO TESTS'
      : passed === 0
        ? 'SKIPPED'
        : skipped > 0
          ? 'PASSED WITH SKIPS'
          : 'PASSED';

  return { total, passed, failed, skipped, passPercentage, overallStatus };
}

function summarizeModules(casesList: TestCase[]): ModuleSummary[] {
  const summaries = new Map<string, ModuleSummary>();

  for (const testCase of casesList) {
    const summary = summaries.get(testCase.module) || {
      module: testCase.module,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    summary.total += 1;
    summary[testCase.status === 'flaky' ? 'passed' : testCase.status] += 1;
    summaries.set(testCase.module, summary);
  }

  return [...summaries.values()].sort((a, b) => a.module.localeCompare(b.module));
}

function buildHtml(summary: ReturnType<typeof summarizeCases>, modules: ModuleSummary[], failedCases: TestCase[]): string {
  const moduleRows = modules.length
    ? modules.map(moduleSummary => `
      <tr>
        <td>${escapeHtml(moduleSummary.module)}</td>
        <td class="num">${moduleSummary.total}</td>
        <td class="num">${moduleSummary.passed}</td>
        <td class="num">${moduleSummary.failed}</td>
        <td><span class="status ${moduleSummary.failed > 0 ? 'failed' : 'passed'}">${moduleSummary.failed > 0 ? 'Failed' : moduleSummary.passed === 0 ? 'Skipped' : 'Passed'}</span></td>
      </tr>`).join('')
    : '<tr><td colspan="5">No module result data was available.</td></tr>';

  const failedRows = failedCases.length
    ? failedCases.map(testCase => `
      <tr>
        <td>${testCase.id}</td>
        <td>${escapeHtml(testCase.title)}</td>
        <td>${escapeHtml(testCase.failureReason)}</td>
      </tr>`).join('')
    : '<tr><td colspan="3">No failed scenarios were reported.</td></tr>';

  const observations = buildObservations(summary, modules);
  const recommendation = summary.failed > 0 || summary.passed === 0
    ? 'Release readiness is currently <strong>not recommended</strong> until the failed scenarios are reviewed, fixed, and successfully retested.'
    : 'Release readiness is currently <strong>recommended</strong> based on the latest automation execution.';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #1f2937; line-height: 1.45; }
    h2 { margin-top: 24px; color: #111827; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0 22px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; }
    .num { text-align: right; }
    .status { font-weight: 700; }
    .passed { color: #047857; }
    .failed { color: #b91c1c; }
    .muted { color: #6b7280; }
  </style>
</head>
<body>
  <p>Hi Team,</p>
  <p>Please find below the Mattamy Homes automation test execution summary for the latest build.</p>

  <h2>Execution Summary</h2>
  <table>
    <tr><th>Field</th><th>Details</th></tr>
    <tr><td>Application</td><td>Mattamy Homes</td></tr>
    <tr><td>Environment</td><td>${escapeHtml(envName)}</td></tr>
    <tr><td>URL</td><td><a href="${baseUrl}">${baseUrl}</a></td></tr>
    <tr><td>Browser</td><td>Chrome</td></tr>
    <tr><td>Platform</td><td>Desktop</td></tr>
    <tr><td>Location</td><td>${escapeHtml(locationName)}</td></tr>
    <tr><td>Test Suite</td><td>${escapeHtml(suiteName)}</td></tr>
    <tr><td>Execution Date</td><td>${formatDate()}</td></tr>
    <tr><td>Triggered By</td><td>${escapeHtml(runActor)}</td></tr>
    <tr><td>Overall Status</td><td><span class="status ${summary.failed > 0 ? 'failed' : 'passed'}">${summary.overallStatus}</span></td></tr>
  </table>

  <h2>Test Summary</h2>
  <table>
    <tr><th>Metric</th><th>Count</th></tr>
    <tr><td>Total Tests</td><td class="num">${summary.total}</td></tr>
    <tr><td>Passed</td><td class="num">${summary.passed}</td></tr>
    <tr><td>Failed</td><td class="num">${summary.failed}</td></tr>
    <tr><td>Skipped</td><td class="num">${summary.skipped}</td></tr>
    <tr><td>Pass Percentage</td><td class="num">${summary.passPercentage}%</td></tr>
  </table>

  <h2>Module-wise Execution Summary</h2>
  <table>
    <tr><th>Module</th><th>Total</th><th>Passed</th><th>Failed</th><th>Status</th></tr>
    ${moduleRows}
  </table>

  <h2>Failed Scenarios</h2>
  <table>
    <tr><th>Test Case ID</th><th>Scenario</th><th>Failure Reason</th></tr>
    ${failedRows}
  </table>

  <h2>Key Observations</h2>
  <ul>
    ${observations.map(observation => `<li>${escapeHtml(observation)}</li>`).join('')}
  </ul>

  <h2>Report Links</h2>
  <table>
    <tr><th>Report</th><th>Link</th></tr>
    <tr><td>GitHub Actions Run</td><td>${runUrl ? `<a href="${runUrl}">${runUrl}</a>` : 'Available in GitHub Actions'}</td></tr>
    <tr><td>Detailed HTML Report</td><td>Attached as playwright-report.zip and available in the GitHub Actions artifact.</td></tr>
    <tr><td>Allure Results</td><td>Available in the GitHub Actions artifact when generated.</td></tr>
  </table>

  <h2>Release Recommendation</h2>
  <p>${recommendation}</p>

  <p>Thanks,<br>EXSQ QA Automation Team</p>
  <p class="muted">Note: videos are excluded from this email and the packaged report artifacts.</p>
</body>
</html>`;
}

function buildObservations(summary: ReturnType<typeof summarizeCases>, modules: ModuleSummary[]): string[] {
  if (summary.total === 0) {
    return ['No tests were discovered or reported in this execution.'];
  }

  const failedModules = modules.filter(moduleSummary => moduleSummary.failed > 0).map(moduleSummary => moduleSummary.module);
  const stableModules = modules.filter(moduleSummary => moduleSummary.failed === 0 && moduleSummary.passed > 0).map(moduleSummary => moduleSummary.module);
  const observations = [
    `${summary.passed} of ${summary.total} tests passed with a pass percentage of ${summary.passPercentage}%.`,
  ];

  if (stableModules.length) {
    observations.push(`${stableModules.slice(0, 5).join(', ')} ${stableModules.length === 1 ? 'flow is' : 'flows are'} stable in this execution.`);
  }

  if (failedModules.length) {
    observations.push(`Failures are observed in ${failedModules.slice(0, 5).join(', ')} and should be reviewed before release sign-off.`);
  } else {
    observations.push('No failed scenarios were observed in this execution.');
  }

  observations.push('Detailed screenshots, traces, and HTML report files are available in the GitHub Actions artifact.');
  return observations;
}

function moduleNameFromFile(fileName: string): string {
  const base = path.basename(fileName, path.extname(fileName))
    .replace(/\.spec$/i, '')
    .replace(/Page$/i, ' Page')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bqmi\b/i, 'QMI')
    .replace(/\bmpc\b/i, 'MPC')
    .trim();

  return toTitleCase(base || 'Unknown');
}

function stripTags(value: string): string {
  return value.replace(/@\w+/g, '').replace(/\s+/g, ' ').trim();
}

function cleanText(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+/g, ' ').trim();
}

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, word => word.toUpperCase() === word ? word : word.charAt(0).toUpperCase() + word.slice(1));
}

function formatDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date()).replace(/ /g, '-');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
