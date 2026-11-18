import type { SupabaseClient } from '@supabase/supabase-js';

/** Of these tasks, the ones whose work went through staging, so the merge they wait on is a promotion's. */
export async function findPromotedTaskIds(supabase: SupabaseClient, taskIds: string[]): Promise<Set<string>> {
	if (taskIds.length === 0) return new Set();
	const { data, error } = await supabase.from('tasks').select('id').in('id', taskIds).not('staged_at', 'is', null);
	if (error) throw error;
	return new Set(data.map((row) => row.id as string));
}
