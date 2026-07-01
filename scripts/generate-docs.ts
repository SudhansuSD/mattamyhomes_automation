/**
 * generate-docs.ts
 * ------------------------------------------------------------------
 * Auto-generates living documentation for this Playwright + TypeScript
 * automation framework by statically reading the spec files (and, when
 * present, the latest Playwright JSON report / Allure results).
 *
 * Outputs (regenerated on every run, at the repo root):
 *   - test-plan.md   : human-readable test plan grouped by module
 *   - progress.md    : automation progress / coverage dashboard
 *
 * Usage:
 *   npm run docs:generate
 *
 * Design notes:
 *   - No test cases are hardcoded. Everything is discovered from source.
 *   - The script NEVER throws on a missing report / Allure folder; it
 *     simply marks execution status as "Not Executed".
 *   - Pure Node std-lib only (fs/path), so it is Windows-compatible.
 * ------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { ALLURE_RESULTS_ROOT } from './allurePaths';

/* ==========================================================
   Constants & paths
========================================================== */

const REPO_ROOT = path.resolve(__dirname, '..');
const TESTS_DIR = path.resolve(REPO_ROOT, 'tests');

const TEST_PLAN_OUT = path.resolve(REPO_ROOT, 'test-plan.md');
const PROGRESS_OUT = path.resolve(REPO_ROOT, 'progress.md');
const JIRA_DATA_DIR = path.resolve(REPO_ROOT, 'data', 'jira');

const PROJECT_NAME = 'Mattamy Homes Web Automation';
const KNOWN_TAGS = ['@smoke', '@regression', '@sanity', '@ci'] as const;
type KnownTag = (typeof KNOWN_TAGS)[number];

/** Candidate locations for a Playwright JSON report (none is configured by
 *  default in this repo, so all of these are best-effort / optional). */
const PLAYWRIGHT_JSON_CANDIDATES = [
  path.resolve(REPO_ROOT, 'playwright-report', 'results.json'),
  path.resolve(REPO_ROOT, 'test-results', 'results.json'),
  path.resolve(REPO_ROOT, 'results.json'),
  path.resolve(REPO_ROOT, 'report.json'),
];

/* ==========================================================
   Types
========================================================== */

interface TestCase {
  id: string;             // page-specific id, e.g. HOME-001
  title: string;          // cleaned, tag-stripped title
  rawTitle: string;       // original title as written in source
  tags: string[];         // known tags (own + inherited from describe)
  describe?: string;      // nearest enclosing describe title (cleaned)
  modifier?: 'skip' | 'only' | 'fixme';
  steps: string[];        // test.step names
  added: boolean;         // true = active code; false = commented-out / planned
  titleContentStart: number; // index in source just after the opening quote
  titleContentEnd: number;   // index in source of the closing quote
}

interface SpecModule {
  module: string;         // friendly module name derived from file name
  specFile: string;       // path relative to repo root (posix-ish)
  absPath: string;        // absolute path on disk
  source: string;         // original file contents (for id injection)
  describes: string[];    // all describe titles discovered
  tests: TestCase[];
  pageObjects: string[];  // page objects imported by this spec
  configRefs: string[];   // config/data references imported by this spec
}

type ExecStatus = 'passed' | 'failed' | 'broken' | 'skipped' | 'flaky' | 'Not Executed';

interface ExecutionResult {
  source: 'playwright-json' | 'allure' | null;
  byTitle: Map<string, ExecStatus>;
  totals: Record<string, number>;
  flaky: string[];
  failed: string[];
  skipped: string[];
}

interface JiraAnalysis {
  ticket: string;
  summary: string;
  positiveScenarios: Array<{
    sourceUrl: string;
    expectedPathContains: string;
    priority: string;
    testType: string;
    preconditions: string[];
    steps: string[];
    expectedResult: string;
  }>;
  openQuestions?: string[];
}

/* ==========================================================
   Small helpers
========================================================== */

function log(msg: string): void {
  console.log(`[generate-docs] ${msg}`);
}

function warn(msg: string): void {
  console.warn(`[generate-docs] ⚠ ${msg}`);
}

/** Convert a path to forward-slash style for clean, portable markdown. */
function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/** Replace `${expr}` interpolations with a short, readable `{token}`. */
function cleanInterpolation(text: string): string {
  return text.replace(/\$\{([^}]*)\}/g, (_m, expr: string) => {
    const token = String(expr)
      .split('.')
      .pop()!
      .replace(/[^a-zA-Z0-9]/g, '')
      .trim();
    return token ? `{${token}}` : '{…}';
  });
}

function collectResultFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectResultFiles(fullPath));
    } else if (/-result\.json$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/** Turn a camelCase / PascalCase spec file name into "Title Case Words". */
function fileToModuleName(fileBase: string): string {
  const name = fileBase
    .replace(/\.spec\.(ts|js)$/i, '')
    .replace(/[-_]+/g, ' ');
  // Split camelCase / PascalCase and acronym boundaries.
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return spaced
    .split(' ')
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Extract known tags from a title string. */
function extractTags(title: string): string[] {
  const found = new Set<string>();
  for (const tag of KNOWN_TAGS) {
    if (title.includes(tag)) found.add(tag);
  }
  // Also surface any other @-tags so nothing is silently lost.
  const matches = title.match(/@[\w-]+/g) ?? [];
  for (const m of matches) found.add(m);
  return [...found];
}

/** Remove all @tags from a title, returning the clean descriptive text. */
function stripTags(title: string): string {
  return title.replace(/@[\w-]+/g, '').replace(/\s+/g, ' ').trim();
}

/** Pattern for an injected `PREFIX-001 | ` id at the start of a test title. */
const ID_PREFIX_RE = /^\s*[A-Z][A-Z0-9]*-\d{3}\s*\|\s*/;

/** Remove a leading injected id (so docs regenerate cleanly after injection). */
function stripIdPrefix(title: string): string {
  return title.replace(ID_PREFIX_RE, '');
}

/**
 * Derive the clean descriptive text of a test from its raw title, tolerating
 * an already-injected `ID | tags | description` shape. Removes the id prefix,
 * all @tags and the `|` separators, then tidies interpolations/whitespace.
 */
function cleanDescription(rawTitle: string): string {
  const noId = stripIdPrefix(rawTitle);
  const noTags = noId.replace(/@[\w-]+/g, '').replace(/\|/g, ' ');
  return cleanInterpolation(noTags).replace(/\s+/g, ' ').trim();
}

/* ==========================================================
   File discovery
========================================================== */

/** Recursively collect `*.spec.ts` files (matches playwright.config testMatch). */
function findSpecFiles(dir: string): string[] {
  const out: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip appium folder (excluded by playwright.config testIgnore).
      if (entry.name.toLowerCase() === 'appium') continue;
      out.push(...findSpecFiles(full));
    } else if (/\.spec\.ts$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/* ==========================================================
   Spec parsing (regex / brace-depth based — no TS compiler needed)
========================================================== */

/**
 * Build a boolean mask over the source where `mask[i] === true` means the
 * character at index `i` lives inside a `//` or block comment. String and
 * template literals are respected (so `//` inside a string is NOT a comment).
 *
 * We keep the comments (rather than stripping them) so commented-out tests
 * can still be discovered and reported as "not yet added".
 */
function computeCommentMask(src: string): boolean[] {
  const n = src.length;
  const mask = new Array<boolean>(n).fill(false);
  let i = 0;
  type Mode = 'code' | 'line' | 'block' | 'sq' | 'dq' | 'tpl';
  let mode: Mode = 'code';

  const flag = (from: number, to: number) => {
    for (let k = from; k < to && k < n; k++) mask[k] = true;
  };

  while (i < n) {
    const ch = src[i];
    const next = src[i + 1];

    if (mode === 'code') {
      if (ch === '/' && next === '/') {
        mode = 'line';
        flag(i, i + 2);
        i += 2;
      } else if (ch === '/' && next === '*') {
        mode = 'block';
        flag(i, i + 2);
        i += 2;
      } else if (ch === "'") {
        mode = 'sq';
        i++;
      } else if (ch === '"') {
        mode = 'dq';
        i++;
      } else if (ch === '`') {
        mode = 'tpl';
        i++;
      } else {
        i++;
      }
    } else if (mode === 'line') {
      if (ch === '\n') mode = 'code';
      else mask[i] = true;
      i++;
    } else if (mode === 'block') {
      if (ch === '*' && next === '/') {
        flag(i, i + 2);
        mode = 'code';
        i += 2;
      } else {
        mask[i] = true;
        i++;
      }
    } else {
      // Inside a string/template literal: handle escapes & detect close.
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (
        (mode === 'sq' && ch === "'") ||
        (mode === 'dq' && ch === '"') ||
        (mode === 'tpl' && ch === '`')
      ) {
        mode = 'code';
      }
      i++;
    }
  }
  return mask;
}

/**
 * Extract the first string-literal argument starting at index `from`,
 * supporting single-quote, double-quote and template (backtick) literals.
 * Returns the unescaped raw contents and the index just after the literal.
 */
interface StringArg {
  value: string;        // unescaped contents
  contentStart: number; // index of first content char (just after opening quote)
  end: number;          // index just after the closing quote
}

function readFirstStringArg(src: string, from: number): StringArg | null {
  let i = from;
  // Skip whitespace up to the first quote character.
  while (i < src.length && /\s/.test(src[i])) i++;
  const quote = src[i];
  if (quote !== '"' && quote !== "'" && quote !== '`') return null;
  i++;
  const contentStart = i;
  let value = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      value += src[i + 1] ?? '';
      i += 2;
      continue;
    }
    if (ch === quote) {
      return { value, contentStart, end: i + 1 };
    }
    value += ch;
    i++;
  }
  return null; // unterminated
}

/**
 * Parse a single spec file into a SpecModule.
 * Associates each test with the nearest preceding describe (by source order)
 * and inherits tags from any describe titles that appear before it.
 */
function parseSpec(filePath: string): SpecModule {
  const src = fs.readFileSync(filePath, 'utf-8');
  const commentMask = computeCommentMask(src);
  const isCommented = (index: number) => commentMask[index] === true;
  const relFile = toPosix(path.relative(REPO_ROOT, filePath));
  const module = fileToModuleName(path.basename(filePath));

  /* ---- Imports: page objects & config/data references ---- */
  const pageObjects = new Set<string>();
  const configRefs = new Set<string>();
  const importRe = /import\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  let im: RegExpExecArray | null;
  while ((im = importRe.exec(src)) !== null) {
    const spec = im[1];
    if (/(^|\/)pages\//.test(spec) || /\.\.\/pages/.test(spec)) {
      pageObjects.add(path.basename(spec));
    }
    if (/(^|\/)config\//.test(spec) || /\/data\//.test(spec) || /locationConfig/i.test(spec)) {
      configRefs.add(path.basename(spec));
    }
  }

  /* ---- Walk the source collecting describe/test/step tokens in order ---- */
  const describes: string[] = [];
  const tests: TestCase[] = [];

  // Token regex: matches test.describe / test / test.only / test.skip /
  // test.fixme / test.step at call sites. The `(?<!\.)` lookbehind prevents
  // matching method calls such as `/regex/.test(...)`.
  const tokenRe =
    /(?<!\.)\btest\.describe(?:\.(?:only|skip|serial|parallel))?\s*\(|(?<!\.)\btest\.step\s*\(|(?<!\.)\btest\.(?:only|skip|fixme)\s*\(|(?<!\.)\btest\s*\(/g;

  // Tags inherited from *active* describe titles seen so far.
  const preTags: string[] = [];
  let nearestDescribe: string | undefined;
  let pendingTest: TestCase | null = null;

  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(src)) !== null) {
    const token = m[0];
    const commented = isCommented(m.index);
    const argStart = m.index + token.length;
    const parsed = readFirstStringArg(src, argStart);
    if (!parsed) continue; // not a string-titled call (e.g. test.skip(condition,...))
    const rawTitle = parsed.value;

    if (token.startsWith('test.describe')) {
      const clean = cleanInterpolation(stripTags(rawTitle));
      describes.push(clean);
      nearestDescribe = clean;
      // Only let active describes contribute inherited tags, so a commented
      // describe block can't leak tags onto a later active test.
      if (!commented) {
        for (const t of extractTags(rawTitle)) {
          if (!preTags.includes(t)) preTags.push(t);
        }
      }
      continue;
    }

    if (token.startsWith('test.step')) {
      // Attach step to the most recent test, if any.
      if (pendingTest) pendingTest.steps.push(cleanInterpolation(stripTags(rawTitle)));
      continue;
    }

    // Otherwise it's a test() / test.only() / test.skip() / test.fixme().
    let modifier: TestCase['modifier'];
    if (token.includes('test.skip')) modifier = 'skip';
    else if (token.includes('test.only')) modifier = 'only';
    else if (token.includes('test.fixme')) modifier = 'fixme';

    const ownTags = extractTags(rawTitle);
    // Active tests inherit describe tags; commented (planned) tests only carry
    // their own, since we can't be sure which block they belong to.
    const inherited = commented ? [] : preTags;
    const combined = [...new Set([...inherited, ...ownTags])];
    const tags = combined.filter((t) => (KNOWN_TAGS as readonly string[]).includes(t));
    const extraTags = combined.filter((t) => !(KNOWN_TAGS as readonly string[]).includes(t));

    pendingTest = {
      id: '', // assigned later once per-module prefixes are known
      title: cleanDescription(rawTitle),
      rawTitle,
      tags: [...tags, ...extraTags],
      describe: nearestDescribe,
      modifier,
      steps: [],
      added: !commented,
      titleContentStart: parsed.contentStart,
      titleContentEnd: parsed.end - 1,
    };
    tests.push(pendingTest);
  }

  return {
    module,
    specFile: relFile,
    absPath: filePath,
    source: src,
    describes,
    tests,
    pageObjects: [...pageObjects].sort(),
    configRefs: [...configRefs].sort(),
  };
}

/* ==========================================================
   Optional execution results — Playwright JSON
========================================================== */

function tryReadPlaywrightJson(): ExecutionResult | null {
  const file = PLAYWRIGHT_JSON_CANDIDATES.find((p) => fs.existsSync(p));
  if (!file) return null;

  try {
    const report = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const byTitle = new Map<string, ExecStatus>();
    const totals: Record<string, number> = {};
    const flaky: string[] = [];
    const failed: string[] = [];
    const skipped: string[] = [];

    const bump = (k: string) => (totals[k] = (totals[k] ?? 0) + 1);

    const visitSuite = (suite: any): void => {
      for (const spec of suite.specs ?? []) {
        for (const t of spec.tests ?? []) {
          // Playwright status: 'expected' | 'unexpected' | 'flaky' | 'skipped'
          const status: string = t.status ?? 'unknown';
          let mapped: ExecStatus = 'Not Executed';
          if (status === 'expected') mapped = 'passed';
          else if (status === 'unexpected') mapped = 'failed';
          else if (status === 'flaky') mapped = 'flaky';
          else if (status === 'skipped') mapped = 'skipped';

          byTitle.set(stripTags(spec.title), mapped);
          bump(mapped);
          if (mapped === 'flaky') flaky.push(spec.title);
          if (mapped === 'failed') failed.push(spec.title);
          if (mapped === 'skipped') skipped.push(spec.title);
        }
      }
      for (const child of suite.suites ?? []) visitSuite(child);
    };

    for (const suite of report.suites ?? []) visitSuite(suite);

    log(`Read Playwright JSON report: ${toPosix(path.relative(REPO_ROOT, file))}`);
    return { source: 'playwright-json', byTitle, totals, flaky, failed, skipped };
  } catch (err) {
    warn(`Failed to parse Playwright JSON report (${(err as Error).message}). Skipping.`);
    return null;
  }
}

/* ==========================================================
   Optional execution results — Allure
========================================================== */

function tryReadAllure(): ExecutionResult | null {
  if (!fs.existsSync(ALLURE_RESULTS_ROOT)) return null;

  let files: string[];
  try {
    files = collectResultFiles(ALLURE_RESULTS_ROOT);
  } catch (err) {
    warn(`Could not read allure-results (${(err as Error).message}). Skipping.`);
    return null;
  }
  if (files.length === 0) return null;

  const byTitle = new Map<string, ExecStatus>();
  const totals: Record<string, number> = {};
  const flaky: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];
  const bump = (k: string) => (totals[k] = (totals[k] ?? 0) + 1);

  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const name: string = data.name ?? data.fullName ?? '';
      // Allure status: passed | failed | broken | skipped | unknown
      const status: string = data.status ?? 'unknown';
      let mapped: ExecStatus = 'Not Executed';
      if (status === 'passed') mapped = 'passed';
      else if (status === 'failed') mapped = 'failed';
      else if (status === 'broken') mapped = 'broken';
      else if (status === 'skipped') mapped = 'skipped';

      const isFlaky =
        data.statusDetails?.flaky === true ||
        (data.labels ?? []).some((l: any) => l.name === 'flaky' && l.value === 'true');

      if (name) byTitle.set(stripTags(name), mapped);
      bump(mapped);
      if (isFlaky && name) flaky.push(name);
      if (mapped === 'failed' || mapped === 'broken') failed.push(name);
      if (mapped === 'skipped') skipped.push(name);
    } catch {
      // Skip individual malformed result files without failing the run.
    }
  }

  log(`Read ${files.length} Allure result file(s) from allure-results/desktop + allure-results/mobile`);
  return { source: 'allure', byTitle, totals, flaky, failed, skipped };
}

