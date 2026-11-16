import { filedEmailDirections } from '$lib/data/filedEmailRules';
import { emailContentFields, emailMessageFields } from './filedEmailFields';
import { validateRecordId } from '$lib/data/isUuid';
import { getClient } from '$lib/server/clients/getClient';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { fileEmail } from '$lib/server/filedEmails/fileEmail';
import { unfileEmail } from '$lib/server/filedEmails/unfileEmail';
import { validateFiledEmail } from '$lib/server/filedEmails/validateFiledEmail';
import { noSuchClient } from './describeClient';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const filingGuidance =
	'File an email you have read in Gmail under the client or lead it is about, so its page and read_client list it for ' +
	'everyone working them. File only what is about that client. Keep a short summary of what the email says and asks ' +
	'for: never copy its body and never keep anything personal. Give the Gmail ids exactly as the Gmail connector gives ' +
	'them, so the link opens the thread. Then, with the Gmail connector, put the label YBT/<client name> on the thread so ' +
	'the inbox shows it too. Filing the same email again under the same client keeps the one already filed.';

const filingSchema = objectSchema(
	{
		clientId: textField('The client or lead, as list_clients gives its id'),
		personId: textField('Who at the client the email is with: their person id, as read_client gives it. Leave it out when they are not listed'),
		...emailMessageFields,
		direction: textField(`One of ${filedEmailDirections.join(', ')}`),
		...emailContentFields
	},
	['clientId', 'mailbox', 'messageId', 'threadId', 'direction', 'from', 'sentAt', 'summary']
);

export const noSuchFiledEmail = 'No filed email has that id. read_client lists the emails filed under a client, each with its id.';

export const filedEmailActions: McpAction[] = [
	{
		name: 'file_email_to_client',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "file an email from a Gmail inbox under a client or lead — who, when, subject and a short summary, never the body — so its page lists the emails we have had with them",
		guidance: filingGuidance,
		inputSchema: filingSchema,
		run: async (caller, input) => fileTheEmail(caller, input)
	},
	{
		name: 'unfile_email',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'take an email filed under the wrong client off it; the email itself stays in Gmail',
		guidance: 'Take the label YBT/<client name> off the thread in Gmail as well.',
		inputSchema: objectSchema({ filedEmailId: textField('The filed email, as read_client gives its id') }, ['filedEmailId']),
		run: async (caller, input) => unfileTheEmail(caller, readText(input, 'filedEmailId'))
	}
];

async function fileTheEmail(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const email = validateFiledEmail(input);
	if (typeof email === 'string') return email;
	const client = await getClient(caller.supabase, email.clientId);
	if (client === null) return noSuchClient;
	const contacts = await getContactsForClient(caller.supabase, client.id);
	const isListedThere = contacts.some((contact) => contact.personId === email.personId);
	const isWithSomeoneUnlisted = email.personId !== null && !isListedThere;
	if (isWithSomeoneUnlisted) return `That person is not listed at ${client.name}. read_client lists who is.`;
	const outcome = await fileEmail(caller.supabase, email, caller.accountId);
	const filing = `"${email.subject}" from ${email.from} — filed email ${outcome.id}`;
	if (outcome.isAlreadyFiled) return `Already filed under ${client.name}, so nothing changed: ${filing}`;
	return `Filed under ${client.name}: ${filing}. Now label the thread YBT/${client.name} in Gmail.`;
}

async function unfileTheEmail(caller: McpCaller, filedEmailId: string): Promise<string> {
	const idRefusal = validateRecordId('filedEmailId', filedEmailId);
	if (idRefusal !== null) return idRefusal;
	const clientId = await unfileEmail(caller.supabase, filedEmailId);
	if (clientId === null) return noSuchFiledEmail;
	const client = await getClient(caller.supabase, clientId);
	const clientName = client?.name ?? 'its client';
	return `Taken off ${clientName}. Take the label YBT/${clientName} off the thread in Gmail too.`;
}
