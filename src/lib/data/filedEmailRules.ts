/** Whether we received the email or sent it from the mailbox. */
export type FiledEmailDirection = 'received' | 'sent';

export const filedEmailDirectionLabels: Record<FiledEmailDirection, string> = {
	received: 'Received',
	sent: 'Sent'
};

export const filedEmailDirections = Object.keys(filedEmailDirectionLabels) as FiledEmailDirection[];

/** The limits on a filed email, stated once and mirrored by migration 0256. */
export const filedEmailLimits = {
	longestAddress: 320,
	longestGmailId: 200,
	mostRecipients: 100,
	longestSubject: 1000,
	longestSummary: 2000,
	mostShownToClaude: 20
} as const;

/** An email as a Claude files it, checked by validateFiledEmail before anything is written. */
export type FiledEmailGiven = {
	clientId: string;
	personId: string | null;
	mailbox: string;
	messageId: string;
	threadId: string;
	direction: FiledEmailDirection;
	from: string;
	to: string[];
	subject: string;
	sentAt: string;
	summary: string;
};

/** An email kept on a client, with the name of the person at the client it names. */
export type FiledEmail = Omit<FiledEmailGiven, 'clientId'> & {
	id: string;
	personName: string;
	filedAt: string;
};

export function isFiledEmailDirection(candidate: string): candidate is FiledEmailDirection {
	return filedEmailDirections.some((direction) => direction === candidate);
}

/** The address that opens the email's thread in Gmail, signed in as the mailbox it was filed from. */
export function gmailThreadLink(email: Pick<FiledEmail, 'mailbox' | 'threadId'>): string {
	const mailbox = encodeURIComponent(email.mailbox);
	const thread = encodeURIComponent(email.threadId);
	return `https://mail.google.com/mail/u/?authuser=${mailbox}#all/${thread}`;
}

/** What an email is filed against: a client or lead, or the task or to-do it set off. */
export type FilingTargetKind = 'client' | 'task' | 'todo';

export type FilingTarget = { kind: FilingTargetKind; id: string };

/** An email as a Claude gives it, before anyone says what it is filed against or who it is with. */
export type EmailFacts = Omit<FiledEmailGiven, 'clientId' | 'personId'>;

/** One email to keep: what it says, who at the sender it is with, and what it is filed against. */
export type EmailFiling = EmailFacts & { personId: string | null; target: FilingTarget };
