import { consultingMailbox } from '$lib/data/emailToSendRules';
import { validatePersonFields, type PersonFieldChanges } from '$lib/data/validatePersonFields';
import { validateFiledEmail } from '$lib/server/filedEmails/validateFiledEmail';
import type { FiledEmailDirection, FiledEmailGiven } from '$lib/data/filedEmailRules';

/** An email sent from the consulting inbox, with the next step it leaves with the person it went to. */
export type EmailSent = { email: FiledEmailGiven; nextStep: PersonFieldChanges };

const sent: FiledEmailDirection = 'sent';
const sentFromTheConsultingInbox = { mailbox: consultingMailbox, from: consultingMailbox, direction: sent };
const nextStepFields = ['nextAction', 'nextActionDue'];

export const emailSentRefusals = {
	nextStepWithoutPerson: 'A next step is set on a person: give the personId of who the email went to.'
} as const;

/** The sent email as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateEmailSent(input: Record<string, unknown>): EmailSent | string {
	const email = validateFiledEmail({ ...input, ...sentFromTheConsultingInbox });
	if (typeof email === 'string') return email;
	const nextStepGiven = Object.fromEntries(nextStepFields.filter((field) => field in input).map((field) => [field, input[field]]));
	const hasNextStep = Object.keys(nextStepGiven).length > 0;
	const isNextStepForNobody = hasNextStep && email.personId === null;
	if (isNextStepForNobody) return emailSentRefusals.nextStepWithoutPerson;
	const nextStep = validatePersonFields(nextStepGiven);
	if (typeof nextStep === 'string') return nextStep;
	return { email, nextStep };
}
