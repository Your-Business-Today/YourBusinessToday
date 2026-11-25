import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { keptForTheBrainsLife, type ChatbotRecordKeeping } from '$lib/data/chatbotRecordKeepingRules';

/** Who sets the keeping period, in which organisation, and to how many days: null for as long as the Brain is kept. */
export type ChatbotRecordKeepingChange = { organisationId: string; accountId: string; keptDays: number | null };

type KeepingRow = { kept_days: number | null; set_at: string };

/** How long the organisation keeps its chatbot record; for the Brain's life until it sets a period, or until migration 0292 has run. */
export async function readChatbotRecordKeeping(supabase: SupabaseClient, organisationId: string): Promise<ChatbotRecordKeeping> {
	const { data, error } = await supabase
		.from('business_brain_chatbot_record_keeping')
		.select('kept_days, set_at')
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return keptForTheBrainsLife;
	if (error) throw error;
	const row = data as KeepingRow | null;
	if (row === null) return keptForTheBrainsLife;
	return { keptDays: row.kept_days, setAt: row.set_at };
}

/** Sets how long the organisation keeps its chatbot record, through the one door the database gives for it. */
export async function setChatbotRecordKeeping(supabase: SupabaseClient, change: ChatbotRecordKeepingChange): Promise<void> {
	const { organisationId, accountId, keptDays } = change;
	const { error } = await supabase.rpc('set_chatbot_record_keeping', { organisation: organisationId, days: keptDays, member: accountId });
	if (error) throw error;
}
