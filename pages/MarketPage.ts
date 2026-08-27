import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { escapeRegex, getNormalizedText } from '../utils/web/pageObjectUtils';
import {
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  fillLeadFormByFormId,
  fillLeadFormFields,
  getSubmitButton,
  getInvalidLeadData,
  getValidLeadData,
} from '../utils/leadform/leadFormHelper';
import { BasePage } from './BasePage';

export interface MarketConfig {
  name: string;
  url: string;
}

export class MarketPage extends BasePage {
  /** The market page's main heading. */
  readonly heading: Locator;

  /** The hero banner at the top of the market page. */
  readonly heroSection: Locator;

  /** The section holding the community cards. */
  readonly communitySection: Locator;

  /** The market lead form. */
  readonly leadForm: Locator;

  /** The Discover Our Homes section heading. */
  readonly discoverOurHomesSection: Locator;

  /** The links into plan and quick move-in search results. */
  readonly marketSearchLinks: Locator;

  /** The confirmation modal shown after a successful submission. */
  readonly successDialogModal: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.heading = page.locator('#HeaderPlanPage h1');
    this.heroSection = page.locator('#HeaderPlanPage');
    this.communitySection = page.locator('#CommunityCards');
    this.leadForm = page
      .getByRole('group')
      .filter({
        has: page.getByRole('combobox', { name: /Community of Interest/i }),
      })
      .filter({
        has: page.getByRole('button', { name: /submit/i }),
      });
    this.discoverOurHomesSection = page.locator('h2:has-text("Discover our homes")');
    this.marketSearchLinks = page.locator('a[href*="/search"][href*="productType="]');
    this.successDialogModal = page.locator('.ReactModal__Content');
  }

  // UTIL HELPERS

  /** Returns the community cards - the list items that actually link somewhere. */
  private getCommunityCards(section = this.communitySection): Locator {
    return section.locator('li').filter({
      has: this.page.locator('a[href]'),
    });
  }

  /** Returns a community card's title text. */
  private async getCommunityCardTitle(card: Locator): Promise<string> {
    const title = card.locator('h2, h3, h4, a div.block, a').first();
    return getNormalizedText(title);
  }

  /** Builds a heading matcher that accepts any of the market's configured aliases. */
  private getMarketNamePattern(marketName: string): RegExp {
    const aliases = marketName
      .split('||')
      .map((name) => name.trim())
      .filter(Boolean);
    const escapedAliases = aliases.flatMap((name) => {
      const escapedName = escapeRegex(name);
      const andVariant = escapedName.replace(/-/g, '\\s+(?:-|and)\\s+');

      return [escapedName, andVariant];
    });

    return new RegExp(`(?:${escapedAliases.join('|')})`, 'i');
  }

  /** Builds a URL matcher that also accepts the market's known redirect targets. */
  private getMarketUrlPattern(market: MarketConfig): RegExp {
    const paths = [market.url];

    if (market.url === '/florida/sarasota-bradenton') {
      paths.push('/florida/sarasota');
    }

    return new RegExp(`(?:${paths.map((path) => escapeRegex(path)).join('|')})(?:\\?.*)?$`, 'i');
  }

  /**
   * Finds the community cards section, falling back to the Explore Communities heading on older
   * layouts.
   */
  private async getCommunitySection(): Promise<Locator | null> {
    if (await this.communitySection.count()) {
      return this.communitySection.first();
    }

    const communityHeading = this.page
      .getByRole('heading', {
        name: /Explore (our )?communities/i,
      })
      .first();

    await communityHeading.waitFor({ state: 'attached', timeout: 5000 }).catch(() => undefined);

    if (!(await communityHeading.count())) {
      return null;
    }

    return communityHeading.locator('xpath=ancestor::*[.//li][1]');
  }

  /** Returns the Discover Our Homes section, or null when the market has none. */
  private async getDiscoverOurHomesSection(): Promise<Locator | null> {
    await this.discoverOurHomesSection
      .waitFor({ state: 'attached', timeout: 5000 })
      .catch(() => undefined);

    if (!(await this.discoverOurHomesSection.count())) {
      return null;
    }

    return this.discoverOurHomesSection.locator('xpath=ancestor::section[1]');
  }

  /** Returns the community cards section scrolled into view, or null when it is not shown. */
  private async getVisibleCommunitySection(): Promise<Locator | null> {
    const communitySection = await this.getCommunitySection();

    if (!communitySection || !(await this.isSectionVisible(communitySection))) {
      return null;
    }

    await this.prepareSection(communitySection);

    return communitySection;
  }

  /** Scrolls a section into view and waits for the page to settle. */
  private async prepareSection(section: Locator): Promise<void> {
    await section.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
  }

  /** The thank-you message shown after the lead form is submitted. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  }

  // NAVIGATION

  /** Opens a market page straight from its relative URL. */
  async navigateToMarket(relativeUrl: string): Promise<void> {
    await this.step(`Navigate to market page: ${relativeUrl}`, async () => {
      const { baseURL } = getEnvConfig();
      const location = getLocationConfig();
      const targetUrl = `${baseURL}${relativeUrl}?${location.queryParam}`;

      await this.page
        .goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        })
        .catch(async () => {
          await this.page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 90_000,
          });
        });
      await this.waitForPageReady();

      // navigate() applies this guard but goto() skipped it, so an unhydrated
      // render left every section locator resolving to nothing.
      await this.ensurePageRendered();

      // A stale URL still "works": /florida/sarasota-bradenton answered 301 and
      // dropped the query string, so the site fell back to its default country
      // and failed much later as "header country selector should show USA".
      const landedUrl = this.page.url();
      const expectedCountry = location.queryParam.split('=')[1];

      // "Did not load" is not "loaded somewhere else". A failed navigation
      // leaves chrome-error://chromewebdata/, which has no country parameter
      // either - reporting that as a stale URL points at the wrong file.
      if (/^(chrome-error|about:blank)/i.test(landedUrl)) {
        throw new Error(
          [
            `Navigation to ${relativeUrl} failed to load a page.`,
            `  requested: ${targetUrl}`,
            `  browser is on: ${landedUrl}`,
            '',
            'The browser reported a navigation error rather than serving the page.',
            'This is a load failure - network, server, or a crashed renderer - not a',
            'configuration problem. Re-run the single test to see whether it persists.',
          ].join('\n'),
        );
      }

      if (!new RegExp(`country=${expectedCountry}`, 'i').test(landedUrl)) {
        throw new Error(
          [
            `Navigating to ${relativeUrl} lost the country parameter.`,
            `  requested: ${targetUrl}`,
            `  landed on: ${landedUrl}`,
            '',
            'A redirect discarded the query string, so the site is using its default',
            'country rather than the one under test. Point the market url in',
            'config/locations/locationConfig.ts at the destination this redirects to.',
          ].join('\n'),
        );
      }

      await this.ensureConfiguredCountrySelected();
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  // MARKET PAGE VALIDATION

  /** Checks the URL and heading match the market we asked for. */
  async verifyMarketPage(market: MarketConfig): Promise<void> {
    await this.step(`Verify market page: ${market.name}`, async () => {
      await this.waitForPageReady();

      await this.assertPageUrl(
        this.getMarketUrlPattern(market),
        `${market.name} market page URL should match configured path`,
      );
      await this.assertTextContains(
        this.heading,
        this.getMarketNamePattern(market.name),
        `${market.name} market heading should match configured name`,
        15_000,
      );

      await this.reportValue('Market verified', `${market.name} at ${this.page.url()}`);
    });
  }

  /** Checks the hero shows its copy, image and search CTAs. */
  async validateHeroContent(market: MarketConfig): Promise<void> {
    await this.step(`Validate market hero content: ${market.name}`, async () => {
      await this.assertVisible(
        this.heroSection,
        `${market.name} market hero section should be visible`,
        15_000,
      );
      await this.assertTextContains(
        this.heading,
        this.getMarketNamePattern(market.name),
        `${market.name} market heading should be visible in hero`,
      );

      const heroImage = this.heroSection.locator('img').first();
      if (await heroImage.count()) {
        await this.assertVisible(heroImage, `${market.name} market hero image should be visible`);
      }

      const heroText = await getNormalizedText(this.heroSection);
      this.assertTruthy(heroText, 'Hero should include visible market copy');

      const pageSearchLinkCount = await this.marketSearchLinks.count();
      this.assertGreaterThan(pageSearchLinkCount, 0, 'Market page should include search CTAs');
    });
  }

  // COMMUNITY CARDS (DETAILED)

  /** Checks the market lists communities and records their names and URLs. */
  async validateCommunityCards(): Promise<void> {
    await this.step('Validate community cards are listed', async () => {
      const communitySection = await this.requireFeature(
        await this.getVisibleCommunitySection(),
        'market.communitySection',
        'Community Cards section',
      );

      if (!communitySection) {
        return;
      }
      const cards = this.getCommunityCards(communitySection);

      const count = await cards.count();
      this.assertGreaterThan(count, 0, 'Market page should list community cards');

      await this.reportValue(`Found ${count} community card(s)`);
    });
  }

  /** Checks each community card has a title, a link and a loaded image. */
  async validateCommunityCardDetails(): Promise<void> {
    await this.step('Validate community card details', async () => {
      const communitySection = await this.requireFeature(
        await this.getVisibleCommunitySection(),
        'market.communitySection',
        'Community Cards section',
      );

      if (!communitySection) {
        return;
      }

      const cards = this.getCommunityCards(communitySection);
      const count = await cards.count();
      this.assertGreaterThan(count, 0, 'Market page should list at least one community card');

      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const title = await this.getCommunityCardTitle(card);
        const href = await card.locator('a[href]').first().getAttribute('href');

        expect(title, `Community card ${i + 1} title missing`).toBeTruthy();
        expect(href, `Community card ${i + 1} href missing`).toBeTruthy();
        expect(href, `Community card ${i + 1} should not link to current page`).not.toBe(
          new URL(this.page.url()).pathname,
        );

        await this.reportValue(`${i + 1}. ${title}`, this.buildFullUrl(href));

        const image = card.locator('img').first();
        if (await image.count()) {
          await this.assertAttribute(
            image,
            'src',
            /.+/,
            `Community card ${i + 1} image should expose a src`,
          );
        }
      }

      await this.reportValue(`Validated details on ${count} community card(s)`);
    });
  }

  /** Clicks the first community card and checks it opens that community's page. */
  async validateFirstCommunityCardNavigation(): Promise<void> {
    await this.step('Validate first community card navigation', async () => {
      const communitySection = await this.requireFeature(
        await this.getVisibleCommunitySection(),
        'market.communitySection',
        'Community Cards section',
      );

      if (!communitySection) {
        return;
      }

      const firstCardLink = this.getCommunityCards(communitySection)
        .first()
        .locator('a[href]')
        .first();

      await this.assertVisible(firstCardLink, 'No community card link available');

      const href = await firstCardLink.getAttribute('href');
      this.assertTruthy(href, 'First community card href missing');

      await this.reportValue('First community card', this.buildFullUrl(href));

      await firstCardLink.scrollIntoViewIfNeeded();
      await Promise.all([this.page.waitForLoadState('domcontentloaded'), firstCardLink.click()]);
      await this.waitForPageReady();
      await this.assertPageUrlContains(href, `First community card should navigate to ${href}`);
    });
  }

  // LEAD FORM VALIDATION

  /** Checks the market lead form rejects invalid data. */
  async validateLeadForm(marketName: string): Promise<void> {
    await this.validateLeadFormInvalidData(marketName);
  }

  /** Returns the market lead form scrolled into view, failing if the page has none. */
  private async getAvailableLeadForm(marketName: string): Promise<Locator> {
    await this.waitForFooterSectionVisible(`the market lead form on ${marketName}`);

    const form = this.leadForm.first();

    if (!(await form.count())) {
      throw new Error(`Expected a lead form on ${marketName}, but none was found.`);
    }

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();

    await expect(form, `Lead form not in viewport on ${marketName}`).toBeInViewport({
      timeout: 10000,
    });
    await this.assertVisible(form, `Lead form not visible on ${marketName}`);

    return form;
  }

  /** Returns every field of the market lead form in one object. */
  private getLeadFormFields(form: Locator) {
    return {
      community: form.getByRole('combobox', { name: /Community of Interest/i }),
      firstName: form.getByRole('textbox', { name: /First name/i }),
      lastName: form.getByRole('textbox', { name: /Last name/i }),
      email: form.getByRole('textbox', { name: /^Email/i }),
      country: form.getByRole('combobox', { name: /Country of Residence/i }),
      zip: form.getByRole('textbox', { name: /Zip|Postal/i }),
      phone: form.getByRole('textbox', { name: /Phone/i }),
      submit: form.getByRole('button', { name: /SUBMIT/i }),
    };
  }

  /** Checks every market lead form field is visible. */
  private async expectLeadFormFieldsVisible(
    fields: ReturnType<MarketPage['getLeadFormFields']>,
  ): Promise<void> {
    for (const field of Object.values(fields)) {
      await expect(field).toBeVisible({ timeout: 10000 });
    }
  }

  /** Submits the empty lead form and checks the required-field errors appear. */
  async validateLeadFormRequiredErrors(marketName: string): Promise<void> {
    await this.step(`Validate lead form required errors: ${marketName}`, async () => {
      const form = await this.getAvailableLeadForm(marketName);
      const fields = this.getLeadFormFields(form);

      await this.expectLeadFormFieldsVisible(fields);
      await clickSubmit(this.page, form);
      await expectRequiredErrorsInForm(form);
      await expect(
        form.locator('text=/Community of Interest.*Required|Community.*Required/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });
  }

  /** Checks the lead form rejects an invalid email address. */
  async validateLeadFormInvalidData(marketName: string): Promise<void> {
    await this.step(`Validate lead form invalid data: ${marketName}`, async () => {
      const form = await this.getAvailableLeadForm(marketName);
      const fields = this.getLeadFormFields(form);

      await this.expectLeadFormFieldsVisible(fields);
      const invalid = getInvalidLeadData('market');

      await fillLeadFormFields(form, invalid, { selectCommunity: true });

      await getSubmitButton(form).click();

      await expectInvalidEmailErrorInForm(form);
    });
  }

  /** Fills the lead form with valid data and checks it submits. */
  async submitLeadFormSuccessfully(marketName: string): Promise<void> {
    await this.step(`Submit lead form successfully: ${marketName}`, async () => {
      const form = await this.getAvailableLeadForm(marketName);
      const fields = this.getLeadFormFields(form);

      await this.expectLeadFormFieldsVisible(fields);
      const valid = getValidLeadData('market');

      // Check the form id first, then fill: Canada forms also get the four extra fields.
      await fillLeadFormByFormId(form, valid, { selectCommunity: true });

      await this.submitLeadFormAndCaptureApi({
        form: form,
        formName: `${marketName} market lead form`,
        submitButton: getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        validateApiResponse: true,
      });
    });
  }

  // DISCOVER OUR HOMES

  /** Checks the Discover Our Homes links point at the right search results. */
  async validateDiscoverOurHomesSection(): Promise<void> {
    await this.step('Validate Discover Our Homes section links', async () => {
      await this.waitForPageReady();
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const section = await this.getDiscoverOurHomesSection();

      const isVisible = !!section && (await this.isSectionVisible(section));
      const discoverSection = await this.requireFeature(
        isVisible ? section : null,
        'market.discoverOurHomesSection',
        'Discover Our Homes section',
      );

      if (!discoverSection) {
        return;
      }

      await discoverSection.scrollIntoViewIfNeeded();
      await this.waitForPageReady();
      const links = discoverSection.locator('a');
      const count = await links.count();
      await this.reportValue(`Discover Our Homes links found: ${count}`);
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        await this.waitForPageReady();
        const text = await getNormalizedText(link);
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        await this.reportValue(`Discover link ${i + 1}: ${text}`, this.buildFullUrl(href));
        const normalizedText = text.toLowerCase();
        if (normalizedText.includes('floorplan')) {
          expect(href).toContain('productType=plan');
        }
        if (normalizedText.includes('quick move-in')) {
          expect(href).toContain('productType=qmi');
        }
      }
    });
  }

  /** Checks the market links to both plan and quick move-in search results. */
  async validateMarketSearchLinks(): Promise<void> {
    await this.step('Validate market search links', async () => {
      const count = await this.marketSearchLinks.count();
      expect(count, `Market search links not present on ${this.page.url()}`).toBeGreaterThan(0);

      if (!count) {
        return;
      }

      let hasPlanLink = false;
      let hasQmiLink = false;

      for (let i = 0; i < count; i++) {
        const href = await this.marketSearchLinks.nth(i).getAttribute('href');
        expect(href).toBeTruthy();

        await this.reportValue(`Market search link ${i + 1}`, this.buildFullUrl(href));

        const normalizedHref = href!.toLowerCase();
        hasPlanLink = hasPlanLink || normalizedHref.includes('producttype=plan');
        hasQmiLink = hasQmiLink || normalizedHref.includes('producttype=qmi');
        expect(normalizedHref).toContain('/search');
      }

      expect(hasPlanLink, 'Market page should link to plan search results').toBeTruthy();
      expect(hasQmiLink, 'Market page should link to QMI search results').toBeTruthy();
    });
  }
}
