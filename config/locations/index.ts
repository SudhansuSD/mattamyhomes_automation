import { CAN } from './can.config';
import { USA } from './usa.config';

export const LOCATIONS = {
  CAN,
  USA   
} as const;

export type LocationKey = keyof typeof LOCATIONS;
export type LocationConfig = typeof LOCATIONS[LocationKey];

export function getLocationConfig(
  overrideLocation?: LocationKey
): LocationConfig {
  const key =
    overrideLocation ??
    (process.env.LOCATION as LocationKey) ??
    'CAN';

  const location = LOCATIONS[key];

  if (!location) {
    throw new Error(`Invalid LOCATION provided: ${key}`);
  }

  return location;
}
