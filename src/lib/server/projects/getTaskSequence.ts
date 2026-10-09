import type { SupabaseClient } from '@supabase/supabase-js';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { readTaskSequence, type TaskSequence } from '$lib/data/taskSequence';
import { sequenceChoicesFor } from '$lib/data/taskSequenceStanding';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type TaskSequencePlace = {
	sequence: TaskSequence<ProjectTask> | null;
	sequenceChoices: ProjectTask[];
};

/** Where a task sits among its project's tasks: its sequence, and the tasks it could wait for. */
export async function getTaskSequence(
	supabase: SupabaseClient,
	task: ProjectTask
): Promise<TaskSequencePlace> {
	const tasks = await getTasksForProject(supabase, task.projectId);
	return {
		sequence: readTaskSequence(task, tasks),
		sequenceChoices: sequenceChoicesFor(task, tasks)
	};
}
