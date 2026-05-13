import { CAN } from './can.config';
import { USA } from './usa.config';

export const LOCATIONS = {
  CAN,
  USA   
} as const;

export type LocationKey = keyof typeof LOCATIONS;
export type LocationConfig = typeof LOCATIONS[LocationKey];

declare const process: { env: { LOCATION?: string } };

export function getLocationConfig(
  overrideLocation?: LocationKey
): LocationConfig {
  const rawKey =
    overrideLocation ??
    (process?.env?.LOCATION as string | undefined) ??
    'USA'; // Default location if not specified
  const key = rawKey.toUpperCase() as LocationKey;

  const location = LOCATIONS[key];

  if (!location) {
    throw new Error(`Invalid LOCATION provided: ${rawKey}`);
  }

  return location;
}
