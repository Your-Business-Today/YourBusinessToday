import { fail, redirect } from '@sveltejs/kit';
import { applyTaskMoveChoice, parseTaskMoveChoice } from '$lib/server/projects/taskMoveChoice';
import { getProject } from '$lib/server/projects/getProject';
import { getTask } from '$lib/server/projects/getTask';
import { moveTaskToProject } from '$lib/server/projects/moveTaskToProject';
import { parseRank } from '$lib/server/ordering/rankInput';
import { parseTaskDetailsForm } from '$lib/server/projects/parseTaskDetailsForm';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setTaskAssignees } from '$lib/server/projects/setTaskAssignees';
import { setTaskPriority } from '$lib/server/projects/setTaskPriority';
import { setTaskRoles } from '$lib/server/projects/setTaskRoles';
import { setTaskWaitsFor } from '$lib/server/projects/setTaskWaitsFor';
import { statusChangeRefusal } from '$lib/server/support/statusChangeRefusal';
import { updateTaskDetails } from '$lib/server/projects/updateTaskDetails';
import type { Actions } from './$types';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const pickAProjectYouAreOn = 'Choose a project you are on to move this task to.';

type WhereFrom = { task: ProjectTask; source: Project; movedByAccountId: string };

export const saveTaskActions: Actions = {
	saveTask: async ({ locals, params, request }) => {
		const { user, project } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const submission = parseTaskDetailsForm(formData);
		if (submission === null) return fail(400, { message: 'A task title is required.' });
		const task = await getTask(locals.supabase, params.taskId);
		if (task === null) return fail(404, { message: 'Task not found.' });
		const refusal = statusChangeRefusal(task, submission.status);
		if (refusal !== null) return fail(400, { message: refusal });
		const sequenceRefusal = await setTaskWaitsFor(locals.supabase, task, submission.waitsForTaskId);
		if (sequenceRefusal !== null) return fail(400, { message: sequenceRefusal });
		await updateTaskDetails(locals.supabase, params.taskId, submission);
		await setTaskAssignees(locals.supabase, params.taskId, submission.assigneeIds);
		await setTaskRoles(locals.supabase, params.taskId, submission.roles);
		const whereFrom = { task, source: project, movedByAccountId: user.id };
		const refusedMove = await sendTaskOnItsWay(locals.supabase, formData, whereFrom);
		if (refusedMove !== null) return fail(400, { message: refusedMove });
		return { message: 'Task saved.' };
	}
};

/**
 * Where the task goes once its details are saved: another project, or a new
 * place among the tasks it already sits with. Leaving the project is a
 * journey, so the person is landed on the task where it now lives.
 */
async function sendTaskOnItsWay(
	supabase: SupabaseClient,
	formData: FormData,
	whereFrom: WhereFrom
): Promise<string | null> {
	const chosenProjectId = otherProjectId(formData, whereFrom.source.id);
	if (chosenProjectId === null) {
		await placeAmongItsSiblings(supabase, whereFrom.task, formData);
		return null;
	}
	const destination = await getProject(supabase, chosenProjectId);
	if (destination === null) return pickAProjectYouAreOn;
	await moveTaskToProject(supabase, { ...whereFrom, destination });
	redirect(303, `/projects/${destination.id}/tasks/${whereFrom.task.id}`);
}

function otherProjectId(formData: FormData, sourceProjectId: string): string | null {
	const chosenProjectId = String(formData.get('destinationProjectId') ?? '');
	if (chosenProjectId === '' || chosenProjectId === sourceProjectId) return null;
	return chosenProjectId;
}

async function placeAmongItsSiblings(
	supabase: SupabaseClient,
	task: ProjectTask,
	formData: FormData
): Promise<void> {
	await applyTaskMoveChoice(supabase, task.id, parseTaskMoveChoice(formData.get('moveTo')));
	const priority = parseRank(formData.get('priority'));
	if (priority === null || priority === task.priority) return;
	await setTaskPriority(supabase, task.id, priority);
}
