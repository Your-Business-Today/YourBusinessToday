import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { readEveryTask } from '$lib/server/projects/readEveryTask';

export async function getTasksForProject(
	supabase: SupabaseClient,
	projectId: string
): Promise<ProjectTask[]> {
	return readEveryTask((firstRow, lastRow) =>
		supabase
			.from('tasks')
			.select('*')
			.eq('project_id', projectId)
			.order('priority', { ascending: true })
			.order('id', { ascending: true })
			.range(firstRow, lastRow)
	);
}
