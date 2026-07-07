import { Locator } from '@playwright/test';

export async function getNormalizedText(locator: Locator): Promise<string> {
  const text = await locator.innerText({ timeout: 15000 });

  return text.replace(/\s+/g, ' ').trim();
}

export async function getMediaSource(locator: Locator): Promise<string> {
  return locator
    .evaluate((element) => {
      if (element instanceof HTMLImageElement) {
        return element.currentSrc || element.src || element.getAttribute('src') || element.alt || '';
      }

      if (element instanceof HTMLVideoElement) {
        return element.currentSrc || element.src || element.getAttribute('src') || '';
      }

      if (element instanceof HTMLIFrameElement) {
        return element.src || element.getAttribute('src') || '';
      }

      const image = element.querySelector('img');

      return image?.currentSrc || image?.src || image?.getAttribute('src') || element.textContent || '';
    })
    .catch(() => '');
}

/**
 * True when the element (or any ancestor) is position:fixed or sticky, i.e. it lives on a floating /
 * sticky bar. Used to tell the sticky "floating bar" Get Information CTA (which opens the side modal)
 * apart from the in-flow hero/landing CTA (which only scrolls to the footer form).
 */
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
  return !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:');
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
  return new URL(url, 'http://local.test')
    .pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.toLowerCase();
}

export function getPathSegments(url: string): string[] {
  return new URL(url, 'http://local.test')
    .pathname
    .split('/')
    .filter(Boolean);
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
  const escapedWords = slug
    .split('-')
    .map((word) => escapeRegex(word));

  return new RegExp(escapedWords.join('[\\s-]+'), 'i');
}
