# Repo Skills

This repository keeps project-specific Codex skills in `skills/`.

## Structure

- One folder per skill
- Each skill must contain `SKILL.md`
- Optional bundled resources may live under:
  - `scripts/`
  - `references/`
  - `assets/`
- `shared/references/` holds material more than one skill points at

## Writing A SKILL.md

`SKILL.md` loads in full every time the skill runs, so its size is a per-invocation cost. Keep in it only what every invocation needs: the workflow, the decisions the model cannot infer, and the output format. Push the reasoning behind a rule into `references/` and link it with a line saying when to read it.

Do not restate `CLAUDE.md`. It is already in context for every session, so a skill that repeats it pays for the same text twice. State only what the skill adds - how a convention breach is graded, which remedy is the valid one, which command is safe to run.

A slash command in `.claude/commands/` dispatches to a skill. It should name the skill and pass the scope, nothing more; workflow text duplicated there is a third copy.

## Current URL Automation Skills

- `url-feature-automation-generator`

## Current Mobile Skills


## Current Quality Guard Skills

- `automation-code-review`
- `automation-code-review-fixer`
- `shared/references/playwright-craft.md` - locator, synchronization, assertion, reuse, and typing rationale for both guards

## Add Future Skills

1. Create a new folder under `skills/` using lowercase letters, digits, and hyphens.
2. Add a `SKILL.md` with `name` and `description` frontmatter.
3. Add any optional `scripts/`, `references/`, or `assets/` needed by that skill.
4. Run `scripts/sync-codex-skills.ps1` to copy repo-local skills into the Codex skills directory.

## Sync To Codex

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-codex-skills.ps1
```

## Claude Usage

Claude Code can apply the automation quality guard through:

```text
/automation-code-review <automation task or review scope>
```

Claude Code can safely remediate findings from the quality guard through:

```text
/automation-code-review-fixer <Code Review Summary, issue list, or affected files>
```
