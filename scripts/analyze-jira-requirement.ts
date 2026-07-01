import fs from 'fs';
import path from 'path';
import { JiraIssueRequirement } from '../utils/jiraClient';

// A single legacy-path → destination-path rewrite (e.g. /florida/tampa → /florida/bradenton).
type PathReplacement = { from: string; to: string };

// A query-parameter rewrite applied when a source URL carries a legacy value (e.g. metro=Tampa → metro=Bradenton).
type QueryReplacement = { param: string; from: string; to: string };

// Ticket-specific redirect mapping, supplied per ticket via data/jira/<TICKET>.redirect-rules.json.
type RedirectRules = {
    pathReplacements?: PathReplacement[];
    queryReplacements?: QueryReplacement[];
};

type RedirectScenario = {
    sourceUrl: string;
    expectedPathContains: string;
    // Human-readable label of the redirect rule that matched, used to group tests in the generated spec.
    group: string;
    title: string;
    priority: string;
    testType: 'Smoke' | 'Regression' | 'Functional';
    preconditions: string[];
    steps: string[];
    expectedResult: string;
};

type JiraRequirementAnalysis = {
    ticket: string;
    summary: string;
    businessRequirement: string;
    functionalRequirements: string[];
    acceptanceCriteria: string[];
    positiveScenarios: RedirectScenario[];
    negativeScenarios: string[];
    edgeCases: string[];
    regressionImpactAreas: string[];
    openQuestions: string[];
    sourceUrl: string;
};

const ticketId = process.argv[2];

if (!ticketId) {
    console.error('Usage: npx ts-node scripts/analyze-jira-requirement.ts <ticketid>');
    process.exit(1);
}

const ticketUpper = ticketId.toUpperCase();
const jiraDir = path.resolve(__dirname, '../data/jira');
const inputPath = path.resolve(jiraDir, `${ticketUpper}.json`);
const rulesPath = path.resolve(jiraDir, `${ticketUpper}.redirect-rules.json`);
const outputPath = path.resolve(jiraDir, `${ticketUpper}.analysis.json`);

const requirement = JSON.parse(fs.readFileSync(inputPath, 'utf-8')) as JiraIssueRequirement;
const rules = loadRedirectRules(rulesPath);
const analysis = analyzeRequirement(requirement, rules, fs.existsSync(rulesPath));

fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2), 'utf-8');
console.log(`Jira analysis saved to ${path.relative(process.cwd(), outputPath)}`);

