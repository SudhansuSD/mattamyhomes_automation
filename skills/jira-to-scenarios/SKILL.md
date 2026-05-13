---
name: jira-to-scenarios
description: Fetch a Jira issue and convert it into repository-ready scenario JSON using the workspace Jira scenario pipeline. Use when Codex needs Jira issue content transformed into `data/jira-scenarios.json` for downstream scenario-driven test generation.
---

# Jira To Scenarios

## Overview

Use the workspace Jira conversion utilities to turn a Jira issue into scenario JSON.

## Workflow

### 1. Confirm Jira Environment

The repo utilities expect:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

### 2. Fetch And Convert

Use the workspace script:

```powershell
npx.cmd ts-node scripts/fetch-jira-scenarios.ts MTTMY-2018
```

This uses:
- `utils/jiraClient.ts`
- `utils/jiraToScenario.ts`
- `utils/jiraParser.ts`

### 3. Review Output

Verify that `data/jira-scenarios.json` contains:
- A feature title
- Clean scenario names
- Structured steps

If the issue text is noisy or malformed, clean the scenario output before using it downstream.
