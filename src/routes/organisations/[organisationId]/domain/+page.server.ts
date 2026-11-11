import { getReachableProjectsOf } from '$lib/server/organisations/getReachableProjectsOf';
import { readDomainsOf } from '$lib/server/organisations/readDomainsOf';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user, organisation } = await requireOrganisationAccess(locals, params.organisationId);
	const products = await getReachableProjectsOf(locals.supabase, user.id, organisation.id);
	return { organisation, productDomains: await readDomainsOf(locals.supabase, products) };
};
