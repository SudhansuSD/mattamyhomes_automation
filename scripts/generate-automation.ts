import fs from 'fs';
import path from 'path';

type AutomationAction =
    | { type: 'navigate'; url: string }
    | { type: 'waitForNavigation' }
    | { type: 'waitForLoad' }
    | { type: 'assertUrlContains'; value: string }
    | { type: 'fill'; selector: string; value: string }
    | { type: 'assertVisible'; selector: string };

type AutomationTest = {
    id: string;
    name: string;
    actions: AutomationAction[];
};

type JiraTestCase = {
    id?: string;
    title?: string;
    name?: string;
    type?: string;
    steps?: unknown;
    expectedResult?: string;
    tags?: unknown;
};

type JiraTestCaseFile = {
    testCases?: unknown;
};

type JiraInput = {
    summary?: string;
    description?: string;
    labels?: unknown;
};

const inputPath = path.resolve(__dirname, '../data/jira-testcases.json');
const jiraInputPath = path.resolve(__dirname, '../data/jira-ai-input.json');
const outputPath = path.resolve(__dirname, '../data/automation-tests.json');

const testCaseData = readJson<JiraTestCaseFile>(inputPath);
const jiraInput = fs.existsSync(jiraInputPath) ? readJson<JiraInput>(jiraInputPath) : {};
const testCases = parseTestCases(testCaseData);
const jiraContext = buildJiraContext(jiraInput);

function readJson<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function parseTestCases(data: JiraTestCaseFile): JiraTestCase[] {
    if (!Array.isArray(data.testCases)) {
        throw new Error(`Expected "testCases" array in ${inputPath}`);
    }

    return data.testCases.map((testCase, index) => {
        if (!isRecord(testCase)) {
            throw new Error(`Invalid test case at index ${index}`);
        }

        return testCase as JiraTestCase;
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
}

function buildJiraContext(jira: JiraInput): string {
    return [
        jira.summary,
        jira.description,
        ...toStringArray(jira.labels)
    ].filter(Boolean).join(' ');
}

function buildTestCaseContext(testCase: JiraTestCase): string {
    return [
        testCase.title,
        testCase.name,
        testCase.type,
        ...toStringArray(testCase.steps),
        testCase.expectedResult,
        ...toStringArray(testCase.tags),
        jiraContext
    ].filter(Boolean).join(' ').toLowerCase();
}

function mapTestCaseToActions(testCase: JiraTestCase, index: number): AutomationTest {
    const actions: AutomationAction[] = [];
    const text = buildTestCaseContext(testCase);

    if (isRedirectScenario(text)) {
        const redirectPaths = extractRedirectPaths(text);

        actions.push({
            type: 'navigate',
            url: redirectPaths.source
        });

        actions.push({
            type: 'waitForNavigation'
        });

        actions.push({
            type: 'assertUrlContains',
            value: toRegexFriendlyUrlToken(redirectPaths.destination)
        });
    } else if (isValidationScenario(text)) {
        actions.push({
            type: 'fill',
            selector: 'input-field',
            value: 'invalid-data'
        });

        actions.push({
            type: 'assertVisible',
            selector: 'validation-message'
        });
    } else {
        actions.push({
            type: 'navigate',
            url: '/'
        });

        actions.push({
            type: 'waitForLoad'
        });
    }

    return {
        id: testCase.id ?? `TC${String(index + 1).padStart(3, '0')}`,
        name: testCase.title ?? testCase.name ?? `Generated test ${index + 1}`,
        actions
    };
}

function isRedirectScenario(text: string): boolean {
    return /redirect|navigate|url|link/.test(text);
}

function isValidationScenario(text: string): boolean {
    return /validation|error|required|invalid/.test(text);
}

function extractRedirectPaths(text: string): { source: string; destination: string } {
    const paths = extractMattamyPaths(text);

    if (paths.length >= 2) {
        return {
            source: paths[0],
            destination: paths[1]
        };
    }

    if (paths.length === 1) {
        return {
            source: paths[0],
            destination: paths[0]
        };
    }

    if (text.includes('sunstone')) {
        return {
            source: '/sunstone',
            destination: '/florida/sarasota/bradenton/venice/wellen-park/sunstone'
        };
    }

    return {
        source: '/',
        destination: '/'
    };
}

function extractMattamyPaths(text: string): string[] {
    const urlMatches = text.match(/(?:https?:\/\/)?(?:www\.)?mattamyhomes\.com\/[^\s,"')]+/gi) ?? [];
    const paths = urlMatches.map(toPath).filter((pathValue): pathValue is string => Boolean(pathValue));

    return [...new Set(paths)];
}

function toPath(rawUrl: string): string | null {
    try {
        const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
        const normalizedPath = url.pathname.replace(/\/+$/, '');

        return normalizedPath || '/';
    } catch {
        return null;
    }
}

function toRegexFriendlyUrlToken(pathValue: string): string {
    const segments = pathValue.split('/').filter(Boolean).map(escapeRegex);

    return segments.length > 0 ? segments.join('.*') : '.*';
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const automationTests = testCases.map(mapTestCaseToActions);

fs.writeFileSync(
    outputPath,
    JSON.stringify({ tests: automationTests }, null, 2)
);

console.log('Automation JSON generated successfully');
