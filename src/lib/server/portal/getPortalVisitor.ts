import { chooseVisitorContact } from '$lib/portal/chooseVisitorContact';
import { getContactsForAccount } from '$lib/server/clients/getContactsForClient';
import { findPortalOrganisations } from './findPortalOrganisations';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The client contact signed in at the portal, working in the organisation they chose, with every
 * organisation they are a contact at; null for anyone else.
 */
export async function getPortalVisitor(
	supabase: SupabaseClient,
	accountId: string,
	chosenClientId: string | null
): Promise<PortalVisitor | null> {
	const contacts = await getContactsForAccount(supabase, accountId);
	if (contacts.length === 0) return null;
	const organisations = await findPortalOrganisations(contacts.map((contact) => contact.clientId));
	const contact = chooseVisitorContact(contacts, organisations, chosenClientId);
	const organisation = organisations.find((candidate) => candidate.clientId === contact.clientId);
	return {
		contactId: contact.id,
		isAdministrator: contact.isPortalAdministrator,
		personName: contact.name,
		emailAddress: contact.email,
		role: contact.role,
		clientId: contact.clientId,
		organisationName: organisation?.name ?? '',
		organisations
	};
}
