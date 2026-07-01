# Jira Ticket → Playwright Spec

Generate a redirect-validation Playwright spec directly from a Jira ticket, driven by the
Jira REST API. Produces `tests/<TICKET>.spec.ts` in the same style as `tests/MTTMY-2091.spec.ts`.

## Prerequisites (one time)

Set these in `.env` (already configured if `npm run jira:fetch` works):

```
JIRA_BASE_URL=https://<your-domain>.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=<token>
```

## Quick command flow

```bash
# 1. Fetch the ticket from Jira (writes data/jira/<TICKET>.json + data/requirement-input.json)
npm run jira:fetch -- MTTMY-1234

# 2. Create data/jira/MTTMY-1234.redirect-rules.json  (see schema below) — the only manual step

# 3. Generate the spec (re-fetch → analyze → write tests/MTTMY-1234.spec.ts)
npm run generate:from-jira -- MTTMY-1234        # add --force to overwrite an existing spec

# 4. Review, then run it
npx playwright test tests/MTTMY-1234.spec.ts
```

`npm run generate:from-jira -- <TICKET>` runs fetch → analyze → generate in one step. Use the
individual scripts (`jira:fetch`, `jira:analyze`, `generate:spec`) if you want to run a stage alone.

## Redirect-rules schema

The rules file holds the ticket-specific "old → new" mappings. The scripts stay generic; only this
file changes per ticket. Path `data/jira/<TICKET>.redirect-rules.json`:

```json
{
  "pathReplacements": [
    { "from": "/florida/sarasota-bradenton", "to": "/florida/sarasota" },
    { "from": "/florida/tampa", "to": "/florida/bradenton" }
  ],
  "queryReplacements": [
    { "param": "metro", "from": "Sarasota-Bradenton", "to": "Sarasota" }
  ]
}
```

- `pathReplacements` — swap a legacy path segment for its replacement (any source URL whose path
  contains `from` is expected to land on the same path with `from` replaced by `to`).
- `queryReplacements` — swap a legacy query-parameter value (source URL with `?param=from` is
  expected to redirect to `?param=to`).
- Omit either array when it does not apply. One test group is generated per rule.

## Reusable AI prompt

Paste this into Claude Code (replace the ticket id):

```
Automate Jira ticket MTTMY-1234 into a Playwright redirect spec using this framework's
Jira REST pipeline.

1. Run: npm run jira:fetch -- MTTMY-1234
2. Read data/jira/MTTMY-1234.json. From the description, comments, and attachments, work out the
   redirect rules: which legacy URL paths or query-parameter values must redirect where.
3. Write data/jira/MTTMY-1234.redirect-rules.json using the pathReplacements / queryReplacements
   schema in docs/jira-ticket-to-spec.md. Put every ticket-specific mapping here — never hardcode
   values in the scripts.
4. Run: npm run generate:from-jira -- MTTMY-1234
5. Open tests/MTTMY-1234.spec.ts and confirm the generated test groups match the ticket's intent.
   If data/jira/MTTMY-1234.analysis.json openQuestions reports "No source URLs matched", revisit
   the rules file. Do not run the live test unless I ask.

Report the rules you inferred, the group breakdown from the analysis, and the path to the spec.
```

## Notes

- This flow targets **URL redirect** tickets. Non-redirect tickets won't produce redirect scenarios;
  the analysis `openQuestions` will say so.
- `data/jira/<TICKET>.analysis.json` is regenerated each run and tags every scenario with a `group`
  (the rule that matched), which is how the spec groups its tests.
- The generator will not overwrite an existing `tests/<TICKET>.spec.ts` unless you pass `--force`.
