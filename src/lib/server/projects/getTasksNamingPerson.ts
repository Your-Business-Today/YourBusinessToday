import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { titleNamesPerson } from '$lib/data/personNamedInTitle';
import {
	globalTaskColumns,
	parseGlobalTaskRow,
	type GlobalTask
} from '$lib/server/projects/getGlobalTaskPage';

/** The open tasks on these projects whose title names the person, such as "Jeremy: confirm the date". */
export async function getTasksNamingPerson(
	supabase: SupabaseClient,
	projectIds: string[],
	name: string
): Promise<GlobalTask[]> {
	if (projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('tasks')
		.select(globalTaskColumns)
		.in('project_id', projectIds)
		.neq('status', doneTaskStatus)
		.ilike('title', `%${name}%`)
		.order('created_at', { ascending: true });
	if (error) throw error;
	const tasks = data.map(parseGlobalTaskRow);
	return tasks.filter((task) => titleNamesPerson(task.title, name));
}
