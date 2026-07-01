import { Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { escapeRegex } from '../utils/pageObjectUtils';
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
      { name: 'CLOVER, SC', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
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
      { name: 'ROCK HILL, SC', detailActions: ['CUSTOMER CARE', 'NEW HOME GALLERY', 'DESIGN STUDIO'] },
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

  /** Initializes this page object and its locators. */
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

  /** Navigates to contact. */
  async navigateToContact(locationKey: LocationKey): Promise<void> {
    await this.step(`Navigate to Contact page (${locationKey})`, async () => {
      const { baseURL } = getEnvConfig();
      const location = getLocationConfig(locationKey);
      const targetUrl = `${baseURL}/contact?${location.queryParam}`;

      await this.reportValue('Target URL', targetUrl);

      await this.page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000
      });

      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
    });
  }

  /** Verifies page loaded. */
  async verifyPageLoaded(config: ContactCountryConfig): Promise<void> {
    await this.step(`Verify Contact page loaded (${config.locationKey})`, async () => {
      await this.waitForPageReady();

      await this.assertPageTitle(config.expectedTitle, `${config.locationKey} Contact page title should match`);
      await this.assertPageUrl(/\/contact/i, `${config.locationKey} Contact page URL should match`);
      await this.assertVisible(this.heading, 'Contact page heading should be visible', 15_000);
      await this.assertVisible(
        this.main.getByText(/Whether you're interested in a new community/i),
        'Contact hero copy should be visible'
      );
      await this.assertVisible(this.countrySelectorHeading, 'Contact country selector heading should be visible');
      await this.assertVisible(this.areaHeading, 'Contact area heading should be visible');
      await this.assertAttribute(
        this.selectedCountryButton,
        'aria-label',
        new RegExp(`Country selector, ${escapeRegex(config.countryLabel)} is selected`, 'i'),
        `${config.countryLabel} should be selected in the Contact country selector`
      );
    });
  }

  /** Validates area list. */
  async validateAreaList(config: ContactCountryConfig): Promise<void> {
    await this.step(`Validate Contact area list (${config.locationKey})`, async () => {
      const areaButtons = this.getAreaButtons();

      await this.assertVisible(areaButtons.first(), `${config.locationKey} contact areas should render`, 15_000);
      await this.assertCount(
        areaButtons,
        config.areas.length,
        `${config.locationKey} contact area count should match configured markets`
      );

      for (const [index, area] of config.areas.entries()) {
        const button = this.getAreaButton(area.name);

        await this.assertVisible(button, `${area.name} contact area should be visible`);
        await this.assertAttribute(
          button,
          'aria-label',
          /View contact details of .+ State/i,
          `${area.name} should expose an accessible contact-details label`
        );

        await this.reportValue(`Area ${index + 1}`, area.name);
      }
    });
  }

  /** Validates area details. */
  async validateAreaDetails(area: ContactArea): Promise<void> {
    await this.step(`Validate Contact area details: ${area.name}`, async () => {
      await this.assertVisible(this.getAreaButton(area.name), `${area.name} contact area should be visible`, 15_000);
      await this.clickAreaButton(area.name);

      const formattedAreaName = this.toTitleCase(area.name);
      const selectedArea = this.main.getByText(new RegExp(escapeRegex(formattedAreaName), 'i')).last();

      await this.assertVisible(selectedArea, `${area.name} details heading should appear after selection`);

      for (const action of area.detailActions) {
        await this.assertVisible(
          this.main.getByText(new RegExp(`^\\s*${escapeRegex(action)}\\s*$`, 'i')).last(),
          `${area.name} details should show action: ${action}`
        );
      }
    });
  }

  /** Validates corporate office emails. */
  async validateCorporateOfficeEmails(): Promise<void> {
    await this.step('Validate corporate office emails', async () => {
      await this.assertVisible(this.corporateOfficeSection, 'Corporate office section should be visible', 15_000);

      for (const officeEmail of CORPORATE_OFFICE_EMAILS) {
        await this.assertVisible(
          this.corporateOfficeSection.getByText(officeEmail.label, { exact: true }),
          `${officeEmail.label} corporate office email label should be visible`
        );

        const emailLink = this.corporateOfficeSection.getByRole('link', {
          name: new RegExp(escapeRegex(officeEmail.email), 'i')
        });

        await this.assertVisible(emailLink, `${officeEmail.email} email link should be visible`);
        await this.assertAttribute(
          emailLink,
          'href',
          `mailto:${officeEmail.email}`,
          `${officeEmail.email} email link should use a mailto href`
        );

        await this.reportValue(officeEmail.label, `mailto:${officeEmail.email}`);
      }
    });
  }

  /** Validates footer and social links. */
  async validateFooterAndSocialLinks(config: ContactCountryConfig): Promise<void> {
    await this.step(`Validate footer and social links (${config.locationKey})`, async () => {
      await this.assertVisible(this.footer, 'Contact page footer should be visible', 15_000);

      const expectedFooterLinks = [
        { name: 'Find My Home', href: '/search' },
        { name: 'Customer Care', href: '/customer-care' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy-policies' },
        { name: 'Terms and Conditions', href: '/terms-and-conditions' }
      ];

      for (const footerLink of expectedFooterLinks) {
        const link = this.footer.getByRole('link', {
          name: new RegExp(`^${escapeRegex(footerLink.name)}`, 'i')
        }).first();

        await this.assertVisible(link, `${footerLink.name} footer link should be visible`);
        await this.assertAttribute(
          link,
          'href',
          new RegExp(escapeRegex(footerLink.href), 'i'),
          `${footerLink.name} footer link should point to ${footerLink.href}`
        );

        await this.reportValue(`Footer link: ${footerLink.name}`, this.buildFullUrl(footerLink.href));
      }

      const facebookHref = config.locationKey === 'USA'
        ? /facebook\.com\/MattamyHomesUSA/i
        : /facebook\.com\/MattamyHomes$/i;

      await this.assertAttribute(
        this.footer.getByRole('link', { name: /Facebook/i }),
        'href',
        facebookHref,
        'Facebook footer link should point to the configured Mattamy page'
      );
      await this.assertAttribute(
        this.footer.getByRole('link', { name: /Instagram/i }),
        'href',
        /instagram\.com\/mattamyhomes/i,
        'Instagram footer link should point to Mattamy Homes'
      );
      await this.assertAttribute(
        this.footer.getByRole('link', { name: /Youtube/i }),
        'href',
        /youtube\.com\/user\/MattamyHomesOnline/i,
        'Youtube footer link should point to Mattamy Homes Online'
      );
      await this.assertAttribute(
        this.footer.getByRole('link', { name: /Linkedin/i }),
        'href',
        /linkedin\.com\/company\/mattamy-homes/i,
        'Linkedin footer link should point to Mattamy Homes'
      );
    });
  }

  /** Returns area buttons. */
  private getAreaButtons(): Locator {
    return this.main.locator('button[aria-label^="View contact details of"]:visible');
  }

  /** Returns area button. */
  private getAreaButton(areaName: string): Locator {
    return this.getAreaButtons().filter({
      hasText: new RegExp(`^\\s*${escapeRegex(areaName)}\\s*$`, 'i')
    }).first();
  }

  /** Clicks area button. */
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

  /** Converts text to title case. */
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
