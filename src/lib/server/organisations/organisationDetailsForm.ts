import type { OrganisationDetails } from '$lib/data/organisationRules';

/** The details form as one record; the rules decide whether it can be saved. */
export function readOrganisationDetails(formData: FormData): OrganisationDetails {
	return {
		name: text(formData, 'name'),
		address: text(formData, 'address'),
		accountsContact: {
			name: text(formData, 'accountsContactName'),
			email: text(formData, 'accountsContactEmail').toLowerCase(),
			phone: text(formData, 'accountsContactPhone')
		}
	};
}

function text(formData: FormData, field: string): string {
	return String(formData.get(field) ?? '').trim();
}
