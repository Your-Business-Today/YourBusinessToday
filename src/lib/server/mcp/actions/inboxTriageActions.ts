import { isMailboxAddress } from '$lib/data/gmailFields';
import { trimmedText } from '$lib/data/trimmedText';
import { triageDecisionLimits, triageOutcomes } from '$lib/data/triageDecisionRules';
import { readInboxTriage } from '$lib/server/emailTriage/readInboxTriage';
import { recordTriageDecisions } from '$lib/server/emailTriage/recordTriageDecisions';
import { validateTriageDecisions } from '$lib/server/emailTriage/validateTriageDecisions';
import { filedEmailRefusals } from '$lib/server/filedEmails/filedEmailRefusals';
import { describeInboxTriage } from './describeInboxTriage';
import { describeTriageRecording } from './describeTriageRecording';
import { objectSchema, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const { longestNote, mostPerCall } = triageDecisionLimits;
const mailboxField = textField('The address whose inbox is being triaged, such as consulting@yourbusiness.today');

const decisionSchema = objectSchema(
	{
		messageId: textField("The Gmail message's id, as the Gmail connector gives it"),
		threadId: textField("The Gmail thread's id, as the Gmail connector gives it"),
		outcome: textField(`One of ${triageOutcomes.join(', ')}`),
		filedEmailId: textField('When it was filed, the id file_email_to_client answered with'),
		note: textField(`Why, in a line, at most ${longestNote} characters, never the email's words`)
	},
	['messageId', 'threadId', 'outcome']
);

export const inboxTriageActions: McpAction[] = [
	{
		name: 'read_inbox_triage',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'where triage of a Gmail inbox stands: when the last decision was made, the Gmail search for what is left, the emails already decided to skip and the counts by outcome',
		guidance: 'Call it first in every triage run, then search Gmail as it says and skip every message id it lists.',
		inputSchema: objectSchema({ mailbox: mailboxField }, ['mailbox']),
		run: async (caller, input) => {
			const mailbox = trimmedText(input.mailbox).toLowerCase();
			if (!isMailboxAddress(mailbox)) return filedEmailRefusals.mailbox;
			return describeInboxTriage(await readInboxTriage(caller.supabase, mailbox, new Date()));
		}
	},
	{
		name: 'record_triage_decision',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: `record what triage decided for each email — filed, new lead, task, to-do or set aside — up to ${mostPerCall} in one call, so no run decides it again`,
		guidance:
			'Record an email once it is settled: filed under its client, raised as a lead, task, support request or to-do, or set aside. ' +
			'An email decided before keeps its first decision. Then put the YBT/Triaged label on it in Gmail.',
		inputSchema: objectSchema(
			{ mailbox: mailboxField, decisions: { type: 'array', items: decisionSchema, minItems: 1, maxItems: mostPerCall } },
			['mailbox', 'decisions']
		),
		run: async (caller, input) => {
			const decisions = validateTriageDecisions(input);
			if (typeof decisions === 'string') return decisions;
			return describeTriageRecording(await recordTriageDecisions(caller.supabase, decisions, caller.accountId));
		}
	}
];
