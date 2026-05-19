import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';

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
      /SMS Terms of Service/i
    ],
    contentChecks: [
      'Mattamy Homes Privacy Policy',
      'SMS Privacy Policy',
      'SMS Terms of Service'
    ],
    requiredLinks: [
      { label: 'privacy policy detail link', href: /\/privacy-policy/i },
      { label: 'SMS privacy policy link', href: /\/sms-privacy-policy/i },
      { label: 'SMS terms of service link', href: /\/sms-terms-of-service/i }
    ]
  },
  {
    name: 'Terms and Conditions',
    path: '/terms-and-conditions',
    expectedTitle: /Terms & Conditions \| Mattamy Homes/i,
    headings: [
      /Mattamy Homes Terms of Use/i,
      /EQUAL HOUSING OPPORTUNITY/i,
      /OWNERSHIP \/ RESTRICTIONS ON USE/i,
      /DISCLAIMER \/ LIMITATION OF LIABILITY/i
    ],
    contentChecks: [
      'Mattamy Homes Terms of Use',
      'EQUAL HOUSING OPPORTUNITY',
      'DISPUTE RESOLUTION TERMS FOR U.S. VISITORS'
    ],
    requiredLinks: [
      { label: 'privacy email link', href: /^mailto:privacy@mattamycorp\.com/i },
      { label: 'user generated content terms link', href: /\/terms-and-conditions\/user-generated-content/i },
      { label: 'privacy policy link', href: /\/privacy-policy|\/sms-privacy-policy/i }
    ]
  },
  {
    name: 'Legal Disclaimers',
    path: '/legal-disclaimers',
    expectedTitle: /Legal Disclaimers \| Mattamy Homes/i,
    headings: [
      /Mattamy Homes Legal Disclaimers/i,
      /Updated: January 15, 2021/i,
      /Amenities/i,
      /Broker Participation/i
    ],
    contentChecks: [
      'Mattamy Homes Legal Disclaimers',
      'These Legal Disclaimers',
      'Terms and Conditions',
      'Privacy Policies'
    ],
    requiredLinks: [
      { label: 'terms and conditions link', href: /\/terms-and-conditions/i },
      { label: 'privacy policy link', href: /\/sms-privacy-policy/i },
      { label: 'home financing link', href: /mattamyhf\.com/i }
    ]
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
      /Information & Communications/i
    ],
    contentChecks: [
      'Accessibility for Ontarians with Disabilities',
      'all accessibility requirements under governing laws',
      'Accessibility Multi-Year Plan and Policy'
    ],
    requiredLinks: [
      { label: 'accessibility contact email link', href: /^mailto:Human\.Resources@mattamycorp\.com/i },
      { label: 'multi-year plan link', href: /\/accessibility\/multi-year-plan/i },
      { label: 'AODA policy PDF link', href: /AODA.*\.pdf|accessibility.*\.pdf/i }
    ]
  }
] as const;

export class StaticLegalPage extends BasePage {
  readonly header: Locator;
  readonly contentRoot: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);

    this.header = page.locator('header').first();
    this.contentRoot = page.locator('body');
    this.footer = page.locator('#footer, section[id="footer"], footer').first();
  }

  async navigateToStaticPage(config: StaticLegalPageConfig): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const targetUrl = `${baseURL}${config.path}`;

    if (envName === 'PROD') {
      await this.preventProdFormSubmission();
    }

    console.log(`[NAVIGATE] ENV=${envName} | STATIC_PAGE=${config.name} | URL=${targetUrl}`);

    await this.page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.acceptCookiesIfPresent();
    await this.waitForPageReady();
  }

  async validatePageShell(config: StaticLegalPageConfig): Promise<void> {
    await expect(this.page).toHaveTitle(config.expectedTitle);
    await expect(this.page, `${config.name} should keep the expected route`)
      .toHaveURL(new RegExp(`${this.escapeRegExp(config.path)}(?:\\?.*)?$`, 'i'));
    await expect(this.header, `${config.name} should keep the global header present`)
      .toBeAttached({ timeout: 15000 });
    await expect(this.contentRoot, `${config.name} should render page content`)
      .toBeVisible({ timeout: 15000 });
    await expect(this.footer, `${config.name} should keep the global footer present`)
      .toBeAttached({ timeout: 15000 });
  }

  async validateStaticContent(config: StaticLegalPageConfig): Promise<void> {
    await expect
      .poll(
        async () => this.getVisibleContentLength(),
        {
          message: `${config.name} should render meaningful visible content`,
          timeout: 20000
        }
      )
      .toBeGreaterThan(200);

    for (const heading of config.headings) {
      await expect(this.contentRoot.getByRole('heading', { name: heading }).first())
        .toBeVisible({ timeout: 15000 });
    }

    const pageText = await this.getVisiblePageText();

    for (const expectedText of config.contentChecks) {
      expect(pageText, `${config.name} should include "${expectedText}"`).toContain(expectedText);
    }
  }

  async validateRequiredLinks(config: StaticLegalPageConfig): Promise<void> {
    await this.validateVisibleLinksHaveDestinations();

    for (const requiredLink of config.requiredLinks) {
      await expect
        .poll(
          async () => this.hasVisibleLinkMatching(requiredLink.href),
          {
            message: `${config.name} should include ${requiredLink.label}`,
            timeout: 15000
          }
        )
        .toBeTruthy();
    }
  }

  async validateNoFormsOrSubmitActions(config: StaticLegalPageConfig): Promise<void> {
    await expect(this.contentRoot.locator('form'), `${config.name} should not expose forms`)
      .toHaveCount(0);
    await expect(this.contentRoot.getByRole('button', { name: /submit/i }), `${config.name} should not expose submit buttons`)
      .toHaveCount(0);
  }

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
        true
      );

      HTMLFormElement.prototype.submit = function blockedProdSubmit() {
        console.warn('[PROD GUARD] Static legal page form submit() blocked.');
      };

      HTMLFormElement.prototype.requestSubmit = function blockedProdRequestSubmit() {
        console.warn('[PROD GUARD] Static legal page form requestSubmit() blocked.');
      };
    });
  }

  private async validateVisibleLinksHaveDestinations(): Promise<void> {
    const linksWithoutHref = await this.contentRoot.locator('a:visible').evaluateAll((links) =>
      links
        .filter((link) => !link.getAttribute('href'))
        .map((link) => link.textContent?.trim() || link.outerHTML)
    );

    expect(linksWithoutHref, 'Visible static page links should include href destinations').toEqual([]);
  }

  private async hasVisibleLinkMatching(pattern: RegExp): Promise<boolean> {
    return this.contentRoot.locator('a[href]:visible').evaluateAll((links, regexInput) => {
      const regex = new RegExp(regexInput.source, regexInput.flags);

      return links.some((link) => regex.test(link.getAttribute('href') || ''));
    }, { source: pattern.source, flags: pattern.flags });
  }

  private async getVisiblePageText(): Promise<string> {
    const text = await this.contentRoot.innerText({ timeout: 15000 });

    return text.replace(/\s+/g, ' ').trim();
  }

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

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
