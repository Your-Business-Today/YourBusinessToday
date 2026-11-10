import { businessBrainPartNames } from '$lib/data/businessBrainRules';
import { chatbotReadingKinds, chatbotReadingOutcomes, type ChatbotPageGiven } from '$lib/data/businessBrainChatbotTrailRules';
import { ukClockAt } from '$lib/data/ukClock';
import type { ChatbotQuestionRecord } from '$lib/server/businessBrain/readChatbotQuestionTrail';
import type { ChatbotAnswerRecord, ChatbotReadingRecord } from '$lib/server/businessBrain/readChatbotTrailParts';

const unnamedChatbot = 'a chatbot';

function whenOnUkClock(moment: string): string {
	const { date, time } = ukClockAt(new Date(moment));
	return `${date} ${time}`;
}

function askedFor(reading: ChatbotReadingRecord): string {
	const { kind, searchWords, part, pageId, revisionId } = reading;
	if (kind === chatbotReadingKinds.search) return `searched for "${searchWords ?? ''}"`;
	if (kind === chatbotReadingKinds.index) return part === null ? 'listed every page it reads' : `listed its ${businessBrainPartNames[part]} pages`;
	const version = revisionId === null ? '' : `, earlier version ${revisionId}`;
	return `read page ${pageId ?? ''}${version}`;
}

function pageGivenLine(page: ChatbotPageGiven): string {
	const version = page.revisionId === null ? 'as last filed' : `version ${page.revisionId}, revised`;
	return `    - ${page.title} (page id ${page.pageId}, ${version} ${whenOnUkClock(page.filedAt)})`;
}

function outcomeLines(reading: ChatbotReadingRecord): string[] {
	if (reading.outcome === chatbotReadingOutcomes.refused) return [`    Refused: ${reading.refusal ?? ''}`];
	if (reading.outcome === chatbotReadingOutcomes.nothingFound) return ['    Nothing found.'];
	return reading.pagesGiven.map(pageGivenLine);
}

function readingLines(reading: ChatbotReadingRecord): string[] {
	const heading = `- ${whenOnUkClock(reading.readAt)}: ${askedFor(reading)}, for "${reading.question}"`;
	return [heading, ...outcomeLines(reading)];
}

function answerLines(answer: ChatbotAnswerRecord | null, pagesGiven: Set<string>): string[] {
	if (answer === null) return ['', "**Answer:** none recorded. The person's Claude never reported an answer to this question."];
	const heading = `**Answer**, reported by ${answer.answeredByEmail}'s Claude at ${whenOnUkClock(answer.answeredAt)}:`;
	const quoted = answer.answer.split('\n').map((line) => `> ${line}`);
	const cited = answer.pagesCited.map((pageId) => `- page id ${pageId}${pagesGiven.has(pageId) ? '' : ' — never given back by a reading for this question'}`);
	const citedHeading = cited.length === 0 ? 'Cited no page.' : 'Cited:';
	return ['', heading, ...quoted, citedHeading, ...cited];
}

/** One question on the record: who asked, through which chatbot and when, every reading made for it and the answer. */
export function questionLines(question: ChatbotQuestionRecord, chatbotNames: Map<string, string>): string[] {
	const chatbotName = chatbotNames.get(question.chatbotId) ?? unnamedChatbot;
	const heading = `## ${whenOnUkClock(question.askedAt)} — ${question.askedByEmail}, through "${chatbotName}"`;
	const pagesGiven = new Set(question.readings.flatMap((reading) => reading.pagesGiven.map((page) => page.pageId)));
	const readings = question.readings.flatMap(readingLines);
	return ['', heading, `Question ${question.questionId}: "${question.question}"`, '', '**Readings:**', ...readings, ...answerLines(question.answer, pagesGiven)];
}