function loadExecutionResults(): ExecutionResult {
  // Prefer Playwright JSON (closest to the spec titles), then Allure.
  const pw = tryReadPlaywrightJson();
  if (pw) return pw;
  const allure = tryReadAllure();
  if (allure) return allure;

  log('No Playwright JSON report or Allure results found — status = "Not Executed".');
  return {
    source: null,
    byTitle: new Map(),
    totals: {},
    flaky: [],
    failed: [],
    skipped: [],
  };
}

/* ==========================================================
   Aggregations
========================================================== */

/** Markers used in the test-plan tables. */
const ADDED_MARK = '✅';      // code already added (active)
const NOT_ADDED_MARK = '⬜'; // not yet added (commented-out / planned)

/**
 * Derive a stable, page-specific prefix from a module name, e.g.
 * "Home Page" -> HOME, "QMI Page" -> QMI, "Condo Community" -> CONDOCOMMUNITY.
 * Generic "Page"/"Pages" tokens are dropped; the `used` set guarantees
 * uniqueness across modules (collisions get a numeric suffix).
 */
function modulePrefix(moduleName: string, used: Set<string>): string {
  let base = moduleName
    .replace(/\bpages?\b/gi, ' ')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();
  if (!base) base = 'TC';
  let prefix = base;
  let n = 2;
  while (used.has(prefix)) prefix = `${base}${n++}`;
  used.add(prefix);
  return prefix;
}

