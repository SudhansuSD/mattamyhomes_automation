---
description: Fetch a Jira ticket via the Atlassian MCP connector (no API token) and write data/requirement-input.json for the generate:* pipeline.
argument-hint: <TICKET-ID>
---

Fetch Jira ticket **$ARGUMENTS** using the **Atlassian MCP connector** and produce the
requirement input the test-generation pipeline consumes — **without** `JIRA_API_TOKEN`.

This is the token-free, human-in-the-loop path. It complements (does not replace) the
automated/CI path `npm run jira:fetch` in [scripts/fetch-jira-requirement.ts](../../scripts/fetch-jira-requirement.ts),
which stays token-based for unattended runs.

## Steps

1. **Resolve the site.** Call `getAccessibleAtlassianResources` to get the `cloudId`
   (site: `exsquared.atlassian.net`).
2. **Fetch the issue.** Call `getJiraIssue` with that `cloudId`,
   `issueIdOrKey: "$ARGUMENTS"`, `responseContentFormat: "markdown"`, and
   `fields: ["summary","description","labels","comment","status","priority","issuetype"]`.
   If the ticket key is malformed or not found, stop and report it — do not fabricate data.
3. **Normalize to the `RequirementInput` shape** (exactly these keys, in this order — must
   match [scripts/fetch-jira-requirement.ts](../../scripts/fetch-jira-requirement.ts) `toRequirementInput`):
   - `ticket` — the issue key
   - `summary` — `fields.summary`
   - `description` — `fields.description` as plain text. Unwrap Outlook safelinks
     (`[https://real…](https://nam*.safelinks.protection.outlook.com/…)` → keep the real
     `https://real…` URL, drop tracking params). Keep numbered task lists readable.
   - `acceptanceCriteria` — `string[]`. Extract from an explicit "Acceptance Criteria"
     section if present; otherwise `[]`. Never emit `"[object Object]"`.
   - `comments` — `string[]`, one entry per comment as plain text. Convert
     `<custom data-type="mention">@Name</custom>` → `@Name`; drop blob/image
     placeholders (`![](blob:…)`); trim. Skip comments that are empty after cleaning.
   - `labels` — `fields.labels` (array of strings)
4. **Write** the normalized JSON (2-space indent) to `data/requirement-input.json`.
5. **Write** the fetched issue to `data/jira/<TICKET>.json` (uppercased key) for traceability.
6. **Report** the written paths and remind the user to continue with the unchanged pipeline:
   ```bash
   npm run generate:testcases
   npm run generate:automation
   ```

## Guardrails

- Do **not** call `utils/jiraClient.ts` or read `JIRA_API_TOKEN` — this path is deliberately token-free.
- Only read/normalize the ticket; do not edit the Jira issue unless explicitly asked.
- The `RequirementInput` key set must stay identical to the CI script so both paths feed the
  generators the same shape.
