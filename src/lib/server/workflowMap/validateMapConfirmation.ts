import { isRefused, readChoice } from '$lib/server/companyContext/contextText';
import { mapStages, type MapStage } from '$lib/data/workflowMap/workflowMap';
import { readVersionNumber, stationMarkFields } from './validateStationMark';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** The version a client confirms: the stage and number of the map they were shown. */
export type MapConfirmationChoice = { stage: MapStage; versionNumber: number };

/** Reads a confirmation from the portal's form, refusing the first value that does not fit its column. */
export function validateMapConfirmationForm(formData: FormData): MapConfirmationChoice | Refusal {
	return validateMapConfirmation({
		stage: formData.get(stationMarkFields.stage),
		versionNumber: formData.get(stationMarkFields.versionNumber)
	});
}

/** The one check both doors share: the portal's form and the client's Claude through the connector. */
export function validateMapConfirmation(values: Record<string, unknown>): MapConfirmationChoice | Refusal {
	const stage = readChoice(values.stage, mapStages, 'The map');
	if (isRefused(stage)) return stage;
	const versionNumber = readVersionNumber(String(values.versionNumber ?? '').trim());
	if (isRefused(versionNumber)) return versionNumber;
	return { stage, versionNumber };
}
