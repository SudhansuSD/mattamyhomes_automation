import type { Page } from '@playwright/test';
import { getBoolEnv } from '../env';

/*
 * Third-party marketing and analytics tags are blocked during test runs.
 *
 * The site hides its body until `window.onload`, and onload waits on every one of
 * these tags. Measured on STAGE they push a page from about 3s to 10-32s before
 * anything is visible, and the extra scripts are a large share of the renderer
 * memory behind "Target crashed". No test asserts on them, so they only cost time
 * and stability. Blocking them also keeps automated traffic out of Mattamy's
 * analytics and ad reporting.
 *
 * Anything a test or the page itself depends on stays allowed: Google Tag Manager,
 * the OneTrust cookie banner, the chatbot, the interactive site-map embeds,
 * Cloudflare, and the site's own CDN.
 *
 * On by default. `BLOCK_TRACKERS=false` lets the tags load again.
 */

/** Hosts that serve tracking tags. A leading `*.` matches every subdomain. */
const TRACKER_HOSTS = [
  // Google Analytics 4 and Google Ads
  'analytics.google.com',
  '*.google-analytics.com',
  '*.doubleclick.net',
  // Meta Pixel
  'connect.facebook.net',
  // TikTok Pixel
  'analytics.tiktok.com',
  '*.tiktokw.us',
  // LinkedIn Insight Tag
  'px.ads.linkedin.com',
  'snap.licdn.com',
  // StackAdapt
  '*.stackadapt.com',
  // Microsoft Clarity and its telemetry
  '*.clarity.ms',
  'mobile.events.data.microsoft.com',
  // Mouseflow
  '*.mouseflow.com',
  // Siteimprove Analytics. Chromium's `*.` rules skip the bare domain, and the
  // tag script is served from it, so that is listed on its own.
  'siteimproveanalytics.com',
  '*.siteimproveanalytics.com',
  '*.siteimproveanalytics.io',
  // ShareThis
  '*.sharethis.com',
] as const;

/** True unless the run opted back in to loading tracking tags. */
export function isTrackerBlockingEnabled(): boolean {
  return getBoolEnv('BLOCK_TRACKERS', true);
}

/**
 * Chromium launch arguments that make tracker hosts fail DNS resolution.
 *
 * Resolved by the browser itself, so blocking costs nothing per request - unlike a
 * route, which makes Playwright intercept every request the page sends.
 */
export function getChromiumTrackerBlockArgs(): string[] {
  if (!isTrackerBlockingEnabled()) {
    return [];
  }

  const rules = TRACKER_HOSTS.map((host) => `MAP ${host} ~NOTFOUND`).join(', ');

  return [`--host-resolver-rules=${rules}`];
}

/** Matches a request URL whose host is one of the tracker hosts. */
const TRACKER_URL = new RegExp(
  `^https?://(?:${TRACKER_HOSTS.map((host) =>
    host.startsWith('*.')
      ? `(?:[^/]+\\.)?${host.slice(2).replace(/\./g, '\\.')}`
      : host.replace(/\./g, '\\.'),
  ).join('|')})(?::\\d+)?/`,
  'i',
);

const blockedContexts = new WeakSet<object>();

/**
 * Blocks tracker requests for browsers that have no launch-level equivalent.
 *
 * Chromium is covered by its launch arguments. Firefox and WebKit (Mobile Safari)
 * get a route instead, scoped to the tracker hosts and installed once per context.
 */
export async function installTrackerBlocking(page: Page): Promise<void> {
  const context = page.context();
  const browserName = context.browser()?.browserType().name();

  if (!isTrackerBlockingEnabled() || browserName === 'chromium' || blockedContexts.has(context)) {
    return;
  }

  blockedContexts.add(context);
  await context
    .route(TRACKER_URL, (route) => route.abort('blockedbyclient'))
    .catch(() => {
      blockedContexts.delete(context);
    });
}
