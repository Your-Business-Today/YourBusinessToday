import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { readEveryTask } from '$lib/server/projects/readEveryTask';

/** The project's tasks whose work a deploy has carried live. */
export async function findLiveTasks(supabase: SupabaseClient, projectId: string): Promise<ProjectTask[]> {
	return readEveryTask((firstRow, lastRow) =>
		supabase
			.from('tasks')
			.select('*')
			.eq('project_id', projectId)
			.not('live_at', 'is', null)
			.order('priority', { ascending: true })
			.order('id', { ascending: true })
			.range(firstRow, lastRow)
	);
}
