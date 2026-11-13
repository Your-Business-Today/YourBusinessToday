import { isBusinessBrainOpen } from '$lib/server/organisations/readBrainsOf';
import { readOrganisationWorkflowMaps } from '$lib/server/workflowMap/readOrganisationWorkflowMaps';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { workflowMapQueryKeys } from '$lib/components/organisations/organisationPages';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const access = await requireOrganisationAccess(locals, params.organisationId);
	const { organisation } = access;
	const chosenStationKey = url.searchParams.get(workflowMapQueryKeys.station);
	const isBrainOpen = await isBusinessBrainOpen(locals.supabase, access);
	if (!isBrainOpen) return { organisation, maps: null, chosenStationKey };
	const maps = await readOrganisationWorkflowMaps(supabaseServiceClient(), organisation.id);
	return { organisation, maps, chosenStationKey };
};
