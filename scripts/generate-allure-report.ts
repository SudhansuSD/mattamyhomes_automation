import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  DESKTOP_ALLURE_RESULTS_DIR,
  DESKTOP_ALLURE_REPORT_DIR,
  MOBILE_ALLURE_RESULTS_DIR,
  MOBILE_ALLURE_REPORT_DIR,
  MERGED_ALLURE_REPORT_DIR,
  REPO_ROOT
} from './allurePaths';

type ReportMode = 'desktop' | 'mobile' | 'merged';

function hasAllureResults(resultsDir: string): boolean {
  if (!fs.existsSync(resultsDir)) {
    return false;
  }

  return fs.readdirSync(resultsDir).some((fileName) => fileName.endsWith('-result.json'));
}

function generateReport(resultsDirs: string[], reportDir: string): void {
  const activeResults = resultsDirs.filter((dir) => hasAllureResults(dir));

  if (!activeResults.length) {
    console.log(`Allure HTML report skipped: no Allure test result files were found for ${path.basename(reportDir)}.`);
    return;
  }

  const allureCommand = path.resolve(
    REPO_ROOT,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'allure.cmd' : 'allure',
  );

  execSync(
    `"${allureCommand}" generate ${activeResults.map((dir) => `"${dir}"`).join(' ')} --clean -o "${reportDir}"`,
    {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    },
  );
}

export default async function generateAllureReport(mode: ReportMode = 'desktop'): Promise<void> {
  switch (mode) {
    case 'mobile':
      generateReport([MOBILE_ALLURE_RESULTS_DIR], MOBILE_ALLURE_REPORT_DIR);
      return;
    case 'merged':
      generateReport(
        [DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR],
        MERGED_ALLURE_REPORT_DIR
      );
      return;
    case 'desktop':
    default:
      generateReport([DESKTOP_ALLURE_RESULTS_DIR], DESKTOP_ALLURE_REPORT_DIR);
  }
}

if (require.main === module) {
  const mode = (process.argv[2] as ReportMode | undefined) ?? 'desktop';
  void generateAllureReport(mode);
}
