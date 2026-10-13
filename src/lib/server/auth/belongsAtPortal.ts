import { getContactForAccount } from '$lib/server/clients/getContactsForClient';
import { getProfileFlags, type ProfileFlags } from './getProfileFlags';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Client contacts belong at the portal; staff, and everyone who is not a client contact, at yourbusiness.today. */
export async function belongsAtPortal(supabase: SupabaseClient, accountId: string): Promise<boolean> {
	const [profileFlags, contact] = await Promise.all([
		getProfileFlags(supabase),
		getContactForAccount(supabase, accountId)
	]);
	return isPortalAccount(profileFlags, contact !== null);
}

export function isPortalAccount(profileFlags: ProfileFlags, isClientContact: boolean): boolean {
	const isStaff = profileFlags.isStaff || profileFlags.isAdmin;
	return isClientContact && !isStaff;
}
