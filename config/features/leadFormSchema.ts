import type { LocationKey } from '../locations/locationConfig';

// Fields each country's lead forms should expose. A declared field that does not render is
// skipped and listed in the report; whether a field is required is read from the form itself.

export type LeadFormField =
  | 'comments'
  | 'bedroomCount'
  | 'desiredMoveDate'
  | 'newBudget'
  | 'firstTimeHomeBuyer'
  | 'countryOfResidence';

/** Fields every lead form in a country must expose. */
const REQUIRED_BY_LOCATION: Record<LocationKey, readonly LeadFormField[]> = {
  USA: ['bedroomCount', 'desiredMoveDate', 'newBudget', 'countryOfResidence'],
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

/** Report text for absent fields, naming the file to update. */
export function buildMissingLeadFieldsMessage(
  formName: string,
  location: LocationKey,
  missing: LeadFormField[],
): string {
  return [
    `${formName} does not render expected field(s): ${missing.join(', ')}. They were skipped.`,
    '',
    `${location} lead forms are declared to expose these in`,
    'config/features/leadFormSchema.ts. Either the form lost a field (the lead',
    'reaching the CRM is thinner than intended), or the field locator no longer',
    'matches. If the form genuinely changed, update the declaration there.',
  ].join('\n');
}
