import { expect, Locator, Page, test } from '@playwright/test';
import testData from '../../data/test_data.json';
import { getLocationConfig, type LocationKey } from '../../config/locations/locationConfig';
import {
  buildMissingLeadFieldsMessage,
  getExpectedLeadFormFields,
  type LeadFormField,
} from '../../config/features/leadFormSchema';
import { reportValue } from '../reporting/allureReporter';
import { escapeRegex } from '../web/pageObjectUtils';
import { isProdEnvironment } from './prodSubmissionGuard';

/* Shared lead-form fill, submit and validation helpers, plus the lead-form test data. */

type Region = {
  country: string;
};

type WebProfile = {
  region: string;
  phone: string;
  zip: string;
  emailPrefix: string;
  invalidEmail?: string;
  invalidPhone?: string;
  invalidZip?: string;
  community?: string;
  questions?: string;
};

const LEAD = testData.leadForm;
const REGIONS = LEAD.regions as Record<string, Region>;
const PROFILES = LEAD.web.profiles as Record<string, WebProfile>;

export type LeadFormProfileKey = keyof typeof testData.leadForm.web.profiles;

export type LeadFieldData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  country: string;
};

/* Test data accessors for data/test_data.json; each profile points at a shared region. */

/** Resolves a profile's country (from its region) plus its own phone and zip. */
function resolveLocation(profile: WebProfile): { country: string; phone: string; zip: string } {
  return {
    country: REGIONS[profile.region].country,
    phone: profile.phone,
    zip: profile.zip,
  };
}

/** Build a unique, valid lead email from a profile prefix. */
export function buildValidEmail(emailPrefix: string): string {
  const base = emailPrefix.replace(/\+/g, '_').replace(/[._-]+$/, '');

  const tag = `${Date.now()}`;

  return `${base}_${tag}@${LEAD.emailDomain}`.replace(/_{2,}/g, '_');
}

/** Get the raw web lead-form profile entry. */
export function getLeadProfile(profile: LeadFormProfileKey): WebProfile {
  return PROFILES[profile];
}

/** Get valid lead data (with a fresh unique email) for a profile. */
export function getValidLeadData(profile: LeadFormProfileKey): LeadFieldData {
  const entry = PROFILES[profile];
  const location = resolveLocation(entry);

  return {
    firstName: LEAD.validName.firstName,
    // No run id in the surname: the site rejects it as "Invalid Last name"; the email carries it.
    lastName: LEAD.validName.lastName,
    email: buildValidEmail(entry.emailPrefix),
    phone: location.phone,
    zip: location.zip,
    country: location.country,
  };
}

/** Get invalid lead data for a profile, falling back to shared values where it has no override. */
export function getInvalidLeadData(profile: LeadFormProfileKey): LeadFieldData {
  const entry = PROFILES[profile];
  const location = resolveLocation(entry);

  return {
    firstName: LEAD.invalidName.firstName,
    lastName: LEAD.invalidName.lastName,
    email: entry.invalidEmail ?? LEAD.invalidEmail,
    phone: entry.invalidPhone ?? location.phone,
    zip: entry.invalidZip ?? location.zip,
    country: location.country,
  };
}

// Field primitives

/** Fill a field only when it exists. */
export async function fillIfPresent(field: Locator, value: string): Promise<void> {
  if (await field.count()) {
    await field.first().fill(value);
  }
}

/** Select the first non-placeholder option when a dropdown exists. */
export async function selectFirstOptionIfPresent(field: Locator): Promise<void> {
  if (!(await field.count())) {
    return;
  }

  await field.first().selectOption({ index: 1 });
}

/** Select a dropdown value when present: the preferred label, else the first option. */
export async function selectOptionIfPresent(
  field: Locator,
  preferredLabel?: string,
): Promise<void> {
  const target = field.first();

  if (!(await target.count())) {
    return;
  }

  if (preferredLabel) {
    const selected = await target
      .selectOption({ label: preferredLabel })
      .then(() => true)
      .catch(() => false);

    if (selected) {
      return;
    }
  }

  await target.selectOption({ index: 1 });
}

/** Check a single checkbox when present (used for consent/preference toggles). */
export async function checkIfPresent(field: Locator): Promise<void> {
  const target = field.first();

  if (await target.count()) {
    await target.check({ force: true });
  }
}

