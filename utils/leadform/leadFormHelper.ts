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

/*
 * Shared lead-form helpers.
 *
 * The reusable lead-form primitives and the central form test data the desktop page objects share,
 * so the fill / select / consent / submit / validation logic is not duplicated per page.
 */

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

/*
 * Test data accessors, sourced from data/test_data.json.
 *
 * Each profile references a shared region (country/phone/zip) and overrides only the values unique
 * to it, so no field value is duplicated across profiles.
 */

/** Resolve a profile's effective country (from its region) plus its own phone/zip. */
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
    // Run id lives in the EMAIL only. Appending it to the surname produced
    // "DoNotContact-local<id>", which the site rejects with "Invalid Last name" -
    // it broke every lead submission test. The plus-addressed email already
    // gives the CRM a per-run handle, so the name does not need one.
    lastName: LEAD.validName.lastName,
    email: buildValidEmail(entry.emailPrefix),
    phone: location.phone,
    zip: location.zip,
    country: location.country,
  };
}

/** Get invalid-email lead data for a profile (falls back to the shared/region values where no override exists). */
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

/** Select a dropdown value when the field exists, preferring a label then falling back to the first option. */
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

/** Select country of residence when the field exists, preferring a label then falling back to the first option. */
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

/** Check the appropriate consent checkbox when present (skips "real estate agent" opt-ins). */
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

/**
 * How a lead-form Submit button is matched, without going through the
 * accessibility tree.
 *
 * The page objects identify a lead form by "the thing containing a Submit
 * button", and a `getByRole` lookup cannot do that here: the site's
 * National-promotion popup is a react-modal, and while it's mounted react-modal
 * marks `#root` `aria-hidden="true"`, which takes the whole page out of the
 * accessibility tree. Every role lookup then comes back empty and a form that is
 * rendered, visible and hydrated reports as absent - the failures read "not
 * present on the community page" and "sidebar/modal form did not open" for forms
 * plainly visible in the screenshots.
 *
 * CSS and text matching don't care about `aria-hidden`, so form lookups use this
 * instead. One shared constant so every page object matches the same button. The
 * real markup is `<button type="submit" value="SUBMIT">SUBMIT</button>`; the
 * other variants cover forms that submit through an `<input type="submit">` or a
 * styled `role="button"`.
 */
export const SUBMIT_BUTTON_SELECTOR =
  'button[type="submit"], input[type="submit"], button:has-text("Submit"), [role="button"]:has-text("Submit")';

/**
 * Text shared by every "Get Information" / "Stay Updated" CTA that opens the lead-form modal.
 *
 * Anchored so it only matches the CTA itself, never a wrapper whose text merely contains it.
 */
export const GET_INFORMATION_CTA_TEXT = /^\s*(?:Get Information|Stay Updated)\s*$/i;

/**
 * How the "Get Information" CTA is matched, without going through the accessibility tree.
 *
 * Name-based lookups (`getByRole('button', { name: /Get Information/i })`) find nothing on
 * community, condo and plan detail pages: the hero CTA renders as
 * `<button aria-label="Stay updated about this community">GET INFORMATION</button>`, so its
 * accessible name is the aria-label, not the visible text. Other detail pages render the same
 * modal trigger as a link-style element with no href. Real href anchors are excluded so this helper
 * does not follow `/contact` or `#contact` paths and accidentally validate the primary/footer form.
 *
 * Matching on visible text and non-navigating controls keeps the real side-modal trigger, the same
 * way {@link SUBMIT_BUTTON_SELECTOR} sidesteps `aria-hidden` for form lookups.
 *
 * Container is deliberately not part of the match. The detail pages render the same trigger three
 * times - in the breadcrumb bar, in the sticky `#detailsBlockBar`, and in the sticky `#anchor-cta` -
 * and which copy is the real one depends on the viewport. At phone widths the breadcrumb copy is in
 * a `hidden md:flex` wrapper and boxes at 0x0, so `#anchor-cta` is the ONLY tappable Get Information
 * on the page; excluding the sticky bars here left mobile runs with no CTA at all. Picking between
 * the copies is `LeadFormFlow.getVisibleGetInformationCta`'s job, because it needs the live box: the
 * bars are `position: fixed` and park off-canvas at a negative `top` until the hero is scrolled past,
 * which no selector can express.
 *
 * Matching on the container instead of `[aria-hidden="true"]` is also why an open React modal does
 * not blank this out - it aria-hides the whole app root, so an aria-based exclusion would leave no
 * CTAs on any page whose promo popup has not been dismissed yet.
 */
export const GET_INFORMATION_CTA_SELECTOR = [
  'button',
  'a:not([href])',
  'a[href=""]',
  'a[href^="javascript:"]',
].join(', ');

/** Get the "Get Information" CTAs that open the lead-form modal on the given page. */
export function getInformationCtas(page: Page): Locator {
  return page.locator(GET_INFORMATION_CTA_SELECTOR).filter({ hasText: GET_INFORMATION_CTA_TEXT });
}

