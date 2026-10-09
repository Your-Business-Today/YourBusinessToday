import type { SupabaseClient } from '@supabase/supabase-js';

/** How many open current tasks are assigned to one person on each project they are on; long term work is not counted. */
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
	const { data, error } = await supabase.rpc('assigned_current_task_counts', { member: accountId });
	if (error) throw error;
	const countByProject = new Map<string, number>(
		data.map((row: Record<string, unknown>) => [
			row.project_id as string,
			row.open_task_count as number
		])
	);
	return new AssignedTaskCounts(countByProject);
}
