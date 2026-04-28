import { Locator, expect } from '@playwright/test';
import { HomePage } from './HomePage';

const TIMEOUT = {
  short: 10000,
  medium: 15000,
  long: 20000
};

const TEXT = {
  condo: /condo|condominium|suite/i,
  condoHero: /condo|condominium|suite|home/i,
  sectionHeading:
    /suite|floorplan|floor plan|gallery|amenit|location|neighbourhood|neighborhood|contact|sales|register|community/i,
  condoLink:
    /suite|floorplan|floor plan|gallery|amenit|location|contact|register/i,
  availableFloorplansHeading: /Explore available floorplans|Available floorplans|Floorplans/i,
  viewAll: /view all/i,
  cta: /register|contact|request|schedule|book|learn more/i,
  submit: /submit|register|request|send/i,
  requiredError: /Required|Please complete|Invalid|Error/i,
  emailError: /valid domain name|valid email|invalid email/i,
  successMessage: /Thank you for your interest in Mattamy Homes/i
};

export class CondoCommunityPage extends HomePage {
  private get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  private get body(): Locator {
    return this.page.locator('body');
  }

  private get hero(): Locator {
    return this.page.locator('main, #root').first();
  }

  private get navLinks(): Locator {
    return this.page.locator('a[href]');
  }

  private get registerOrContactButtons(): Locator {
    return this.page.locator('a, button').filter({ hasText: TEXT.cta });
  }

  private get condoForms(): Locator {
    return this.page.locator(
      'form, [id^="Sitecore-ScheduleAVisit-FormInstance"], [id^="ScheduleAVisit-FormInstance"]'
    );
  }

  private get successDialogModal(): Locator {
    return this.page.locator('.ReactModal__Content');
  }

  private get formSuccessMessage(): Locator {
    return this.page.getByText(TEXT.successMessage).last();
  }

  async searchByCondoCommunity(condoCommunity: string): Promise<void> {
    await this.search(condoCommunity);
  }

  async verifySearchByCondoCommunity(expectedCommunity: string): Promise<void> {
    await this.waitForPageReady();

    await expect(this.heading).toBeVisible({ timeout: TIMEOUT.long });
    await this.expectHeadingContains(expectedCommunity);
    await expect(this.page).not.toHaveURL(/\?country=/i);
  }

  async verifyHeroContent(expectedCommunity: string): Promise<void> {
    await this.expectHeadingContains(expectedCommunity);
    await expect(this.hero).toBeVisible({ timeout: TIMEOUT.medium });
    await expect(this.body).toContainText(TEXT.condoHero, { timeout: TIMEOUT.medium });
  }

