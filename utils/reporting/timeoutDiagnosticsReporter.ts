// Appends the still-running action to a timed-out test's error, which Playwright omits.
// Must be registered before allure-playwright so Allure sees the detail.
import type { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

type RankedStep = {
  step: TestStep;
  depth: number;
};

/** Flattens the step tree, keeping each step's depth. */
function flattenSteps(steps: TestStep[], depth = 0, collected: RankedStep[] = []): RankedStep[] {
  for (const step of steps) {
    collected.push({ step, depth });
    flattenSteps(step.steps, depth + 1, collected);
  }

  return collected;
}

/** Finds the deepest errored step (latest start on ties): the call that hung. */
function findHungStep(result: TestResult): TestStep | null {
  const errored = flattenSteps(result.steps).filter(({ step }) => Boolean(step.error));

  if (errored.length === 0) {
    return null;
  }

  return errored.reduce((deepest, candidate) => {
    if (candidate.depth !== deepest.depth) {
      return candidate.depth > deepest.depth ? candidate : deepest;
    }

    return candidate.step.startTime > deepest.step.startTime ? candidate : deepest;
  }).step;
}

/** Repo-relative `file:line` of the step's call site. */
function formatLocation(step: TestStep): string {
  if (!step.location) {
    return '';
  }

  const relativeFile = step.location.file
    .replace(process.cwd(), '')
    .replace(/^[\\/]/, '')
    .replace(/\\/g, '/');

  return ` at ${relativeFile}:${step.location.line}`;
}

/** How long the hung step had been waiting. */
function formatWaited(step: TestStep): string {
  return step.duration >= 0 ? ` after ${(step.duration / 1000).toFixed(1)}s` : '';
}

class TimeoutDiagnosticsReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'timedOut') {
      return;
    }

    const step = findHungStep(result);
    const detail = step
      ? `${step.title}${formatLocation(step)}${formatWaited(step)}`
      : 'not recorded in any step — the hang was outside a tracked action';

    // One sentence, since the email shows one line per failure.
    const diagnostic = `Hung action: ${detail} (budget ${test.timeout}ms).`;

    if (result.error) {
      result.error.message = `${result.error.message ?? ''}\n${diagnostic}`.trim();
    } else {
      result.errors.push({ message: diagnostic });
    }
  }
}

export default TimeoutDiagnosticsReporter;
