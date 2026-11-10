import { describe, expect, it } from 'vitest';
import {
	citedButNeverGiven,
	citedPageNames,
	pageGivenPhrase,
	pagesReadOf,
	readingAskedFor,
	readingShortfall,
	searchesOf,
	whenOnUkClock
} from './businessBrainChatbotTrailWording';
import { laddersQuestion, madeUpPageId, unansweredQuestion } from '$lib/server/businessBrain/chatbotQuestionRecordFixtures';

const [search, refusedPage] = laddersQuestion.readings;

describe("a chatbot's record in words", () => {
	it('says what each reading asked for and why it gave nothing', () => {
		expect(readingAskedFor(search)).toBe('Searched for “ladders overnight”');
		expect(readingAskedFor(refusedPage)).toBe('Read a page');
		expect(readingAskedFor({ ...search, kind: 'index', part: 'process' })).toBe('Listed its Process pages');
		expect(readingShortfall(search)).toBeNull();
		expect(readingShortfall(refusedPage)).toBe('Refused: This chatbot does not read that page.');
	});

	it('lists the searches made and the pages given back, earlier versions named', () => {
		expect(searchesOf(laddersQuestion)).toEqual(['ladders overnight']);
		expect(pagesReadOf(laddersQuestion).map(pageGivenPhrase)).toEqual(['Ladders at the end of the day', 'Scaffold handover (version 4)']);
	});

	it('names the pages an answer cited, and marks one no reading gave back', () => {
		expect(citedPageNames(laddersQuestion)).toEqual(['Ladders at the end of the day', `page ${madeUpPageId}`]);
		expect(citedButNeverGiven(laddersQuestion)).toEqual([madeUpPageId]);
		expect(citedPageNames(unansweredQuestion)).toEqual([]);
	});

	it('reads moments on a UK clock', () => {
		expect(whenOnUkClock('2026-07-01T09:15:00Z')).toBe('2026-07-01 10:15');
	});
});
