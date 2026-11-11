import { doneTaskStatus } from '$lib/data/taskStatus';
import { internalDepartments } from '$lib/data/boardSide';
import { readEveryTask } from '$lib/server/projects/readEveryTask';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Every unfinished administration, sales and marketing job on the projects named, in each project's priority order. */
export async function getOpenTeamWork(supabase: SupabaseClient, projectIds: string[]): Promise<ProjectTask[]> {
	if (projectIds.length === 0) return [];
	return readEveryTask((firstRow, lastRow) =>
		supabase
			.from('tasks')
			.select('*')
			.in('project_id', projectIds)
			.in('department', internalDepartments)
			.neq('status', doneTaskStatus)
			.order('priority', { ascending: true })
			.order('id', { ascending: true })
			.range(firstRow, lastRow)
	);
}
