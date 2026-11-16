import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import { emailPurposeOf, emailPurposes, isEmailPurpose, type EmailRequest } from '$lib/data/emailToSendRules';
import { isGmailId } from '$lib/data/gmailFields';
import { filedEmailRefusals } from '$lib/server/filedEmails/filedEmailRefusals';

const nothingGiven = '';

export const emailRequestRefusals = {
	purpose: `The purpose is one of ${emailPurposes.join(', ')}.`,
	replyWithoutThread: 'A reply names the threadId of the Gmail thread it answers, as the Gmail connector gives it.',
	threadId: filedEmailRefusals.threadId
} as const;

/** The email asked for, each field checked, or the sentence naming the one that does not fit. */
export function validateEmailRequest(input: Record<string, unknown>): EmailRequest | string {
	const clientId = trimmedText(input.clientId);
	const clientRefusal = validateRecordId('clientId', clientId);
	if (clientRefusal !== null) return clientRefusal;
	const personIdText = trimmedText(input.personId);
	const personId = personIdText === nothingGiven ? null : personIdText;
	const personRefusal = personId === null ? null : validateRecordId('personId', personId);
	if (personRefusal !== null) return personRefusal;
	const purpose = trimmedText(input.purpose);
	if (!isEmailPurpose(purpose)) return emailRequestRefusals.purpose;
	const threadId = readThreadId(input, purpose);
	if (threadId.refusal !== null) return threadId.refusal;
	return { clientId, personId, purpose, threadId: threadId.id };
}

function readThreadId(input: Record<string, unknown>, purpose: string): { id: string | null; refusal: string | null } {
	const threadId = trimmedText(input.threadId);
	const isReply = purpose === emailPurposeOf.reply;
	const isThreadGiven = threadId !== nothingGiven;
	if (!isThreadGiven && isReply) return { id: null, refusal: emailRequestRefusals.replyWithoutThread };
	if (!isThreadGiven) return { id: null, refusal: null };
	if (!isGmailId(threadId)) return { id: null, refusal: emailRequestRefusals.threadId };
	return { id: threadId, refusal: null };
}
