import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientEventKind } from './clientEventRecord';

export async function recordClientEvent(
	supabase: SupabaseClient,
	clientId: string,
	kind: ClientEventKind,
	detail: Record<string, unknown>,
	actorAccountId: string | null
): Promise<void> {
	const { error } = await supabase.from('client_events').insert({
		client_id: clientId,
		kind,
		detail,
		actor_account_id: actorAccountId
	});
	if (error) throw error;
}
