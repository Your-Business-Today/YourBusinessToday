import { getClient } from '$lib/server/clients/getClient';
import { getContactForAccount } from '$lib/server/clients/getContactsForClient';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The client contact signed in at the portal, with the organisation they
 * belong to; null for anyone else. A contact may not read the client register,
 * so their own organisation is read with the service key, by the id their row carries.
 */
export async function getPortalVisitor(
	supabase: SupabaseClient,
	accountId: string
): Promise<PortalVisitor | null> {
	const contact = await getContactForAccount(supabase, accountId);
	if (contact === null) return null;
	const organisation = await getClient(supabaseServiceClient(), contact.clientId);
	return {
		personName: contact.name,
		emailAddress: contact.email,
		role: contact.role,
		clientId: contact.clientId,
		organisationName: organisation?.name ?? ''
	};
}
