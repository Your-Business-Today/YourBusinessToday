import { filedEmailDirections, filedEmailLimits } from '$lib/data/filedEmailRules';
import { textField } from '../actionTypes';

const { longestSubject, longestSummary, mostRecipients } = filedEmailLimits;

/** What every action that keeps an email takes about it: where it was read, its Gmail ids and what it says. */
export const emailFactFields = {
	mailbox: textField('The address whose inbox it was read in, such as consulting@yourbusiness.today'),
	messageId: textField("The Gmail message's id, as the Gmail connector gives it"),
	threadId: textField("The Gmail thread's id, as the Gmail connector gives it"),
	direction: textField(`One of ${filedEmailDirections.join(', ')}`),
	from: textField("The sender's address alone, such as name@example.com"),
	to: { type: 'array', items: { type: 'string' }, description: `The addresses it was sent to, each alone, at most ${mostRecipients}` },
	subject: textField(`The subject line, at most ${longestSubject} characters`),
	sentAt: textField('When it was sent, as ISO 8601 with its time zone, such as 2026-11-16T09:30:00Z'),
	summary: textField(`What it says and asks for, never the body and nothing personal, at most ${longestSummary} characters`)
};

export const requiredEmailFacts = ['mailbox', 'messageId', 'threadId', 'direction', 'from', 'sentAt', 'summary'];
