import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where a person's conversation with the agent stands: when they last spoke, the last item raised, and what they have put off. */
export type ConversationRecord = { lastSpokeAt: string | null; lastItemKey: string | null; snoozedKeys: Set<string> };

const freshConversation = (): ConversationRecord => ({ lastSpokeAt: null, lastItemKey: null, snoozedKeys: new Set() });

/** The record across every login of a person: the latest time they spoke, and everything any login put off past today. */
export async function getConversationRecord(
	supabase: SupabaseClient,
	accountIds: string[],
	today: string
): Promise<ConversationRecord> {
	const [conversations, snoozes] = await Promise.all([
		supabase.from('agent_conversations').select('last_spoke_at, last_item_key').in('account_id', accountIds),
		supabase.from('agent_snoozes').select('item_key').in('account_id', accountIds).gt('until_day', today)
	]);
	if (isSchemaNotYetMigrated(conversations.error) || isSchemaNotYetMigrated(snoozes.error)) return freshConversation();
	if (conversations.error) throw conversations.error;
	if (snoozes.error) throw snoozes.error;
	const [latest] = [...(conversations.data ?? [])].sort(byLatestSpoken);
	const snoozedKeys = new Set((snoozes.data ?? []).map((snooze) => snooze.item_key as string));
	if (latest === undefined) return { ...freshConversation(), snoozedKeys };
	return { lastSpokeAt: latest.last_spoke_at ?? null, lastItemKey: latest.last_item_key ?? null, snoozedKeys };
}

type SpokenRow = { last_spoke_at: string | null };

function byLatestSpoken(left: SpokenRow, right: SpokenRow): number {
	return (right.last_spoke_at ?? '').localeCompare(left.last_spoke_at ?? '');
}
