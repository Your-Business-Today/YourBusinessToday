import type { SupabaseClient } from '@supabase/supabase-js';
import { asBugTitle, isBugTitle } from '$lib/data/developmentKind';
import { createTask, type NewTaskSeed } from './createTask';
import { doneTaskStatus } from '$lib/data/taskStatus';
import type { FamilyTask } from '$lib/data/taskDeletion';
import { reparentTask } from './reparentTask';
import { updateTaskStatus } from './updateTaskStatus';
import type { ProjectTask } from './taskRecord';

export type FinishedWorkToKeep = {
	deletedTask: ProjectTask;
	finishedSubtasks: FamilyTask[];
	completedParentTitle: string;
	keptByAccountId: string;
};

/** The completed task the finished subtasks were kept under. */
export type CompletedParent = { id: string; title: string };

/**
 * Finished subtasks outlive the task they were under. A new completed task stands where the deleted one stood,
 * under the same parent and goal and with its story, and the finished subtasks move under it, each with whatever
 * is under it.
 */
export async function keepFinishedSubtasks(supabase: SupabaseClient, kept: FinishedWorkToKeep): Promise<CompletedParent> {
	const { deletedTask, finishedSubtasks, keptByAccountId } = kept;
	const seed = completedParentSeed(deletedTask, kept.completedParentTitle);
	const id = await createTask(supabase, deletedTask.projectId, seed, keptByAccountId);
	await updateTaskStatus(supabase, id, doneTaskStatus, keptByAccountId);
	for (const subtask of finishedSubtasks) await reparentTask(supabase, subtask.id, id);
	return { id, title: seed.title };
}

function completedParentSeed(deletedTask: ProjectTask, title: string): NewTaskSeed {
	return {
		title: titleOfTheSameKind(title, deletedTask.title),
		details: `Keeps the finished subtasks of "${deletedTask.title}", which was deleted.`,
		dueDate: null,
		parentTaskId: deletedTask.parentTaskId,
		waitsForTaskId: null,
		goalId: deletedTask.goalId,
		kind: deletedTask.kind,
		department: deletedTask.department,
		story: { role: deletedTask.storyRole, want: deletedTask.storyWant, benefit: deletedTask.storyBenefit }
	};
}

/** A bug's finished work stays a bug's: the completed task is titled as a bug fix when the deleted task was. */
function titleOfTheSameKind(title: string, deletedTitle: string): string {
	if (isBugTitle(deletedTitle)) return asBugTitle(title);
	return title;
}
