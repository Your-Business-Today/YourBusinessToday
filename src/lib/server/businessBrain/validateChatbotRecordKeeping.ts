import { chatbotRecordKeepingLimits, keptDaysField } from '$lib/data/chatbotRecordKeepingRules';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import { questionIdField } from './validateChatbotQuestion';

const { shortestKeptDays, longestKeptDays } = chatbotRecordKeepingLimits;

const wholeDaysPattern = /^[0-9]{1,9}$/;

export const keptDaysRefusal =
	`The ${keptDaysField} is a whole number of days from ${shortestKeptDays} to ${longestKeptDays}, ` +
	'or left out to keep the record for as long as Your Business Brain is kept.';

/** The days the record is kept, null for as long as the Brain is kept, or the sentence saying why the value does not fit. */
export function validateChatbotRecordKeptDays(input: Record<string, unknown>): { keptDays: number | null } | string {
	const given = trimmedText(input[keptDaysField]);
	if (given === '') return { keptDays: null };
	if (!wholeDaysPattern.test(given)) return keptDaysRefusal;
	const keptDays = Number(given);
	const isInRange = keptDays >= shortestKeptDays && keptDays <= longestKeptDays;
	if (!isInRange) return keptDaysRefusal;
	return { keptDays };
}

/** The question to delete from the record, or the sentence saying why its id does not fit. */
export function validateChatbotQuestionToDelete(input: Record<string, unknown>): { questionId: string } | string {
	const questionId = trimmedText(input[questionIdField]);
	const idRefusal = validateRecordId(questionIdField, questionId);
	if (idRefusal !== null) return idRefusal;
	return { questionId };
}
