import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteTasksTogether } from './deleteTasksTogether';
import { getTaskDeletionPlan } from './getTaskDeletionPlan';
import { keepFinishedSubtasks, type CompletedParent } from './keepFinishedSubtasks';
import { taskDeletionRefusal } from '$lib/data/taskDeletion';
import type { TaskDeletionChoices, TaskDeletionPlan, TaskDeletionRefusal } from '$lib/data/taskDeletion';
import type { ProjectTask } from './taskRecord';

export type TaskDeletionRequest = TaskDeletionChoices & { deletedByAccountId: string };

/** What came of asking to delete a task: the plan it was judged by, why it was refused, and where finished work went. */
export type TaskDeletionOutcome = {
	plan: TaskDeletionPlan<ProjectTask>;
	refusal: TaskDeletionRefusal | null;
	completedParent: CompletedParent | null;
};

/**
 * Deletes a task and the open subtasks under it. Finished work is never deleted: a finished task is refused, and
 * finished subtasks are first moved under a new completed task. Nothing is deleted until whoever asked has named
 * that task and said the open subtasks go, so a first ask is answered with the plan and a refusal.
 */
export async function deleteTask(
	supabase: SupabaseClient,
	task: ProjectTask,
	request: TaskDeletionRequest
): Promise<TaskDeletionOutcome> {
	const plan = await getTaskDeletionPlan(supabase, task);
	const refusal = taskDeletionRefusal(plan, request);
	if (refusal !== null) return { plan, refusal, completedParent: null };
	const completedParent = await keepFinishedWork(supabase, plan, request);
	const taskIds = [task, ...plan.openSubtasks].map((deleted) => deleted.id);
	const { deletedByAccountId } = request;
	await deleteTasksTogether(supabase, { projectId: task.projectId, taskIds, deletedByAccountId });
	return { plan, refusal, completedParent };
}

async function keepFinishedWork(
	supabase: SupabaseClient,
	plan: TaskDeletionPlan<ProjectTask>,
	request: TaskDeletionRequest
): Promise<CompletedParent | null> {
	const { task, finishedSubtasks } = plan;
	const { completedParentTitle, deletedByAccountId } = request;
	if (finishedSubtasks.length === 0 || completedParentTitle === null) return null;
	const kept = { deletedTask: task, finishedSubtasks, completedParentTitle, keptByAccountId: deletedByAccountId };
	return keepFinishedSubtasks(supabase, kept);
}