/** Select country of residence when present: the preferred country, else the first option. */
export async function selectCountryIfPresent(
  form: Locator,
  preferredCountry?: string,
): Promise<void> {
  const country = form.getByRole('combobox', { name: /country of residence/i }).first();

  if (!(await country.count())) {
    return;
  }

  if (preferredCountry) {
    const selected = await country
      .selectOption({ label: preferredCountry })
      .then(() => true)
      .catch(() => false);

    if (selected) {
      return;
    }
  }

  await country.selectOption({ index: 1 });
}

/** Waits until the DOM stops changing, capped at `ms`. */
async function settlePageDom(
  page: Page,
  ms: number,
  quietWindowMs = Math.min(300, ms),
): Promise<void> {
  await page
    .evaluate(
      ([maxMs, quietMs]) =>
        new Promise<void>((resolve) => {
          const quietWindow = Math.min(quietMs, maxMs);
          let quietTimer = window.setTimeout(finish, quietWindow);
          const capTimer = window.setTimeout(finish, maxMs);
          const observer = new MutationObserver(() => {
            window.clearTimeout(quietTimer);
            quietTimer = window.setTimeout(finish, quietWindow);
          });

          observer.observe(document.documentElement, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
          });

          function finish() {
            window.clearTimeout(quietTimer);
            window.clearTimeout(capTimer);
            observer.disconnect();
            resolve();
          }
        }),
      [ms, quietWindowMs] as const,
    )
    .catch(() => undefined);
}

/** Get the form's consent / privacy / terms checkbox. */
export function getConsentCheckbox(form: Locator): Locator {
  return form
    .getByRole('checkbox', {
      name: /express consent|providing consent|privacy policy|entering my contact information/i,
    })
    .or(
      form.locator(
        [
          'input[type="checkbox"][name*="consent" i]',
          'input[type="checkbox"][id*="consent" i]',
          'input[type="checkbox"][aria-label*="consent" i]',
          'input[type="checkbox"][name*="privacy" i]',
          'input[type="checkbox"][id*="privacy" i]',
          'input[type="checkbox"][aria-label*="privacy" i]',
          'input[type="checkbox"][name*="terms" i]',
          'input[type="checkbox"][id*="terms" i]',
          'input[type="checkbox"][aria-label*="terms" i]',
        ].join(', '),
      ),
    )
    .first();
}

/** Check the appropriate consent checkbox when present (skips "real estate agent" opt-ins). */
export async function checkConsentIfPresent(form: Locator): Promise<void> {
  const named = getConsentCheckbox(form);

  if (await named.count()) {
    await named.check({ force: true }).catch(() => undefined);
    return;
  }

  const fallbackCheckboxes = form.getByRole('checkbox');
  const count = await fallbackCheckboxes.count();

  for (let i = 0; i < count; i++) {
    const candidate = fallbackCheckboxes.nth(i);
    const label = await candidate.getAttribute('aria-label').catch(() => null);

    if (label && /real estate agent/i.test(label)) {
      continue;
    }

    await candidate.check({ force: true }).catch(() => undefined);
    return;
  }
}

/** Submit-button selector in CSS, not by role: the promo popup aria-hides `#root`, which empties role lookups. */
export const SUBMIT_BUTTON_SELECTOR =
  'button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")';

/** Exact text of the "Get Information" / "Stay Updated" CTA; anchored so wrappers do not match. */
export const GET_INFORMATION_CTA_TEXT = /^\s*(?:Get Information|Stay Updated)\s*$/i;

/** Controls that can be the CTA, matched by text not role; no container filter, as the phone copy sits in a sticky bar. */
export const GET_INFORMATION_CTA_SELECTOR = [
  'button',
  // Real href links are left out so this never follows a link to the Contact page form.
  'a:not([href])',
  'a[href=""]',
  'a[href^="javascript:"]',
].join(', ');

/** Get the "Get Information" CTAs that open the lead-form modal on the given page. */
export function getInformationCtas(page: Page): Locator {
  return page.locator(GET_INFORMATION_CTA_SELECTOR).filter({ hasText: GET_INFORMATION_CTA_TEXT });
}

/** Get the visible "Get Information" CTA; the page renders several copies and which shows depends on viewport. */
export function getVisibleInformationCta(page: Page): Locator {
  return getInformationCtas(page).filter({ visible: true }).first();
}

