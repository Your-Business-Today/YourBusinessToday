import { fail } from '@sveltejs/kit';
import { getTask } from '$lib/server/projects/getTask';
import { isQueued } from '$lib/server/projects/taskQueue';
import { moveGlobalTask } from '$lib/server/projects/moveGlobalTask';
import {
	parseDropPlacement,
	parsePriorityNumber,
	priorityNumberRefusal
} from '$lib/server/ordering/rankInput';
import { parseTaskStatus } from '$lib/data/taskStatus';
import { placeGlobalTask } from '$lib/server/projects/placeGlobalTask';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { requireProjectOwner } from '$lib/server/auth/requireProjectOwner';
import { setQueuePriority } from '$lib/server/projects/setQueuePriority';
import { statusChangeRefusal } from '$lib/server/support/statusChangeRefusal';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import type { TaskMoveDirection } from '$lib/server/projects/moveTask';
import type { Actions } from './$types';

const taskRequired = 'A task is required.';
const onlyTopLevelTasksQueue = 'Only a top level task has a place in the queue.';

export const taskQueueActions = {
	moveTask: async ({ locals, request }) => {
		const formData = await request.formData();
		const taskId = String(formData.get('taskId') ?? '');
		const direction = String(formData.get('direction')) as TaskMoveDirection;
		const shouldIncludeDone = String(formData.get('includeDone')) === 'true';
		const task = await getTask(locals.supabase, taskId);
		if (task === null) return fail(400, { message: taskRequired });
		await requireProjectOwner(locals, task.projectId);
		await moveGlobalTask(locals.supabase, task.id, direction, shouldIncludeDone);
		return {};
	},
	placeTask: async ({ locals, request }) => {
		const formData = await request.formData();
		const movedTaskId = String(formData.get('movedTaskId') ?? '');
		const targetTaskId = String(formData.get('targetTaskId') ?? '');
		const movedTask = await getTask(locals.supabase, movedTaskId);
		if (movedTask === null || targetTaskId === '') {
			return fail(400, { message: 'A task to move and a drop target are required.' });
		}
		await requireProjectOwner(locals, movedTask.projectId);
		const placement = parseDropPlacement(formData.get('placement'));
		await placeGlobalTask(locals.supabase, movedTask.id, targetTaskId, placement);
		return {};
	},
	setQueuePriority: async ({ locals, request }) => {
		const formData = await request.formData();
		const task = await getTask(locals.supabase, String(formData.get('taskId') ?? ''));
		if (task === null) return fail(400, { message: taskRequired });
		if (!isQueued(task)) return fail(400, { message: onlyTopLevelTasksQueue });
		await requireProjectOwner(locals, task.projectId);
		const position = parsePriorityNumber(formData.get('priority'));
		if (position === null) return fail(400, { message: priorityNumberRefusal });
		await setQueuePriority(locals.supabase, task.id, position);
		return {};
	},
	setStatus: async ({ locals, request }) => {
		const formData = await request.formData();
		const task = await getTask(locals.supabase, String(formData.get('taskId') ?? ''));
		if (task === null) return fail(400, { message: taskRequired });
		const { user } = await requireProjectAccess(locals, task.projectId);
		const status = parseTaskStatus(formData.get('status'));
		const refusal = statusChangeRefusal(task, status);
		if (refusal !== null) return fail(400, { message: refusal });
		await updateTaskStatus(locals.supabase, task.id, status, user.id);
		return {};
	}
} satisfies Actions;
