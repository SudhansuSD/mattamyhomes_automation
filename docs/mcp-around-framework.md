# MCP Around The Automation Framework

MCP should sit around this repository as an assistant integration layer. The Playwright, WebdriverIO, and Appium tests still run normally; MCP helps collect context, inspect pages, and feed the existing generator scripts.

## Recommended MCP Use

| Area | MCP role | Repo handoff |
| --- | --- | --- |
| Requirement ingestion | Pull Jira story fields, acceptance criteria, labels, and useful comments | `data/mcp-requirement.json` or `data/jira-ai-input.json` |
| Test generation | Convert Jira/browser findings into structured scenarios and automation actions | `data/jira-testcases.json`, `data/automation-tests.json` |
| Debugging | Inspect live pages, selectors, console errors, network failures, and screenshots | Update page objects in `pages/` and specs in `tests/` |
| CI feedback | Summarize Jenkins/GitHub failures, reports, and logs | Feed failures back into focused fixes and regenerated specs |

## Best MCP Servers For This Repo

- Jira MCP: fetch issues, summaries, descriptions, acceptance criteria, comments, and labels.
- Browser or Playwright MCP: inspect Mattamy pages, validate selectors, reproduce UI behavior, and capture screenshots.
- GitHub MCP: inspect PRs, changed files, review comments, and workflow failures.
- Jenkins or CI MCP: collect build status, failed test names, logs, and report links.
- Filesystem/Git MCP: optional, useful outside Codex when the assistant does not already have workspace access.

## Handoff Format

Ask the MCP-enabled assistant to create `data/mcp-requirement.json` using this shape:

```json
{
  "ticket": "MTTMY-0000",
  "summary": "Requirement title",
  "description": "Requirement details, business rules, URLs, and observed behavior",
  "acceptanceCriteria": ["Expected behavior 1"],
  "comments": ["Relevant Jira or CI note"],
  "labels": ["search", "navigation"],
  "sourceUrl": "https://www.mattamyhomes.com/source",
  "targetUrl": "https://www.mattamyhomes.com/target"
}
```

Use `data/mcp-requirement.example.json` as a starter.

## Generate Automation From MCP Output

Create `data/mcp-requirement.json`, then run:

```powershell
npm run generate:from-mcp
```

That command runs:

```text
data/mcp-requirement.json
-> data/jira-ai-input.json
-> data/jira-testcases.json
-> data/automation-tests.json
-> tests/generated.spec.ts
```

Then validate with:

```powershell
npm test
```

## Jira MCP Prompt

Use this prompt with a Jira MCP-enabled assistant:

```text
Fetch Jira issue MTTMY-0000. Extract the summary, description, acceptance criteria, labels, and the most automation-relevant comments. Save the result as data/mcp-requirement.json using the repository MCP handoff format. Keep URLs intact.
```

## Browser MCP Prompt

Use this after Jira context is available:

```text
Open the URLs from data/mcp-requirement.json. Inspect the visible behavior, final URL, important selectors, validation messages, console errors, and network failures. Update data/mcp-requirement.json with only facts useful for Playwright automation.
```

## CI Feedback Prompt

Use this with Jenkins or GitHub MCP:

```text
Read the latest failed automation run. Summarize failed spec names, assertion errors, screenshots/videos, browser/device, environment, and likely root cause. Suggest the smallest repo change needed.
```

## Notes

- Do not store MCP access tokens or Jira API tokens in committed files.
- Keep secrets in `.env` or in the MCP client's secure configuration.
- Treat generated specs as drafts until selectors and assertions are reviewed against the live site.
