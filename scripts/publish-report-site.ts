/**
 * Add the Allure report just generated to the published, build-wise report site.
 *
 * The site lives on the `gh-pages` branch and is served by GitHub Pages. Unlike
 * the previous `actions/deploy-pages` setup — which replaced the whole site on
 * every run, so only the latest report ever existed — each build is copied into
 * its own folder keyed by run type, environment and build number:
 *
 *   <root>/index.html                     catalog of every retained build
 *   <root>/regression/stage/142/          build #142
 *   <root>/latest/regression/stage/       redirect to the newest such build
 *   <root>/builds.json                    machine-readable build manifest
 *   <root>/history/desktop-regression-stage.jsonl   Allure trend history
 *
 * The workflow checks the existing branch out into REPORT_SITE_DIR first, so
 * this script sees (and preserves) every build published before it.
 *
 * Two commands:
 *   restore  — copy this run type + environment's trend history out of the site
 *              so `allure:generate` can extend it. Runs BEFORE report generation.
 *   publish  — copy the generated report in, save the updated history back,
 *              refresh the manifest/catalog and prune old builds (the default).
 *
 * `publish` is idempotent: re-running it against a freshly fetched site replaces
 * this build's entry rather than duplicating it, which is what lets the workflow
 * recover from a rejected push by simply re-publishing on top of the new state.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { DESKTOP_ALLURE_HISTORY_FILE, DESKTOP_ALLURE_REPORT_DIR, REPO_ROOT } from './allurePaths';
import { loadEnv, getEnv, getNumberEnv } from '../config/env';
import { getBrowserDisplayName } from '../config/browserSelection';
import { getEnvConfig } from '../config/environments/envConfig';

loadEnv();

const RUN_TYPE_BY_KEY: Record<string, string> = {
  ci: 'CI',
  smoke: 'Smoke',
  regression: 'Regression',
  full: 'Full',
  all: 'Full',
};

const MANIFEST_FILE = 'builds.json';
const LATEST_DIR = 'latest';
const HISTORY_DIR = 'history';

/**
 * Attachment types stripped from the PUBLISHED copy of the report only.
 *
 * Playwright traces (.zip) embed DOM snapshots and full network request/response
 * bodies — including whatever a failing lead-form test submitted — and the site
 * is anonymously readable. Failure screenshots (.png) are kept: they are what
 * makes a shared report link useful for triage, and they show a rendered page
 * rather than the traffic behind it. Traces remain in the CI artifacts for
 * anyone who needs to debug the run properly.
 */
const DEFAULT_EXCLUDED_ATTACHMENT_EXTENSIONS = ['.zip', '.webm', '.mp4', '.har'];

type BuildStats = {
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
  passPercentage: number;
};

type BuildRecord = {
  buildNumber: number;
  buildId: string;
  runType: string;
  environment: string;
  location: string;
  browser: string;
  branch: string;
  commit: string;
  workflowRunUrl: string;
  /** Site-relative path, e.g. "regression/stage/142". */
  buildPath: string;
  timestamp: string;
  stats: BuildStats;
  status: 'passed' | 'failed';
};

/** Lowercase a value into a URL-safe path segment. */
function slugify(value: string, fallback: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

/** Resolve the human-readable run type from TEST_SUITE / SUITE. */
function getRunType(): string {
  const raw = (getEnv('TEST_SUITE') || getEnv('SUITE')).toLowerCase();
  return RUN_TYPE_BY_KEY[raw] ?? 'Full';
}

/** Extensions excluded from published attachments, overridable per run. */
function getExcludedAttachmentExtensions(): string[] {
  const configured = getEnv('PUBLISH_EXCLUDE_ATTACHMENT_EXTENSIONS');

  if (!configured) {
    return DEFAULT_EXCLUDED_ATTACHMENT_EXTENSIONS;
  }
  if (configured.toLowerCase() === 'none') {
    return [];
  }

  return configured
    .split(',')
    .map((extension) => extension.trim().toLowerCase())
    .filter(Boolean)
    .map((extension) => (extension.startsWith('.') ? extension : `.${extension}`));
}

/**
 * Copy a directory tree recursively (fs.cpSync is still experimental on Node 20),
 * skipping attachment files whose extension is excluded from publication.
 * Returns the number of files skipped.
 */
function copyDir(source: string, target: string, excludedExtensions: string[]): number {
  fs.mkdirSync(target, { recursive: true });
  let skipped = 0;

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);

    if (entry.isDirectory()) {
      skipped += copyDir(from, to, excludedExtensions);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    // Allure writes attachments to <plugin>/data/attachments/<id><ext>, keeping
    // the original extension — so extension alone identifies them safely.
    const isAttachment =
      path.dirname(from).split(path.sep).slice(-2).join('/') === 'data/attachments';

    if (isAttachment && excludedExtensions.includes(path.extname(entry.name).toLowerCase())) {
      skipped += 1;
      continue;
    }

    fs.copyFileSync(from, to);
  }

  return skipped;
}

