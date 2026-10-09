import type { SupabaseClient } from '@supabase/supabase-js';

export async function getOwnerIdOfProject(
	supabase: SupabaseClient,
	projectId: string
): Promise<string> {
	const { data, error } = await supabase
		.from('projects')
		.select('owner_id')
		.eq('id', projectId)
		.single();
	if (error) throw error;
	return data.owner_id;
}
