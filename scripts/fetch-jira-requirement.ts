import fs from 'fs';
import path from 'path';
import { fetchJiraIssueRequirement, JiraIssueRequirement } from '../utils/jiraClient';

const ticketId = process.argv[2];

if (!ticketId) {
  console.error('Usage: npx ts-node scripts/fetch-jira-requirement.ts <ticketid>');
  process.exit(1);
}

const jiraDir = path.resolve(__dirname, '../data/jira');
const rawOutputPath = path.resolve(jiraDir, `${ticketId.toUpperCase()}.json`);
// Normalized requirement consumed by the generate:* chain (same shape the generators expect).
const requirementInputPath = path.resolve(__dirname, '../data/requirement-input.json');

async function main(): Promise<void> {
  fs.mkdirSync(jiraDir, { recursive: true });

  const requirement = await fetchJiraIssueRequirement(ticketId.toUpperCase());

  fs.writeFileSync(rawOutputPath, JSON.stringify(requirement, null, 2), 'utf-8');
  console.log(`Jira requirement saved to ${path.relative(process.cwd(), rawOutputPath)}`);

  fs.writeFileSync(
    requirementInputPath,
    JSON.stringify(toRequirementInput(requirement), null, 2),
    'utf-8',
  );
  console.log(`Requirement input saved to ${path.relative(process.cwd(), requirementInputPath)}`);
}

// Maps the full Jira requirement down to the RequirementInput shape used by generate-testcases/automation.
function toRequirementInput(requirement: JiraIssueRequirement): {
  ticket: string;
  summary: string;
  description: string;
  acceptanceCriteria: string[];
  comments: string[];
  labels: string[];
} {
  return {
    ticket: requirement.ticket,
    summary: requirement.summary,
    description: requirement.description,
    acceptanceCriteria: requirement.acceptanceCriteria,
    comments: requirement.comments,
    labels: requirement.labels,
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
