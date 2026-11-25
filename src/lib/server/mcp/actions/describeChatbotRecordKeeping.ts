import { countOf } from '$lib/data/countOf';
import { daysPhrase, deletionLine, keepingSentence } from '$lib/data/chatbotRecordKeepingWording';
import { brainOf } from './businessBrainAnswers';
import type { ChatbotRecordDeletion, ChatbotRecordKeeping } from '$lib/data/chatbotRecordKeepingRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Says the question has gone from the record, and that its going is recorded. */
export function questionDeleted(questionId: string): string {
	return `Question ${questionId} is deleted from the chatbot record, with its readings and answer. The deletion is recorded, without its words.`;
}

/** Says how long the record is now kept. */
export function keepingSet(organisation: Organisation, keptDays: number | null): string {
	if (keptDays === null) return `The chatbot record of ${brainOf(organisation)} is now kept for as long as the Brain is kept.`;
	return `Questions on the chatbot record of ${brainOf(organisation)} are now kept for ${daysPhrase(keptDays)}; older ones are deleted overnight and each deletion recorded.`;
}

/** How long the record is kept, and the latest deletions from it, each by chatbot name. */
export function describeChatbotRecordDeletions(
	keeping: ChatbotRecordKeeping,
	deletions: ChatbotRecordDeletion[],
	chatbotNames: Map<string, string>
): string {
	const heading = `# ${countOf(deletions.length, 'deletion')} from the chatbot record, latest first`;
	const lines = deletions.map((deletion) => `- ${chatbotNames.get(deletion.chatbotId) ?? 'A chatbot'}: ${deletionLine(deletion)} (question ${deletion.questionId})`);
	return [keepingSentence(keeping), '', heading, ...lines].join('\n');
}
