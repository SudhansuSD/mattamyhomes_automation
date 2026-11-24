import { getEnvConfig } from '../environments/envConfig';
import type { LocationKey } from '../locations/locationConfig';

// Features allowed to be missing; everything else is required. Only list a feature that truly
// does not exist for that country - a flaky locator is a bug, not an optional feature.

export type FeatureKey =
  // Community page
  | 'community.availableHomesSection'
  | 'community.mapSection'
  | 'community.contactSection'
  | 'community.hoursCta'
  | 'community.directionsCta'
  | 'community.scheduleAppointmentCta'
  // Market page
  | 'market.communitySection'
  | 'market.discoverOurHomesSection'
  // QMI page
  | 'qmi.salesOfficeSection'
  | 'qmi.salesOfficeMapLink'
  | 'qmi.relatedQmiSection'
  // Plan / condo plan
  | 'plan.mediaGallery'
  | 'condoPlan.showMoreFloorplans'
  // Condo community
  | 'condoCommunity.availableFloorplansSection'
  | 'condoCommunity.galleryModal'
  | 'condoCommunity.galleryModalMedia'
  | 'condoCommunity.inPageGalleryMedia'
  // MPC
  | 'mpc.imageGallery'
  | 'mpc.galleryModalMedia'
  // About Us
  | 'about.showMore'
  | 'about.investorForm'
  // Promo page
  | 'promo.leadForm';

type OptionalFeatureRules = Partial<Record<LocationKey, readonly FeatureKey[]>>;

/** Features that genuinely do not exist for a country, in every environment. */
const OPTIONAL_BY_LOCATION: OptionalFeatureRules = {
  // Not every promotion has a lead form; the related QMI section only renders
  // when nearby inventory exists.
  USA: ['promo.leadForm', 'qmi.relatedQmiSection'],
  CAN: [
    'promo.leadForm',
    'qmi.relatedQmiSection',
    // Canadian community pages have no appointment scheduling at all.
    'community.scheduleAppointmentCta',
    // Condo plan pages link to search via "View all" instead of expanding.
    'condoPlan.showMoreFloorplans',
  ],
};

/** Per-environment exceptions, for content that only exists on one environment. */
const OPTIONAL_BY_ENVIRONMENT: Partial<Record<string, OptionalFeatureRules>> = {
  // PROD: { USA: ['market.discoverOurHomesSection'] },
};

/** True when this feature is allowed to be missing for the location being run. */
export function isFeatureOptional(feature: FeatureKey, location: LocationKey): boolean {
  const { envName } = getEnvConfig();

  if (OPTIONAL_BY_ENVIRONMENT[envName]?.[location]?.includes(feature)) {
    return true;
  }

  return OPTIONAL_BY_LOCATION[location]?.includes(feature) ?? false;
}

/** Failure text naming the key and file to edit if the absence is real. */
export function buildMissingFeatureMessage(
  feature: FeatureKey,
  description: string,
  location: LocationKey,
  pageUrl: string,
): string {
  return [
    `${description} was not found on ${pageUrl}.`,
    '',
    `This is treated as a failure because "${feature}" is not declared optional for ${location}.`,
    'If this feature genuinely does not exist there, add it to OPTIONAL_BY_LOCATION in',
    `config/features/featureExpectations.ts under "${location}". Otherwise the locator or the`,
    'page itself is broken - which is exactly what this assertion exists to surface.',
  ].join('\n');
}

/** Returns the value if present, null if declared optional, and throws if required and missing. */
export function resolveFeature<T>(
  value: T | null | undefined,
  feature: FeatureKey,
  description: string,
  location: LocationKey,
  pageUrl: string,
): { value: T; skipMessage?: undefined } | { value: null; skipMessage: string } {
  if (value) {
    return { value };
  }

  if (isFeatureOptional(feature, location)) {
    return {
      value: null,
      skipMessage: `${description} not present (declared optional for ${location})`,
    };
  }

  throw new Error(buildMissingFeatureMessage(feature, description, location, pageUrl));
}
