import type { SupabaseClient } from '@supabase/supabase-js';

/** The name an account goes by, or blank when none is set; the signed-in page uses getDisplayName, which knows the session instead. */
export async function getDisplayNameOf(supabase: SupabaseClient, accountId: string): Promise<string> {
	const { data, error } = await supabase.from('profiles').select('display_name').eq('id', accountId).maybeSingle();
	if (error) throw error;
	return data?.display_name ?? '';
}
