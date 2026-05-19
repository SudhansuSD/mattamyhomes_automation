import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { getEnvConfig } from '../config/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations';

export type CustomerCareArea = {
  name: string;
  expectedDetails: string[];
};

export type CustomerCareResourceLink = {
  name: string;
  hrefContains: string;
};

export type CustomerCareCountryConfig = {
  locationKey: LocationKey;
  countryLabel: string;
  expectedTitle: RegExp;
  expectedHeading: RegExp;
  heroCopy: RegExp;
  areas: CustomerCareArea[];
  resourceLinks: CustomerCareResourceLink[];
};

export const CUSTOMER_CARE_COUNTRIES: readonly CustomerCareCountryConfig[] = [
  {
    locationKey: 'USA',
    countryLabel: 'USA',
    expectedTitle: /Customer Care \| Mattamy Homes/i,
    expectedHeading: /^Customer Care$/i,
    heroCopy: /Mattamy Homes strives to provide the best homeowner experience/i,
    areas: [
      { name: 'CHARLOTTE, NC', expectedDetails: ['Customer Care for the Charlotte, NC Area', 'Charlotte Customer Care'] },
      { name: 'DALLAS-FORT WORTH, TX', expectedDetails: ['Customer Care for the Dallas-Fort Worth, TX Area'] },
      { name: 'FORT LAUDERDALE, FL', expectedDetails: ['Customer Care for the Fort Lauderdale, FL Area'] },
      { name: 'JACKSONVILLE-ST. AUGUSTINE, FL', expectedDetails: ['Customer Care for the Jacksonville-St. Augustine, FL Area'] },
      { name: 'NAPLES-FORT MYERS, FL', expectedDetails: ['Customer Care for the Naples-Fort Myers, FL Area'] },
      { name: 'ORLANDO, FL', expectedDetails: ['Customer Care for the Orlando, FL Area'] },
      { name: 'PALM BEACH, FL', expectedDetails: ['Customer Care for the Palm Beach, FL Area'] },
      { name: 'PALM CITY-STUART, FL', expectedDetails: ['Customer Care for the Palm City-Stuart, FL Area'] },
      { name: 'PHOENIX, AZ', expectedDetails: ['Customer Care for the Phoenix, AZ Area'] },
      { name: 'PORT ST. LUCIE, FL', expectedDetails: ['Customer Care for the Port St. Lucie, FL Area'] },
      { name: 'RALEIGH, NC', expectedDetails: ['Customer Care for the Raleigh, NC Area'] },
      { name: 'SARASOTA-BRADENTON, FL', expectedDetails: ['Customer Care for the Sarasota-Bradenton, FL Area'] },
      { name: 'TAMPA, FL', expectedDetails: ['Customer Care for the Tampa, FL Area'] },
      { name: 'TUCSON, AZ', expectedDetails: ['Customer Care for the Tucson, AZ Area'] }
    ],
    resourceLinks: [
      { name: 'Warranty Manual PDF', hrefContains: 'warranty-manual' }
    ]
  },
  {
    locationKey: 'CAN',
    countryLabel: 'Canada',
    expectedTitle: /Customer Care \| Mattamy Homes/i,
    expectedHeading: /^Homeowner Support$/i,
    heroCopy: /Providing you with the support you need 24\/7/i,
    areas: [
      { name: 'CALGARY, AB', expectedDetails: ['Customer Care for the Calgary, AB Area', 'Carrington Customer Care', 'Carrington Warranty'] },
      { name: 'EDMONTON, AB', expectedDetails: ['Customer Care for the Edmonton, AB Area'] },
      { name: 'GREATER TORONTO AREA, ON', expectedDetails: ['Customer Care for the Greater Toronto Area, ON Area'] },
      { name: 'KITCHENER-WATERLOO-GUELPH, ON', expectedDetails: ['Customer Care for the Kitchener-Waterloo-Guelph, ON Area'] },
      { name: 'OTTAWA, ON', expectedDetails: ['Customer Care for the Ottawa, ON Area'] },
      { name: 'SIMCOE, ON', expectedDetails: ['Customer Care for the Simcoe, ON Area'] }
    ],
    resourceLinks: [
      { name: 'Alberta', hrefContains: '/customer-care/alberta-warranty' },
      { name: 'Ontario', hrefContains: '/customer-care/ontario-warranty' },
      { name: 'Go To After Hours Support', hrefContains: '/customer-care/after-hours-support' },
      { name: 'Watch Videos', hrefContains: '/customer-care/caring-for-your-home' },
      { name: 'Seasonal Checklist - Spring Download PDF', hrefContains: 'seasonalchecklist-spring-pdf' },
      { name: 'Seasonal Checklist - Summer Download PDF', hrefContains: 'seasonalchecklist-summer-pdf' },
      { name: 'Seasonal Checklist - Fall Download PDF', hrefContains: 'seasonalchecklist-fall-pdf' },
      { name: 'Seasonal Checklist - Winter Download PDF', hrefContains: 'seasonalchecklist-winter-pdf' }
    ]
  }
] as const;

