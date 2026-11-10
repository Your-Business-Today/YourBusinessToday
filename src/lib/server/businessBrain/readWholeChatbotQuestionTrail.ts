import type { SupabaseClient } from '@supabase/supabase-js';
import { chatbotTrailLimits, type ChatbotTrailFilters } from '$lib/data/businessBrainChatbotTrailRules';
import { readChatbotQuestionTrail, type ChatbotQuestionRecord } from './readChatbotQuestionTrail';

/** Every question the filters match, latest first, up to the most a download carries, and how many match in all. */
export type WholeChatbotQuestionTrail = { questions: ChatbotQuestionRecord[]; questionCount: number };

const { mostQuestionsDownloaded } = chatbotTrailLimits;

/** The whole of the record the filters match, read a listing at a time through the same reader the connector uses; null until migration 0175 has run. */
export async function readWholeChatbotQuestionTrail(
	supabase: SupabaseClient,
	organisationId: string,
	filters: ChatbotTrailFilters
): Promise<WholeChatbotQuestionTrail | null> {
	const firstListing = await readChatbotQuestionTrail(supabase, organisationId, filters);
	if (firstListing === null) return null;
	const { questionCount } = firstListing;
	const questionsWanted = Math.min(questionCount, mostQuestionsDownloaded);
	const questions = new Map(firstListing.questions.map((question) => [question.questionId, question]));
	while (questions.size < questionsWanted) {
		const listing = await readChatbotQuestionTrail(supabase, organisationId, filters, questions.size);
		const questionsBefore = questions.size;
		for (const question of listing?.questions ?? []) questions.set(question.questionId, question);
		const isExhausted = questions.size === questionsBefore;
		if (isExhausted) break;
	}
	return { questions: [...questions.values()].slice(0, questionsWanted), questionCount };
}
