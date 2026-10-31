import { fail } from '@sveltejs/kit';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { getTask } from '$lib/server/projects/getTask';
import { moveTask, type TaskMoveDirection } from '$lib/server/projects/moveTask';
import { parsePriorityNumber, priorityNumberRefusal } from '$lib/server/ordering/rankInput';
import { parseTaskStatus } from '$lib/data/taskStatus';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { readExactStoryPoints, storyPointsRefusal } from '$lib/data/storyPoints';
import { setTaskPriority } from '$lib/server/projects/setTaskPriority';
import { setTaskStoryPoints } from '$lib/server/projects/setTaskStoryPoints';
import { statusChangeRefusal } from '$lib/server/support/statusChangeRefusal';
import { updateTaskGoal } from '$lib/server/projects/updateTaskGoal';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import { createTaskAction } from './createTaskAction';
import type { Actions } from './$types';

export const taskActions = {
	createTask: createTaskAction,
	moveTask: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const taskId = String(formData.get('taskId') ?? '');
		const direction = String(formData.get('direction')) as TaskMoveDirection;
		if (taskId === '') return fail(400, { message: 'A task is required.' });
		await moveTask(locals.supabase, taskId, direction);
		return {};
	},
	setStatus: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await getTask(locals.supabase, String(formData.get('taskId') ?? ''));
		if (task === null) return fail(400, { message: 'A task is required.' });
		const status = parseTaskStatus(formData.get('status'));
		const refusal = statusChangeRefusal(task, status);
		if (refusal !== null) return fail(400, { message: refusal });
		await updateTaskStatus(locals.supabase, task.id, status, user.id);
		return {};
	},
	setTaskPriority: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
		if (task === null) return fail(400, { message: taskOnProjectRequired });
		const priority = parsePriorityNumber(formData.get('priority'));
		if (priority === null) return fail(400, { message: priorityNumberRefusal });
		await setTaskPriority(locals.supabase, task.id, priority);
		return {};
	},
	setStoryPoints: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
		if (task === null) return fail(400, { message: taskOnProjectRequired });
		const storyPoints = readExactStoryPoints(formData.get('storyPoints'));
		if (storyPoints === null) return fail(400, { message: storyPointsRefusal });
		await setTaskStoryPoints(locals.supabase, task.id, storyPoints);
		return {};
	},
	setGoal: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const taskId = String(formData.get('taskId') ?? '');
		if (taskId === '') return fail(400, { message: 'A task is required.' });
		const goalId = String(formData.get('goalId') ?? '');
		await updateTaskGoal(locals.supabase, taskId, goalId === '' ? null : goalId);
		return {};
	}
} satisfies Actions;
