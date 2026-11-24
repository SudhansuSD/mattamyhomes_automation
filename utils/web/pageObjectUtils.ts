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

/** Viewport-height fractions tried in order when looking for an uncovered spot. */
const UNCOVERED_SPOT_FRACTIONS = [0.5, 0.65, 0.75, 0.85, 0.35, 0.2];

/** Scrolls an element to a spot where nothing covers it; returns whether one was found. */
// Needed on phones, where sticky banners cover the spots Playwright's own scrolling picks.
export async function scrollToUncoveredSpot(locator: Locator): Promise<boolean> {
  for (const fraction of UNCOVERED_SPOT_FRACTIONS) {
    await locator
      .evaluate((element, target) => {
        const rect = element.getBoundingClientRect();

        window.scrollBy(0, rect.top + rect.height / 2 - window.innerHeight * target);
      }, fraction)
      .catch(() => undefined);
    await locator.page().waitForTimeout(250);

    const uncovered = await locator
      .evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
          return false;
        }

        const topMost = document.elementFromPoint(x, y);

        return !!topMost && (topMost === element || element.contains(topMost));
      })
      .catch(() => false);

    if (uncovered) {
      return true;
    }
  }

  return false;
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

/** The global footer; most pages use `section#footer` and market pages only the role, not a `footer` tag. */
export const FOOTER_SELECTOR = 'section[id="footer"], #footer, footer, [role="contentinfo"]';

/** The page's global footer element. */
export function getFooter(page: Page): Locator {
  // .first() avoids strict-mode errors if a page renders more than one match.
  return page.locator(FOOTER_SELECTOR).first();
}

/** The header's mobile menu button; visible at desktop width means the header has not hydrated yet. */
export const MOBILE_NAV_TOGGLE_SELECTOR = '#MobileNavigationMenu';

/** Close button of the mobile nav panel, used as the "panel is open" signal. */
export const MOBILE_NAV_CLOSE_SELECTOR = '#closeNavigationMenu';

/** Minimum viewport width (measured on STAGE) at which the header shows desktop navigation. */
export const DESKTOP_HEADER_MIN_WIDTH = 1024;
