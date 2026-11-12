import { editedOrganisationDetails } from '$lib/data/editedOrganisationDetails';
import type { OrganisationDetails } from '$lib/data/organisationRules';

/**
 * The details as the form leaves them; the rules decide whether they can be saved. A field the form does not
 * carry keeps what is there, so a page opened before a field was added never blanks it.
 */
export function readOrganisationDetails(formData: FormData, current: OrganisationDetails): OrganisationDetails {
	return editedOrganisationDetails((fieldName) => typedInto(formData, fieldName), current);
}

function typedInto(formData: FormData, fieldName: string): string | null {
	const typed = formData.get(fieldName);
	if (typed === null) return null;
	return String(typed).trim();
}
