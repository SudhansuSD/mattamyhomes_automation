import fs from 'fs';
import path from 'path';

type RedirectScenario = {
  sourceUrl: string;
  expectedPathContains: string;
  group: string;
  title: string;
};

type Analysis = {
  ticket: string;
  summary: string;
  positiveScenarios: RedirectScenario[];
};

// Usage: npx ts-node scripts/generate-playwright.ts <ticketid> [--force]
const ticketId = process.argv[2];
const force = process.argv.includes('--force');

if (!ticketId) {
  console.error('Usage: npx ts-node scripts/generate-playwright.ts <ticketid> [--force]');
  process.exit(1);
}

const ticketUpper = ticketId.toUpperCase();
const analysisPath = path.resolve(__dirname, '../data/jira', `${ticketUpper}.analysis.json`);
const outputPath = path.resolve(__dirname, '../tests', `${ticketUpper}.spec.ts`);

if (!fs.existsSync(analysisPath)) {
  console.error(
    `Analysis not found: ${path.relative(process.cwd(), analysisPath)}. Run: npm run jira:analyze -- ${ticketUpper}`,
  );
  process.exit(1);
}

if (fs.existsSync(outputPath) && !force) {
  console.error(
    `Spec already exists: ${path.relative(process.cwd(), outputPath)}. Re-run with --force to overwrite.`,
  );
  process.exit(1);
}

const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8')) as Analysis;

fs.writeFileSync(outputPath, buildSpec(analysis), 'utf-8');
console.log(`Playwright spec generated into ${path.relative(process.cwd(), outputPath)}`);

// Builds a redirect-validation spec grouped by the redirect rule that produced each scenario,
// mirroring the hand-written tests/MTTMY-2091.spec.ts pattern.
function buildSpec(analysis: Analysis): string {
  const scenarios = analysis.positiveScenarios ?? [];
  const groups = [...new Set(scenarios.map((scenario) => scenario.group))].filter(Boolean);
  const describeTitle = `${analysis.ticket} - ${analysis.summary}`;

  const body = groups.length
    ? groups.map((group) => buildTestBlock(analysis.ticket, group)).join('\n\n')
    : buildEmptyBlock(analysis.ticket);

  return `import { test } from '@playwright/test';
import analysis from '../data/jira/${analysis.ticket}.analysis.json';
import { validateRedirectCases, RedirectCase } from '../utils/web/redirectValidation';

const scenarios = analysis.positiveScenarios as (RedirectCase & { group: string })[];

test.describe(${jsString(describeTitle)}, () => {
${body}
});
`;
}

function buildTestBlock(ticket: string, group: string): string {
  const testName = `${ticket} | @regression | Validate redirects: ${group}`;

  return `  test(${jsString(testName)}, async ({ request }) => {
    await validateRedirectCases(
      request,
      scenarios.filter((scenario) => scenario.group === ${jsString(group)}),
      { label: ${jsString(`${ticket} ${group}`)} }
    );
  });`;
}

function buildEmptyBlock(ticket: string): string {
  return `  test(${jsString(`${ticket} | @regression | Redirect scenarios`)}, async () => {
    test.skip(true, 'No redirect scenarios were derived from the Jira analysis. Add redirect rules in data/jira/${ticket}.redirect-rules.json and re-run jira:analyze.');
  });`;
}

// Serializes a string as a safe double-quoted JavaScript literal for embedding in generated code.
function jsString(value: string): string {
  return JSON.stringify(value);
}