/** Read the pass/fail counts Allure wrote for this run. */
function readStats(reportDir: string): BuildStats {
  const statisticPath = path.join(reportDir, 'awesome', 'widgets', 'statistic.json');
  const empty: BuildStats = {
    total: 0,
    passed: 0,
    failed: 0,
    broken: 0,
    skipped: 0,
    passPercentage: 0,
  };

  if (!fs.existsSync(statisticPath)) {
    console.warn(
      `[report-site] No statistic.json at ${statisticPath}; publishing with zero counts.`,
    );
    return empty;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(statisticPath, 'utf8')) as Record<string, unknown>;
    const statistic = (raw.statistic ?? raw) as Partial<Record<keyof BuildStats, number>>;
    const passed = statistic.passed ?? 0;
    const failed = statistic.failed ?? 0;
    const broken = statistic.broken ?? 0;
    const skipped = statistic.skipped ?? 0;
    const total = statistic.total ?? passed + failed + broken + skipped;
    const executed = passed + failed + broken;

    return {
      total,
      passed,
      failed,
      broken,
      skipped,
      passPercentage: executed ? Math.round((passed / executed) * 100) : 0,
    };
  } catch (error) {
    console.warn(`[report-site] Unable to read ${statisticPath}:`, error);
    return empty;
  }
}

function readManifest(siteDir: string): BuildRecord[] {
  const manifestPath = path.join(siteDir, MANIFEST_FILE);

  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return Array.isArray(parsed) ? (parsed as BuildRecord[]) : [];
  } catch (error) {
    console.warn(`[report-site] Unable to read ${manifestPath}; starting a fresh manifest:`, error);
    return [];
  }
}

/**
 * Drop the oldest builds for each run type + environment pair so the branch does
 * not grow without bound. Returns the retained records, newest build first.
 */
