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
 * Split out of BasePage. BasePage keeps its original protected methods and
 * delegates here, so no page object needed to change.
 */
export type LeadFormFlowDeps = {
  neutralizeChatWidget: () => Promise<void>;
  report: (message: string, value?: unknown) => Promise<void>;
  settle: (ms: number) => Promise<void>;
  waitForPageReady: () => Promise<void>;
  dismissPromoPopup: (options?: { appearTimeout?: number }) => Promise<void>;
  ensureInAccessibilityTree: () => Promise<void>;
};

export class LeadFormFlow {
  private readonly page: Page;
  private readonly deps: LeadFormFlowDeps;

  /** Sets up the lead-form flow for one page. */
  constructor(page: Page, deps: LeadFormFlowDeps) {
    this.page = page;
    this.deps = deps;
  }

  // Get Information Side Modal Lead Form The "Get Information / Stay Updated" CTA opens the same sidebar/modal lead form on the condo plan, plan detail and QMI pages. The flow is identical on all three - only the page label, the container locator and the timeouts differ - so it lives here instead of being copied per page object.

  /**
   * Finds the Get Information / Stay Updated CTA to click.
   *
   * Prefers the breadcrumb CTA the plan detail, QMI and condo plan pages use, then the hero CTA the
   * community pages use, then a scan of every CTA on the page. In-viewport candidates win: these pages
   * also render a zero-box duplicate, and the sticky quick-action bar copy reports as visible while
   * parked off-canvas, which is what made the click fail with "Element is outside of the viewport".
   */
  async getVisibleGetInformationCta(pageLabel: string): Promise<Locator> {
    let firstVisible: Locator | null = null;

    // Most specific container first: the plan/QMI breadcrumb CTA, then the community hero CTA, then
    // a scan of whatever else matches. Each container-scoped lookup rules out the off-canvas copies.
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

        if (await this.hasBoxInViewport(candidate)) {
          return candidate;
        }

        firstVisible ??= candidate;
      }
    }

    // Nothing is in view yet: hand back a visible candidate so Playwright's own scroll can reach a
    // below-the-fold CTA, the way this did before the in-viewport preference was added.
    if (firstVisible) {
      return firstVisible;
    }

    throw new Error(`No visible Get Information CTA found on ${pageLabel}`);
  }

  /** Whether a locator has a real box that overlaps the viewport. */
  private async hasBoxInViewport(locator: Locator): Promise<boolean> {
    const box = await locator.boundingBox().catch(() => null);

    if (!box || box.width <= 0 || box.height <= 0) {
      return false;
    }

    const viewport = await this.page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    return (
      box.x + box.width > 0 &&
      box.x < viewport.width &&
      box.y + box.height > 0 &&
      box.y < viewport.height
    );
  }

  /** Reveals a Get Information CTA by scrolling down until one becomes visible. */
  async revealGetInformationCta(pageLabel: string): Promise<void> {
    const initialCta = await this.getVisibleGetInformationCta(pageLabel).catch(() => null);

    if (initialCta && (await initialCta.isVisible({ timeout: 1500 }).catch(() => false))) {
      return;
    }

    for (const position of [450, 900, 1400]) {
      await this.page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), position);
      await this.deps.waitForPageReady();
      await this.deps.settle(400);

      const cta = await this.getVisibleGetInformationCta(pageLabel).catch(() => null);

      if (cta && (await cta.isVisible({ timeout: 1000 }).catch(() => false))) {
        return;
      }
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

  /** Clicks the Get Information CTA when the sidebar/modal lead form is not already open. */
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

    // The National-promotion overlay is a full-screen dialog that covers the CTA
    // and swallows the click. Dismiss it rather than clicking through it, so a
    // genuinely unreachable CTA still fails instead of failing later elsewhere.
    await this.deps.dismissPromoPopup({ appearTimeout: 3000 });

    await this.revealGetInformationCta(options.pageLabel);

    const cta = await this.getVisibleGetInformationCta(options.pageLabel);

    await expect(cta, 'Get Information or Stay Updated CTA should be visible').toBeVisible({
      timeout: options.ctaTimeout ?? 15_000,
    });

    const previousUrl = this.page.url();

    // No force: click() runs the actionability checks, so an overlay-covered CTA
    // reports the blocker instead of registering a click that goes nowhere.
    await cta.click();
    await this.deps.waitForPageReady();
    await this.deps.settle(1000);
    await this.expectNoContactRedirect(previousUrl, options.pageLabel);
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
   * found for resource" - which is what every row of the old evidence workbook
   * recorded instead of a payload.
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
   * Matching any POST containing "api" caught /api/jss/fieldtracking/register,
   * which fires on every field focus and always won the race - 74 of 77 rows in
   * the last evidence workbook were tracking noise. Noise is excluded first, then
   * the endpoints that really take a lead. LEAD_API_URL_PATTERN overrides both.
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
    // the submission. fieldtracking/register is the one that used to win.
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
