import type { Page } from '@playwright/test';
import { getEnvConfig } from '../../config/environments/envConfig';

/*
 * Backstop that stops any PROD lead submission in the page, however the submit was triggered.
 * An init script rather than `page.route`: routing every request slows heavy pages enough to
 * trip overlay-dismissal deadlines.
 */

/** Lead endpoints (Sitecore formbuilder plus the ones LeadFormFlow captures); field tracking is left alone. */
const LEAD_ENDPOINT_SOURCE =
  '\\/api\\/jss\\/formbuilder|formlogging\\/update|landingpageforms\\/forms|\\/api\\/dia|\\/lead|\\/submit|salesforce|eloqua|marketo';

const installedGuards = new WeakMap<Page, Promise<void>>();

/** True when the run targets PROD, where no lead form may be submitted. */
export function isProdEnvironment(): boolean {
  return getEnvConfig().envName === 'PROD';
}

/** Installs the PROD lead-submission guard on a page once; does nothing on other environments. */
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

  // Bubble phase, so the page's own validation still runs; only the native post is stopped.
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
