import { expect, Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { BasePage } from './BasePage';

export type ContactOfficeEmail = {
  label: string;
  email: string;
};

export type ContactArea = {
  name: string;
  detailActions: string[];
};

export type ContactCountryConfig = {
  locationKey: LocationKey;
  countryLabel: string;
  urlCountryParam: string;
  expectedTitle: RegExp;
  areas: ContactArea[];
};

export const CONTACT_COUNTRIES: readonly ContactCountryConfig[] = [
  {
    locationKey: 'USA',
    countryLabel: 'USA',
    urlCountryParam: 'USA',
    expectedTitle: /Contact \| Mattamy Homes/i,
    areas: [
      { name: 'CHARLOTTE, NC', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'DALLAS-FORT WORTH, TX', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'FORT LAUDERDALE, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'JACKSONVILLE-ST. AUGUSTINE, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'NAPLES-FORT MYERS, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'ORLANDO, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'PALM BEACH, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'PALM CITY-STUART, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'PHOENIX, AZ', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'PORT ST. LUCIE, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'RALEIGH, NC', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'SARASOTA-BRADENTON, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'TAMPA, FL', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
      { name: 'TUCSON, AZ', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] }
    ]
  },
  {
    locationKey: 'CAN',
    countryLabel: 'Canada',
    urlCountryParam: 'CAN',
    expectedTitle: /Contact( Us)? \| Mattamy Homes/i,
    areas: [
      { name: 'CALGARY, AB', detailActions: ['CUSTOMER CARE', 'SALES OFFICE', 'DESIGN STUDIO'] },
      { name: 'EDMONTON, AB', detailActions: ['CUSTOMER CARE', 'SALES OFFICE', 'DESIGN STUDIO'] },
      { name: 'GREATER TORONTO AREA, ON', detailActions: ['CUSTOMER CARE', 'SALES OFFICE', 'DESIGN STUDIO'] },
      { name: 'KITCHENER-WATERLOO-GUELPH, ON', detailActions: ['CUSTOMER CARE', 'SALES OFFICE', 'DESIGN STUDIO'] },
      { name: 'OTTAWA, ON', detailActions: ['CUSTOMER CARE', 'SALES OFFICE', 'DESIGN STUDIO'] },
      { name: 'SIMCOE, ON', detailActions: ['CUSTOMER CARE', 'SALES OFFICE', 'DESIGN STUDIO'] }
    ]
  }
] as const;

const CORPORATE_OFFICE_EMAILS: readonly ContactOfficeEmail[] = [
  { label: 'Investors', email: 'bondholders@mattamycorp.com' },
  { label: 'Media', email: 'media@mattamycorp.com' },
  { label: 'Trades Canada', email: 'Trades.Canada@mattamycorp.com' },
  { label: 'Trades US', email: 'Trades.US@mattamycorp.com' }
] as const;

export class ContactPage extends BasePage {
  readonly main: Locator;
  readonly heading: Locator;
  readonly countrySelectorHeading: Locator;
  readonly selectedCountryButton: Locator;
  readonly areaHeading: Locator;
  readonly corporateOfficeSection: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);

    this.main = page.locator('main');
    this.heading = page.getByRole('heading', {
      name: /Our team is here for you/i
    });
    this.countrySelectorHeading = page.getByRole('heading', {
      name: /Country Selector/i
    });
    this.selectedCountryButton = this.main.locator('button[aria-label*="Country selector"]').first();
    this.areaHeading = page.getByRole('heading', {
      name: /Please Select Your Area/i
    });
    this.corporateOfficeSection = page
      .getByRole('heading', { name: /Contact Our Corporate Offices/i })
      .locator('xpath=ancestor::section[1]');
    this.footer = page.locator('body');
  }

  async navigateToContact(locationKey: LocationKey): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(locationKey);
    const targetUrl = `${baseURL}/contact?${location.queryParam}`;

    console.log(
      `[NAVIGATE] ENV=${envName} | COUNTRY=${location.country} | URL=${targetUrl}`
    );

    await this.page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000
    });

    await this.acceptCookiesIfPresent();
    await this.waitForPageReady();
  }

  async verifyPageLoaded(config: ContactCountryConfig): Promise<void> {
    await this.waitForPageReady();

    await expect(this.page).toHaveTitle(config.expectedTitle);
    await expect(this.page).toHaveURL(/\/contact/i);
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.main.getByText(/Whether you're interested in a new community/i))
      .toBeVisible();
    await expect(this.countrySelectorHeading).toBeVisible();
    await expect(this.areaHeading).toBeVisible();
    await expect(this.selectedCountryButton).toHaveAttribute(
      'aria-label',
      new RegExp(`Country selector, ${this.escapeRegExp(config.countryLabel)} is selected`, 'i')
    );
  }

  async validateAreaList(config: ContactCountryConfig): Promise<void> {
    const areaButtons = this.getAreaButtons();

    await expect(areaButtons.first()).toBeVisible({ timeout: 15000 });
    await expect(areaButtons, `${config.locationKey} contact area count should match configured markets`)
      .toHaveCount(config.areas.length);

    for (const area of config.areas) {
      const button = this.getAreaButton(area.name);

      await expect(button, `${area.name} contact area should be visible`)
        .toBeVisible();
      await expect(button, `${area.name} should expose an accessible contact-details label`)
        .toHaveAttribute('aria-label', /View contact details of .+ State/i);
    }
  }

  async validateAreaDetails(area: ContactArea): Promise<void> {
    await expect(this.getAreaButton(area.name)).toBeVisible({ timeout: 15000 });
    await this.clickAreaButton(area.name);

    const formattedAreaName = this.toTitleCase(area.name);
    const selectedArea = this.main.getByText(new RegExp(this.escapeRegExp(formattedAreaName), 'i')).last();

    await expect(selectedArea, `${area.name} details heading should appear after selection`)
      .toBeVisible({ timeout: 10000 });

    for (const action of area.detailActions) {
      await expect(this.main.getByText(new RegExp(`^\\s*${this.escapeRegExp(action)}\\s*$`, 'i')).last())
        .toBeVisible();
    }
  }

  async validateCorporateOfficeEmails(): Promise<void> {
    await expect(this.corporateOfficeSection).toBeVisible({ timeout: 15000 });

    for (const officeEmail of CORPORATE_OFFICE_EMAILS) {
      await expect(this.corporateOfficeSection.getByText(officeEmail.label, { exact: true }))
        .toBeVisible();

      const emailLink = this.corporateOfficeSection.getByRole('link', {
        name: new RegExp(this.escapeRegExp(officeEmail.email), 'i')
      });

      await expect(emailLink).toBeVisible();
      await expect(emailLink).toHaveAttribute('href', `mailto:${officeEmail.email}`);
    }
  }

  async validateFooterAndSocialLinks(config: ContactCountryConfig): Promise<void> {
    await expect(this.footer).toBeVisible({ timeout: 15000 });

    const expectedFooterLinks = [
      { name: 'Find My Home', href: '/search' },
      { name: 'Customer Care', href: '/customer-care' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy-policies' },
      { name: 'Terms and Conditions', href: '/terms-and-conditions' }
    ];

    for (const footerLink of expectedFooterLinks) {
      const link = this.footer.getByRole('link', {
        name: new RegExp(`^${this.escapeRegExp(footerLink.name)}`, 'i')
      }).first();

      await expect(link, `${footerLink.name} footer link should be visible`).toBeVisible();
      await expect(link).toHaveAttribute('href', new RegExp(this.escapeRegExp(footerLink.href), 'i'));
    }

    const facebookHref = config.locationKey === 'USA'
      ? /facebook\.com\/MattamyHomesUSA/i
      : /facebook\.com\/MattamyHomes$/i;

    await expect(this.footer.getByRole('link', { name: /Facebook/i }))
      .toHaveAttribute('href', facebookHref);
    await expect(this.footer.getByRole('link', { name: /Instagram/i }))
      .toHaveAttribute('href', /instagram\.com\/mattamyhomes/i);
    await expect(this.footer.getByRole('link', { name: /Youtube/i }))
      .toHaveAttribute('href', /youtube\.com\/user\/MattamyHomesOnline/i);
    await expect(this.footer.getByRole('link', { name: /Linkedin/i }))
      .toHaveAttribute('href', /linkedin\.com\/company\/mattamy-homes/i);
  }

  private getAreaButtons(): Locator {
    return this.main.locator('button[aria-label^="View contact details of"]');
  }

  private getAreaButton(areaName: string): Locator {
    return this.getAreaButtons().filter({
      hasText: new RegExp(`^\\s*${this.escapeRegExp(areaName)}\\s*$`, 'i')
    }).first();
  }

  private async clickAreaButton(areaName: string): Promise<void> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const areaButton = this.getAreaButton(areaName);

      const clicked = await areaButton
        .click({ force: true, timeout: 10000 })
        .then(() => true)
        .catch(() => false);

      if (clicked) {
        return;
      }

      await this.page.waitForLoadState('domcontentloaded');
    }

    throw new Error(`Unable to select contact area: ${areaName}`);
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toTitleCase(value: string): string {
    return value
      .toLowerCase()
      .split(/(\s+|-)/)
      .map((part) => {
        if (/^\s+$|-$/.test(part) || part.length <= 2) {
          return part.toUpperCase();
        }

        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  }
}
