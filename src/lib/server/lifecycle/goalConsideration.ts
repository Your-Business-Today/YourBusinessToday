import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';

export type OpenGoalTask = { id: string; title: string };

/** Every task under the goal that is not done yet, whatever its place in the backlog. */
export async function getOpenGoalTasks(supabase: SupabaseClient, goalId: string): Promise<OpenGoalTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select('id, title')
		.eq('goal_id', goalId)
		.neq('status', doneTaskStatus);
	if (error) throw error;
	return (data ?? []) as OpenGoalTask[];
}

/** The tasks among these that the agent has recorded a step on since the moment given. */
export async function getTasksSteppedSince(
	supabase: SupabaseClient,
	taskIds: string[],
	agent: string,
	since: string
): Promise<Set<string>> {
	if (taskIds.length === 0) return new Set();
	const { data, error } = await supabase
		.from('lifecycle_steps')
		.select('task_id')
		.in('task_id', taskIds)
		.eq('agent', agent)
		.gte('created_at', since);
	if (error) throw error;
	return new Set((data ?? []).map((row) => row.task_id as string));
}
