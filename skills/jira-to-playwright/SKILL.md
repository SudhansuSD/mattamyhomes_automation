---
name: jira-to-playwright
description: Single end-to-end Jira automation skill. Fetch a Jira ticket (issue key or JQL), analyze its requirements, and create a runnable Playwright TypeScript spec directly under tests/, reusing existing page objects in pages/ and adding a new page object only when the ticket introduces functionality the framework does not already cover. Use for any Jira-driven test automation in this repo.
---

# Jira To Playwright

The one skill for turning a Jira ticket into automation in this repository. There is intentionally no separate "scenarios", "testcases", or "automation" skill — this skill owns the full flow so coverage is never duplicated across skills.

## Outcome

For a ticket like `MTTMY-2026`, the skill produces:

- One spec file: `tests/MTTMY-2026.spec.ts` (directly under `tests/`, **not** `tests/generated/`).
- Reuse of existing page objects in `pages/`.
- A new page object under `pages/` **only** when the ticket needs functionality no existing page object provides.

## Workflow

### 1. Fetch the ticket

Use the framework-native fetcher (preferred — uses `utils/jiraClient.ts` and `.env`):

```powershell
npx.cmd ts-node scripts/fetch-jira-scenarios.ts MTTMY-2026
```

This writes a normalized scenario to `data/jira-scenarios.json` you can read for the summary, description, and steps. The JSON is a working input only — the deliverable is the spec under `tests/`, not the JSON.

Alternative when you only need the raw issue text:

```powershell
python skills/jira-to-playwright/scripts/jira_fetch.py --issue MTTMY-2026 --format md
```

Required environment variables: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`.

If the description is vague, write your assumptions explicitly before generating the spec.

### 2. Check the framework before writing anything (no duplicates)

Always inspect the repo first:

- `pages/` — does a page object already cover this area? (`HomePage`, `SearchPage`, `QMIPage`, `PlanDetailPage`, `CommunityPage`, `CondoCommunityPage`, `CondoPlanPage`, `MarketPage`, `MPCPage`, `ContactPage`, `CustomerCarePage`, `PromoPage`, `AboutUsPage`, `StaticLegalPage`, `Header`, `Footer`.) All page objects extend `BasePage` or `SearchablePage`.
- `tests/` — does a spec already cover this flow? Extend it instead of creating a near-duplicate spec.
- `config/locations/` — reuse `getLocationConfig()` for country/market/community/plan/QMI data instead of hardcoding.

### 3. Reuse existing page objects

Compose the spec from methods that already exist. Add a method to an existing page object when the new behavior belongs to a page the framework already models (e.g. a new assertion on `QMIPage`).

### 4. Add a new page object only for new functionality

If the ticket introduces a page or feature with no existing model, create `pages/<Feature>Page.ts` that:

- Extends `BasePage` (or `SearchablePage` if it has the site search box).
- Declares locators in the constructor (prefer `data-testid`, role, or stable text; avoid brittle CSS/XPath).
- Exposes intent-named async methods (`verify...`, `validate...`, `search...`) — no raw locator work in the spec.

### 5. Create the spec under tests/

Write `tests/<ISSUE-KEY>.spec.ts` following the existing convention (see `tests/homePage.spec.ts`):

- `import { test } from '@playwright/test';`
- One `test.describe('<ISSUE-KEY> - <summary>', ...)` per ticket.
- `beforeEach` instantiates the page object and navigates.
- One `test()` per scenario, body wrapped in `test.step(...)`.
- Tag tests with the repo's tags: `@ci`, `@smoke`, `@sanity`, `@regression`.
- Pull data from `getLocationConfig()` / env, not hardcoded values.

### 6. Verify

Run the generated spec and report the command, files created/updated, and covered scenarios:

```powershell
npx playwright test tests/MTTMY-2026.spec.ts
```

## Resources

- `scripts/jira_fetch.py` — raw Jira fetch fallback.
- `references/manual-test-template.md` — manual test-case format when human-readable cases are requested.
- `references/playwright-guidelines.md` — spec structure, naming, selectors, repo alignment.
