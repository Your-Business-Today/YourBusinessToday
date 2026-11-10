import type { SupabaseClient } from '@supabase/supabase-js';
import { chatbotTrailLimits, type ChatbotTrailFilters } from '$lib/data/businessBrainChatbotTrailRules';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { endOfUkDay, startOfUkDay } from '$lib/data/ukDayBounds';
import { readAnswersOf, readReadingsOf, type ChatbotAnswerRecord, type ChatbotReadingRecord } from './readChatbotTrailParts';

/** One question on a chatbot's record, with every reading made for it and the answer reported, if one was. */
export type ChatbotQuestionRecord = {
	questionId: string;
	chatbotId: string;
	askedByEmail: string;
	question: string;
	askedAt: string;
	readings: ChatbotReadingRecord[];
	answer: ChatbotAnswerRecord | null;
};

/** The questions a manager asked for, latest first, and how many match in all. */
export type ChatbotQuestionTrail = { questions: ChatbotQuestionRecord[]; questionCount: number };

type QuestionRow = { id: string; chatbot_id: string; asked_by_email: string; question: string; asked_at: string };

const lastListedRow = chatbotTrailLimits.mostQuestionsListed - 1;

/** The organisation's questions asked through its chatbots, narrowed by the filters; null until migration 0175 has run. */
export async function readChatbotQuestionTrail(
	supabase: SupabaseClient,
	organisationId: string,
	filters: ChatbotTrailFilters
): Promise<ChatbotQuestionTrail | null> {
	const { data, error, count } = await questionsQuery(supabase, organisationId, filters)
		.order('asked_at', { ascending: false })
		.range(0, lastListedRow);
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	const rows = (data ?? []) as QuestionRow[];
	const questionIds = rows.map((row) => row.id);
	const readings = await readReadingsOf(supabase, questionIds);
	const answers = await readAnswersOf(supabase, questionIds);
	const questions = rows.map((row) => questionOf(row, readings, answers));
	return { questions, questionCount: count ?? questions.length };
}

function questionsQuery(supabase: SupabaseClient, organisationId: string, filters: ChatbotTrailFilters) {
	const { chatbotId, email, fromDay, toDay } = filters;
	const startsAt = fromDay === null ? null : startOfUkDay(fromDay);
	const endsBefore = toDay === null ? null : endOfUkDay(toDay);
	let query = supabase
		.from('business_brain_chatbot_questions')
		.select('id, chatbot_id, asked_by_email, question, asked_at', { count: 'exact' })
		.eq('organisation_id', organisationId);
	if (chatbotId !== null) query = query.eq('chatbot_id', chatbotId);
	if (email !== null) query = query.eq('asked_by_email', email);
	if (startsAt !== null) query = query.gte('asked_at', startsAt);
	if (endsBefore !== null) query = query.lt('asked_at', endsBefore);
	return query;
}

function questionOf(
	row: QuestionRow,
	readings: Map<string, ChatbotReadingRecord[]>,
	answers: Map<string, ChatbotAnswerRecord>
): ChatbotQuestionRecord {
	return {
		questionId: row.id,
		chatbotId: row.chatbot_id,
		askedByEmail: row.asked_by_email,
		question: row.question,
		askedAt: row.asked_at,
		readings: readings.get(row.id) ?? [],
		answer: answers.get(row.id) ?? null
	};
}
