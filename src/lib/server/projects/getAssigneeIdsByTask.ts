import type { SupabaseClient } from '@supabase/supabase-js';

export async function getAssigneeIdsByTask(
	supabase: SupabaseClient,
	taskIds: string[]
): Promise<Map<string, string[]>> {
	if (taskIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('task_assignees')
		.select('task_id, profile_id')
		.in('task_id', taskIds);
	if (error) throw error;
	const assigneeIdsByTask = new Map<string, string[]>();
	for (const row of data) {
		const assigneeIds = assigneeIdsByTask.get(row.task_id) ?? [];
		assigneeIds.push(row.profile_id);
		assigneeIdsByTask.set(row.task_id, assigneeIds);
	}
	return assigneeIdsByTask;
}
