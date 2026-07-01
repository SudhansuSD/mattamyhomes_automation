import { test } from '@playwright/test';

/* ==========================================================
   Allure Step Reporting Helpers

   Shared helpers for producing clean, named Allure report
   steps instead of dumping diagnostics to stdout.

   - Import directly in spec files:
       import { reportValue, step } from '../utils/allureReporter';
       await reportValue(`Page URL: ${await page.url()}`);

   - Or use the thin BasePage wrappers inside page objects:
       await this.reportValue('Opened QMI detail', address);
       await this.step('Verify hero section', async () => { ... });
========================================================== */

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
