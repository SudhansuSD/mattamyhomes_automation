import { Locator, Page } from '@playwright/test';

export async function getNormalizedText(locator: Locator): Promise<string> {
  const text = await locator.innerText({ timeout: 15000 });

  return text.replace(/\s+/g, ' ').trim();
}

export async function getMediaSource(locator: Locator): Promise<string> {
  return locator
    .evaluate((element) => {
      if (element instanceof HTMLImageElement) {
        return (
          element.currentSrc || element.src || element.getAttribute('src') || element.alt || ''
        );
      }

      if (element instanceof HTMLVideoElement) {
        return element.currentSrc || element.src || element.getAttribute('src') || '';
      }

      if (element instanceof HTMLIFrameElement) {
        return element.src || element.getAttribute('src') || '';
      }

      const image = element.querySelector('img');

      return (
        image?.currentSrc || image?.src || image?.getAttribute('src') || element.textContent || ''
      );
    })
    .catch(() => '');
}

/** True when the element (or any ancestor) is position:fixed or sticky. */
export async function isFloatingCta(locator: Locator): Promise<boolean> {
  return locator
    .evaluate((element) => {
      let node: HTMLElement | null = element as HTMLElement;

      for (let depth = 0; node && depth < 8; depth++) {
        const position = window.getComputedStyle(node).position;

        if (position === 'fixed' || position === 'sticky') {
          return true;
        }

        node = node.parentElement;
      }

      return false;
    })
    .catch(() => false);
}

export async function isLocatorVisible(locator: Locator, timeout?: number): Promise<boolean> {
  return typeof timeout === 'number'
    ? locator.isVisible({ timeout }).catch(() => false)
    : locator.isVisible().catch(() => false);
}

export async function clickIfVisible(locator: Locator, timeout?: number): Promise<void> {
  if (await isLocatorVisible(locator, timeout)) {
    await locator.click();
  }
}

export function isIgnorableHref(href: string | null): boolean {
  return (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:')
  );
}

export function getPathnameFromHref(href: string, baseUrl = 'http://local.test'): string {
  return new URL(href, baseUrl).pathname.replace(/\/$/, '');
}

export function buildFullUrl(relativeUrl: string | null, baseUrl: string): string {
  if (!relativeUrl) {
    throw new Error('URL is null');
  }

  return new URL(relativeUrl, baseUrl).href;
}

export function getLastPathSegment(url: string): string | undefined {
  return new URL(url, 'http://local.test').pathname.split('/').filter(Boolean).pop()?.toLowerCase();
}

export function getPathSegments(url: string): string[] {
  return new URL(url, 'http://local.test').pathname.split('/').filter(Boolean);
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function toTitleCase(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeComparableText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-')
    .trim();
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}`;
}

export function formatPriceToUiLabel(price: number): string {
  if (price >= 1000000) {
    return `${price / 1000000}M`;
  }

  if (price >= 1000) {
    return `${price / 1000}K`;
  }

  return `${price}`;
}

export function getSlugTextPattern(slug: string): RegExp {
  const escapedWords = slug.split('-').map((word) => escapeRegex(word));

  return new RegExp(escapedWords.join('[\\s-]+'), 'i');
}

// Shared Page Shell Selectors

/**
 * The global footer, however a page chooses to express it.
 *
 * Every branch of the union earns its place: most pages render a single
 * `<section id="footer" role="contentinfo">` and no `footer` tag at all, while
 * the market pages carry only the role. A tag-only locator resolves to nothing
 * on the former and reports a present footer as missing.
 */
export const FOOTER_SELECTOR = 'section[id="footer"], #footer, footer, [role="contentinfo"]';

/** The page's global footer element. */
export function getFooter(page: Page): Locator {
  // .first() guards a page that renders both the section and a footer tag from
  // becoming strict-mode ambiguous. Today the union matches exactly one element.
  return page.locator(FOOTER_SELECTOR).first();
}

/**
 * The header's mobile menu button.
 *
 * The site serves a mobile-only header shell in its SSR HTML and swaps in the
 * desktop navigation on hydration, so this button still being visible on a
 * desktop-width viewport means the shell has not hydrated yet. Measured on
 * STAGE: the header holds 22 descendants with this toggle visible before
 * hydration, and 198 with it hidden after.
 */
export const MOBILE_NAV_TOGGLE_SELECTOR = '#MobileNavigationMenu';

/**
 * Close button inside the opened mobile navigation panel.
 *
 * Used as the "panel is open" signal rather than asserting on the nav links
 * themselves, so opening the panel and checking its contents stay separate
 * concerns.
 */
export const MOBILE_NAV_CLOSE_SELECTOR = '#closeNavigationMenu';

/**
 * Viewport width at and above which the header shows its desktop navigation.
 *
 * Measured against STAGE rather than assumed: the toggle is visible at 1023px and
 * hidden at 1024px. Below this the mobile toggle is the correct header, so there
 * is no desktop navigation to wait for.
 */
export const DESKTOP_HEADER_MIN_WIDTH = 1024;
