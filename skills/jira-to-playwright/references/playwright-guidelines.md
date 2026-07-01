# Playwright Guidelines

## Structure

- Use `@playwright/test` and a single `test.describe` per Jira issue key.
- One Playwright `test()` per manual test case when practical.
- Keep tests independent and reuse existing page objects.

## Location

- Specs go **directly** under `tests/` as `tests/<ISSUE-KEY>.spec.ts`.
- Do not write to `tests/generated/` — that path is deprecated.

## Naming

- File name: `<ISSUE-KEY>.spec.ts`
- Describe block: `<ISSUE-KEY> - <summary>`
- Test title: manual test `Title`

## Selectors

- Prefer `data-testid`, role-based selectors, or stable text.
- Avoid brittle CSS and XPath where a semantic locator exists.

## Page Objects

- Reuse existing page objects under `pages/` first; add methods to them when the
  behavior belongs to a page already modeled.
- Create a new `pages/<Feature>Page.ts` (extending `BasePage` or `SearchablePage`)
  **only** when the ticket introduces functionality no existing page object covers.
- Keep raw locator work inside page objects; specs call intent-named methods only.

## Repo Alignment

- Keep shared data in `config/` and `data/`; pull values from `getLocationConfig()`.
- Match existing tag patterns such as `@ci`, `@smoke`, `@sanity`, and `@regression`.
