import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { ChatbotPageGiven, ChatbotReadingKind, ChatbotReadingOutcome } from '$lib/data/businessBrainChatbotTrailRules';

/** A reading as the record keeps it: what was asked for, what came of it and the pages given back. */
export type ChatbotReadingRecord = {
	kind: ChatbotReadingKind;
	question: string;
	searchWords: string | null;
	part: BusinessBrainPartKind | null;
	pageId: string | null;
	revisionId: number | null;
	outcome: ChatbotReadingOutcome;
	refusal: string | null;
	pagesGiven: ChatbotPageGiven[];
	readAt: string;
};

/** An answer as the person's Claude reported it, with the pages it cited. */
export type ChatbotAnswerRecord = { answer: string; pagesCited: string[]; answeredByEmail: string; answeredAt: string };

type Row = Record<string, unknown>;

/** Every reading made for the questions, oldest first, by question. */
export async function readReadingsOf(supabase: SupabaseClient, questionIds: string[]): Promise<Map<string, ChatbotReadingRecord[]>> {
	const rows = await readRowsOf(supabase, 'business_brain_chatbot_readings', 'read_at', questionIds);
	const readings = new Map<string, ChatbotReadingRecord[]>();
	for (const row of rows) {
		const questionId = row.question_id as string;
		readings.set(questionId, [...(readings.get(questionId) ?? []), readingOf(row)]);
	}
	return readings;
}

/** The answer reported to each question that has one, by question. */
export async function readAnswersOf(supabase: SupabaseClient, questionIds: string[]): Promise<Map<string, ChatbotAnswerRecord>> {
	const rows = await readRowsOf(supabase, 'business_brain_chatbot_answers', 'answered_at', questionIds);
	return new Map(rows.map((row) => [row.question_id as string, answerOf(row)]));
}

async function readRowsOf(supabase: SupabaseClient, table: string, orderedBy: string, questionIds: string[]): Promise<Row[]> {
	if (questionIds.length === 0) return [];
	const { data, error } = await supabase.from(table).select('*').in('question_id', questionIds).order(orderedBy);
	if (error) throw error;
	return (data ?? []) as Row[];
}

function readingOf(row: Row): ChatbotReadingRecord {
	return {
		kind: row.reading as ChatbotReadingKind,
		question: row.question as string,
		searchWords: row.search_words as string | null,
		part: row.part_kind as BusinessBrainPartKind | null,
		pageId: row.page_id as string | null,
		revisionId: row.revision_id as number | null,
		outcome: row.outcome as ChatbotReadingOutcome,
		refusal: row.refusal as string | null,
		pagesGiven: row.pages_given as ChatbotPageGiven[],
		readAt: row.read_at as string
	};
}

function answerOf(row: Row): ChatbotAnswerRecord {
	return {
		answer: row.answer as string,
		pagesCited: row.pages_cited as string[],
		answeredByEmail: row.answered_by_email as string,
		answeredAt: row.answered_at as string
	};
}
