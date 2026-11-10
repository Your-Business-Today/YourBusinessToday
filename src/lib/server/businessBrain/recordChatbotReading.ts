import type { SupabaseClient } from '@supabase/supabase-js';
import { chatbotReadingOutcomes, type ChatbotReading, type ChatbotReadingKind } from '$lib/data/businessBrainChatbotTrailRules';
import type { ChatbotPlace } from './recordChatbotQuestion';

/** A reading made for a question on record, with the words the person's Claude gave it. */
export type ChatbotReadingMade = { questionId: string; kind: ChatbotReadingKind; question: string; reading: ChatbotReading };

/** Puts on the chatbot's record what a reading asked for and gave back, or why it was refused. */
export async function recordChatbotReading(supabase: SupabaseClient, place: ChatbotPlace, made: ChatbotReadingMade): Promise<void> {
	const { reading } = made;
	const { asked } = reading;
	const isRefused = reading.outcome === chatbotReadingOutcomes.refused;
	const row = {
		organisation_id: place.organisationId,
		chatbot_id: place.chatbotId,
		question_id: made.questionId,
		reading: made.kind,
		question: made.question,
		search_words: asked.searchWords,
		part_kind: asked.part,
		page_id: asked.pageId,
		revision_id: asked.revisionId,
		outcome: reading.outcome,
		refusal: isRefused ? reading.answer : null,
		pages_given: reading.pagesGiven
	};
	const { error } = await supabase.from('business_brain_chatbot_readings').insert(row);
	if (error) throw error;
}
