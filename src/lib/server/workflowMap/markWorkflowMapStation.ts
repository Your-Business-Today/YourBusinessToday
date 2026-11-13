import { findConfirmedMapVersion } from './readConfirmedMapVersions';
import { findLatestMapVersion, newerVersionFiled } from './findLatestMapVersion';
import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { StationMark } from './validateStationMark';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who is marking a client's map: a contact of theirs, already let in to the portal. */
export type StationMarker = { clientId: string; accountId: string };

const noSuchStation: Refusal = { refusal: 'That station is not on this version of your workflow map.' };
const confirmedVersionKept: Refusal = {
	refusal:
		'You have confirmed this version, so it is kept as it is. Say what has changed: the next version filed is yours ' +
		'to check and confirm again.'
};

export function noMapToMark(stage: MapStage): Refusal {
	return { refusal: `Your ${mapStageNames[stage]} workflow map has not been filed yet, so there is nothing to mark.` };
}

/**
 * Keeps a client's mark on one station of the latest version as a row of its own, beside the marks before it. A
 * confirmed version is kept as it was confirmed, so it takes no more marks. The map's tables are the server's alone,
 * so this writes with the service key: only call it once the caller has been let in to this client, so a contact
 * only ever marks their own organisation's map.
 */
export async function markWorkflowMapStation(marker: StationMarker, mark: StationMark): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, marker.clientId);
	if (organisationId === null) return noMapToMark(mark.stage);
	const latest = await findLatestMapVersion(service, organisationId, mark.stage);
	if (latest === null) return noMapToMark(mark.stage);
	if (latest.versionNumber !== mark.versionNumber) return newerVersionFiled(latest.versionNumber);
	const confirmation = await findConfirmedMapVersion(service, latest.id);
	if (confirmation !== null) return confirmedVersionKept;
	const stationId = await findStationId(service, latest.id, mark.stationKey);
	if (stationId === null) return noSuchStation;
	const { error } = await service.from('workflow_map_station_reviews').insert({
		station_id: stationId,
		review_state: mark.reviewState,
		what_is_wrong: mark.whatIsWrong,
		reviewed_by: marker.accountId
	});
	if (error) throw error;
	return null;
}

async function findStationId(service: SupabaseClient, versionId: string, stationKey: string): Promise<string | null> {
	const { data, error } = await service
		.from('workflow_map_stations')
		.select('id')
		.eq('version_id', versionId)
		.eq('station_key', stationKey)
		.maybeSingle();
	if (error) throw error;
	return data === null ? null : String(data.id);
}
