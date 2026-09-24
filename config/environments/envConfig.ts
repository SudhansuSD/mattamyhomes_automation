declare const process: { env: { ENV?: string } };

const ENVIRONMENT_CONFIGS = {
  STAGE: {
    name: 'STAGE',
    baseURL: 'https://stagemh-sc.exsquared.com',
  },
  PROD: {
    name: 'PROD',
    baseURL: 'https://www.mattamyhomes.com',
  },
} as const;

type EnvName = keyof typeof ENVIRONMENT_CONFIGS;

export function getEnvConfig() {
  const env = (process?.env?.ENV ?? 'PROD').toUpperCase() as EnvName;

  const config = ENVIRONMENT_CONFIGS[env] ?? ENVIRONMENT_CONFIGS.STAGE;
  const envName = ENVIRONMENT_CONFIGS[env] ? env : 'PROD';

  return { ...config, envName };
}
