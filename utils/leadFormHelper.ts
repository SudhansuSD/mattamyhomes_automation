import { expect, Locator, Page } from '@playwright/test';
import testData from '../data/test_data.json';

/* ==========================================================
   Shared Lead-Form Helpers (Web / Playwright)

   Common, reusable lead-form primitives and the centralized
   form test data used across the desktop page objects. Keeping
   these here removes the per-page duplication of fill / select /
   consent / submit / validation logic.
========================================================== */

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

/* ==========================================================
   Test data accessors (sourced from data/test_data.json)

   Each profile references a shared region (country/phone/zip)
   and only overrides the values unique to it, so no field
   value is duplicated across profiles.
========================================================== */

/** Resolve a profile's effective country (from its region) plus its own phone/zip. */
function resolveLocation(profile: WebProfile): { country: string; phone: string; zip: string } {
  return {
    country: REGIONS[profile.region].country,
    phone: profile.phone,
    zip: profile.zip
  };
}

/** Build a unique, valid lead email from a profile prefix. */
export function buildValidEmail(emailPrefix: string): string {
  return `${emailPrefix}${Date.now()}@${LEAD.emailDomain}`;
}

/** Return the raw web lead-form profile entry. */
export function getLeadProfile(profile: LeadFormProfileKey): WebProfile {
  return PROFILES[profile];
}

/** Return valid lead data (with a fresh unique email) for a profile. */
export function getValidLeadData(profile: LeadFormProfileKey): LeadFieldData {
  const entry = PROFILES[profile];
  const location = resolveLocation(entry);

  return {
    firstName: LEAD.validName.firstName,
    lastName: LEAD.validName.lastName,
    email: buildValidEmail(entry.emailPrefix),
    phone: location.phone,
    zip: location.zip,
    country: location.country
  };
}

/** Return invalid-email lead data for a profile (falls back to the shared/region values where no override exists). */
export function getInvalidLeadData(profile: LeadFormProfileKey): LeadFieldData {
  const entry = PROFILES[profile];
  const location = resolveLocation(entry);

  return {
    firstName: LEAD.invalidName.firstName,
    lastName: LEAD.invalidName.lastName,
    email: entry.invalidEmail ?? LEAD.invalidEmail,
    phone: entry.invalidPhone ?? location.phone,
    zip: entry.invalidZip ?? location.zip,
    country: location.country
  };
}

/* ==========================================================
   Field primitives
========================================================== */

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

  await field.first().selectOption({ index: 1 }).catch(() => undefined);
}

/** Select a dropdown value when the field exists, preferring a label then falling back to the first option. */
export async function selectOptionIfPresent(field: Locator, preferredLabel?: string): Promise<void> {
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

  await target.selectOption({ index: 1 }).catch(() => undefined);
}

/** Check a single checkbox when present (used for consent/preference toggles). */
export async function checkIfPresent(field: Locator): Promise<void> {
  const target = field.first();

  if (await target.count()) {
    await target.check({ force: true }).catch(() => undefined);
  }
}

/** Select country of residence when the field exists, preferring a label then falling back to the first option. */
export async function selectCountryIfPresent(form: Locator, preferredCountry?: string): Promise<void> {
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

  await country.selectOption({ index: 1 }).catch(() => undefined);
}

