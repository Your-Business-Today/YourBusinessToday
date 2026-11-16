import { addLeadFromEmail } from '$lib/server/leadsFromEmail/addLeadFromEmail';
import { findLeadHeldAlready } from '$lib/server/leadsFromEmail/findLeadHeldAlready';
import { resolveStaffMember } from '$lib/server/projects/resolveStaffMember';
import { validateLeadFromEmail } from '$lib/server/leadsFromEmail/validateLeadFromEmail';
import { describeLeadHeldAlready } from './describeLeadHeldAlready';
import { broughtInByField, notOneStaffMember } from './salesLeaderboardActions';
import { emailContentFields, emailMessageFields } from './filedEmailFields';
import { objectSchema, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const leadGuidance =
	'For an enquiry from someone we do not hold. Ask find_records_for_email first: when it finds the sender or their ' +
	'company, file the email under that record with file_email_to_client instead, and this action refuses to add them ' +
	'twice. Give companyName for the company the sender writes for, with its companyNumber when you have found it on ' +
	'Companies House, or isPrivateIndividual true when they write for themselves. Keep a short summary of what the email ' +
	'asks for, never its body. Nothing is written until every value has been checked. Then label the thread ' +
	'YBT/<lead name> in Gmail.';

const leadSchema = objectSchema(
	{
		...emailMessageFields,
		...emailContentFields,
		companyName: textField('The company the sender writes for. Leave it out for a private individual'),
		isPrivateIndividual: { type: 'boolean', description: 'True when the sender writes for themselves, not for a company' },
		senderName: textField("The sender's full name, as they sign the email"),
		senderPhone: textField("The sender's phone number, when the email gives it"),
		companyNumber: textField('The company number, when you have found it on Companies House'),
		broughtInBy: broughtInByField
	},
	['mailbox', 'messageId', 'threadId', 'from', 'sentAt', 'summary', 'senderName']
);

export const leadFromEmailActions: McpAction[] = [
	{
		name: 'add_lead_from_email',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'make a new lead from an email we received: the company, the person who wrote as its main contact, and the email filed under it',
		guidance: leadGuidance,
		inputSchema: leadSchema,
		run: async (caller, input) => addTheLead(caller, input)
	}
];

async function addTheLead(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const enquiry = validateLeadFromEmail(input);
	if (typeof enquiry === 'string') return enquiry;
	const { lead, email } = enquiry;
	const broughtInBy = await resolveStaffMember(caller.supabase, lead.broughtInBy, caller.accountId);
	if (broughtInBy === null) return notOneStaffMember;
	const heldAlready = await findLeadHeldAlready(caller.supabase, lead, email.from);
	if (heldAlready !== null) return describeLeadHeldAlready(caller.supabase, heldAlready);
	const outcome = await addLeadFromEmail(caller.supabase, enquiry, broughtInBy, caller.accountId);
	return (
		`${lead.leadName} is on the register as a lead, brought in by ${broughtInBy.name} — client ${outcome.clientId}. ` +
		`${lead.senderName} is its main contact (person ${outcome.personId}), and "${email.subject}" is filed under it ` +
		`(filed email ${outcome.filedEmailId}). Now label the thread YBT/${lead.leadName} in Gmail.`
	);
}
