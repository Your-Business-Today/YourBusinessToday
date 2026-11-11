import type { SupabaseClient } from '@supabase/supabase-js';

export type GroupParent = { id: string; name: string };

export async function listGroupParents(supabase: SupabaseClient): Promise<GroupParent[]> {
	const parentIds = await parentIdsInUse(supabase);
	if (parentIds.length === 0) return [];
	const { data, error } = await supabase
		.from('clients')
		.select('id, name')
		.in('id', parentIds)
		.order('name');
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({ id: row.id as string, name: row.name as string }));
}

async function parentIdsInUse(supabase: SupabaseClient): Promise<string[]> {
	const { data, error } = await supabase
		.from('clients')
		.select('parent_client_id')
		.not('parent_client_id', 'is', null);
	if (error) throw error;
	return [...new Set(data.map((row: Record<string, unknown>) => row.parent_client_id as string))];
}
