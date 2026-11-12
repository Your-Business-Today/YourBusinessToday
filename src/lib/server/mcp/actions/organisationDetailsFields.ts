import { editedOrganisationDetails } from '$lib/data/editedOrganisationDetails';
import { organisationDetailFields } from '$lib/data/organisationDetailGroups';
import { readText, textField } from '../actionTypes';
import type { OrganisationDetails } from '$lib/data/organisationRules';

export const organisationIdField = textField('The organisation id, as list_organisations gives it');

const keepText = ' — leave out to keep what is there';

const detailFields = organisationDetailFields.map((field) => [field.key, textField(`${field.meaning}${keepText}`)]);

export const organisationDetailsFields = {
	name: textField('What the organisation is called'),
	...Object.fromEntries(detailFields)
};

/** The details as the action leaves them: every field given replaces, every field left out keeps what is there. */
export function organisationDetailsAfter(input: Record<string, unknown>, current: OrganisationDetails): OrganisationDetails {
	return editedOrganisationDetails((fieldName) => given(input, fieldName), current);
}

function given(input: Record<string, unknown>, field: string): string | null {
	if (input[field] === undefined || input[field] === null) return null;
	return readText(input, field);
}
