import { JiraClient } from './jiraClient';
import { JiraFeature } from './jiraParser';
import { parseADFToText } from './jiraADFParser';
import { mergeRequirements } from './jiraRequirementExtractor';
import { buildGenericScenarios } from './jiraScenarioBuilder';

export class JiraToScenario {
    static async convert(issueKey: string): Promise<JiraFeature> {
        const issue = await JiraClient.getIssue(issueKey);

        const summary = issue.fields.summary || '';
        const description = parseADFToText(issue.fields.description);
        const labels = issue.fields.labels || [];

        const comments =
            issue.fields.comment?.comments?.map((c: any) =>
                parseADFToText(c.body)
            ) || [];

        // Optional future support
        const acceptanceCriteria: string[] = [];
        const customFields: string[] = [];

        const requirements = mergeRequirements({
            summary,
            acceptanceCriteria,
            description
        });

        const scenarios = buildGenericScenarios(issue.key, requirements);

        return {
            ticket: issue.key,
            feature: summary,
            page: inferPage(summary, description, labels),
            scenarios,
        };
    }
}

function inferPage(summary: string, description: string, labels: string[]): string {
    const combined = `${summary} ${description} ${labels.join(' ')}`.toLowerCase();

    if (/search/.test(combined)) return 'Search Page';
    if (/home/.test(combined)) return 'Home Page';
    if (/listing/.test(combined)) return 'Listing Page';
    if (/details|detail/.test(combined)) return 'Details Page';
    if (/checkout/.test(combined)) return 'Checkout Page';
    if (/login|sign in/.test(combined)) return 'Login Page';
    if (/register|signup|sign up/.test(combined)) return 'Registration Page';

    return 'Generic Page';
}