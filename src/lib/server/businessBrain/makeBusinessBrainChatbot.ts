import type { SupabaseClient } from '@supabase/supabase-js';
import { addChatbotMembers, ensurePartIds, insertChatbotParts } from './grantBusinessBrainChatbot';
import type { BusinessBrainChatbotGiven } from '$lib/data/businessBrainChatbotRules';

/** Who is making a chatbot on which organisation. */
export type ChatbotMaker = { organisationId: string; accountId: string };

const likeWildcards = /[\\%_]/g;

/** Make the chatbot, let it read its parts and let its people use it; gives back its id. */
export async function makeBusinessBrainChatbot(supabase: SupabaseClient, maker: ChatbotMaker, chatbot: BusinessBrainChatbotGiven): Promise<string> {
	const partIds = await ensurePartIds(supabase, maker.organisationId, chatbot.parts);
	const { name, purpose } = chatbot;
	const row = { organisation_id: maker.organisationId, name, purpose, made_by: maker.accountId };
	const { data, error } = await supabase.from('business_brain_chatbots').insert(row).select('id').single();
	if (error) throw error;
	const place = { ...maker, chatbotId: data.id as string };
	await insertChatbotParts(supabase, place, partIds);
	await addChatbotMembers(supabase, place, chatbot.people);
	return place.chatbotId;
}

/** Whether the organisation already has a chatbot of that name, in any case. */
export async function hasChatbotNamed(supabase: SupabaseClient, organisationId: string, name: string): Promise<boolean> {
	const exactName = name.replace(likeWildcards, (wildcard) => `\\${wildcard}`);
	const { data, error } = await supabase
		.from('business_brain_chatbots')
		.select('id')
		.eq('organisation_id', organisationId)
		.ilike('name', exactName);
	if (error) throw error;
	return (data ?? []).length > 0;
}
