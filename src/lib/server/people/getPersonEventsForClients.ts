import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientEvent, ClientEventKind } from '$lib/server/clients/recordClientEvent';

export type PersonEvent = ClientEvent & { clientId: string; clientName: string };

const longestVisibleHistory = 40;

export async function getPersonEventsForClients(
	supabase: SupabaseClient,
	clientIds: string[]
): Promise<PersonEvent[]> {
	if (clientIds.length === 0) return [];
	const { data, error } = await supabase
		.from('client_events')
		.select('id, kind, detail, created_at, client_id, clients(name)')
		.in('client_id', clientIds)
		.order('created_at', { ascending: false })
		.limit(longestVisibleHistory);
	if (error) throw error;
	return (data as unknown as Record<string, any>[]).map(personEventFrom);
}

function personEventFrom(row: Record<string, any>): PersonEvent {
	const client = row.clients;
	return {
		id: row.id as string,
		kind: row.kind as ClientEventKind,
		detail: row.detail as Record<string, unknown>,
		createdAt: row.created_at as string,
		clientId: row.client_id as string,
		clientName: (client?.name ?? '') as string
	};
}
