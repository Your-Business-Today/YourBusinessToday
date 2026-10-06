import { companyDetails } from '$lib/data/companyDetails';
import { addClientContact, addContactOutcomes } from '$lib/server/clients/addClientContact';
import { getClient } from '$lib/server/clients/getClient';
import { getClientContact } from '$lib/server/clients/getClientContacts';
import { inviteClientContact, inviteOutcomes } from '$lib/server/clients/inviteClientContact';
import { noSuchClient } from './describeClient';
import { tooManyInvitesMessage } from '$lib/server/email/inviteAllowance';
import { undeliveredInviteNotice } from '$lib/data/emailDelivery';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const isPrimaryField = { type: 'boolean', description: 'Make this the client main contact' };
const noSuchContact = 'No contact has that id. Call read_client to see who is listed.';

export const clientContactActions: McpAction[] = [
	{
		name: 'add_client_contact',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'list a person at a client, so they can be invited and can raise requests',
		inputSchema: objectSchema(
			{
				clientId: textField('The client id, as given by list_clients'),
				name: textField('Their full name'),
				email: textField('Their email address'),
				phone: textField('Their phone number, if you have it'),
				role: textField('What they do there, in their own words'),
				isPrimary: isPrimaryField
			},
			['clientId', 'name', 'email']
		),
		run: async (caller, input) => listContact(caller, input)
	},
	{
		name: 'invite_client_contact',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'email a listed contact an invitation to sign in and see their requests',
		guidance:
			'An invitation gives that person a sign-in of their own and sight of everything their ' +
			'company has raised, so invite the person the client named, never a shared inbox.',
		inputSchema: objectSchema(
			{
				contactId: textField('The contact id, as given by read_client'),
				origin: textField(
					`Where the invitation link should point, defaulting to ${companyDetails.websiteUrl}`
				)
			},
			['contactId']
		),
		run: async (caller, input) => inviteContact(caller, input)
	}
];

async function listContact(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const client = await getClient(caller.supabase, readText(input, 'clientId'));
	if (client === null) return noSuchClient;
	const name = readText(input, 'name');
	const email = readText(input, 'email').toLowerCase();
	if (name === '' || email === '') return 'A contact needs both a name and an email address.';
	const seed = {
		name,
		email,
		phone: readText(input, 'phone'),
		role: readText(input, 'role'),
		isPrimary: input.isPrimary === true
	};
	const outcome = await addClientContact(caller.supabase, client.id, seed, caller.accountId);
	if (outcome === addContactOutcomes.alreadyKnown) return `${email} is already listed at ${client.name}.`;
	return `${name} is now listed at ${client.name}. Invite them when you want them signed in.`;
}

async function inviteContact(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const contact = await getClientContact(caller.supabase, readText(input, 'contactId'));
	if (contact === null) return noSuchContact;
	const origin = readOptionalText(input, 'origin') ?? companyDetails.websiteUrl;
	const outcome = await inviteClientContact(caller.supabase, contact, origin, caller.accountId);
	if (outcome === inviteOutcomes.alreadyInvited)
		return `${contact.name} already has a sign-in, so nothing was sent.`;
	if (outcome === inviteOutcomes.tooManyInvites) return tooManyInvitesMessage;
	const undelivered = undeliveredInviteNotice(outcome);
	if (undelivered !== null)
		return `${undelivered} ${contact.name} now has a sign-in but no link to it.`;
	return `Invitation sent to ${contact.email}. It takes ${contact.name} to a page to set a password.`;
}
