import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { StationMark } from './validateStationMark';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who is marking a client's map: a contact of theirs, already let in to the portal. */
export type StationMarker = { clientId: string; accountId: string };

type LatestVersion = { id: string; versionNumber: number };

const noSuchStation: Refusal = { refusal: 'That station is not on this version of your workflow map.' };

export function noMapToMark(stage: MapStage): Refusal {
	return { refusal: `Your ${mapStageNames[stage]} workflow map has not been filed yet, so there is nothing to mark.` };
}

/**
 * Keeps a client's mark on one station of the latest version as a row of its own, beside the marks before it. The
 * map's tables are the server's alone, so this writes with the service key: only call it once the caller has been
 * let in to this client, so a contact only ever marks their own organisation's map.
 */
export async function markWorkflowMapStation(marker: StationMarker, mark: StationMark): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, marker.clientId);
	if (organisationId === null) return noMapToMark(mark.stage);
	const latest = await findLatestVersion(service, organisationId, mark.stage);
	if (latest === null) return noMapToMark(mark.stage);
	if (latest.versionNumber !== mark.versionNumber) return newerVersionFiled(latest.versionNumber);
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

function newerVersionFiled(versionNumber: number): Refusal {
	return { refusal: `Version ${versionNumber} has been filed since you opened the map: reload it and mark the station there.` };
}

async function findLatestVersion(service: SupabaseClient, organisationId: string, stage: MapStage): Promise<LatestVersion | null> {
	const { data, error } = await service
		.from('workflow_map_versions')
		.select('id, version_number')
		.eq('organisation_id', organisationId)
		.eq('stage', stage)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return { id: String(data.id), versionNumber: Number(data.version_number) };
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
