import { STAGE_ENV } from '../config/environments/stage.config';
import {PROD_ENV} from '../config/environments/prod.config';
import { CAN } from '../config/locations/can.config';
import { USA } from '../config/locations/usa.config';

export function getTestContext() {
  const env = process.env.ENV || 'STAGE';
  const location = process.env.LOCATION || 'CAN';

  const envConfig = env === 'PROD' ? PROD_ENV : STAGE_ENV;
  const locationConfig = location === 'USA' ? USA : CAN;

  return {
    envConfig,
    locationConfig
  };
}
