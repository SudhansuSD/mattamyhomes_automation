import { expect, Locator, Page } from '@playwright/test';
import { escapeRegex } from '../utils/pageObjectUtils';
import { BasePage } from './BasePage';
import { HeaderNavigationLink } from './Header';

type AboutPageExpectation = {
  title: RegExp;
  headings: RegExp[];
  links?: RegExp[];
  buttons?: RegExp[];
  validate?: (page: AboutUsPage) => Promise<void>;
};

const ABOUT_PAGE_EXPECTATIONS: Record<string, AboutPageExpectation> = {
  '/about/about-mattamy': {
    title: /About Us \| Mattamy Homes/i,
    headings: [/Diversity and Inclusion|Peter Gilgan|Your best makes us better/i],
  },
  '/about/community-involvement': {
    title: /Community Involvement \| Mattamy Homes/i,
    headings: [/Community is our home/i, /Caring about doing good/i, /Making an impact/i],
    links: [/community-involvement/i],
    buttons: [/SHOW MORE|Learn more/i],
    validate: (page) => page.validateCommunityInvolvementFunctionality(),
  },
  '/about/sustainability': {
    title: /Sustainability \| Mattamy Homes/i,
    headings: [/Sustainability/i, /Strategic Sustainability Pillars/i, /Sustainability Reports/i],
    links: [/sustainability/i, /sustainabilityreport|assetstream|dfsmedia/i],
    buttons: [/Read More|Read Report|Read Our/i],
    validate: (page) => page.validateSustainabilityFunctionality(),
  },
  '/about/media-and-investor-relations': {
    title: /Media and Investor Relations \| Mattamy Homes/i,
    headings: [/Media and Investor Relations/i, /News Releases/i, /Media Resources/i],
    links: [
      /mediaroom\.com/i,
      /mailto:bondholders@mattamycorp\.com/i,
      /mailto:media@mattamycorp\.com/i,
    ],
    buttons: [/See More Releases|Download PDF|SUBMIT/i],
    validate: (page) => page.validateMediaAndInvestorFunctionality(),
  },
  '/about/careers': {
    title: /(Jobs and )?Careers \| Mattamy Homes/i,
    headings: [/For those who want to build a better world/i, /Imagine your career with Mattamy/i],
    links: [/\/about\/careers/i],
    buttons: [/Tell me more|SHOW MORE|Apply today|Next slide/i],
    validate: (page) => page.validateCareersFunctionality(),
  },
};

