---
name: jira-to-testcases
description: Convert Jira-derived input into structured manual-style test case JSON using the repository generator script. Use when Codex needs to transform Jira summary and description content into `data/jira-testcases.json` or into ticket-specific manual test files.
---

# Jira To Testcases

## Overview

Generate structured test cases from Jira input already saved in repo data files.

## Workflow

### 1. Prepare Input

Place normalized Jira content in:

```text
data/jira-ai-input.json
```

Expected fields:
- `summary`
- `description`
- `labels`

### 2. Generate Test Case JSON

Run:

```powershell
npx.cmd ts-node scripts/generate-testcases.ts
```

This writes:

```text
data/jira-testcases.json
```

### 3. Convert JSON Into Manual Tests

When the user wants human-readable test cases, create ticket-specific files like:
- `manual-tests-MTTMY-2026.md`
- `manual-tests-MTTMY-2048.md`

Do not overwrite manual test files from other tickets. Keep one file per Jira ticket.
