import type { SupabaseClient } from '@supabase/supabase-js';
import { parseClientRecord, type Client } from '$lib/server/clients/clientRecord';

export type PersonCompany = Client & {
	contactId: string;
	role: string;
	officerRole: string;
	isResearched: boolean;
	parentName: string;
};

const companyColumns = 'id, role, officer_role, clients(*, parent:parent_client_id(name))';

export async function getCompaniesForPerson(
	supabase: SupabaseClient,
	personId: string
): Promise<PersonCompany[]> {
	const { data, error } = await supabase
		.from('client_contacts')
		.select(companyColumns)
		.eq('person_id', personId);
	if (error) throw error;
	return (data as unknown as Record<string, any>[])
		.filter((row) => row.clients !== null)
		.map(toPersonCompany)
		.sort((first, second) => first.name.localeCompare(second.name));
}

function toPersonCompany(row: Record<string, any>): PersonCompany {
	const clientRow = row.clients;
	const client = parseClientRecord(clientRow);
	const { profile } = client;
	const parent = clientRow.parent;
	return {
		...client,
		contactId: row.id as string,
		role: (row.role ?? '') as string,
		officerRole: (row.officer_role ?? '') as string,
		isResearched: profile.sourceUrl !== '' || profile.summary !== '',
		parentName: (parent?.name ?? '') as string
	};
}
