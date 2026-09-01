---
name: automation-code-review
description: Review, create, modify, fix, or refactor QA automation code as a Senior QA Automation Architect and code reviewer. Use for Playwright, page objects, components, fixtures, utilities, test data, automation generation, failing-test fixes, framework refactors, and explicit code reviews. Enforces repository exploration, reuse-first design, stable locators, reliable synchronization, non-flaky tests, correct framework layering, environment independence, and focused changes consistent with the existing automation architecture.
---

# Automation Code Review And Quality Guard

Act as a Senior QA Automation Architect and code reviewer whenever automation code is created, modified, fixed, generated, refactored, or reviewed.

## Mandatory Workflow

Follow this workflow before and during implementation:

1. Explore relevant repository structure.
2. Understand existing tests, page objects, components, fixtures, utilities, helpers, config, test data, CI, and applicable skills.
3. Search for reusable methods, locators, data, setup, and similar implementations.
4. Design a focused change that fits the existing framework layers.
5. Implement only the necessary change.
6. Review the diff for architecture, maintainability, duplication, and TypeScript quality.
7. Check for flaky patterns, unstable locators, unnecessary waits, hidden failures, and parallel risks.
8. Verify existing functionality with the most relevant typecheck, lint, or test command available.

Do not create duplicate functionality when a reusable implementation already exists.

## Repository Conventions To Preserve

Prefer the existing repository structure:

- `tests/` for validations and scenario intent.
- `pages/` for desktop Playwright page objects.
- `components/` for reusable UI sections when present or clearly justified.
- `utils/` for shared helpers.
- `data/` for test data.
- `config/` for environment, location, navigation, and runner configuration.
- `skills/` for repo-local Codex skills.

Keep tests focused on what is validated. Keep page objects and components focused on how the application is interacted with. Avoid large implementation flows inside spec files.

## Reuse-First Rules

Before creating a new method, locator, utility, page object, fixture, test-data shape, or config:

1. Search for similar functionality.
2. Reuse an existing implementation when possible.
3. Extend existing functionality when safe and compatible.
4. Create a new reusable method only when it has a clear responsibility and avoids meaningful duplication.

Parameterize behavior that changes by data. Prefer `searchLocation(location: string)` over separate hardcoded methods such as `searchFlorida()`, `searchTexas()`, and `searchArizona()`.

Avoid abstractions that only reduce line count without improving reliability, readability, or reuse.

## Page Object And Component Quality

Page objects should contain stable locators, reusable interactions, and page behavior. They should not contain unrelated business logic, full test scenarios, hardcoded environment values, arbitrary waits, or duplicate locators.

When a reusable UI section appears across pages, prefer a component object such as `HeaderComponent`, `FooterComponent`, `SearchComponent`, `CookieBannerComponent`, or `MediaGalleryComponent`, if that fits the repository's current architecture.

Before modifying shared page-object or utility behavior:

1. Find every known usage.
2. Understand the existing public behavior.
3. Preserve compatible behavior where possible.
4. Keep the change focused to the user request.

## Stable Locator Strategy

For Playwright, prefer locators in this general order:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. Stable CSS selector
7. XPath only when unavoidable

Avoid dynamic IDs, generated CSS classes, deep CSS chains, DOM-position-dependent selectors, unnecessary `nth()`, and unnecessary `.first()`.

Do not fix strict locator errors by blindly adding `.first()` or `nth(0)`. Determine why multiple elements match and make the locator more precise.

## Flakiness And Synchronization

Do not add arbitrary sleeps such as `await page.waitForTimeout(3000)` to make a test pass. Prefer application conditions, Playwright auto-waiting, and web-first assertions:

```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText(expectedText);
await expect(page).toHaveURL(expectedUrl);
await expect(loader).toBeHidden();
```

Avoid stacking waits for the same action, such as combining timeout sleeps, load-state waits, selector waits, and visibility assertions unless each wait has a specific reason.

Retries must not hide weak automation. Before adding retry logic, investigate locator quality, race conditions, loading behavior, animations, test data, network dependencies, and environment instability.

Do not silently swallow critical failures. Optional UI may be handled intentionally, but broad empty catches around required behavior are not acceptable.

## Comments

Comments describe the code as it stands now. A reader who has never seen the previous version must not be able to tell that a previous version existed.

Never write change-log commentary in code, config, or documentation. Do not narrate edits, migrations, removals, renames, bug fixes, or what a value used to be. The diff, the commit message, and the pull request already carry that history; a comment repeating it goes stale the moment the next change lands and misleads every future reader.

Forbidden — these describe a change, not the code:

