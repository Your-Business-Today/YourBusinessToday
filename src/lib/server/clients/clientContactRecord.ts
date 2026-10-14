export type AffiliationSource = 'staff' | 'companies_house' | 'website';

export type ClientContact = {
	id: string;
	clientId: string;
	personId: string;
	accountId: string | null;
	name: string;
	email: string;
	phone: string;
	role: string;
	officerRole: string;
	appointedOn: string | null;
	affiliationSource: AffiliationSource;
	isPrimary: boolean;
	isPortalAdministrator: boolean;
	invitedAt: string | null;
	createdAt: string;
};

export const clientContactColumns = '*, people(name, email, phone)';

const affiliationSources: AffiliationSource[] = ['staff', 'companies_house', 'website'];

export function parseClientContactRecord(row: Record<string, unknown>): ClientContact {
	const person = (row.people ?? {}) as Record<string, unknown>;
	return {
		id: row.id as string,
		clientId: row.client_id as string,
		personId: row.person_id as string,
		accountId: (row.account_id ?? null) as string | null,
		name: (person.name ?? '') as string,
		email: (person.email ?? '') as string,
		phone: (person.phone ?? '') as string,
		role: (row.role ?? '') as string,
		officerRole: (row.officer_role ?? '') as string,
		appointedOn: (row.appointed_on ?? null) as string | null,
		affiliationSource: parseAffiliationSource(row.affiliation_source),
		isPrimary: row.is_primary as boolean,
		isPortalAdministrator: row.is_portal_administrator === true,
		invitedAt: (row.invited_at ?? null) as string | null,
		createdAt: row.created_at as string
	};
}

export function parseAffiliationSource(value: unknown): AffiliationSource {
	const source = affiliationSources.find((candidate) => candidate === value);
	if (source === undefined) return 'staff';
	return source;
}
