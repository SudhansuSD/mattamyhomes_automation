# Mattamy Homes Automation Framework

End-to-end suite for the Mattamy Homes site. Playwright + TypeScript
throughout: desktop web runs the browser projects, mobile web runs the same
specs against phone device profiles (Mobile Safari = iPhone 14 on WebKit,
Mobile Chrome = Pixel 7). Reporting is Allure (desktop / mobile / merged) plus
an emailed HTML summary.

See [README.md](README.md) for setup and the full command list. This file covers
the conventions to follow when changing code here.

## Commands

```bash
npm test                  # all desktop tests, every configured location
npm run test:ci           # @ci subset - fastest sanity check
npm run test:smoke        # @smoke
npm run test:regression   # @regression
BROWSER=mobile-safari npm test   # mobile web (iPhone 14 / WebKit)

npm run typecheck
npm run lint
npm run format
```

`npm run typecheck` and `npm run lint` are the CI quality gates and run before
browsers are installed. Run both before handing work back.

## Layout

| Path | What lives there |
| --- | --- |
| `tests/` | Specs. Thin - orchestration and assertions only |
| `pages/` | Desktop page objects (`BasePage` -> `SearchablePage` -> page) |
| `support/` | Page-object collaborators (overlays, media audit, lead-form flow) |
| `utils/reporting/` | Allure steps, metadata, timeout diagnostics reporter |
| `utils/evidence/` | Sharded evidence stores merged into xlsx at teardown |
| `utils/leadform/` | Lead-form fill/submit helpers |
| `utils/web/` | Page-object helpers, redirect and accessibility checks |
| `utils/` | Remaining cross-cutting helpers (Jira client) |
| `config/` | Environment, location, browser, and feature-expectation config |
| `scripts/` | Runners, Allure/report generation, Jira + generation pipeline |

## Conventions

**Every page-object method gets a one-line comment above it.** Describe what it
does, not how. Longer comments are for explaining *why* a non-obvious approach
was chosen - the existing ones record real debugging outcomes and are worth
matching in tone.

**No change-log commentary, anywhere.** Comments and docs describe the code as
it stands, never the edit that produced it. A reader who never saw the previous
version must not be able to tell one existed - so no "changed from", "previously",
"was 5s", "removed the old retry", and no references to retired files or
approaches by name. Keep the reason, drop the history; the diff and the commit
message already carry it. This applies to `README.md`, this file, and `docs/`
too: document the current state, not the migration.

**Report through Allure, never `console.log`.** Use `step()` and `reportValue()`
from `utils/reporting/allureReporter` (exposed as `this.step` / `this.reportValue` on
`BasePage`). A diagnostic worth keeping belongs in the report; one that is not
should be deleted.

**Specs are section-wise.** Group with nested `test.describe` blocks per page
area, and put the tags plus the location in the title:

```ts
test(`@smoke @regression | ${location.country} | Home page should load correctly`, ...)
```

**One spec, both platforms.** Mobile web is a device profile, not a second
suite: the same specs and page objects run at a phone viewport. Where a page
behaves differently on mobile, branch inside the page object on
`isMobileHeaderViewport()` - as `Header` does to open the collapsed nav panel -
and never weaken an assertion to make both layouts pass.

**Never navigate off-site.** For third-party links, assert `href`/`target` and
dismiss any modal - do not click through.

**Do not add hard waits.** `page.waitForTimeout` as a blind pre-assertion sleep
is not acceptable; use `expect.poll`, a web-first assertion, or
`BasePage.waitForPageReady()`, which waits for the DOM to go quiet. A bounded
polling interval inside a loop is fine. This matters: paying blind waits
repeatedly once took the suite from 3.2h to 5.8h.

**A missing element is not a reason to pass.** Do not write
`if (!visible) return;` in a validation method. Call
`this.isFeaturePresent(...)` or `this.requireFeature(...)` and declare genuinely
absent features in `config/features/featureExpectations.ts`. Absence must be a
recorded decision, not a runtime shrug. Guards for environmental noise - cookie
banners, promo overlays, closing a dialog - stay conditional and keep their
`IfPresent` names.

**Evidence workbooks are written once, in teardown.** Never read-modify-write an
`.xlsx` from a test: workers race and ExcelJS corrupts the zip. Append rows via
`utils/evidence/evidenceShardStore` and merge in `scripts/playwrightGlobalTeardown.ts`.

**`utils/scenarioMapper.ts` is intentionally retained** even though nothing
imports it. Do not remove it as dead code.

## Test data

Lead-form data comes from `data/test_data.json` via `utils/leadform/leadFormHelper`.
Submissions on STAGE create real CRM records, so names and email prefixes must
stay obviously automated (`QAAutomation` / `DoNotContact`, `qa-automation_*`) and
emails must stay unique per run. Never put a real person's details in here.

## Environments and locations

`ENV` selects STAGE or PROD; `LOCATION` selects USA or CAN, and `ALL` runs one
pass per country. Specs read `getLocationConfig()` rather than hardcoding.
Country-specific page objects pin themselves with `locationOverride` - MPC is
USA-only, condo community and condo plan are CAN-only.

**Live lead submissions are currently paused on every environment, STAGE
included.** STAGE submissions create real CRM records, so the pause lives in
`config/environments/leadSubmissionPolicy.ts` rather than in a runner flag - it
has to hold for every run, however that run was started. Guard anything that
submits a live form through that module, never by testing `envName` directly:

```ts
test.skip(isLeadSubmissionBlocked(), getLeadSubmissionSkipReason() ?? '');
```

A single run can opt back in with `ALLOW_LEAD_SUBMISSION=true`; PROD stays
blocked regardless. Only flip `LEAD_SUBMISSIONS_PAUSED` back to `false` when the
client asks for submissions to resume.

## Untracked evidence specs

`tests/formSubmissionEvidence.spec.ts`,
`tests/formProfaneSubmissionEvidence.spec.ts`,
`tests/scheduleAVisitCanadaFormEvidence.spec.ts`, and
`tests/sideModalFormEvidence.spec.ts` are in `.gitignore` on purpose - they are
one-off client-evidence runs, not part of the committed suite. Keep the files on
disk; do not commit them and do not delete them. They submit live forms, so
check what they will send before running one.
