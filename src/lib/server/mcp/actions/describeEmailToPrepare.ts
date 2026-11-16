import { consultingMailbox, emailPurposeLabels, emailPurposeOf, type EmailRequest } from '$lib/data/emailToSendRules';
import { describeFiledEmails } from './describeFiledEmails';
import { describeLeadConversations } from './describeLeadConversations';
import { gmailSendingSteps } from './gmailSendingSteps';
import type { FiledEmail } from '$lib/data/filedEmailRules';
import type { LeadConversation } from '$lib/data/leadConversationRules';

/** The approach drafted for the person and kept in their notes, as save_person_approach saved it. */
export type SavedApproach = { createdAt: string; body: string };

/** Everything a Claude needs to write one email to one person at a client, and the steps it follows to send it. */
export type EmailToPrepare = {
	request: EmailRequest;
	clientName: string;
	recipient: { name: string; email: string; role: string };
	savedApproach: SavedApproach | null;
	filedEmails: FiledEmail[];
	conversations: LeadConversation[];
};

const noApproachSaved = 'None saved for them yet. Write the approach now, or draft one and keep it with save_person_approach.';

export function describeEmailToPrepare(email: EmailToPrepare): string {
	return [
		...headingLines(email),
		...approachLines(email.request, email.savedApproach),
		'',
		`Latest emails filed under ${email.clientName}:`,
		...describeFiledEmails(email.filedEmails),
		'',
		`Latest conversations with ${email.clientName}:`,
		...describeLeadConversations(email.conversations),
		'',
		'Steps, drafts first:',
		...gmailSendingSteps
	].join('\n');
}

function headingLines(email: EmailToPrepare): string[] {
	const { recipient, request } = email;
	const role = recipient.role === '' ? '' : `, ${recipient.role}`;
	const lines = [
		`From: ${consultingMailbox}, through Gmail`,
		`To: ${recipient.name} <${recipient.email}>${role}, at ${email.clientName}`,
		`Purpose: ${emailPurposeLabels[request.purpose]}`
	];
	if (request.threadId === null) return lines;
	return [...lines, `Reply in Gmail thread: ${request.threadId}`];
}

function approachLines(request: EmailRequest, note: SavedApproach | null): string[] {
	const isApproach = request.purpose === emailPurposeOf.approach;
	if (!isApproach) return [];
	if (note === null) return ['', 'Saved approach:', noApproachSaved];
	return ['', `Saved approach, ${note.createdAt}:`, note.body];
}
