import { getEnvConfig } from './envConfig';

declare const process: { env: { ALLOW_LEAD_SUBMISSION?: string } };

/**
 * Live lead submissions are paused on every environment, STAGE included, until the client asks
 * for them again. STAGE submissions still create real CRM records, so the pause is a default
 * rather than a runner flag - `npm run test:no-submit` only helped the runs that remembered it.
 *
 * To resume, either set `ALLOW_LEAD_SUBMISSION=true` for a single run or flip
 * `LEAD_SUBMISSIONS_PAUSED` to false. PROD stays blocked regardless.
 */
const LEAD_SUBMISSIONS_PAUSED = true;

/** True when the current run is allowed to submit a live lead form. */
export function isLeadSubmissionAllowed(): boolean {
  const { envName } = getEnvConfig();

  if (envName === 'PROD') {
    return false;
  }

  return !LEAD_SUBMISSIONS_PAUSED || process?.env?.ALLOW_LEAD_SUBMISSION?.toLowerCase() === 'true';
}

/**
 * Reason to record when a submission is skipped, or null when submissions are allowed. Returned
 * as a message so the skip reads as a recorded decision in the report instead of a silent pass.
 */
export function getLeadSubmissionSkipReason(): string | null {
  if (isLeadSubmissionAllowed()) {
    return null;
  }

  const { envName } = getEnvConfig();

  return envName === 'PROD'
    ? 'Lead submissions must run only on STAGE.'
    : 'Lead submissions are paused on all environments until re-enabled; set ALLOW_LEAD_SUBMISSION=true to run one.';
}

/** True when the current run must not submit a live lead form - the guard page objects assert on. */
export function isLeadSubmissionBlocked(): boolean {
  return !isLeadSubmissionAllowed();
}
