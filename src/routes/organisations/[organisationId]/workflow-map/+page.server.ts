import { isBusinessBrainOpen } from '$lib/server/organisations/readBrainsOf';
import { readOrganisationWorkflowMaps } from '$lib/server/workflowMap/readOrganisationWorkflowMaps';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { PageServerLoad } from './$types';

const chosenStationParameter = 'station';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const access = await requireOrganisationAccess(locals, params.organisationId);
	const { organisation } = access;
	const chosenStationKey = url.searchParams.get(chosenStationParameter);
	const isBrainOpen = await isBusinessBrainOpen(locals.supabase, access);
	if (!isBrainOpen) return { organisation, maps: null, chosenStationKey };
	const maps = await readOrganisationWorkflowMaps(locals.supabase, organisation.id);
	return { organisation, maps, chosenStationKey };
};