export class AboutUsPage extends BasePage {
  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.header = page.locator('header');
    this.main = page.locator('main').first();
    this.footer = page.locator('#footer, section[id="footer"]').first();
  }

  /** Checks about page. */
  async validateAboutPage(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Validate About page: ${link.name}`, async () => {
      const expectation = ABOUT_PAGE_EXPECTATIONS[link.url];

      if (!expectation) {
        throw new Error(`No About page expectation configured for ${link.url}`);
      }

      await this.validatePageShell(link, expectation);
      await this.validatePageContent(expectation);
      await this.validateVisibleLinksHaveDestinations();
      await expectation.validate?.(this);
    });
  }

  /**
   * Lightweight validation for a top-level static About link (e.g. CAN's
   * Sustainability), checking route, shell and meaningful content without the
   * country-specific content expectations used by validateAboutPage.
   */
  async validateTopLevelAboutPage(link: HeaderNavigationLink): Promise<void> {
    await this.step(`Validate top-level About page: ${link.name}`, async () => {
      await this.waitForPageReady();

      await this.assertPageUrl(
        new RegExp(`${escapeRegex(link.url)}/?$`),
        `${link.name} should keep the expected route`,
      );
      await this.assertAttached(
        this.header,
        `${link.name} should keep the global header mounted`,
        15_000,
      );
      await this.assertAttached(
        this.main,
        `${link.name} should render a main content area`,
        15_000,
      );
      await this.assertAttached(
        this.footer,
        `${link.name} should keep the global footer mounted`,
        15_000,
      );
      await this.assertHeadingVisible(undefined, `${link.name} should expose a visible H1`, 20_000);

      await expect
        .poll(async () => (await this.getMainText()).length, {
          message: `${link.name} should render meaningful visible content`,
          timeout: 20000,
        })
        .toBeGreaterThan(120);
    });
  }

  /** Checks page shell. */
  async validatePageShell(
    link: HeaderNavigationLink,
    expectation: AboutPageExpectation,
  ): Promise<void> {
    await this.step(`Validate page shell: ${link.name}`, async () => {
      await this.waitForPageReady();

      await this.assertPageTitle(
        expectation.title,
        `${link.name} title should match expected value`,
      );
      await this.assertPageUrl(
        new RegExp(`${escapeRegex(link.url)}/?$`),
        `${link.name} should keep the expected route without a country query parameter`,
      );
      await this.assertAttached(
        this.header,
        `${link.name} should keep the global header mounted`,
        15_000,
      );
      await this.assertAttached(
        this.main,
        `${link.name} should render a main content area`,
        15_000,
      );
      await this.assertAttached(
        this.footer,
        `${link.name} should keep the global footer mounted`,
        15_000,
      );
    });
  }

  /** Checks page content. */
  async validatePageContent(expectation: AboutPageExpectation): Promise<void> {
    await this.step('Validate page content, headings, links and buttons', async () => {
      await expect
        .poll(async () => this.getVisibleMainContentLength(), {
          message: 'About page should render meaningful visible content',
          timeout: 20000,
        })
        .toBeGreaterThan(120);

      for (const heading of expectation.headings) {
        await expect
          .poll(async () => heading.test(await this.getMainText()), {
            message: `Expected About page content matching ${heading}`,
            timeout: 15000,
          })
          .toBeTruthy();
      }

      for (const linkPattern of expectation.links ?? []) {
        await expect
          .poll(async () => this.hasAnyLinkMatching(linkPattern), {
            message: `Expected a link matching ${linkPattern}`,
            timeout: 15000,
          })
          .toBeTruthy();

        await this.reportValue('Link pattern validated', linkPattern.source);
      }

      for (const buttonPattern of expectation.buttons ?? []) {
        await expect
          .poll(async () => this.hasAnyButtonMatching(buttonPattern), {
            message: `Expected a button matching ${buttonPattern}`,
            timeout: 15000,
          })
          .toBeTruthy();
      }
    });
  }

  /** Checks community involvement functionality. */
  async validateCommunityInvolvementFunctionality(): Promise<void> {
    await this.step('Validate Community Involvement functionality', async () => {
      await this.validateShowMoreIfPresent();
      await this.validateExternalLinkIfPresent(/petergilganfoundation\.org/i);
    });
  }

  /** Checks sustainability functionality. */
  async validateSustainabilityFunctionality(): Promise<void> {
    await this.step('Validate Sustainability functionality', async () => {
      await this.validateVisibleHref(/sustainabilityreport|assetstream|dfsmedia/i);
      await this.validateVisibleHref(/\/about\/sustainability\/message-from-our-founder/i);
      await this.validateVisibleHref(/\/about\/sustainability\/responsible-management/i);
    });
  }

  /** Checks media and investor functionality. */
  async validateMediaAndInvestorFunctionality(): Promise<void> {
    await this.step('Validate Media and Investor Relations functionality', async () => {
      const releaseLinks = this.main.locator('a[href*="mediaroom.com"]:visible');
      await this.assertVisible(
        releaseLinks.first(),
        'News Releases should list visible release links',
        15_000,
      );

      const releaseCount = await releaseLinks.count();
      const seeMoreButton = this.main.getByRole('button', { name: /See More Releases/i });

      if (await seeMoreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await seeMoreButton.click();
        await expect
          .poll(() => releaseLinks.count(), {
            message: 'See More Releases should not reduce the release list',
            timeout: 10000,
          })
          .toBeGreaterThanOrEqual(releaseCount);
      }

      await this.validateVisibleHref(/\/dfsmedia\/.+fact-sheet/i);
      await this.validateVisibleHref(/^mailto:bondholders@mattamycorp\.com$/i);
      await this.validateVisibleHref(/^mailto:media@mattamycorp\.com$/i);
      await this.validateInvestorFormIfPresent();
    });
  }

  /** Checks careers functionality. */
  async validateCareersFunctionality(): Promise<void> {
    await this.step('Validate Careers functionality', async () => {
      await this.validateLinkIfPresent(/\/about\/careers\/early-careers/i);
      await this.validateShowMoreIfPresent();

      const nextSlideButton = this.main.getByRole('button', { name: /Next slide/i }).first();

      if (await nextSlideButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextSlideButton.scrollIntoViewIfNeeded();
        await nextSlideButton.click();
        await this.assertVisible(
          nextSlideButton,
          'Career carousel next control should remain usable after click',
          5_000,
        );
      }

      const previousSlideButton = this.main
        .getByRole('button', { name: /Previous slide/i })
        .first();

      if (await previousSlideButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await previousSlideButton.scrollIntoViewIfNeeded();
        await previousSlideButton.click();
        await expect(
          previousSlideButton,
          'Career carousel previous control should remain usable after click',
        ).toBeVisible({ timeout: 5000 });
      }

      await expect(this.main.getByRole('button', { name: /Apply today/i }).first()).toBeVisible({
        timeout: 15000,
      });
    });
  }

  /** Checks show more if present. */
  private async validateShowMoreIfPresent(): Promise<void> {
    const showMoreButton = this.main.getByRole('button', { name: /SHOW MORE/i }).first();

    if (!(await showMoreButton.isVisible({ timeout: 3000 }).catch(() => false))) {
      return;
    }

    const visibleLinksBefore = await this.main.locator('a[href]:visible').count();
    await showMoreButton.click();

    await expect
      .poll(async () => this.main.locator('a[href]:visible').count(), {
        message: 'SHOW MORE should reveal or preserve visible card links',
        timeout: 10000,
      })
      .toBeGreaterThanOrEqual(visibleLinksBefore);
  }

  /** Checks investor form if present. */
  private async validateInvestorFormIfPresent(): Promise<void> {
    const form = this.main.locator('form').first();

    if (!(await form.isVisible({ timeout: 3000 }).catch(() => false))) {
      return;
    }

    await expect(
      form.locator('input[required]').first(),
      'Investor form should expose required fields',
    ).toBeVisible();
    await expect(form.getByRole('button', { name: /^SUBMIT$/i })).toBeVisible();
  }

  /** Checks visible links have destinations. */
  private async validateVisibleLinksHaveDestinations(): Promise<void> {
    const linksWithoutHref = await this.main
      .locator('a:visible')
      .evaluateAll((links) =>
        links
          .filter((link) => !link.getAttribute('href'))
          .map((link) => link.textContent?.trim() || link.outerHTML),
      );

    expect(linksWithoutHref, 'Visible About page links should include href destinations').toEqual(
      [],
    );
  }

  /** Checks external link if present. */
  private async validateExternalLinkIfPresent(hrefPattern: RegExp): Promise<void> {
    if (await this.hasVisibleLinkMatching(hrefPattern)) {
      await this.validateVisibleHref(hrefPattern);
    }
  }

  /** Checks link if present. */
  private async validateLinkIfPresent(hrefPattern: RegExp): Promise<void> {
    if (await this.hasAnyLinkMatching(hrefPattern)) {
      await this.validateVisibleHref(hrefPattern);
    }
  }

  /** Checks visible href. */
  private async validateVisibleHref(hrefPattern: RegExp): Promise<void> {
    await expect
      .poll(async () => this.hasAnyLinkMatching(hrefPattern), {
        message: `Expected a link href matching ${hrefPattern}`,
        timeout: 15000,
      })
      .toBeTruthy();
  }

  /** Checks whether visible link matching. */
  private async hasVisibleLinkMatching(pattern: RegExp): Promise<boolean> {
    return this.main.locator('a[href]:visible').evaluateAll(
      (links, regexInput) => {
        const regex = new RegExp(regexInput.source, regexInput.flags);

        return links.some((link) => regex.test(link.getAttribute('href') || ''));
      },
      { source: pattern.source, flags: pattern.flags },
    );
  }

  /** Checks whether any link matching. */
  private async hasAnyLinkMatching(pattern: RegExp): Promise<boolean> {
    return this.main.locator('a[href]').evaluateAll(
      (links, regexInput) => {
        const regex = new RegExp(regexInput.source, regexInput.flags);

        return links.some((link) => regex.test(link.getAttribute('href') || ''));
      },
      { source: pattern.source, flags: pattern.flags },
    );
  }

  /**
   * Checks whether any button-like control matches the pattern.
   *
   * Includes links and role="button" elements, not just <button>: these pages
   * render their calls to action as anchors (the Sustainability page's "Read Our
   * 2025 Sustainability Report" is an <a>), so a <button>-only search reported a
   * missing CTA on a page that renders one.
   */
  private async hasAnyButtonMatching(pattern: RegExp): Promise<boolean> {
    return this.main.locator('button, a, [role="button"]').evaluateAll(
      (controls, regexInput) => {
        const regex = new RegExp(regexInput.source, regexInput.flags);

        return controls.some((control) =>
          regex.test(control.textContent || control.getAttribute('aria-label') || ''),
        );
      },
      { source: pattern.source, flags: pattern.flags || 'i' },
    );
  }

  /** Gets visible main content length. */
  private async getVisibleMainContentLength(): Promise<number> {
    return (await this.getMainText()).length;
  }

  /** Gets main text. */
  private async getMainText(): Promise<string> {
    return this.main.evaluate((main) => (main.textContent || '').replace(/\s+/g, ' ').trim());
  }
}
