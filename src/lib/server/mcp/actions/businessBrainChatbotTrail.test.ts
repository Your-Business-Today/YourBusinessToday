import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatbotId, chatbotReading, membersDatabase, personSignedInAs, processPageId, stuartOnSiteTeam } from './chatbotReadingFixtures';
import { chatbotTrailActions } from './businessBrainChatbotTrailActions';
import { answerAlreadyOnRecord, noSuchQuestionOfYours } from './describeChatbotTrail';
import type { McpAction } from '../actionTypes';

const trail = vi.hoisted(() => ({ questions: [] as { questionId: string; askedBy: string; question: string }[], readings: [] as Record<string, unknown>[], answers: [] as Record<string, unknown>[], pagesRead: 0 }));

vi.mock('$lib/server/businessBrain/recordChatbotQuestion', async () => (await import('./businessBrainChatbotTrailFixtures')).trailWriters(trail));
vi.mock('$lib/server/businessBrain/recordChatbotReading', () => ({
	recordChatbotReading: async (_supabase: unknown, _place: unknown, made: Record<string, unknown>) => void trail.readings.push(made)
}));
vi.mock('$lib/server/businessBrain/recordChatbotAnswer', () => ({
	isQuestionAnswered: async (_supabase: unknown, questionId: string) => trail.answers.some((answer) => answer.questionId === questionId),
	recordChatbotAnswer: async (_supabase: unknown, _place: unknown, _asker: unknown, given: Record<string, unknown>) => void trail.answers.push(given)
}));
vi.mock('$lib/server/organisations/getOrganisation', () => ({ getOrganisation: async () => ({ id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' }) }));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/readBusinessBrainChatbots', async () => {
	const { siteTeam } = await import('./businessBrainChatbotFixtures');
	return { readBusinessBrainChatbots: async () => [siteTeam] };
});
vi.mock('$lib/server/businessBrain/readBusinessBrainIndex', () => {
	const ladderRule = { pageId: '00000000-0000-0000-0000-00000000000a', partKind: 'process', kind: 'rule', title: 'Ladders at the end of the day', summary: '', updatedAt: '2026-11-03T09:00:00Z' };
	return { readBrainIndexOfParts: async () => ({ entries: [ladderRule], pageCount: 1 }) };
});
vi.mock('$lib/server/businessBrain/searchBusinessBrain', () => ({ searchBusinessBrainParts: async () => [] }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageWhole', () => ({ readBusinessBrainPageWhole: async () => (trail.pagesRead++, null) }));

const database = membersDatabase(() => [stuartOnSiteTeam]);
const stuart = personSignedInAs('stuart@example.com', database);
const question = 'Do ladders stay up overnight?';
const trailAction = (name: string) => chatbotTrailActions.find((candidate) => candidate.name === name) as McpAction;
const outcomes = () => trail.readings.map((made) => (made.reading as { outcome: string }).outcome);

describe("every question asked through a chatbot goes on the chatbot's record", () => {
	beforeEach(() => {
		trail.questions.splice(0);
		trail.readings.splice(0);
		trail.answers.splice(0);
		trail.pagesRead = 0;
	});

	it('reads nothing without the question in words', async () => {
		for (const name of ['read_chatbot_index', 'search_chatbot', 'read_chatbot_page']) {
			expect(await chatbotReading(name).run(stuart, { chatbotId, search: 'ladders', pageId: processPageId })).toContain('The question is required');
		}
		expect(trail.pagesRead).toBe(0);
		expect(trail.questions).toEqual([]);
	});

	it('records the question, the pages a reading gave back and how to carry it on', async () => {
		const answer = await chatbotReading('read_chatbot_index').run(stuart, { chatbotId, question });
		const [opened] = trail.questions as { questionId: string; question: string }[];
		expect(opened.question).toBe(question);
		expect(answer).toContain(`Give questionId ${opened.questionId} on every further reading`);
		expect(trail.readings[0]).toMatchObject({ questionId: opened.questionId, kind: 'index', question });
		expect((trail.readings[0].reading as { pagesGiven: unknown[] }).pagesGiven).toEqual([
			{ pageId: processPageId, title: 'Ladders at the end of the day', filedAt: '2026-11-03T09:00:00Z', revisionId: null }
		]);
	});

	it('records a search that found nothing, and a reading refused for a part the chatbot does not read', async () => {
		await chatbotReading('search_chatbot').run(stuart, { chatbotId, question, search: 'scaffold' });
		await chatbotReading('read_chatbot_index').run(stuart, { chatbotId, question, part: 'people' });
		expect(outcomes()).toEqual(['nothing_found', 'refused']);
		const [search] = trail.readings.map((made) => made.reading as { asked: { searchWords: string } });
		const { asked } = search;
		expect(asked.searchWords).toBe('scaffold');
	});

	it('carries a question on under its id, and refuses an id that is not one of the person’s', async () => {
		await chatbotReading('search_chatbot').run(stuart, { chatbotId, question, search: 'ladders' });
		const [{ questionId }] = trail.questions as { questionId: string }[];
		await chatbotReading('read_chatbot_page').run(stuart, { chatbotId, question, questionId, pageId: processPageId });
		expect(trail.questions).toHaveLength(1);
		expect(trail.readings.map((made) => made.questionId)).toEqual([questionId, questionId]);
		const someoneElses = '00000000-0000-0000-0000-0000000009ff';
		expect(await chatbotReading('search_chatbot').run(stuart, { chatbotId, question, questionId: someoneElses, search: 'ladders' })).toBe(noSuchQuestionOfYours);
		expect(trail.readings).toHaveLength(2);
	});

	it('records the answer the person’s Claude gave once, and never replaces it', async () => {
		const recordAnswer = trailAction('record_chatbot_answer');
		expect(recordAnswer.isWrite).toBe(true);
		await chatbotReading('search_chatbot').run(stuart, { chatbotId, question, search: 'ladders' });
		const [{ questionId }] = trail.questions as { questionId: string }[];
		const given = { chatbotId, questionId, answer: 'Yes, tied off.', pagesCited: [processPageId] };
		expect(await recordAnswer.run(stuart, given)).toContain("is on the chatbot's record, citing one page");
		expect(await recordAnswer.run(stuart, { ...given, answer: 'No.' })).toBe(answerAlreadyOnRecord);
		expect(trail.answers).toEqual([{ questionId, answer: 'Yes, tied off.', pagesCited: [processPageId] }]);
	});

	it('takes no answer to a question the person did not ask', async () => {
		const given = { chatbotId, questionId: '00000000-0000-0000-0000-0000000009ff', answer: 'Yes.' };
		expect(await trailAction('record_chatbot_answer').run(stuart, given)).toBe(noSuchQuestionOfYours);
		expect(trail.answers).toEqual([]);
	});
});
