import { doneTaskStatus } from '$lib/data/taskStatus';
import type { ProjectContents } from '$lib/data/projectDeletion';
import type { SupabaseClient } from '@supabase/supabase-js';

type CountRead = PromiseLike<{ count: number | null; error: unknown }>;

const onlyTheCount = { count: 'exact', head: true } as const;
const projectColumn = 'project_id';
const statusColumn = 'status';
const attachmentWithItsTask = 'id, tasks!inner(project_id)';
const projectOfItsTask = 'tasks.project_id';

/** What the project holds, counted by the database: its goals, its tasks at every depth and their attached files. */
export async function readProjectContents(supabase: SupabaseClient, projectId: string): Promise<ProjectContents> {
	const goals = supabase.from('goals').select('id', onlyTheCount).eq(projectColumn, projectId);
	const openTasks = tasksOn(supabase, projectId).neq(statusColumn, doneTaskStatus);
	const finishedTasks = tasksOn(supabase, projectId).eq(statusColumn, doneTaskStatus);
	const attachedFiles = supabase
		.from('task_attachments')
		.select(attachmentWithItsTask, onlyTheCount)
		.eq(projectOfItsTask, projectId);
	const [goalCount, openTaskCount, finishedTaskCount, attachedFileCount] = await Promise.all([
		counted(goals),
		counted(openTasks),
		counted(finishedTasks),
		counted(attachedFiles)
	]);
	return { goalCount, openTaskCount, finishedTaskCount, attachedFileCount };
}

function tasksOn(supabase: SupabaseClient, projectId: string) {
	return supabase.from('tasks').select('id', onlyTheCount).eq(projectColumn, projectId);
}

async function counted(read: CountRead): Promise<number> {
	const { count, error } = await read;
	if (error) throw error;
	return count ?? 0;
}
