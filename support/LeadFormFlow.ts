import { expect, Locator, Page, Response } from '@playwright/test';
import { appendLeadApiCapture } from '../utils/evidence/leadApiCapture';
import { assertLeadFormShape } from '../utils/leadform/leadFormHelper';
import {
  getBreadcrumbInformationCta,
  getHeroInformationCta,
  getInformationCtas,
} from '../utils/leadform/leadFormHelper';

/**
 * Opening, submitting and capturing the lead forms.
 *
 * A collaborator of BasePage: page objects call BasePage's protected lead-form
 * methods, which delegate here.
 */
export type LeadFormFlowDeps = {
  neutralizeChatWidget: () => Promise<void>;
  report: (message: string, value?: unknown) => Promise<void>;
  settle: (ms: number) => Promise<void>;
  waitForPageReady: () => Promise<void>;
  dismissPromoPopup: (options?: { appearTimeout?: number }) => Promise<void>;
  ensureInAccessibilityTree: () => Promise<void>;
};

/**
 * Scroll offsets cycled through when hunting for the Get Information CTA.
 *
 * Zero is in the ladder because the community hero CTA sits at the top of the page, and the sticky
 * detail-page bars come down off their negative `top` as soon as the page moves at all.
 */
const CTA_SCROLL_POSITIONS = [0, 450, 900, 1400];

export class LeadFormFlow {
  private readonly page: Page;
  private readonly deps: LeadFormFlowDeps;

  /** Sets up the lead-form flow for one page. */
  constructor(page: Page, deps: LeadFormFlowDeps) {
    this.page = page;
    this.deps = deps;
  }

  /*
   * Get Information side modal lead form.
   *
   * The "Get Information / Stay Updated" CTA opens the same sidebar/modal lead form on the condo
   * plan, plan detail and QMI pages. The flow is identical on all three - only the page label, the
   * container locator and the timeouts differ - so it lives here rather than once per page object.
   */

  /**
   * Finds the Get Information / Stay Updated CTA to click.
   *
   * Prefers the breadcrumb CTA the plan detail, QMI and condo plan pages use, then the hero CTA the
   * community pages use, then a scan of every CTA on the page.
   */
  async getVisibleGetInformationCta(pageLabel: string): Promise<Locator> {
    const candidate = await this.findGetInformationCta();

    if (!candidate) {
      throw new Error(`No visible Get Information CTA found on ${pageLabel}`);
    }

    return candidate.locator;
  }

  /**
   * Picks the best CTA copy and reports whether it already sits inside the viewport.
   *
   * The detail pages render the same trigger up to three times, and which copy is real depends on
   * the viewport: the breadcrumb copy is the desktop one and boxes at 0x0 behind `hidden md:flex` on
   * a phone, where the sticky `#anchor-cta` copy is the only tappable one. Zero-box copies drop out
   * on `isVisible`, so the remaining choice is by position.
   *
   * `inViewport` is what callers act on rather than plain visibility, and it means "a click would
   * land here" - see {@link isClickableInViewport}. Both sticky bars are `position: fixed` and park
   * at a negative `top` until the hero is scrolled past: visible, with a real box, and unreachable,
   * because Playwright cannot scroll a fixed element into view. Clicking one in that state fails
   * with "Element is outside of the viewport" and burns the full action timeout, so a caller that
   * gets `inViewport: false` scrolls the page instead of clicking.
   */
  private async findGetInformationCta(): Promise<{
    locator: Locator;
    inViewport: boolean;
  } | null> {
    let firstVisible: Locator | null = null;

    // Most specific container first: the plan/QMI breadcrumb CTA, then the community hero CTA, then
    // a scan of whatever else matches, which is what reaches the sticky mobile CTA.
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

  /**
   * Whether a locator is where a click would actually land.
   *
   * Hit-tests the center point rather than asking whether the box overlaps the viewport. Overlap
   * alone is not enough: Playwright scrolls a partly visible element to the viewport edge, which on
   * these pages parks it under the sticky site header, and the click then fails with
   * "Header__StyledContainer ... subtree intercepts pointer events" against an element it has just
   * reported as visible, enabled and stable. Hit-testing catches that, and the promotion banners and
   * the chat bubble with it, without this having to name any of them.
   */
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

  /**
   * Scrolls until a Get Information CTA sits inside the viewport.
   *
   * Polls over the scroll positions instead of walking them once, because on these templates the CTA
   * is not merely below the fold - it does not exist yet. The detail pages hydrate in two passes: the
   * SSR shell renders every CTA `visibility: hidden`, React then unmounts and re-renders the page
   * around nine seconds in, and the real sticky CTA only settles after that. The community hero goes
   * the other way and keeps its container `visibility: hidden` until the hero image loads, roughly
   * twelve seconds. A single pass finishes long before either, which is what reported a rendered CTA
   * as "No visible Get Information CTA found".
   *
   * Bounded, and it re-checks between scrolls rather than sleeping on a fixed delay - the exit
   * condition is a CTA in the viewport, not elapsed time.
   */
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

  /**
   * Clicks the Get Information CTA when the sidebar/modal lead form is not already open.
   *
   * One loop that re-reads the DOM, scrolls a step, and clicks the moment a CTA is genuinely
   * reachable. Interleaved rather than "reveal, then click" because both halves have to keep
   * retrying: these templates hydrate in two passes and re-render around nine seconds in, so a CTA
   * resolved before that is detached, and for a stretch there is no CTA in the document at all.
   *
   * A candidate is only clicked once its box overlaps the viewport. The mobile CTA lives in a
   * `position: fixed` bar parked at a negative `top` until the hero is scrolled past: Playwright
   * cannot scroll a fixed element into view, so clicking it early burns the action timeout on
   * "Element is outside of the viewport" instead of scrolling the page, which is what actually
   * brings the bar down.
   */
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

    // Once, before the loop: this is what arms the overlay auto-dismiss handlers, and the loop body
    // deliberately stays too cheap to call it. Without it the promotion portal re-mounts over the
    // CTA and every click attempt reports "subtree intercepts pointer events".
    await this.deps.waitForPageReady();

    // The National-promotion overlay is a full-screen dialog that covers the CTA
    // and swallows the click. Dismiss it rather than clicking through it, so a
    // genuinely unreachable CTA still fails instead of failing later elsewhere.
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
        // Centered, not scrollIntoViewIfNeeded: that stops as soon as the element touches the
        // viewport edge, which is exactly where the sticky site header and the promotion banners
        // sit, so it converts a below-the-fold CTA into a covered one. Centring clears the header at
        // the top and the sticky quick-action bar at the bottom in one move. A `position: fixed`
        // copy ignores this entirely and falls through to the page scroll at the end of the loop.
        if (!candidate.inViewport) {
          await candidate.locator
            .evaluate((element) => element.scrollIntoView({ block: 'center' }))
            .catch(() => undefined);
          await this.deps.settle(300);
        }

        if (await this.isClickableInViewport(candidate.locator)) {
          // No force: click() runs the actionability checks, so an overlay-covered CTA
          // reports the blocker instead of registering a click that goes nowhere.
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

          // The promotion portal re-mounts on a timer and can land on top of the CTA between two
          // attempts. Clearing it here is what makes the next attempt different from this one.
          await this.deps.dismissPromoPopup({ appearTimeout: 1000 });

          continue;
        }

        // Found, but a click would land on something else. As well as the promotion overlays, the
        // detail pages open a full-screen floorplan lightbox that covers everything, and nothing in
        // the scroll ladder below can move a CTA out from under it.
        await this.deps.dismissPromoPopup();
      }

