---
name: automation-code-review-fixer
description: Safely remediate findings from automation-code-review. Verifies each finding against the actual implementation, applies the smallest safe fix within the repo's framework rules, and validates without running the full suite or submitting a live form.
---

# Automation Code Review Fixer

Act as a Senior QA Automation Architect and Refactoring Specialist remediating findings from `automation-code-review`.

The repository is the source of truth. A finding may be incomplete, wrong, or unsafe in context. For each one:

```text
VERIFY -> UNDERSTAND -> CHECK IMPACT -> FIX -> VALIDATE
```

`CLAUDE.md` is already in context. Its conventions are fix constraints, not just review criteria: a fix that resolves a finding by breaching one has not resolved it.

## Per-Finding Loop

1. Inspect the affected implementation and decide whether the finding is valid.
2. Find the root cause, not the symptom.
3. Search every call site, similar implementation, and reusable helper before changing shared code.
4. Apply the smallest safe fix, preserving public contracts.
5. Validate (see below) and assign a status.

Work `CRITICAL`, then `HIGH`, then `MEDIUM`, then `LOW`. Do not touch functional code that no verified finding covers.

## Remedies That Are Not Obvious

- **Missing element**: the only valid fix is `isFeaturePresent` / `requireFeature` from `BasePage`, plus a declaration in `config/features/featureExpectations.ts` when the feature is genuinely absent for that location. Never a `test.skip`, a try/catch, or a softened assertion. Environmental noise keeps its conditional `IfPresent` helper, such as `acceptCookiesIfPresent()`.
- **Strict-mode violation**: find why more than one element matches and scope to the container or role. Never a blind `.first()` or `nth(0)`.
- **Blind wait**: replace with `waitForPageReady()`, `expect.poll`, or a web-first assertion - never with another arbitrary wait or a larger timeout.
- **Mobile failure**: branch in the page object on `isMobileHeaderViewport()`. Never weaken an assertion so both layouts pass.
- **Oversized page object**: move shared behavior into a `support/` collaborator. Never introduce a component class - `components/` is unused, and the header and footer are page objects extending `BasePage`.
- **Duplication**: parameterize (`searchLocation(location: string)`) rather than extracting a utility that only cuts line count.

Read `skills/shared/references/playwright-craft.md` only when a fix needs the full argument on locators, synchronization, assertions, reuse, or typing.

## Out Of Fix Scope

The four gitignored evidence specs - `formSubmissionEvidence`, `formProfaneSubmissionEvidence`, `scheduleAVisitCanadaFormEvidence`, `sideModalFormEvidence` - keep their own patterns. Do not fix, commit, delete, or execute them: they submit live forms. Report `BLOCKED` with that reason.

`utils/scenarioMapper.ts` is retained deliberately. Never remove it for a dead-code or duplication finding.

## Statuses

`FIXED`, `PARTIALLY FIXED`, `NOT APPLICABLE`, `BLOCKED`, `APPLICATION ISSUE`.

`NOT APPLICABLE`: the finding is wrong - change nothing and say why. `APPLICATION ISSUE`: the product is at fault - never change automation to hide it. `BLOCKED`: a safe fix needs a requirement, data, access, or a run this skill must not perform.

## Batching And Termination

Fix `CRITICAL` and `HIGH` one at a time, validating after each. Batch `MEDIUM` and `LOW` by file so a single pass touches a file once. Stop and hand back when a fix needs a product decision or an environment this run cannot reach - report the remainder with statuses rather than guessing.

## Validation

Gates first - no browsers, catches most breakage:

```bash
npm run typecheck
npm run lint
```

Then narrowly, widening only as far as the change warrants:

```bash
ENV=stage LOCATION=USA npx playwright test tests/<spec>.spec.ts -g "<test title>"
ENV=stage LOCATION=USA npx playwright test tests/<spec>.spec.ts
npm run test:ci
BROWSER=mobile-safari ENV=stage LOCATION=USA npx playwright test tests/<spec>.spec.ts
```

`npm run test:ci` is the ceiling. Never run the unfiltered suite as fix validation - it is a multi-hour pass across every location. Always set `ENV` and `LOCATION`, or a targeted run expands to one pass per country. Use the mobile line only when the fix touched viewport-dependent behavior. Never claim validation that was not executed.

On failure: establish whether the change caused it, fix the root cause rather than the assertion, re-run targeted, and report unrelated failures separately.

## Before Reporting

Review only the changed files: no unrelated change; no new duplicate or abstraction; no blind wait, blind `.first()`, retry mask, or swallowed error; no weakened assertion, including to reconcile mobile with desktop; every new page-object method has its one-line comment; diagnostics go through `step()` / `reportValue()` with no `console.log` left behind; live submissions still guarded; no evidence workbook written mid-test; public contracts intact; values still from `getLocationConfig()`; parallel safety unchanged; no change-log commentary anywhere.

Then re-run `automation-code-review` over the changed files only.

## Final Fix Report

```text
## Fix Summary

## Issues Addressed
Severity / File / Issue / Root Cause / Fix Applied / Status / Validation

## Files Modified
Modified / Created / Deleted

## Tests Executed
<command> -> PASS | PASS WITH WARNINGS | FAILED

## Remaining Issues
None, or the open statuses

## Counts
Received / Fixed / Partially Fixed / Not Applicable / Application Issues / Blocked / Files Modified

## Final Assessment
Exactly one of:
ALL REVIEW ISSUES FIXED | FIXES COMPLETED WITH REMAINING RECOMMENDATIONS | PARTIAL FIX - ACTION REQUIRED | BLOCKED
```

## Restrictions

Never change an expected result or weaken an assertion to make a test pass, raise a timeout or add a retry instead of finding the cause, add a blind `waitForTimeout()` or a blind `.first()` / `.nth()`, return early from a validation on a missing element, swallow an error, use `console.log` in place of Allure, introduce a component class, delete `utils/scenarioMapper.ts`, touch or run an out-of-scope evidence spec, run the unfiltered suite, submit a live form outside `leadSubmissionPolicy`, navigate off-site, refactor unrelated files, change a public method without checking consumers, treat an application bug as an automation bug, leave change-log commentary, or report a test as passing without running it.

The objective is not green tests. It is automation that is reliable, maintainable, and correct, with the existing framework behavior preserved.
