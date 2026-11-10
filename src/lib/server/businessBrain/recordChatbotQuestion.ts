import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChatbotAsker } from '$lib/data/businessBrainChatbotTrailRules';

/** The chatbot a question was asked through, and the organisation whose brain it reads. */
export type ChatbotPlace = { organisationId: string; chatbotId: string };

const questionsTable = 'business_brain_chatbot_questions';

/** Puts a new question on the chatbot's record, as asked by this person now, and gives back its id. */
export async function openChatbotQuestion(supabase: SupabaseClient, place: ChatbotPlace, asker: ChatbotAsker, question: string): Promise<string> {
	const row = {
		organisation_id: place.organisationId,
		chatbot_id: place.chatbotId,
		asked_by: asker.accountId,
		asked_by_email: asker.email,
		question
	};
	const { data, error } = await supabase.from(questionsTable).insert(row).select('id').single();
	if (error) throw error;
	return data.id as string;
}

/** Whether the question on record was asked through this chatbot by this person, so they may carry it on. */
export async function isQuestionOfAsker(supabase: SupabaseClient, place: ChatbotPlace, asker: ChatbotAsker, questionId: string): Promise<boolean> {
	const { data, error } = await supabase
		.from(questionsTable)
		.select('id')
		.eq('id', questionId)
		.eq('organisation_id', place.organisationId)
		.eq('chatbot_id', place.chatbotId)
		.eq('asked_by', asker.accountId)
		.maybeSingle();
	if (error) throw error;
	return data !== null;
}

/** Where a chatbot is, whoever asks: its organisation, or null when there is no chatbot by that id. */
export async function readChatbotPlace(supabase: SupabaseClient, chatbotId: string): Promise<ChatbotPlace | null> {
	const { data, error } = await supabase.from('business_brain_chatbots').select('organisation_id').eq('id', chatbotId).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return { organisationId: data.organisation_id as string, chatbotId };
}
