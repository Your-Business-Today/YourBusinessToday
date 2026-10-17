import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setTaskAutocompleteFromForm } from '$lib/server/autocomplete/setAutocompleteFromForm';
import type { Actions } from './$types';

export const autocompleteActions = {
	setAutocomplete: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		return setTaskAutocompleteFromForm(locals.supabase, params.projectId, await request.formData());
	}
} satisfies Actions;
