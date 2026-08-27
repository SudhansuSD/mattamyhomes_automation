import { expect, Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig, LocationKey } from '../config/locations/locationConfig';
import { escapeRegex } from '../utils/web/pageObjectUtils';
import { BasePage } from './BasePage';

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
      {
        name: 'CHARLOTTE, NC',
        expectedDetails: ['Customer Care for the Charlotte, NC Area', 'Charlotte Customer Care'],
      },
      { name: 'CLOVER, SC', expectedDetails: ['Customer Care for the Clover, SC Area'] },
      {
        name: 'DALLAS-FORT WORTH, TX',
        expectedDetails: ['Customer Care for the Dallas-Fort Worth, TX Area'],
      },
      {
        name: 'FORT LAUDERDALE, FL',
        expectedDetails: ['Customer Care for the Fort Lauderdale, FL Area'],
      },
      {
        name: 'JACKSONVILLE-ST. AUGUSTINE, FL',
        expectedDetails: ['Customer Care for the Jacksonville-St. Augustine, FL Area'],
      },
      {
        name: 'NAPLES-FORT MYERS, FL',
        expectedDetails: ['Customer Care for the Naples-Fort Myers, FL Area'],
      },
      { name: 'ORLANDO, FL', expectedDetails: ['Customer Care for the Orlando, FL Area'] },
      { name: 'PALM BEACH, FL', expectedDetails: ['Customer Care for the Palm Beach, FL Area'] },
      {
        name: 'PALM CITY-STUART, FL',
        expectedDetails: ['Customer Care for the Palm City-Stuart, FL Area'],
      },
      { name: 'PHOENIX, AZ', expectedDetails: ['Customer Care for the Phoenix, AZ Area'] },
      {
        name: 'PORT ST. LUCIE, FL',
        expectedDetails: ['Customer Care for the Port St. Lucie, FL Area'],
      },
      { name: 'RALEIGH, NC', expectedDetails: ['Customer Care for the Raleigh, NC Area'] },
      { name: 'ROCK HILL, SC', expectedDetails: ['Customer Care for the Rock Hill, SC Area'] },
      {
        name: 'SARASOTA, FL',
        expectedDetails: ['Customer Care for the Sarasota-Bradenton, FL Area'],
      },
      { name: 'TAMPA, FL', expectedDetails: ['Customer Care for the Tampa, FL Area'] },
      { name: 'TUCSON, AZ', expectedDetails: ['Customer Care for the Tucson, AZ Area'] },
    ],
    resourceLinks: [{ name: 'Warranty Manual PDF', hrefContains: 'warranty-manual' }],
  },
  {
    locationKey: 'CAN',
    countryLabel: 'Canada',
    expectedTitle: /Customer Care \| Mattamy Homes/i,
    expectedHeading: /^Homeowner Support$/i,
    heroCopy: /Providing you with the support you need 24\/7/i,
    areas: [
      {
        name: 'CALGARY, AB',
        expectedDetails: [
          'Customer Care for the Calgary, AB Area',
          'Carrington Customer Care',
          'Carrington Warranty',
        ],
      },
      { name: 'EDMONTON, AB', expectedDetails: ['Customer Care for the Edmonton, AB Area'] },
      {
        name: 'GREATER TORONTO AREA, ON',
        expectedDetails: ['Customer Care for the Greater Toronto Area, ON Area'],
      },
      {
        name: 'KITCHENER-WATERLOO-GUELPH, ON',
        expectedDetails: ['Customer Care for the Kitchener-Waterloo-Guelph, ON Area'],
      },
      { name: 'OTTAWA, ON', expectedDetails: ['Customer Care for the Ottawa, ON Area'] },
      { name: 'SIMCOE, ON', expectedDetails: ['Customer Care for the Simcoe, ON Area'] },
    ],
    resourceLinks: [
      { name: 'Alberta', hrefContains: '/customer-care/alberta-warranty' },
      { name: 'Ontario', hrefContains: '/customer-care/ontario-warranty' },
      { name: 'Go To After Hours Support', hrefContains: '/customer-care/after-hours-support' },
      { name: 'Watch Videos', hrefContains: '/customer-care/caring-for-your-home' },
      {
        name: 'Seasonal Checklist - Spring Download PDF',
        hrefContains: 'seasonalchecklist-spring-pdf',
      },
      {
        name: 'Seasonal Checklist - Summer Download PDF',
        hrefContains: 'seasonalchecklist-summer-pdf',
      },
      {
        name: 'Seasonal Checklist - Fall Download PDF',
        hrefContains: 'seasonalchecklist-fall-pdf',
      },
      {
        name: 'Seasonal Checklist - Winter Download PDF',
        hrefContains: 'seasonalchecklist-winter-pdf',
      },
    ],
  },
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
  { label: 'Service request', selector: 'textarea[aria-label^="Service request*"]' },
] as const;

