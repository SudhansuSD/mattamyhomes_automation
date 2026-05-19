import { CAN } from './can.config';
import { USA } from './usa.config';

export const LOCATIONS = {
  CAN,
  USA   
} as const;

export type LocationKey = keyof typeof LOCATIONS;
export type LocationConfig = typeof LOCATIONS[LocationKey];

declare const process: { env: { LOCATION?: string } };

export function getLocationKey(
  overrideLocation?: LocationKey
): LocationKey {
  const rawKey =
    overrideLocation ??
    (process?.env?.LOCATION as string | undefined) ??
    'CAN'; // Default location if not specified
  const key = rawKey.toUpperCase() as LocationKey;

  if (!LOCATIONS[key]) {
    throw new Error(`Invalid LOCATION provided: ${rawKey}`);
  }

  return key;
}

export function getLocationConfig(
  overrideLocation?: LocationKey
): LocationConfig {
  return LOCATIONS[getLocationKey(overrideLocation)];
}
