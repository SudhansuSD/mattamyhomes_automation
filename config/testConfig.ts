import { STAGE_ENV } from './environments/stage.config';
import { PROD_ENV } from './environments/prod.config';

export function getEnvConfig() {
  const env = process.env.ENV ?? 'PROD';

  if (env === 'PROD') {
    return { ...PROD_ENV, envName: 'PROD' };
  }

  return { ...STAGE_ENV, envName: 'STAGE' };
}
