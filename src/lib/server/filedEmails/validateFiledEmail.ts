import { isGmailId, isMailboxAddress } from '$lib/data/gmailFields';
import { isInstantWithZone } from '$lib/data/instantWithZone';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import {
	filedEmailDirections,
	filedEmailLimits,
	isFiledEmailDirection,
	type FiledEmailGiven
} from '$lib/data/filedEmailRules';

const { longestAddress, longestGmailId, mostRecipients, longestSubject, longestSummary } = filedEmailLimits;
const noPersonNamed = '';

export const filedEmailRefusals = {
	mailbox: `The mailbox is the address the email was read in, such as consulting@yourbusiness.today, at most ${longestAddress} characters.`,
	messageId: `The messageId is the Gmail message's id, as the Gmail connector gives it: 1 to ${longestGmailId} characters, no spaces.`,
	threadId: `The threadId is the Gmail thread's id, as the Gmail connector gives it: 1 to ${longestGmailId} characters, no spaces.`,
	direction: `The direction is one of ${filedEmailDirections.join(', ')}.`,
	from: `The from is the sender's address alone, such as name@example.com, at most ${longestAddress} characters.`,
	to: `The to is a list of at most ${mostRecipients} addresses, each alone, such as name@example.com.`,
	subject: `The subject is at most ${longestSubject} characters.`,
	sentAt: 'The sentAt is when the email was sent, as ISO 8601 with its time zone, such as 2026-11-16T09:30:00Z.',
	summary: `The summary is 1 to ${longestSummary} characters: what the email is about and asks for, never its body and nothing personal.`
} as const;

/** The email as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateFiledEmail(input: Record<string, unknown>): FiledEmailGiven | string {
	const clientId = trimmedText(input.clientId);
	const clientRefusal = validateRecordId('clientId', clientId);
	if (clientRefusal !== null) return clientRefusal;
	const personId = personNamedIn(input);
	if (personId.refusal !== null) return personId.refusal;
	const message = readMessage(input);
	if (typeof message === 'string') return message;
	const content = readContent(input);
	if (typeof content === 'string') return content;
	return { clientId, personId: personId.id, ...message, ...content };
}

function personNamedIn(input: Record<string, unknown>): { id: string | null; refusal: string | null } {
	const personIdText = trimmedText(input.personId);
	if (personIdText === noPersonNamed) return { id: null, refusal: null };
	return { id: personIdText, refusal: validateRecordId('personId', personIdText) };
}

type MessageFields = Pick<FiledEmailGiven, 'mailbox' | 'messageId' | 'threadId' | 'direction' | 'from' | 'to'>;

function readMessage(input: Record<string, unknown>): MessageFields | string {
	const mailbox = trimmedText(input.mailbox);
	if (!isMailboxAddress(mailbox)) return filedEmailRefusals.mailbox;
	const messageId = trimmedText(input.messageId);
	if (!isGmailId(messageId)) return filedEmailRefusals.messageId;
	const threadId = trimmedText(input.threadId);
	if (!isGmailId(threadId)) return filedEmailRefusals.threadId;
	const direction = trimmedText(input.direction);
	if (!isFiledEmailDirection(direction)) return filedEmailRefusals.direction;
	const from = trimmedText(input.from);
	if (!isMailboxAddress(from)) return filedEmailRefusals.from;
	const to = readRecipients(input.to);
	if (to === null) return filedEmailRefusals.to;
	return { mailbox, messageId, threadId, direction, from, to };
}

type ContentFields = Pick<FiledEmailGiven, 'subject' | 'sentAt' | 'summary'>;

function readContent(input: Record<string, unknown>): ContentFields | string {
	const subject = trimmedText(input.subject);
	if (subject.length > longestSubject) return filedEmailRefusals.subject;
	const sentAt = trimmedText(input.sentAt);
	if (!isInstantWithZone(sentAt)) return filedEmailRefusals.sentAt;
	const summary = trimmedText(input.summary);
	const isSummaryOutOfBounds = summary === '' || summary.length > longestSummary;
	if (isSummaryOutOfBounds) return filedEmailRefusals.summary;
	return { subject, sentAt, summary };
}

function readRecipients(given: unknown): string[] | null {
	if (given === undefined) return [];
	if (!Array.isArray(given)) return null;
	if (given.length > mostRecipients) return null;
	const addresses = given.map(trimmedText);
	const isEveryOneAnAddress = addresses.every(isMailboxAddress);
	return isEveryOneAnAddress ? addresses : null;
}
