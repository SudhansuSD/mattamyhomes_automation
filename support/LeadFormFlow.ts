import { expect, Locator, Page, Response } from '@playwright/test';
import { appendLeadApiCapture } from '../utils/evidence/leadApiCapture';
import { reportLeadFormShape } from '../utils/leadform/leadFormHelper';
import {
  getBreadcrumbInformationCta,
  getHeroInformationCta,
  getInformationCtas,
} from '../utils/leadform/leadFormHelper';

/** Opens, submits and captures lead forms on behalf of BasePage's lead-form methods. */
export type LeadFormFlowDeps = {
  neutralizeChatWidget: () => Promise<void>;
  report: (message: string, value?: unknown) => Promise<void>;
  settle: (ms: number) => Promise<void>;
  waitForPageReady: () => Promise<void>;
  dismissPromoPopup: (options?: { appearTimeout?: number }) => Promise<void>;
  ensureInAccessibilityTree: () => Promise<void>;
};

/** Scroll offsets cycled while hunting for the CTA; 0 covers the community hero CTA at the top. */
const CTA_SCROLL_POSITIONS = [0, 450, 900, 1400];

export class LeadFormFlow {
  private readonly page: Page;
  private readonly deps: LeadFormFlowDeps;

  /** Sets up the lead-form flow for one page. */
  constructor(page: Page, deps: LeadFormFlowDeps) {
    this.page = page;
    this.deps = deps;
  }

  /* Get Information side modal lead form, shared by the condo plan, plan detail and QMI pages. */

  /** Finds the Get Information CTA to click: breadcrumb, then hero, then any match. */
  async getVisibleGetInformationCta(pageLabel: string): Promise<Locator> {
    const candidate = await this.findGetInformationCta();

    if (!candidate) {
      throw new Error(`No visible Get Information CTA found on ${pageLabel}`);
    }

    return candidate.locator;
  }

  /** Picks the best visible CTA copy and whether a click on it would land (fixed bars can be off-canvas). */
  private async findGetInformationCta(): Promise<{
    locator: Locator;
    inViewport: boolean;
  } | null> {
    let firstVisible: Locator | null = null;

    // Most specific first; the final catch-all scan is what reaches the sticky mobile CTA.
    const ctaSets = [
      getBreadcrumbInformationCta(this.page),
      getHeroInformationCta(this.page),
      getInformationCtas(this.page),
    ];

    for (const ctas of ctaSets) {
      const count = await ctas.count();

      for (let i = 0; i < count; i++) {
        const candidate = ctas.nth(i);

        if (!(await candidate.isVisible().catch(() => false))) {
          continue;
        }

        if (await this.isClickableInViewport(candidate)) {
          return { locator: candidate, inViewport: true };
        }

        firstVisible ??= candidate;
      }
    }

    return firstVisible ? { locator: firstVisible, inViewport: false } : null;
  }

  /** True when a click would land on the locator; hit-tests its center so headers and banners on top count as covered. */
  private async isClickableInViewport(locator: Locator): Promise<boolean> {
    const box = await locator.boundingBox().catch(() => null);

    if (!box || box.width <= 0 || box.height <= 0) {
      return false;
    }

    return locator
      .evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
          return false;
        }

        const topMost = document.elementFromPoint(x, y);

