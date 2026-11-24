import { getLocationKey, LocationKey } from '../locations/locationConfig';

// Per-country navigation. A page is available only if the country's nav shows it, not if its URL resolves.

export type NavLink = {
  name: string;
  url: string;
};

/** The "Homebuying" (USA) / "Resources" (CAN) mega-menu and its links. */
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

/** Where each country's header shows Design Studio (USA top-level, CAN under Resources). */
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

/** Design Studio / Homebuying paths each country's navigation shows. */
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
    // /homebuying/shopping-tools resolves for CAN but is not in its nav.
  ],
};

/** Checks whether the given path is surfaced in the country's navigation. */
export function isPathExposedForCountry(path: string, country?: LocationKey): boolean {
  const key = country ?? getLocationKey();
  return (EXPOSED_PATHS_BY_COUNTRY[key] ?? []).includes(path);
}

/** About pages shown as top-level header items, per country (CAN promotes Sustainability). */
export const TOP_LEVEL_STATIC_LINKS_BY_COUNTRY: Record<LocationKey, readonly NavLink[]> = {
  USA: [],
  CAN: [{ name: 'Sustainability', url: '/about/sustainability' }],
};

/** Pages both countries surface as standalone top-level header items. */
export const HEADER_TOP_LEVEL_LINKS = {
  customerCare: { name: 'Customer Care', url: '/customer-care' },
  contact: { name: 'Contact Us', url: '/contact' },
} as const satisfies Record<string, NavLink>;

/** Finds the Homebuying/Resources menu entry that links to a path in this country's header. */
export function getResourceMenuLink(
  path: string,
  country: LocationKey,
): { menuName: string; link: NavLink } | undefined {
  const menu = RESOURCE_MENU_BY_COUNTRY[country];
  const link = menu.links.find((entry) => entry.url === path);

  return link ? { menuName: menu.menuName, link } : undefined;
}

/** Site-page links in the global footer, identical for both countries. */
export const FOOTER_PAGE_LINKS: readonly NavLink[] = [
  { name: 'Design Studio', url: '/design-studio' },
  { name: 'Customer Care', url: '/customer-care' },
  { name: 'About Us', url: '/about/about-mattamy' },
  { name: 'Contact Us', url: '/contact' },
  { name: 'Careers', url: '/about/careers' },
  { name: 'Media and Investor Relations', url: '/about/media-and-investor-relations' },
];

/** Legal and policy links in the footer copyright row, identical for both countries. */
export const FOOTER_LEGAL_LINKS: readonly NavLink[] = [
  { name: 'Accessibility', url: '/accessibility' },
  { name: 'Legal Disclaimers', url: '/legal-disclaimers' },
  { name: 'Privacy Policy', url: '/privacy-policies' },
  { name: 'Terms and Conditions', url: '/terms-and-conditions' },
];
