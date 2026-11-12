import { detailKinds } from './organisationDetailField';
import { readEveryDetail, type DetailField } from './organisationDetailGroups';
import type { OrganisationDetails } from './organisationRules';

/** What an edit gave for one field of the details: its text, or null when the edit left the field out. */
export type GivenDetail = (fieldName: string) => string | null;

const nameField = 'name';

/** The details as an edit leaves them: every value given replaces, every value left out keeps what is there. */
export function editedOrganisationDetails(given: GivenDetail, current: OrganisationDetails): OrganisationDetails {
	return {
		name: given(nameField) ?? current.name,
		...readEveryDetail((field) => asStored(field, given(field.key) ?? current[field.key]))
	};
}

function asStored(field: DetailField, text: string): string {
	if (field.kind === detailKinds.email) return text.toLowerCase();
	return text;
}
