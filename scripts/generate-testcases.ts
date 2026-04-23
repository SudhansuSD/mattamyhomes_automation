import fs from 'fs';
import path from 'path';

type TestCase = {
    id: string;
    title: string;
    type: 'navigation' | 'validation' | 'functional' | 'ui' | 'generic';
    steps: string[];
    expectedResult: string;
    tags: string[];
};

/*
COPILOT INSTRUCTION:

You are a senior QA automation engineer.

Goal:
Convert Jira input into meaningful test cases.

Rules:
- DO NOT create test cases from URL fragments or broken strings
- Understand intent (redirect, validation, navigation)
- Group related logic into 1–2 strong scenarios (NOT many weak ones)
- Prefer realistic web application behavior
- Avoid duplication

Focus:
- redirect
- navigation
- validation
- UI behavior

Now generate clean test cases below.
*/

const inputPath = path.resolve(__dirname, '../data/jira-ai-input.json');
const outputPath = path.resolve(__dirname, '../data/jira-testcases.json');

const jira = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

function cleanText(text: string): string {
    return text
        .replace(/https?:\/\/\S+/g, '') // remove URLs
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function detectIntent(text: string): string[] {
    const intents: string[] = [];

    if (/redirect|link|navigate|url/.test(text)) intents.push('redirect');
    if (/validation|error|required|invalid/.test(text)) intents.push('validation');
    if (/search|filter|select/.test(text)) intents.push('functional');
    if (/button|dropdown|field|ui/.test(text)) intents.push('ui');

    return intents.length > 0 ? intents : ['generic'];
}

function generateTestCases(jira: any): TestCase[] {
    const text = cleanText(`${jira.summary} ${jira.description}`);

    const intents = detectIntent(text);

    const testCases: TestCase[] = [];

    // 🔥 Redirect scenario (fix for your Sunstone issue)
    if (intents.includes('redirect')) {
        testCases.push({
            id: 'TC001',
            title: 'Validate source URL redirects correctly',
            type: 'navigation',
            steps: [
                'Open the source URL in browser',
                'Observe redirect behavior',
                'Verify user is redirected to expected destination page'
            ],
            expectedResult: 'User should land on correct destination page',
            tags: ['redirect', 'navigation', 'url']
        });

        testCases.push({
            id: 'TC002',
            title: 'Validate redirected destination URL is correct',
            type: 'navigation',
            steps: [
                'Trigger redirect using source URL',
                'Capture final landing URL',
                'Verify it matches expected destination URL'
            ],
            expectedResult: 'Final URL should match expected destination',
            tags: ['redirect', 'url']
        });

        return testCases;
    }

    // 🔹 Validation scenarios
    if (intents.includes('validation')) {
        testCases.push({
            id: 'TC001',
            title: 'Validate input validation behavior',
            type: 'validation',
            steps: [
                'Navigate to relevant page',
                'Enter invalid input',
                'Observe validation behavior'
            ],
            expectedResult: 'Proper validation message should be displayed',
            tags: ['validation']
        });

        return testCases;
    }

    // 🔹 Functional scenarios
    if (intents.includes('functional')) {
        testCases.push({
            id: 'TC001',
            title: 'Validate functional behavior',
            type: 'functional',
            steps: [
                'Navigate to application page',
                'Perform user action',
                'Observe system behavior'
            ],
            expectedResult: 'System should behave as expected',
            tags: ['functional']
        });

        return testCases;
    }

    // 🔹 Generic fallback
    testCases.push({
        id: 'TC001',
        title: `Validate functionality for ${jira.summary}`,
        type: 'generic',
        steps: [
            'Navigate to relevant page',
            'Perform user action',
            'Verify expected behavior'
        ],
        expectedResult: 'Feature should work correctly',
        tags: ['generic']
    });

    return testCases;
}

// Run
const testCases = generateTestCases(jira);

fs.writeFileSync(outputPath, JSON.stringify({ testCases }, null, 2));

console.log('✅ Test cases generated successfully');