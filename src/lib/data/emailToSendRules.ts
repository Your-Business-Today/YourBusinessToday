/** Why an email is being written to someone at a client or lead. */
export type EmailPurpose = 'approach' | 'reply' | 'follow_up' | 'other';

export const emailPurposeLabels: Record<EmailPurpose, string> = {
	approach: 'A first approach',
	reply: 'A reply in their thread',
	follow_up: 'A follow-up',
	other: 'Something else'
};

export const emailPurposes = Object.keys(emailPurposeLabels) as EmailPurpose[];

export const emailPurposeOf = { approach: 'approach', reply: 'reply' } as const;

/** The inbox Your Business Today's own Claude writes from, signed in to Gmail. */
export const consultingMailbox = 'consulting@yourbusiness.today';

/** How much of what we already have with a client is shown beside an email to write. */
export const emailToSendContext = { latestFiledEmails: 5, latestConversations: 5 } as const;

/** An email asked for, checked by validateEmailRequest before anything is read. */
export type EmailRequest = {
	clientId: string;
	personId: string | null;
	purpose: EmailPurpose;
	threadId: string | null;
};

export function isEmailPurpose(candidate: string): candidate is EmailPurpose {
	return emailPurposes.some((purpose) => purpose === candidate);
}
