import type { SupabaseClient } from '@supabase/supabase-js';
import {
	clientContactColumns,
	parseClientContactRecord,
	type ClientContact
} from './clientContactRecord';

export async function getContactsForClient(
	supabase: SupabaseClient,
	clientId: string
): Promise<ClientContact[]> {
	const { data, error } = await supabase
		.from('client_contacts')
		.select(clientContactColumns)
		.eq('client_id', clientId);
	if (error) throw error;
	return data.map(parseClientContactRecord).sort(byPrimaryThenName);
}

export function getClientContact(
	supabase: SupabaseClient,
	contactId: string
): Promise<ClientContact | null> {
	return findOneContact(supabase, 'id', contactId);
}

/** Every contact a signed-in account is, one per organisation; none for staff and everyone else. */
export async function getContactsForAccount(
	supabase: SupabaseClient,
	accountId: string
): Promise<ClientContact[]> {
	const { data, error } = await supabase
		.from('client_contacts')
		.select(clientContactColumns)
		.eq('account_id', accountId);
	if (error) throw error;
	return data.map(parseClientContactRecord);
}

async function findOneContact(
	supabase: SupabaseClient,
	column: 'id',
	value: string
): Promise<ClientContact | null> {
	const { data, error } = await supabase
		.from('client_contacts')
		.select(clientContactColumns)
		.eq(column, value)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseClientContactRecord(data);
}

function byPrimaryThenName(first: ClientContact, second: ClientContact): number {
	if (first.isPrimary !== second.isPrimary) return first.isPrimary ? -1 : 1;
	return first.name.localeCompare(second.name);
}