/** Check the appropriate consent checkbox when present (skips "real estate agent" opt-ins). */
export async function checkConsentIfPresent(form: Locator): Promise<void> {
  const named = form.getByRole('checkbox', {
    name: /express consent|providing consent|privacy policy/i
  }).first();

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

/** Return the lead-form submit button. */
export function getSubmitButton(form: Locator): Locator {
  return form.getByRole('button', { name: /submit/i }).first();
}

/** Assert a field is visible only when present in the form. */
export async function expectFieldVisibleIfPresent(
  field: Locator,
  label: string,
  timeout = 10000
): Promise<void> {
  if (await field.count()) {
    await expect(field.first(), `${label} field should be visible`).toBeVisible({ timeout });
  }
}

/* ==========================================================
   Submit + validation
========================================================== */

/** Click a form submit button without waiting on third-party submit requests. */
export async function clickSubmit(page: Page, form: Locator, timeout = 10000): Promise<void> {
  const submitButton = getSubmitButton(form);

  await submitButton.scrollIntoViewIfNeeded();
  await expect(submitButton, 'Submit button should be visible before clicking').toBeVisible({ timeout });
  await submitButton.click({
    force: true,
    noWaitAfter: true,
    timeout: 5000
  });
  await page.waitForTimeout(800);
}

/** Assert expected required-field messages within a lead form. */
export async function expectRequiredErrorsInForm(form: Locator, timeout = 10000): Promise<void> {
  await expect(form.locator('text=/Error:\\s*First name is Required|First name.*Required/i').first())
    .toBeVisible({ timeout });
  await expect(form.locator('text=/Error:\\s*Last name is Required|Last name.*Required/i').first())
    .toBeVisible({ timeout });
  await expect(form.locator('text=/Error:\\s*Email is Required|Email.*Required/i').first())
    .toBeVisible({ timeout });
  await expect(form.locator('text=/Error:\\s*Country of Residence is Required|Country of Residence.*Required/i').first())
    .toBeVisible({ timeout });
  await expect(form.locator('text=/Error:\\s*Zip\\/Postal Code is Required|Zip\\/Postal Code.*Required|Postal.*Required/i').first())
    .toBeVisible({ timeout });
}

/** Assert invalid-email validation within a lead form. */
export async function expectInvalidEmailErrorInForm(form: Locator, timeout = 10000): Promise<void> {
  await expect(form.locator(
    'text=/valid domain name|valid email|invalid email|Error:.*Email|Email.*Invalid/i'
  ).first()).toBeVisible({ timeout });
}

/* ==========================================================
   Composite fill (getByRole-based forms)
========================================================== */

export type FillLeadOptions = {
  emailName?: RegExp;
  selectCountry?: boolean;
  selectCommunity?: boolean;
  selectPlan?: boolean;
  checkConsent?: boolean;
};

export type SideModalFormOptions = FillLeadOptions & {
  timeout?: number;
  expectCommunity?: boolean;
  expectPlan?: boolean;
};

/**
 * Fill a standard getByRole-based lead form from {@link LeadFieldData}.
 * Each field is only touched when present, so the same call works for
 * forms with differing field sets.
 */
export async function fillLeadFormFields(
  form: Locator,
  data: LeadFieldData,
  options: FillLeadOptions = {}
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
    await selectFirstOptionIfPresent(form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first());
  }

  if (options.checkConsent !== false) {
    await checkConsentIfPresent(form);
  }
}

/**
 * Assert the expected side-modal form fields for a standard Mattamy lead form.
 * The common fields are always checked, optional community/plan fields are controlled
 * by options, and Canada ScheduleAVisit form-specific fields are validated by form id.
 */
export async function expectSideModalFormFields(
  form: Locator,
  options: SideModalFormOptions = {}
): Promise<void> {
  const timeout = options.timeout ?? 10000;

  await expectFieldVisibleIfPresent(form.getByRole('textbox', { name: /first name/i }), 'First name', timeout);
  await expectFieldVisibleIfPresent(form.getByRole('textbox', { name: /last name/i }), 'Last name', timeout);
  await expectFieldVisibleIfPresent(form.getByRole('textbox', { name: /^email/i }), 'Email', timeout);
  await expectFieldVisibleIfPresent(
    form.getByRole('combobox', { name: /country of residence/i }).first(),
    'Country of Residence',
    timeout
  );
  await expectFieldVisibleIfPresent(form.getByRole('textbox', { name: /zip|postal/i }), 'Zip/Postal Code', timeout);
  await expectFieldVisibleIfPresent(form.getByRole('textbox', { name: /phone/i }), 'Phone number', timeout);

  if (options.expectCommunity) {
    await expectFieldVisibleIfPresent(
      form.getByRole('combobox', { name: /community/i }).first(),
      'Community',
      timeout
    );
  }

  if (options.expectPlan) {
    await expectFieldVisibleIfPresent(
      form.getByRole('combobox', { name: /suite|floorplan|plan/i }).first(),
      'Suite/Floorplan/Plan',
      timeout
    );
  }

  // These four dropdowns are optional on the US / custom forms but required on the Canada
  // (ScheduleAVisit) forms, so their visibility is only asserted for Canada forms.
  if (await isCanadaForm(form)) {
    await expectFieldVisibleIfPresent(findSelectByLabel(form, /bedroom/i, 'bedroom'), 'Bedroom Count', timeout);
    await expectFieldVisibleIfPresent(
      findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move'),
      'Desired Move Date',
      timeout
    );
    await expectFieldVisibleIfPresent(findSelectByLabel(form, /budget/i, 'budget'), 'Budget', timeout);
    await expectFieldVisibleIfPresent(
      findSelectByLabel(form, /first.?time.*home.?buyer|first time homebuyer/i, 'buyer'),
      'First Time Home Buyer',
      timeout
    );
  }

  await expect(getSubmitButton(form), 'Submit button should be visible inside side modal form')
    .toBeVisible({ timeout });
}

/** Fill a side modal form with invalid-email data using the shared profile and form-id branching. */
export async function fillInvalidSideModalForm(
  form: Locator,
  profile: LeadFormProfileKey,
  options: FillLeadOptions = {}
): Promise<void> {
  await fillLeadFormFields(form, getInvalidLeadData(profile), options);
}

/** Fill a side modal form with valid data using the shared profile, including any extra dropdowns present. */
export async function fillValidSideModalForm(
  form: Locator,
  profile: LeadFormProfileKey,
  options: FillLeadOptions = {}
): Promise<ExtraLeadFields> {
  return fillLeadFormByFormId(form, getValidLeadData(profile), options);
}

