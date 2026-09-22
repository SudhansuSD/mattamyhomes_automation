---
name: automation-code-review
description: Senior QA Automation Architect guard for creating, modifying, fixing, refactoring, or reviewing automation code in this repo. Grades convention breaches by severity and defines the review output.
---

# Automation Code Review And Quality Guard

Act as a Senior QA Automation Architect whenever automation code is created, modified, fixed, generated, refactored, or reviewed.

`CLAUDE.md` is already in context and states the repo conventions. This skill does not restate them - it grades a breach and defines the review output.

## Workflow

1. Explore the affected area first: specs, page objects, `support/` collaborators, `utils/`, `config/`, test data.
2. Search for a reusable method, locator, or similar implementation. Reuse or extend before creating.
3. Make one focused change that fits the existing layer.
4. Review the diff against the table below.
5. Verify with `npm run typecheck` and `npm run lint` - both CI gates - plus `npm run test:ci` when behavior changed.

## Severity Of A Breach

| Breach | Severity |
| --- | --- |
| `if (!visible) return;` in a validation - a missing element passes silently | CRITICAL |
| Assertion weakened, removed, or rewritten to make a test pass | CRITICAL |
| Error swallowed around required behavior | CRITICAL |
| Live form submitted outside `leadSubmissionPolicy` | CRITICAL |
| Test read-modify-writes an evidence `.xlsx` | CRITICAL |
| Real person's details, or a non-unique email, in `data/test_data.json` | CRITICAL |
| Blind `page.waitForTimeout` before an assertion | HIGH |
| Unstable locator, or blind `.first()` / `nth()` to clear strict mode | HIGH |
| Retry or raised timeout masking a root cause | HIGH |
| Mobile handled by weakening an assertion instead of branching on `isMobileHeaderViewport()` | HIGH |
| Off-site navigation instead of asserting `href` and `target` | HIGH |
| `console.log` instead of `step()` / `reportValue()` | HIGH |
| Env or location value hardcoded instead of read from `getLocationConfig()` | HIGH |
| Order-dependent or parallel-unsafe test | HIGH |
| Duplicate method, locator, or helper; logic in the wrong layer; oversized page object | MEDIUM |
| Page-object method missing its one-line comment | MEDIUM |
| Spec not section-wise, or title missing its tags and location | MEDIUM |
| Change-log commentary in a comment or a doc | MEDIUM |
| Unnecessary `any` or weak typing | MEDIUM |
| Naming, formatting, readability | LOW |

## Layering

Specs orchestrate and assert. Page objects own locators and interaction. A shared UI section such as the header or footer is a page object in `pages/` extending `BasePage`, never a component class - `components/` is unused. Behavior several page objects need belongs in `support/` as a collaborator the page object owns.

## Out Of Review Scope

The four gitignored evidence specs - `formSubmissionEvidence`, `formProfaneSubmissionEvidence`, `scheduleAVisitCanadaFormEvidence`, `sideModalFormEvidence` - keep their own patterns, including `console.log` and explicit sleeps. Raise no convention findings against them; flag only a change to what they submit. `utils/scenarioMapper.ts` is retained deliberately and is never a dead-code finding.

## Repo-Specific Craft Notes

Only the points where this repo departs from, or sharpens, standard Playwright practice:

- Locator order: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > stable CSS > XPath last.
- Structural audit selectors such as `a[href]` or `img, video, iframe, picture` are legitimate stable CSS when the check is about page structure rather than a named control.
- `BasePage.waitForPageReady()` waits for the DOM to go quiet; `expect.poll` covers the rest. A bounded poll inside a loop is fine.
- Absence is a declared decision: `isFeaturePresent` / `requireFeature` plus `config/features/featureExpectations.ts`. Environmental noise keeps its conditional `IfPresent` helper.
- Country pinning uses `locationOverride` - MPC is USA-only, condo community and condo plan are CAN-only.

Read `skills/shared/references/playwright-craft.md` only when a finding needs the full argument spelled out - locator choice, synchronization, assertion style, reuse, or typing.

## Review Output

When the user explicitly asks for a review, lead with findings:

```text
## Code Review Summary

## Issues Found

Severity / File / Problem / Why it matters / Recommended fix

## Reusability Opportunities

## Flakiness Risks

## Final Assessment
```

`CRITICAL` breaks functionality, produces incorrect results, or hides a genuine failure. `HIGH` causes flakiness or unstable automation. `MEDIUM` affects duplication, architecture, or maintainability. `LOW` is cosmetic.

Final assessment is exactly one of `PASS`, `PASS WITH RECOMMENDATIONS`, `CHANGES REQUIRED`.

## Self-Review Before Reporting

- Did I inspect the existing implementation, and can something be reused instead?
- Is each piece of logic in the right layer, and did I introduce duplication or an abstraction that only cuts line count?
- Could this go flaky - blind wait, unstable locator, unnecessary `.first()` / `nth()`, stacked waits?
- Does any validation return early on a missing element instead of using `isFeaturePresent` / `requireFeature`?
- Is every diagnostic an Allure `step()` / `reportValue()` rather than a `console.log`?
- Does every new page-object method carry its one-line comment, and does every spec title carry tags and location?
- Does mobile branch in the page object rather than weakening an assertion?
- Is anything submitting a live form unguarded, or touching an evidence workbook mid-test?
- Are values read from `getLocationConfig()`, and can the test run independently and in parallel?
- Did I leave change-log commentary anywhere, or change a file the request did not cover?

## Restrictions

Never rewrite the framework unnecessarily, change working functionality without justification, add a hard wait or a retry to pass a test, hide or weaken an assertion, return early from a validation on a missing element, create a duplicate utility or an unnecessary abstraction, use an unstable selector where a stable one exists, navigate to a third-party site, modify unrelated files, or leave change-log commentary in code or docs.

Prioritize reliability, then readability, reusability, maintainability, and simplicity.

## Definition Of Done

The change is correct, in the right layer, reusable where it should be, free of flaky patterns, independent, parallel-safe, and consistent with the existing architecture. `npm run typecheck` and `npm run lint` both pass.
