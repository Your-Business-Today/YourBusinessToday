import { getClientContact, getContactsForClient } from '$lib/server/clients/getContactsForClient';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import type { Refusal } from './portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

export const notAtYourOrganisation: Refusal = {
	refusal: 'That person is not at your organisation.'
};

/** The contact an administrator chose, provided they are at the administrator's own organisation. */
export async function getContactAtOrganisation(
	service: SupabaseClient,
	visitor: PortalVisitor,
	contactId: string
): Promise<ClientContact | null> {
	const contact = await getClientContact(service, contactId);
	if (contact === null) return null;
	if (contact.clientId !== visitor.clientId) return null;
	return contact;
}

/** Who at the organisation is an administrator of its portal, for the rule that one always remains. */
export async function getAdministratorStanding(
	service: SupabaseClient,
	clientId: string
): Promise<{ contactId: string; isAdministrator: boolean }[]> {
	const contacts = await getContactsForClient(service, clientId);
	return contacts.map((contact) => ({
		contactId: contact.id,
		isAdministrator: contact.isPortalAdministrator
	}));
}
