import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientEvent, ClientEventKind } from './recordClientEvent';

const longestVisibleHistory = 40;

export async function getEventsForClient(
	supabase: SupabaseClient,
	clientId: string
): Promise<ClientEvent[]> {
	const { data, error } = await supabase
		.from('client_events')
		.select('id, kind, detail, created_at')
		.eq('client_id', clientId)
		.order('created_at', { ascending: false })
		.limit(longestVisibleHistory);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		id: row.id as string,
		kind: row.kind as ClientEventKind,
		detail: row.detail as Record<string, unknown>,
		createdAt: row.created_at as string
	}));
}