/** Get the breadcrumb-bar CTA used on plan detail, QMI and condo plan pages (labels and classes vary). */
export function getBreadcrumbInformationCta(page: Page): Locator {
  return page.locator('#breadcrumb button').filter({ hasText: GET_INFORMATION_CTA_TEXT });
}

/** Get the community hero CTA; it renders only once the hero is scrolled into view. */
export function getHeroInformationCta(page: Page): Locator {
  return page.locator('#HeaderPlanPage button').filter({ hasText: GET_INFORMATION_CTA_TEXT });
}

/** Get the lead-form submit button. */
export function getSubmitButton(form: Locator): Locator {
  return form.locator(SUBMIT_BUTTON_SELECTOR).first();
}

/** Hides every visible AtlasRTX chat widget; it is cross-origin, so its close button cannot be clicked. */
export async function closeAtlasChatIframeIfOpen(page: Page): Promise<boolean> {
  return page
    .evaluate(() => {
      const visibleWidgets = Array.from(
        document.querySelectorAll<HTMLElement>('#iAtlasChatDiv, #iAtlasChat'),
      ).filter((widget) => {
        const rect = widget.getBoundingClientRect();
        const style = window.getComputedStyle(widget);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.pointerEvents !== 'none'
        );
      });

      visibleWidgets.forEach((widget) => {
        const host = widget.closest<HTMLElement>('#iAtlasChatDiv') ?? widget;

        host.dataset.automationAtlasChatClosed = 'true';
        host.style.display = 'none';
        host.style.pointerEvents = 'none';
      });

      return visibleWidgets.length > 0;
    })
    .catch(() => false);
}

/** Assert that a required form field is visible. */
export async function expectFieldVisible(
  field: Locator,
  label: string,
  timeout = 10000,
  options: { soft?: boolean } = {},
): Promise<void> {
  const assertion = options.soft
    ? expect.soft(field, `${label} field should be visible`)
    : expect(field, `${label} field should be visible`);

  await assertion.toBeVisible({ timeout });
}

/** Assert a genuinely optional field is visible when the form renders it. */
export async function expectFieldVisibleIfPresent(
  field: Locator,
  label: string,
  timeout = 10000,
  options: { soft?: boolean } = {},
): Promise<void> {
  if (await field.count()) {
    await expectFieldVisible(field.first(), label, timeout, options);
  }
}

// Submit + validation

/** Clicks Submit, or on PROD raises the same validation by leaving each field instead of clicking. */
export async function clickSubmit(
  page: Page,
  form: Locator,
  timeout = 10000,
  options: {
    submitButton?: Locator;
    settle?: (ms: number) => Promise<void>;
  } = {},
): Promise<void> {
  const submitButton = options.submitButton ?? getSubmitButton(form);

  await closeAtlasChatIframeIfOpen(page);

  await expect(submitButton, 'Submit button should be visible before clicking').toBeVisible({
    timeout,
  });

  if (isProdEnvironment()) {
    await reportValue(
      'PROD: Submit not clicked',
      'form validation triggered by leaving each field instead',
    );
    await triggerFormValidationWithoutSubmit(form);
  } else {
    await clickSubmitButton(submitButton);
  }

  if (options.settle) {
    await options.settle(800);
    return;
  }

  await settlePageDom(page, 800);
}

/** Clicks the submit button once, without waiting on the third-party submit request. */
async function clickSubmitButton(submitButton: Locator): Promise<void> {
  // No force: a covered Submit is a finding. noWaitAfter: the third-party request is not awaited.
  await submitButton.click({
    noWaitAfter: true,
    timeout: 5000,
  });
}

/** Editable fields a user would tab through; honeypots (tabindex -1), hidden and disabled fields are left out. */
const VALIDATABLE_FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"])',
  'select',
  'textarea',
]
  .map((selector) => `${selector}:not([disabled]):not([tabindex="-1"]):visible`)
  .join(', ');

/** Raises a form's validation messages without submitting, by focusing and leaving each field. */
export async function triggerFormValidationWithoutSubmit(form: Locator): Promise<void> {
  const fields = form.locator(VALIDATABLE_FIELD_SELECTOR);
  const count = await fields.count();

  for (let index = 0; index < count; index++) {
    const field = fields.nth(index);

    await field.focus({ timeout: 2000 }).catch(() => undefined);
    await field.blur({ timeout: 2000 }).catch(() => undefined);
  }
}

