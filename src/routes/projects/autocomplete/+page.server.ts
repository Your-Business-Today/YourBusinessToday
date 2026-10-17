import { getAutocompleteRegister } from '$lib/server/autocomplete/getAutocompleteRegister';
import { getReachableProjectIds } from '$lib/server/projects/getReachableProjectIds';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const projectIds = await getReachableProjectIds(locals.supabase, user.id);
	return { register: await getAutocompleteRegister(locals.supabase, projectIds) };
};
