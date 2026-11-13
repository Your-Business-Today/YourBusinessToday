import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { readMapStandings } from './readMapStandings';
import { readOrganisationWorkflowMaps } from './readOrganisationWorkflowMaps';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { MapStandings } from '$lib/data/workflowMap/stationReview';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';

/** A client's latest Before and After, and where each of their stations stands. */
export type ClientWorkflowMap = { maps: OrganisationWorkflowMaps; standings: MapStandings };

/**
 * The workflow map of a client's organisation; none before the client is set up. The map's tables are the
 * server's alone, so this reads with the service key: only call it once the caller has been let in to this
 * client, so a contact only ever reads their own organisation's map.
 */
export async function readWorkflowMapOfClient(clientId: string): Promise<ClientWorkflowMap | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, clientId);
	if (organisationId === null) return null;
	const maps = await readOrganisationWorkflowMaps(service, organisationId);
	const standings = await readMapStandings(service, organisationId, maps);
	return { maps, standings };
}
