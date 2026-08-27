import { expect, Locator, Page } from '@playwright/test';

/**
 * Consent banners, promotion overlays, and the DOM they leave behind.
 *
 * Split out of BasePage. Needs only the page plus a way to settle and report,
 * so BasePage keeps its original method signatures and delegates here.
 */
export type OverlayManagerDeps = {
  settle: (ms: number) => Promise<void>;
  report: (message: string, value?: unknown) => Promise<void>;
};

export class OverlayManager {
  private readonly page: Page;
  private readonly deps: OverlayManagerDeps;
  private handlersRegistered = false;

  /** Sets up the overlay manager for one page. */
  constructor(page: Page, deps: OverlayManagerDeps) {
    this.page = page;
    this.deps = deps;
  }

  /**
   * Registers auto-dismiss handlers for late-appearing consent dialogs.
   *
   * A "Privacy" consent dialog can load a beat after navigation and intercept
   * clicks/navigation - it blocks the About > Careers navigation, leaving the
   * URL on the home page so the route wait times out. addLocatorHandler runs the
   * dismissal whenever the dialog obscures an action and then retries the
   * action, so the navigation proceeds. Registered once per page; safe to call
   * repeatedly.
   */
  async registerHandlers(): Promise<void> {
    if (this.handlersRegistered) {
      return;
    }
    this.handlersRegistered = true;

    const privacyDialog = this.page.getByRole('dialog', { name: /privacy/i });

    await this.page.addLocatorHandler(privacyDialog, async (dialog) => {
      const dismissButton = dialog
        .getByRole('button', { name: /close|accept|agree|got it|ok|continue|dismiss/i })
        .first();

      const buttonVisible = await dismissButton
        .waitFor({ state: 'visible', timeout: 1000 })
        .then(() => true)
        .catch(() => false);

      if (buttonVisible) {
        await dismissButton.click({ force: true }).catch(() => undefined);
      }

      await this.page.keyboard.press('Escape').catch(() => undefined);

      // Escalate if it is still there. On CAN this dialog survived both the
      // button click and Escape - the handler re-fired six times while the About
      // Us menu navigation stayed blocked, and the test reported a title
      // mismatch ("Mattamy Homes") because the browser never left the home page.
      // A consent dialog we cannot dismiss is environmental noise, so it is
      // removed rather than left to swallow every subsequent click.
      if (await dialog.isVisible().catch(() => false)) {
        await this.closeNationalPromotion(dialog);
      }
    });

    // The National-promotion overlay behaves the same way but worse: it renders a
    // beat after navigation AND can come back later (route change, timer), so a
    // one-shot dismissal after navigate() misses it on pages reached through the
    // search flow. A locator handler dismisses it whenever it actually obscures
    // an action and then retries the action, on every page, for the whole test -
    // which is what the scattered dismissPromoPopupIfPresent() calls could not do.
    const promotionOverlay = this.page
      .locator('[role="dialog"][aria-label*="promotion" i], [aria-label="National promotion"]')
      .first();

    await this.page.addLocatorHandler(
      promotionOverlay,
      async (overlay) => {
        await this.closeNationalPromotion(overlay);
      },
      // The overlay can reappear, so this must stay armed for the whole test
      // rather than firing once.
      { noWaitAfter: true },
    );
  }

  /** Accepts the cookie banner when it is visible. */
  async acceptCookies(): Promise<void> {
    const acceptBtn = this.page.locator('#onetrust-accept-btn-handler');

    const isVisible = await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await acceptBtn.click({ force: true, timeout: 5000 }).catch(() => undefined);
    }

