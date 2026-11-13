import type { SupabaseClient } from '@supabase/supabase-js';

/** The name an account goes by, written on its profile; the signed-in page uses saveDisplayName, which knows the session instead. */
export async function saveDisplayNameFor(supabase: SupabaseClient, accountId: string, displayName: string): Promise<void> {
	const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', accountId);
	if (error) throw error;
}
