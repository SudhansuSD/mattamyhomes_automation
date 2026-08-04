import { defineConfig } from 'allure';
import process from 'node:process';

const reportName = process.env.ALLURE_REPORT_NAME || 'Mattamy Homes Automation Report';
const output = process.env.ALLURE_OUTPUT_DIR || './allure-report';
const historyPath = process.env.ALLURE_HISTORY_PATH || './allure-report/history.jsonl';

const charts = [
  {
    type: 'currentStatus',
    title: 'Current status',
    statuses: ['passed', 'failed', 'broken', 'skipped', 'unknown'],
    metric: 'passed',
  },
  {
    type: 'testResultSeverities',
    title: 'Results by severity',
    includeUnset: true,
    statuses: ['passed', 'failed', 'broken', 'skipped', 'unknown'],
  },
  {
    type: 'durations',
    title: 'Test durations',
    groupBy: 'none',
  },
  {
    type: 'statusDynamics',
    title: 'Status trend',
    limit: 20,
    statuses: ['passed', 'failed', 'broken', 'skipped', 'unknown'],
  },
  {
    type: 'durationDynamics',
    title: 'Duration trend',
    limit: 20,
  },
  {
    type: 'statusTransitions',
    title: 'Status transitions',
    limit: 20,
  },
  {
    type: 'stabilityDistribution',
    title: 'Stability by feature',
    groupBy: 'feature',
    threshold: 90,
  },
  {
    type: 'statusAgePyramid',
    title: 'Open issue age',
    limit: 20,
  },
  {
    type: 'successRateDistribution',
    title: 'Success rate distribution',
  },
  {
    type: 'problemsDistribution',
    title: 'Problems by environment',
    by: 'environment',
  },
  {
    type: 'testingPyramid',
    title: 'Testing pyramid',
  },
];

export default defineConfig({
  name: reportName,
  output,
  historyPath,
  appendHistory: true,
  categories: [
    {
      name: 'Broken selector / element not found',
      matchedStatuses: ['failed', 'broken'],
      messageRegex:
        '.*(locator|selector|element).*(not found|not visible|no element|resolved to 0|strict mode violation).*',
      groupBy: ['status', 'environment'],
      groupByMessage: true,
      groupEnvironments: true,
    },
    {
      name: 'Timeouts',
      matchedStatuses: ['failed', 'broken'],
      messageRegex: '.*(Timeout .* exceeded|timed out|waiting for).*',
      groupBy: ['status', 'environment'],
      groupByMessage: true,
      groupEnvironments: true,
    },
    {
      name: 'Assertion failures',
      matchedStatuses: ['failed'],
      messageRegex: '.*(expect\\(|toBe|toEqual|toHaveText|toHaveURL|toContain|AssertionError).*',
      groupBy: ['severity', 'environment'],
      groupByMessage: true,
      groupEnvironments: true,
    },
    {
      name: 'Network / navigation errors',
      matchedStatuses: ['failed', 'broken'],
      messageRegex: '.*(net::ERR|ECONNREFUSED|ENOTFOUND|navigation|Response status|net error|ERR_).*',
      groupBy: ['status', 'environment'],
      groupByMessage: true,
      groupEnvironments: true,
    },
    {
      name: 'Product defects',
      matchedStatuses: ['failed'],
      groupBy: ['severity', 'environment'],
      groupEnvironments: true,
    },
    {
      name: 'Test infrastructure / environment',
      matchedStatuses: ['broken', 'unknown'],
      groupBy: ['status', 'environment'],
      groupEnvironments: true,
    },
  ],
  plugins: {
    awesome: {
      options: {
        reportName,
        reportLanguage: 'en',
        singleFile: false,
        groupBy: ['label-name:runType', 'epic', 'feature', 'story', 'suite'],
        charts,
      },
    },
    dashboard: {
      options: {
        reportName: `${reportName} Dashboard`,
        reportLanguage: 'en',
        singleFile: false,
        layout: charts,
      },
    },
  },
});
