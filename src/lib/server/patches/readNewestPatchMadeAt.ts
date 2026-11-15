import type { SupabaseClient } from '@supabase/supabase-js';

/** When the newest patch was made, or null while there is none: nothing read before that moment was asked for its outcodes. */
export async function readNewestPatchMadeAt(supabase: SupabaseClient): Promise<string | null> {
	const { data, error } = await supabase.from('patches').select('created_at').order('created_at', { ascending: false }).limit(1);
	if (error) throw error;
	const newest = (data[0] ?? null) as { created_at: string } | null;
	if (newest === null) return null;
	return newest.created_at;
}
