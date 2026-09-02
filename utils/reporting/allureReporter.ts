import { test } from '@playwright/test';

/*
 * Allure step reporting helpers.
 *
 * Shared helpers for producing clean, named Allure report steps instead of dumping diagnostics to
 * stdout. Specs import them directly:
 *
 *   import { reportValue, step } from '../reporting/allureReporter';
 *   await reportValue(`Page URL: ${page.url()}`);
 *
 * Page objects use the thin BasePage wrappers instead:
 *
 *   await this.reportValue('Opened QMI detail', address);
 *   await this.step('Verify hero section', async () => { ... });
 */

/**
 * Records an informational message (optionally with a value) as a standalone
 * named Allure step. Use this in place of console.log for diagnostics worth
 * surfacing in the report; drop purely decorative logs entirely.
 */
export async function reportValue(message: string, value?: unknown): Promise<void> {
  const text =
    value === undefined
      ? message
      : `${message} ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`;

  await test.step(text, async () => {
    /* informational step – no assertion */
  });
}

/**
 * Runs an action inside a named Allure step so it shows as a labeled node in
 * the report tree (instead of an unnamed body with a large stdout dump).
 * Returns whatever the wrapped action returns.
 */
export async function step<T>(name: string, body: () => Promise<T> | T): Promise<T> {
  return test.step(name, async () => body());
}

/**
 * Records selector drift as an attachment, not just a log line.
 *
 * A healed locator means the app changed and the suite absorbed it quietly.
 * The attachment shows it per test; the stdout marker makes it countable in CI.
 */
export async function reportSelectorDrift(
  label: string,
  primarySelector: string,
  healedSelector: string,
): Promise<void> {
  const detail = [
    `Locator: ${label}`,
    `Primary selector (failed): ${primarySelector}`,
    `Fallback selector (used):  ${healedSelector}`,
    '',
    'The page changed and a fallback selector absorbed it. Update the primary',
    'selector - fallbacks are a safety net, not the intended locator.',
  ].join('\n');

  console.warn(`[selector-drift] ${label}: ${primarySelector} -> ${healedSelector}`);

  await test.info().attach(`selector-drift-${label}`, {
    body: detail,
    contentType: 'text/plain',
  });

  await reportValue(`Self-healed locator (selector drift): ${label}`, healedSelector);
}
