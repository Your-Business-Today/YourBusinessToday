import { describe, expect, it } from 'vitest';
import { validateChatbotAnswerGiven, validateChatbotQuestionAsked } from './validateChatbotQuestion';
import { validateChatbotTrailFilters } from './validateChatbotTrailFilters';
import { chatbotTrailLimits } from '$lib/data/businessBrainChatbotTrailRules';
import { endOfUkDay, startOfUkDay } from '$lib/data/ukDayBounds';

const questionId = '00000000-0000-0000-0000-000000000100';
const pageId = '00000000-0000-0000-0000-00000000000a';
const { longestQuestion, longestAnswer, mostPagesCited } = chatbotTrailLimits;

describe('the question a reading is for', () => {
	it('takes the words, and the question it carries on when one is named', () => {
		expect(validateChatbotQuestionAsked({ question: '  Ladders?  ' })).toEqual({ question: 'Ladders?', questionId: null });
		expect(validateChatbotQuestionAsked({ question: 'Ladders?', questionId })).toEqual({ question: 'Ladders?', questionId });
	});

	it('refuses, never shortens, a question that does not fit, and a questionId that is not an id', () => {
		expect(validateChatbotQuestionAsked({})).toContain('The question is required');
		expect(validateChatbotQuestionAsked({ question: 'x'.repeat(longestQuestion + 1) })).toContain(`at most ${longestQuestion} characters`);
		expect(validateChatbotQuestionAsked({ question: 'Ladders?', questionId: 'the last one' })).toContain('The questionId must be an id');
	});
});

describe('the answer a person’s Claude reports', () => {
	it('takes the answer and each page cited once', () => {
		const given = validateChatbotAnswerGiven({ questionId, answer: 'Tie them off.', pagesCited: [pageId, pageId] });
		expect(given).toEqual({ questionId, answer: 'Tie them off.', pagesCited: [pageId] });
		expect(validateChatbotAnswerGiven({ questionId, answer: 'Nothing on it.' })).toEqual({ questionId, answer: 'Nothing on it.', pagesCited: [] });
	});

	it('refuses an answer that does not fit and cited pages that are not page ids', () => {
		expect(validateChatbotAnswerGiven({ questionId, answer: '' })).toContain('The answer is required');
		expect(validateChatbotAnswerGiven({ questionId, answer: 'x'.repeat(longestAnswer + 1) })).toContain(`at most ${longestAnswer} characters`);
		expect(validateChatbotAnswerGiven({ questionId, answer: 'Yes', pagesCited: ['Ladders'] })).toContain('The pagesCited is a list');
		expect(validateChatbotAnswerGiven({ questionId, answer: 'Yes', pagesCited: pageId })).toContain('The pagesCited is a list');
		const tooMany = Array.from({ length: mostPagesCited + 1 }, (_, index) => `00000000-0000-0000-0000-${String(index).padStart(12, '0')}`);
		expect(validateChatbotAnswerGiven({ questionId, answer: 'Yes', pagesCited: tooMany })).toContain(`at most ${mostPagesCited} page ids`);
	});
});

describe('which questions a manager reads', () => {
	it('narrows by chatbot, person and days, each left out for all', () => {
		expect(validateChatbotTrailFilters({})).toEqual({ chatbotId: null, email: null, fromDay: null, toDay: null });
		const narrowed = validateChatbotTrailFilters({ chatbotId: questionId, person: 'Stuart@Example.com', fromDay: '2026-11-01', toDay: '2026-11-10' });
		expect(narrowed).toEqual({ chatbotId: questionId, email: 'stuart@example.com', fromDay: '2026-11-01', toDay: '2026-11-10' });
	});

	it('refuses days that are not days or are out of order', () => {
		expect(validateChatbotTrailFilters({ fromDay: '10/11/2026' })).toContain('The fromDay is a date written as 2026-11-30');
		expect(validateChatbotTrailFilters({ toDay: '2026-02-30' })).toContain('is not a day on the calendar');
		expect(validateChatbotTrailFilters({ fromDay: '2026-11-10', toDay: '2026-11-01' })).toBe('The fromDay comes on or before the toDay.');
		expect(validateChatbotTrailFilters({ chatbotId: 'site team' })).toContain('The chatbotId must be an id');
	});

	it('reads a day on a UK clock, in winter and in summer', () => {
		expect([startOfUkDay('2026-11-10'), endOfUkDay('2026-11-10')]).toEqual(['2026-11-10T00:00:00.000Z', '2026-11-11T00:00:00.000Z']);
		expect([startOfUkDay('2026-07-01'), endOfUkDay('2026-07-01')]).toEqual(['2026-06-30T23:00:00.000Z', '2026-07-01T23:00:00.000Z']);
	});
});
