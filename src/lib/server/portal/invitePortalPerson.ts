import { addClientContact, addContactOutcomes } from '$lib/server/clients/addClientContact';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { inviteClientContact, inviteOutcomes } from '$lib/server/clients/inviteClientContact';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { tooManyInvitesMessage } from '$lib/server/email/inviteAllowance';
import type { PortalInvite } from './validatePortalPerson';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import type { Refusal } from './portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

const alreadyListed: Refusal = {
	refusal: 'That email address is already on your organisation’s list.'
};

/**
 * Adds a person to the administrator's organisation and sends them the portal invitation, within the same
 * hourly allowance as staff invitations. A contact may not write the client register, so this is written with
 * the service key, only after the visitor has been checked as an administrator and every value as fitting.
 */
export async function invitePortalPerson(
	visitor: PortalVisitor,
	invite: PortalInvite,
	origin: string,
	actorAccountId: string
): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const seed = {
		name: invite.name,
		email: invite.email,
		phone: '',
		role: invite.role,
		isPrimary: false
	};
	const outcome = await addClientContact(service, visitor.clientId, seed, actorAccountId);
	if (outcome === addContactOutcomes.alreadyKnown) return alreadyListed;
	const contacts = await getContactsForClient(service, visitor.clientId);
	const contact = contacts.find((candidate) => candidate.email === invite.email);
	if (contact === undefined) return alreadyListed;
	if (invite.isAdministrator) await makeAdministrator(service, contact.id);
	const delivery = await inviteClientContact(service, contact, origin, actorAccountId);
	if (delivery === inviteOutcomes.tooManyInvites) return { refusal: tooManyInvitesMessage };
	return null;
}

async function makeAdministrator(service: SupabaseClient, contactId: string): Promise<void> {
	const { error } = await service
		.from('client_contacts')
		.update({ is_portal_administrator: true })
		.eq('id', contactId);
	if (error) throw error;
}
