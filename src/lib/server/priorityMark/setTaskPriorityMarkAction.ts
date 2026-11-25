import { fail, type RequestEvent } from '@sveltejs/kit';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { setTaskPriorityMark } from '$lib/server/projects/setTaskPriorityMark';
import { priorityMarkRefusal, readPriorityMarkFromForm } from '$lib/data/priorityMark';

/** The priority mark set or taken off on a task card or a task page, for a task on the route's project. */
export async function setTaskPriorityMarkAction({
	locals,
	params,
	request
}: RequestEvent<{ projectId: string }>) {
	await requireProjectAccess(locals, params.projectId);
	const formData = await request.formData();
	const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
	if (task === null) return fail(400, { message: taskOnProjectRequired });
	const isPriority = readPriorityMarkFromForm(formData.get('isPriority'));
	if (isPriority === undefined) return fail(400, { message: priorityMarkRefusal });
	await setTaskPriorityMark(locals.supabase, task.id, isPriority);
	return {};
}
