import type { Page } from '@playwright/test';
import { getBoolEnv } from '../env';

// Blocks marketing/analytics tags: they delay `window.onload` (which reveals the page) and add
// renderer memory. Keep GTM, OneTrust, the chatbot and site-map embeds off the list; tests need them.

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
  // Siteimprove Analytics; bare domain listed too since Chromium's `*.` skips it.
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

/** Chromium launch args that fail DNS for tracker hosts (cheaper than a route). */
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

/** Routes tracker requests to abort on non-Chromium browsers, once per context. */
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
