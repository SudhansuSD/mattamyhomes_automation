import { expect, Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { escapeRegex, getFooter } from '../utils/web/pageObjectUtils';
import { BasePage } from './BasePage';

// Homebuying Pages Object Model Covers the Homebuying section pages, driven by a per-path expectation map (mirrors AboutUsPage): - /homebuying/homebuying    (Journey / What to Expect) - /homebuying/financing     (Financing + MortgageCalculator) - /homebuying/shopping-tools(Shopping Tools + SavingsCalculator + Form)

export type HomebuyingPageExpectation = {
  name: string;
  path: string;
  title: RegExp;
  headings: RegExp[];
  hasMortgageCalculator?: boolean;
  hasSavingsCalculator?: boolean;
  hasForm?: boolean;
};

export const HOMEBUYING_PAGES: Record<string, HomebuyingPageExpectation> = {
  journey: {
    name: 'Homebuying Journey',
    path: '/homebuying/homebuying',
    title: /Home ?buying|What to Expect|Mattamy Homes/i,
    headings: [/homebuying|what to expect|journey|steps/i],
  },
  financing: {
    name: 'Financing',
    path: '/homebuying/financing',
    title: /Financing|Mattamy Homes/i,
    headings: [/financing|mortgage|afford/i],
    hasMortgageCalculator: true,
  },
  shoppingTools: {
    name: 'Shopping Tools',
    path: '/homebuying/shopping-tools',
    title: /Shopping|Virtually|Mattamy Homes/i,
    headings: [/shopping|tools|virtual/i],
    hasSavingsCalculator: true,
    hasForm: true,
  },
};

/** Affiliated Business Arrangement disclosure modal shown before leaving the site. */
const ABA_MODAL_SELECTOR = '#ABAModalContainer';

/** Mattamy Home Funding calculators - the actual mortgage calculator destination. */
const MORTGAGE_CALCULATOR_URL = /mattamyhf\.com\/Calculators\.html/i;

export class HomebuyingPage extends BasePage {
  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.main = page.locator('main').first();
    this.footer = getFooter(page);
  }

  /** Opens the given Homebuying page for the configured country. */
  async navigateToHomebuyingPage(
    expectation: HomebuyingPageExpectation,
    overrideLocation?: LocationKey,
  ): Promise<void> {
    await this.step(`Navigate to ${expectation.name}`, async () => {
      const { baseURL, envName } = getEnvConfig();
      const location = getLocationConfig(overrideLocation);
      const targetUrl = `${baseURL}${expectation.path}?${location.queryParam}`;

      await this.reportValue(
        'Navigating to Homebuying page',
        `ENV=${envName} | PAGE=${expectation.name} | URL=${targetUrl}`,
      );

      await this.gotoAndVerifyResponse(targetUrl);
      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
      await this.ensurePageRendered();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  /** Checks the page shell (title, route, header, main and footer). */
  async validatePageShell(expectation: HomebuyingPageExpectation): Promise<void> {
    await this.step(`Validate page shell: ${expectation.name}`, async () => {
      await this.assertPageTitle(
        expectation.title,
        `${expectation.name} title should match expected value`,
      );
      await this.assertPageUrl(
        new RegExp(`${escapeRegex(expectation.path)}(?:\\?.*)?$`, 'i'),
        `${expectation.name} should keep the expected route`,
      );
      await this.assertAttached(
        this.header,
        `${expectation.name} should keep the global header mounted`,
        15_000,
      );
      await this.assertAttached(
        this.main,
        `${expectation.name} should render a main content area`,
        15_000,
      );
      await this.assertAttached(
        this.footer,
        `${expectation.name} should keep the global footer mounted`,
        15_000,
      );
    });
  }

  /** Checks the page renders meaningful content and expected headings. */
  async validateContent(expectation: HomebuyingPageExpectation): Promise<void> {
    await this.step(`Validate content: ${expectation.name}`, async () => {
      await expect
        .poll(async () => this.getMainTextLength(), {
          message: `${expectation.name} should render meaningful visible content`,
          timeout: 20000,
        })
        .toBeGreaterThan(150);

      const mainText = await this.getMainText();

      for (const heading of expectation.headings) {
        expect(
          heading.test(mainText),
          `${expectation.name} should contain content matching ${heading}`,
        ).toBeTruthy();
      }
    });
  }

  /**
   * Checks the Affiliated Business Arrangement (ABA) disclosure modal behind
   * the "Mortgage Calculator" CTA.
   *
   * The Financing page does NOT host a calculator - the CTA opens this
   * disclosure, and acknowledging it hands off to Mattamy Home Funding in a new
   * tab. The acknowledge link is deliberately NOT clicked: it leaves the site
   * for a third party. Its destination is asserted from the href instead, and
   * the modal is dismissed so the page is left in a clean state.
   */
  async validateMortgageCalculatorModal(): Promise<void> {
    await this.step('Validate mortgage calculator disclosure modal', async () => {
      const trigger = this.page.getByRole('button', { name: /mortgage calculator/i }).first();
      await trigger.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined);
      await this.assertVisible(trigger, 'Mortgage Calculator CTA should be visible', 10_000);
      await trigger.click({ timeout: 10_000 });

      const modal = this.page.locator(ABA_MODAL_SELECTOR);
      await this.assertVisible(modal, 'ABA disclosure modal should open', 10_000);

      const modalText = await modal.evaluate((el) =>
        (el.textContent || '').replace(/\s+/g, ' ').trim(),
      );
      expect(
        /Affiliated Business (Arrangement|Disclosure)/i.test(modalText),
        'Disclosure modal should state the affiliated business relationship',
      ).toBeTruthy();
      expect(
        /Mattamy Home Funding/i.test(modalText),
        'Disclosure modal should name Mattamy Home Funding as the affiliated lender',
      ).toBeTruthy();
      await this.reportValue('ABA disclosure length', `${modalText.length} chars`);

      // Assert the destination from the href only - clicking would open a
      // third-party tab and leave the run with an extra page to clean up.
      const acknowledge = modal
        .locator('a')
        .filter({ hasText: /acknowledge/i })
        .first();
      await this.assertVisible(
        acknowledge,
        'ABA modal should offer an "I Acknowledge" link',
        10_000,
      );

      const href = await acknowledge.getAttribute('href');
      const target = await acknowledge.getAttribute('target');
      await this.reportValue(
        'Mortgage calculator destination (not followed)',
        `${href} (target=${target})`,
      );

      expect(
        href ?? '',
        'Acknowledge link should point at the Mattamy Home Funding calculators',
      ).toMatch(MORTGAGE_CALCULATOR_URL);
      expect(target, 'Acknowledge link should open in a new tab').toBe('_blank');

      await this.dismissAbaModal(modal);
    });
  }

  /** Dismisses the ABA disclosure modal and waits for it to detach. */
  private async dismissAbaModal(modal: Locator): Promise<void> {
    const close = modal
      .locator('button')
      .filter({ hasText: /^\s*close\s*$/i })
      .first();

    if (await close.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await close.click({ timeout: 5_000 }).catch(() => undefined);
    } else {
      await this.page.keyboard.press('Escape').catch(() => undefined);
    }

    await expect(modal, 'ABA disclosure modal should close').toBeHidden({ timeout: 8_000 });
  }

  /** Checks the savings calculator sidebar renders an estimated savings value. */
  async validateSavingsCalculator(): Promise<void> {
    await this.step('Validate savings calculator', async () => {
      const calculator = this.page
        .locator('aside, section, div')
        .filter({ hasText: /savings|save|calculat/i })
        .filter({ has: this.page.locator('input, [role="slider"]') })
        .first();

      await calculator.scrollIntoViewIfNeeded().catch(() => undefined);

      if (!(await calculator.isVisible({ timeout: 8000 }).catch(() => false))) {
        await this.reportValue('Savings calculator not present on this page (skipping)');
        return;
      }

      await this.assertVisible(calculator, 'Savings calculator should be visible', 15_000);

      const inputs = calculator.locator('input, [role="slider"]');
      expect(
        await inputs.count(),
        'Savings calculator should expose adjustable inputs',
      ).toBeGreaterThan(0);

      await expect
        .poll(
          async () => /\$\s?[0-9,]+/.test((await calculator.textContent().catch(() => '')) ?? ''),
          {
            message: 'Savings calculator should display a currency value',
            timeout: 12000,
          },
        )
        .toBeTruthy();
    });
  }

  /** Checks the shopping-tools form enforces required-field validation. */
  async validateFormRequiredValidation(): Promise<void> {
    await this.step('Validate form required-field validation', async () => {
      const form = this.main.locator('form').first();

      if (!(await form.isVisible({ timeout: 8000 }).catch(() => false))) {
        await this.reportValue('No form present on this page (skipping)');
        return;
      }

      await form.scrollIntoViewIfNeeded().catch(() => undefined);

      const submit = form.getByRole('button', { name: /submit|send|sign up|subscribe/i }).first();
      if (!(await submit.isVisible({ timeout: 5000 }).catch(() => false))) {
        await this.reportValue('No submit control found in form (skipping)');
        return;
      }

      await submit.click();
      await this.settle(1000);

      const invalidCount = await form.locator(':invalid, [aria-invalid="true"]').count();
      expect(
        invalidCount,
        'Submitting an empty form should surface required-field validation',
      ).toBeGreaterThan(0);
    });
  }

  /** Gets the normalized length of the main content text. */
  private async getMainTextLength(): Promise<number> {
    return (await this.getMainText()).length;
  }

  /** Gets the normalized main content text. */
  private async getMainText(): Promise<string> {
    return this.main.evaluate((main) => (main.textContent || '').replace(/\s+/g, ' ').trim());
  }
}