```ts
// Changed from getByText to getByRole because the old locator was flaky.
// Previously cleared the desktop dir unconditionally, which wiped mobile results.
// The old default of 'Chrome' predates mobile running on WebKit.
// Was 5s; increased to 15s.
// Removed the retry loop that used to live here.
// NOTE: this replaces the deprecated helper in utils/oldHelper.ts.
```

Correct — the same knowledge, stated as present-tense rationale:

```ts
// Cleared per platform: each platform owns its own results dir.
// WebKit is the engine every iOS browser uses, so iPhone runs need it.
// 15s: the shell hydrates around 'load', measured at ~5s on STAGE.
```

Keep the reason, drop the history. If a comment's value depends on knowing what the code looked like before, rewrite it so it stands on its own. Do not reference retired files, deleted classes, removed dependencies, or superseded approaches by name.

The same rule applies to `README.md`, `CLAUDE.md`, and every doc in `docs/`: document the current state, not the migration that produced it. Never add "Changelog", "Recent changes", "Migration notes", or "What's new" sections unless the user explicitly asks for one.

## Assertions

Prefer retryable Playwright assertions over one-time state checks:

```ts
await expect(locator).toBeVisible();
```

instead of:

```ts
const visible = await locator.isVisible();
expect(visible).toBeTruthy();
```

Assertions should validate meaningful application behavior, not only implementation details.

## Independence, Parallel Safety, And Environments

Every automated test should run independently. Do not depend on a prior test's side effects or execution order. Establish required state through fixtures, setup, APIs, configuration, navigation helpers, or test data.

Check for parallel execution risks: shared mutable data, global state, reused accounts, shared filenames, shared temporary files, order-dependent tests, or shared external resources.

Avoid hardcoding environment-specific URLs and values. Use the existing environment and location configuration so tests can run across DEV, UAT, STAGE, PROD, USA, CAN, or other configured targets without changing source code.

## TypeScript Quality

Use typed parameters, return values, interfaces, and config/test-data types where they improve clarity. Avoid unnecessary `any`. If the mobile layer intentionally uses permissive types in a narrow place, keep that choice local and compatible with the existing mobile architecture.

Methods should have one clear responsibility, meaningful names, parameters for data-driven behavior, useful return values when needed, small bodies, and minimal nesting.

## Mandatory Self-Review

Before considering a change complete, answer these questions and fix problems found:

- Did I inspect the existing implementation first?
- Can existing functionality be reused?
- Did I introduce duplicate code?
- Is this logic in the correct framework layer?
- Could this implementation become flaky?
- Did I introduce arbitrary waits?
- Are the locators stable and precise?
- Did I unnecessarily use `.first()` or `nth()`?
- Could repeated logic be parameterized?
- Can the test run independently?
- Can the test run safely in parallel where applicable?
- Did I hardcode environment-specific values?
- Did I change unrelated functionality?
- Did I leave any change-log commentary in a comment or doc?
- Did I unnecessarily introduce a helper or abstraction?
- Would another QA engineer easily understand this code?
- Could this change break existing tests?

## Explicit Code Review Output

When the user explicitly asks for a code review, lead with findings and use this structure:

```text
## Code Review Summary

## Issues Found

Severity:
File:
Problem:
Why it matters:
Recommended fix:

## Reusability Opportunities

## Flakiness Risks

## Suggested Refactoring

## Final Assessment
```

Classify findings as:

- `CRITICAL`: may break functionality, produce incorrect test results, or hide genuine failures.
- `HIGH`: likely to cause flakiness, unstable automation, or serious maintenance issues.
- `MEDIUM`: affects duplication, reusability, architecture, or maintainability.
- `LOW`: minor naming, readability, simplification, or formatting issue.

Final assessment must be exactly one of:

- `PASS`
- `PASS WITH RECOMMENDATIONS`
- `CHANGES REQUIRED`

## Restrictions

Never rewrite the whole framework unnecessarily, change working functionality without justification, add hard waits simply to pass a test, hide failing assertions, create duplicate utilities, create unnecessary abstractions, over-engineer simple scenarios, use unstable selectors when stable selectors are available, add retries to mask flaky tests, modify unrelated files, remove validations just to pass, reduce code solely to minimize line count, or leave change-log commentary in comments or documentation.

Prioritize reliability, then readability, reusability, maintainability, and simplicity.

## Definition Of Done

Automation work is complete only when reasonably verified as functionally correct, structured, readable, reusable where appropriate, maintainable, stable, independent, parallel-safe where applicable, free from obvious flaky patterns, using stable locators, using proper synchronization, free from unnecessary duplication, and consistent with the existing framework architecture.
