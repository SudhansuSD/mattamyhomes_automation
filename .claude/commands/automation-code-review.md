---
description: Apply the automation-code-review quality guard before creating, modifying, fixing, refactoring, or reviewing QA automation code.
argument-hint: <automation task or review scope>
---

Use the repo-local Codex skill at `skills/automation-code-review/SKILL.md` as the quality guard for this automation task:

```text
$ARGUMENTS
```

Follow its Senior QA Automation Architect workflow:

1. Explore the relevant repository structure before coding.
2. Search existing tests, page objects, components, fixtures, utilities, helpers, config, and test data for reuse.
3. Design a focused change that preserves the existing framework architecture.
4. Implement only what is needed.
5. Review for stable locators, reliable synchronization, duplication, TypeScript quality, independence, parallel safety, and environment independence.
6. Verify with the most relevant typecheck, lint, or focused test command.

When explicitly asked for a code review, use the review format and severity levels from `skills/automation-code-review/SKILL.md`.

Do not rewrite unrelated framework code, add arbitrary waits, hide failing assertions, duplicate utilities, mask flakiness with retries, or change production/test functionality outside the requested scope.
