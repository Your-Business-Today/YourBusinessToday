import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';

/** The project's tasks whose work is merged into staging and not yet live. */
export async function findStagedTasks(supabase: SupabaseClient, projectId: string): Promise<ProjectTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.eq('project_id', projectId)
		.not('staged_at', 'is', null)
		.is('live_at', null);
	if (error) throw error;
	return data.map(parseTaskRecord);
}
