import { fail, type RequestEvent } from '@sveltejs/kit';
import { createTask, readNewTaskSeed } from '$lib/server/projects/createTask';
import { giveNewTaskToOwner, readNewTaskOwner } from '$lib/server/projects/newTaskOwner';
import { newTaskRefusal } from '$lib/server/projects/newTaskRefusal';
import { similarTasksFailure } from '$lib/server/projects/similarTasksForNewTask';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { withRaiserAutocomplete } from '$lib/data/autocompleteStanding';

/**
 * Raise a task from the new-task form, given to the owner it names, unless it is refused or open tasks
 * on the project look like it and the person has not chosen to raise it anyway.
 */
export async function createTaskAction({ locals, params, request }: RequestEvent<{ projectId: string }>) {
	const { user } = await requireProjectAccess(locals, params.projectId);
	const formData = await request.formData();
	const seed = readNewTaskSeed(formData);
	if (seed === null) return fail(400, { message: 'A task title is required.' });
	const refusal = await newTaskRefusal(locals.supabase, params.projectId, seed);
	if (refusal !== null) return fail(400, { message: refusal });
	const owner = await readNewTaskOwner(locals.supabase, params.projectId, formData);
	if (owner.refusal !== null) return fail(400, { message: owner.refusal });
	const similar = await similarTasksFailure(locals.supabase, params.projectId, seed, formData);
	if (similar !== null) return similar;
	const raised = withRaiserAutocomplete(seed, await isStaffMember(locals));
	const taskId = await createTask(locals.supabase, params.projectId, raised, user.id);
	await giveNewTaskToOwner(locals.supabase, taskId, owner.ownerIds);
	return {};
}
