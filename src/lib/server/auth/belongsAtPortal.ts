import { getContactsForAccount } from '$lib/server/clients/getContactsForClient';
import { getProfileFlags, type ProfileFlags } from './getProfileFlags';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Client contacts belong at the portal; staff, and everyone who is not a client contact, at yourbusiness.today. */
export async function belongsAtPortal(
	supabase: SupabaseClient,
	accountId: string
): Promise<boolean> {
	const [profileFlags, contacts] = await Promise.all([
		getProfileFlags(supabase),
		getContactsForAccount(supabase, accountId)
	]);
	return isPortalAccount(profileFlags, contacts.length > 0);
}

export function isPortalAccount(profileFlags: ProfileFlags, isClientContact: boolean): boolean {
	const isStaff = profileFlags.isStaff || profileFlags.isAdmin;
	return isClientContact && !isStaff;
}
