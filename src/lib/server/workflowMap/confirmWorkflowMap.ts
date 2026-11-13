import { canConfirmMap, mapConfirmationHeldBack } from '$lib/data/workflowMap/mapConfirmed';
import { findLatestMapVersion, newerVersionFiled } from './findLatestMapVersion';
import { findOrganisationOfClient } from '$lib/server/onboarding/organisationForClient';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import type { StationMarker } from './markWorkflowMapStation';
import { notifyWorkflowMapConfirmed } from './notifyWorkflowMapConfirmed';
import { organisationWorkflowMapPath } from '$lib/data/workflowMap/workflowMapPaths';
import { readLatestWorkflowMap } from './readLatestWorkflowMap';
import { readStationStandings } from './readStationStandings';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { stationReviewTallyOf } from '$lib/data/workflowMap/stationReviewTally';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { MapConfirmationChoice } from './validateMapConfirmation';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A client contact confirming their organisation's map, and the site they did it on, for the link to staff. */
export type MapConfirmer = StationMarker & { organisationName: string; siteOrigin: string };

type ConfirmedVersion = MapConfirmationChoice & { organisationId: string };

const uniqueViolation = '23505';
function noMapToConfirm(stage: MapConfirmationChoice['stage']): Refusal {
	return { refusal: `Your ${mapStageNames[stage]} workflow map has not been filed yet, so there is nothing to confirm.` };
}

export const mapAlreadyConfirmed: Refusal = { refusal: 'You have already confirmed this version of your workflow map.' };

/**
 * Keeps the latest version of a stage as confirmed, once no station of it is marked not right, then tells YBT: the
 * client's history records it and the staff inbox is emailed. The map's tables are the server's alone, so this
 * writes with the service key: only call it once the caller has been let in to this client.
 */
export async function confirmWorkflowMap(confirmer: MapConfirmer, choice: MapConfirmationChoice): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const organisationId = await findOrganisationOfClient(service, confirmer.clientId);
	if (organisationId === null) return noMapToConfirm(choice.stage);
	const latest = await findLatestMapVersion(service, organisationId, choice.stage);
	if (latest === null) return noMapToConfirm(choice.stage);
	if (latest.versionNumber !== choice.versionNumber) return newerVersionFiled(latest.versionNumber);
	const heldBack = await refusalWhileNotRight(service, organisationId, choice);
	if (heldBack !== null) return heldBack;
	const isNewlyConfirmed = await keepConfirmation(service, latest.id, confirmer.accountId);
	if (!isNewlyConfirmed) return mapAlreadyConfirmed;
	await tellYbt(service, confirmer, { ...choice, organisationId });
	return null;
}

async function refusalWhileNotRight(
	service: SupabaseClient,
	organisationId: string,
	choice: MapConfirmationChoice
): Promise<Refusal | null> {
	const map = await readLatestWorkflowMap(service, organisationId, choice.stage);
	if (map === null) return noMapToConfirm(choice.stage);
	const standings = await readStationStandings(service, organisationId, map);
	const tally = stationReviewTallyOf(map, standings);
	if (canConfirmMap(tally)) return null;
	return { refusal: mapConfirmationHeldBack(tally) };
}

async function keepConfirmation(service: SupabaseClient, versionId: string, accountId: string): Promise<boolean> {
	const { error } = await service.from('workflow_map_confirmations').insert({ version_id: versionId, confirmed_by: accountId });
	if (error?.code === uniqueViolation) return false;
	if (error) throw error;
	return true;
}

async function tellYbt(service: SupabaseClient, confirmer: MapConfirmer, confirmed: ConfirmedVersion): Promise<void> {
	const { clientId, accountId, organisationName, siteOrigin } = confirmer;
	const { stage, versionNumber, organisationId } = confirmed;
	await recordClientEvent(service, clientId, 'workflow_map_confirmed', { stage, versionNumber }, accountId);
	const mapUrl = `${siteOrigin}${organisationWorkflowMapPath(organisationId)}`;
	await notifyWorkflowMapConfirmed({ organisationName, stage, versionNumber, mapUrl });
}