export class CustomerCarePage extends BasePage {
  readonly main: Locator;
  readonly heading: Locator;
  readonly countrySelectorButton: Locator;
  readonly areaHeading: Locator;
  readonly serviceRequestSection: Locator;
  readonly serviceRequestForm: Locator;
  readonly submitButton: Locator;

  /** Sets up the page object with the locators it needs. */
  constructor(page: Page) {
    super(page);

    this.main = page.locator('main');
    this.heading = this.main.locator('h1').first();
    this.countrySelectorButton = page.locator('button[aria-label^="Select your country."]').first();
    this.areaHeading = this.main.getByRole('heading', { name: /Please Select Your Area/i }).first();
    this.serviceRequestForm = this.main.locator('form').first();
    this.serviceRequestSection = this.serviceRequestForm.locator(
      'xpath=ancestor::*[self::section or self::div][1]',
    );
    this.submitButton = this.main.getByRole('button', { name: /^SUBMIT$/i });
  }

  /** Opens the Customer Care page. */
  async navigateToCustomerCare(locationKey: LocationKey): Promise<void> {
    await this.step(`Navigate to Customer Care page (${locationKey})`, async () => {
      const { baseURL, envName } = getEnvConfig();
      const location = getLocationConfig(locationKey);
      const targetUrl = `${baseURL}/customer-care?${location.queryParam}`;

      if (envName === 'PROD') {
        await this.preventProdFormSubmission();
      }

      await this.reportValue('Target URL', targetUrl);

      await this.page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });

      await this.acceptCookiesIfPresent();
      await this.waitForPageReady();
      await this.dismissPromoPopupIfPresent({ appearTimeout: 2000 });
    });
  }

  /** Checks that the page loaded. */
  async verifyPageLoaded(config: CustomerCareCountryConfig): Promise<void> {
    await this.step(`Verify Customer Care page loaded (${config.locationKey})`, async () => {
      await this.assertPageTitle(
        config.expectedTitle,
        `${config.locationKey} Customer Care page title should match`,
      );
      await this.assertPageUrl(
        /\/customer-care/i,
        `${config.locationKey} Customer Care page URL should match`,
      );
      await this.assertVisible(
        this.heading,
        'Customer Care page heading should be visible',
        15_000,
      );
      await this.assertText(
        this.heading,
        config.expectedHeading,
        'Customer Care heading should match configured country',
      );
      await this.assertVisible(
        this.main.getByText(config.heroCopy),
        'Customer Care hero copy should be visible',
      );
      await this.assertVisible(this.areaHeading, 'Customer Care area heading should be visible');

      const selectedCountry = config.locationKey === 'USA' ? 'USA' : 'Canada';
      await this.assertAttribute(
        this.countrySelectorButton,
        'aria-label',
        new RegExp(`${escapeRegex(selectedCountry)} country is selected`, 'i'),
        `${selectedCountry} should be selected in Customer Care country selector`,
      );
    });
  }

  /** Checks the area list. */
  async validateAreaList(config: CustomerCareCountryConfig): Promise<void> {
    await this.step(`Validate Customer Care area list (${config.locationKey})`, async () => {
      const areaButtons = this.getAreaButtons();

      await this.assertVisible(
        areaButtons.first(),
        `${config.locationKey} customer care areas should render`,
        15_000,
      );
      await this.assertCount(
        areaButtons,
        config.areas.length,
        `${config.locationKey} customer care area count should match configured markets`,
      );

      for (const [index, area] of config.areas.entries()) {
        const button = this.getAreaButton(area.name);

        await this.assertVisible(button, `${area.name} customer care area should be visible`);
        await this.assertAttribute(
          button,
          'aria-label',
          /View contact details of .+ State/i,
          `${area.name} should expose an accessible contact-details label`,
        );
        await this.assertAttribute(
          button,
          'aria-expanded',
          /false|true/,
          `${area.name} should expose expanded/collapsed state`,
        );

        await this.reportValue(`Area ${index + 1}`, area.name);
      }
    });
  }

  /** Checks the selected area details. */
  async validateAreaDetails(area: CustomerCareArea): Promise<void> {
    await this.step(`Validate Customer Care area details: ${area.name}`, async () => {
      const button = this.getAreaButton(area.name);

      await this.assertVisible(button, `${area.name} customer care area should be visible`, 15_000);
      await button.click();

      for (const expectedDetail of area.expectedDetails) {
        await this.assertVisible(
          this.main.getByText(new RegExp(escapeRegex(expectedDetail), 'i')).first(),
          `${area.name} should show customer care detail: ${expectedDetail}`,
        );
      }
    });
  }

  /** Checks the resource links. */
  async validateResourceLinks(config: CustomerCareCountryConfig): Promise<void> {
    await this.step(`Validate Customer Care resource links (${config.locationKey})`, async () => {
      for (const resourceLink of config.resourceLinks) {
        // Resolve by accessible name first, then by href. The PDF links render
        // their visible text as just "Download PDF" and carry the full name
        // ("Seasonal Checklist - Spring Download PDF") in aria-label, so a
        // hasText filter on the name matched nothing - while getByRole reads the
        // accessible name, which is what a user of assistive tech actually gets.
        const resourceLinkLocator = this.main
          .getByRole('link', { name: new RegExp(escapeRegex(resourceLink.name), 'i') })
          .or(this.main.locator(`a[href*="${resourceLink.hrefContains}"]`))
          .first();

        await this.assertVisible(
          resourceLinkLocator,
          `${resourceLink.name} should point to the expected resource`,
        );

        await this.reportValue(
          `Resource link: ${resourceLink.name}`,
          this.buildFullUrl(resourceLink.hrefContains),
        );
      }
    });
  }

  /** Checks the U.S. emergency support content. */
  async validateUsEmergencySupportContent(): Promise<void> {
    await this.step('Validate US emergency support content', async () => {
      const emergencyHeadings = [
        'Emergency support',
        'In the event of a gas leak',
        'In the event of a roof leak',
        'In the event of electricity power loss',
        'In the event of total heat or A/C loss',
        'In the event of a plumbing issue',
      ];

      for (const heading of emergencyHeadings) {
        await this.assertVisible(
          this.main
            .getByRole('heading', { name: new RegExp(`^${escapeRegex(heading)}$`, 'i') })
            .first(),
          `${heading} should be present on the page`,
          15_000,
        );
      }
    });
  }

  /** Checks the U.S. service request form. */
  async validateUsServiceRequestForm(): Promise<void> {
    await this.step('Validate US service request form fields', async () => {
      await this.assertVisible(
        this.serviceRequestSection,
        'Service request section should be visible',
        15_000,
      );
      await this.assertVisible(this.serviceRequestForm, 'Service request form should be visible');
      await this.assertVisible(
        this.submitButton,
        'Service request submit button should be visible',
      );

      const requiredFieldStates = await this.getServiceRequestFieldStates(
        REQUIRED_SERVICE_REQUEST_FIELDS,
      );

      for (const fieldState of requiredFieldStates) {
        expect(fieldState.exists, `${fieldState.label} should exist`).toBe(true);
        expect(fieldState.visible, `${fieldState.label} should be visible`).toBe(true);
        expect(fieldState.required, `${fieldState.label} should be required`).toBe(true);
      }

      const optionalFieldStates = await this.getServiceRequestFieldStates([
        { label: 'Email', selector: 'input[aria-label="Email"]' },
        { label: 'Closing date', selector: 'input[aria-label="Closing date"]' },
      ]);

      for (const fieldState of optionalFieldStates) {
        expect(fieldState.exists, `${fieldState.label} should exist`).toBe(true);
        expect(fieldState.visible, `${fieldState.label} should be visible`).toBe(true);
      }
    });
  }

  /** Checks the U.S. required-field validation. */
  async validateUsRequiredFieldValidation(): Promise<void> {
    await this.step('Validate US service request required-field validation', async () => {
      const validationState = await this.serviceRequestForm.evaluate(
        (form, fields) => ({
          formIsValid: (form as HTMLFormElement).checkValidity(),
          fields: fields.map((field) => {
            const element = form.querySelector(field.selector) as
              HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

            return {
              label: field.label,
              isValid: element?.checkValidity() ?? false,
            };
          }),
        }),
        REQUIRED_SERVICE_REQUEST_FIELDS,
      );

      expect(
        validationState.formIsValid,
        'Blank service request form should fail browser validation',
      ).toBe(false);

      for (const field of validationState.fields) {
        expect(field.isValid, `${field.label} should fail required validation when blank`).toBe(
          false,
        );
      }
    });
  }

  /** Checks the Canada support sections. */
  async validateCanadaSupportSections(): Promise<void> {
    await this.step('Validate Canada support sections', async () => {
      const expectedHeadings = [
        'Your Warranty Coverage Details',
        'After Hours Emergency Support',
        "We've Got You Covered:",
        'Caring For Your Home',
      ];

      for (const heading of expectedHeadings) {
        await expect(
          this.main.getByRole('heading', { name: new RegExp(escapeRegex(heading), 'i') }).first(),
          `${heading} should be present on the page`,
        ).toBeVisible({ timeout: 15000 });
      }
    });
  }

  /** Gets the area buttons. */
  private getAreaButtons(): Locator {
    return this.main.locator('button[aria-label^="View contact details of"]:visible');
  }

  /** Gets the selected area button. */
  private getAreaButton(areaName: string): Locator {
    return this.getAreaButtons()
      .filter({
        hasText: new RegExp(`^\\s*${escapeRegex(areaName)}\\s*$`, 'i'),
      })
      .first();
  }

  /** Prevents production form submission during validation. */
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
        true,
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
        configurable: true,
      });

      Object.defineProperty(HTMLFormElement.prototype.requestSubmit, 'name', {
        value: originalRequestSubmit.name,
        configurable: true,
      });
    });
  }

  /** Captures the service request field states. */
  private async getServiceRequestFieldStates(fields: readonly ServiceRequestField[]): Promise<
    Array<{
      label: string;
      exists: boolean;
      required: boolean;
      visible: boolean;
    }>
  > {
    return this.serviceRequestForm.evaluate(
      (form, targetFields) =>
        targetFields.map((field) => {
          const element = form.querySelector(field.selector) as HTMLElement | null;
          const rect = element?.getBoundingClientRect();

          return {
            label: field.label,
            exists: Boolean(element),
            required: Boolean(
              (element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)
                ?.required,
            ),
            visible: Boolean(rect && rect.width > 0 && rect.height > 0),
          };
        }),
      fields,
    );
  }
}
