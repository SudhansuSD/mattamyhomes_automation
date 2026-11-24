/** Loads `.env` from the repo root once and validates required variables. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

/** Absolute path to the repository root, independent of the current cwd. */
export const REPO_ROOT = path.resolve(__dirname, '..');

/** True when running under CI (GitHub Actions sets CI=true). */
export const isCI = !!process.env.CI;

let loaded = false;

/** Loads `.env` once if present; CI reads values from the real environment. */
export function loadEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = path.resolve(REPO_ROOT, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else if (!isCI) {
    // Not fatal, but locally a missing .env is usually a setup mistake.
    console.warn(
      `[env] No .env file found at ${envPath}. Copy .env.example to .env and fill in values.`,
    );
  }
}

/** Reads a trimmed env var, or the fallback if unset. */
export function getEnv(name: string, fallback = ''): string {
  loadEnv();
  return process.env[name]?.trim() || fallback;
}

/** Reads a boolean env var ("true", "1", "yes", "on"). */
export function getBoolEnv(name: string, fallback = false): boolean {
  const raw = getEnv(name);
  if (!raw) return fallback;
  return ['true', '1', 'yes', 'on'].includes(raw.toLowerCase());
}

/** Reads a numeric env var, or the fallback if unset or invalid. */
export function getNumberEnv(name: string, fallback: number): number {
  const raw = getEnv(name);
  const parsed = Number(raw);
  return raw && Number.isFinite(parsed) ? parsed : fallback;
}

/** Returns the named variables, throwing one error that lists any missing. */
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

/** Returns the Jira variables, throwing if any are missing. */
export function requireJiraEnv() {
  return requireEnv(JIRA_ENV_VARS, 'Jira integration');
}
