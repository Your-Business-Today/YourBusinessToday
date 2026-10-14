import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { PortalAccess, PortalPerson } from '$lib/portal/portalPerson';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Everyone at one client organisation and where they stand with the portal. A contact may read only
 * their own row, so the list is read with the service key, for the organisation the visitor belongs to.
 */
export async function getPortalPeople(clientId: string): Promise<PortalPerson[]> {
	const service = supabaseServiceClient();
	const contacts = await getContactsForClient(service, clientId);
	return Promise.all(contacts.map((contact) => portalPersonFrom(service, contact)));
}

async function portalPersonFrom(
	service: SupabaseClient,
	contact: ClientContact
): Promise<PortalPerson> {
	return {
		contactId: contact.id,
		name: contact.name,
		email: contact.email,
		role: contact.role,
		isAdministrator: contact.isPortalAdministrator,
		access: await portalAccessOf(service, contact.accountId)
	};
}

async function portalAccessOf(
	service: SupabaseClient,
	accountId: string | null
): Promise<PortalAccess> {
	if (accountId === null) return 'not_invited';
	const { auth } = service;
	const { data, error } = await auth.admin.getUserById(accountId);
	if (error) throw error;
	const { user } = data;
	if (user.last_sign_in_at === undefined || user.last_sign_in_at === null) return 'invited';
	return 'signed_in';
}
