import { getLocationKey, LocationKey } from '../locations/locationConfig';

/*
 * Country navigation source of truth.
 *
 * A page counts as available when a country's site navigation actually DISPLAYS it, not when the
 * raw URL resolves. Some pages (/homebuying/shopping-tools, for one) return 200 for both countries
 * but are linked in only one country's menu; for the other country they count as unavailable.
 */

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

/** How a country's header exposes a page: a top-level item, or nested in a mega-menu. */
export type DesignStudioNavEntry =
  | { placement: 'top-level'; link: NavLink }
  | { placement: 'menu'; menuName: string; link: NavLink };

/**
 * Where each country's header surfaces Design Studio. USA shows it as a
 * standalone top-level nav item; CAN nests it inside the Resources mega-menu.
 * Design Studio tests enter through this link instead of hitting the URL
 * directly, so the placement itself is covered and not just the landing page.
 */
export const DESIGN_STUDIO_NAV_BY_COUNTRY: Record<LocationKey, DesignStudioNavEntry> = {
  USA: {
    placement: 'top-level',
    link: { name: 'Design Studio', url: '/design-studio' },
  },
  CAN: {
    placement: 'menu',
    menuName: 'Resources',
    link: { name: 'Design Studio', url: '/design-studio' },
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

/** Checks whether the given path is surfaced in the country's navigation. */
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
