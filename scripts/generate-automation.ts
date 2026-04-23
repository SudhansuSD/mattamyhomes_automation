import fs from 'fs';
import path from 'path';

type AutomationAction = {
    type: string;
    [key: string]: any;
};

type AutomationTest = {
    id: string;
    name: string;
    actions: AutomationAction[];
};

const inputPath = path.resolve(__dirname, '../data/jira-testcases.json');
const outputPath = path.resolve(__dirname, '../data/automation-tests.json');

const { testCases } = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

function mapTestCaseToActions(testCase: any): AutomationTest {
    const actions: AutomationAction[] = [];

    const text = `${testCase.title} ${testCase.steps.join(' ')}`.toLowerCase();

    // 🔥 Redirect / Navigation
    if (text.includes('redirect') || text.includes('navigate') || text.includes('url')) {
        actions.push({
            type: 'navigate',
            url: extractSourceUrl(text) || '/'
        });

        actions.push({
            type: 'waitForNavigation'
        });

        actions.push({
            type: 'assertUrlContains',
            value: extractExpectedUrl(text)
        });
    }

    // 🔹 Validation
    else if (text.includes('validation') || text.includes('error')) {
        actions.push({
            type: 'fill',
            selector: 'input-field',
            value: 'invalid-data'
        });

        actions.push({
            type: 'assertVisible',
            selector: 'validation-message'
        });
    }

    // 🔹 Functional fallback
    else {
        actions.push({
            type: 'navigate',
            url: '/'
        });

        actions.push({
            type: 'waitForLoad'
        });
    }

    return {
        id: testCase.id,
        name: testCase.title,
        actions
    };
}

// 🔧 Extract source URL (simple heuristic)
function extractSourceUrl(text: string): string | null {
    if (text.includes('sunstone')) return '/sunstone';
    return null;
}

// 🔧 Extract expected destination
function extractExpectedUrl(text: string): string {
    if (text.includes('sarasota')) return '/florida/sarasota';
    if (text.includes('redirect')) return '/';
    return '/';
}

// Run
const automationTests: AutomationTest[] = testCases.map(mapTestCaseToActions);

fs.writeFileSync(
    outputPath,
    JSON.stringify({ tests: automationTests }, null, 2)
);

console.log('✅ Automation JSON generated');