# Mattamy Homes Automation Framework

End-to-end test automation for the Mattamy Homes website:

- **Desktop web** — [Playwright](https://playwright.dev/) + TypeScript (Page Object Model)
- **Mobile web** — Playwright device profiles: Mobile Safari (iPhone 14 / WebKit) and Mobile Chrome (Pixel 7)
- **Reporting** — [Allure](https://allurereport.org/) (desktop / mobile / merged) + an emailed HTML summary
- **Generation** — `ts-node` scripts that pull Jira requirements and scaffold specs/docs

Everything is wired so a fresh `git clone` behaves identically in VS Code, a plain
terminal, and CI — no hidden IDE setup.

---

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | **20 LTS or newer** (repo is pinned to **24** via `.nvmrc`) | `nvm use` picks it up automatically |
| npm | 10+ (ships with Node) | |
| Git | any recent | |

> **Python is not required.** A leftover `.venv/` may exist locally; it is ignored
> and can be deleted.

---

## 2. Setup (clone → green in minutes)

```bash
# 1. Use the pinned Node version
nvm use            # reads .nvmrc (installs 24 if needed: nvm install)

# 2. Install exactly what the lockfile specifies
npm ci

# 3. Install Playwright browsers (and OS deps on Linux/CI)
npx playwright install --with-deps

# 4. Create your local env file and fill in values
cp .env.example .env      # Windows: copy .env.example .env
```

`npm ci` runs `husky` automatically (via the `prepare` script), installing the
pre-commit hook that runs lint + type-check on staged files.

---

## 3. Running desktop tests

Tests are tagged in their titles (`@ci`, `@smoke`, `@regression`) and filtered with
`--grep`. Exactly one Playwright project runs per process, resolved from `BROWSER`
(`chrome` | `firefox` | `webkit`), so a desktop run is Chrome unless you say
otherwise. CI pins Chrome for its web pass; `firefox` and `webkit` are local-only.

```bash
npm test                 # run everything (Chrome)
npm run test:ci          # @ci   subset  (fastest sanity check)
npm run test:smoke       # @smoke subset
npm run test:regression  # @regression subset
```

Select environment/region with env vars:

```bash
ENV=STAGE LOCATION=USA npm run test:smoke     # STAGE | PROD  x  USA | CAN | ALL
```

**Leaving `LOCATION` unset (or `ALL`) runs every location.** `npm test` and the
`test:*` scripts go through `scripts/run-locations.ts`, which runs one Playwright
pass per location — USA, then CAN — and builds a **single Allure report covering
both**. Allure results accumulate across passes instead of being cleared, and the
report's Environment widget lists the locations covered.

Some suites are **pinned to one country** because the feature only exists there:
MPC is USA-only, condo community and condo plan are Canada-only. Those page
objects pass their country to `BasePage` (`super(page, 'USA' | 'CAN')`), so they
navigate, pick the header country and read location data for that country no
matter what `LOCATION` says. Running `LOCATION=CAN npx playwright test tests/mpc.spec.ts`
exercises MPC against the USA site instead of skipping the whole suite.

### Location in the report

Test titles follow `@tags | LOCATION | description` — for example
`@smoke @regression | CAN | Validate condo plan breadcrumb`. There are no `TC-nn`
prefixes; the location is the identifying prefix instead.

`annotate({ location })` in each suite sets the Allure **epic** and adds the
location as a tag, so the Behaviors tab groups the report by location first and
page second:

```
behaviors
  USA
    Community Page → …
    MPC Page → …
  CAN
    Community Page → …
    Condo Plan Page → …
  ALL
    Static Legal Pages → …
    Footer Navigation → …
```

Suites that run in both passes appear under **both** USA and CAN, one entry per
pass. `contactPage` and `customerCarePage` run once but label each test with the
country it actually exercises, so their tests land under USA or CAN individually.

`ALL` is for suites whose assertions do not vary by country — `staticLegalPages`
and `footerNavigation` (footer visibility, Privacy Policy link, absolute social
hrefs, newsletter validation are all structural checks). They run once rather
than repeating identical assertions in every pass. If a country-specific
expectation is ever added to one of them, drop it from
`config/locations/locationAgnosticSpecs.ts` so it runs per location again.

Note: a test that is skipped never runs its `beforeEach`, so it carries no Allure
labels and is not grouped under a location — its title still names one.

Suites that don't vary with the selected location — the pinned ones above plus
`contactPage`, `customerCarePage`, `staticLegalPages` and `promoPage`, all listed
in `config/locations/locationAgnosticSpecs.ts` — run in the first pass only, so
the report has no duplicate entries. Every other suite carries the country in its
describe title, keeping USA and CAN results separate in the report.

Pass `LOCATION=CAN` for a single-location run — that behaves exactly as before,
one Playwright process. An unrecognized value still fails fast.

Extra arguments are forwarded to Playwright:

```bash
npm test -- --grep @smoke --project=Chrome
```

On Windows PowerShell, prefer setting them inline via `cross-env` or set them in
`.env` (`ENV=STAGE`).

Run a single spec / test:

```bash
npx playwright test tests/homePage.spec.ts --project=Chrome
npx playwright test --project=Chrome --grep @smoke -g "hero video"
```

---

## 4. Running mobile tests

Mobile web runs the same specs as desktop against Playwright device profiles —
no emulator, no Appium server, no extra install.

**`PLATFORMS` chooses which platforms run; `MOBILE_BROWSER` chooses the phone
profile.** No npm script pins either, so the same variables govern a local run
and CI:

```bash
PLATFORMS=web,mobile npm run test:smoke   # both platforms, one command
PLATFORMS=mobile npm run test:smoke       # phone only
PLATFORMS=web npm run test:regression     # web only, roughly half the wall clock

MOBILE_BROWSER=mobile-chrome PLATFORMS=mobile npm test   # Pixel 7 instead of iPhone 14
```

`.env` supplies the defaults — `PLATFORMS=web,mobile` and
`MOBILE_BROWSER=mobile-safari`, matching what CI pins — and a value passed on the
command line wins over it. Each platform runs in its own Playwright process and
writes `allure-results/desktop` or `allure-results/mobile` separately; every test
is labeled `Web` or `Mobile` in the report.

`BROWSER` is the **desktop** engine (`chrome` | `firefox` | `webkit`) and does not
select a platform. Its mobile aliases (`mobile-safari` / `ios` / `iphone`,
`mobile-chrome` / `android`) exist for driving Playwright directly, where you name
the project yourself and `run-locations.ts` is not involved:

```bash
BROWSER=mobile-safari npx playwright test tests/homePage.spec.ts --project="Mobile Safari"
```

---

## 5. Allure reports

The report is split into **desktop**, **mobile**, and **merged**. Environment,
executor (CI), categories (failure grouping), and history/trends are populated
automatically by `scripts/generate-allure-report.ts`.

```bash
# Desktop: clean → run → generate → open
npm run clean:allure          # or clean:allure:desktop / :mobile / :merged
npm run test:smoke            # (test scripts already clean+run+generate for desktop)
npm run allure:generate       # desktop (also :mobile, and allure:merge for both)
npm run allure:open           # opens allure-report/desktop

# Live local report updates while results change
npm run allure:watch

# Merged desktop + mobile
npm run allure:merge && npm run allure:open:merged
```

Allure 3 generates the Awesome report at `allure-report/<mode>/awesome/` and a
charts-only dashboard at `allure-report/<mode>/dashboard/`. Allure hard-codes a
920px content column on the Report view, so `generate-allure-report.ts` patches
the generated CSS to use the full window width; set `ALLURE_REPORT_MAX_WIDTH` to
a CSS length (e.g. `1600px`) to cap it, or to `default` to keep Allure's 920px. A small root
`index.html` redirects to Awesome so existing report links keep working. Trend
graphs, including Status dynamics, persist across runs through `.allure-history/`.
The report and email summary also show the overall run type (`CI`, `Smoke`,
`Regression`, or `Full`) from `TEST_SUITE`/the npm script that generated the run.

Email summary (needs `EMAIL_*` vars; skipped cleanly if unset):

```bash
npm run report:email          # send summary of the latest results
npm run test:allure:email     # full run + report + email workflow
```

### Published, build-wise reports

CI publishes every run to the `gh-pages` branch under its own permanent URL, so
previous runs stay readable instead of being overwritten:

```
https://sudhansusd.github.io/mattamyhomes_automation/            catalog of all builds
https://sudhansusd.github.io/mattamyhomes_automation/regression/stage/142/
https://sudhansusd.github.io/mattamyhomes_automation/latest/smoke/prod/   newest of that pair
```

The path is `<run type>/<environment>/<build number>`, taken from `TEST_SUITE`,
`ENV`, and the GitHub Actions run number. `scripts/publish-report-site.ts` copies
the generated report in, records the build in `builds.json`, regenerates the
catalog page, and prunes the oldest builds beyond `KEEP_BUILDS_PER_COMBINATION`
(default 10) per run type + environment pair. Retention is deliberately modest:
GitHub Pages hard-fails a deployment above 1 GB, so the script logs the site size
each run and warns at 750 MB.

The report email links to that build's permanent URL and to the catalog, and its
subject carries the run type, environment and build number.

**The published copy withholds traces.** Playwright traces (`.zip`) carry DOM
snapshots and full network request/response bodies, and the site is anonymously
readable — so `data/attachments/*.zip|.webm|.mp4|.har` are skipped when copying
into the site. Failure screenshots are kept, since they are what makes a shared
link useful for triage. Traces stay in the 30-day CI artifacts. Override with
`PUBLISH_EXCLUDE_ATTACHMENT_EXTENSIONS` (`none` publishes everything).

**Trend history lives on the branch**, at `history/desktop-<runtype>-<env>.jsonl`,
one chain per run type + environment. It is restored before `allure:generate`
(`npm run report:history:restore`) and written back with the build, so a report
and the history describing it land in the same commit and cannot drift — and it
survives the Actions cache's 7-day eviction, which the previous setup did not.

Publishing retries: if two runs publish at once, the loser refetches the branch
and re-publishes on top of the winner rather than merging generated files.

GitHub setup this depends on: **Settings → Pages → Source = Deploy from a branch
→ `gh-pages` / (root)**, and the workflow's `permissions: contents: write`.

---

## 6. Quality gates

```bash
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint (typescript-eslint)
npm run lint:fix         # ESLint autofix
npm run format           # Prettier write
npm run format:check     # Prettier check
```

These same checks run in CI and in the **pre-commit hook** (`.husky/pre-commit`
→ `lint-staged` + `typecheck`), so broken code can't be committed.

---

## 7. Jira → spec generation (optional)

See [`docs/jira-ticket-to-spec.md`](docs/jira-ticket-to-spec.md). There are two ways to pull
the ticket into `data/requirement-input.json`; both produce the **same** shape that the
`generate:*` chain consumes.

**a) Automated / CI (token-based).** Requires `JIRA_*` env vars; runs unattended.

```bash
npm run jira:fetch -- MTTMY-1234
npm run jira:analyze -- MTTMY-1234
npm run generate:spec -- MTTMY-1234
npm run docs:generate
```

**b) Interactive / token-free (Atlassian MCP).** For local, human-in-the-loop generation.
In Claude Code, run the project command — no `JIRA_API_TOKEN` needed (auth is the Atlassian
connector's OAuth):

```
/jira-fetch MTTMY-1234
```

It fetches the ticket via the Atlassian MCP connector and writes `data/requirement-input.json`
(and `data/jira/<TICKET>.json`); then continue with `npm run generate:testcases` /
`npm run generate:automation`. MCP tools are only available to Claude Code in a session —
they are **not** callable from the `scripts/*` Node tools or CI, so keep path (a) for
unattended runs. See [`.claude/commands/jira-fetch.md`](.claude/commands/jira-fetch.md).

---

## 8. Environment variables

Copy `.env.example` → `.env`. Full list (validated at startup by `config/env.ts`,
which fails fast with a clear message if a required var is missing). In CI these
come from GitHub **secrets**, not a file.

| Variable | Used by | Required for | Default |
| --- | --- | --- | --- |
| `ENV` | `envConfig.ts`, reports | selecting STAGE/PROD base URL and report label | `STAGE` |
| `LOCATION` | `locationConfig.ts` | selecting USA/CAN data (`ALL`/unset = one pass per location) | all locations |
| `BROWSER` | `playwright.config.ts`, reports | desktop engine, and the web half of the report label | `Chrome` |
| `ALLURE_REPORT_URL` | email report | report link | — |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_SECURE` | email report | sending email | `587` / `false` |
| `EMAIL_USER` / `EMAIL_PASSWORD` | email report | SMTP auth | — |
| `EMAIL_FROM` / `EMAIL_TO` / `EMAIL_CC` | email report | recipients | — |

If you use Gmail SMTP, set `EMAIL_USER` to the full Gmail address and set
`EMAIL_PASSWORD` to a Google App Password. A normal Gmail account password is
commonly rejected with `535 5.7.8 Username and Password not accepted`.

In CI, `playwright.yml` now publishes `allure-report/desktop` to GitHub Pages
and injects the deployed Pages URL into the email automatically. `ALLURE_REPORT_URL`
is still useful for local or manual runs when you want to override the link.

| `JIRA_BASE_URL` / `JIRA_EMAIL` / `JIRA_API_TOKEN` | `jiraClient.ts` | Jira scripts | — |
| `REQUIRE_LEAD_API_CAPTURE` | `BasePage.ts` | asserting lead API capture | `false` |
| `LEAD_API_URL_PATTERN` | `BasePage.ts` | identifying lead API call | — |
| `LEAD_API_CAPTURE_XLSX` | `leadApiCapture.ts` | output path (repo-root anchored) | `results/lead-api-data.xlsx` |
| `PLATFORMS` | `run-locations.ts` | platforms a run covers: `web`, `mobile`, `web,mobile` | `web` in code, `web,mobile` in `.env.example` and CI |
| `MOBILE_BROWSER` | `run-locations.ts` | device profile for the mobile pass | `mobile-safari` |
| `CI` | configs | CI-only behavior | set by GitHub Actions |

---

## 9. CI

One GitHub Actions workflow, `.github/workflows/playwright.yml`: scheduled daily
smoke run + on push to `main` + manual dispatch. It runs in the official
Playwright container and takes three dispatch inputs — **suite / env /
location**.

Platform coverage is not an input. Every run covers both, pinned in the job
environment as `PLATFORMS=web,mobile` with `BROWSER=chromium` and
`MOBILE_BROWSER=mobile-safari`, so a dispatched `ci` or `regression` run reports
on desktop Chrome and the iPhone 14 / WebKit profile exactly as the daily smoke
run does. Pick a different engine locally instead (§4).

The job pins Node via `.nvmrc`, `npm ci`, **type-check → lint → tests → Allure
report** (quality gates fail the job loudly, no `continue-on-error`), and uploads
`playwright-report/`, `allure-report/`, `allure-results/`, and `test-results/` as
artifacts. Email secrets (`EMAIL_*`) are read from GitHub secrets; the report URL
is computed per build by the publish step (see §5) and needs no secret.

It additionally publishes each build's Allure report to the
`gh-pages` branch, keeping trend history there per suite + environment so charts
compare like with like instead of interleaving smoke and regression runs (§5).

Under `CI=true`, `playwright.config.ts` switches to headless, adds the HTML
reporter, enables the firefox/webkit projects, runs 2 workers, and retries once.

---

## 10. Project layout

```
pages/            Page Object Model (shared by desktop and mobile projects)
tests/            Specs (run against both desktop and mobile projects)
config/           env.ts (env loader/validator), environments/, locations/, allure/categories.json
scripts/          ts-node tools: allure report, email, Jira fetch/analyze, generators
utils/            Shared helpers (allureReporter, allureMeta, jiraClient, lead-form, ...)
data/             Committed JSON fixtures (test_data.json, automation-tests.json)
reporters/        Custom reporters
types/            Ambient type declarations
docs/             How-to docs
```

---

## 11. Known issues / notes

- **`.venv/`** is a leftover Python virtualenv; nothing in the repo uses Python.
  It is ignored and safe to delete.
- Several evidence/one-off specs (`*Evidence.spec.ts`, `sitemapXml.spec.ts`) are
  intentionally kept local/untracked via `.gitignore`.
