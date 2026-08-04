/**
 * Specs that do NOT vary with the selected location.
 *
 * Two kinds live here: suites that cover both countries themselves or have no
 * per-country data at all, and suites pinned to the only country where the
 * feature exists (MPC is USA-only, condos are Canada-only) — those resolve
 * their own location data and drive their own country whatever LOCATION says.
 *
 * Either way the result is identical in every location pass. When
 * `scripts/run-locations.ts` runs one pass per location they must execute
 * exactly once — otherwise every pass would re-run the identical tests and
 * write colliding Allure results (same test name, same parameters), which
 * Allure folds into a single entry and reports as retries.
 *
 * playwright.config.ts adds these to `testIgnore` for every pass after the
 * first, so they are never collected twice in a single multi-location run.
 * A normal single-location run ignores nothing.
 */
export const LOCATION_AGNOSTIC_SPECS = [
  // Iterates CONTACT_COUNTRIES (USA + CAN) internally.
  'contactPage.spec.ts',
  // Iterates CUSTOMER_CARE_COUNTRIES (USA + CAN) internally.
  'customerCarePage.spec.ts',
  // Legal/policy pages are identical for every country.
  'staticLegalPages.spec.ts',
  // Footer assertions are structural (footer visible, Privacy Policy link,
  // social hrefs absolute, newsletter rejects a bad email) — no per-country
  // data, so running it in both passes would just repeat the same checks.
  'footerNavigation.spec.ts',
  // USA-only promotion.
  'promoPage.spec.ts',
  // USA-only feature — pinned to USA data and the USA site.
  'mpc.spec.ts',
  // Canada-only features — pinned to CAN data and the Canadian site.
  'condoCommunity.spec.ts',
  'condoPlan.spec.ts',
] as const;

/** `testIgnore` globs for the location-agnostic specs, relative to testDir. */
export const LOCATION_AGNOSTIC_SPEC_GLOBS = LOCATION_AGNOSTIC_SPECS.map((file) => `**/${file}`);
