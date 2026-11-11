import { getOpenTeamWork } from '$lib/server/organisations/getOpenTeamWork';
import { getReachableProjectsOf } from '$lib/server/organisations/getReachableProjectsOf';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { teamWorkGroups } from '$lib/data/organisationTeamWork';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user, organisation } = await requireOrganisationAccess(locals, params.organisationId);
	const products = await getReachableProjectsOf(locals.supabase, user.id, organisation.id);
	const tasks = await getOpenTeamWork(locals.supabase, products.map((product) => product.id));
	return { organisation, groups: teamWorkGroups(tasks, products) };
};
