/**
 * Names the action that was still running when a test ran out of budget.
 *
 * Playwright's primary error stops at `Test timeout of 120000ms exceeded while
 * running "beforeEach" hook.` — it says the budget expired but not what was
 * hanging, and that primary error is the one Allure records as the status
 * message, so the report and the email summary lose the detail. Triage then
 * means opening the trace by hand.
 *
 * A wedged browser makes that worse: the in-flight call can outlive its own
 * timeout (a 5s `waitFor` once burned 393s because the page stopped answering
 * the driver), so the hanging call is exactly what a reader needs named.
 *
 * Registered ahead of `allure-playwright` in playwright.config.ts: reporters
 * receive the same TestResult instance in registration order, so appending here
 * puts the detail into the error before Allure reads it.
 */
import type { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

type RankedStep = {
  step: TestStep;
  depth: number;
};

/** Flattens the step tree, keeping each step's depth so the innermost one can win. */
function flattenSteps(steps: TestStep[], depth = 0, collected: RankedStep[] = []): RankedStep[] {
  for (const step of steps) {
    collected.push({ step, depth });
    flattenSteps(step.steps, depth + 1, collected);
  }

  return collected;
}

/**
 * The deepest errored step — the innermost call still waiting when the budget
 * expired. Playwright marks it and every ancestor as failed, so depth is what
 * separates `Wait for selector ...` from the `beforeEach hook` wrapping it.
 * Ties break on the latest start, which is the most recent attempt.
 */
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

/** Repo-relative `file:line` for the call site, so the hanging line is one click away. */
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

/** How long the hung step had been waiting, which is normally the whole budget. */
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

    // Kept to one short sentence: it is appended to the status message that the
    // email report renders as a single line per failed scenario.
    const diagnostic = `Hung action: ${detail} (budget ${test.timeout}ms).`;

    // Downstream reporters share this TestResult, so appending here is what puts
    // the diagnostic into the Allure report and the email summary.
    if (result.error) {
      result.error.message = `${result.error.message ?? ''}\n${diagnostic}`.trim();
    } else {
      result.errors.push({ message: diagnostic });
    }
  }
}

export default TimeoutDiagnosticsReporter;
