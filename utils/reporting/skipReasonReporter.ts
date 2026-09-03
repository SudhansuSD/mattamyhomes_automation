/**
 * Carries a runtime skip reason into the Allure result.
 *
 * `test.skip(condition, reason)` called inside a hook or a test body appends its
 * annotation to `TestResult.annotations`, while allure-playwright reads the
 * reason from `TestCase.annotations`, which carries what was declared
 * statically. Every conditional skip in this suite is a runtime one, so the
 * report recorded them all as a bare "skipped" with an empty `statusDetails` -
 * a country that does not surface a page, a desktop-only check, and the
 * lead-submission pause were indistinguishable from a test skipped by accident.
 *
 * That is the whole point of these skips: absence is meant to be a recorded
 * decision, and a reason that never reaches the report is not recorded.
 *
 * Registered ahead of `allure-playwright` in playwright.config.ts: reporters
 * receive the same TestCase instance in registration order, so the annotation
 * copied here is in place before Allure reads it.
 */
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

/** The annotation types Allure turns into a skip reason. */
const SKIP_ANNOTATION_TYPES = new Set(['skip', 'fixme']);

export default class SkipReasonReporter implements Reporter {
  /** Copies this run's skip annotation onto the test case, where Allure looks for it. */
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'skipped') {
      return;
    }

    const skipAnnotation = result.annotations.find(
      (annotation) => SKIP_ANNOTATION_TYPES.has(annotation.type) && annotation.description,
    );

    if (!skipAnnotation) {
      return;
    }

    // A statically declared skip is already on the test case, and pushing a
    // second copy would leave Allure picking between duplicates.
    const alreadyRecorded = test.annotations.some(
      (annotation) =>
        SKIP_ANNOTATION_TYPES.has(annotation.type) &&
        annotation.description === skipAnnotation.description,
    );

    if (alreadyRecorded) {
      return;
    }

    test.annotations.push(skipAnnotation);
  }
}
