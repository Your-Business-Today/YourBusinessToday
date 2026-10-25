import { type RequestEvent } from '@sveltejs/kit';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { setTaskAutocompleteFromForm } from '$lib/server/autocomplete/setAutocompleteFromForm';

/** The autocomplete choice made on a task card or a task page, for a task on the route's project. */
export async function setTaskAutocompleteAction({
	locals,
	params,
	request
}: RequestEvent<{ projectId: string }>) {
	await requireProjectAccess(locals, params.projectId);
	const formData = await request.formData();
	return setTaskAutocompleteFromForm(locals.supabase, params.projectId, formData, await isStaffMember(locals));
}
