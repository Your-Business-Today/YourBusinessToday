import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatSummariesTable, chatSummaryColumns, chatSummaryOf, type ChatSummaryRow } from './chatSummaryRecord';
import type { NamedChatSummary } from '$lib/data/chat/chatSummaryRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The latest catch-up written for the room, with who wrote it, or null when there is none; none either while
 * migration 0276 has not run, since the room's load asks on every visit. The writer is named through the service role,
 * as a message's author is.
 */
export async function findLatestSummaryOfRoom(supabase: SupabaseClient, roomId: string): Promise<NamedChatSummary | null> {
	const { data, error } = await supabase
		.from(chatSummariesTable)
		.select(chatSummaryColumns)
		.eq('room_id', roomId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error !== null) throw error;
	if (data === null) return null;
	const summary = chatSummaryOf(data as ChatSummaryRow);
	const writers = await getAccountsById(supabaseServiceClient(), [summary.writtenByAccountId]);
	const writerNameOf = accountNameLookup(writers);
	return { ...summary, writerName: writerNameOf(summary.writtenByAccountId) };
}
