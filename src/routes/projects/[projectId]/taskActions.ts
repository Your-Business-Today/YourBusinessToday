import { fail } from '@sveltejs/kit';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { getTask } from '$lib/server/projects/getTask';
import { moveTaskAmongShown, setTaskPosition } from '$lib/server/projects/taskShownOrder';
import { parseMoveDirection, parsePriorityNumber, priorityNumberRefusal } from '$lib/server/ordering/rankInput';
import { readShownIds, shownIdsField } from '$lib/data/shownIds';
import { parseTaskStatus } from '$lib/data/taskStatus';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { readExactStoryPoints, storyPointsRefusal } from '$lib/data/storyPoints';
import { setTaskStoryPoints } from '$lib/server/projects/setTaskStoryPoints';
import { statusChangeRefusal } from '$lib/server/support/statusChangeRefusal';
import { updateTaskGoal } from '$lib/server/projects/updateTaskGoal';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import { createTaskAction } from './createTaskAction';
import type { Actions } from './$types';

const moveDirectionRefusal = 'A move is up or down.';

export const taskActions = {
	createTask: createTaskAction,
	moveTask: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
		if (task === null) return fail(400, { message: taskOnProjectRequired });
		const direction = parseMoveDirection(formData.get('direction'));
		if (direction === null) return fail(400, { message: moveDirectionRefusal });
		await moveTaskAmongShown(locals.supabase, task, direction, readShownIds(formData.get(shownIdsField)));
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
		await setTaskPosition(locals.supabase, task, priority, readShownIds(formData.get(shownIdsField)));
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
