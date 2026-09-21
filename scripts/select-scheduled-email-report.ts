import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

type PublishedBuild = {
  buildNumber: number;
  runType: string;
  environment: string;
  browser: string;
  buildPath: string;
  timestamp: string;
};

function selectReport(): void {
  const siteDir = path.resolve(process.env.REPORT_SITE_DIR || 'gh-pages-site');
  const manifestPath = path.join(siteDir, 'builds.json');
  const builds = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as PublishedBuild[];
  if (!Array.isArray(builds)) {
    throw new Error(`Invalid report manifest: ${manifestPath}`);
  }

  const build = builds
    .filter((item) => item.runType === 'Smoke' && item.environment === 'STAGE')
    .sort((a, b) => b.buildNumber - a.buildNumber)[0];
  if (!build || !Number.isInteger(build.buildNumber) || Number.isNaN(Date.parse(build.timestamp))) {
    throw new Error('No completed Smoke/STAGE report is available for the noon email.');
  }
  if (Date.now() - Date.parse(build.timestamp) > 36 * 60 * 60 * 1000) {
    throw new Error(
      `Latest Smoke/STAGE report is over 36 hours old (build #${build.buildNumber}).`,
    );
  }

  const reportDir = path.resolve(siteDir, build.buildPath);
  if (!reportDir.startsWith(`${siteDir}${path.sep}`)) {
    throw new Error(`Invalid report path in manifest: ${build.buildPath}`);
  }
  const summaryPath = path.join(reportDir, 'awesome', 'widgets', 'statistic.json');
  if (!fs.existsSync(summaryPath)) {
    throw new Error(`Published report summary is missing: ${summaryPath}`);
  }

  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  const siteUrl = (
    process.env.REPORT_SITE_BASE_URL ||
    (owner && repo ? `https://${owner.toLowerCase()}.github.io/${repo}` : '')
  ).replace(/\/+$/, '');
  if (!siteUrl) {
    throw new Error('Cannot determine the published report site URL.');
  }

  const output = process.env.GITHUB_OUTPUT;
  if (!output) {
    throw new Error('GITHUB_OUTPUT is required in the scheduled email workflow.');
  }
  const values = {
    report_dir: reportDir,
    report_url: `${siteUrl}/${build.buildPath.replace(/\\/g, '/')}/`,
    site_url: `${siteUrl}/`,
    build_number: String(build.buildNumber),
    browser: build.browser,
    published_at: build.timestamp,
  };
  fs.appendFileSync(
    output,
    Object.entries(values)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(''),
  );
  console.log(`Selected Smoke/STAGE build #${build.buildNumber} from ${build.timestamp}.`);
}

selectReport();
