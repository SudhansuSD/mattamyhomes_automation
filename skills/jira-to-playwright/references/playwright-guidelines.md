# Playwright Guidelines

## Structure

- Use `@playwright/test` and a single `test.describe` per Jira issue key.
- One Playwright `test()` per manual test case when practical.
- Keep tests independent and reuse existing page objects.

## Naming

- File name: `<ISSUE-KEY>.spec.ts`
- Describe block: `<ISSUE-KEY> - <summary>`
- Test title: manual test `Title`

## Selectors

- Prefer `data-testid`, role-based selectors, or stable text.
- Avoid brittle CSS and XPath where a semantic locator exists.

## Repo Alignment

- Reuse page objects under `pages/`
- Keep shared data in `config/` and `data/`
- Match existing tag patterns such as `@smoke`, `@sanity`, and `@regression`
