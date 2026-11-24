/** Specs that ignore LOCATION; run once per multi-location run so Allure results do not collide. */
export const LOCATION_AGNOSTIC_SPECS = [
  // Iterates CONTACT_COUNTRIES (USA + CAN) internally.
  'contactPage.spec.ts',
  // Iterates CUSTOMER_CARE_COUNTRIES (USA + CAN) internally.
  'customerCarePage.spec.ts',
  // Iterates COUNTRIES (USA + CAN) internally.
  'designStudioPage.spec.ts',
  // Legal/policy pages are identical for every country.
  'staticLegalPages.spec.ts',
  // Footer checks are structural, with no per-country data.
  'footerNavigation.spec.ts',
  // USA-only feature.
  'mpc.spec.ts',
  // Canada-only features.
  'condoCommunity.spec.ts',
  'condoPlan.spec.ts',
] as const;

/** `testIgnore` globs for the location-agnostic specs, relative to testDir. */
export const LOCATION_AGNOSTIC_SPEC_GLOBS = LOCATION_AGNOSTIC_SPECS.map((file) => `**/${file}`);
