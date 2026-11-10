import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { readEveryTask } from '$lib/server/projects/readEveryTask';

/** The project's tasks whose work is merged into staging and not yet live. */
export async function findStagedTasks(supabase: SupabaseClient, projectId: string): Promise<ProjectTask[]> {
	return readEveryTask((firstRow, lastRow) =>
		supabase
			.from('tasks')
			.select('*')
			.eq('project_id', projectId)
			.not('staged_at', 'is', null)
			.is('live_at', null)
			.order('id', { ascending: true })
			.range(firstRow, lastRow)
	);
}
