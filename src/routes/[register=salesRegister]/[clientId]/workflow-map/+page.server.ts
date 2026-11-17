import { readLeadOfPage } from '$lib/server/clients/readLeadOfPage';
import { readOrganisationWorkflowMaps } from '$lib/server/workflowMap/readOrganisationWorkflowMaps';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { workflowMapQueryKeys } from '$lib/components/organisations/organisationPages';
import type { PageServerLoad } from './$types';

/** The map's tables are the server's alone, so they are read with the service key, once staff have been let in. */
export const load: PageServerLoad = async (event) => {
	const { client, organisationId } = await readLeadOfPage(event.locals, event);
	const { searchParams } = event.url;
	const chosenStationKey = searchParams.get(workflowMapQueryKeys.station);
	const maps = organisationId === null ? null : await readOrganisationWorkflowMaps(supabaseServiceClient(), organisationId);
	return { client, hasOrganisation: organisationId !== null, maps, chosenStationKey };
};
