import { test } from '@playwright/test';

// Named Allure steps for specs; page objects use the BasePage wrappers.

/** Records a message (and optional value) as an Allure step, in place of console.log. */
export async function reportValue(message: string, value?: unknown): Promise<void> {
  const text =
    value === undefined
      ? message
      : `${message} ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`;

  await test.step(text, async () => {
    /* informational step */
  });
}

/** Runs an action inside a named Allure step and returns its result. */
export async function step<T>(name: string, body: () => Promise<T> | T): Promise<T> {
  return test.step(name, async () => body());
}

/** Records a fallback-selector hit as an attachment, with a stdout marker countable in CI. */
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
