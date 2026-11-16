import { consultingMailbox, emailPurposes } from '$lib/data/emailToSendRules';
import { filedEmailLimits } from '$lib/data/filedEmailRules';
import { emailSenders, sendsEmailFrom } from '../sendsEmail';
import { gmailSendingGuidance } from './gmailSendingSteps';
import { emailMessageFields } from './filedEmailFields';
import { objectSchema, textField } from '../actionTypes';
import { prepareEmail } from './prepareEmail';
import { recordEmailSent } from './recordEmailSent';
import type { McpAction } from '../actionTypes';

const { longestSubject, longestSummary, mostRecipients } = filedEmailLimits;

const clientIdField = textField('The client or lead, as list_clients gives its id');
const personIdField = textField('Who at the client: their person id, as read_client gives it');

const preparingSchema = objectSchema(
	{
		clientId: clientIdField,
		personId: textField('Who at the client to write to, as read_client gives their person id. Leave it out for their main contact'),
		purpose: textField(`Why you are writing: one of ${emailPurposes.join(', ')}`),
		threadId: textField("The Gmail thread to reply in, as the Gmail connector gives its id. Needed for a reply")
	},
	['clientId', 'purpose']
);

const recordingSchema = objectSchema(
	{
		clientId: clientIdField,
		personId: personIdField,
		messageId: textField("The sent Gmail message's id, as the Gmail connector gives it"),
		threadId: emailMessageFields.threadId,
		to: { type: 'array', items: { type: 'string' }, description: `The addresses it went to, each alone, at most ${mostRecipients}` },
		subject: textField(`The subject line, at most ${longestSubject} characters`),
		sentAt: textField('When it was sent, as ISO 8601 with its time zone, such as 2026-11-16T09:30:00Z'),
		summary: textField(`One line on what it said and asked for, never the body, at most ${longestSummary} characters`),
		nextAction: textField('What we do next with them, such as "Call on Thursday if no reply". Needs the personId'),
		nextActionDue: textField('The day the next action is due, YYYY-MM-DD. Needs the personId')
	},
	['clientId', 'messageId', 'threadId', 'to', 'sentAt', 'summary']
);

export const gmailSendingActions: McpAction[] = [
	{
		name: 'prepare_email',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: sendsEmailFrom(
			emailSenders.consultingThroughGmail,
			"get what you need to write one email to someone at a client or lead — their address, the saved approach, the latest emails and conversations — and the steps to draft it in Gmail and send it only on the person's yes"
		),
		guidance: gmailSendingGuidance,
		inputSchema: preparingSchema,
		run: async (caller, input) => prepareEmail(caller, input)
	},
	{
		name: 'record_email_sent',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: `record an email that has gone from ${consultingMailbox} through Gmail: files it under the client, logs it as an email conversation and sets the person's next step`,
		guidance: 'Call it once the email has gone, never for a draft. Keep a one-line summary, never the body and nothing personal.',
		inputSchema: recordingSchema,
		run: async (caller, input) => recordEmailSent(caller, input)
	}
];
