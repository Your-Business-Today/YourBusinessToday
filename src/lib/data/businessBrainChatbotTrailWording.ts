import { businessBrainPartNames } from './businessBrainRules';
import { chatbotReadingKinds, chatbotReadingOutcomes, type ChatbotPageGiven } from './businessBrainChatbotTrailRules';
import { ukClockAt } from './ukClock';
import type { ChatbotQuestionRecord } from '$lib/server/businessBrain/readChatbotQuestionTrail';
import type { ChatbotReadingRecord } from '$lib/server/businessBrain/readChatbotTrailParts';

/** A moment on the record as a UK clock shows it: the date and the time of day. */
export function whenOnUkClock(moment: string): string {
	const { date, time } = ukClockAt(new Date(moment));
	return `${date} ${time}`;
}

/** What a reading asked Your Business Brain for, as a phrase. */
export function readingAskedFor(reading: ChatbotReadingRecord): string {
	const { kind, searchWords, part } = reading;
	if (kind === chatbotReadingKinds.search) return `Searched for “${searchWords ?? ''}”`;
	if (kind === chatbotReadingKinds.page) return 'Read a page';
	if (part === null) return 'Listed every page it reads';
	return `Listed its ${businessBrainPartNames[part]} pages`;
}

/** Why a reading gave no page back, or null when it gave pages. */
export function readingShortfall(reading: ChatbotReadingRecord): string | null {
	const { outcome, refusal } = reading;
	if (outcome === chatbotReadingOutcomes.refused) return `Refused: ${refusal ?? ''}`;
	if (outcome === chatbotReadingOutcomes.nothingFound) return 'Nothing found';
	return null;
}

/** The words of every search made for the question, in the order searched. */
export function searchesOf(question: ChatbotQuestionRecord): string[] {
	const searches = question.readings.filter((reading) => reading.kind === chatbotReadingKinds.search);
	return searches.map((reading) => reading.searchWords ?? '');
}

/** Every page the readings gave back for the question, each version once, in the order first given. */
export function pagesReadOf(question: ChatbotQuestionRecord): ChatbotPageGiven[] {
	const pagesGiven = question.readings.flatMap((reading) => reading.pagesGiven);
	const pagesByVersion = new Map(pagesGiven.map((page) => [`${page.pageId}/${page.revisionId}`, page]));
	return [...pagesByVersion.values()];
}

/** The pages the reported answer cited that no reading for its question gave back. */
export function citedButNeverGiven(question: ChatbotQuestionRecord): string[] {
	const givenPageIds = new Set(pagesReadOf(question).map((page) => page.pageId));
	return pagesCitedOf(question).filter((pageId) => !givenPageIds.has(pageId));
}

/** A page as given back, in words: its title, and the version when it was an earlier one. */
export function pageGivenPhrase(page: ChatbotPageGiven): string {
	if (page.revisionId === null) return page.title;
	return `${page.title} (version ${page.revisionId})`;
}

/** The pages the reported answer cited, each by its title where a reading gave it back, else by its page id. */
export function citedPageNames(question: ChatbotQuestionRecord): string[] {
	const titles = new Map(pagesReadOf(question).map((page) => [page.pageId, page.title]));
	return pagesCitedOf(question).map((pageId) => titles.get(pageId) ?? `page ${pageId}`);
}

function pagesCitedOf(question: ChatbotQuestionRecord): string[] {
	const { answer } = question;
	if (answer === null) return [];
	return answer.pagesCited;
}

/** Said in place of the record before the release's database change has run. */
export const chatbotTrailNotKeptYet =
	'The record of questions asked through chatbots starts once this release’s database change has run. Nothing is on it yet.';
