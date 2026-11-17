import { readDomainForPage } from '$lib/server/businessBrain/readDomainForPage';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const access = await requireOrganisationAccess(locals, params.organisationId);
	const { organisation, canManage } = access;
	return { organisation, canManage, ...(await readDomainForPage(locals, access, url)) };
};
