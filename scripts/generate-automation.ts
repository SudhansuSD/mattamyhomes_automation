import fs from 'fs';
import path from 'path';
import { getLocationConfig } from '../config/locations/locationConfig';

type AutomationAction =
  | { type: 'navigate'; url: string }
  | { type: 'skip'; reason: string }
  | { type: 'waitForNavigation' }
  | { type: 'waitForLoad' }
  | { type: 'assertUrlContains'; value: string }
  | { type: 'fill'; selector: string; value: string }
  | { type: 'assertVisible'; selector: string }
  | { type: 'assertHidden'; selector: string };

type AutomationTest = {
  id: string;
  name: string;
  actions: AutomationAction[];
};

type RequirementTestCase = {
  id?: string;
  title?: string;
  name?: string;
  type?: string;
  steps?: unknown;
  expectedResult?: string;
  tags?: unknown;
};

type RequirementTestCaseFile = {
  testCases?: unknown;
};

type RequirementInput = {
  summary?: string;
  description?: string;
  labels?: unknown;
};

const inputPath = path.resolve(__dirname, '../data/generated-testcases.json');
const requirementInputPath = path.resolve(__dirname, '../data/requirement-input.json');
const outputPath = path.resolve(__dirname, '../data/automation-tests.json');
const location = getLocationConfig();

const testCaseData = readJson<RequirementTestCaseFile>(inputPath);
const requirementInput = fs.existsSync(requirementInputPath)
  ? readJson<RequirementInput>(requirementInputPath)
  : {};
const testCases = parseTestCases(testCaseData);
const requirementContext = buildRequirementContext(requirementInput);

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function parseTestCases(data: RequirementTestCaseFile): RequirementTestCase[] {
  if (!Array.isArray(data.testCases)) {
    throw new Error(`Expected "testCases" array in ${inputPath}`);
  }

  return data.testCases.map((testCase, index) => {
    if (!isRecord(testCase)) {
      throw new Error(`Invalid test case at index ${index}`);
    }

    return testCase as RequirementTestCase;
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

function buildRequirementContext(requirement: RequirementInput): string {
  return [requirement.summary, requirement.description, ...toStringArray(requirement.labels)]
    .filter(Boolean)
    .join(' ');
}

function buildTestCaseContext(testCase: RequirementTestCase): string {
  return [
    testCase.title,
    testCase.name,
    testCase.type,
    ...toStringArray(testCase.steps),
    testCase.expectedResult,
    ...toStringArray(testCase.tags),
    requirementContext,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildLocalTestCaseContext(testCase: RequirementTestCase): string {
  return [
    testCase.title,
    testCase.name,
    testCase.type,
    ...toStringArray(testCase.steps),
    testCase.expectedResult,
    ...toStringArray(testCase.tags),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function mapTestCaseToActions(testCase: RequirementTestCase, index: number): AutomationTest {
  const actions: AutomationAction[] = [];
  const text = buildTestCaseContext(testCase);
  const localText = buildLocalTestCaseContext(testCase);

  if (/needs-fixture-url|manual fixture needed/.test(localText)) {
    actions.push({
      type: 'skip',
      reason:
        'No configured URL is available for a page without plans and QMIs. Add that URL to the Jira requirement (data/requirement-input.json) before automating this case.',
    });
  } else if (isContactBarScenario(text)) {
    const isMpcScenario = isMpcContactBarScenario(localText);

    actions.push({
      type: 'navigate',
      url: isMpcScenario ? getMpcPath() : getCommunityPath(),
    });

    actions.push({
      type: 'waitForLoad',
    });

    if (isMpcScenario) {
      actions.push({
        type: 'assertVisible',
        selector: 'text=/Contact|Sales|Hours|Directions|New Home Gallery/i',
      });
    } else {
      actions.push({
        type: 'assertVisible',
        selector: 'text=/Schedule (an )?Appointment/i',
      });

      actions.push({
        type: 'assertVisible',
        selector: 'text=/Directions/i',
      });

      actions.push({
        type: 'assertVisible',
        selector: 'a[href^="tel:"]',
      });
    }
  } else if (isRedirectScenario(text)) {
    const redirectPaths = extractRedirectPaths(text);

    if (!redirectPaths) {
      actions.push({
        type: 'skip',
        reason:
          'Redirect scenario has no mattamyhomes.com source/destination URL to automate. Add the source and destination URLs to the requirement before automating this case.',
      });
    } else {
      actions.push({
        type: 'navigate',
        url: redirectPaths.source,
      });

      actions.push({
        type: 'waitForNavigation',
      });

      actions.push({
        type: 'assertUrlContains',
        value: toRegexFriendlyUrlToken(redirectPaths.destination),
      });
    }
  } else if (isValidationScenario(text)) {
    actions.push({
      type: 'skip',
      reason:
        'Validation scenario has no reliable selector to automate generically. Add the target input and validation-message selectors before automating this case.',
    });
  } else {
    actions.push({
      type: 'navigate',
      url: '/',
    });

    actions.push({
      type: 'waitForLoad',
    });
  }

  return {
    id: testCase.id ?? `TC${String(index + 1).padStart(3, '0')}`,
    name: testCase.title ?? testCase.name ?? `Generated test ${index + 1}`,
    actions,
  };
}

function isRedirectScenario(text: string): boolean {
  return /redirect|navigate|url|link/.test(text);
}

function isContactBarScenario(text: string): boolean {
  return /contact bar|schedule appointment|cta|divider|home details/.test(text);
}

function isMpcContactBarScenario(text: string): boolean {
  return /mpc|master-planned/.test(text) && /schedule appointment|contact bar|cta/.test(text);
}

function getCommunityPath(): string {
  return location.communityPath ?? getMpcPath();
}

function getMpcPath(): string {
  const locationRecord = location as Record<string, any>;

  return locationRecord.mpc?.url ?? location.communityPath ?? '/';
}

function isValidationScenario(text: string): boolean {
  return /validation|error|required|invalid/.test(text);
}

function extractRedirectPaths(text: string): { source: string; destination: string } | null {
  const paths = extractMattamyPaths(text);

  if (paths.length >= 2) {
    return {
      source: paths[0],
      destination: paths[1],
    };
  }

  if (paths.length === 1) {
    return {
      source: paths[0],
      destination: paths[0],
    };
  }

  return null;
}

function extractMattamyPaths(text: string): string[] {
  const urlMatches = text.match(/(?:https?:\/\/)?(?:www\.)?mattamyhomes\.com\/[^\s,"')]+/gi) ?? [];
  const paths = urlMatches
    .map(toPath)
    .filter((pathValue): pathValue is string => Boolean(pathValue));

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

fs.writeFileSync(outputPath, JSON.stringify({ tests: automationTests }, null, 2));

console.log('Automation JSON generated successfully');
