import { Locator, Page, expect } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { escapeRegex, getNormalizedText } from '../utils/pageObjectUtils';
import {
  clickSubmit,
  expectInvalidEmailErrorInForm,
  expectRequiredErrorsInForm,
  fillLeadFormByFormId,
  fillLeadFormFields,
  getSubmitButton,
  getInvalidLeadData,
  getValidLeadData,
} from '../utils/leadFormHelper';
import { BasePage } from './BasePage';

export interface MarketConfig {
  name: string;
  url: string;
}

export class MarketPage extends BasePage {
  /** Locator: main market page heading. */
  readonly heading: Locator;

  /** Locator: market hero/header section. */
  readonly heroSection: Locator;

  /** Locator: community cards section. */
  readonly communitySection: Locator;

  /** Locator: market lead form container. */
  readonly leadForm: Locator;

  /** Locator: Discover Our Homes section heading. */
  readonly discoverOurHomesSection: Locator;

  /** Locator: search links for plans and quick move-in homes. */
  readonly marketSearchLinks: Locator;

  /** Locator: React modal shown after successful form submission. */
  readonly successDialogModal: Locator;

  /** Setup: initialize market page locators. */
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

  /* ==========================================================
       UTIL HELPERS
    ========================================================== */

  /** Helper: return community card list items that contain links. */
  private getCommunityCards(section = this.communitySection): Locator {
    return section.locator('li').filter({
      has: this.page.locator('a[href]'),
    });
  }

  /** Helper: extract a community card title. */
  private async getCommunityCardTitle(card: Locator): Promise<string> {
    const title = card.locator('h2, h3, h4, a div.block, a').first();
    return getNormalizedText(title);
  }

  /** Helper: build a heading matcher from configured market aliases. */
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

  /** Helper: build URL matcher including known canonical redirects. */
  private getMarketUrlPattern(market: MarketConfig): RegExp {
    const paths = [market.url];

    if (market.url === '/florida/sarasota-bradenton') {
      paths.push('/florida/sarasota');
    }

    return new RegExp(`(?:${paths.map((path) => escapeRegex(path)).join('|')})(?:\\?.*)?$`, 'i');
  }