function pruneBuilds(
  siteDir: string,
  builds: BuildRecord[],
  keepPerCombination: number,
): BuildRecord[] {
  const byCombination = new Map<string, BuildRecord[]>();

  for (const build of builds) {
    const key = `${build.runType}|${build.environment}`;
    const bucket = byCombination.get(key) ?? [];
    bucket.push(build);
    byCombination.set(key, bucket);
  }

  const retained: BuildRecord[] = [];

  for (const bucket of byCombination.values()) {
    bucket.sort((a, b) => b.buildNumber - a.buildNumber);
    retained.push(...bucket.slice(0, keepPerCombination));

    for (const dropped of bucket.slice(keepPerCombination)) {
      const droppedDir = path.join(siteDir, dropped.buildPath);
      fs.rmSync(droppedDir, { recursive: true, force: true });
      console.log(`[report-site] Pruned old build ${dropped.buildPath}`);
    }
  }

  return retained.sort((a, b) => b.buildNumber - a.buildNumber);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Write a meta-refresh page so `latest/<runtype>/<env>/` always opens the newest build. */
function writeLatestRedirects(siteDir: string, builds: BuildRecord[]): void {
  const newestByCombination = new Map<string, BuildRecord>();

  for (const build of builds) {
    const key = `${slugify(build.runType, 'full')}/${slugify(build.environment, 'stage')}`;
    const current = newestByCombination.get(key);
    if (!current || build.buildNumber > current.buildNumber) {
      newestByCombination.set(key, build);
    }
  }

  for (const [key, build] of newestByCombination) {
    const targetDir = path.join(siteDir, LATEST_DIR, ...key.split('/'));
    fs.mkdirSync(targetDir, { recursive: true });

    // ../../.. climbs out of latest/<runtype>/<env> back to the site root.
    const href = `../../../${build.buildPath}/`;
    fs.writeFileSync(
      path.join(targetDir, 'index.html'),
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${href}">
    <title>Latest ${escapeHtml(build.runType)} report — ${escapeHtml(build.environment)}</title>
  </head>
  <body>
    <p>Opening <a href="${href}">build #${build.buildNumber}</a>.</p>
  </body>
</html>
`,
    );
  }
}

/** Render the catalog page listing every retained build, newest first. */
function writeCatalog(siteDir: string, builds: BuildRecord[]): void {
  const runTypes = [...new Set(builds.map((build) => build.runType))].sort();
  const environments = [...new Set(builds.map((build) => build.environment))].sort();

  const rows = builds
    .map((build) => {
      const statusClass = build.status === 'passed' ? 'ok' : 'bad';
      const executed = new Date(build.timestamp).toISOString().replace('T', ' ').slice(0, 16);

      return `<tr data-run-type="${escapeHtml(build.runType)}" data-environment="${escapeHtml(build.environment)}">
        <td><a href="${escapeHtml(build.buildPath)}/">#${build.buildNumber}</a></td>
        <td>${escapeHtml(build.runType)}</td>
        <td>${escapeHtml(build.environment)}</td>
        <td>${escapeHtml(build.location)}</td>
        <td>${escapeHtml(build.browser)}</td>
        <td class="${statusClass}">${build.stats.passPercentage}%</td>
        <td>${build.stats.total}</td>
        <td>${build.stats.passed}</td>
        <td>${build.stats.failed + build.stats.broken}</td>
        <td>${build.stats.skipped}</td>
        <td>${escapeHtml(executed)} UTC</td>
        <td>${build.workflowRunUrl ? `<a href="${escapeHtml(build.workflowRunUrl)}">CI run</a>` : '—'}</td>
      </tr>`;
    })
    .join('\n');

  const options = (values: string[]) =>
    values
      .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
      .join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mattamy Homes Automation — Report Builds</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0; padding: 32px 20px; font-family: -apple-system, Segoe UI, Arial, sans-serif; background: #f3f5f8; color: #172033; }
      @media (prefers-color-scheme: dark) { body { background: #11151c; color: #e6e9ef; } }
      .wrap { max-width: 1180px; margin: 0 auto; }
      h1 { font-size: 24px; margin: 0 0 4px; }
      p.sub { margin: 0 0 20px; opacity: .7; font-size: 14px; }
      .filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
      select { padding: 6px 10px; border-radius: 6px; border: 1px solid #b9c2cf; background: transparent; color: inherit; font-size: 14px; }
      .scroll { overflow-x: auto; border: 1px solid #d5dbe4; border-radius: 8px; }
      @media (prefers-color-scheme: dark) { .scroll { border-color: #2b3340; } }
      table { border-collapse: collapse; width: 100%; font-size: 14px; background: rgba(255,255,255,.55); }
      @media (prefers-color-scheme: dark) { table { background: rgba(255,255,255,.03); } }
      th, td { padding: 9px 12px; text-align: left; white-space: nowrap; border-bottom: 1px solid #e2e7ee; }
      @media (prefers-color-scheme: dark) { th, td { border-bottom-color: #232a35; } }
      th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; opacity: .65; }
      tr:last-child td { border-bottom: none; }
      a { color: #1d63c8; } @media (prefers-color-scheme: dark) { a { color: #6ba6ff; } }
      .ok { color: #17794a; font-weight: 700; } .bad { color: #c02b2b; font-weight: 700; }
      @media (prefers-color-scheme: dark) { .ok { color: #4ec98a; } .bad { color: #ff8080; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Mattamy Homes Automation — Report Builds</h1>
      <p class="sub">${builds.length} retained build${builds.length === 1 ? '' : 's'}. Each row opens that build's full Allure report.</p>

      <div class="filters">
        <select id="runTypeFilter"><option value="">All run types</option>${options(runTypes)}</select>
        <select id="environmentFilter"><option value="">All environments</option>${options(environments)}</select>
      </div>

      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Build</th><th>Run type</th><th>Env</th><th>Location</th><th>Browser</th>
              <th>Pass %</th><th>Total</th><th>Passed</th><th>Failed</th><th>Skipped</th>
              <th>Executed</th><th>CI</th>
            </tr>
          </thead>
          <tbody id="builds">
${rows}
          </tbody>
        </table>
      </div>
    </div>

    <script>
      var runTypeFilter = document.getElementById('runTypeFilter');
      var environmentFilter = document.getElementById('environmentFilter');
      function applyFilters() {
        var runType = runTypeFilter.value;
        var environment = environmentFilter.value;
        var rows = document.querySelectorAll('#builds tr');
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var matches = (!runType || row.dataset.runType === runType) &&
                        (!environment || row.dataset.environment === environment);
          row.style.display = matches ? '' : 'none';
        }
      }
      runTypeFilter.addEventListener('change', applyFilters);
      environmentFilter.addEventListener('change', applyFilters);
    </script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(siteDir, 'index.html'), html);
}

/**
 * Derive the GitHub Pages origin from GITHUB_REPOSITORY ("owner/repo"), which is
 * set for every trigger — unlike the event payload, which varies by event type.
 * REPORT_SITE_BASE_URL overrides this for a custom domain.
 */
function getDefaultSiteBaseUrl(): string {
  const [owner, repo] = getEnv('GITHUB_REPOSITORY').split('/');
  return owner && repo ? `https://${owner.toLowerCase()}.github.io/${repo}` : '';
}

/**
 * GitHub Pages refuses to publish a site larger than 1 GB, and it fails the
 * deployment rather than truncating — so the failure would surface as "reports
 * stopped updating", not as an obvious size error. Warn well before that, while
 * lowering KEEP_BUILDS_PER_COMBINATION is still a calm decision.
 */
const PAGES_SIZE_LIMIT_BYTES = 1024 ** 3;
const PAGES_SIZE_WARN_BYTES = Math.floor(PAGES_SIZE_LIMIT_BYTES * 0.75);

function getDirectorySize(dir: string): number {
  let total = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      total += getDirectorySize(fullPath);
    } else if (entry.isFile()) {
      total += fs.statSync(fullPath).size;
    }
  }

  return total;
}

function reportSiteSize(siteDir: string): void {
  const bytes = getDirectorySize(siteDir);
  const megabytes = Math.round(bytes / 1024 / 1024);

  console.log(`[report-site] Published site size: ${megabytes} MB`);

  if (bytes >= PAGES_SIZE_WARN_BYTES) {
    console.warn(
      `::warning::Report site is ${megabytes} MB, approaching the 1 GB GitHub Pages limit. ` +
        'Lower KEEP_BUILDS_PER_COMBINATION to prune more aggressively.',
    );
  }
}

/** Site-relative path of the trend history for this run type + environment. */
function getHistoryFileName(runType: string, environment: string): string {
  return `desktop-${slugify(runType, 'full')}-${slugify(environment, 'stage')}.jsonl`;
}

function resolveSiteDir(): string {
  return path.resolve(REPO_ROOT, getEnv('REPORT_SITE_DIR', 'gh-pages-site'));
}

/**
 * Copy this run type + environment's history out of the published site so Allure
 * extends the right trend chain. Storing history on the branch instead of in the
 * Actions cache means the history and the report it describes are written in one
 * commit — they cannot drift — and it survives the cache's 7-day eviction.
 */
export function restoreReportHistory(): void {
  const siteDir = resolveSiteDir();
  const runType = getRunType();
  const environment = getEnvConfig().envName;
  const source = path.join(siteDir, HISTORY_DIR, getHistoryFileName(runType, environment));

  if (!fs.existsSync(source)) {
    console.log(
      `[report-site] No published history for ${runType} / ${environment} yet — trends start fresh.`,
    );
    return;
  }

  fs.mkdirSync(path.dirname(DESKTOP_ALLURE_HISTORY_FILE), { recursive: true });
  fs.copyFileSync(source, DESKTOP_ALLURE_HISTORY_FILE);
  console.log(
    `[report-site] Restored ${runType} / ${environment} trend history from the report site.`,
  );
}

/** Write the history Allure just extended back into the site, beside the build. */
function saveReportHistory(siteDir: string, runType: string, environment: string): void {
  if (!fs.existsSync(DESKTOP_ALLURE_HISTORY_FILE)) {
    return;
  }

  const historyDir = path.join(siteDir, HISTORY_DIR);
  fs.mkdirSync(historyDir, { recursive: true });
  fs.copyFileSync(
    DESKTOP_ALLURE_HISTORY_FILE,
    path.join(historyDir, getHistoryFileName(runType, environment)),
  );
}

/** Expose a value to later workflow steps via $GITHUB_OUTPUT. */
function setStepOutput(name: string, value: string): void {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }
  fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

export function publishReportSite(): void {
  const siteDir = resolveSiteDir();
  const reportDir = path.resolve(getEnv('REPORT_SOURCE_DIR', DESKTOP_ALLURE_REPORT_DIR));

  if (!fs.existsSync(path.join(reportDir, 'awesome', 'index.html'))) {
    throw new Error(`No generated Allure report found at ${reportDir}. Run allure:generate first.`);
  }

  const runType = getRunType();
  const environment = getEnvConfig().envName;
  const buildNumber = getNumberEnv('BUILD_NUMBER', getNumberEnv('GITHUB_RUN_NUMBER', 0));

  if (!buildNumber) {
    throw new Error('BUILD_NUMBER (or GITHUB_RUN_NUMBER) must be set to a non-zero build number.');
  }

  const buildPath = `${slugify(runType, 'full')}/${slugify(environment, 'stage')}/${buildNumber}`;
  const stats = readStats(reportDir);

  fs.mkdirSync(siteDir, { recursive: true });
  // Stop GitHub Pages' Jekyll pass from dropping Allure's underscore-prefixed assets.
  fs.writeFileSync(path.join(siteDir, '.nojekyll'), '');

  const excludedExtensions = getExcludedAttachmentExtensions();
  const buildDir = path.join(siteDir, buildPath);
  fs.rmSync(buildDir, { recursive: true, force: true });
  const skippedAttachments = copyDir(reportDir, buildDir, excludedExtensions);

  if (skippedAttachments) {
    console.log(
      `[report-site] Withheld ${skippedAttachments} attachment(s) (${excludedExtensions.join(', ')}) ` +
        'from the public copy; they remain in the CI artifacts.',
    );
  }

  saveReportHistory(siteDir, runType, environment);

  const serverUrl = getEnv('GITHUB_SERVER_URL', 'https://github.com');
  const repository = getEnv('GITHUB_REPOSITORY');
  const runId = getEnv('GITHUB_RUN_ID');

  const record: BuildRecord = {
    buildNumber,
    buildId: runId,
    runType,
    environment,
    location: getEnv('LOCATION', getEnv('TEST_LOCATION', 'ALL')),
    browser: getBrowserDisplayName(),
    branch: getEnv('GITHUB_REF_NAME', 'local'),
    commit: getEnv('GITHUB_SHA').slice(0, 7),
    workflowRunUrl: repository && runId ? `${serverUrl}/${repository}/actions/runs/${runId}` : '',
    buildPath,
    timestamp: new Date().toISOString(),
    stats,
    status: stats.failed + stats.broken > 0 ? 'failed' : 'passed',
  };

  // A re-run of the same build number replaces its entry rather than duplicating it.
  const builds = readManifest(siteDir).filter(
    (existing) => existing.buildPath !== record.buildPath,
  );
  builds.push(record);

  const retained = pruneBuilds(siteDir, builds, getNumberEnv('KEEP_BUILDS_PER_COMBINATION', 10));

  fs.writeFileSync(path.join(siteDir, MANIFEST_FILE), `${JSON.stringify(retained, null, 2)}\n`);
  writeLatestRedirects(siteDir, retained);
  writeCatalog(siteDir, retained);

  const baseUrl = (getEnv('REPORT_SITE_BASE_URL') || getDefaultSiteBaseUrl()).replace(/\/+$/, '');
  const buildUrl = baseUrl ? `${baseUrl}/${buildPath}/` : '';

  console.log(
    `[report-site] Published build #${buildNumber} (${runType} / ${environment}) to ${buildPath}`,
  );
  if (buildUrl) {
    console.log(`[report-site] Build URL: ${buildUrl}`);
  }

  reportSiteSize(siteDir);

  setStepOutput('build_path', buildPath);
  setStepOutput('build_url', buildUrl);
  setStepOutput('site_url', baseUrl ? `${baseUrl}/` : '');
}

if (require.main === module) {
  const command = process.argv[2] ?? 'publish';

  try {
    if (command === 'restore') {
      restoreReportHistory();
    } else if (command === 'publish') {
      publishReportSite();
    } else {
      throw new Error(`Unknown command "${command}". Use "restore" or "publish".`);
    }
  } catch (error) {
    console.error(`Failed to ${command} the Allure report site:`, error);
    process.exitCode = 1;
  }
}
