// Copies runtime skip reasons from TestResult onto TestCase, where allure-playwright reads them.
// Must be registered before allure-playwright.
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

/** The annotation types Allure turns into a skip reason. */
const SKIP_ANNOTATION_TYPES = new Set(['skip', 'fixme']);

export default class SkipReasonReporter implements Reporter {
  /** Copies this run's skip annotation onto the test case. */
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

    // Static skips are already on the test case; avoid duplicates.
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
