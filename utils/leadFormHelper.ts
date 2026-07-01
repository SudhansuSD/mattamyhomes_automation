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