        return (
          !!topMost &&
          (topMost === element || element.contains(topMost) || topMost.contains(element))
        );
      })
      .catch(() => false);
  }

  /** Scrolls until a CTA is in the viewport, polling because the CTA can take ~10s of hydration to exist. */
  async revealGetInformationCta(timeout = 30_000): Promise<void> {
    const deadline = Date.now() + timeout;

    for (let attempt = 0; Date.now() < deadline; attempt++) {
      if ((await this.findGetInformationCta())?.inViewport) {
        return;
      }

      await this.page.evaluate(
        (scrollTop) => window.scrollTo(0, scrollTop),
        CTA_SCROLL_POSITIONS[attempt % CTA_SCROLL_POSITIONS.length],
      );
      await this.deps.waitForPageReady();
      await this.deps.settle(400);
    }
  }

  /** Fails fast when a lead-form flow navigates to Contact instead of showing in-page success. */
  async expectNoContactRedirect(previousUrl: string, pageLabel: string): Promise<void> {
    await this.deps.settle(1000);

    const currentUrl = this.page.url();

    expect(
      currentUrl,
      `Expected the ${pageLabel} form flow to stay on page and show success modal, but it navigated from ${previousUrl} to ${currentUrl}`,
    ).not.toMatch(/\/contact\/?($|[?#])/i);
  }

  /** Clicks the Get Information CTA unless the form is open; finding and clicking retry together as the page re-renders. */
  async openLeadFormFromGetInformationCta(options: {
    leadForms: Locator;
    pageLabel: string;
    ctaTimeout?: number;
    beforeReveal?: () => Promise<void>;
  }): Promise<void> {
    if (await options.leadForms.count()) {
      return;
    }

    await options.beforeReveal?.();

    // Arms the overlay auto-dismiss handlers; without it the promo portal keeps covering the CTA.
    await this.deps.waitForPageReady();

    // Dismiss the full-screen promo overlay rather than clicking through it.
    await this.deps.dismissPromoPopup({ appearTimeout: 3000 });

    const previousUrl = this.page.url();
    const ctaTimeout = options.ctaTimeout ?? 120_000;
    const deadline = Date.now() + ctaTimeout;
    const reloadAfter = Date.now() + ctaTimeout * 0.75;
    let lastClickError: unknown = null;
    let sawCandidate = false;
    let reloaded = false;

    for (let attempt = 0; Date.now() < deadline; attempt++) {
      const candidate = await this.findGetInformationCta();

      if (candidate) {
        sawCandidate = true;
        // Center it: scrollIntoViewIfNeeded stops at the viewport edge, under the sticky header.
        if (!candidate.inViewport) {
          await candidate.locator
            .evaluate((element) => element.scrollIntoView({ block: 'center' }))
            .catch(() => undefined);
          await this.deps.settle(300);
        }

        // Playwright cannot scroll a fixed off-canvas bar into view; the page scroll below does.
        if (await this.isClickableInViewport(candidate.locator)) {
          // No force, so a covered CTA reports its blocker instead of a click that goes nowhere.
          const clicked = await candidate.locator
            .click({ timeout: 10_000 })
            .then(() => true)
            .catch((error: unknown) => {
              lastClickError = error;
              return false;
            });

          if (clicked) {
            await this.deps.waitForPageReady();
            await this.deps.settle(1000);
            await this.expectNoContactRedirect(previousUrl, options.pageLabel);

            return;
          }

          // The promo portal re-mounts on a timer and can cover the CTA between attempts.
          await this.deps.dismissPromoPopup({ appearTimeout: 1000 });

          continue;
        }

        // Found but covered (promo overlay or floorplan lightbox); scrolling cannot clear those.
        await this.deps.dismissPromoPopup();
      }

      // No CTA ever rendered by 75% of the window: hydration died (seen on WebKit) and only a reload
      // recovers. Kept late and gated on sawCandidate so a merely slow page is not restarted.
      if (!sawCandidate && !reloaded && Date.now() > reloadAfter) {
        reloaded = true;

        await this.deps.report('No Get Information CTA rendered; reloading', this.page.url());
        await this.page
          .reload({ waitUntil: 'domcontentloaded', timeout: 90_000 })
          .catch(() => undefined);
        await this.deps.waitForPageReady();
        await this.deps.dismissPromoPopup({ appearTimeout: 3000 });

        continue;
      }

      await this.page.evaluate(
        (scrollTop) => window.scrollTo(0, scrollTop),
        CTA_SCROLL_POSITIONS[attempt % CTA_SCROLL_POSITIONS.length],
      );

      // Short settle, not waitForPageReady: that costs seconds per call and samples too rarely.
      await this.deps.settle(500);
    }

    if (lastClickError) {
      throw lastClickError;
    }

    // Distinguish "never hydrated" from "rendered but stayed covered or off-canvas".
    throw new Error(
      sawCandidate
        ? `Get Information CTA on ${options.pageLabel} never became clickable - it stayed covered or outside the viewport`
        : `No visible Get Information CTA found on ${options.pageLabel}`,
    );
  }

  /** Opens the Get Information side modal form and returns the container at the given index. */
  async openSideModalFormByIndex(options: {
    leadForms: Locator;
    formName: string;
    pageLabel: string;
    formIndex?: number;
    openTimeout?: number;
    ctaTimeout?: number;
    beforeReveal?: () => Promise<void>;
  }): Promise<Locator> {
    const formIndex = options.formIndex ?? 0;

    await this.openLeadFormFromGetInformationCta({
      leadForms: options.leadForms,
      pageLabel: options.pageLabel,
      ctaTimeout: options.ctaTimeout,
      beforeReveal: options.beforeReveal,
    });

    // A late promo popup aria-hides the page, which would make the form count as 0 below.
    await this.deps.ensureInAccessibilityTree();

    const formCount = await expect
      .poll(() => options.leadForms.count(), {
        message: `${options.formName} sidebar/modal should open after Get Information CTA`,
        timeout: options.openTimeout ?? 15_000,
      })
      .toBeGreaterThan(formIndex)
      .then(() => options.leadForms.count())
      .catch(() => 0);

    if (formCount <= formIndex) {
      throw new Error(`${options.formName} sidebar/modal form did not open`);
    }

    const form = options.leadForms.nth(formIndex);

    await this.deps.waitForPageReady();

    return form;
  }

  /** Submits a lead form and records the lead API response as evidence. */
  async submitLeadFormAndCaptureApi(options: {
    formName: string;
    /** The form itself; when given, its fields are reported before submitting. */
    form?: Locator;
    submitButton: Locator;
    successMessage: Locator;
    successModal?: Locator;
    validateApiResponse?: boolean;
    timeout?: number;
    notes?: string;
  }): Promise<void> {
    const timeout = options.timeout ?? 30_000;

    // Report missing fields first: a form without them still submits and succeeds, silently.
    if (options.form) {
      await reportLeadFormShape(options.form, options.formName);
    }

    const apiResponsePromise = this.waitForLeadApiResponse(timeout);

    await expect(
      options.submitButton,
      `${options.formName} submit button should be visible before submit`,
    ).toBeVisible({ timeout: 10_000 });

    // The AtlasRTX chat bubble can float over Submit.
    await this.deps.neutralizeChatWidget();

    // No force: an overlay covering Submit means the form is not submittable.
    await options.submitButton.click({
      noWaitAfter: true,
      timeout: 5_000,
    });

    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);

    if (options.successModal && (await options.successModal.count())) {
      await expect(
        options.successModal.last(),
        `${options.formName} success modal should be displayed`,
      ).toBeVisible({ timeout });
    }

    await expect(
      options.successMessage,
      `${options.formName} success message should be displayed`,
    ).toBeVisible({ timeout });

    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);

    const captured = await apiResponsePromise;
    const apiResponse = captured?.response ?? null;
    const responseData = captured?.body ?? '';
    const outputFile = await appendLeadApiCapture({
      capturedAt: new Date().toISOString(),
      pageUrl: this.page.url(),
      formName: options.formName,
      requestMethod: apiResponse?.request().method() ?? '',
      requestUrl: apiResponse?.url() ?? '',
      responseStatus: apiResponse?.status() ?? '',
      responseData,
      notes: apiResponse ? options.notes : 'No matching lead API response captured',
    });

    if (!apiResponse && process.env.REQUIRE_LEAD_API_CAPTURE === 'true') {
      throw new Error(
        `${options.formName} succeeded, but no matching lead API response was captured.`,
      );
    }

    if (options.validateApiResponse) {
      expect(
        apiResponse,
        `${options.formName} should capture a matching lead API response`,
      ).toBeTruthy();
      expect(
        apiResponse!.status(),
        `${options.formName} lead API response should be successful`,
      ).toBeGreaterThanOrEqual(200);
      expect(
        apiResponse!.status(),
        `${options.formName} lead API response should be successful`,
      ).toBeLessThan(400);
    }

    await this.deps.report(`${options.formName} lead API data saved to`, outputFile);
  }

  /** Waits for the lead API response and reads its body at once; read later, the body is gone. */
  private async waitForLeadApiResponse(
    timeout: number,
  ): Promise<{ response: Response; body: string } | null> {
    return this.page
      .waitForResponse((response) => this.isLeadApiResponse(response), { timeout })
      .then(async (response) => ({ response, body: await this.readResponseData(response) }))
      .catch(() => null);
  }

  /** True for the real lead submission, not tracking noise; LEAD_API_URL_PATTERN overrides the match. */
  private isLeadApiResponse(response: Response): boolean {
    const request = response.request();
    const method = request.method().toUpperCase();

    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return false;
    }

    const url = response.url();
    const configuredPattern = process.env.LEAD_API_URL_PATTERN;

    if (configuredPattern) {
      return new RegExp(configuredPattern, 'i').test(url);
    }

    // Telemetry posted alongside the form; fieldtracking fires on every field focus.
    if (
      /fieldtracking|\/track|telemetry|beacon|analytics|google|doubleclick|facebook|bing|hotjar|onetrust|browserstack|clarity|segment/i.test(
        url,
      )
    ) {
      return false;
    }

    return /formlogging\/update|landingpageforms\/forms|\/api\/dia|\/lead|\/submit|salesforce|eloqua|marketo/i.test(
      url,
    );
  }

  /** Reads a response body as text or JSON. */
  private async readResponseData(response: Response): Promise<string> {
    const contentType = response.headers()['content-type'] ?? '';

    try {
      if (/json/i.test(contentType)) {
        return JSON.stringify(await response.json());
      }

      return await response.text();
    } catch (error) {
      return `Unable to read response body: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
