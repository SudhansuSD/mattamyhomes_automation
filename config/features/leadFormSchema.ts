import type { LocationKey } from '../locations/locationConfig';

/**
 * Which fields a lead form should expose, per country.
 *
 * Taken from the recorded submissions in
 * reports/form-submissions/Mattamy_Form_Submission_Evidence_STAGE_*.xlsx: every
 * USA form has Comments, every Canada form has First Time Home Buyer instead.
 *
 * Without this a form that lost its budget dropdown still submitted, still
 * passed, and just sent the CRM a thinner lead.
 */

export type LeadFormField =
  | 'comments'
  | 'bedroomCount'
  | 'desiredMoveDate'
  | 'newBudget'
  | 'firstTimeHomeBuyer'
  | 'countryOfResidence';

/** Fields every lead form in a country must expose. */
const REQUIRED_BY_LOCATION: Record<LocationKey, readonly LeadFormField[]> = {
  USA: ['comments', 'bedroomCount', 'desiredMoveDate', 'newBudget', 'countryOfResidence'],
  CAN: ['bedroomCount', 'desiredMoveDate', 'newBudget', 'firstTimeHomeBuyer', 'countryOfResidence'],
};

/** Per-form exceptions, matched on the form's evidence name. */
const FORM_EXCEPTIONS: ReadonlyArray<{
  match: RegExp;
  location?: LocationKey;
  absent?: readonly LeadFormField[];
  additional?: readonly LeadFormField[];
}> = [
  { match: /standard page|broker expo/i, location: 'USA', absent: ['comments'] },
  { match: /promo/i, location: 'USA', additional: ['firstTimeHomeBuyer'] },
];

/** The fields this specific form is expected to expose. */
export function getExpectedLeadFormFields(
  location: LocationKey,
  formName: string,
): LeadFormField[] {
  const expected = new Set<LeadFormField>(REQUIRED_BY_LOCATION[location]);

  for (const exception of FORM_EXCEPTIONS) {
    if (exception.location && exception.location !== location) continue;
    if (!exception.match.test(formName)) continue;

    exception.absent?.forEach((field) => expected.delete(field));
    exception.additional?.forEach((field) => expected.add(field));
  }

  return [...expected];
}

/** Expected fields that came back empty. [] means the form matched. */
export function findMissingLeadFormFields(
  location: LocationKey,
  formName: string,
  filled: Partial<Record<LeadFormField, string>>,
): LeadFormField[] {
  return getExpectedLeadFormFields(location, formName).filter((field) => {
    const value = filled[field];
    return !value || !value.trim();
  });
}

/** The failure text, naming the file to edit when the form legitimately changed. */
export function buildMissingLeadFieldsMessage(
  formName: string,
  location: LocationKey,
  missing: LeadFormField[],
): string {
  return [
    `${formName} submitted without expected field(s): ${missing.join(', ')}.`,
    '',
    `${location} lead forms are declared to expose these in`,
    'config/features/leadFormSchema.ts. Either the form lost a field (a defect -',
    'the lead reaching the CRM is thinner than intended), or the field locator no',
    'longer matches. If the form genuinely changed, update the declaration there.',
  ].join('\n');
}