      // Three quarters of the window gone without a single CTA ever rendering: the page is stuck in
      // its server-rendered shell. These bundles intermittently die mid-hydration on WebKit with
      // "undefined is not a constructor", which leaves every control present but permanently
      // zero-box, and no amount of further scrolling or waiting recovers it - one reload does.
      //
      // Gated on having seen nothing at all, and left this late, because a page that is merely slow
      // to hydrate sets sawCandidate long before here, and reloading that one would only restart the
      // clock this loop is waiting on.
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

      // A short settle, not waitForPageReady: the loop is waiting on hydration, and
      // waitForPageReady costs several seconds per call, which spent the whole window on a handful
      // of samples and missed the CTA in the gap between two of them.
      await this.deps.settle(500);
    }

    if (lastClickError) {
      throw lastClickError;
    }

    // Two different failures, and they point at different things: nothing ever rendered (the page
    // did not hydrate) versus something rendered but stayed covered or off-canvas for the whole
    // window (an overlay this flow does not know how to clear).
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

    // The promotion popup can mount after the CTA click and aria-hide the page,
    // which would make the open side modal count as 0 below.
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

  /** Submits lead form and capture api. */
  async submitLeadFormAndCaptureApi(options: {
    formName: string;
    /** The form itself. Supplied, its field shape is checked before submitting. */
    form?: Locator;
    submitButton: Locator;
    successMessage: Locator;
    successModal?: Locator;
    validateApiResponse?: boolean;
    timeout?: number;
    notes?: string;
  }): Promise<void> {
    const timeout = options.timeout ?? 30_000;

    // Check the form still exposes the fields its country declares BEFORE
    // submitting. A form that quietly lost its budget or move-date dropdown
    // still submits and still shows a success message - it just sends the CRM a
    // thinner lead, which no assertion downstream would ever notice.
    if (options.form) {
      await assertLeadFormShape(options.form, options.formName);
    }

    const apiResponsePromise = this.waitForLeadApiResponse(timeout);

    await expect(
      options.submitButton,
      `${options.formName} submit button should be visible before submit`,
    ).toBeVisible({ timeout: 10_000 });

    // The AtlasRTX chat bubble floats over Submit on several templates; disable
    // its pointer events first so the click lands on the button.
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

  /**
   * Waits for the lead API response and reads its body straight away.
   *
   * Reading it later, after the success-modal assertions, fails with "No data
   * found for resource" - and that string is what lands in the evidence workbook
   * instead of a payload.
   */
  private async waitForLeadApiResponse(
    timeout: number,
  ): Promise<{ response: Response; body: string } | null> {
    return this.page
      .waitForResponse((response) => this.isLeadApiResponse(response), { timeout })
      .then(async (response) => ({ response, body: await this.readResponseData(response) }))
      .catch(() => null);
  }

  /**
   * Checks whether a response is the actual lead submission.
   *
   * Matching any POST containing "api" catches /api/jss/fieldtracking/register,
   * which fires on every field focus and wins the race almost every time - 74 of
   * 77 captured rows were tracking noise. Noise is excluded first, then the
   * endpoints that really take a lead. LEAD_API_URL_PATTERN overrides both.
   */
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

    // Telemetry and consent traffic that is POSTed alongside a form but is not
    // the submission. fieldtracking/register is the one that usually wins.
    if (
      /fieldtracking|\/track|telemetry|beacon|analytics|google|doubleclick|facebook|bing|hotjar|onetrust|browserstack|clarity|segment/i.test(
        url,
      )
    ) {
      return false;
    }

    // The endpoints that actually receive a lead.
    return /formlogging\/update|landingpageforms\/forms|\/api\/dia|\/lead|\/submit|salesforce|eloqua|marketo/i.test(
      url,
    );
  }

  /** Reads response data for API validation. */
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
