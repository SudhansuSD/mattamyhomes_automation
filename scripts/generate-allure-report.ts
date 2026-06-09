import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export default async function generateAllureReport(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..');
  const resultsDir = path.resolve(repoRoot, 'allure-results');
  const reportDir = path.resolve(repoRoot, 'allure-report');

  if (!fs.existsSync(resultsDir)) {
    console.log('Allure HTML report skipped: allure-results folder was not created.');
    return;
  }

  const hasResults = fs
    .readdirSync(resultsDir)
    .some((fileName) => fileName.endsWith('-result.json'));

  if (!hasResults) {
    console.log('Allure HTML report skipped: no Allure test result files were found.');
    return;
  }

  const allureCommand = path.resolve(
    repoRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'allure.cmd' : 'allure',
  );

  execSync(
    `"${allureCommand}" generate "${resultsDir}" --clean -o "${reportDir}"`,
    {
      cwd: repoRoot,
      stdio: 'inherit',
    },
  );
}

if (require.main === module) {
  void generateAllureReport();
}
