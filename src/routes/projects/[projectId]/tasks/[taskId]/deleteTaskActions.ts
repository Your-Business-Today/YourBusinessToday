import { error, fail, redirect } from '@sveltejs/kit';
import { deleteTask } from '$lib/server/projects/deleteTask';
import { finishedTaskStays, taskDeletionRefusals, type TaskDeletionRefusal } from '$lib/data/taskDeletion';
import { getTask } from '$lib/server/projects/getTask';
import { readTaskDeletionRequest } from '$lib/server/projects/readTaskDeletionRequest';
import type { CompletedParent } from '$lib/server/projects/keepFinishedSubtasks';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const subtasksHaveChanged =
	'Its subtasks have changed since this opened. Close this and open Delete again to see what deleting it would do now.';

export const deleteTaskActions = {
	deleteTask: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const task = await getTask(locals.supabase, params.taskId);
		if (task === null) error(404, 'Task not found');
		const deletion = readTaskDeletionRequest(await request.formData(), user.id);
		const outcome = await deleteTask(locals.supabase, task, deletion);
		const refusal = refusalInWords(task, outcome.refusal);
		if (refusal !== null) return fail(400, { message: refusal });
		redirect(303, pageAfterDeleting(params.projectId, outcome.completedParent));
	}
} satisfies Actions;

function refusalInWords(task: ProjectTask, refusal: TaskDeletionRefusal | null): string | null {
	if (refusal === null) return null;
	if (refusal === taskDeletionRefusals.taskIsFinished) return finishedTaskStays(task);
	return subtasksHaveChanged;
}

/** The finished subtasks' new home when there is one, so whoever deleted the task sees where they went. */
function pageAfterDeleting(projectId: string, completedParent: CompletedParent | null): string {
	if (completedParent === null) return `/projects/${projectId}`;
	return `/projects/${projectId}/tasks/${completedParent.id}`;
}
