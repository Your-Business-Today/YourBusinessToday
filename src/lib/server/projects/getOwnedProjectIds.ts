import type { SupabaseClient } from '@supabase/supabase-js';

/** The projects an owner owns, in the order of their projects board. */
export async function getOwnedProjectIds(
	supabase: SupabaseClient,
	ownerId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('id')
		.eq('owner_id', ownerId)
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => row.id as string);
}
