import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';

/** How many open tasks are assigned to one person on each project they are on. */
export class AssignedTaskCounts {
	#countByProject: Map<string, number>;

	constructor(countByProject: Map<string, number>) {
		this.#countByProject = countByProject;
	}

	forProject(projectId: string): number {
		return this.#countByProject.get(projectId) ?? 0;
	}
}

export async function getAssignedTaskCounts(
	supabase: SupabaseClient,
	accountId: string
): Promise<AssignedTaskCounts> {
	const { data, error } = await supabase
		.from('tasks')
		.select('project_id, task_assignees!inner(profile_id)')
		.eq('task_assignees.profile_id', accountId)
		.neq('status', doneTaskStatus);
	if (error) throw error;
	const countByProject = new Map<string, number>();
	for (const row of data) {
		const projectId = row.project_id as string;
		const countSoFar = countByProject.get(projectId) ?? 0;
		countByProject.set(projectId, countSoFar + 1);
	}
	return new AssignedTaskCounts(countByProject);
}
