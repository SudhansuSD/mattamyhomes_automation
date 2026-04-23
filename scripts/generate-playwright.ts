import fs from 'fs';
import path from 'path';

const inputPath = path.resolve(__dirname, '../data/automation-tests.json');
const outputPath = path.resolve(__dirname, '../tests/generated.spec.ts');

const { tests } = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

function generatePlaywrightTest(test: any): string {
    const steps = test.actions.map((action: any) => {
        switch (action.type) {
            case 'navigate':
                return `await page.goto('${action.url}');`;

            case 'waitForNavigation':
                return `await page.waitForLoadState('networkidle');`;

            case 'assertUrlContains':
                return `await expect(page).toHaveURL(/${action.value}/);`;

            case 'fill':
                return `await page.fill('${action.selector}', '${action.value}');`;

            case 'assertVisible':
                return `await expect(page.locator('${action.selector}')).toBeVisible();`;

            default:
                return `// Unknown action`;
        }
    });

    return `
test('${test.name}', async ({ page }) => {
    ${steps.join('\n    ')}
});
`;
}

const content = `
import { test, expect } from '@playwright/test';

${tests.map(generatePlaywrightTest).join('\n')}
`;

fs.writeFileSync(outputPath, content);

console.log('✅ Playwright tests generated');