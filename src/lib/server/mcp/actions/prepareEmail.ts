import { emailToSendContext } from '$lib/data/emailToSendRules';
import { personNoteKinds } from '$lib/data/personNoteKind';
import { getClient } from '$lib/server/clients/getClient';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { getEmailsForClient } from '$lib/server/filedEmails/getEmailsForClient';
import { getConversationsForClient } from '$lib/server/leadConversations/getConversationsForClient';
import { getNotesForPeople } from '$lib/server/people/getNotesForPeople';
import { validateEmailRequest } from '$lib/server/emailsToSend/validateEmailRequest';
import { describeEmailToPrepare } from './describeEmailToPrepare';
import { noSuchClient } from './describeClient';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { McpCaller } from '../resolveMcpCaller';

/** The recipient, the context and the steps for one email to one person at a client, or the sentence saying why it cannot be written. */
export async function prepareEmail(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const request = validateEmailRequest(input);
	if (typeof request === 'string') return request;
	const client = await getClient(caller.supabase, request.clientId);
	if (client === null) return noSuchClient;
	const contacts = await getContactsForClient(caller.supabase, client.id);
	const recipient = recipientAmong(contacts, request.personId);
	if (recipient === null) return noRecipientAt(client.name, request.personId);
	if (recipient.email === '') return `No email address is held for ${recipient.name}. Ask for it and save it with update_person first.`;
	const [notes, filedEmails, conversations] = await Promise.all([
		getNotesForPeople(caller.supabase, [recipient.personId]),
		getEmailsForClient(caller.supabase, client.id, emailToSendContext.latestFiledEmails),
		getConversationsForClient(caller.supabase, client.id)
	]);
	const savedApproach = notes.find((note) => note.kind === personNoteKinds.approach) ?? null;
	const latestConversations = conversations.slice(0, emailToSendContext.latestConversations);
	return describeEmailToPrepare({ request, clientName: client.name, recipient, savedApproach, filedEmails, conversations: latestConversations });
}

function recipientAmong(contacts: ClientContact[], personId: string | null): ClientContact | null {
	if (personId === null) return contacts[0] ?? null;
	return contacts.find((contact) => contact.personId === personId) ?? null;
}

function noRecipientAt(clientName: string, personId: string | null): string {
	if (personId === null) return `Nobody is listed at ${clientName} to write to. Add them with add_client_contact first.`;
	return `That person is not listed at ${clientName}. read_client lists who is.`;
}
