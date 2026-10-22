import type { SupabaseClient } from '@supabase/supabase-js';
import { idBatches } from '$lib/server/schema/idBatches';

/** What each of these messages says, by message id; a message the reader may not see is left out. */
export async function getMessageBodies(
	supabase: SupabaseClient,
	messageIds: string[],
	shouldIncludeInternal: boolean
): Promise<Map<string, string>> {
	const batches = await Promise.all(
		idBatches(messageIds).map((batch) => readBodies(supabase, batch, shouldIncludeInternal))
	);
	return new Map(batches.flat().map((row) => [row.id as string, row.body as string]));
}

async function readBodies(
	supabase: SupabaseClient,
	messageIds: string[],
	shouldIncludeInternal: boolean
): Promise<Record<string, unknown>[]> {
	let query = supabase.from('conversation_messages').select('id, body').in('id', messageIds);
	if (!shouldIncludeInternal) query = query.eq('is_internal', false);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}
