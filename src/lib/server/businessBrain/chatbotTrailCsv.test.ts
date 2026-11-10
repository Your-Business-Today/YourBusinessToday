import { describe, expect, it } from 'vitest';
import { chatbotTrailCsv, chatbotTrailFileName } from './chatbotTrailCsv';
import { laddersQuestion, madeUpPageId, unansweredQuestion } from './chatbotQuestionRecordFixtures';

const linesOf = (csv: string) => csv.split('\r\n');

describe("a chatbot's record as a CSV file", () => {
	it('has a header and one row a question, every cell quoted', () => {
		const [header, ladders, unanswered] = linesOf(chatbotTrailCsv([laddersQuestion, unansweredQuestion]));
		expect(header).toContain('"Asked at (UK time)","Asked by","Question","Searched for","Pages read"');
		expect(ladders).toContain('"2026-11-10 09:15","stuart@example.com","Do ladders stay up overnight?","ladders overnight"');
		expect(ladders).toContain('"Ladders at the end of the day; Scaffold handover (version 4)"');
		expect(ladders).toContain('"Refused: This chatbot does not read that page."');
		expect(ladders).toContain(`"${madeUpPageId}","${laddersQuestion.questionId}"`);
		expect(unanswered).toContain(`"Who holds the van keys?","","","","","","","","","${unansweredQuestion.questionId}"`);
	});

	it('marks an answer a spreadsheet would run as a formula as text', () => {
		expect(chatbotTrailCsv([laddersQuestion])).toContain(`"'=No. Ladders come down at the end of every day."`);
	});

	it('names the file for the chatbot and the day it was taken', () => {
		expect(chatbotTrailFileName('Site team: ladders & vans', new Date('2026-11-10T23:30:00Z'))).toBe('questions-asked-site-team-ladders-vans-2026-11-10.csv');
		expect(chatbotTrailFileName('***', new Date('2026-06-30T23:30:00Z'))).toBe('questions-asked-2026-07-01.csv');
	});
});
