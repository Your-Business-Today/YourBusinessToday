import { describe, expect, it } from 'vitest';
import { describeChatbotTrail } from './describeChatbotTrail';
import type { ChatbotQuestionRecord } from '$lib/server/businessBrain/readChatbotQuestionTrail';

const jewel = { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } as never;
const chatbotNames = new Map([['site-team', 'Site team']]);
const ladderPage = '00000000-0000-0000-0000-00000000000a';
const payrollPage = '00000000-0000-0000-0000-00000000000c';

const answered: ChatbotQuestionRecord = {
	questionId: 'question-1',
	chatbotId: 'site-team',
	askedByEmail: 'stuart@example.com',
	question: 'Do ladders stay up overnight?',
	askedAt: '2026-11-10T19:05:00Z',
	readings: [
		{
			kind: 'search',
			question: 'Do ladders stay up overnight?',
			searchWords: 'ladders',
			part: null,
			pageId: null,
			revisionId: null,
			outcome: 'given',
			refusal: null,
			pagesGiven: [{ pageId: ladderPage, title: 'Ladders at the end of the day', filedAt: '2026-11-03T09:00:00Z', revisionId: null }],
			readAt: '2026-11-10T19:05:01Z'
		}
	],
	answer: { answer: 'No: tie them off or take them down.', pagesCited: [ladderPage, payrollPage], answeredByEmail: 'stuart@example.com', answeredAt: '2026-11-10T19:05:30Z' }
};

const unanswered: ChatbotQuestionRecord = {
	...answered,
	questionId: 'question-2',
	question: 'Who signs off scaffold?',
	readings: [{ ...answered.readings[0], searchWords: 'scaffold', outcome: 'nothing_found', pagesGiven: [] }],
	answer: null
};

describe("a manager's reading of the chatbot's record", () => {
	const listing = describeChatbotTrail(jewel, { questions: [answered, unanswered], questionCount: 3 }, chatbotNames);

	it('names who asked, through which chatbot and when, on a UK clock', () => {
		expect(listing).toContain('# 3 questions asked through chatbots onto Jewel Enterprises');
		expect(listing).toContain('## 2026-11-10 19:05 — stuart@example.com, through "Site team"');
		expect(listing).toContain('Question question-1: "Do ladders stay up overnight?"');
	});

	it('shows what each reading gave back, and when it found nothing', () => {
		expect(listing).toContain('searched for "ladders", for "Do ladders stay up overnight?"');
		expect(listing).toContain(`- Ladders at the end of the day (page id ${ladderPage}, as last filed 2026-11-03 09:00)`);
		expect(listing).toContain('searched for "scaffold"');
		expect(listing).toContain('Nothing found.');
	});

	it('quotes the answer reported, and marks a cited page no reading gave back', () => {
		expect(listing).toContain("**Answer**, reported by stuart@example.com's Claude at 2026-11-10 19:05:");
		expect(listing).toContain('> No: tie them off or take them down.');
		expect(listing).toContain(`- page id ${ladderPage}\n`);
		expect(listing).toContain(`- page id ${payrollPage} — never given back by a reading for this question`);
	});

	it('says plainly when no answer was reported, and when earlier questions are not listed', () => {
		expect(listing).toContain("**Answer:** none recorded. The person's Claude never reported an answer to this question.");
		expect(listing).toContain('Not listed: one earlier question.');
	});
});