/**
 * The "Get Information" CTA a visitor can actually see on this page.
 *
 * The detail pages ship the same trigger three times and which copy renders depends on the
 * viewport, so taking the first match in DOM order hands a phone run the breadcrumb copy - which
 * sits in a `hidden md:flex` wrapper and boxes at 0x0 there, and so can never be visible. Resolving
 * to the rendered copy is what lets one locator assert the CTA in both layouts.
 */
export function getVisibleInformationCta(page: Page): Locator {
  return getInformationCtas(page).filter({ visible: true }).first();
}

/**
 * The plan detail / QMI / condo plan modal trigger, which lives in the breadcrumb bar:
 * `<button role="link" aria-label="Get Information">` on some pages and
 * `<button role="link" aria-label="Stay Updated">` on others, sometimes next to a real `<a href>`
 * "Schedule a Self-Guided Tour" link.
 *
 * Matched by container plus {@link GET_INFORMATION_CTA_TEXT} rather than by aria-label or class: the
 * label varies between the two wordings, and the styled-component class hashes
 * (`Button__StyledButton-sc-dz2fra-0` on one page, `sc-gGKoUb` on another) are build-specific.
 * Scoping to the breadcrumb is what stops the off-canvas copies from being picked by position.
 * Callers fall back to {@link getInformationCtas} for pages without a breadcrumb CTA.
 */
export function getBreadcrumbInformationCta(page: Page): Locator {
  return page.locator('#breadcrumb button').filter({ hasText: GET_INFORMATION_CTA_TEXT });
}

/**
 * The community / condo community modal trigger, which lives in the hero section:
 * `<button aria-label="Stay updated about this community">Stay Updated</button>` inside
 * `#HeaderPlanPage`. Unlike the off-canvas copies it carries no `role="link"`, but the container is
 * the stable part - the label wording and the styled-component classes both vary by page.
 *
 * It renders only once the hero is scrolled into view, so a lookup straight after navigation finds
 * nothing; callers reveal it first.
 */
export function getHeroInformationCta(page: Page): Locator {
  return page.locator('#HeaderPlanPage button').filter({ hasText: GET_INFORMATION_CTA_TEXT });
}

/** Get the lead-form submit button. */
export function getSubmitButton(form: Locator): Locator {
  return form.locator(SUBMIT_BUTTON_SELECTOR).first();
}

/**
 * Closes the AtlasRTX chat iframe when it is visible over a form.
 *
 * The widget is third-party and cross-origin, so the test cannot safely click a
 * close control inside the iframe. Hiding its host container keeps Submit clicks
 * honest for the form itself while removing only the external chat chrome that
 * floats over desktop and mobile viewports. The site can mount the widget more
 * than once, so every visible instance is hidden, not just the first.
 */
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

/**
 * Click a form submit button without waiting on third-party submit requests.
 *
 * On PROD the button is never clicked: no lead form may be submitted there. The
 * form's validation is triggered by leaving each field instead, which raises the
 * same inline "is Required" / invalid-email messages a submit attempt would, so
 * the validation tests run unchanged on every environment.
 *
 * `options.submitButton` overrides how the submit button is resolved (some forms
 * label theirs something other than "Submit").
 * `options.settle` overrides the post-click settle behavior. Without an override,
 * the helper waits for the DOM to go quiet instead of sleeping for a fixed time.
 */
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
  // No force: an overlay covering Submit means the form is not actually
  // submittable, which is a finding rather than something to click through.
  // noWaitAfter stays - the third-party submit request must not be awaited.
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

/**
 * Raises a form's validation messages without submitting it.
 *
 * Mattamy's Sitecore lead forms validate each field when it loses focus, so
 * focusing and leaving every field shows the same "Error: First name is Required"
 * and invalid-email messages a submit attempt does - with no request sent.
 */
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

/** Required fields are whatever the form itself marks, not a hardcoded list. */
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
      // The visible <label> comes first: once a field fails validation the site
      // rewrites its aria-label to the error text ("Error: First name is Required").
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

/**
 * Assert every visible field the form marks as required rejects an empty value.
 *
 * Each `required` / `aria-required="true"` field that is still empty must report
 * `validity.valueMissing` and show its own "<label> is Required" message. A
 * required field the page prefilled has nothing to reject, so it is reported
 * rather than failed. Call after {@link clickSubmit} on the empty form.
 */
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

/**
 * Fill a standard getByRole-based lead form from {@link LeadFieldData}.
 * Each field is only touched when present, so the same call works for
 * forms with differing field sets.
 */
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

/**
 * Audit a standard Mattamy side-modal lead form, then check its required-field validation.
 *
 * First name, Last name, Email and the submit button are what make it a lead form, so they must
 * render. Every other field - phone, zip, the dropdowns declared in leadFormSchema, and the
 * community/plan dropdowns the opening page asks for - is checked when the form renders it and
 * recorded in the report as skipped when it does not. The fields the form itself marks required
 * are then validated without submitting (see {@link expectRequiredErrorsInForm}).
 */
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

  // Core fields first: once they render the form has finished rendering, so a
  // count of zero on an optional field below means it is absent, not late.
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

