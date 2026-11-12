import { conversationChannels, leadConversationLimits } from '$lib/data/leadConversationRules';
import { resolveStaffMember } from '$lib/server/projects/resolveStaffMember';
import { getClient } from '$lib/server/clients/getClient';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { logLeadConversation } from '$lib/server/leadConversations/logLeadConversation';
import { noSuchClient } from './describeClient';
import { objectSchema, readText, textField } from '../actionTypes';
import { validateLeadConversation } from '$lib/server/leadConversations/validateLeadConversation';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const conversationGuidance =
	'Log a conversation once it has happened: a chat, a call, a meeting or a message thread with someone at a lead. ' +
	'Keep only a summary of it and the key information about the deal, such as what they spend now, what they need, ' +
	'what they asked about and the next step. Never copy the conversation word for word and never keep anything ' +
	'personal, even when the person pastes a chat or shares screenshots of it. read_client gives every conversation back.';

const conversationSchema = objectSchema(
	{
		clientId: textField('The lead, as list_clients gives its id'),
		personId: textField('Who at the lead it was with: their person id, as read_client gives it. Leave it out when they are not listed'),
		heldBy: textField("Who on our side had it: a staff member's name. Leave it out when it was you"),
		heldOn: textField('The day it happened, as YYYY-MM-DD'),
		channel: textField(`How it was had: one of ${conversationChannels.join(', ')}`),
		summary: textField(`A summary of the conversation, nothing personal, at most ${leadConversationLimits.longestSummary} characters`),
		dealPoints: textField(`The key information about the deal, one point to a line, at most ${leadConversationLimits.longestDealPoints} characters`)
	},
	['clientId', 'heldOn', 'channel', 'summary']
);

export const leadConversationActions: McpAction[] = [
	{
		name: 'log_lead_conversation',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "log a conversation with a lead's people — a chat, a call, a meeting or messages — as a summary and the key information about the deal, so everyone selling to them knows where it stands",
		guidance: conversationGuidance,
		inputSchema: conversationSchema,
		run: async (caller, input) => logConversation(caller, input)
	}
];

async function logConversation(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const heldBy = await resolveStaffMember(caller.supabase, readText(input, 'heldBy'), caller.accountId);
	if (heldBy === null) return 'heldBy names nobody on the staff, or more than one of them. Give their whole name.';
	const conversation = validateLeadConversation(input, heldBy.id);
	if (typeof conversation === 'string') return conversation;
	const client = await getClient(caller.supabase, conversation.clientId);
	if (client === null) return noSuchClient;
	const contacts = await getContactsForClient(caller.supabase, client.id);
	const isListedThere = contacts.some((contact) => contact.personId === conversation.personId);
	const isWithSomeoneUnlisted = conversation.personId !== null && !isListedThere;
	if (isWithSomeoneUnlisted) return `That person is not listed at ${client.name}. read_client lists who is.`;
	await logLeadConversation(caller.supabase, conversation, caller.accountId);
	return `Logged on ${client.name}: ${conversation.heldOn}, ${heldBy.name}, ${conversation.summary}`;
}
