# Mattamy Homes Automation Framework

End-to-end test automation for the Mattamy Homes website:

- **Desktop web** — [Playwright](https://playwright.dev/) + TypeScript (Page Object Model)
- **Mobile web** — [WebdriverIO](https://webdriver.io/) + [Appium](https://appium.io/) (Android/iOS Chrome/Safari)
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
| Java (JRE/JDK) | 17+ (21 recommended) | Required by `allure-commandline` to generate HTML reports |
| Git | any recent | |

Mobile only (optional): Android SDK + emulator (or a real device) and Appium
drivers — see [`docs/appium-mobile-browser-testing.md`](docs/appium-mobile-browser-testing.md).

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
`--grep`. The `Chrome` project (chromium) is the only project locally; `firefox`
and `webkit` are added automatically under CI.

```bash
npm test                 # run everything (Chrome)
npm run test:ci          # @ci   subset  (fastest sanity check)
npm run test:smoke       # @smoke subset
npm run test:regression  # @regression subset
```

Select environment/region with env vars (defaults shown):

```bash
ENV=STAGE LOCATION=USA npm run test:smoke     # STAGE | PROD  x  USA | CAN
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

Requires a running Appium server + emulator/device. See the mobile doc above.

```bash
npm run test:mobile:android            # full Android suite
npm run test:mobile:ios                # iOS (uses cross-env, works on Windows)

# single spec — pass --spec (works for both platforms):
npm run test:mobile:android -- --spec ./tests/mobile/mobileWeb.home.spec.ts
npm run test:mobile:ios -- --spec ./tests/mobile/mobileWeb.searchPage.spec.ts
```

All mobile scripts are cross-shell safe (inline env vars go through `cross-env`).

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

# Quick serve (temp server, no persisted report)
npm run allure:serve

# Merged desktop + mobile
npm run allure:merge && npm run allure:open:merged
```

Trend graphs persist across runs because each generation copies the previous
report's `history/` back into the results before regenerating.

Email summary (needs `EMAIL_*` vars; skipped cleanly if unset):

```bash
npm run report:email          # send summary of the latest results
npm run test:allure:email     # full run + report + email workflow
```

---

## 6. Quality gates

```bash
npm run typecheck        # tsc --noEmit for BOTH tsconfig.json and tsconfig.mobile.json
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
| `LOCATION` | `locationConfig.ts` | selecting USA/CAN data | `USA` |
| `BROWSER` | email report | report label | `Chrome` |
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
| `MOBILE_PLATFORM` / `APPIUM_PLATFORM` | mobile | Android/iOS selection | `Android` |
| `MOBILE_DEVICE_NAME` / `MOBILE_BROWSER_NAME` / `MOBILE_AUTOMATION_NAME` | mobile | capabilities | see `.env.example` |
| `APPIUM_HOST` / `APPIUM_PORT` | mobile | Appium server | `127.0.0.1` / `4725` |
| `APPIUM_UDID` / `APPIUM_DEVICE_NAME` / `APPIUM_PLATFORM_VERSION` | mobile | capability overrides | — |
| `APPIUM_NO_RESET` | mobile | session reset | `true` |
| `MOBILE_BASE_URL` | mobile | override base URL | envConfig baseURL |
| `MOBILE_LOG_CONSOLE` / `WDIO_LOG_LEVEL` | mobile | logging | `false` / `error` |
| `APPIUM_NAVIGATION_SETTLE_MS` / `APPIUM_SEARCH_MAX_ATTEMPTS` / `APPIUM_USE_HOME_AUTOCOMPLETE` | mobile | tuning | — |
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | mobile (Android) | SDK location | system |
| `CI` | configs | CI-only behaviour | set by GitHub Actions |

---

## 9. CI

Two GitHub Actions workflows in `.github/workflows/`:

- **`playwright.yml`** — scheduled daily smoke run + on push to `main` + manual
  dispatch (suite / env / location). Runs in the official Playwright container.
- **`playwright-manual.yml`** — fully manual, on-demand run with browser + suite
  matrix selection from the Actions UI.

Both: pin Node via `.nvmrc`, `npm ci`, **type-check → lint → tests → Allure report**
(quality gates fail the job loudly, no `continue-on-error`), and upload
`playwright-report/`, `allure-report/`, `allure-results/`, and `test-results/` as
artifacts. Secrets (`EMAIL_*`, `ALLURE_REPORT_URL`) are read from GitHub secrets.

Under `CI=true`, `playwright.config.ts` switches to headless, adds the HTML
reporter, enables the firefox/webkit projects, runs 2 workers, and retries once.

---

## 10. Project layout

```
pages/            Desktop Page Object Model (pages/mobile/ = mobile POM)
tests/            Desktop specs (tests/mobile/ = mobile specs)
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
