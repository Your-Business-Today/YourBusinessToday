import type { SupabaseClient } from '@supabase/supabase-js';

/** A filing taken off: the client it was under, or null when it was against a task or to-do. */
export type UnfiledEmail = { clientId: string | null };

/** Takes a filed email off what it was filed against; answers what that was, or null when no such filing is held. */
export async function unfileEmail(supabase: SupabaseClient, filedEmailId: string): Promise<UnfiledEmail | null> {
	const { data, error } = await supabase.from('filed_emails').delete().eq('id', filedEmailId).select('client_id');
	if (error) throw error;
	const [removed] = data as { client_id: string | null }[];
	if (removed === undefined) return null;
	return { clientId: removed.client_id };
}
