import { describe, expect, it, vi } from 'vitest';
import { readWholeChatbotQuestionTrail } from './readWholeChatbotQuestionTrail';
import type { SupabaseClient } from '@supabase/supabase-js';

const record = vi.hoisted(() => ({ questionIds: [] as string[], isKept: true, listingSize: 2, firstRowsAsked: [] as number[] }));

vi.mock('./readChatbotQuestionTrail', () => ({
	readChatbotQuestionTrail: async (_supabase: unknown, _organisationId: string, _filters: unknown, firstRow = 0) => {
		record.firstRowsAsked.push(firstRow);
		if (!record.isKept) return null;
		const { questionIds, listingSize } = record;
		const listed = questionIds.slice(firstRow, firstRow + listingSize).map((questionId) => ({ questionId }));
		return { questions: listed, questionCount: questionIds.length };
	}
}));

const supabase = {} as SupabaseClient;
const everyQuestion = { chatbotId: null, email: null, fromDay: null, toDay: null };

describe('the whole record a download carries', () => {
	it('reads every listing until it has every question that matches', async () => {
		record.questionIds = ['q1', 'q2', 'q3', 'q4', 'q5'];
		record.firstRowsAsked = [];
		const trail = await readWholeChatbotQuestionTrail(supabase, 'jewel', everyQuestion);
		expect(trail?.questions.map((question) => question.questionId)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5']);
		expect(trail?.questionCount).toBe(5);
		expect(record.firstRowsAsked).toEqual([0, 2, 4]);
	});

	it('is null until the record is kept', async () => {
		record.isKept = false;
		expect(await readWholeChatbotQuestionTrail(supabase, 'jewel', everyQuestion)).toBeNull();
		record.isKept = true;
	});
});
