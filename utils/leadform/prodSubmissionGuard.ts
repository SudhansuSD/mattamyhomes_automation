import type { Page } from '@playwright/test';
import { getEnvConfig } from '../../config/environments/envConfig';

/*
 * In-page guard that keeps every lead form on PROD from reaching the CRM.
 *
 * Validation tests still interact with live PROD forms, and `clickSubmit` already avoids the
 * Submit button there. This is the backstop for everything else: a direct `.click()` on a submit
 * button, a form that skips its own client-side validation, or a validation message that never
 * renders. Any write request to an endpoint that takes a lead is refused inside the page before it
 * leaves, so a PROD run cannot create a CRM record however the submit was triggered.
 *
 * It runs as an init script rather than a `page.route`: a route makes Playwright intercept every
 * request the page makes, which slows the heavy community pages enough to trip the overlay
 * dismissal deadlines. Wrapping `fetch`, XHR and native form posts costs nothing per request.
 */

/**
 * Endpoints that receive a lead. `/api/jss/formbuilder` is the Sitecore form action every Mattamy
 * lead form posts to; the rest mirror the lead endpoints `LeadFormFlow` captures as evidence.
 * Field-tracking telemetry (`/api/jss/fieldtracking/register`) is left alone: it fires on field
 * focus and creates no lead.
 */
const LEAD_ENDPOINT_SOURCE =
  '\\/api\\/jss\\/formbuilder|formlogging\\/update|landingpageforms\\/forms|\\/api\\/dia|\\/lead|\\/submit|salesforce|eloqua|marketo';

const installedGuards = new WeakMap<Page, Promise<void>>();

/** True when the run targets PROD, where no lead form may be submitted. */
export function isProdEnvironment(): boolean {
  return getEnvConfig().envName === 'PROD';
}

/** Installs the PROD lead-submission guard on a page once; a no-op on every other environment. */
export function installProdSubmissionGuard(page: Page): Promise<void> {
  const existing = installedGuards.get(page);

  if (existing) {
    return existing;
  }

  const installed = isProdEnvironment()
    ? page.addInitScript(blockLeadSubmissionsInPage, LEAD_ENDPOINT_SOURCE).then(
        () => undefined,
        () => undefined,
      )
    : Promise.resolve();

  installedGuards.set(page, installed);

  return installed;
}

/** Runs inside the page: refuses write requests to lead endpoints from fetch, XHR and form posts. */
function blockLeadSubmissionsInPage(leadEndpointSource: string): void {
  const win = window as typeof window & { __mattamyProdLeadGuard?: boolean };

  if (win.__mattamyProdLeadGuard) {
    return;
  }

  win.__mattamyProdLeadGuard = true;

  const leadEndpoint = new RegExp(leadEndpointSource, 'i');
  const isBlocked = (method: string | undefined, url: string): boolean =>
    /^(POST|PUT|PATCH)$/i.test(method ?? 'GET') && leadEndpoint.test(url);
  const blockedError = () => new TypeError('PROD guard: lead form submission blocked');

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET');

    return isBlocked(method, url) ? Promise.reject(blockedError()) : originalFetch(input, init);
  };

  const requestTargets = new WeakMap<XMLHttpRequest, { method: string; url: string }>();
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function guardedOpen(
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    requestTargets.set(this, { method, url: String(url) });
    return (originalOpen as (...args: unknown[]) => void).call(this, method, url, ...rest);
  } as typeof XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.send = function guardedSend(
    this: XMLHttpRequest,
    body?: Document | XMLHttpRequestBodyInit | null,
  ) {
    const target = requestTargets.get(this);

    if (target && isBlocked(target.method, target.url)) {
      throw blockedError();
    }

    return originalSend.call(this, body);
  };

  // Bubble phase on window, after the page's own (React) submit handlers have run,
  // so client-side validation still happens; only the native navigation post is stopped.
  window.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement | null;

    if (form && isBlocked(form.method, form.action)) {
      event.preventDefault();
    }
  });

  const originalSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function guardedSubmit(this: HTMLFormElement) {
    if (isBlocked(this.method, this.action)) {
      return;
    }

    originalSubmit.call(this);
  };
}
