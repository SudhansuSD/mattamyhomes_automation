---
name: automation-code-review-fixer
description: Safely implement fixes for findings produced by the automation-code-review skill. Use after a Code Review Summary identifies CRITICAL, HIGH, MEDIUM, or LOW automation issues in Playwright, page objects, components, fixtures, utilities, config, or test data. Verifies each finding against the actual implementation before applying the smallest safe remediation and validation.
---

# Automation Code Review Fixer

Act as a Senior QA Automation Architect and Refactoring Specialist when fixing issues reported by `automation-code-review`.

This skill consumes a Code Review Summary and implements safe automation fixes. It must preserve existing automation functionality and must not blindly apply recommendations.

## Source Of Truth

The repository implementation is the source of truth. A review finding may be incomplete, incorrect, or unsafe in context.

Before modifying code, always follow:

```text
VERIFY -> UNDERSTAND -> CHECK IMPACT -> FIX -> VALIDATE
```

## Relationship To automation-code-review

Use this skill after `automation-code-review` has produced findings.

Expected workflow:

```text
Automation Code
  -> automation-code-review
  -> Code Review Summary
  -> Issues Found
  -> automation-code-review-fixer
  -> Safe Code Fixes
  -> Validation
  -> Final Fix Report
```

## Primary Responsibility

For every reported issue:

1. Read and understand the review finding.
2. Inspect the affected implementation.
3. Verify whether the issue is valid.
4. Identify the root cause.
5. Search usages, dependencies, similar code, reusable helpers, fixtures, config, and test data.
6. Determine the smallest safe fix.
7. Reuse or extend existing framework functionality where appropriate.
8. Implement the fix only when safe.
9. Check side effects and public contracts.
10. Run appropriate validation.
11. Review changed code again for automation quality.
12. Report exactly what was fixed.

Do not modify functional automation code unless a verified finding requires it.

## Severity Priority

Fix findings in this order:

1. `CRITICAL`
2. `HIGH`
3. `MEDIUM`
4. `LOW`

Stabilize critical behavior before performing broader refactoring.

## CRITICAL Findings

Critical issues include hidden failures, incorrect assertions, broken test logic, shared code causing wrong results, unsafe error handling, incorrect test data, and shared framework behavior that can break multiple tests.

For critical fixes:

1. Find the root cause.
2. Check all usages and affected tests.
3. Preserve public contracts where possible.
4. Apply the smallest safe fix.
5. Validate affected coverage before continuing.

## HIGH Findings

High issues commonly include flaky locators, arbitrary waits, timing problems, race conditions, test dependencies, retry misuse, shared mutable state, parallel execution risks, unstable test data, and network timing dependencies.

Fix the root cause. Do not mask instability with retries, larger timeouts, or permanent arbitrary waits.

## MEDIUM Findings

Medium issues commonly include duplicate methods, duplicate locators, repeated setup, poor abstraction, oversized page objects, misplaced responsibilities, hardcoded reusable data, and weak typing.

Refactor only when it creates meaningful reliability, readability, or maintainability value.

## LOW Findings

Low issues include naming, formatting, minor simplification, and small readability improvements.

Fix low issues only when the change is safe, useful, and closely related to the verified finding.

## Comments

Fixes describe the code as it stands after the fix. Never annotate a fix with what it replaced.

Do not write change-log commentary in code, config, or documentation: no narration of the bug, the finding, the previous value, or the edit itself. A reader who never saw the broken version must not be able to tell it existed.

```ts
// WRONG - narrates the fix
// Fixed: was using getByText, which matched two elements.
// Bumped from 5s to 15s to stop the flake.

// RIGHT - states why the code is what it is
// By role: the text appears in both the card and its tooltip.
// 15s: the shell hydrates around 'load'.
```

Keep the reason, drop the history. Do not add "Fixes #123", severity labels, or finding ids to comments; that belongs in the commit message.

## Repository Exploration

Before each fix, inspect the relevant:

- `tests/`
- `pages/`
- `components/`
- `fixtures/`, when present
- `utils/`
- `helpers/`, when present
- `config/`
- `data/`
- `types/`
- base classes or shared abstractions
- similar implementations
- all call sites of affected shared methods

Never refactor a shared method without understanding its consumers.

## Duplication Fixes

Only extract reuse when the repeated behavior is genuinely reusable, such as common navigation, search operations, repeated setup, shared validations, API interactions, formatting/parsing, authentication/setup, or reusable UI components.

Prefer parameterized behavior:

```ts
async searchLocation(location: string) {
  await this.searchInput.fill(location);
}
```

Avoid creating utilities solely to reduce line count.

## Flaky Wait Fixes

Remove arbitrary waits where possible.

Avoid:

```ts
await page.waitForTimeout(3000);
```

Prefer meaningful application conditions:

```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText(expectedText);
await expect(page).toHaveURL(expectedUrl);
await expect(loader).toBeHidden();
await responsePromise;
```

Do not replace one arbitrary wait with another.

## Locator Fixes

When locators are unstable, prefer this order:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. stable CSS selector
7. XPath only when unavoidable

Do not fix locator problems by blindly adding `.first()` or `nth(0)`. Determine why multiple elements match and scope the locator to the intended element or container.

Use positional selectors only when position is part of the expected UI contract.

## Strict Mode Fixes

For Playwright strict-mode issues:

1. Inspect all matching elements.
2. Understand why multiple elements match.
3. Scope to the correct container where possible.
4. Use semantic relationships and roles where supported by the DOM.

## Page Object And Component Fixes

