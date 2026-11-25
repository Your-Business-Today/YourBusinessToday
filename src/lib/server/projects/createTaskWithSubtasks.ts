import type { SupabaseClient } from '@supabase/supabase-js';
import { taskKinds } from '$lib/data/taskKind';
import { createTask, type NewTaskSeed, type SubtaskSeed } from './createTask';

export type RaisedTaskFamily = { taskId: string; subtaskIds: string[] };

/**
 * Raises a task and the chunks it is built in, as its subtasks in the order given. Each chunk shares the parent's
 * user story, goal, department and requester, so it is built as a step of the same story.
 */
export async function createTaskWithSubtasks(
	supabase: SupabaseClient,
	projectId: string,
	seed: NewTaskSeed,
	createdBy: string
): Promise<RaisedTaskFamily> {
	const taskId = await createTask(supabase, projectId, seed, createdBy);
	const subtaskIds: string[] = [];
	for (const subtask of seed.subtasks ?? []) {
		subtaskIds.push(await createTask(supabase, projectId, chunkOf(seed, taskId, subtask), createdBy));
	}
	return { taskId, subtaskIds };
}

function chunkOf(parent: NewTaskSeed, parentTaskId: string, subtask: SubtaskSeed): NewTaskSeed {
	return {
		title: subtask.title,
		details: subtask.details,
		dueDate: null,
		parentTaskId,
		waitsForTaskId: null,
		goalId: parent.goalId,
		kind: taskKinds.work,
		story: parent.story,
		requestedBy: parent.requestedBy,
		autocomplete: parent.autocomplete,
		department: parent.department
	};
}
