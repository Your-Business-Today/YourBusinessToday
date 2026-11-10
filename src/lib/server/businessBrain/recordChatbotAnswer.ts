import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChatbotAnswerGiven, ChatbotAsker } from '$lib/data/businessBrainChatbotTrailRules';
import type { ChatbotPlace } from './recordChatbotQuestion';

const answersTable = 'business_brain_chatbot_answers';

/** Whether an answer to the question is already on record; it is never replaced. */
export async function isQuestionAnswered(supabase: SupabaseClient, questionId: string): Promise<boolean> {
	const { data, error } = await supabase.from(answersTable).select('id').eq('question_id', questionId).maybeSingle();
	if (error) throw error;
	return data !== null;
}

/** Puts on the chatbot's record the answer the person's Claude reports it gave, and the pages it cited. */
export async function recordChatbotAnswer(
	supabase: SupabaseClient,
	place: ChatbotPlace,
	asker: ChatbotAsker,
	given: ChatbotAnswerGiven
): Promise<void> {
	const row = {
		organisation_id: place.organisationId,
		chatbot_id: place.chatbotId,
		question_id: given.questionId,
		answered_by: asker.accountId,
		answered_by_email: asker.email,
		answer: given.answer,
		pages_cited: given.pagesCited
	};
	const { error } = await supabase.from(answersTable).insert(row);
	if (error) throw error;
}
