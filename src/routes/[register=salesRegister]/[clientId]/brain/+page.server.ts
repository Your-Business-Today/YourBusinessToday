import { readLeadOfPage } from '$lib/server/clients/readLeadOfPage';
import { readBusinessBrainForPage } from '$lib/server/businessBrain/readBusinessBrainForPage';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { PageServerLoad } from './$types';

/** The brain of the organisation opened for the company, as its own Business Brain page shows it. */
export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	const { client, organisationId } = await readLeadOfPage(locals, event);
	if (organisationId === null) return { client, organisationId, brain: null };
	const access = await requireOrganisationAccess(locals, organisationId);
	const brain = await readBusinessBrainForPage(locals.supabase, organisationId, access.canManage);
	return { client, organisationId, brain };
};