/* ==========================================================
   Extra lead fields (Bedroom Count / Desired Move Date /
   New Budget / First Time Home Buyer)

   These four dropdowns render on both the US / custom forms (where
   they are optional) and the Canada (ScheduleAVisit) forms (where they
   are required). First Time Home Buyer used to be a Yes/No radio group
   and is now a Yes/No dropdown. The helpers fill whichever of the four
   are present, pick a random valid value for each, and return the
   chosen values so callers can capture them as submission evidence.
========================================================== */

/** Selected values for the extra lead fields; '' for any field that is absent from the form. */
export type ExtraLeadFields = {
  bedroomCount: string;
  desiredMoveDate: string;
  newBudget: string;
  firstTimeHomeBuyer: string;
};

/** Read the lead form's id/name (checks the element itself, its <form>, and any FormInstance ancestor/descendant). */
export async function getFormId(form: Locator): Promise<string> {
  const rawFormId = await form
    .evaluate((element) => {
      const container = element instanceof HTMLElement ? element : null;
      const candidates = [
        container,
        container?.closest('form'),
        container?.closest('[id*="FormInstance"]'),
        container?.querySelector('form'),
        container?.querySelector('[id*="FormInstance"]')
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

/** True when the lead form belongs to the ScheduleAVisit Canada site (its form id contains "Canada"). */
export async function isCanadaForm(form: Locator): Promise<boolean> {
  return /canada/i.test(await getFormId(form));
}

/**
 * Fill a lead form: the standard fields plus whichever of the four extra dropdowns (Bedroom Count,
 * Desired Move Date, New Budget and First Time Home Buyer) the form renders. The extra fields are
 * optional on US / custom forms and required on Canada (ScheduleAVisit) forms, so filling those
 * that are present covers both. Each extra dropdown gets a random valid option, so required fields
 * never block submission. Returns the extra field values chosen (all '' when none are present) so
 * callers can capture them as evidence.
 */
export async function fillLeadFormByFormId(
  form: Locator,
  data: LeadFieldData,
  options: FillLeadOptions = {}
): Promise<ExtraLeadFields> {
  await fillLeadFormFields(form, data, options);

  return fillExtraLeadFieldsIfPresent(form);
}

/**
 * Fill whichever of the four extra dropdowns (Bedroom Count, Desired Move Date, New Budget and
 * First Time Home Buyer) are present, returning the values chosen (all '' when none are present).
 * The fields are optional on US / custom forms and required on Canada (ScheduleAVisit) forms, so
 * this fills them regardless of the form's country. Use it after filling the standard fields with a
 * custom, field-level fill method (i.e. where {@link fillLeadFormByFormId} can't be used directly).
 */
export async function fillExtraLeadFieldsIfPresent(form: Locator): Promise<ExtraLeadFields> {
  return fillExtraLeadFields(form);
}

/** Fill whichever of the four extra dropdowns are present; returns the values chosen ('' for any absent field). */
async function fillExtraLeadFields(form: Locator): Promise<ExtraLeadFields> {
  return {
    bedroomCount: await selectRandomOptionIfPresent(findSelectByLabel(form, /bedroom/i, 'bedroom')),
    desiredMoveDate: await selectRandomOptionIfPresent(
      findSelectByLabel(form, /move.?date|desired move|move.?in/i, 'move')
    ),
    newBudget: await selectRandomOptionIfPresent(findSelectByLabel(form, /budget/i, 'budget')),
    firstTimeHomeBuyer: await selectFirstTimeHomeBuyerIfPresent(form)
  };
}

/** Locate a dropdown by accessible name, falling back to its name/id/aria-label attribute token. */
function findSelectByLabel(form: Locator, name: RegExp, attributeToken: string): Locator {
  return form.getByRole('combobox', { name }).or(
    form.locator(
      `select[name*="${attributeToken}" i], select[id*="${attributeToken}" i], select[aria-label*="${attributeToken}" i]`
    )
  );
}

/** Select a random non-placeholder option in the first visible matching dropdown; returns the option text, or '' when absent. */
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
  const optionText = ((await options.nth(optionIndex).textContent().catch(() => '')) ?? '').trim();

  await target.selectOption({ index: optionIndex }).catch(() => undefined);

  return optionText;
}

/**
 * Select a random Yes/No option in the "First Time Home Buyer" dropdown (it was previously a Yes/No
 * radio group and is now a <select>); returns the chosen value normalized to "Yes"/"No", or ''
 * when the field is absent from the form.
 */
async function selectFirstTimeHomeBuyerIfPresent(form: Locator): Promise<string> {
  const select = findSelectByLabel(form, /first.?time.*home.?buyer|first time homebuyer/i, 'buyer');
  const value = await selectRandomOptionIfPresent(select);

  return value ? normalizeYesNoValue(value) : '';
}

/** Normalize common Yes/No dropdown values so "yes"/"no" render consistently as "Yes"/"No". */
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
