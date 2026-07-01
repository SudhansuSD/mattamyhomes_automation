import fs from 'fs';
import path from 'path';

type TestCaseType = 'navigation' | 'validation' | 'functional' | 'ui' | 'generic';

type TestCase = {
    id: string;
    title: string;
    type: TestCaseType;
    steps: string[];
    expectedResult: string;
    tags: string[];
};

type RequirementInput = {
    ticket?: string;
    summary?: string;
    description?: string;
    acceptanceCriteria?: unknown;
    comments?: unknown;
    labels?: unknown;
};

const inputPath = path.resolve(__dirname, '../data/requirement-input.json');
const outputPath = path.resolve(__dirname, '../data/generated-testcases.json');

const requirement = JSON.parse(fs.readFileSync(inputPath, 'utf-8')) as RequirementInput;
const testCases = generateTestCases(requirement);

fs.writeFileSync(outputPath, JSON.stringify({ testCases }, null, 2));
console.log(`Generated ${testCases.length} test case(s) into ${path.relative(process.cwd(), outputPath)}`);

// Turns each acceptance criterion (or, if none, the requirement summary) into a typed test case.
function generateTestCases(requirement: RequirementInput): TestCase[] {
    const criteria = toStringArray(requirement.acceptanceCriteria);
    const comments = toStringArray(requirement.comments);
    const requirementContext = `${requirement.summary ?? ''} ${requirement.description ?? ''}`;

    // Source statements are the real acceptance criteria; fall back to summary/comments when absent.
    const statements = criteria.length
        ? criteria
        : [requirement.summary, ...comments].filter((value): value is string => Boolean(value));

    if (!statements.length) {
        return [buildGenericTestCase(1, requirement.summary ?? 'the requirement')];
    }

    return statements.map((statement, index) => buildTestCase(index + 1, statement, requirementContext));
}

function buildTestCase(index: number, statement: string, requirementContext: string): TestCase {
    const type = detectType(`${statement} ${requirementContext}`);

    return {
        id: `TC${String(index).padStart(3, '0')}`,
        title: truncateTitle(statement),
        type,
        steps: buildSteps(type, statement),
        expectedResult: statement.trim(),
        tags: buildTags(type)
    };
}

function buildGenericTestCase(index: number, summary: string): TestCase {
    return {
        id: `TC${String(index).padStart(3, '0')}`,
        title: `Validate functionality for ${truncateTitle(summary)}`,
        type: 'generic',
        steps: ['Navigate to the relevant page', 'Perform the user action', 'Verify the expected behavior'],
        expectedResult: 'Feature should work as described in the requirement',
        tags: ['generic']
    };
}

// Classifies a statement into a test type from the intent keywords it contains.
function detectType(text: string): TestCaseType {
    const normalized = text.toLowerCase();

    if (/redirect|navigate|url|link|route/.test(normalized)) return 'navigation';
    if (/validation|error|required|invalid|must not/.test(normalized)) return 'validation';
    if (/search|filter|select|submit|sort/.test(normalized)) return 'functional';
    if (/button|dropdown|field|label|display|visible|hidden|banner|cta/.test(normalized)) return 'ui';

    return 'generic';
}

function buildSteps(type: TestCaseType, statement: string): string[] {
    switch (type) {
        case 'navigation':
            return [
                'Open the source URL described in the requirement',
                'Observe the navigation/redirect behavior',
                `Verify: ${statement.trim()}`
            ];
        case 'validation':
            return [
                'Navigate to the relevant page',
                'Provide the input described in the requirement',
                `Verify: ${statement.trim()}`
            ];
        case 'functional':
            return [
                'Navigate to the relevant page',
                'Perform the described user action',
                `Verify: ${statement.trim()}`
            ];
        case 'ui':
            return [
                'Navigate to the relevant page',
                'Inspect the described UI elements',
                `Verify: ${statement.trim()}`
            ];
        default:
            return ['Navigate to the relevant page', 'Perform the user action', `Verify: ${statement.trim()}`];
    }
}

function buildTags(type: TestCaseType): string[] {
    return ['regression', type];
}

function truncateTitle(value: string): string {
    const clean = value.replace(/\s+/g, ' ').trim();

    return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean;
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        // Drop empty entries and ADF fields that failed to flatten to plain text.
        .filter((item) => Boolean(item) && !/\[object Object\]/.test(item));
}
