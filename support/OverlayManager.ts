import { expect, Locator, Page } from '@playwright/test';
import { closeAtlasChatIframeIfOpen } from '../utils/leadform/leadFormHelper';

/** What BasePage passes in so OverlayManager can settle and report while handling overlays. */
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

  /** Registers once per page the handlers that auto-dismiss late-appearing consent, promo and chat overlays. */
  async registerHandlers(): Promise<void> {
    if (this.handlersRegistered) {
      return;
    }
    this.handlersRegistered = true;

    const privacyDialog = this.page.getByRole('dialog', { name: /privacy/i });

    // Every step is timeboxed: a locator handler spends the timeout budget of the action that
    // triggered it, so an untimed click here can starve that action until it fails.
    await this.page.addLocatorHandler(privacyDialog, async (dialog) => {
      const dismissButton = this.page
        .locator('#onetrust-accept-btn-handler')
        .or(dialog.getByRole('button', { name: /accept|agree|got it|ok|continue|dismiss/i }))
        .or(dialog.getByRole('button', { name: /close/i }))
        .first();

      const buttonVisible = await dismissButton
        .waitFor({ state: 'visible', timeout: 500 })
        .then(() => true)
        .catch(() => false);

      if (buttonVisible) {
        await dismissButton.click({ force: true, timeout: 1000 }).catch(() => undefined);
      }

      await this.page.keyboard.press('Escape').catch(() => undefined);

      // Some dialogs survive both click and Escape and keep blocking navigation, so remove them outright.
      if (await dialog.isVisible().catch(() => false)) {
        await this.removeOverlayNode(dialog);
        await this.clearStaleModalAriaHidden();
      }
    });

    // The promotion overlay renders late and can come back, so a one-shot dismissal is not enough.
    const promotionOverlay = this.page
      .locator('[role="dialog"][aria-label*="promotion" i], [aria-label="National promotion"]')
      .first();

    await this.page.addLocatorHandler(
      promotionOverlay,
      async (overlay) => {
        await this.closeNationalPromotion(overlay);
      },
      // Stays armed for the whole test because the overlay can reappear.
      { noWaitAfter: true },
    );

    // The chat widget grows a few seconds after mounting and can cover clicks, so hide it (never
    // detach it - the chatbot check needs it). first() avoids strict-mode errors when it mounts twice.
    await this.page.addLocatorHandler(
      this.page.locator('#iAtlasChat:visible').first(),
      async () => {
        await this.neutralizeChatWidget();
      },
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

  /** Dismisses the promo popup if present; pass `appearTimeout` right after navigation, since the popup renders late. */
  async dismissPromoPopup(options: { appearTimeout?: number } = {}): Promise<void> {
    await this.acceptCookies();
    await this.closeNotificationBanners();

    const appearTimeout = options.appearTimeout ?? 0;
    // Loose aria-label match: the label varies across pages.
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

    await this.withPromoDismissalDeadline(
      (isExpired) => this.dismissVisiblePromoPopup(nationalPromotionDialog, isExpired),
      Math.max(5000, appearTimeout + 5000),
    );
  }

  /** Caps how long the overlay sweep may run; a timeout is reported, not thrown, since a busy page is the usual cause. */
  private async withPromoDismissalDeadline(
    work: (isExpired: () => boolean) => Promise<void>,
    timeout: number,
  ): Promise<void> {
    let expired = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      const finished = await Promise.race([
        work(() => expired).then(() => true),
        new Promise<boolean>((resolve) => {
          timer = setTimeout(() => {
            expired = true;
            resolve(false);
          }, timeout);
        }),
      ]);

      if (!finished) {
        await this.deps.report(
          `Promotion overlay sweep exceeded ${timeout}ms; continuing (page was slow to respond)`,
          this.page.url(),
        );
      }
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  /** Closes the promotion overlay, or any other visible promo-like dialog that holds no form. */
  private async dismissVisiblePromoPopup(
    nationalPromotionDialog: Locator,
    isExpired: () => boolean,
  ): Promise<void> {
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

    for (let index = 0; index < dialogCount && !isExpired(); index++) {
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
        await closeButton.click({ force: true, timeout: 2000 }).catch(async () => {
          await closeButton.dispatchEvent('click').catch(() => undefined);
        });
      } else {
        await this.page.keyboard.press('Escape').catch(() => undefined);
      }

      await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    }

    await this.clearStaleModalAriaHidden();
  }

  /** Closes the notification banners pinned to the top, which the dialog sweep misses and which can cover CTAs on phones. */
  private async closeNotificationBanners(): Promise<void> {
    const closeButtons = this.page.locator(
      [
        '#national-notification-banner button[aria-label*="close" i]',
        '#market-notification-banner button[aria-label*="close" i]',
        '#notification-banner button[aria-label*="close" i]',
      ].join(', '),
    );

    const count = await closeButtons.count();

    for (let index = 0; index < count; index++) {
      const closeButton = closeButtons.nth(index);

      if (!(await closeButton.isVisible().catch(() => false))) {
        continue;
      }

      await closeButton.click({ force: true, timeout: 2000 }).catch(async () => {
        await closeButton.dispatchEvent('click').catch(() => undefined);
      });
    }
  }

  /** Removes react-modal's leftover `#root` aria-hidden (which blinds role lookups) when no promo overlay is visible. */
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

  /** Re-dismisses a late promo popup that left `#root` aria-hidden; cheap when nothing is wrong and never throws. */
  async ensurePageInAccessibilityTree(): Promise<void> {
    const hiddenRoot = this.page.locator('#root[aria-hidden="true"]');

    if (!(await hiddenRoot.count().catch(() => 0))) {
      return;
    }

    await this.deps.report(
      'Page was aria-hidden by the promotion popup; recovering',
      this.page.url(),
    );

    // Ends with clearStaleModalAriaHidden(), which drops the leftover attribute.
    await this.dismissPromoPopup();

    await expect
      .poll(() => hiddenRoot.count(), {
        message: 'The page should be back in the accessibility tree (#root not aria-hidden)',
        timeout: 5000,
      })
      .toBe(0)
      .catch(() => undefined);
  }

  /** Closes an unlabeled blocking full-screen modal, leaving any dialog with a submit button (a lead form) alone. */
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

    await this.deps.report('Dismissing unlabeled blocking modal before interacting');
    await this.closeNationalPromotion(dialog);
  }

  /** Hides the AtlasRTX chat iframe so it cannot cover a click; call before each click, since it loads late. */
  async neutralizeChatWidget(): Promise<void> {
    if (await closeAtlasChatIframeIfOpen(this.page)) {
      await this.deps.report('Closed the AtlasRTX chat iframe before clicking');
    }
  }

  /** Closes the promotion overlay with a few click/Escape tries, removing it from the DOM as a last resort. */
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
      await this.removeOverlayNode(dialog);
    }

    await this.clearStaleModalAriaHidden();
  }

  /** Removes an undismissable overlay from the DOM, backdrop included, so the page stays clickable. */
  private async removeOverlayNode(dialog: Locator): Promise<void> {
    await dialog
      .evaluate((element) => {
        const overlay = element.closest(
          '[class*="overlay" i], [class*="ReactModal__Overlay" i], [class*="backdrop" i]',
        );
        (overlay ?? element).remove();
      })
      .catch(() => undefined);
  }
}
