import { execSync } from 'node:child_process';
import path from 'node:path';

// End-to-end: fetch a Jira ticket over the REST API, analyze it, and generate its redirect spec.
// Usage: npm run generate:from-jira -- <TICKET-ID> [--force]

const ticketId = process.argv[2];
const force = process.argv.includes('--force');

if (!ticketId) {
    console.error('Usage: npm run generate:from-jira -- <ticketid> [--force]');
    process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');
const forceFlag = force ? ' --force' : '';

const steps: Array<{ label: string; command: string }> = [
    { label: 'Fetch Jira requirement', command: `npx ts-node scripts/fetch-jira-requirement.ts ${ticketId}` },
    { label: 'Analyze requirement', command: `npx ts-node scripts/analyze-jira-requirement.ts ${ticketId}` },
    { label: 'Generate Playwright spec', command: `npx ts-node scripts/generate-playwright.ts ${ticketId}${forceFlag}` }
];

for (const step of steps) {
    console.log(`\n> ${step.label}`);
    execSync(step.command, { cwd: repoRoot, stdio: 'inherit' });
}

console.log(`\nDone. Review tests/${ticketId.toUpperCase()}.spec.ts before running it.`);
