import { getReachableProjectsOf } from '$lib/server/organisations/getReachableProjectsOf';
import { readBrainsOf } from '$lib/server/organisations/readBrainsOf';
import { readDomainsOf } from '$lib/server/organisations/readDomainsOf';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const access = await requireOrganisationAccess(locals, params.organisationId);
	const { user, organisation, canManage } = access;
	const products = await getReachableProjectsOf(locals.supabase, user.id, organisation.id);
	const [brains, productDomains] = await Promise.all([readBrainsOf(locals.supabase, access), readDomainsOf(locals.supabase, products)]);
	return { organisation, canManage, brains, productDomains };
};
