import type { SupabaseClient } from '@supabase/supabase-js';

/** How many of the project's tasks are merged into staging and not yet live: what the next deploy carries. */
export async function countStagedTasks(supabase: SupabaseClient, projectId: string): Promise<number> {
	const { count, error } = await supabase
		.from('tasks')
		.select('id', { count: 'exact', head: true })
		.eq('project_id', projectId)
		.not('staged_at', 'is', null)
		.is('live_at', null);
	if (error) throw error;
	return count ?? 0;
}
