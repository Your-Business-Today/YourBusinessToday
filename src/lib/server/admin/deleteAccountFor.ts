import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes the account outright, as the service: the auth user and, through the cascades the owner tables declare,
 * its data. An account that shared team data references fails to delete, as admin_delete_user does for the page.
 */
export async function deleteAccountFor(supabase: SupabaseClient, accountId: string): Promise<void> {
	const { auth } = supabase;
	const { error } = await auth.admin.deleteUser(accountId);
	if (error !== null) throw error;
}
