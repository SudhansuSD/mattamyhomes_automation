import { expect, Locator, Page } from '@playwright/test';
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
    headings: [/Diversity and Inclusion|Peter Gilgan|Your best makes us better/i]
  },
  '/about/community-involvement': {
    title: /Community Involvement \| Mattamy Homes/i,
    headings: [/Community is our home/i, /Caring about doing good/i, /Making an impact/i],
    links: [/community-involvement/i],
    buttons: [/SHOW MORE|Learn more/i],
    validate: (page) => page.validateCommunityInvolvementFunctionality()
  },
  '/about/sustainability': {
    title: /Sustainability \| Mattamy Homes/i,
    headings: [/Sustainability/i, /Strategic Sustainability Pillars/i, /Sustainability Reports/i],
    links: [/sustainability/i, /sustainabilityreport|assetstream|dfsmedia/i],
    buttons: [/Read More|Read Report|Read Our/i],
    validate: (page) => page.validateSustainabilityFunctionality()
  },
  '/about/media-and-investor-relations': {
    title: /Media and Investor Relations \| Mattamy Homes/i,
    headings: [/Media and Investor Relations/i, /News Releases/i, /Media Resources/i],
    links: [/mediaroom\.com/i, /mailto:bondholders@mattamycorp\.com/i, /mailto:media@mattamycorp\.com/i],
    buttons: [/See More Releases|Download PDF|SUBMIT/i],
    validate: (page) => page.validateMediaAndInvestorFunctionality()
  },
  '/about/careers': {
    title: /(Jobs and )?Careers \| Mattamy Homes/i,
    headings: [/For those who want to build a better world/i, /Imagine your career with Mattamy/i],
    links: [/\/about\/careers/i],
    buttons: [/Tell me more|SHOW MORE|Apply today|Next slide/i],
    validate: (page) => page.validateCareersFunctionality()
  }
};

