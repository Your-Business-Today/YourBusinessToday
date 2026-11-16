import { isGmailId, isMailboxAddress } from '$lib/data/gmailFields';
import { isUuid } from '$lib/data/isUuid';
import { trimmedText } from '$lib/data/trimmedText';
import { filedEmailRefusals } from '$lib/server/filedEmails/filedEmailRefusals';
import {
	isTriageOutcome,
	triageDecisionLimits,
	triageOutcomes,
	type TriageDecisionGiven
} from '$lib/data/triageDecisionRules';

const { longestNote, mostPerCall } = triageDecisionLimits;
const noFilingNamed = '';

export const triageDecisionRefusals = {
	decisions: `The decisions are a list of 1 to ${mostPerCall} emails, each with its messageId, threadId and outcome.`,
	outcome: `The outcome is one of ${triageOutcomes.join(', ')}.`,
	filedEmailId: 'The filedEmailId is the id file_email_to_client answered with, such as 00000000-0000-0000-0000-000000000000.',
	note: `The note is at most ${longestNote} characters: why, in a line, never the email's words.`,
	twice: 'The same messageId is given twice in one call: decide each email once.'
} as const;

/** The decisions as given, every field checked against its column, or the sentence naming the first that does not fit. */
export function validateTriageDecisions(input: Record<string, unknown>): TriageDecisionGiven[] | string {
	const mailbox = trimmedText(input.mailbox).toLowerCase();
	if (!isMailboxAddress(mailbox)) return filedEmailRefusals.mailbox;
	const given = input.decisions;
	const isListThatFits = Array.isArray(given) && given.length > 0 && given.length <= mostPerCall;
	if (!isListThatFits) return triageDecisionRefusals.decisions;
	const decisions: TriageDecisionGiven[] = [];
	for (const [index, entry] of given.entries()) {
		const decision = readDecision(mailbox, entry);
		if (typeof decision === 'string') return `Decision ${index + 1}: ${decision}`;
		decisions.push(decision);
	}
	return hasRepeatedMessage(decisions) ? triageDecisionRefusals.twice : decisions;
}

function readDecision(mailbox: string, entry: unknown): TriageDecisionGiven | string {
	const isObject = typeof entry === 'object' && entry !== null;
	if (!isObject) return triageDecisionRefusals.decisions;
	const fields = entry as Record<string, unknown>;
	const messageId = trimmedText(fields.messageId);
	if (!isGmailId(messageId)) return filedEmailRefusals.messageId;
	const threadId = trimmedText(fields.threadId);
	if (!isGmailId(threadId)) return filedEmailRefusals.threadId;
	const outcome = trimmedText(fields.outcome);
	if (!isTriageOutcome(outcome)) return triageDecisionRefusals.outcome;
	const filedEmailId = trimmedText(fields.filedEmailId);
	const isFilingMisnamed = filedEmailId !== noFilingNamed && !isUuid(filedEmailId);
	if (isFilingMisnamed) return triageDecisionRefusals.filedEmailId;
	const note = trimmedText(fields.note);
	if (note.length > longestNote) return triageDecisionRefusals.note;
	return { mailbox, messageId, threadId, outcome, filedEmailId: filedEmailId || null, note };
}

function hasRepeatedMessage(decisions: TriageDecisionGiven[]): boolean {
	const messageIds = new Set(decisions.map((decision) => decision.messageId));
	return messageIds.size < decisions.length;
}