/** A visible field the form marks `required` / `aria-required="true"`. */
type RequiredField = {
  field: Locator;
  label: string;
  isChoice: boolean;
};

/** Fields the form itself marks required. */
const REQUIRED_FIELD_SELECTOR = ['input', 'select', 'textarea']
  .flatMap((tag) => [
    `${tag}[required]:not([required="false"]):not([disabled]):visible`,
    `${tag}[aria-required="true"]:not([disabled]):visible`,
  ])
  .join(', ');

/** Returns the visible fields the form marks as required, with the label their error names. */
async function getVisibleRequiredFields(form: Locator): Promise<RequiredField[]> {
  const fields = form.locator(REQUIRED_FIELD_SELECTOR);
  const count = await fields.count();
  const requiredFields: RequiredField[] = [];

  for (let index = 0; index < count; index++) {
    const field = fields.nth(index);
    const { label, isChoice } = await field.evaluate((element) => {
      const input = element as HTMLInputElement;
      // <label> first: a failed field's aria-label is rewritten to the error text.
      const rawLabel =
        input.labels?.[0]?.innerText || input.getAttribute('aria-label') || input.name || '';

      return {
        label: rawLabel
          .replace(/^\s*Error:\s*/i, '')
          .replace(/\s+is\s+Required.*$/i, '')
          .replace(/\*/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
        isChoice: input.type === 'checkbox' || input.type === 'radio',
      };
    });

    requiredFields.push({ field, label, isChoice });
  }

  return requiredFields;
}

/** Assert each empty required field shows its "is Required" error; prefilled ones are reported, not failed. */
export async function expectRequiredErrorsInForm(form: Locator, timeout = 10000): Promise<void> {
  const initialErrorCount = test.info().errors.length;
  const requiredFields = await getVisibleRequiredFields(form);

  await reportValue(
    'Required fields marked on the form',
    requiredFields.map(({ label }) => label).join(', ') || '(none)',
  );

  expect(
    requiredFields.length,
    'Lead form should mark at least one field as required',
  ).toBeGreaterThan(0);

  for (const { field, label, isChoice } of requiredFields) {
    const state = await field.evaluate((element) => {
      const input = element as HTMLInputElement;
      const isChoiceInput = input.type === 'checkbox' || input.type === 'radio';

      return {
        isEmpty: isChoiceInput ? !input.checked : !input.value,
        valueMissing: input.validity.valueMissing,
      };
    });

    if (!state.isEmpty) {
      await reportValue(`${label} is required but prefilled`, 'no required error expected');
      continue;
    }

    expect.soft(state.valueMissing, `${label} should report a missing required value`).toBe(true);

    if (isChoice) {
      continue;
    }

    await expect
      .soft(
        form.getByText(new RegExp(`${escapeRegex(label)}\\s*(?:is\\s*)?Required`, 'i')).first(),
        `${label} required-field error should be visible`,
      )
      .toBeVisible({ timeout });
  }

  expect(
    test.info().errors.slice(initialErrorCount),
    'Required-field error audit should have no assertion failures',
  ).toHaveLength(0);
}

/** Assert invalid-email validation within a lead form. */
export async function expectInvalidEmailErrorInForm(form: Locator, timeout = 10000): Promise<void> {
  await expect(
    form
      .locator('text=/valid domain name|valid email|invalid email|Error:.*Email|Email.*Invalid/i')
      .first(),
  ).toBeVisible({ timeout });
}

// Composite fill (getByRole-based forms)

export type FillLeadOptions = {
  emailName?: RegExp;
  selectCountry?: boolean;
  selectCommunity?: boolean;
  selectPlan?: boolean;
  checkConsent?: boolean;
};

export type SideModalFormOptions = FillLeadOptions & {
  timeout?: number;
  formName?: string;
  location?: LocationKey;
  expectCommunity?: boolean;
  expectPlan?: boolean;
};

/** Fill a standard lead form from {@link LeadFieldData}, touching only the fields that are present. */
export async function fillLeadFormFields(
  form: Locator,
  data: LeadFieldData,
  options: FillLeadOptions = {},
): Promise<void> {
  const emailName = options.emailName ?? /^email/i;

  await fillIfPresent(form.getByRole('textbox', { name: /first name/i }), data.firstName);
  await fillIfPresent(form.getByRole('textbox', { name: /last name/i }), data.lastName);
  await fillIfPresent(form.getByRole('textbox', { name: emailName }), data.email);
  await fillIfPresent(form.getByRole('textbox', { name: /phone/i }), data.phone);
  await fillIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), data.zip);

  if (options.selectCountry !== false) {
    await selectCountryIfPresent(form, data.country);
  }

  if (options.selectCommunity) {
    await selectFirstOptionIfPresent(form.getByRole('combobox', { name: /community/i }).first());
  }

  if (options.selectPlan) {
    await selectFirstOptionIfPresent(
      form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
    );
  }

  if (options.checkConsent !== false) {
    await checkConsentIfPresent(form);
  }
}

