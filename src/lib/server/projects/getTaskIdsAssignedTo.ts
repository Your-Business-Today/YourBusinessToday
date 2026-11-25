import type { SupabaseClient } from '@supabase/supabase-js';

/** The ids of every task on one project that one person is assigned to, done or not. */
export async function getTaskIdsAssignedTo(supabase: SupabaseClient, projectId: string, accountId: string): Promise<string[]> {
	const { data, error } = await supabase
		.from('task_assignees')
		.select('task_id, tasks!inner(project_id)')
		.eq('profile_id', accountId)
		.eq('tasks.project_id', projectId);
	if (error) throw error;
	return data.map((row) => String(row.task_id));
}
