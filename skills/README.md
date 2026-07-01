# Repo Skills

This repository keeps project-specific Codex skills in `skills/`.

## Structure

- One folder per skill
- Each skill must contain `SKILL.md`
- Optional bundled resources may live under:
  - `scripts/`
  - `references/`
  - `assets/`

## Current URL Automation Skills

- `url-feature-automation-generator`

## Current Mobile Skills

- `desktop-to-appium-mobile`

## Add Future Skills

1. Create a new folder under `skills/` using lowercase letters, digits, and hyphens.
2. Add a `SKILL.md` with `name` and `description` frontmatter.
3. Add any optional `scripts/`, `references/`, or `assets/` needed by that skill.
4. Run `scripts/sync-codex-skills.ps1` to copy repo-local skills into the Codex skills directory.

## Sync To Codex

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-codex-skills.ps1
```