// Loads the optional per-ticket redirect rules file; returns empty rules when none is provided.
function loadRedirectRules(filePath: string): RedirectRules {
    if (!fs.existsSync(filePath)) {
        return {};
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RedirectRules;
}

// Derives a ticket-agnostic analysis from the fetched Jira issue plus its (optional) redirect rules.
function analyzeRequirement(
    issue: JiraIssueRequirement,
    rules: RedirectRules,
    hasRulesFile: boolean
): JiraRequirementAnalysis {
    const cleanCriteria = issue.acceptanceCriteria.filter((item) => !/\[object Object\]/.test(item));
    const fullText = [
        issue.summary,
        issue.description,
        ...cleanCriteria,
        ...issue.comments,
        ...issue.attachments.map((attachment) => attachment.textContent ?? '')
    ].join('\n');
    const urls = extractUrls(fullText);
    const redirectScenarios = buildRedirectScenarios(urls, issue.priority, rules, issue.ticket);

    return {
        ticket: issue.ticket,
        summary: issue.summary,
        businessRequirement: issue.summary,
        functionalRequirements: deriveFunctionalRequirements(issue, cleanCriteria, rules),
        acceptanceCriteria: cleanCriteria.length ? cleanCriteria : deriveDefaultAcceptanceCriteria(redirectScenarios),
        positiveScenarios: redirectScenarios,
        negativeScenarios: deriveNegativeScenarios(redirectScenarios),
        edgeCases: deriveEdgeCases(urls, redirectScenarios),
        regressionImpactAreas: deriveRegressionImpactAreas(urls),
        openQuestions: buildOpenQuestions(issue, redirectScenarios, hasRulesFile),
        sourceUrl: issue.sourceUrl
    };
}

// Builds one redirect scenario per source URL that the ticket's rules know how to rewrite.
function buildRedirectScenarios(
    urls: string[],
    priority: string,
    rules: RedirectRules,
    ticket: string
): RedirectScenario[] {
    const scenarios: RedirectScenario[] = urls
        .map((sourceUrl) => {
            const match = matchRedirectRule(sourceUrl, rules);

            if (!match) {
                return null;
            }

            return {
                sourceUrl,
                expectedPathContains: match.expectedPathContains,
                group: match.group,
                title: `Validate redirect for ${new URL(sourceUrl).pathname}`,
                priority: priority || 'Medium',
                testType: 'Regression' as const,
                preconditions: [
                    `Jira redirect rules for ${ticket} are deployed in the selected environment.`,
                    'The selected environment base URL is configured through ENV.'
                ],
                steps: [
                    `Open legacy URL: ${sourceUrl}`,
                    'Capture the final navigated URL after redirects complete.',
                    `Verify the final URL contains: ${match.expectedPathContains}`,
                    'Verify the final response is not a 4xx or 5xx error.'
                ],
                expectedResult: `The legacy URL redirects successfully to a destination containing ${match.expectedPathContains}.`
            };
        })
        .filter((scenario): scenario is NonNullable<typeof scenario> => Boolean(scenario));

    return scenarios.slice(0, 250);
}

// Applies the ticket's path/query rewrite rules to a source URL; returns the expected destination
// plus the label of the rule that matched (used to group tests), or null when no rule matches.
function matchRedirectRule(
    rawUrl: string,
    rules: RedirectRules
): { expectedPathContains: string; group: string } | null {
    let url: URL;

    try {
        url = new URL(rawUrl);
    } catch {
        return null;
    }

    const pathname = url.pathname.toLowerCase();

    for (const replacement of rules.pathReplacements ?? []) {
        const from = replacement.from.toLowerCase();

        if (pathname.includes(from)) {
            return {
                expectedPathContains: pathname.replace(from, replacement.to.toLowerCase()),
                group: `${replacement.from} -> ${replacement.to}`
            };
        }
    }

    for (const replacement of rules.queryReplacements ?? []) {
        if (url.searchParams.get(replacement.param) === replacement.from) {
            const expected = new URL(url.href);
            expected.searchParams.set(replacement.param, replacement.to);
            return {
                expectedPathContains: `${expected.pathname}?${expected.searchParams.toString()}`,
                group: `${replacement.param}=${replacement.from} -> ${replacement.param}=${replacement.to}`
            };
        }
    }

    return null;
}

function extractUrls(text: string): string[] {
    const matches = text.match(/https?:\/\/[^\s"')]+/gi) ?? [];

    return [...new Set(matches.map((url) => url.replace(/[.,;]+$/, '')))];
}

// Prefers the ticket's own acceptance criteria, falling back to description bullet/numbered lines.
function deriveFunctionalRequirements(
    issue: JiraIssueRequirement,
    cleanCriteria: string[],
    rules: RedirectRules
): string[] {
    if (cleanCriteria.length) {
        return cleanCriteria;
    }

    const descriptionLines = splitMeaningfulLines(issue.description);

    if (descriptionLines.length) {
        return descriptionLines;
    }

    const ruleCount = (rules.pathReplacements?.length ?? 0) + (rules.queryReplacements?.length ?? 0);

    return ruleCount > 0
        ? ['Legacy URLs covered by the ticket redirect rules should resolve to their configured destination paths.']
        : [issue.summary].filter(Boolean);
}

function deriveDefaultAcceptanceCriteria(scenarios: RedirectScenario[]): string[] {
    if (!scenarios.length) {
        return ['The requirement behaviour described in the ticket is satisfied without client-visible errors.'];
    }

    return [
        'Old redirect URLs return a redirect response or land on the expected new URL.',
        'Redirect destinations contain the configured replacement path.',
        'Redirected pages are reachable without client-visible 4xx or 5xx responses.'
    ];
}

function deriveNegativeScenarios(scenarios: RedirectScenario[]): string[] {
    if (!scenarios.length) {
        return ['The described behaviour must not produce 404, 500, or an unrelated destination.'];
    }

    return [
        'Legacy URLs must not resolve to 404, 500, or an unrelated page.',
        'Redirects must not loop back to the same legacy URL.'
    ];
}

function deriveEdgeCases(urls: string[], scenarios: RedirectScenario[]): string[] {
    const edgeCases: string[] = [];

    if (urls.some((url) => url.includes('?'))) {
        edgeCases.push('URLs with query strings should preserve functional context after redirect.');
    }

    if (scenarios.length) {
        edgeCases.push('Trailing slash behavior should not change the expected destination path.');
        edgeCases.push('Every source URL listed in the ticket should be covered, including those only in attachments or comments.');
    }

    return edgeCases;
}

// Maps the URL path segments actually seen in the ticket to human-readable impacted areas.
function deriveRegressionImpactAreas(urls: string[]): string[] {
    const segmentLabels: Array<{ match: RegExp; label: string }> = [
        { match: /\/promos?\//i, label: 'Promotion pages' },
        { match: /\/search(\/|\?|$)/i, label: 'Search result URLs and query parameters' },
        { match: /\/quick-move-in|\/qmi\//i, label: 'Quick move-in detail pages' },
        { match: /\/communities?\//i, label: 'Community detail pages' },
        { match: /\/plans?\//i, label: 'Plan detail pages' }
    ];

    const areas = new Set<string>();

    if (urls.length) {
        areas.add('Market landing pages');
    }

    for (const url of urls) {
        for (const { match, label } of segmentLabels) {
            if (match.test(url)) {
                areas.add(label);
            }
        }
    }

    return [...areas];
}

function buildOpenQuestions(
    issue: JiraIssueRequirement,
    scenarios: RedirectScenario[],
    hasRulesFile: boolean
): string[] {
    const questions: string[] = [];

    if (!issue.acceptanceCriteria.length || issue.acceptanceCriteria.some((item) => /\[object Object\]/.test(item))) {
        questions.push('Jira acceptance criteria are not available as clean text; scenarios are derived from description and attachments.');
    }

    if (!hasRulesFile) {
        questions.push(`No redirect-rules file found at data/jira/${issue.ticket}.redirect-rules.json; add path/query rewrite rules to generate redirect scenarios for this ticket.`);
    }

    if (scenarios.length === 0) {
        questions.push('No source URLs matched the configured redirect rules in the Jira description, comments, or attachments.');
    }

    return questions;
}

function splitMeaningfulLines(text: string): string[] {
    return text
        .split(/\n|•|- |\d+\.\s/)
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter((line) => line.length >= 12 && line.length <= 300)
        .slice(0, 20);
}
