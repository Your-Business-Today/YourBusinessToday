import { isGmailId, isMailboxAddress } from '$lib/data/gmailFields';
import { isInstantWithZone } from '$lib/data/instantWithZone';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import { filedEmailRefusals } from './filedEmailRefusals';
import {
	filedEmailLimits,
	isFiledEmailDirection,
	type EmailDetails,
	type FiledEmailGiven
} from '$lib/data/filedEmailRules';

const { longestAddress, longestGmailId, mostRecipients, longestSubject, longestSummary } = filedEmailLimits;
const noPersonNamed = '';

/** The email as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateFiledEmail(input: Record<string, unknown>): FiledEmailGiven | string {
	const clientId = trimmedText(input.clientId);
	const clientRefusal = validateRecordId('clientId', clientId);
	if (clientRefusal !== null) return clientRefusal;
	const personId = personNamedIn(input);
	if (personId.refusal !== null) return personId.refusal;
	const details = validateEmailDetails(input);
	if (typeof details === 'string') return details;
	return { clientId, personId: personId.id, ...details };
}

/** The email itself, apart from where it is filed: each field checked against its column, or the sentence naming the one that does not fit. */
export function validateEmailDetails(input: Record<string, unknown>): EmailDetails | string {
	const message = readMessage(input);
	if (typeof message === 'string') return message;
	const content = readContent(input);
	if (typeof content === 'string') return content;
	return { ...message, ...content };
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
