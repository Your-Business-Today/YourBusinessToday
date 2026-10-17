import { fail, type RequestEvent } from '@sveltejs/kit';
import { createTask, readNewTaskSeed } from '$lib/server/projects/createTask';
import { newTaskRefusal } from '$lib/server/projects/newTaskRefusal';
import { similarTasksFailure } from '$lib/server/projects/similarTasksForNewTask';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';

/** Raise a task from the new-task form, unless it is refused or open tasks across YBT look like it. */
export async function createTaskAction({ locals, params, request }: RequestEvent<{ projectId: string }>) {
	const { user } = await requireProjectAccess(locals, params.projectId);
	const formData = await request.formData();
	const seed = readNewTaskSeed(formData);
	if (seed === null) return fail(400, { message: 'A task title is required.' });
	const refusal = await newTaskRefusal(locals.supabase, params.projectId, seed);
	if (refusal !== null) return fail(400, { message: refusal });
	const similar = await similarTasksFailure(locals.supabase, user.id, seed, formData);
	if (similar !== null) return similar;
	await createTask(locals.supabase, params.projectId, seed, user.id);
	return {};
}
