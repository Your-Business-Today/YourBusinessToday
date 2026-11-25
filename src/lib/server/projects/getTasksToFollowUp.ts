import { departments } from '$lib/data/department';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { globalTaskColumns, parseGlobalTaskRow, type GlobalTask } from './getGlobalTaskPage';
import { idBatches } from '$lib/server/schema/idBatches';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The open tasks on these projects whose next move could come back to this login without it being
 * assigned there: the jobs it raised, and the tasks where it asked someone something.
 */
export async function getTasksToFollowUp(
	supabase: SupabaseClient,
	accountId: string,
	projectIds: string[]
): Promise<GlobalTask[]> {
	if (projectIds.length === 0) return [];
	const [raised, askedTaskIds] = await Promise.all([
		getJobsRaisedBy(supabase, accountId, projectIds),
		getTaskIdsAskedOn(supabase, accountId)
	]);
	const raisedIds = new Set(raised.map((task) => task.id));
	const otherIds = askedTaskIds.filter((taskId) => !raisedIds.has(taskId));
	const askedOn = await getOpenTasksAmong(supabase, otherIds, projectIds);
	return [...raised, ...askedOn];
}

async function getJobsRaisedBy(supabase: SupabaseClient, accountId: string, projectIds: string[]): Promise<GlobalTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select(globalTaskColumns)
		.eq('created_by', accountId)
		.in('project_id', projectIds)
		.neq('department', departments.development)
		.neq('status', doneTaskStatus);
	if (error) throw error;
	return data.map(parseGlobalTaskRow);
}

async function getTaskIdsAskedOn(supabase: SupabaseClient, accountId: string): Promise<string[]> {
	const { data, error } = await supabase
		.from('conversation_messages')
		.select('task_id')
		.eq('author_account_id', accountId)
		.not('awaiting_account_id', 'is', null)
		.not('task_id', 'is', null);
	if (error) throw error;
	return [...new Set(data.map((row) => row.task_id as string))];
}

async function getOpenTasksAmong(supabase: SupabaseClient, taskIds: string[], projectIds: string[]): Promise<GlobalTask[]> {
	const batches = await Promise.all(idBatches(taskIds).map((batch) => readOpenTasks(supabase, batch, projectIds)));
	return batches.flat();
}

async function readOpenTasks(supabase: SupabaseClient, taskIds: string[], projectIds: string[]): Promise<GlobalTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select(globalTaskColumns)
		.in('id', taskIds)
		.in('project_id', projectIds)
		.neq('status', doneTaskStatus);
	if (error) throw error;
	return data.map(parseGlobalTaskRow);
}
