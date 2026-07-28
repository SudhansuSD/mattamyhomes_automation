import { getLocationKey, LocationKey } from '../locations/locationConfig';

/* ==========================================================
   Country Navigation Source of Truth

   Availability of a page is defined by what a country's site
   navigation actually DISPLAYS - not by whether the raw URL
   resolves. Some pages (e.g. /homebuying/shopping-tools) return
   200 for both countries but are only linked in one country's
   menu; for the other country they are treated as unavailable.
========================================================== */

export type NavLink = {
  name: string;
  url: string;
};

/**
 * The country-specific "Homebuying" (USA) / "Resources" (CAN) mega-menu
 * flyout and the exact links each surfaces. Drives the header mega-menu
 * validation.
 */
export const RESOURCE_MENU_BY_COUNTRY: Record<
  LocationKey,
  { menuName: string; links: readonly NavLink[] }
> = {
  USA: {
    menuName: 'Homebuying',
    links: [
      { name: 'Homebuying Journey', url: '/homebuying/homebuying' },
      { name: 'Homebuying Options', url: '/homebuying/shopping-tools' },
      { name: 'Financing Options', url: '/homebuying/financing' },
    ],
  },
  CAN: {
    menuName: 'Resources',
    links: [
      { name: 'What to Expect', url: '/homebuying/homebuying' },
      { name: 'Financing', url: '/homebuying/financing' },
      { name: 'Design Studio', url: '/design-studio' },
    ],
  },
};

/**
 * Full set of Design Studio / Homebuying section paths surfaced in each
 * country's navigation (top-level items + mega-menu links). A page NOT listed
 * here is not offered to that country's visitors even if its URL resolves.
 */
export const EXPOSED_PATHS_BY_COUNTRY: Record<LocationKey, readonly string[]> = {
  USA: [
    '/design-studio', // top-level nav item
    '/homebuying/homebuying', // Homebuying > Homebuying Journey
    '/homebuying/shopping-tools', // Homebuying > Homebuying Options
    '/homebuying/financing', // Homebuying > Financing Options
  ],
  CAN: [
    '/design-studio', // Resources > Design Studio
    '/homebuying/homebuying', // Resources > What to Expect
    '/homebuying/financing', // Resources > Financing
    // NOTE: /homebuying/shopping-tools resolves for CAN but is NOT displayed in
    // CAN navigation, so it is intentionally excluded (treated as unavailable).
  ],
};

/** Returns whether the given path is surfaced in the country's navigation. */
export function isPathExposedForCountry(path: string, country?: LocationKey): boolean {
  const key = country ?? getLocationKey();
  return (EXPOSED_PATHS_BY_COUNTRY[key] ?? []).includes(path);
}

/**
 * Static "About" section pages surfaced as TOP-LEVEL header items (outside the
 * About dropdown), per country. Sustainability lives under the About menu on
 * USA but is promoted to a standalone top-level item on CAN, so it is only
 * reachable via the top-level link there.
 */
export const TOP_LEVEL_STATIC_LINKS_BY_COUNTRY: Record<LocationKey, readonly NavLink[]> = {
  USA: [],
  CAN: [{ name: 'Sustainability', url: '/about/sustainability' }],
};
