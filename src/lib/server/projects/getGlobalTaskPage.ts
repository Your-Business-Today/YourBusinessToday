import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';
import { withRequesterNames } from '$lib/server/projects/withRequesterNames';
import type { TaskStatus } from '$lib/data/taskStatus';

/** The task a listed task waits for, as far as the list needs: its name and whether it is done. */
export type WaitedForTask = { id: string; title: string; status: TaskStatus };

/** A task in a list across projects; requesterName names who asked when it is not the project's owner. */
export type GlobalTask = ProjectTask & {
	projectName: string;
	projectOwnerId: string | null;
	requesterName: string | null;
	waitsFor: WaitedForTask | null;
};

/** The columns a list across projects selects: the task, its project, and the task it waits for. */
export const globalTaskColumns =
	'*, projects!inner(name, owner_id), waits_for:tasks!tasks_waits_for_task_id_fkey(id, title, status)';

export type GlobalTaskPage = {
	tasks: GlobalTask[];
	pageNumber: number;
	pageCount: number;
	taskCount: number;
	firstTaskNumber: number;
};

const tasksPerPage = 20;

export function singlePageOf(tasks: GlobalTask[]): GlobalTaskPage {
	return { tasks, pageNumber: 1, pageCount: 1, taskCount: tasks.length, firstTaskNumber: 1 };
}

export async function getGlobalTaskPage(
	supabase: SupabaseClient,
	ownerId: string,
	pageNumber: number,
	shouldIncludeDone: boolean
): Promise<GlobalTaskPage> {
	const firstRowIndex = (pageNumber - 1) * tasksPerPage;
	const topLevelTasks = supabase
		.from('tasks')
		.select(globalTaskColumns, { count: 'exact' })
		.eq('projects.owner_id', ownerId)
		.is('parent_task_id', null);
	const scopedTasks = shouldIncludeDone ? topLevelTasks : topLevelTasks.neq('status', 'done');
	const { data, error, count } = await scopedTasks
		.order('global_priority', { ascending: true, nullsFirst: false })
		.range(firstRowIndex, firstRowIndex + tasksPerPage - 1);
	if (error) throw error;
	const taskCount = count ?? 0;
	return {
		tasks: await withRequesterNames(supabase, data.map(parseGlobalTaskRow)),
		pageNumber,
		pageCount: Math.max(1, Math.ceil(taskCount / tasksPerPage)),
		taskCount,
		firstTaskNumber: firstRowIndex + 1
	};
}

export function parseGlobalTaskRow(row: Record<string, unknown>): GlobalTask {
	const project = row.projects as { name: string; owner_id?: string } | null;
	return {
		...parseTaskRecord(row),
		projectName: project?.name ?? '',
		projectOwnerId: project?.owner_id ?? null,
		requesterName: null,
		waitsFor: (row.waits_for as WaitedForTask | null) ?? null
	};
}
