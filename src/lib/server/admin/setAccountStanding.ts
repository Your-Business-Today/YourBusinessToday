import type { SupabaseClient } from '@supabase/supabase-js';

/** Makes an account staff or not, as the service; the admin page does the same through admin_set_staff as the signed-in admin. */
export async function setStaffAccessFor(supabase: SupabaseClient, accountId: string, isStaff: boolean): Promise<void> {
	const { error } = await supabase.from('profiles').update({ is_staff: isStaff }).eq('id', accountId);
	if (error) throw error;
}

/** Restricts an account or lifts the restriction, as the service; the admin page does the same through admin_set_restriction. */
export async function setAccountRestrictionFor(supabase: SupabaseClient, accountId: string, isRestricted: boolean): Promise<void> {
	const { error } = await supabase.from('profiles').update({ is_restricted: isRestricted }).eq('id', accountId);
	if (error) throw error;
}
