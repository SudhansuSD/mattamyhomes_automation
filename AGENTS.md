# Mattamy Homes Automation Framework

End-to-end Playwright + TypeScript suite for the Mattamy Homes site. Desktop web
runs the browser projects; mobile web runs the same specs against phone device
profiles.

## Read First

`CLAUDE.md` carries the conventions this repo enforces and is the source of
truth for them: framework layering, page-object comments, Allure reporting,
locator and synchronization rules, feature-expectation declarations, the
lead-submission policy, evidence-workbook handling, and the no-change-log rule
for comments and docs. Read it before changing anything here.

`README.md` covers setup and the full command list.

## Commands

```bash
npm run typecheck   # CI quality gate
npm run lint        # CI quality gate
npm run test:ci     # fastest sanity check
```

Run `typecheck` and `lint` before handing work back.

## Skills

Repo-local skills live in `skills/`, one folder per skill:

- `skills/automation-code-review/SKILL.md` - apply when writing, changing, or
  reviewing automation code
- `skills/automation-code-review-fixer/SKILL.md` - apply when remediating that
  review's findings
- `skills/shared/references/playwright-craft.md` - locator, synchronization,
  assertion, reuse, and typing rationale, read on demand by either guard

`skills/README.md` explains the layout and how to add one.