/** Audit a side-modal lead form: core fields must render, others are checked if present, then required errors. */
export async function expectSideModalFormFields(
  form: Locator,
  options: SideModalFormOptions = {},
): Promise<void> {
  const initialErrorCount = test.info().errors.length;
  const timeout = options.timeout ?? 10000;
  const location = options.location ?? (getLocationConfig().country as LocationKey);
  const formName = options.formName ?? 'side modal form';

  const optionalFields: Array<[Locator, string]> = [
    [form.getByRole('textbox', { name: /zip|postal/i }).first(), 'Zip/Postal Code'],
    [form.getByRole('textbox', { name: /phone/i }).first(), 'Phone number'],
    ...getExpectedLeadFormFields(location, formName).map((field): [Locator, string] => [
      getLeadFormFieldLocator(form, field).first(),
      getLeadFormFieldLabel(field),
    ]),
  ];

  if (options.expectCommunity) {
    optionalFields.push([form.getByRole('combobox', { name: /community/i }).first(), 'Community']);
  }

  if (options.expectPlan) {
    optionalFields.push([
      form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
      'Suite/Floorplan/Plan',
    ]);
  }

  // Core fields first, so a zero count on an optional field below means absent, not late.
  await Promise.all(
    getCoreSideModalFields(form).map(([field, label]) =>
      expectFieldVisible(field, label, timeout, { soft: true }),
    ),
  );

  const skippedFields: string[] = [];

  for (const [field, label] of dedupeFieldExpectations(optionalFields)) {
    if (await field.count()) {
      await expectFieldVisible(field, label, timeout, { soft: true });
    } else {
      skippedFields.push(label);
    }
  }

  if (skippedFields.length) {
    await reportValue(`Fields not rendered on ${formName} (skipped)`, skippedFields.join(', '));
  }

  await triggerFormValidationWithoutSubmit(form);
  await expectRequiredErrorsInForm(form, timeout);

  expect(
    test.info().errors.slice(initialErrorCount),
    'Side modal form field audit should have no assertion failures',
  ).toHaveLength(0);
}

/** The fields without which the form is not a lead form at all. */
function getCoreSideModalFields(form: Locator): Array<[Locator, string]> {
  return [
    [form.getByRole('textbox', { name: /first name/i }).first(), 'First name'],
    [form.getByRole('textbox', { name: /last name/i }).first(), 'Last name'],
    [form.getByRole('textbox', { name: /^email/i }).first(), 'Email'],
    [getSubmitButton(form), 'Submit button'],
  ];
}

/** Locates a schema-declared lead-form field. */
function getLeadFormFieldLocator(form: Locator, field: LeadFormField): Locator {
  const locators: Record<LeadFormField, Locator> = {
    comments: findCommentsField(form),
    bedroomCount: findSelectByLabel(form, /bedroom/i, 'bedroom'),
    desiredMoveDate: findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move'),
    newBudget: findSelectByLabel(form, /budget/i, 'budget'),
    firstTimeHomeBuyer: findSelectByLabel(
      form,
      /first.?time.*home.?buyer|first time homebuyer/i,
      'buyer',
    ),
    countryOfResidence: findSelectByLabel(form, /country of residence/i, 'country'),
  };

  return locators[field];
}

/** Locates the comments / questions textarea. */
function findCommentsField(form: Locator): Locator {
  return form
    .getByRole('textbox', { name: /additional questions|comment|message|special requirement/i })
    .or(
      form.locator(
        [
          'textarea[aria-label*="additional" i]:not([disabled]):not([aria-disabled="true"]):visible',
          'textarea[aria-label*="comment" i]:not([disabled]):not([aria-disabled="true"]):visible',
          'textarea[aria-label*="message" i]:not([disabled]):not([aria-disabled="true"]):visible',
          'textarea[aria-label*="special requirement" i]:not([disabled]):not([aria-disabled="true"]):visible',
          'textarea[name*="comment" i]:not([disabled]):not([aria-disabled="true"]):visible',
          'textarea[name*="requirement" i]:not([disabled]):not([aria-disabled="true"]):visible',
        ].join(', '),
      ),
    );
}

