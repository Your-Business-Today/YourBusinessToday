import { type RequestEvent } from '@sveltejs/kit';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setTaskAutocompleteFromForm } from '$lib/server/autocomplete/setAutocompleteFromForm';

/** The autocomplete choice made on a task card or a task page, for a task on the route's project. */
export async function setTaskAutocompleteAction({
	locals,
	params,
	request
}: RequestEvent<{ projectId: string }>) {
	await requireProjectAccess(locals, params.projectId);
	return setTaskAutocompleteFromForm(locals.supabase, params.projectId, await request.formData());
}
