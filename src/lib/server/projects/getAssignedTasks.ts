import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { parseGlobalTaskRow, type GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import { withRequesterNames } from '$lib/server/projects/withRequesterNames';

/** The open tasks assigned to one person across every project they are on, soonest due first. */
export async function getAssignedTasks(
	supabase: SupabaseClient,
	accountId: string
): Promise<GlobalTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select('*, projects!inner(name, owner_id), task_assignees!inner(profile_id)')
		.eq('task_assignees.profile_id', accountId)
		.neq('status', doneTaskStatus)
		.order('due_date', { ascending: true, nullsFirst: false })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return withRequesterNames(supabase, data.map(parseGlobalTaskRow));
}
