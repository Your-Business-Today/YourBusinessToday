import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskKind } from '$lib/data/taskKind';
import { parseTaskStatus } from '$lib/data/taskStatus';
import type { FamilyTask } from '$lib/data/taskDeletion';

const familyColumns = 'id, parent_task_id, kind, title, status';

/** Every task under a task, at every depth, read one level of the tree at a time. */
export async function getDescendantsOfTask(supabase: SupabaseClient, taskId: string): Promise<FamilyTask[]> {
	const descendants: FamilyTask[] = [];
	let parentIds = [taskId];
	while (parentIds.length > 0) {
		const subtasks = await getSubtasksOfEvery(supabase, parentIds);
		descendants.push(...subtasks);
		parentIds = subtasks.map((subtask) => subtask.id);
	}
	return descendants;
}

async function getSubtasksOfEvery(supabase: SupabaseClient, parentIds: string[]): Promise<FamilyTask[]> {
	const { data, error } = await supabase
		.from('tasks')
		.select(familyColumns)
		.in('parent_task_id', parentIds)
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map(parseFamilyTask);
}

function parseFamilyTask(row: Record<string, unknown>): FamilyTask {
	return {
		id: row.id as string,
		parentTaskId: (row.parent_task_id as string) ?? null,
		kind: parseTaskKind(row.kind),
		title: row.title as string,
		status: parseTaskStatus(row.status)
	};
}