/** Fill a side modal form with invalid-email data using the shared profile and form-id branching. */
export async function fillInvalidSideModalForm(
  form: Locator,
  profile: LeadFormProfileKey,
  options: FillLeadOptions = {},
): Promise<void> {
  await fillLeadFormFields(form, getInvalidLeadData(profile), options);
}

/**
 * Fill a side modal form with valid data using the shared profile, including any extra dropdowns
 * present. Fields in `leadData` replace the profile's values, such as a caller-supplied email.
 */
export async function fillValidSideModalForm(
  form: Locator,
  profile: LeadFormProfileKey,
  options: FillLeadOptions = {},
  leadData: Partial<LeadFieldData> = {},
): Promise<ExtraLeadFields> {
  return fillLeadFormByFormId(form, { ...getValidLeadData(profile), ...leadData }, options);
}

/*
 * Extra lead fields: Bedroom Count, Desired Move Date, New Budget and First Time Home Buyer.
 *
 * All four render as dropdowns on the US / custom forms (optional there) and on the Canada
 * (ScheduleAVisit) forms (required there). The helpers fill whichever are present and return the
 * chosen values so callers can capture them as submission evidence.
 *
 * The first three get a random valid value. First Time Home Buyer alternates by iteration (odd
 * attempt -> Yes, even -> No) when an attempt number is supplied, and is random otherwise.
 */

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

/** True when the lead form belongs to the ScheduleAVisit Canada site (its form id contains "Canada"). */
export async function isCanadaForm(form: Locator): Promise<boolean> {
  return /canada/i.test(await getFormId(form));
}

/**
 * Fill a lead form: the standard fields plus whichever of the four extra dropdowns (Bedroom Count,
 * Desired Move Date, New Budget and First Time Home Buyer) the form renders. The extra fields are
 * optional on US / custom forms and required on Canada (ScheduleAVisit) forms, so filling those
 * that are present covers both. Each extra dropdown gets a valid option, so required fields never
 * block submission. Returns the extra field values chosen (all '' when none are present) so callers
 * can capture them as evidence. Pass an attempt number to alternate First Time Home Buyer by
 * iteration (odd -> Yes, even -> No).
 */
export async function fillLeadFormByFormId(
  form: Locator,
  data: LeadFieldData,
  options: FillLeadOptions = {},
  attempt?: number,
): Promise<ExtraLeadFields> {
  await fillLeadFormFields(form, data, options);

  return fillExtraLeadFieldsIfPresent(form, attempt);
}

/**
 * Fill whichever of the four extra dropdowns (Bedroom Count, Desired Move Date, New Budget and
 * First Time Home Buyer) are present, returning the values chosen (all '' when none are present).
 * The fields are optional on US / custom forms and required on Canada (ScheduleAVisit) forms, so
 * this fills them regardless of the form's country. Use it after filling the standard fields with a
 * custom, field-level fill method (i.e. where {@link fillLeadFormByFormId} can't be used directly).
 * Pass an attempt number to alternate First Time Home Buyer by iteration (odd -> Yes, even -> No).
 */
export async function fillExtraLeadFieldsIfPresent(
  form: Locator,
  attempt?: number,
): Promise<ExtraLeadFields> {
  return fillExtraLeadFields(form, attempt);
}

/**
 * Records in the report any field the form's country declares but the form does not render.
 *
 * Checked before submit: a form that lost its budget dropdown still submits and
 * still shows a success message, it just sends the CRM a thinner lead. Absent
 * fields are left unfilled and the submission goes ahead, so the report is
 * where a thinner lead shows up.
 */
export async function reportLeadFormShape(form: Locator, formName: string): Promise<void> {
  const location = getLocationConfig().country as LocationKey;

  // Probe the FORM, do not take the caller's word for it. The four dropdowns are
  // the only thing fillExtraLeadFields returns, so a signature that accepted
  // values would report comments and country-of-residence missing on every USA
  // form. Locators mirror the ones used to fill each field.
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

/** Fill whichever of the four extra dropdowns are present; returns the values chosen ('' for any absent field). */
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
  const optionText = (
    (await options
      .nth(optionIndex)
      .textContent()
      .catch(() => '')) ?? ''
  ).trim();

  await target.selectOption({ index: optionIndex }).catch(() => undefined);

  return optionText;
}

/**
 * Select the Yes/No answer in the "First Time Home Buyer" `<select>`. When an attempt number is
 * given, the answer alternates by iteration (odd attempt -> Yes, even -> No) so the value is driven
 * by the iteration rather than the form; it falls back to a random valid option when no attempt is
 * given or the desired Yes/No option is missing. Returns the chosen value normalized to "Yes"/"No",
 * or '' when the field is absent.
 */
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

/** Select the Yes/No option matching `desired` in the first visible matching dropdown; returns true when selected. */
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
