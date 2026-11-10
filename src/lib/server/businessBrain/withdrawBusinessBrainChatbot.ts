import type { SupabaseClient } from '@supabase/supabase-js';
import { readPartKinds } from './readBusinessBrainIndex';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { ChatbotGrantPlace } from './grantBusinessBrainChatbot';

/** Stop the chatbot reading each part: the row is dated, never deleted, so who let it read what stays on record. */
export async function removeChatbotParts(supabase: SupabaseClient, place: ChatbotGrantPlace, parts: BusinessBrainPartKind[]): Promise<void> {
	if (parts.length === 0) return;
	const partKinds = await readPartKinds(supabase, place.organisationId);
	const partIds = [...partKinds.keys()].filter((partId) => parts.includes(partKinds.get(partId) as BusinessBrainPartKind));
	await dateCurrentRows(supabase, place, { table: 'business_brain_chatbot_parts', column: 'part_id', values: partIds });
}

/** Stop each person using the chatbot: the row is dated, never deleted. */
export async function removeChatbotMembers(supabase: SupabaseClient, place: ChatbotGrantPlace, emails: string[]): Promise<void> {
	if (emails.length === 0) return;
	await dateCurrentRows(supabase, place, { table: 'business_brain_chatbot_members', column: 'email', values: emails });
}

type CurrentRows = { table: string; column: string; values: string[] };

async function dateCurrentRows(supabase: SupabaseClient, place: ChatbotGrantPlace, rows: CurrentRows): Promise<void> {
	const removal = { removed_at: new Date().toISOString(), removed_by: place.accountId };
	const { error } = await supabase
		.from(rows.table)
		.update(removal)
		.eq('chatbot_id', place.chatbotId)
		.in(rows.column, rows.values)
		.is('removed_at', null);
	if (error) throw error;
}
