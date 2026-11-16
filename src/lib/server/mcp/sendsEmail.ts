import { consultingMailbox } from '$lib/data/emailToSendRules';

/** Who an email that an action sends goes out as, written as the person receiving it reads it. */
export const emailSenders = {
	yourBusinessToday: 'Your Business Today <hello@yourbusiness.today>',
	consultingThroughGmail: `${consultingMailbox} through Gmail`
} as const;

export type EmailSender = (typeof emailSenders)[keyof typeof emailSenders];

/** The senders whose email leaves from the person's own Claude through a connector, so no code of ours sends it. */
export const sendersInTheirClaude: EmailSender[] = [emailSenders.consultingThroughGmail];

const sendsEmailWords = 'SENDS EMAIL from';

/** An action's summary opened with who its email goes out as, so a Claude knows before it runs it that an email will leave. */
export function sendsEmailFrom(sender: EmailSender, summary: string): string {
	return `${sendsEmailWords} ${sender}: ${summary}`;
}

export function isLabelledAsSendingEmail(summary: string): boolean {
	return Object.values(emailSenders).some((sender) => isOpenedWithSender(summary, sender));
}

export function isSentFromTheirClaude(summary: string): boolean {
	return sendersInTheirClaude.some((sender) => isOpenedWithSender(summary, sender));
}

function isOpenedWithSender(summary: string, sender: EmailSender): boolean {
	return summary.startsWith(`${sendsEmailWords} ${sender}: `);
}
