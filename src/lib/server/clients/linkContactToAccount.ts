import type { SupabaseClient } from '@supabase/supabase-js';

/** Ties a listed contact to the sign-in made for them, and notes when they were invited. */
export async function linkContactToAccount(
	supabase: SupabaseClient,
	contactId: string,
	accountId: string
): Promise<void> {
	const { error } = await supabase
		.from('client_contacts')
		.update({ account_id: accountId, invited_at: new Date().toISOString() })
		.eq('id', contactId);
	if (error) throw error;
}
