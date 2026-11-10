import {
	citedButNeverGiven,
	citedPageNames,
	pageGivenPhrase,
	pagesReadOf,
	readingShortfall,
	searchesOf,
	whenOnUkClock
} from '$lib/data/businessBrainChatbotTrailWording';
import { spreadsheetSafeCsv } from '$lib/data/spreadsheetSafeCsv';
import { ukClockAt } from '$lib/data/ukClock';
import type { ChatbotQuestionRecord } from './readChatbotQuestionTrail';

const header = [
	'Asked at (UK time)',
	'Asked by',
	'Question',
	'Searched for',
	'Pages read',
	'Readings that gave nothing',
	'Answer reported',
	'Answer reported by',
	'Answer reported at (UK time)',
	'Pages cited',
	'Pages cited that no reading gave',
	'Question id'
];
const listSeparator = '; ';
const noAnswer = '';
const fileNameSeparator = '-';
const outsideFileNames = /[^a-z0-9]+/g;
const edgeSeparators = /^-|-$/g;

function answerCells(question: ChatbotQuestionRecord): string[] {
	const { answer } = question;
	if (answer === null) return [noAnswer, noAnswer, noAnswer, noAnswer, noAnswer];
	const neverGiven = citedButNeverGiven(question).join(listSeparator);
	const cited = citedPageNames(question).join(listSeparator);
	return [answer.answer, answer.answeredByEmail, whenOnUkClock(answer.answeredAt), cited, neverGiven];
}

function questionRow(question: ChatbotQuestionRecord): string[] {
	const searched = searchesOf(question).join(listSeparator);
	const pagesRead = pagesReadOf(question).map(pageGivenPhrase).join(listSeparator);
	const shortfalls = question.readings.map(readingShortfall).filter((shortfall) => shortfall !== null);
	const asked = [whenOnUkClock(question.askedAt), question.askedByEmail, question.question];
	return [...asked, searched, pagesRead, shortfalls.join(listSeparator), ...answerCells(question), question.questionId];
}

/** A chatbot's questions as a CSV file, one row a question, latest first, as the record keeps them. */
export function chatbotTrailCsv(questions: ChatbotQuestionRecord[]): string {
	return spreadsheetSafeCsv([header, ...questions.map(questionRow)]);
}

/** The download's file name: the chatbot's name and the day it was taken, UK time. */
export function chatbotTrailFileName(chatbotName: string, takenOn: Date): string {
	const nameInFile = chatbotName.toLowerCase().replace(outsideFileNames, fileNameSeparator).replace(edgeSeparators, '');
	const { date } = ukClockAt(takenOn);
	return ['questions-asked', nameInFile, date].filter((part) => part !== '').join(fileNameSeparator) + '.csv';
}
