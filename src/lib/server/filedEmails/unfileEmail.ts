import type { SupabaseClient } from '@supabase/supabase-js';

/** Takes a filed email off its client; answers the client it was on, or null when no such filing is held. */
export async function unfileEmail(supabase: SupabaseClient, filedEmailId: string): Promise<string | null> {
	const { data, error } = await supabase.from('filed_emails').delete().eq('id', filedEmailId).select('client_id');
	if (error) throw error;
	const [removed] = data as { client_id: string }[];
	return removed?.client_id ?? null;
}