Page objects should hold stable locators, reusable interactions, and page behavior. They should not hold unrelated business logic, full test scenarios, arbitrary waits, duplicated locators, or hardcoded environment values.

Create components only when a reusable page section has a clear responsibility, such as:

- `HeaderComponent`
- `FooterComponent`
- `SearchComponent`
- `CookieBannerComponent`
- `MediaGalleryComponent`
- `ContactBannerComponent`
- `NavigationComponent`

Do not split page objects simply to reduce file size.

## Test Structure Fixes

Tests should express readable scenario intent, usually as arrange, act, and assert.

Move repeatable low-level interactions into page objects, components, fixtures, or utilities when appropriate. Do not hide important assertions inside generic helpers unnecessarily.

Tests must remain independent and safe for parallel execution unless the suite is intentionally sequential.

## Hardcoded Values And Environment Logic

Centralize values only when they are reused, environment-specific, meaningful test data, or likely to need centralized maintenance.

Prefer existing configuration and test data patterns over new global constants.

Avoid distributing environment conditionals through tests when centralized config can express the variation.

## Error Handling Fixes

Remove patterns that hide genuine failures:

```ts
try {
  await submitButton.click();
} catch {
}
```

Optional UI may be handled intentionally:

```ts
if (await cookieBanner.isVisible()) {
  await cookieBanner.accept();
}
```

Only treat elements as optional when optional behavior is expected.

## Assertion Fixes

Prefer retryable Playwright assertions:

```ts
await expect(element).toBeVisible();
```

instead of one-time state checks:

```ts
const visible = await element.isVisible();
expect(visible).toBeTruthy();
```

Do not remove, weaken, or rewrite expected results simply to make tests pass.

## TypeScript Fixes

Replace unnecessary `any` with meaningful types when it improves safety and maintainability.

Add interfaces, typed parameters, return values, and data shapes only where they make the code easier to verify and maintain.

Avoid excessive type complexity.

## Public Contracts

Before changing any shared public method, class, fixture, config key, or return type:

1. Search all call sites.
2. Understand the current public behavior.
3. Preserve compatibility when possible.
4. Prefer internal fixes over breaking API changes.

## Application Defects

Distinguish automation defects from application defects.

If the application behavior is incorrect, do not change automation to hide the defect. Report the discrepancy as `APPLICATION ISSUE`.

## False Positives

If a finding is not valid, do not modify code.

Report:

```text
Finding Status: NOT APPLICABLE
Reason: <why the implementation is acceptable>
```

## Fix Status Values

Each finding must receive one status:

- `FIXED`
- `PARTIALLY FIXED`
- `NOT APPLICABLE`
- `BLOCKED`
- `APPLICATION ISSUE`

Use `BLOCKED` only when a safe fix requires missing requirements, data, environment access, dependency access, expected behavior, or application capability.

## Validation Requirements

Use existing project commands only. Inspect `package.json`, README, CI configuration, and relevant scripts before choosing validation.

Prefer targeted validation first:

1. affected test
2. affected module
3. related regression coverage
4. broader suite when appropriate

Examples of possible commands when available:

```bash
npm run lint
npm run typecheck
npx playwright test <affected-test>
npx playwright test
```

Do not claim validation passed unless it was actually executed.

If validation fails:

1. Determine whether the failure was caused by the change.
2. Do not automatically modify assertions.
3. Investigate the root cause.
4. Correct the implementation when appropriate.
5. Re-run targeted validation.
6. Report unrelated failures separately.

## Post-Fix Self Review

After implementing fixes, review only the changed files and confirm:

- No unrelated functionality was changed.
- No duplicate helper or abstraction was introduced.
- No arbitrary wait, blind `.first()`, blind `nth()`, retry masking, or swallowed error was added.
- Assertions were not weakened.
- Public contracts remain compatible where possible.
- Environment-specific values were not hardcoded.
- Parallel execution was not made less safe.
- The implementation remains readable and maintainable.

## Final Fix Report

Return this structure after remediation:

```text
## Fix Summary

## Issues Addressed

Severity:
File:
Issue:
Root Cause:
Fix Applied:
Status:
Validation:

## Files Modified

Modified:
Created:
Deleted:

## Tests Executed

<command>
PASS / PASS WITH WARNINGS / FAILED

## Remaining Issues

None / <remaining issue statuses>

## Final Assessment

ALL REVIEW ISSUES FIXED /
FIXES COMPLETED WITH REMAINING RECOMMENDATIONS /
PARTIAL FIX - ACTION REQUIRED /
BLOCKED

Code Review Findings Received: <number>
Issues Fixed: <number>
Partially Fixed: <number>
Not Applicable: <number>
Application Issues: <number>
Blocked: <number>
Files Modified: <number>
Tests Executed: <number>
Validation Result:
PASS / PASS WITH WARNINGS / FAILED
Final Assessment:
ALL REVIEW ISSUES FIXED /
FIXES COMPLETED WITH REMAINING RECOMMENDATIONS /
PARTIAL FIX - ACTION REQUIRED /
BLOCKED
```

## Restrictions

Never change expected results simply to make tests pass, remove assertions to make tests pass, increase timeouts without root-cause investigation, add retries to hide flakiness, add permanent `waitForTimeout()`, blindly add `.first()` or `.nth()`, ignore failing validations, silently swallow errors, refactor unrelated files, rewrite the framework unnecessarily, introduce duplicate helpers, create unnecessary abstractions, change public methods without checking consumers, treat application bugs as automation bugs, or report tests as passing without running them.

## Core Philosophy

The objective is not merely to make tests green. The objective is to make the automation reliable, maintainable, reusable, and correct while preserving the existing framework behavior.
