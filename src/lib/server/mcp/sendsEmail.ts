/** Who an email that an action sends goes out as, written as the person receiving it reads it. */
export const emailSenders = {
	yourBusinessToday: 'Your Business Today <hello@yourbusiness.today>'
} as const;

export type EmailSender = (typeof emailSenders)[keyof typeof emailSenders];

const sendsEmailWords = 'SENDS EMAIL from';

/** An action's summary opened with who its email goes out as, so a Claude knows before it runs it that an email will leave. */
export function sendsEmailFrom(sender: EmailSender, summary: string): string {
	return `${sendsEmailWords} ${sender}: ${summary}`;
}

export function isLabelledAsSendingEmail(summary: string): boolean {
	return Object.values(emailSenders).some((sender) => summary.startsWith(`${sendsEmailWords} ${sender}: `));
}
