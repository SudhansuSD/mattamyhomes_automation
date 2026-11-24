import { getEnvConfig } from './envConfig';

declare const process: { env: { ALLOW_LEAD_SUBMISSION?: string } };

type EnvName = ReturnType<typeof getEnvConfig>['envName'];

/** Per-environment pause for live submissions (`true` = paused); PROD is always blocked. */
// Kept here, not in a runner flag, so it holds for every run since STAGE creates real CRM records.
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

/** Skip reason for the report when submissions are blocked, or null when allowed. */
export function getLeadSubmissionSkipReason(): string | null {
  if (isLeadSubmissionAllowed()) {
    return null;
  }

  const { envName } = getEnvConfig();

  return envName === 'PROD'
    ? 'Lead submissions must run only on STAGE.'
    : `Lead submissions are paused on ${envName}; set ALLOW_LEAD_SUBMISSION=true to run one.`;
}

/** True when the current run must not submit a live lead form. */
export function isLeadSubmissionBlocked(): boolean {
  return !isLeadSubmissionAllowed();
}
