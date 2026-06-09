import { spawn } from 'node:child_process';
import process from 'node:process';

type CommandResult = {
  command: string;
  exitCode: number;
};

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runNpmScript(scriptName: string): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(npmCommand, ['run', scriptName], {
      env: process.env,
      shell: false,
      stdio: 'inherit',
    });

    child.on('error', (error) => {
      console.error(`Unable to start npm script "${scriptName}":`, error);
      resolve({ command: scriptName, exitCode: 1 });
    });

    child.on('close', (code) => {
      resolve({ command: scriptName, exitCode: code ?? 1 });
    });
  });
}

async function runWorkflow(): Promise<void> {
  const testResult = await runNpmScript('test:allure');

  if (testResult.exitCode !== 0) {
    console.warn(`Playwright completed with exit code ${testResult.exitCode}. Continuing report generation and email.`);
  }

  const generateResult = await runNpmScript('allure:generate');
  const emailResult = await runNpmScript('report:email');

  if (emailResult.exitCode !== 0) {
    process.exitCode = emailResult.exitCode;
    return;
  }

  process.exitCode = testResult.exitCode || generateResult.exitCode;
}

runWorkflow().catch((error) => {
  console.error('Allure email workflow failed:', error);
  process.exitCode = 1;
});