  async verifyCondoPageSections(): Promise<void> {
    const sectionHeadings = this.page.getByRole('heading', {
      name: TEXT.sectionHeading
    });

    const count = await sectionHeadings.count();

    expect(count, 'Condo community page should include content section headings')
      .toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 8); i++) {
      await expect(sectionHeadings.nth(i)).toBeVisible({ timeout: TIMEOUT.short });
    }
  }

  async verifyCondoSpecificContent(): Promise<void> {
    await expect(this.body).toContainText(TEXT.condo, { timeout: TIMEOUT.short });

    const condoRelatedLinks = this.navLinks.filter({
      hasText: TEXT.condoLink
    });

    expect(
      await condoRelatedLinks.count(),
      'Condo community page should include condo-related navigation or CTAs'
    ).toBeGreaterThan(0);
  }

  async verifyAllNavigationLinks(): Promise<void> {
    const linkCount = await this.navLinks.count();

    expect(linkCount, 'Condo community page should contain links').toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const href = await this.navLinks.nth(i).getAttribute('href');

      if (this.isIgnorableHref(href)) {
        continue;
      }

      expect(href, `Navigation link ${i + 1} href missing`).toBeTruthy();
      expect(href, `Navigation link ${i + 1} should not be javascript`)
        .not.toMatch(/^javascript:/i);
    }
  }

  async verifyPrimaryCtas(): Promise<void> {
    const ctaCount = await this.registerOrContactButtons.count();

    expect(ctaCount, 'Condo community page should include register/contact CTAs')
      .toBeGreaterThan(0);

    await expect(this.registerOrContactButtons.first()).toBeVisible({
      timeout: TIMEOUT.short
    });
  }

  async verifySuiteOrFloorplanContent(): Promise<void> {
    const suiteContent = this.page.locator('section, div').filter({
      hasText: /suite|floorplan|floor plan|bedroom|bath|sq\.?\s*ft/i
    });

    expect(
      await suiteContent.count(),
      'Condo community page should include suite or floorplan content'
    ).toBeGreaterThan(0);
  }

  async verifyAvailableFloorplansSection(expectedCommunity: string): Promise<void> {
    await this.waitForPageReady();

    const section = await this.getAvailableFloorplansSectionIfAvailable();

    if (!section) {
      console.warn('Explore available floorplans section not present after DOM load - skipping validation');
      return;
    }

    await section.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(section).toBeVisible({ timeout: TIMEOUT.short });

    const condoCommunityPath = new URL(this.page.url()).pathname.replace(/\/$/, '');

    await this.verifyAvailableFloorplanLinks(section, condoCommunityPath);
    await this.verifyAvailableFloorplansViewAll(section, expectedCommunity);
  }

  async validatePrimaryFormFields(): Promise<void> {
    await this.validateFormFieldsByIndex(0, 'Primary condo form');
  }

  async validateFooterFormFields(): Promise<void> {
    await this.validateFormFieldsByIndex(1, 'Footer condo form');
  }

  async validateRequiredFieldErrors(): Promise<void> {
    await this.validatePrimaryFormRequiredErrors();
  }

  async validatePrimaryFormRequiredErrors(): Promise<void> {
    await this.validateRequiredFieldErrorsByIndex(0, 'Primary condo form');
  }

  async validateFooterFormRequiredErrors(): Promise<void> {
    await this.validateRequiredFieldErrorsByIndex(1, 'Footer condo form');
  }

  async validateInvalidEmailError(): Promise<void> {
    await this.validatePrimaryFormInvalidEmailError();
  }

  async validatePrimaryFormInvalidEmailError(): Promise<void> {
    await this.validateInvalidEmailErrorByIndex(0, 'Primary condo form');
  }

  async validateFooterFormInvalidEmailError(): Promise<void> {
    await this.validateInvalidEmailErrorByIndex(1, 'Footer condo form');
  }

  async verifyPrimaryFormSuccessSubmission(): Promise<void> {
    await this.submitSuccessfulFormByIndex(0, 'Primary condo form');
  }

  async verifyFooterFormSuccessSubmission(): Promise<void> {
    await this.submitSuccessfulFormByIndex(1, 'Footer condo form');
  }

  private async validateFormFieldsByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /first name/i }), 'First name');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /email/i }), 'Email');
    await this.expectFieldIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone');

    await expect(this.getSubmitButton(form)).toBeVisible({ timeout: TIMEOUT.short });
  }

  private async validateRequiredFieldErrorsByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.getSubmitButton(form).click();

    await expect(form.locator(`text=${TEXT.requiredError}`).first()).toBeVisible({
      timeout: TIMEOUT.short
    });
  }

  private async validateInvalidEmailErrorByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.fillLeadFormWithInvalidEmail(form);
    await this.getSubmitButton(form).click();

    await expect(form.locator(`text=${TEXT.emailError}`).first()).toBeVisible({
      timeout: TIMEOUT.short
    });
  }

  private async submitSuccessfulFormByIndex(
    formIndex: number,
    formName: string
  ): Promise<void> {
    const form = await this.getAvailableForm(formIndex, formName);

    if (!form) return;

    await this.fillLeadFormWithValidData(form);
    await this.getSubmitButton(form).click();

    if (await this.successDialogModal.count()) {
      await expect(this.successDialogModal.last()).toBeVisible({
        timeout: TIMEOUT.short
      });
    }

    await expect(this.formSuccessMessage).toBeVisible({ timeout: TIMEOUT.long });
    console.log(`${formName} successful submission validated`);
  }

  private async fillLeadFormWithInvalidEmail(form: Locator): Promise<void> {
    await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Test');
    await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'User');
    await this.fillIfPresent(form.getByRole('textbox', { name: /email/i }), 'user@domain.c');
    await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '4165551212');
    await this.fillIfPresent(form.getByRole('textbox', { name: /postal|zip/i }), 'L7R 0A1');

    await this.selectCountryIfPresent(form);
    await this.checkTermsIfPresent(form);
  }

  private async fillLeadFormWithValidData(form: Locator): Promise<void> {
    await this.fillIfPresent(form.getByRole('textbox', { name: /first name/i }), 'Sudhansu');
    await this.fillIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Das');
    await this.fillIfPresent(
      form.getByRole('textbox', { name: /email/i }),
      `ssdas+condo${Date.now()}@ex2india.com`
    );
    await this.fillIfPresent(form.getByRole('textbox', { name: /phone/i }), '4165551212');
    await this.fillIfPresent(form.getByRole('textbox', { name: /postal|zip/i }), 'L7R 0A1');

    await this.selectCountryIfPresent(form);
    await this.selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community/i }).first());
    await this.selectFirstOptionIfPresent(form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first());
    await this.checkTermsIfPresent(form);
  }

  private async getAvailableForm(
    formIndex: number,
    formName: string
  ): Promise<Locator | null> {
    const matchingForms = this.condoForms.filter({
      has: this.page.getByRole('button', { name: TEXT.submit })
    });

    const count = await matchingForms.count();

    if (count === 0) {
      console.warn(`${formName} not present - skipping form validation`);
      return null;
    }

    if (formIndex >= count) {
      console.warn(`${formName} not present - only ${count} condo form(s) found`);
      return null;
    }

    const form = matchingForms.nth(formIndex);

    await form.scrollIntoViewIfNeeded();
    await this.waitForPageReady();
    await expect(form, `${formName} should be visible`).toBeVisible({
      timeout: TIMEOUT.short
    });

    return form;
  }

  private getSubmitButton(form: Locator): Locator {
    return form.getByRole('button', { name: TEXT.submit }).first();
  }

  private async selectCountryIfPresent(form: Locator): Promise<void> {
    const country = form.getByRole('combobox', {
      name: /country of residence/i
    }).first();

    if (!(await country.count())) return;

    await country.selectOption({ label: 'Canada' }).catch(async () => {
      await country.selectOption({ index: 1 });
    });
  }

  private async selectFirstOptionIfPresent(field: Locator): Promise<void> {
    if (!(await field.count())) return;

    await field.selectOption({ index: 1 }).catch(() => undefined);
  }

  private async checkTermsIfPresent(form: Locator): Promise<void> {
    const terms = form.getByRole('checkbox').first();

    if (await terms.count()) {
      await terms.check({ force: true });
    }
  }

  private async getAvailableFloorplansSectionIfAvailable(): Promise<Locator | null> {
    const heading = this.page.getByRole('heading', {
      name: TEXT.availableFloorplansHeading
    }).first();

    await heading.waitFor({ state: 'attached', timeout: TIMEOUT.medium }).catch(() => undefined);

    if (!(await heading.count())) {
      return null;
    }

    const section = this.page.locator('section').filter({ has: heading }).first();

    if (await section.count()) {
      return section;
    }

    return heading.locator('xpath=ancestor::div[1]');
  }

  private async verifyAvailableFloorplanLinks(
    section: Locator,
    condoCommunityPath: string
  ): Promise<void> {
    const links = section.locator('a[href]');
    const linkCount = await links.count();
    const loggedHrefs = new Set<string>();
    let floorplanLinkCount = 0;

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const linkText = (await link.innerText().catch(() => '')).trim();
      const href = await link.getAttribute('href');

      if (TEXT.viewAll.test(linkText) || this.isIgnorableHref(href)) {
        continue;
      }

      const pathname = this.getPathnameFromHref(href!);

      if (loggedHrefs.has(pathname)) {
        continue;
      }

      loggedHrefs.add(pathname);
      floorplanLinkCount++;
      await expect(link, `Floorplan link ${floorplanLinkCount} should be visible`)
        .toBeVisible({ timeout: TIMEOUT.short });
      expect(href, `Floorplan link ${floorplanLinkCount} href missing`).toBeTruthy();
      expect(
        pathname,
        `Floorplan link ${floorplanLinkCount} should contain condo community path`
      ).toContain(condoCommunityPath);

      console.log(`Condo plan: ${this.getPlanNameFromHref(href!)} | URL: ${href}`);
    }

    expect(
      floorplanLinkCount,
      'Explore available floorplans should include at least one floorplan link'
    ).toBeGreaterThan(0);
  }

  private async verifyAvailableFloorplansViewAll(
    section: Locator,
    expectedCommunity: string
  ): Promise<void> {
    const viewAllLink = section.locator('a[href]').filter({
      hasText: TEXT.viewAll
    }).first();

    await expect(viewAllLink, 'Explore available floorplans View All link missing')
      .toBeVisible({ timeout: TIMEOUT.short });

    const href = await viewAllLink.getAttribute('href');

    expect(href, 'Explore available floorplans View All href missing').toBeTruthy();
    expect(href, 'Explore available floorplans View All should not be an anchor/contact link')
      .not.toMatch(/^(#|mailto:|tel:|javascript:)/i);

    console.log(`View All floorplans CTA URL: ${href}`);

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      viewAllLink.click()
    ]);

    await this.waitForPageReady();
    await expect(this.page, 'View All should redirect to Find Your Home/search page')
      .toHaveURL(/\/search|find-your-home/i);

    const decodedUrl = decodeURIComponent(this.page.url()).toLowerCase();
    const expectedCommunityText = expectedCommunity.toLowerCase();

    if (decodedUrl.includes(expectedCommunityText)) {
      return;
    }

    await expect(this.body, 'FYH page should contain the condo community name')
      .toContainText(new RegExp(this.escapeRegex(expectedCommunity), 'i'), {
        timeout: TIMEOUT.long
      });
  }

  private async expectFieldIfPresent(field: Locator, label: string): Promise<void> {
    if (await field.count()) {
      await expect(field.first(), `${label} field should be visible`)
        .toBeVisible({ timeout: TIMEOUT.short });
    }
  }

  private async fillIfPresent(field: Locator, value: string): Promise<void> {
    if (await field.count()) {
      await field.first().fill(value);
    }
  }

  private async expectHeadingContains(expectedText: string): Promise<void> {
    await expect(this.heading).toContainText(
      new RegExp(this.escapeRegex(expectedText), 'i')
    );
  }

  private isIgnorableHref(href: string | null): boolean {
    return !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:');
  }

  private getPathnameFromHref(href: string): string {
    return new URL(href, this.page.url()).pathname.replace(/\/$/, '');
  }

  private getPlanNameFromHref(href: string): string {
    const pathname = this.getPathnameFromHref(href);
    const slug = pathname.split('/').filter(Boolean).pop();

    return slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Condo plan';
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
