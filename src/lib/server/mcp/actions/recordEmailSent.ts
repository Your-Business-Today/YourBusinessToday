import { ukClockAt } from '$lib/data/ukClock';
import { getClient } from '$lib/server/clients/getClient';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { fileEmail } from '$lib/server/filedEmails/fileEmail';
import { logLeadConversation } from '$lib/server/leadConversations/logLeadConversation';
import { recordContactAfterEmail } from '$lib/server/emailsToSend/recordContactAfterEmail';
import { validateEmailSent } from '$lib/server/emailsToSend/validateEmailSent';
import { noSuchClient } from './describeClient';
import type { ConversationChannel, LeadConversationLogged } from '$lib/data/leadConversationRules';
import type { FiledEmailGiven } from '$lib/data/filedEmailRules';
import type { McpCaller } from '../resolveMcpCaller';

const byEmail: ConversationChannel = 'email';
const noDealPoints = '';

/** Files an email sent from the consulting inbox under its client, logs it as a conversation and moves the person on. */
export async function recordEmailSent(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const sent = validateEmailSent(input);
	if (typeof sent === 'string') return sent;
	const { email, nextStep } = sent;
	const client = await getClient(caller.supabase, email.clientId);
	if (client === null) return noSuchClient;
	const contacts = await getContactsForClient(caller.supabase, client.id);
	const isListedThere = contacts.some((contact) => contact.personId === email.personId);
	const isToSomeoneUnlisted = email.personId !== null && !isListedThere;
	if (isToSomeoneUnlisted) return `That person is not listed at ${client.name}. read_client lists who is.`;
	const outcome = await fileEmail(caller.supabase, email, caller.accountId);
	const filing = `"${email.subject}" to ${email.to.join(', ')} — filed email ${outcome.id}`;
	if (outcome.isAlreadyFiled) return `Already recorded under ${client.name}, so nothing changed: ${filing}`;
	const sentOn = ukClockAt(new Date(email.sentAt)).date;
	await logLeadConversation(caller.supabase, conversationOf(email, sentOn, caller.accountId), caller.accountId);
	if (email.personId !== null) await recordContactAfterEmail(caller.supabase, email.personId, sentOn, nextStep);
	return `Recorded under ${client.name}: ${filing}, and logged as an email conversation on ${sentOn}. Now label the thread YBT/${client.name} in Gmail.`;
}

function conversationOf(email: FiledEmailGiven, sentOn: string, senderAccountId: string): LeadConversationLogged {
	return {
		clientId: email.clientId,
		personId: email.personId,
		heldByAccountId: senderAccountId,
		heldOn: sentOn,
		channel: byEmail,
		summary: email.summary,
		dealPoints: noDealPoints
	};
}