/**
 * Assign page-specific IDs to every test case (active + planned), numbered
 * sequentially in source order per module so IDs stay stable.
 */
function assignIds(modules: SpecModule[]): void {
  const used = new Set<string>();
  for (const mod of modules) {
    const prefix = modulePrefix(mod.module, used);
    mod.tests.forEach((t, i) => {
      t.id = `${prefix}-${String(i + 1).padStart(3, '0')}`;
    });
  }
}

/**
 * Rewrite each *active* test title in the spec files to the canonical
 * `ID | @tags | description` shape. Operates on the raw source substring of
 * the title (so template `${...}` expressions and escapes are preserved) and
 * is idempotent — re-running produces identical files. Returns a per-file
 * summary of how many titles were changed.
 */
function injectIdsIntoSpecs(modules: SpecModule[]): { file: string; changed: number }[] {
  const summary: { file: string; changed: number }[] = [];

  for (const mod of modules) {
    // Only inject into active tests; commented-out (planned) tests are left
    // untouched until they are activated.
    const targets = mod.tests.filter((t) => t.added);
    if (targets.length === 0) continue;

    // Apply edits right-to-left so earlier indices stay valid.
    const edits = targets
      .map((t) => {
        const rawInner = mod.source.slice(t.titleContentStart, t.titleContentEnd);
        const afterId = rawInner.replace(ID_PREFIX_RE, '');
        const tags = [...new Set(afterId.match(/@[\w-]+/g) ?? [])];
        const descRaw = afterId
          .replace(/@[\w-]+/g, '')
          .replace(/\|/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const desc = descRaw || cleanDescription(t.rawTitle);
        const newInner = tags.length
          ? `${t.id} | ${tags.join(' ')} | ${desc}`
          : `${t.id} | ${desc}`;
        return { start: t.titleContentStart, end: t.titleContentEnd, newInner, rawInner };
      })
      .filter((e) => e.newInner !== e.rawInner)
      .sort((a, b) => b.start - a.start);

    if (edits.length === 0) {
      summary.push({ file: mod.specFile, changed: 0 });
      continue;
    }

    let next = mod.source;
    for (const e of edits) {
      next = next.slice(0, e.start) + e.newInner + next.slice(e.end);
    }

    try {
      fs.writeFileSync(mod.absPath, next, 'utf-8');
      mod.source = next; // keep in-memory copy consistent
      summary.push({ file: mod.specFile, changed: edits.length });
    } catch (err) {
      warn(`Failed to write ids into ${mod.specFile}: ${(err as Error).message}`);
    }
  }

  return summary;
}

/** Tag counts consider only *added* (active) tests — real coverage. */
function tagCount(modules: SpecModule[], tag: KnownTag): number {
  let n = 0;
  for (const mod of modules)
    for (const t of mod.tests) if (t.added && t.tags.includes(tag)) n++;
  return n;
}

function addedCount(modules: SpecModule[]): number {
  return modules.reduce((acc, m) => acc + m.tests.filter((t) => t.added).length, 0);
}

function plannedCount(modules: SpecModule[]): number {
  return modules.reduce((acc, m) => acc + m.tests.filter((t) => !t.added).length, 0);
}

function loadJiraAnalyses(): JiraAnalysis[] {
  if (!fs.existsSync(JIRA_DATA_DIR)) {
    return [];
  }

  return fs.readdirSync(JIRA_DATA_DIR)
    .filter((file) => /\.analysis\.json$/i.test(file))
    .map((file) => path.resolve(JIRA_DATA_DIR, file))
    .map((file) => {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf-8')) as JiraAnalysis;
      } catch (err) {
        warn(`Failed to parse Jira analysis ${toPosix(path.relative(REPO_ROOT, file))}: ${(err as Error).message}`);
        return null;
      }
    })
    .filter((analysis): analysis is JiraAnalysis => Boolean(analysis));
}

