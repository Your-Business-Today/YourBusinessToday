import { error } from '@sveltejs/kit';
import { getClient } from '$lib/server/clients/getClient';
import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { readOrganisationWorkflowMaps } from '$lib/server/workflowMap/readOrganisationWorkflowMaps';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { keepOnItsRegister } from '$lib/server/salesRegisters/keepOnItsRegister';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { workflowMapQueryKeys } from '$lib/components/organisations/organisationPages';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';
import type { PageServerLoad } from './$types';

const notFound = 404;

export const load: PageServerLoad = async ({ locals, params, url }) => {
	await requireStaff(locals);
	const client = await getClient(locals.supabase, params.clientId);
	if (client === null) error(notFound, 'That company could not be found');
	keepOnItsRegister(url, params.register, client.stage);
	const chosenStationKey = url.searchParams.get(workflowMapQueryKeys.station);
	return { client, maps: await readWorkflowMapsOfClient(client.id), chosenStationKey };
};

/** The map's tables are the server's alone, so they are read with the service key, once staff have been let in. */
async function readWorkflowMapsOfClient(clientId: string): Promise<OrganisationWorkflowMaps | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, clientId);
	if (organisationId === null) return null;
	return readOrganisationWorkflowMaps(service, organisationId);
}
