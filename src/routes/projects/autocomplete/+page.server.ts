import { getAutocompleteRegister } from '$lib/server/autocomplete/getAutocompleteRegister';
import { getReachableProjectIds } from '$lib/server/projects/getReachableProjectIds';
import { parseAutocompleteRegisterFilter } from '$lib/data/autocompleteRegisterFilter';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await requireUser(locals);
	const projectIds = await getReachableProjectIds(locals.supabase, user.id);
	const filter = parseAutocompleteRegisterFilter(url.searchParams.get('autocomplete'));
	return { register: await getAutocompleteRegister(locals.supabase, projectIds), filter };
};
