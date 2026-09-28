import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';

/** The tasks, on these projects, whose work is on the named branch. */
export async function findTasksOnBranch(
	supabase: SupabaseClient,
	branchName: string,
	projectIds: string[]
): Promise<ProjectTask[]> {
	if (branchName === '' || projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.eq('branch_name', branchName)
		.in('project_id', projectIds);
	if (error) throw error;
	return data.map(parseTaskRecord);
}
