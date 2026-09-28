import { fail } from '@sveltejs/kit';
import { getGlobalTaskPage, singlePageOf } from '$lib/server/projects/getGlobalTaskPage';
import { getTeamTasks } from '$lib/server/projects/getTeamTasks';
import { moveGlobalTask } from '$lib/server/projects/moveGlobalTask';
import { parseDropPlacement } from '$lib/server/ordering/rankInput';
import { parseTaskStatus } from '$lib/data/taskStatus';
import { placeGlobalTask } from '$lib/server/projects/placeGlobalTask';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { requireProjectOwner } from '$lib/server/auth/requireProjectOwner';
import { requireUser } from '$lib/server/auth/requireUser';
import { getTask } from '$lib/server/projects/getTask';
import { parseTaskListFilter, type TaskListFilter } from '$lib/data/taskListFilter';
import { statusChangeRefusal } from '$lib/server/support/statusChangeRefusal';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import type { GlobalTaskPage } from '$lib/server/projects/getGlobalTaskPage';
import type { TaskMoveDirection } from '$lib/server/projects/moveTask';
import type { Actions, PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await requireUser(locals);
	const filter = parseTaskListFilter(url.searchParams.get('status'));
	const pageNumber = readPageNumber(url.searchParams.get('page'));
	return { taskPage: await pageFor(locals.supabase, user.id, filter, pageNumber), filter };
};

function pageFor(
	supabase: SupabaseClient,
	accountId: string,
	filter: TaskListFilter,
	pageNumber: number
): Promise<GlobalTaskPage> {
	if (filter === 'team') return getTeamTasks(supabase, accountId).then(singlePageOf);
	return getGlobalTaskPage(supabase, accountId, pageNumber, filter === 'all');
}

export const actions: Actions = {
	moveTask: async ({ locals, request }) => {
		const formData = await request.formData();
		const taskId = String(formData.get('taskId') ?? '');
		const direction = String(formData.get('direction')) as TaskMoveDirection;
		const shouldIncludeDone = String(formData.get('includeDone')) === 'true';
		const task = await getTask(locals.supabase, taskId);
		if (task === null) return fail(400, { message: 'A task is required.' });
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
	setStatus: async ({ locals, request }) => {
		const formData = await request.formData();
		const task = await getTask(locals.supabase, String(formData.get('taskId') ?? ''));
		if (task === null) return fail(400, { message: 'A task is required.' });
		await requireProjectAccess(locals, task.projectId);
		const status = parseTaskStatus(formData.get('status'));
		const refusal = statusChangeRefusal(task, status);
		if (refusal !== null) return fail(400, { message: refusal });
		await updateTaskStatus(locals.supabase, task.id, status);
		return {};
	}
};

function readPageNumber(value: string | null): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 1) return 1;
	return parsed;
}