function appendJiraRequirementScenarios(lines: string[]): void {
  const analyses = loadJiraAnalyses();

  if (!analyses.length) {
    return;
  }

  lines.push('## Jira Requirement Scenarios');
  lines.push('');

  for (const analysis of analyses) {
    const groupedScenarios = buildJiraScenarioGroups(analysis);

    lines.push(`### ${analysis.ticket} - ${analysis.summary}`);
    lines.push('');
    lines.push(`**Spec file:** \`tests/${analysis.ticket}.spec.ts\`  `);
    lines.push(`**Requirement data:** \`data/jira/${analysis.ticket}.json\`, \`data/jira/${analysis.ticket}.analysis.json\`  `);
    lines.push('');
    lines.push('| Ticket ID | Scenario Title | Preconditions | Test Steps | Expected Result | Priority | Test Type |');
    lines.push('|---|---|---|---|---|---|---|');

    for (const scenario of groupedScenarios) {
      lines.push([
        analysis.ticket,
        scenario.title,
        scenario.preconditions.join('<br>'),
        scenario.steps.join('<br>'),
        scenario.expectedResult,
        scenario.priority,
        scenario.testType
      ].map(escapeMarkdownTableCell).join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
    }

    if (analysis.openQuestions?.length) {
      lines.push('');
      lines.push('**Open Questions / Assumptions**');
      lines.push('');
      for (const question of analysis.openQuestions) {
        lines.push(`- ${question}`);
      }
    }

    lines.push('');
  }
}

function buildJiraScenarioGroups(analysis: JiraAnalysis): Array<{
  title: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  priority: string;
  testType: string;
}> {
  const scenarios = analysis.positiveScenarios;
  const priority = scenarios[0]?.priority ?? 'Medium';
  const preconditions = scenarios[0]?.preconditions ?? ['Jira requirement is deployed in the selected environment.'];

  return [
    {
      title: 'Validate explicit promo redirects',
      preconditions,
      steps: [
        'Open each promo URL listed in the Jira description.',
        'Follow redirects to the final destination.',
        'Verify the final URL uses the updated Sarasota path and does not return a 4xx/5xx response.'
      ],
      expectedResult: 'Promo URLs under Sarasota-Bradenton redirect to reachable Sarasota promo URLs.',
      priority,
      testType: 'Smoke / Regression'
    },
    {
      title: 'Validate Sarasota-Bradenton redirects to Sarasota',
      preconditions,
      steps: [
        'Open each legacy Sarasota-Bradenton URL from the Jira attachment.',
        'Follow redirects to the final destination.',
        'Verify the final path contains /florida/sarasota.'
      ],
      expectedResult: 'Legacy Sarasota-Bradenton URLs redirect to reachable Sarasota URLs.',
      priority,
      testType: 'Regression'
    },
    {
      title: 'Validate Tampa redirects to Bradenton',
      preconditions,
      steps: [
        'Open each legacy Tampa URL for Crosswind Ranch, Sanderling, and Windwater from the Jira attachment.',
        'Follow redirects to the final destination.',
        'Verify the final path contains /florida/bradenton.'
      ],
      expectedResult: 'Legacy Tampa URLs for moved communities redirect to reachable Bradenton URLs.',
      priority,
      testType: 'Regression'
    },
    {
      title: 'Validate legacy search redirect URLs',
      preconditions,
      steps: [
        'Open each legacy search URL containing Sarasota-Bradenton or Tampa metro parameters.',
        'Follow redirects or resolution to the final destination.',
        'Verify the final response is not a 4xx/5xx response.'
      ],
      expectedResult: 'Legacy search URLs remain reachable after the market redirect changes.',
      priority,
      testType: 'Regression'
    }
  ];
}

function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

/* ==========================================================
   Markdown builders
========================================================== */

function buildTestPlan(modules: SpecModule[]): string {
  const lines: string[] = [];
  const allPageObjects = [...new Set(modules.flatMap((m) => m.pageObjects))].sort();
  const allConfigRefs = [...new Set(modules.flatMap((m) => m.configRefs))].sort();
  const planned = plannedCount(modules);

  lines.push('# Test Plan');
  lines.push('');
  lines.push(`_Auto-generated by \`scripts/generate-docs.ts\`. Do not edit by hand._`);
  lines.push('');

  /* ---- Project Overview ---- */
  lines.push('## Project Overview');
  lines.push('');
  lines.push(`- **Project:** ${PROJECT_NAME}`);
  lines.push('- **Test Framework:** Playwright + TypeScript');
  lines.push('- **Pattern:** Page Object Model (POM)');
  lines.push('- **Mobile Web:** WebdriverIO + Appium (Android) — separate suite');
  lines.push(`- **Spec Files Discovered:** ${modules.length}`);
  lines.push(`- **Automated Test Cases:** ${addedCount(modules)} ${ADDED_MARK}`);
  if (planned > 0) {
    lines.push(`- **Planned / Not Yet Added:** ${planned} ${NOT_ADDED_MARK}`);
  }
  lines.push('');

  /* ---- Automation Scope ---- */
  lines.push('## Automation Scope');
  lines.push('');
  lines.push('Automated end-to-end UI validation of the Mattamy Homes public website,');
  lines.push('covering page load, navigation, content, search and lead-form behaviour');
  lines.push('across the modules listed below. Coverage is discovered directly from the');
  lines.push('Playwright spec files, so this document stays in sync with the codebase.');
  lines.push('');

  /* ---- Framework Details ---- */
  lines.push('## Framework Details');
  lines.push('');
  lines.push('| Item | Detail |');
  lines.push('|---|---|');
  lines.push('| Test runner | `@playwright/test` |');
  lines.push('| Language | TypeScript (ts-node) |');
  lines.push('| Design pattern | Page Object Model |');
  lines.push('| Reporters | Playwright `line`, Playwright `html`, `allure-playwright` |');
  lines.push('| Mobile suite | WebdriverIO + Appium (uiautomator2) |');
  if (allPageObjects.length) {
    lines.push(`| Page objects | ${allPageObjects.map((p) => '`' + p + '`').join(', ')} |`);
  }
  if (allConfigRefs.length) {
    lines.push(`| Config / data | ${allConfigRefs.map((p) => '`' + p + '`').join(', ')} |`);
  }
  lines.push('');

  /* ---- Test Environment ---- */
  lines.push('## Test Environment');
  lines.push('');
  lines.push('- **Browser project:** Chrome (Chromium). Firefox/WebKit available but disabled in `playwright.config.ts`.');
  lines.push('- **Execution mode:** Serial (`workers: 1`, `fullyParallel: false`).');
  lines.push('- **Headed locally / headless in CI** (driven by the `CI` env var).');
  lines.push('- **Environment & locale** selected via `ENV` and `COUNTRY` env vars (see `config/`).');
  lines.push('');

  /* ---- Test Modules ---- */
  lines.push('## Test Modules');
  lines.push('');
  lines.push(`**Legend:** ${ADDED_MARK} automated (code added) · ${NOT_ADDED_MARK} planned / not yet added (commented-out)`);
  lines.push('');
  for (const mod of modules) {
    lines.push(`### ${mod.module}`);
    lines.push('');
    lines.push(`**Spec file:** \`${mod.specFile}\`  `);
    if (mod.pageObjects.length) {
      lines.push(`**Page objects:** ${mod.pageObjects.map((p) => '`' + p + '`').join(', ')}  `);
    }
    if (mod.configRefs.length) {
      lines.push(`**Config / data:** ${mod.configRefs.map((p) => '`' + p + '`').join(', ')}  `);
    }
    lines.push('');
    lines.push('| ID | Test Case | Tags | Code |');
    lines.push('|---|---|---|:---:|');
    if (mod.tests.length === 0) {
      lines.push(`| — | _No \`test()\` blocks found_ | — | — |`);
    } else {
      for (const t of mod.tests) {
        const tags = t.tags.length ? t.tags.join(' ') : '—';
        const mark = t.added ? ADDED_MARK : NOT_ADDED_MARK;
        const title = t.title.replace(/\|/g, '\\|') || '(untitled)';
        lines.push(`| ${t.id} | ${title} | ${tags} | ${mark} |`);
      }
    }
    lines.push('');
  }

  appendJiraRequirementScenarios(lines);

  /* ---- Execution Commands ---- */
  lines.push('## Test Execution Commands');
  lines.push('');
  lines.push('```bash');
  lines.push('# Full suite');
  lines.push('npm test');
  lines.push('');
  lines.push('# Tag-filtered runs (Chrome project)');
  lines.push('npm run test:smoke        # @smoke');
  lines.push('npm run test:regression   # @regression');
  lines.push('npm run test:ci           # @ci');
  lines.push('');
  lines.push('# Run with Allure cleanup');
  lines.push('npm run test:allure');
  lines.push('');
  lines.push('# Regenerate this documentation');
  lines.push('npm run docs:generate');
  lines.push('```');
  lines.push('');

  /* ---- Reporting ---- */
  lines.push('## Reporting');
  lines.push('');
  lines.push('- **Playwright HTML report:** `playwright-report/` — `npx playwright show-report`');
  lines.push('- **Allure report:**');
  lines.push('  - Generate: `npm run allure:generate` (outputs to `allure-report/`)');
  lines.push('  - Open: `npm run allure:open`');
  lines.push('  - Live serve: `npm run allure:serve`');
  lines.push('- **Email summary:** `npm run report:email` / `npm run test:allure:email`');
  lines.push('');

  /* ---- CI/CD ---- */
  lines.push('## CI / CD');
  lines.push('');
  const ciFile = path.resolve(REPO_ROOT, '.github', 'workflows', 'playwright.yml');
  if (fs.existsSync(ciFile)) {
    lines.push('- **GitHub Actions workflow:** `.github/workflows/playwright.yml`');
    lines.push('- CI runs headless on the Chrome project; `@ci`-tagged tests target the CI smoke path.');
  } else {
    lines.push('- No GitHub Actions workflow detected at `.github/workflows/`.');
  }
  lines.push('');

  /* ---- Assumptions ---- */
  lines.push('## Assumptions');
  lines.push('');
  lines.push('- Target environment & country are configured via `ENV` / `COUNTRY` env vars.');
  lines.push('- The site under test is reachable from the execution host.');
  lines.push('- Location-specific data (markets, communities, plans) comes from `config/locations`.');
  lines.push('');

  /* ---- Out of Scope ---- */
  lines.push('## Out of Scope');
  lines.push('');
  lines.push('- Native mobile app testing (only mobile *web* via Appium is covered).');
  lines.push('- Backend / API contract testing.');
  lines.push('- Performance, load and security testing.');
  lines.push('- Actual lead-form submissions (forms are validated without submitting).');
  lines.push('');

  return lines.join('\n');
}

function buildProgress(modules: SpecModule[], exec: ExecutionResult): string {
  const lines: string[] = [];
  const added = addedCount(modules);
  const planned = plannedCount(modules);

  const moduleAdded = (m: SpecModule) => m.tests.filter((t) => t.added).length;
  const modulePlanned = (m: SpecModule) => m.tests.filter((t) => !t.added).length;

  lines.push('# Automation Progress');
  lines.push('');
  lines.push(`_Auto-generated by \`scripts/generate-docs.ts\`. Do not edit by hand._`);
  lines.push('');

  /* ---- Summary ---- */
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|---|---:|');
  lines.push(`| Total Spec Files | ${modules.length} |`);
  lines.push(`| Automated Test Cases ${ADDED_MARK} | ${added} |`);
  lines.push(`| Planned / Not Yet Added ${NOT_ADDED_MARK} | ${planned} |`);
  lines.push(`| Smoke Tests | ${tagCount(modules, '@smoke')} |`);
  lines.push(`| Regression Tests | ${tagCount(modules, '@regression')} |`);
  lines.push(`| Sanity Tests | ${tagCount(modules, '@sanity')} |`);
  lines.push(`| CI Tests | ${tagCount(modules, '@ci')} |`);
  lines.push('');

  /* ---- Module-wise Progress ---- */
  lines.push('## Module-wise Progress');
  lines.push('');
  lines.push(`**Legend:** ${ADDED_MARK} automated · ${NOT_ADDED_MARK} planned / not yet added`);
  lines.push('');
  lines.push(`| Module | Spec File | Automated ${ADDED_MARK} | Planned ${NOT_ADDED_MARK} | Tags |`);
  lines.push('|---|---|---:|---:|---|');
  for (const mod of modules) {
    const tagSet = new Set<string>();
    for (const t of mod.tests) if (t.added) for (const tag of t.tags) tagSet.add(tag);
    const tags = [...tagSet].filter((t) => (KNOWN_TAGS as readonly string[]).includes(t));

    lines.push(
      `| ${mod.module} | \`${mod.specFile}\` | ${moduleAdded(mod)} | ${modulePlanned(mod)} | ${
        tags.length ? tags.join(' ') : '—'
      } |`
    );
  }
  lines.push('');

  /* ---- Completed Areas ---- */
  lines.push('## Completed Areas');
  lines.push('');
  const completed = modules.filter((m) => moduleAdded(m) > 0);
  if (completed.length) {
    for (const m of completed) {
      const c = moduleAdded(m);
      lines.push(`- ${m.module} (${c} automated test${c === 1 ? '' : 's'})`);
    }
  } else {
    lines.push('- _None_');
  }
  lines.push('');

  /* ---- Pending Areas ---- */
  lines.push('## Pending Areas');
  lines.push('');
  const pending = modules.filter((m) => moduleAdded(m) === 0);
  if (pending.length) {
    for (const m of pending) {
      const p = modulePlanned(m);
      const note = p > 0
        ? `${p} planned test${p === 1 ? '' : 's'} present but commented-out`
        : 'spec present but no `test()` blocks';
      lines.push(`- ${m.module} (\`${m.specFile}\`) — ${note}`);
    }
  } else {
    lines.push('- _No empty/stub spec files detected._');
  }
  lines.push('');

  /* ---- Latest Execution Summary ---- */
  lines.push('## Latest Execution Summary');
  lines.push('');
  if (!exec.source) {
    lines.push('No Playwright JSON report or Allure results were found at generation time.');
    lines.push('Run the suite (e.g. `npm run test:allure`) and regenerate to populate this section.');
  } else {
    lines.push(`Source: **${exec.source === 'playwright-json' ? 'Playwright JSON report' : 'Allure results'}**`);
    lines.push('');
    lines.push('| Result | Count |');
    lines.push('|---|---:|');
    for (const [k, v] of Object.entries(exec.totals)) {
      lines.push(`| ${k.charAt(0).toUpperCase() + k.slice(1)} | ${v} |`);
    }
  }
  lines.push('');

  /* ---- Failed Tests ---- */
  lines.push('## Failed Tests');
  lines.push('');
  if (!exec.source) {
    lines.push('- _Not available (no execution report)._');
  } else if (exec.failed.length === 0) {
    lines.push('- None 🎉');
  } else {
    for (const t of exec.failed) lines.push(`- ${stripTags(t)}`);
  }
  lines.push('');

  /* ---- Skipped Tests ---- */
  lines.push('## Skipped Tests');
  lines.push('');
  if (!exec.source) {
    // Fall back to statically-detected skips.
    const staticSkips = modules.flatMap((m) =>
      m.tests.filter((t) => t.modifier === 'skip' || t.modifier === 'fixme').map((t) => t.title)
    );
    if (staticSkips.length) {
      lines.push('_Statically detected `test.skip` / `test.fixme` blocks:_');
      lines.push('');
      for (const t of staticSkips) lines.push(`- ${t}`);
    } else {
      lines.push('- _Not available (no execution report); no static skips detected._');
    }
  } else if (exec.skipped.length === 0) {
    lines.push('- None');
  } else {
    for (const t of exec.skipped) lines.push(`- ${stripTags(t)}`);
  }
  lines.push('');

  /* ---- Flaky Tests ---- */
  lines.push('## Flaky Tests');
  lines.push('');
  if (!exec.source) {
    lines.push('- _Not detectable without an execution report._');
  } else if (exec.flaky.length === 0) {
    lines.push('- None detected');
  } else {
    for (const t of exec.flaky) lines.push(`- ${stripTags(t)}`);
  }
  lines.push('');

  /* ---- Next Actions ---- */
  lines.push('## Next Actions');
  lines.push('');
  if (pending.length) {
    lines.push(`- Implement \`test()\` blocks for ${pending.length} empty spec file(s).`);
  }
  if (tagCount(modules, '@sanity') === 0) {
    lines.push('- Consider tagging a core subset as `@sanity` for fast pre-merge checks.');
  }
  if (!exec.source) {
    lines.push('- Run `npm run test:allure` then `npm run docs:generate` to capture execution results.');
    lines.push('- (Optional) Add a Playwright `json` reporter to `playwright.config.ts` for richer status data.');
  } else {
    if (exec.failed.length) lines.push(`- Triage ${exec.failed.length} failing test(s) listed above.`);
    if (exec.flaky.length) lines.push(`- Stabilise ${exec.flaky.length} flaky test(s).`);
  }
  lines.push('- Keep this file in sync by running `npm run docs:generate` after spec changes.');
  lines.push('');

  return lines.join('\n');
}

/* ==========================================================
   Main
========================================================== */

function main(): void {
  log(`Repo root: ${REPO_ROOT}`);

  if (!fs.existsSync(TESTS_DIR)) {
    console.error(`[generate-docs] ✖ tests directory not found at ${TESTS_DIR}`);
    process.exit(1);
  }

  const specFiles = findSpecFiles(TESTS_DIR);
  log(`Discovered ${specFiles.length} spec file(s) under ${toPosix(path.relative(REPO_ROOT, TESTS_DIR))}/`);

  if (specFiles.length === 0) {
    warn('No *.spec.ts files found. Documents will still be generated (empty).');
  }

  const modules: SpecModule[] = [];
  for (const file of specFiles) {
    try {
      const mod = parseSpec(file);
      modules.push(mod);
      const a = mod.tests.filter((t) => t.added).length;
      const p = mod.tests.length - a;
      log(`  • ${mod.module}: ${a} automated${p ? `, ${p} planned` : ''}`);
    } catch (err) {
      warn(`Failed to parse ${toPosix(path.relative(REPO_ROOT, file))}: ${(err as Error).message}`);
    }
  }

  // Sort modules alphabetically by friendly name for stable output.
  modules.sort((a, b) => a.module.localeCompare(b.module));

  // Assign page-specific IDs (after sorting so prefixes/numbering are stable).
  assignIds(modules);

  // Optionally write the IDs back into the spec files (opt-in: this mutates
  // source). Enable with `--inject-ids` (npm run docs:inject-ids).
  const injectIds = process.argv.includes('--inject-ids');
  if (injectIds) {
    log('Injecting page-specific IDs into spec files (--inject-ids)…');
    const summary = injectIdsIntoSpecs(modules);
    const totalChanged = summary.reduce((acc, s) => acc + s.changed, 0);
    for (const s of summary) {
      if (s.changed > 0) log(`  • ${s.file}: ${s.changed} title(s) updated`);
    }
    log(`Injected/updated IDs in ${totalChanged} test title(s) across ${summary.filter((s) => s.changed > 0).length} file(s).`);
  }

  const exec = loadExecutionResults();

  try {
    const planMd = buildTestPlan(modules);
    fs.writeFileSync(TEST_PLAN_OUT, planMd, 'utf-8');
    log(`Wrote ${toPosix(path.relative(REPO_ROOT, TEST_PLAN_OUT))}`);

    const progressMd = buildProgress(modules, exec);
    fs.writeFileSync(PROGRESS_OUT, progressMd, 'utf-8');
    log(`Wrote ${toPosix(path.relative(REPO_ROOT, PROGRESS_OUT))}`);
  } catch (err) {
    console.error(`[generate-docs] ✖ Failed to write documentation: ${(err as Error).message}`);
    process.exit(1);
  }

  log(
    `Done. ${modules.length} module(s), ${addedCount(modules)} automated + ` +
      `${plannedCount(modules)} planned test(s). ` +
      `Execution source: ${exec.source ?? 'none (Not Executed)'}.`
  );
}

main();
