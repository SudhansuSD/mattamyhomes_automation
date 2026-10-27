import { getEnvConfig } from './envConfig';

declare const process: { env: { ALLOW_LEAD_SUBMISSION?: string } };

type EnvName = ReturnType<typeof getEnvConfig>['envName'];

/**
 * Whether live lead submissions are paused, per environment. STAGE submissions create real CRM
 * records, so the switch lives here rather than in a runner flag - it has to hold for every run,
 * however started.
 *
 * Set an environment to `true` to pause it; a paused environment can still run once with
 * `ALLOW_LEAD_SUBMISSION=true`. PROD stays blocked regardless of this table.
 */
const LEAD_SUBMISSIONS_PAUSED: Record<EnvName, boolean> = {
  STAGE: false,
  PROD: true,
};

/** True when the current run is allowed to submit a live lead form. */
export function isLeadSubmissionAllowed(): boolean {
  const { envName } = getEnvConfig();

  if (envName === 'PROD') {
    return false;
  }

  return (
    !LEAD_SUBMISSIONS_PAUSED[envName] ||
    process?.env?.ALLOW_LEAD_SUBMISSION?.toLowerCase() === 'true'
  );
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
    : `Lead submissions are paused on ${envName}; set ALLOW_LEAD_SUBMISSION=true to run one.`;
}

/** True when the current run must not submit a live lead form - the guard page objects assert on. */
export function isLeadSubmissionBlocked(): boolean {
  return !isLeadSubmissionAllowed();
}
