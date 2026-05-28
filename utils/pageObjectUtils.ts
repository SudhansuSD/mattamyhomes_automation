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

export function getSlugTextPattern(slug: string): RegExp {
  const escapedWords = slug
    .split('-')
    .map((word) => escapeRegex(word));

  return new RegExp(escapedWords.join('[\\s-]+'), 'i');
}
