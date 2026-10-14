import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseGlobalTaskRow, type GlobalTask } from './getGlobalTaskPage';

/**
 * Every open, current task assigned to one person across every project they are on, by project
 * and then by priority: the same tasks the project tiles count, long term work left out.
 */
export async function getTasksAssignedToYou(
	supabase: SupabaseClient,
	accountId: string
): Promise<GlobalTask[]> {
	const taskIds = await getAssignedTaskIds(supabase, accountId);
	if (taskIds.length === 0) return [];
	const { data, error } = await supabase
		.from('tasks')
		.select('*, projects!inner(name)')
		.in('id', taskIds)
		.order('priority', { ascending: true });
	if (error) throw error;
	const tasks = data.map(parseGlobalTaskRow);
	return tasks.sort((left, right) => left.projectName.localeCompare(right.projectName));
}

async function getAssignedTaskIds(supabase: SupabaseClient, accountId: string): Promise<string[]> {
	const { data, error } = await supabase.rpc('assigned_current_tasks', {
		member: accountId
	});
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => row.task_id as string);
}