/** Report label for a schema-declared lead-form field. */
function getLeadFormFieldLabel(field: LeadFormField): string {
  const labels: Record<LeadFormField, string> = {
    comments: 'Comments',
    bedroomCount: 'Bedroom Count',
    desiredMoveDate: 'Desired Move Date',
    newBudget: 'Budget',
    firstTimeHomeBuyer: 'First Time Home Buyer',
    countryOfResidence: 'Country of Residence',
  };

  return labels[field];
}

/** Drops field expectations whose label already appeared. */
function dedupeFieldExpectations(fields: Array<[Locator, string]>): Array<[Locator, string]> {
  const seenLabels = new Set<string>();

  return fields.filter(([, label]) => {
    if (seenLabels.has(label)) {
      return false;
    }

    seenLabels.add(label);
    return true;
  });
}

/** Fill a side modal form with a profile's invalid data. */
export async function fillInvalidSideModalForm(
  form: Locator,
  profile: LeadFormProfileKey,
  options: FillLeadOptions = {},
): Promise<void> {
  await fillLeadFormFields(form, getInvalidLeadData(profile), options);
}

/** Fill a side modal form with a profile's valid data plus any extra dropdowns; `leadData` overrides values. */
export async function fillValidSideModalForm(
  form: Locator,
  profile: LeadFormProfileKey,
  options: FillLeadOptions = {},
  leadData: Partial<LeadFieldData> = {},
): Promise<ExtraLeadFields> {
  return fillLeadFormByFormId(form, { ...getValidLeadData(profile), ...leadData }, options);
}

/* Extra lead dropdowns (bedrooms, move date, budget, first-time buyer): optional in the US, required in Canada. */

/** Selected values for the extra lead fields; '' for any field that is absent from the form. */
export type ExtraLeadFields = {
  bedroomCount: string;
  desiredMoveDate: string;
  newBudget: string;
  firstTimeHomeBuyer: string;
};

/** Read the lead form's id or name from the element, its form, or a nearby FormInstance. */
export async function getFormId(form: Locator): Promise<string> {
  const rawFormId = await form
    .evaluate((element) => {
      const container = element instanceof HTMLElement ? element : null;
      const candidates = [
        container,
        container?.closest('form'),
        container?.closest('[id*="FormInstance"]'),
        container?.querySelector('form'),
        container?.querySelector('[id*="FormInstance"]'),
      ].filter(Boolean) as HTMLElement[];

      for (const candidate of candidates) {
        for (const attributeName of ['id', 'name', 'data-form-id', 'data-formid', 'data-testid']) {
          const value = candidate.getAttribute(attributeName);

          if (value?.trim()) {
            return value;
          }
        }
      }

      return '';
    })
    .catch(() => '');

  return rawFormId ?? '';
}

/** True when the form id names Canada (the ScheduleAVisit Canada site). */
export async function isCanadaForm(form: Locator): Promise<boolean> {
  return /canada/i.test(await getFormId(form));
}

/** Fill the standard fields and any extra dropdowns; returns the extra values chosen for evidence. */
export async function fillLeadFormByFormId(
  form: Locator,
  data: LeadFieldData,
  options: FillLeadOptions = {},
  attempt?: number,
): Promise<ExtraLeadFields> {
  await fillLeadFormFields(form, data, options);

  return fillExtraLeadFieldsIfPresent(form, attempt);
}

/** Fill any extra dropdowns after a custom standard-field fill; returns the values chosen. */
export async function fillExtraLeadFieldsIfPresent(
  form: Locator,
  attempt?: number,
): Promise<ExtraLeadFields> {
  return fillExtraLeadFields(form, attempt);
}