    const closeBtn = this.page
      .locator('.onetrust-close-btn-handler, #onetrust-close-btn-container button')
      .first();

    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.dispatchEvent('click').catch(async () => {
        await closeBtn.click({ force: true, timeout: 5000 }).catch(() => undefined);
      });
      await this.page
        .locator('#onetrust-banner-sdk, .ot-sdk-container')
        .first()
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => undefined);
    }
  }

  /**
   * Dismisses the promo popup / National-promotion overlay when present.
   *
   * `appearTimeout` is how long to wait for the National-promotion popup to
   * render before concluding it is absent. The popup renders a beat AFTER
   * navigation, and Playwright's `isVisible()` returns immediately (its
   * `timeout` option is ignored), so a plain check would no-op and leave the
   * promo sitting on top of the lead form where it blocks .fill()/.click().
   * Pass a positive `appearTimeout` right after navigation to wait for it;
   * leave it 0 (default) in tight loops where the popup is already handled so
   * the check does not wait.
   */
  async dismissPromoPopup(options: { appearTimeout?: number } = {}): Promise<void> {
    await this.acceptCookies();

    const appearTimeout = options.appearTimeout ?? 0;
    // Case-insensitive / contains match: the aria-label varies across pages
    // ("National promotion", "National Promotion popup", ...).
    const nationalPromotionDialog = this.page
      .locator(
        '[role="dialog"][aria-label*="promotion" i]:visible, [aria-label="National promotion"]:visible',
      )
      .first();

    if (appearTimeout > 0) {
      await nationalPromotionDialog
        .waitFor({ state: 'visible', timeout: appearTimeout })
        .catch(() => undefined);
    }

    if (await nationalPromotionDialog.isVisible().catch(() => false)) {
      await this.closeNationalPromotion(nationalPromotionDialog);
      await this.deps.settle(500);
      await this.clearStaleModalAriaHidden();
      return;
    }

    const dialogs = this.page
      .locator(
        [
          '.ReactModal__Content:visible',
          '[role="dialog"]:visible',
          '[aria-modal="true"]:visible',
          '.ReactModalPortal [class*="modal" i]:visible',
          '.ReactModalPortal [class*="content" i]:visible',
        ].join(', '),
      )
      .filter({
        hasNot: this.page.locator('form, input, select, textarea'),
        has: this.page.locator('button, a, img'),
      });
    const dialogCount = await dialogs.count();

    for (let index = 0; index < dialogCount; index++) {
      const dialog = dialogs.nth(index);

      if (!(await dialog.isVisible({ timeout: 500 }).catch(() => false))) {
        continue;
      }

      const dialogText = await dialog.innerText().catch(() => '');

      const hasPromoMedia = (await dialog.locator('img, picture, video').count()) > 0;
      const hasPromoCta =
        (await dialog
          .locator('button, a')
          .filter({ hasText: /going on now|learn more|view offer|promo|promotion/i })
          .count()) > 0;

      if (
        !/promo|promotion|banner|going on now|special|offer|incentive/i.test(dialogText) &&
        !hasPromoMedia &&
        !hasPromoCta
      ) {
        continue;
      }

      const closeButton = dialog
        .locator(
          [
            'button[aria-label*="close" i]',
            'button[class*="close" i]',
            'button:has-text("Close")',
            'button:has-text("Close Icon")',
            'button:has(svg)',
            'svg[aria-label*="close" i]',
            '[aria-label*="close" i]',
            '[class*="close" i]',
          ].join(', '),
        )
        .first();

      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click({ force: true }).catch(async () => {
          await closeButton.dispatchEvent('click').catch(() => undefined);
        });
      } else {
        await this.page.keyboard.press('Escape').catch(() => undefined);
      }

      await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    }

    await this.clearStaleModalAriaHidden();
  }

  /**
   * Clears react-modal's page-level state when no modal is actually mounted.
   *
   * While a modal is open react-modal marks its app element `aria-hidden="true"`
   * and puts `ReactModal__Body--open` on <body>, and undoes both from its own
   * close handler. Every dismissal in this class closes those overlays the blunt
   * way - force click, dispatchEvent, Escape, and finally `.remove()` on the
   * overlay in closeNationalPromotion - so the modal goes away without that
   * handler ever running and `#root` stays aria-hidden for the rest of the test.
   *
   * That one leftover attribute takes the whole page out of the accessibility
   * tree, so every role-based lookup matches nothing while the page still looks
   * perfectly normal on screen. On the USA community page it drops
   * `getByRole('button', { name: /submit/i })` from 2 matches to 0 and
   * `getByRole('textbox')` from 14 to 0 - which is how an open, visible form
   * ends up reported as "not present on the page".
   *
   * The guard checks for a *visible* promotion/notification overlay rather than
   * for any `.ReactModal__Content`: the promotion overlay is itself a mounted
   * `.ReactModal__Content`, so the broader check skipped exactly when the flag
   * needed clearing. Clearing it can't hide a real dialog either - react-modal
   * portals its overlays outside `#root`, and the Get Information flyout is not
   * a react-modal at all.
   */
  async clearStaleModalAriaHidden(): Promise<void> {
    await this.page
      .evaluate(() => {
        const isVisible = (element: Element): boolean => {
          const box = element.getBoundingClientRect();

          return box.width > 0 || box.height > 0;
        };

        const blockingOverlay = Array.from(
          document.querySelectorAll('.ReactModal__Content, [role="dialog"][aria-modal="true"]'),
        ).some(
          (element) =>
            /promotion|notification/i.test(element.getAttribute('aria-label') ?? '') &&
            isVisible(element),
        );

        if (blockingOverlay) {
          return;
        }

        document.body.classList.remove('ReactModal__Body--open');

        document
          .querySelectorAll('#root[aria-hidden="true"]')
          .forEach((element) => element.removeAttribute('aria-hidden'));
      })
      .catch(() => undefined);
  }

  /**
   * Puts the page back in the accessibility tree after the promotion popup has
   * taken it out.
   *
   * `dismissPromoPopupIfPresent` can miss the popup: it renders a beat after
   * navigation, and the wait window is kept short so pages with no promo (the
   * whole CAN site) don't pay for it on every call. A promo that mounts just
   * after that window leaves `#root` aria-hidden for the rest of the test, and
   * from there every role-based lookup quietly matches nothing - which is why
   * this only ever showed up on USA, and only sometimes.
   *
   * Re-checking here is cheaper than waiting longer up front: one attribute
   * lookup when all is well, a dismissal when it isn't. Never throws - if the
   * promo refuses to close, the click it blocks reports it and names the
   * intercepting element.
   */
  async ensurePageInAccessibilityTree(): Promise<void> {
    const hiddenRoot = this.page.locator('#root[aria-hidden="true"]');

    if (!(await hiddenRoot.count().catch(() => 0))) {
      return;
    }

    await this.deps.report(
      'Page was aria-hidden by the promotion popup; recovering',
      this.page.url(),
    );

    // Ends with clearStaleModalAriaHidden(), which is what actually drops the
    // leftover attribute when the overlay was removed without react-modal's own
    // close handler running.
    await this.dismissPromoPopup();

    await expect
      .poll(() => hiddenRoot.count(), {
        message: 'The page should be back in the accessibility tree (#root not aria-hidden)',
        timeout: 5000,
      })
      .toBe(0)
      .catch(() => undefined);
  }

  /**
   * Closes the National-promotion overlay: click its close button (matching the
   * varying aria-label / class) and press Escape, retrying briefly, then remove
   * the overlay from the DOM as a last resort so a stuck promo cannot sit on top
   * of a lead form and block .fill()/.click() until the action times out.
   */

  /**
   * Closes a blocking full-screen modal that is not a lead form.
   *
   * The auto-dismiss handler only matches dialogs labelled "promotion"; the site
   * also renders an unlabelled one that sat over the country selector until the
   * click timed out. Dialogs containing a submit button are left alone - that is
   * what distinguishes a lead form from an interstitial.
   */
  async dismissBlockingModalIfPresent(): Promise<void> {
    const dialog = this.page.locator('[role="dialog"][aria-modal="true"]:visible').first();

    if (!(await dialog.isVisible().catch(() => false))) {
      return;
    }

    const isLeadForm = await dialog
      .locator('button[type="submit"], input[type="submit"], button:has-text("Submit")')
      .count()
      .then((count) => count > 0)
      .catch(() => false);

    if (isLeadForm) {
      return;
    }

    await this.deps.report('Dismissing unlabelled blocking modal before interacting');
    await this.closeNationalPromotion(dialog);
  }

  /**
   * Stops the AtlasRTX chat widget intercepting clicks.
   *
   * Its floating iframe sits over the Submit button, which cost four submission
   * tests a "locator.click: Timeout" with no clue why. Pointer events are
   * disabled rather than forcing the click, because a forced click would also
   * hide the case where one of our own overlays genuinely blocks the form.
   */
  async neutralizeChatWidget(): Promise<void> {
    await this.page
      .evaluate(() => {
        const widget = document.querySelector<HTMLElement>('#iAtlasChatDiv, #iAtlasChat');
        const host = widget?.closest<HTMLElement>('div') ?? widget;

        if (host && host.style.pointerEvents !== 'none') {
          host.style.pointerEvents = 'none';
          return true;
        }

        return false;
      })
      .then(async (neutralized) => {
        if (neutralized) {
          await this.deps.report('Disabled pointer events on the AtlasRTX chat widget');
        }
      })
      .catch(() => undefined);
  }

  private async closeNationalPromotion(dialog: Locator): Promise<void> {
    const closeButton = this.page
      .getByRole('button', {
        name: /close national promotion popup|close national promotion|^close$/i,
      })
      .or(
        dialog.locator(
          'button[aria-label*="close" i], button[class*="close" i], button:has-text("×"), button:has-text("✕")',
        ),
      )
      .first();

    for (let attempt = 0; attempt < 3 && (await dialog.isVisible().catch(() => false)); attempt++) {
      await closeButton.click({ force: true, timeout: 2000 }).catch(async () => {
        await closeButton.dispatchEvent('click').catch(() => undefined);
      });
      await this.page.keyboard.press('Escape').catch(() => undefined);
      await dialog.waitFor({ state: 'hidden', timeout: 1500 }).catch(() => undefined);
    }

    if (await dialog.isVisible().catch(() => false)) {
      await dialog
        .evaluate((element) => {
          const overlay = element.closest(
            '[class*="overlay" i], [class*="ReactModal__Overlay" i], [class*="backdrop" i]',
          );
          (overlay ?? element).remove();
        })
        .catch(() => undefined);
    }

    await this.clearStaleModalAriaHidden();
  }
}
