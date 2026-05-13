---
name: jira-to-playwright
description: Fetch Jira requirements or user stories, draft manual test cases in the standard template, and generate TypeScript Playwright test skeletons. Use when tasks involve Jira issue keys or JQL, requirement extraction, manual test case authoring, or Playwright automation generation for this repository.
---

# Jira To Playwright

## Overview

Turn Jira requirements into manual test cases and TypeScript Playwright tests in a repeatable flow for this workspace.

## Workflow

### 1. Fetch Requirements From Jira

Use the bundled `scripts/jira_fetch.py` script and provide Jira access through environment variables.

Required environment variables:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

Examples:

```powershell
python skills/jira-to-playwright/scripts/jira_fetch.py --issue ABC-123 --format md --out requirements-ABC-123.md
python skills/jira-to-playwright/scripts/jira_fetch.py --jql "project = ABC AND issuetype = Story" --format json --out jira-search.json
```

If the Jira description is vague or incomplete, write assumptions explicitly before drafting tests.

### 2. Draft Manual Test Cases

Write ticket-specific files such as `manual-tests-ABC-123.md` and do not overwrite existing ticket files. Use `references/manual-test-template.md` as the format.

### 3. Generate Playwright Coverage

Create ticket-specific Playwright specs such as `tests/ABC-123.spec.ts`. Follow the conventions in `references/playwright-guidelines.md` and align with the existing page-object structure in the repo.

## Outputs

Prefer ticket-specific outputs:
- `requirements-<ISSUE-KEY>.md`
- `manual-tests-<ISSUE-KEY>.md`
- `tests/<ISSUE-KEY>.spec.ts`

## Resources

- `scripts/jira_fetch.py`
- `references/manual-test-template.md`
- `references/playwright-guidelines.md`