/** Reports fields the country expects but the form lacks; such a form still submits, just a thinner lead. */
export async function reportLeadFormShape(form: Locator, formName: string): Promise<void> {
  const location = getLocationConfig().country as LocationKey;

  // Probe the form itself; filled values cover only the four dropdowns, not every expected field.
  const probes: Record<LeadFormField, Locator> = {
    comments: findCommentsField(form),
    bedroomCount: findSelectByLabel(form, /bedroom/i, 'bedroom'),
    desiredMoveDate: findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move'),
    newBudget: findSelectByLabel(form, /budget/i, 'budget'),
    firstTimeHomeBuyer: findSelectByLabel(form, /first.?time/i, 'firsttime'),
    countryOfResidence: findSelectByLabel(form, /country of residence/i, 'country'),
  };

  const expected = getExpectedLeadFormFields(location, formName);
  const missing: LeadFormField[] = [];

  for (const field of expected) {
    const present = await probes[field]
      .count()
      .then((count) => count > 0)
      .catch(() => false);

    if (!present) {
      missing.push(field);
    }
  }

  if (missing.length) {
    await reportValue(
      `Fields not rendered on ${formName} (skipped)`,
      buildMissingLeadFieldsMessage(formName, location, missing),
    );
  }
}

/** Fill the extra dropdowns that are present; '' for any absent one. */
async function fillExtraLeadFields(form: Locator, attempt?: number): Promise<ExtraLeadFields> {
  return {
    bedroomCount: await selectRandomOptionIfPresent(findSelectByLabel(form, /bedroom/i, 'bedroom')),
    desiredMoveDate: await selectRandomOptionIfPresent(
      findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move'),
    ),
    newBudget: await selectRandomOptionIfPresent(findSelectByLabel(form, /budget/i, 'budget')),
    firstTimeHomeBuyer: await selectFirstTimeHomeBuyerIfPresent(form, attempt),
  };
}

/** Locate a dropdown by accessible name, falling back to its name/id/aria-label attribute token. */
function findSelectByLabel(form: Locator, name: RegExp, attributeToken: string): Locator {
  return form
    .getByRole('combobox', { name })
    .or(
      form.locator(
        `select[name*="${attributeToken}" i], select[id*="${attributeToken}" i], select[aria-label*="${attributeToken}" i]`,
      ),
    );
}

/** Select a random real option and return its text, or '' when the dropdown is absent. */
async function selectRandomOptionIfPresent(select: Locator): Promise<string> {
  const target = select.first();

  if (!(await target.count()) || !(await target.isVisible().catch(() => false))) {
    return '';
  }

  const options = target.locator('option');
  const optionCount = await options.count();

  if (optionCount <= 1) {
    return ''; // Only a placeholder option.
  }

  const optionIndex = 1 + Math.floor(Math.random() * (optionCount - 1)); // Skip the placeholder at index 0.
  const optionText = (
    (await options
      .nth(optionIndex)
      .textContent()
      .catch(() => '')) ?? ''
  ).trim();

  await target.selectOption({ index: optionIndex }).catch(() => undefined);

  return optionText;
}

/** Answer First Time Home Buyer: Yes on odd attempts, No on even, random without an attempt. */
async function selectFirstTimeHomeBuyerIfPresent(form: Locator, attempt?: number): Promise<string> {
  const select = findSelectByLabel(form, /first.?time.*home.?buyer|first time homebuyer/i, 'buyer');

  if (attempt !== undefined) {
    const desired = attempt % 2 === 1 ? 'Yes' : 'No';

    if (await selectYesNoOptionByLabel(select, desired)) {
      return desired;
    }
  }

  const value = await selectRandomOptionIfPresent(select);

  return value ? normalizeYesNoValue(value) : '';
}

/** Select the Yes/No option matching `desired`; true when selected. */
async function selectYesNoOptionByLabel(select: Locator, desired: string): Promise<boolean> {
  const target = select.first();

  if (!(await target.count()) || !(await target.isVisible().catch(() => false))) {
    return false;
  }

  const options = target.locator('option');
  const optionCount = await options.count();

  for (let index = 0; index < optionCount; index++) {
    const optionText = (
      (await options
        .nth(index)
        .textContent()
        .catch(() => '')) ?? ''
    ).trim();

    if (normalizeYesNoValue(optionText) === desired) {
      await target.selectOption({ index }).catch(() => undefined);
      return true;
    }
  }

  return false;
}

/** Normalize "yes"/"no" to "Yes"/"No". */
function normalizeYesNoValue(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'yes') {
    return 'Yes';
  }

  if (normalized === 'no') {
    return 'No';
  }

  return value.trim();
}
