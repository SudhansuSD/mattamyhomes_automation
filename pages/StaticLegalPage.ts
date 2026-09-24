import { expect, Locator, Page, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { escapeRegex, getFooter } from '../utils/web/pageObjectUtils';
import { FOOTER_LEGAL_LINKS } from '../config/navigation/countryNavigation';
import { BasePage } from './BasePage';
import { Footer } from './Footer';

export type StaticLegalPageLink = {
  label: string;
  href: RegExp;
};

export type StaticLegalPageConfig = {
  name: string;
  path: string;
  expectedTitle: RegExp;
  headings: RegExp[];
  contentChecks: string[];
  requiredLinks: StaticLegalPageLink[];
};

export const STATIC_LEGAL_PAGES: readonly StaticLegalPageConfig[] = [
  {
    name: 'Privacy Policies',
    path: '/privacy-policies',
    expectedTitle: /Privacy Policy \| Mattamy Homes/i,
    headings: [
      /Mattamy Homes Privacy Policy/i,
      /Privacy Policy/i,
      /SMS Privacy Policy/i,
      /SMS Terms of Service/i,
    ],
    contentChecks: ['Mattamy Homes Privacy Policy', 'SMS Privacy Policy', 'SMS Terms of Service'],
    requiredLinks: [
      { label: 'privacy policy detail link', href: /\/privacy-policy/i },
      { label: 'SMS privacy policy link', href: /\/sms-privacy-policy/i },
      { label: 'SMS terms of service link', href: /\/sms-terms-of-service/i },
    ],
  },
  {
    name: 'Terms and Conditions',
    path: '/terms-and-conditions',
    expectedTitle: /Terms & Conditions \| Mattamy Homes/i,
    headings: [/Mattamy Homes Terms of Use/i],
    contentChecks: [
      'Mattamy Homes Terms of Use',
      'EQUAL HOUSING OPPORTUNITY',
      'USER RESTRICTIONS',
      'DISCLAIMER / LIMITATION OF LIABILITY',
      'DISPUTE RESOLUTION TERMS FOR U.S. VISITORS',
    ],
    requiredLinks: [
      { label: 'privacy email link', href: /^mailto:privacy@mattamycorp\.com/i },
      {
        label: 'user generated content terms link',
        href: /\/terms-and-conditions\/user-generated-content/i,
      },
      { label: 'privacy policy link', href: /\/privacy-policy|\/sms-privacy-policy/i },
    ],
  },
  {
    name: 'Legal Disclaimers',
    path: '/legal-disclaimers',
    expectedTitle: /Legal Disclaimers \| Mattamy Homes/i,
    headings: [
      /Mattamy Homes Legal Disclaimers/i,
      /Updated: January 15, 2021/i,
      /Amenities/i,
      /Broker Participation/i,
    ],
    contentChecks: [
      'Mattamy Homes Legal Disclaimers',
      'These Legal Disclaimers',
      'Terms and Conditions',
      'Privacy Policies',
    ],
    requiredLinks: [
      { label: 'terms and conditions link', href: /\/terms-and-conditions/i },
      { label: 'privacy policy link', href: /\/sms-privacy-policy/i },
      { label: 'home financing link', href: /mattamyhf\.com/i },
    ],
  },
  {
    name: 'Accessibility',
    path: '/accessibility',
    expectedTitle: /Accessibility \| Mattamy Homes/i,
    headings: [
      /Accessibility for Ontarians with Disabilities/i,
      /Associated Policies/i,
      /Accessible Customer Service/i,
      /Accessible Employment/i,
      /Information & Communications/i,
    ],
    contentChecks: [
      'Accessibility for Ontarians with Disabilities',
      'all accessibility requirements under governing laws',
      'Accessibility Multi-Year Plan and Policy',
    ],
    requiredLinks: [
      {
        label: 'accessibility contact email link',
        href: /^mailto:Human\.Resources@mattamycorp\.com/i,
      },
      { label: 'multi-year plan link', href: /\/accessibility\/multi-year-plan/i },
      { label: 'AODA policy PDF link', href: /AODA.*\.pdf|accessibility.*\.pdf/i },
    ],
  },
] as const;

export class StaticLegalPage extends BasePage {
  readonly header: Locator;
  readonly contentRoot: Locator;
  readonly footer: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.contentRoot = page.locator('body');
    this.footer = getFooter(page);
  }

  /** Opens the legal/static page through its footer link on the home page. */
  async navigateToStaticPage(config: StaticLegalPageConfig): Promise<void> {
    await this.step(`Navigate to ${config.name}`, async () => {
      const { envName } = getEnvConfig();
      const footerLink = FOOTER_LEGAL_LINKS.find((link) => link.url === config.path);

      expect(
        footerLink,
        `${config.path} should be configured as a footer legal link`,
      ).toBeDefined();

      const footer = new Footer(this.page);

      // An init script, so it has to be registered before the first document loads.
      if (envName === 'PROD') {
        await this.preventProdFormSubmission();
      }

      await this.reportValue(
        'Navigating to static page',
        `ENV=${envName} | STATIC_PAGE=${config.name} | ENTRY=footer ${footerLink!.name} link`,
      );

      await this.navigate();
      await footer.verifyFooterLinkVisible(footerLink!);
      await footer.clickFooterLink(footerLink!);

      await this.ensurePageRendered();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  /** Checks the title, route, header, content area and footer are all in place. */
  async validatePageShell(config: StaticLegalPageConfig): Promise<void> {
    await this.step(`Validate page shell: ${config.name}`, async () => {
      await this.assertPageTitle(
        config.expectedTitle,
        `${config.name} title should match expected value`,
      );
      await this.assertPageUrl(
        new RegExp(`${escapeRegex(config.path)}(?:\\?.*)?$`, 'i'),
        `${config.name} should keep the expected route`,
      );
      await this.assertAttached(
        this.header,
        `${config.name} should keep the global header present`,
        15_000,
      );
      await this.assertVisible(
        this.contentRoot,
        `${config.name} should render page content`,
        15_000,
      );
      await this.assertAttached(
        this.footer,
        `${config.name} should keep the global footer present`,
        15_000,
      );
    });
  }

  /** Checks the page renders real text, its expected headings and its expected wording. */
  async validateStaticContent(config: StaticLegalPageConfig): Promise<void> {
    await this.step(`Validate static content: ${config.name}`, async () => {
      const initialErrorCount = test.info().errors.length;
      const softExpect = expect.configure({ soft: true });

      await expect
        .poll(async () => this.getVisibleContentLength(), {
          message: `${config.name} should render meaningful visible content`,
          timeout: 20000,
        })
        .toBeGreaterThan(200);

      await Promise.all(
        config.headings.map((heading) =>
          softExpect(
            this.contentRoot.getByRole('heading', { name: heading }).first(),
            `${config.name} should show heading ${heading}`,
          ).toBeVisible({ timeout: 15_000 }),
        ),
      );

      const pageText = await this.getVisiblePageText();

      for (const expectedText of config.contentChecks) {
        softExpect(pageText, `${config.name} should include "${expectedText}"`).toContain(
          expectedText,
        );
      }

      expect(
        test.info().errors.slice(initialErrorCount),
        `${config.name} static content audit should have no assertion failures`,
      ).toHaveLength(0);
    });
  }

  /** Checks every visible link has an href and the required destinations are present. */
  async validateRequiredLinks(config: StaticLegalPageConfig): Promise<void> {
    await this.step(`Validate required links: ${config.name}`, async () => {
      const initialErrorCount = test.info().errors.length;
      const softExpect = expect.configure({ soft: true });

      await this.validateVisibleLinksHaveDestinations();

      await Promise.all(
        config.requiredLinks.map((requiredLink) =>
          softExpect
            .poll(async () => this.hasVisibleLinkMatching(requiredLink.href), {
              message: `${config.name} should include ${requiredLink.label}`,
              timeout: 15000,
            })
            .toBeTruthy(),
        ),
      );

      for (const requiredLink of config.requiredLinks) {
        await this.reportValue(`Required link: ${requiredLink.label}`, requiredLink.href.source);
      }

      expect(
        test.info().errors.slice(initialErrorCount),
        `${config.name} required-link audit should have no assertion failures`,
      ).toHaveLength(0);
    });
  }

  /** Checks the page stays read-only - no forms, no submit buttons. */
  async validateNoFormsOrSubmitActions(config: StaticLegalPageConfig): Promise<void> {
    await this.step(`Validate no forms or submit actions: ${config.name}`, async () => {
      await this.assertCount(
        this.contentRoot.locator('form'),
        0,
        `${config.name} should not expose forms`,
      );
      await this.assertCount(
        this.contentRoot.getByRole('button', { name: /submit/i }),
        0,
        `${config.name} should not expose submit buttons`,
      );
    });
  }

  /** Blocks any form submit on PROD, so a stray click can never post real data. */
  private async preventProdFormSubmission(): Promise<void> {
    await this.page.addInitScript(() => {
      const win = window as typeof window & {
        __mattamyStaticLegalProdSubmitGuard?: boolean;
      };

      if (win.__mattamyStaticLegalProdSubmitGuard) {
        return;
      }

      win.__mattamyStaticLegalProdSubmitGuard = true;

      document.addEventListener(
        'submit',
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          console.warn('[PROD GUARD] Static legal page form submission blocked.');
        },
        true,
      );

      HTMLFormElement.prototype.submit = function blockedProdSubmit() {
        console.warn('[PROD GUARD] Static legal page form submit() blocked.');
      };

      HTMLFormElement.prototype.requestSubmit = function blockedProdRequestSubmit() {
        console.warn('[PROD GUARD] Static legal page form requestSubmit() blocked.');
      };
    });
  }

  /** Fails if any visible link on the page is missing its href. */
  private async validateVisibleLinksHaveDestinations(): Promise<void> {
    const linksWithoutHref = await this.contentRoot
      .locator('a:visible')
      .evaluateAll((links) =>
        links
          .filter((link) => !link.getAttribute('href'))
          .map((link) => link.textContent?.trim() || link.outerHTML),
      );

    expect
      .soft(linksWithoutHref, 'Visible static page links should include href destinations')
      .toEqual([]);
  }

  /** Returns true when a visible link's href matches the pattern. */
  private async hasVisibleLinkMatching(pattern: RegExp): Promise<boolean> {
    return this.contentRoot.locator('a[href]:visible').evaluateAll(
      (links, regexInput) => {
        const regex = new RegExp(regexInput.source, regexInput.flags);

        return links.some((link) => regex.test(link.getAttribute('href') || ''));
      },
      { source: pattern.source, flags: pattern.flags },
    );
  }

  /** Returns the page text with whitespace collapsed. */
  private async getVisiblePageText(): Promise<string> {
    const text = await this.contentRoot.innerText({ timeout: 15000 });

    return text.replace(/\s+/g, ' ').trim();
  }

  /** Returns how many characters of text the page is actually showing, skipping hidden nodes. */
  private async getVisibleContentLength(): Promise<number> {
    return this.contentRoot.evaluate((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let text = '';

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;

        if (!parent) {
          continue;
        }

        const style = window.getComputedStyle(parent);

        if (style.display !== 'none' && style.visibility !== 'hidden') {
          text += ` ${node.textContent || ''}`;
        }
      }

      return text.replace(/\s+/g, ' ').trim().length;
    });
  }
}
