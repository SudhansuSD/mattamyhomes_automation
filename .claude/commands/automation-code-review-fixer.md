---
description: Safely fix issues reported by the automation-code-review skill after verifying each finding against the actual automation implementation.
argument-hint: <Code Review Summary, issue list, or affected files>
---

Use the repo-local Codex skill at `skills/automation-code-review-fixer/SKILL.md` to remediate these automation code review findings:

```text
$ARGUMENTS
```

Follow the fixer workflow:

1. Read the Code Review Summary and process findings by severity: CRITICAL, HIGH, MEDIUM, then LOW.
2. Inspect the affected implementation before changing anything.
3. Verify each finding is valid and identify the root cause.
4. Search usages, dependencies, reusable framework code, config, fixtures, utilities, page objects, and test data.
5. Apply the smallest safe fix that preserves existing behavior and public contracts.
6. Validate with the most relevant existing project command.
7. Review changed files again for flakiness, duplication, locator quality, synchronization, assertions, error handling, TypeScript quality, and parallel safety.
8. Return the final fix report format from `skills/automation-code-review-fixer/SKILL.md`.

Do not blindly apply review recommendations, weaken assertions, mask flakiness with retries or timeouts, add permanent arbitrary waits, silently swallow errors, refactor unrelated files, or change application expectations to make tests pass.
