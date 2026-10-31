import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';

/** The project's tasks whose work a deploy has carried live. */
export async function findLiveTasks(supabase: SupabaseClient, projectId: string): Promise<ProjectTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.eq('project_id', projectId)
		.not('live_at', 'is', null)
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map(parseTaskRecord);
}
