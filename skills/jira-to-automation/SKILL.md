---
name: jira-to-automation
description: Convert generated Jira test case JSON into automation-oriented action JSON using the repository automation generator. Use when Codex needs to build `data/automation-tests.json` or turn Jira/manual test case data into Playwright-ready automation planning artifacts.
---

# Jira To Automation

## Overview

Use the workspace generator to transform Jira test case JSON into automation action data.

## Workflow

### 1. Confirm Inputs

Required:
- `data/jira-testcases.json`

Optional enrichment:
- `data/jira-ai-input.json`

### 2. Generate Automation JSON

Run:

```powershell
npx.cmd ts-node scripts/generate-automation.ts
```

This writes:

```text
data/automation-tests.json
```

### 3. Turn JSON Into Playwright Specs

Use the generated actions as planning input, then create or update repository specs under `tests/generated/`. Reuse existing page objects under `pages/` and keep generated test files ticket-specific when possible.
