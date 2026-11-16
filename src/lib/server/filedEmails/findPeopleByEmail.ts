import type { SupabaseClient } from '@supabase/supabase-js';
import { parseClientStage } from '$lib/data/clientLifecycle';
import { literalInLike } from '$lib/server/schema/likePattern';
import type { EmailCompany } from './emailOwner';

/** Someone on the People register held by an address, with the clients and leads they are a contact at. */
export type PersonByEmail = { id: string; name: string; email: string; companies: EmailCompany[] };

type CompanyRow = { id: string; name: string; lifecycle_stage: string };
type PersonRow = { id: string; name: string; email: string; client_contacts: { clients: CompanyRow | null }[] | null };

const personColumns = 'id, name, email, client_contacts(clients(id, name, lifecycle_stage))';

/** The people whose email is one of the addresses, matched whatever its case. */
export async function findPeopleByEmail(supabase: SupabaseClient, addresses: string[]): Promise<PersonByEmail[]> {
	if (addresses.length === 0) return [];
	const anyOfTheAddresses = addresses.map((address) => `email.ilike.${literalInLike(address)}`).join(',');
	const { data, error } = await supabase.from('people').select(personColumns).or(anyOfTheAddresses);
	if (error) throw error;
	return (data as unknown as PersonRow[]).map(toPersonByEmail);
}

function toPersonByEmail(row: PersonRow): PersonByEmail {
	const contacts = row.client_contacts ?? [];
	const companies = contacts.flatMap(({ clients }) => (clients === null ? [] : [toEmailCompany(clients)]));
	return { id: row.id, name: row.name, email: row.email.toLowerCase(), companies };
}

export function toEmailCompany(row: CompanyRow): EmailCompany {
	return { id: row.id, name: row.name, stage: parseClientStage(row.lifecycle_stage) };
}
