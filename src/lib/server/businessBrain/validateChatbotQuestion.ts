import { chatbotTrailLimits, type ChatbotAnswerGiven, type ChatbotQuestionAsked } from '$lib/data/businessBrainChatbotTrailRules';
import { lengthRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';

const { longestQuestion, longestAnswer, mostPagesCited } = chatbotTrailLimits;

export const questionField = 'question';
export const questionIdField = 'questionId';

const pagesCitedRefusal = `The pagesCited is a list of at most ${mostPagesCited} page ids, as the readings gave them; leave it empty when you cited none.`;

/** The question in the person's words, and the question on record it carries on if one is named, or why they do not fit. */
export function validateChatbotQuestionAsked(input: Record<string, unknown>): ChatbotQuestionAsked | string {
	const question = trimmedText(input[questionField]);
	const questionRefusal = lengthRefusal(questionField, question, longestQuestion, true);
	if (questionRefusal !== null) return questionRefusal;
	const questionId = trimmedText(input[questionIdField]);
	if (questionId === '') return { question, questionId: null };
	const idRefusal = validateRecordId(questionIdField, questionId);
	if (idRefusal !== null) return idRefusal;
	return { question, questionId };
}

/** The answer the person's Claude gave to a question on record, with the pages it cited, or why it does not fit. */
export function validateChatbotAnswerGiven(input: Record<string, unknown>): ChatbotAnswerGiven | string {
	const questionId = trimmedText(input[questionIdField]);
	const idRefusal = validateRecordId(questionIdField, questionId);
	if (idRefusal !== null) return idRefusal;
	const answer = trimmedText(input.answer);
	const answerRefusal = lengthRefusal('answer', answer, longestAnswer, true);
	if (answerRefusal !== null) return answerRefusal;
	const pagesCited = validatePagesCited(input.pagesCited);
	if (typeof pagesCited === 'string') return pagesCited;
	return { questionId, answer, pagesCited };
}

function validatePagesCited(given: unknown): string[] | string {
	if (given === undefined || given === null) return [];
	if (!Array.isArray(given)) return pagesCitedRefusal;
	const pageIds = [...new Set(given.map(trimmedText))];
	if (pageIds.length > mostPagesCited) return pagesCitedRefusal;
	const notAnId = pageIds.find((pageId) => validateRecordId('page id', pageId) !== null);
	if (notAnId !== undefined) return pagesCitedRefusal;
	return pageIds;
}
