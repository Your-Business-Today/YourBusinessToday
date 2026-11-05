import type { SupabaseClient } from '@supabase/supabase-js';

/** Marks that the person spoke with the agent now, about this item. */
export async function recordTurnSpoken(
	supabase: SupabaseClient,
	accountId: string,
	itemKey: string,
	now: Date
): Promise<void> {
	const spoken = { account_id: accountId, last_spoke_at: now.toISOString(), last_item_key: itemKey };
	const { error } = await supabase.from('agent_conversations').upsert(spoken, { onConflict: 'account_id' });
	if (error) throw error;
}

/** Puts an item off until a day, so no chat raises it again before then. */
export async function snoozeItem(
	supabase: SupabaseClient,
	accountId: string,
	itemKey: string,
	untilDay: string
): Promise<void> {
	const snooze = { account_id: accountId, item_key: itemKey, until_day: untilDay };
	const { error } = await supabase.from('agent_snoozes').upsert(snooze, { onConflict: 'account_id,item_key' });
	if (error) throw error;
}
