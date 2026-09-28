import type { SupabaseClient } from '@supabase/supabase-js';

/** Everything waiting on this account is now in its Claude's hands. */
export async function markTurnsPickedUp(supabase: SupabaseClient, accountId: string): Promise<void> {
	const { error } = await supabase
		.from('conversation_messages')
		.update({ picked_up_at: new Date().toISOString() })
		.eq('awaiting_account_id', accountId)
		.is('picked_up_at', null);
	if (error) throw error;
}
