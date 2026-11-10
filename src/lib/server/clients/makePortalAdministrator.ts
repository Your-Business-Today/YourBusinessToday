import type { SupabaseClient } from '@supabase/supabase-js';

/** Makes a listed contact an administrator of their organisation's portal, so they can invite and remove its people. */
export async function makePortalAdministrator(
	supabase: SupabaseClient,
	contactId: string
): Promise<void> {
	const { error } = await supabase
		.from('client_contacts')
		.update({ is_portal_administrator: true })
		.eq('id', contactId);
	if (error) throw error;
}
