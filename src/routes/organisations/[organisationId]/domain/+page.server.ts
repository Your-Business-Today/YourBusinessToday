import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { readBrainsOf } from '$lib/server/organisations/readBrainsOf';
import { readDomainPages } from '$lib/server/businessBrain/readDomainPages';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const access = await requireOrganisationAccess(locals, params.organisationId);
	const { organisation, canManage } = access;
	const brains = await readBrainsOf(locals.supabase, access);
	if (brains === null) return { organisation, canManage, brains, domain: null };
	const domain = organisationDomainOf(await readDomainPages(locals.supabase, organisation.id));
	return { organisation, canManage, brains, domain };
};
