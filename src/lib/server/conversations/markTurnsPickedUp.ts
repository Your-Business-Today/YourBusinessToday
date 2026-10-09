import type { SupabaseClient } from '@supabase/supabase-js';
import { isWaitingOn } from '$lib/data/batonRule';
import type { ConversationMessage } from './messageRecord';

/** The questions among these messages that wait on this account are now in its Claude's hands. */
export async function markTurnsPickedUp(
	supabase: SupabaseClient,
	accountId: string,
	messages: ConversationMessage[]
): Promise<void> {
	const questionIds = messages
		.filter((message) => isWaitingOn(message, accountId))
		.map((message) => message.id);
	if (questionIds.length === 0) return;
	const { error } = await supabase
		.from('conversation_messages')
		.update({ picked_up_at: new Date().toISOString() })
		.in('id', questionIds)
		.eq('awaiting_account_id', accountId)
		.is('picked_up_at', null);
	if (error) throw error;
}
