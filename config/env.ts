/**
 * Central environment loader + validator.
 *
 * Goals:
 *  - Load `.env` exactly once, anchored to the repo root (NOT the caller's cwd),
 *    so scripts behave identically from VS Code, a plain terminal, or CI.
 *  - Tolerate CI, where there is no `.env` file and values arrive as real
 *    environment variables / GitHub secrets.
 *  - Fail fast with a clear, actionable message ("Missing EMAIL_USER — see
 *    .env.example") instead of blowing up deep inside a test or an SMTP call.
 *
 * Every entry point (playwright.config.ts, wdio.mobile.conf.ts, and the
 * scripts/*.ts) should `import { loadEnv } from '<...>/config/env'` and call
 * `loadEnv()` before reading `process.env`.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

/** Absolute path to the repository root, independent of the current cwd. */
export const REPO_ROOT = path.resolve(__dirname, '..');

/** True when running under CI (GitHub Actions sets CI=true). */
export const isCI = !!process.env.CI;

let loaded = false;

/**
 * Load `.env` from the repo root a single time. Idempotent and safe to call
 * from every entry point. In CI there is usually no `.env` file — that is fine;
 * values are read straight from the process environment.
 */
export function loadEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = path.resolve(REPO_ROOT, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else if (!isCI) {
    // Not fatal — some flows (e.g. running only mobile tests) may not need it —
    // but a missing .env locally is almost always a setup mistake worth noting.
    console.warn(
      `[env] No .env file found at ${envPath}. Copy .env.example to .env and fill in values.`,
    );
  }
}

/** Read a trimmed env var, falling back to a default (empty string) if unset. */
export function getEnv(name: string, fallback = ''): string {
  loadEnv();
  return process.env[name]?.trim() || fallback;
}

/** Read a boolean env var ("true"/"1" => true). */
export function getBoolEnv(name: string, fallback = false): boolean {
  const raw = getEnv(name);
  if (!raw) return fallback;
  return ['true', '1', 'yes', 'on'].includes(raw.toLowerCase());
}

/** Read a numeric env var, falling back if unset/invalid. */
export function getNumberEnv(name: string, fallback: number): number {
  const raw = getEnv(name);
  const parsed = Number(raw);
  return raw && Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Assert that every named variable is present; throw one clear error listing
 * all that are missing. Use at the start of a script/flow that needs them.
 */
export function requireEnv(names: string[], context = ''): Record<string, string> {
  loadEnv();
  const resolved: Record<string, string> = {};
  const missing: string[] = [];

  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      resolved[name] = value;
    } else {
      missing.push(name);
    }
  }

  if (missing.length) {
    const where = context ? ` (required for ${context})` : '';
    throw new Error(
      `Missing required environment variable(s)${where}: ${missing.join(', ')}. ` +
        `See .env.example for the full list, then set them in .env (locally) or as CI secrets.`,
    );
  }

  return resolved;
}

/** Variables required to talk to Jira (jira:fetch / jira:analyze / generate:*). */
export const JIRA_ENV_VARS = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];

/** Variables required to send the Allure email report. */
export const EMAIL_ENV_VARS = [
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
  'EMAIL_TO',
];

export function requireJiraEnv() {
  return requireEnv(JIRA_ENV_VARS, 'Jira integration');
}
