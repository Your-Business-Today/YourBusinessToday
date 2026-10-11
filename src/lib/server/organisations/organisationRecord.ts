import type { OrganisationPlace } from '$lib/data/organisationAccess';
import type { OrganisationDetails } from '$lib/data/organisationRules';

export type Organisation = OrganisationPlace & OrganisationDetails & { createdAt: string };

export function parseOrganisationRecord(row: Record<string, unknown>): Organisation {
	return {
		id: row.id as string,
		parentOrganisationId: (row.parent_organisation_id as string) ?? null,
		name: row.name as string,
		address: (row.address as string) ?? '',
		accountsContact: {
			name: (row.accounts_contact_name as string) ?? '',
			email: (row.accounts_contact_email as string) ?? '',
			phone: (row.accounts_contact_phone as string) ?? ''
		},
		createdAt: row.created_at as string
	};
}

export function organisationDetailColumns(details: OrganisationDetails): Record<string, string> {
	const contact = details.accountsContact;
	return {
		name: details.name,
		address: details.address,
		accounts_contact_name: contact.name,
		accounts_contact_email: contact.email,
		accounts_contact_phone: contact.phone
	};
}

export function isSubOrganisation(organisation: Organisation): boolean {
	return organisation.parentOrganisationId !== null;
}