  /** Helper: find the market community cards section across supported page layouts. */
  private async getCommunitySectionIfAvailable(): Promise<Locator | null> {
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

  /** Helper: find the Discover Our Homes section when it exists. */
  private async getDiscoverOurHomesSectionIfAvailable(): Promise<Locator | null> {
    await this.discoverOurHomesSection
      .waitFor({ state: 'attached', timeout: 5000 })
      .catch(() => undefined);

    if (!(await this.discoverOurHomesSection.count())) {
      return null;
    }

    return this.discoverOurHomesSection.locator('xpath=ancestor::section[1]');
  }

  /** Helper: return a visible community cards section and prepare it for card assertions. */
  private async getVisibleCommunitySection(): Promise<Locator | null> {
    const communitySection = await this.getCommunitySectionIfAvailable();

    if (!communitySection || !(await this.isSectionVisible(communitySection))) {
      return null;
    }

    await this.prepareSection(communitySection);

    return communitySection;
  }

  /** Helper: scroll a section into view and wait for the page to stabilize. */
  private async prepareSection(section: Locator): Promise<void> {
    await section.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
  }

  /** Locator: lead form success confirmation message. */
  private get formSuccessMessage(): Locator {
    return this.page.getByText(/Thank you for your interest in Mattamy Homes/i).last();
  }

  /* ==========================================================
       NAVIGATION
    ========================================================== */

  /** Action: navigate directly to a market page using its relative URL. */
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
      await this.ensureConfiguredCountrySelected();
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent();
    });
  }

  /* ==========================================================
       MARKET PAGE VALIDATION
    ========================================================== */

  /** Verify: market page URL and heading match expected market configuration. */
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

  /** Verify: market hero content, hero image, and search CTAs are present. */
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

  /* ==========================================================
       COMMUNITY CARDS (DETAILED)
    ========================================================== */

  /** Verify: community cards exist and log their names and URLs. */
  async validateCommunityCards(): Promise<void> {
    await this.step('Validate community cards are listed', async () => {
      const communitySection = await this.getVisibleCommunitySection();

      if (!communitySection) {
        await this.reportValue('Community Cards section not present');
        return;
      }
      const cards = this.getCommunityCards(communitySection);

      const count = await cards.count();
      this.assertGreaterThan(count, 0, 'Market page should list community cards');

      await this.reportValue(`Found ${count} community card(s)`);
    });
  }

  /** Verify: each community card has a title, href, and image source when present. */
  async validateCommunityCardDetails(): Promise<void> {
    await this.step('Validate community card details', async () => {
      const communitySection = await this.getVisibleCommunitySection();

      if (!communitySection) {
        await this.reportValue('Community Cards section not present');
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

  /** Verify: first community card navigates to its community page. */
  async validateFirstCommunityCardNavigation(): Promise<void> {
    await this.step('Validate first community card navigation', async () => {
      const communitySection = await this.getVisibleCommunitySection();

      if (!communitySection) {
        await this.reportValue('Community Cards section not present');
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

  /* ==========================================================
       LEAD FORM VALIDATION
    ========================================================== */

  /** Verify: lead form invalid-data behavior for the market page. */
  async validateLeadForm(marketName: string): Promise<void> {
    await this.validateLeadFormInvalidData(marketName);
  }

  /** Helper: return the visible market lead form when available. */
  private async getAvailableLeadForm(marketName: string): Promise<Locator | null> {
    await this.waitForPageReady();

    const form = this.leadForm.first();

    if (!(await form.count())) {
      await this.reportValue(`No lead form available on ${marketName} - skipping form validation`);
      return null;
    }

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();

    await expect(form, `Lead form not in viewport on ${marketName}`).toBeInViewport({
      timeout: 10000,
    });
    await this.assertVisible(form, `Lead form not visible on ${marketName}`);

    return form;
  }

  /** Helper: return all fields used by the market lead form. */
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

  /** Helper: assert every market lead form field is visible. */
  private async expectLeadFormFieldsVisible(
    fields: ReturnType<MarketPage['getLeadFormFields']>,
  ): Promise<void> {
    for (const field of Object.values(fields)) {
      await expect(field).toBeVisible({ timeout: 10000 });
    }
  }

  /** Verify: market lead form shows required errors when submitted empty. */
  async validateLeadFormRequiredErrors(marketName: string): Promise<void> {
    await this.step(`Validate lead form required errors: ${marketName}`, async () => {
      const form = await this.getAvailableLeadForm(marketName);

      if (!form) {
        return;
      }

      const fields = this.getLeadFormFields(form);

      await this.expectLeadFormFieldsVisible(fields);
      await clickSubmit(this.page, form);
      await expectRequiredErrorsInForm(form);
      await expect(
        form.locator('text=/Community of Interest.*Required|Community.*Required/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });
  }

  /** Verify: market lead form rejects invalid email data. */
  async validateLeadFormInvalidData(marketName: string): Promise<void> {
    await this.step(`Validate lead form invalid data: ${marketName}`, async () => {
      const form = await this.getAvailableLeadForm(marketName);

      if (!form) {
        return;
      }

      const fields = this.getLeadFormFields(form);

      await this.expectLeadFormFieldsVisible(fields);
      const invalid = getInvalidLeadData('market');

      await fillLeadFormFields(form, invalid, { selectCommunity: true });

      await getSubmitButton(form).click();

      await expectInvalidEmailErrorInForm(form);
    });
  }

  /** Verify: market lead form can be submitted successfully. */
  async submitLeadFormSuccessfully(marketName: string): Promise<void> {
    await this.step(`Submit lead form successfully: ${marketName}`, async () => {
      const form = await this.getAvailableLeadForm(marketName);

      if (!form) {
        return;
      }

      const fields = this.getLeadFormFields(form);

      await this.expectLeadFormFieldsVisible(fields);
      const valid = getValidLeadData('market');

      // Check the form id first, then fill: Canada forms also get the four extra fields.
      await fillLeadFormByFormId(form, valid, { selectCommunity: true });

      await this.submitLeadFormAndCaptureApi({
        formName: `${marketName} market lead form`,
        submitButton: getSubmitButton(form),
        successModal: this.successDialogModal,
        successMessage: this.formSuccessMessage,
        validateApiResponse: true,
      });
    });
  }

  /* ==========================================================
       DISCOVER OUR HOMES
    ========================================================== */

  /** Verify: Discover Our Homes section links point to expected search result types. */
  async validateDiscoverOurHomesSection(): Promise<void> {
    await this.step('Validate Discover Our Homes section links', async () => {
      await this.waitForPageReady();
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const section = await this.getDiscoverOurHomesSectionIfAvailable();

      const isVisible = !!section && (await this.isSectionVisible(section));

      if (!isVisible) {
        await this.reportValue(`Discover Our Homes section not present on ${this.page.url()}`);
        return;
      }

      await section.scrollIntoViewIfNeeded();
      await this.waitForPageReady();
      const links = section.locator('a');
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

  /** Verify: market search links include both plan and QMI search result links. */
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
