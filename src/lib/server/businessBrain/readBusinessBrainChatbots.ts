import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainPartKinds, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { readPartKinds } from './readBusinessBrainIndex';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';

type ChatbotRow = { id: string; name: string; made_at: string };
type CurrentGrants = { partsByChatbot: Map<string, BusinessBrainPartKind[]>; peopleByChatbot: Map<string, string[]> };

/** The organisation's chatbots by name, or the one named, each with the parts it reads and the people who use it now. */
export async function readBusinessBrainChatbots(
	supabase: SupabaseClient,
	organisationId: string,
	chatbotId: string | null
): Promise<BusinessBrainChatbot[]> {
	let query = supabase.from('business_brain_chatbots').select('id, name, made_at').eq('organisation_id', organisationId);
	if (chatbotId !== null) query = query.eq('id', chatbotId);
	const { data, error } = await query.order('name');
	if (error) throw error;
	const rows = (data ?? []) as ChatbotRow[];
	if (rows.length === 0) return [];
	const grants = await readCurrentGrants(supabase, organisationId, rows.map((row) => row.id));
	return rows.map((row) => chatbotOf(row, grants));
}

function chatbotOf(row: ChatbotRow, grants: CurrentGrants): BusinessBrainChatbot {
	const parts = grants.partsByChatbot.get(row.id) ?? [];
	const inPartOrder = businessBrainPartKinds.filter((kind) => parts.includes(kind));
	const people = [...(grants.peopleByChatbot.get(row.id) ?? [])].sort();
	return { chatbotId: row.id, name: row.name, madeAt: row.made_at, parts: inPartOrder, people };
}

async function readCurrentGrants(supabase: SupabaseClient, organisationId: string, chatbotIds: string[]): Promise<CurrentGrants> {
	const partKinds = await readPartKinds(supabase, organisationId);
	const partRows = await readCurrentRows(supabase, 'business_brain_chatbot_parts', 'chatbot_id, part_id', chatbotIds);
	const memberRows = await readCurrentRows(supabase, 'business_brain_chatbot_members', 'chatbot_id, email', chatbotIds);
	const partsByChatbot = groupByChatbot(partRows, (row) => partKinds.get(row.part_id as string) as BusinessBrainPartKind);
	const peopleByChatbot = groupByChatbot(memberRows, (row) => row.email as string);
	return { partsByChatbot, peopleByChatbot };
}

async function readCurrentRows(supabase: SupabaseClient, table: string, columns: string, chatbotIds: string[]) {
	const { data, error } = await supabase.from(table).select(columns).in('chatbot_id', chatbotIds).is('removed_at', null);
	if (error) throw error;
	return (data ?? []) as unknown as Record<string, unknown>[];
}

function groupByChatbot<T>(rows: Record<string, unknown>[], valueOf: (row: Record<string, unknown>) => T): Map<string, T[]> {
	const grouped = new Map<string, T[]>();
	for (const row of rows) {
		const chatbotId = row.chatbot_id as string;
		grouped.set(chatbotId, [...(grouped.get(chatbotId) ?? []), valueOf(row)]);
	}
	return grouped;
}