export class AboutUsPage extends BasePage {
  readonly header: Locator;
  readonly main: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);

    this.header = page.locator('header');
    this.main = page.locator('main').first();
    this.footer = page.locator('#footer, section[id="footer"]').first();
  }

  async validateAboutPage(link: HeaderNavigationLink): Promise<void> {
    const expectation = ABOUT_PAGE_EXPECTATIONS[link.url];

    if (!expectation) {
      throw new Error(`No About page expectation configured for ${link.url}`);
    }

    await this.validatePageShell(link, expectation);
    await this.validatePageContent(expectation);
    await this.validateVisibleLinksHaveDestinations();
    await expectation.validate?.(this);
  }

  async validatePageShell(link: HeaderNavigationLink, expectation: AboutPageExpectation): Promise<void> {
    await this.waitForPageReady();

    await expect(this.page).toHaveTitle(expectation.title);
    await expect(this.page, `${link.name} should keep the expected route`)
      .toHaveURL(new RegExp(`${this.escapeRegExp(link.url)}(?:\\?.*)?$`));
    await expect(this.header, `${link.name} should keep the global header mounted`)
      .toBeAttached({ timeout: 15000 });
    await expect(this.main, `${link.name} should render a main content area`)
      .toBeAttached({ timeout: 15000 });
    await expect(this.footer, `${link.name} should keep the global footer mounted`)
      .toBeAttached({ timeout: 15000 });
  }

  async validatePageContent(expectation: AboutPageExpectation): Promise<void> {
    await expect
      .poll(
        async () => this.getVisibleMainContentLength(),
        {
          message: 'About page should render meaningful visible content',
          timeout: 20000
        }
      )
      .toBeGreaterThan(120);

    for (const heading of expectation.headings) {
      await expect
        .poll(
          async () => heading.test(await this.getMainText()),
          {
            message: `Expected About page content matching ${heading}`,
            timeout: 15000
          }
        )
        .toBeTruthy();
    }

    for (const linkPattern of expectation.links ?? []) {
      await expect
        .poll(
          async () => this.hasAnyLinkMatching(linkPattern),
          {
            message: `Expected a link matching ${linkPattern}`,
            timeout: 15000
          }
        )
        .toBeTruthy();
    }

    for (const buttonPattern of expectation.buttons ?? []) {
      await expect
        .poll(
          async () => this.hasAnyButtonMatching(buttonPattern),
          {
            message: `Expected a button matching ${buttonPattern}`,
            timeout: 15000
          }
        )
        .toBeTruthy();
    }
  }

  async validateCommunityInvolvementFunctionality(): Promise<void> {
    await this.validateShowMoreIfPresent();
    await this.validateExternalLinkIfPresent(/petergilganfoundation\.org/i);
  }

  async validateSustainabilityFunctionality(): Promise<void> {
    await this.validateVisibleHref(/sustainabilityreport|assetstream|dfsmedia/i);
    await this.validateVisibleHref(/\/about\/sustainability\/message-from-our-founder/i);
    await this.validateVisibleHref(/\/about\/sustainability\/responsible-management/i);
  }

  async validateMediaAndInvestorFunctionality(): Promise<void> {
    const releaseLinks = this.main.locator('a[href*="mediaroom.com"]:visible');
    await expect(releaseLinks.first(), 'News Releases should list visible release links')
      .toBeVisible({ timeout: 15000 });

    const releaseCount = await releaseLinks.count();
    const seeMoreButton = this.main.getByRole('button', { name: /See More Releases/i });

    if (await seeMoreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await seeMoreButton.click();
      await expect.poll(() => releaseLinks.count(), {
        message: 'See More Releases should not reduce the release list',
        timeout: 10000
      }).toBeGreaterThanOrEqual(releaseCount);
    }

    await this.validateVisibleHref(/\/dfsmedia\/.+fact-sheet/i);
    await this.validateVisibleHref(/^mailto:bondholders@mattamycorp\.com$/i);
    await this.validateVisibleHref(/^mailto:media@mattamycorp\.com$/i);
    await this.validateInvestorFormIfPresent();
  }

  async validateCareersFunctionality(): Promise<void> {
    await this.validateLinkIfPresent(/\/about\/careers\/early-careers/i);
    await this.validateShowMoreIfPresent();

    const nextSlideButton = this.main.getByRole('button', { name: /Next slide/i }).first();

    if (await nextSlideButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextSlideButton.scrollIntoViewIfNeeded();
      await nextSlideButton.click();
      await expect(nextSlideButton, 'Career carousel next control should remain usable after click')
        .toBeVisible({ timeout: 5000 });
    }

    const previousSlideButton = this.main.getByRole('button', { name: /Previous slide/i }).first();

    if (await previousSlideButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previousSlideButton.scrollIntoViewIfNeeded();
      await previousSlideButton.click();
      await expect(previousSlideButton, 'Career carousel previous control should remain usable after click')
        .toBeVisible({ timeout: 5000 });
    }

    await expect(this.main.getByRole('button', { name: /Apply today/i }).first())
      .toBeVisible({ timeout: 15000 });
  }

  private async validateShowMoreIfPresent(): Promise<void> {
    const showMoreButton = this.main.getByRole('button', { name: /SHOW MORE/i }).first();

    if (!await showMoreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      return;
    }

    const visibleLinksBefore = await this.main.locator('a[href]:visible').count();
    await showMoreButton.click();

    await expect.poll(async () => this.main.locator('a[href]:visible').count(), {
      message: 'SHOW MORE should reveal or preserve visible card links',
      timeout: 10000
    }).toBeGreaterThanOrEqual(visibleLinksBefore);
  }

  private async validateInvestorFormIfPresent(): Promise<void> {
    const form = this.main.locator('form').first();

    if (!await form.isVisible({ timeout: 3000 }).catch(() => false)) {
      return;
    }

    await expect(form.locator('input[required]').first(), 'Investor form should expose required fields')
      .toBeVisible();
    await expect(form.getByRole('button', { name: /^SUBMIT$/i }))
      .toBeVisible();
  }

  private async validateVisibleLinksHaveDestinations(): Promise<void> {
    const linksWithoutHref = await this.main.locator('a:visible').evaluateAll((links) =>
      links
        .filter((link) => !link.getAttribute('href'))
        .map((link) => link.textContent?.trim() || link.outerHTML)
    );

    expect(linksWithoutHref, 'Visible About page links should include href destinations').toEqual([]);
  }

  private async validateExternalLinkIfPresent(hrefPattern: RegExp): Promise<void> {
    if (await this.hasVisibleLinkMatching(hrefPattern)) {
      await this.validateVisibleHref(hrefPattern);
    }
  }

  private async validateLinkIfPresent(hrefPattern: RegExp): Promise<void> {
    if (await this.hasAnyLinkMatching(hrefPattern)) {
      await this.validateVisibleHref(hrefPattern);
    }
  }

  private async validateVisibleHref(hrefPattern: RegExp): Promise<void> {
    await expect
      .poll(
        async () => this.hasAnyLinkMatching(hrefPattern),
        {
          message: `Expected a link href matching ${hrefPattern}`,
          timeout: 15000
        }
      )
      .toBeTruthy();
  }

  private async hasVisibleLinkMatching(pattern: RegExp): Promise<boolean> {
    return this.main.locator('a[href]:visible').evaluateAll((links, regexInput) => {
      const regex = new RegExp(regexInput.source, regexInput.flags);

      return links.some((link) => regex.test(link.getAttribute('href') || ''));
    }, { source: pattern.source, flags: pattern.flags });
  }

  private async hasAnyLinkMatching(pattern: RegExp): Promise<boolean> {
    return this.main.locator('a[href]').evaluateAll((links, regexInput) => {
      const regex = new RegExp(regexInput.source, regexInput.flags);

      return links.some((link) => regex.test(link.getAttribute('href') || ''));
    }, { source: pattern.source, flags: pattern.flags });
  }

  private async hasAnyButtonMatching(pattern: RegExp): Promise<boolean> {
    return this.main.locator('button').evaluateAll((buttons, regexInput) => {
      const regex = new RegExp(regexInput.source, regexInput.flags);

      return buttons.some((button) => regex.test(button.textContent || button.getAttribute('aria-label') || ''));
    }, { source: pattern.source, flags: pattern.flags || 'i' });
  }

  private async getVisibleMainContentLength(): Promise<number> {
    return (await this.getMainText()).length;
  }

  private async getMainText(): Promise<string> {
    return this.main.evaluate((main) => (main.textContent || '').replace(/\s+/g, ' ').trim());
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
