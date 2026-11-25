import { chatbotRecordDeletionReasons, type ChatbotRecordDeletion, type ChatbotRecordKeeping } from './chatbotRecordKeepingRules';
import { whenOnUkClock } from './businessBrainChatbotTrailWording';

/** How long the record is kept, as a sentence. */
export function keepingSentence(keeping: ChatbotRecordKeeping): string {
	const { keptDays } = keeping;
	if (keptDays === null) return 'The record is kept for as long as this Your Business Brain is kept.';
	return `Each question is kept for ${daysPhrase(keptDays)} after it was asked, then deleted overnight.`;
}

/** A number of days in words: one day, or so many days. */
export function daysPhrase(days: number): string {
	if (days === 1) return '1 day';
	return `${days} days`;
}

/** Who or what deleted a question from the record, as a phrase. */
export function deletedByPhrase(deletion: ChatbotRecordDeletion): string {
	if (deletion.reason === chatbotRecordDeletionReasons.pastTheKeepingPeriod) return 'deleted overnight, past the keeping period';
	return `deleted by ${deletion.deletedByEmail ?? 'a manager no longer on Your Business Today'}`;
}

/** One deletion as a line: the question asked then, deleted when and by whom. */
export function deletionLine(deletion: ChatbotRecordDeletion): string {
	const asked = whenOnUkClock(deletion.questionAskedAt);
	const deleted = whenOnUkClock(deletion.deletedAt);
	return `A question asked ${asked}, ${deletedByPhrase(deletion)} on ${deleted}.`;
}
