import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';

export async function getTasksForProject(
	supabase: SupabaseClient,
	projectId: string
): Promise<ProjectTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.eq('project_id', projectId)
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map(parseTaskRecord);
}