type ServiceRequestField = {
  label: string;
  selector: string;
};

const REQUIRED_SERVICE_REQUEST_FIELDS: readonly ServiceRequestField[] = [
  { label: 'First name', selector: 'input[aria-label^="First name*"]' },
  { label: 'Last name', selector: 'input[aria-label^="Last name*"]' },
  { label: 'Address', selector: 'input[aria-label^="Address*"]' },
  { label: 'City', selector: 'input[aria-label^="City*"]' },
  { label: 'State/Province', selector: 'select[aria-label^="State/Province *"]' },
  { label: 'Zip/Postal Code', selector: 'input[aria-label^="Zip/Postal Code *"]' },
  { label: 'Phone number', selector: 'input[aria-label^="Phone number*"]' },
  { label: 'Market', selector: 'select[aria-label^="Market *"]' },
  { label: 'Community', selector: 'input[aria-label^="Community *"]' },
  { label: 'Service request', selector: 'textarea[aria-label^="Service request*"]' }
] as const;

export class CustomerCarePage extends BasePage {
  readonly main: Locator;
  readonly heading: Locator;
  readonly countrySelectorButton: Locator;
  readonly areaHeading: Locator;
  readonly serviceRequestSection: Locator;
  readonly serviceRequestForm: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.main = page.locator('main');
    this.heading = this.main.locator('h1').first();
    this.countrySelectorButton = page.locator('button[aria-label^="Select your country."]').first();
    this.areaHeading = this.main.getByRole('heading', { name: /Please Select Your Area/i }).first();
    this.serviceRequestSection = this.main
      .getByRole('heading', { name: /^Service Request$/i })
      .locator('xpath=ancestor::*[self::section or self::div][1]');
    this.serviceRequestForm = this.main.locator('form').first();
    this.submitButton = this.main.getByRole('button', { name: /^SUBMIT$/i });
  }

  async navigateToCustomerCare(locationKey: LocationKey): Promise<void> {
    const { baseURL, envName } = getEnvConfig();
    const location = getLocationConfig(locationKey);
    const targetUrl = `${baseURL}/customer-care?${location.queryParam}`;

    if (envName === 'PROD') {
      await this.preventProdFormSubmission();
    }

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

  async verifyPageLoaded(config: CustomerCareCountryConfig): Promise<void> {
    await expect(this.page).toHaveTitle(config.expectedTitle);
    await expect(this.page).toHaveURL(/\/customer-care/i);
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await expect(this.heading).toHaveText(config.expectedHeading);
    await expect(this.main.getByText(config.heroCopy)).toBeVisible();
    await expect(this.areaHeading).toBeVisible();

    const selectedCountry = config.locationKey === 'USA' ? 'USA' : 'Canada';
    await expect(this.countrySelectorButton).toHaveAttribute(
      'aria-label',
      new RegExp(`${this.escapeRegExp(selectedCountry)} country is selected`, 'i')
    );
  }

  async validateAreaList(config: CustomerCareCountryConfig): Promise<void> {
    const areaButtons = this.getAreaButtons();

    await expect(areaButtons.first()).toBeVisible({ timeout: 15000 });
    await expect(areaButtons, `${config.locationKey} customer care area count should match configured markets`)
      .toHaveCount(config.areas.length);

    for (const area of config.areas) {
      const button = this.getAreaButton(area.name);

      await expect(button, `${area.name} customer care area should be visible`)
        .toBeVisible();
      await expect(button, `${area.name} should expose an accessible contact-details label`)
        .toHaveAttribute('aria-label', /View contact details of .+ State/i);
      await expect(button).toHaveAttribute('aria-expanded', /false|true/);
    }
  }

  async validateAreaDetails(area: CustomerCareArea): Promise<void> {
    const button = this.getAreaButton(area.name);

    await expect(button).toBeVisible({ timeout: 15000 });
    await button.click({ force: true });

    for (const expectedDetail of area.expectedDetails) {
      await expect(this.main.getByText(new RegExp(this.escapeRegExp(expectedDetail), 'i')).first())
        .toBeVisible({ timeout: 10000 });
    }
  }

  async validateResourceLinks(config: CustomerCareCountryConfig): Promise<void> {
    for (const resourceLink of config.resourceLinks) {
      const resourceLinkLocator = this.main
        .locator(`a[href*="${resourceLink.hrefContains}"]`)
        .first();

      await expect(resourceLinkLocator, `${resourceLink.name} should point to the expected resource`)
        .toBeVisible({ timeout: 10000 });
    }
  }

  async validateUsEmergencySupportContent(): Promise<void> {
    const emergencyHeadings = [
      'Emergency support',
      'In the event of a gas leak',
      'In the event of a roof leak',
      'In the event of electricity power loss',
      'In the event of total heat or A/C loss',
      'In the event of a plumbing issue'
    ];
    const pageText = await this.getMainText();

    for (const heading of emergencyHeadings) {
      expect(pageText, `${heading} should be present on the page`).toContain(heading);
    }
  }

  async validateUsServiceRequestForm(): Promise<void> {
    await expect(this.serviceRequestSection).toBeVisible({ timeout: 15000 });
    await expect(this.serviceRequestForm).toBeVisible();
    await expect(this.submitButton).toBeVisible();

    const requiredFieldStates = await this.getServiceRequestFieldStates(REQUIRED_SERVICE_REQUEST_FIELDS);

    for (const fieldState of requiredFieldStates) {
      expect(fieldState.exists, `${fieldState.label} should exist`).toBe(true);
      expect(fieldState.visible, `${fieldState.label} should be visible`).toBe(true);
      expect(fieldState.required, `${fieldState.label} should be required`).toBe(true);
    }

    const optionalFieldStates = await this.getServiceRequestFieldStates([
      { label: 'Email', selector: 'input[aria-label="Email"]' },
      { label: 'Closing date', selector: 'input[aria-label="Closing date"]' }
    ]);

    for (const fieldState of optionalFieldStates) {
      expect(fieldState.exists, `${fieldState.label} should exist`).toBe(true);
      expect(fieldState.visible, `${fieldState.label} should be visible`).toBe(true);
    }
  }

  async validateUsRequiredFieldValidation(): Promise<void> {
    const validationState = await this.serviceRequestForm.evaluate((form, fields) =>
      ({
        formIsValid: (form as HTMLFormElement).checkValidity(),
        fields: fields.map((field) => {
          const element = form.querySelector(field.selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

          return {
            label: field.label,
            isValid: element?.checkValidity() ?? false
          };
        })
      }),
      REQUIRED_SERVICE_REQUEST_FIELDS
    );

    expect(validationState.formIsValid, 'Blank service request form should fail browser validation').toBe(false);

    for (const field of validationState.fields) {
      expect(field.isValid, `${field.label} should fail required validation when blank`).toBe(false);
    }
  }

  async validateCanadaSupportSections(): Promise<void> {
    const expectedHeadings = [
      'Your Warranty Coverage Details',
      'After Hours Emergency Support',
      "We've Got You Covered:",
      'Caring For Your Home'
    ];
    const pageText = await this.getMainText();

    for (const heading of expectedHeadings) {
      expect(pageText, `${heading} should be present on the page`).toContain(heading);
    }
  }

  private getAreaButtons(): Locator {
    return this.main.locator('button[aria-label^="View contact details of"]');
  }

  private async getMainText(): Promise<string> {
    const text = await this.main.innerText({ timeout: 15000 });

    return text.replace(/\s+/g, ' ').trim();
  }

  private getAreaButton(areaName: string): Locator {
    return this.getAreaButtons().filter({
      hasText: new RegExp(`^\\s*${this.escapeRegExp(areaName)}\\s*$`, 'i')
    }).first();
  }

  private async preventProdFormSubmission(): Promise<void> {
    await this.page.addInitScript(() => {
      const win = window as typeof window & {
        __mattamyCustomerCareProdSubmitGuard?: boolean;
      };

      if (win.__mattamyCustomerCareProdSubmitGuard) {
        return;
      }

      win.__mattamyCustomerCareProdSubmitGuard = true;

      document.addEventListener(
        'submit',
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          console.warn('[PROD GUARD] Customer care form submission blocked.');
        },
        true
      );

      const originalSubmit = HTMLFormElement.prototype.submit;
      const originalRequestSubmit = HTMLFormElement.prototype.requestSubmit;

      HTMLFormElement.prototype.submit = function blockedProdSubmit() {
        console.warn('[PROD GUARD] Customer care form submit() blocked.');
      };

      HTMLFormElement.prototype.requestSubmit = function blockedProdRequestSubmit() {
        console.warn('[PROD GUARD] Customer care form requestSubmit() blocked.');
      };

      Object.defineProperty(HTMLFormElement.prototype.submit, 'name', {
        value: originalSubmit.name,
        configurable: true
      });

      Object.defineProperty(HTMLFormElement.prototype.requestSubmit, 'name', {
        value: originalRequestSubmit.name,
        configurable: true
      });
    });
  }

  private async getServiceRequestFieldStates(fields: readonly ServiceRequestField[]): Promise<Array<{
    label: string;
    exists: boolean;
    required: boolean;
    visible: boolean;
  }>> {
    return this.serviceRequestForm.evaluate((form, targetFields) =>
      targetFields.map((field) => {
        const element = form.querySelector(field.selector) as HTMLElement | null;
        const rect = element?.getBoundingClientRect();

        return {
          label: field.label,
          exists: Boolean(element),
          required: Boolean((element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.required),
          visible: Boolean(rect && rect.width > 0 && rect.height > 0)
        };
      }),
      fields
    );
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
