import { filedEmailDirections, filedEmailLimits } from '$lib/data/filedEmailRules';

const { longestAddress, longestGmailId, mostRecipients, longestSubject, longestSummary } = filedEmailLimits;

/** Why a field of an email does not fit its column, one sentence a field. */
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
