import { juneWorkflowMapInput } from '$lib/server/workflowMap/juneMap/juneWorkflowMap';
import { validateWorkflowMap } from '$lib/server/workflowMap/validateWorkflowMap';
import { mapStage, stationState, type MapStation, type WorkflowMapDraft, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

export const portalProductId = '5d1e0c4a-0000-4000-8000-00000000a11d';
export const productNames = { [portalProductId]: 'JPMS portal' };

const filedAt = '2026-11-13T05:00:00Z';
const ourStations = ['work-order-award', 'insurance-cis-checks'];
const plannedStations = ['settlement-vat'];

function juneDraft(): WorkflowMapDraft {
	const draft = validateWorkflowMap(juneWorkflowMapInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	return draft;
}

const awardThings = { takesInThings: ['compliance-record'], producesThings: ['work-order', 'subcontractor'] };

function afterStation(station: MapStation): MapStation {
	if (station.key === ourStations[0]) return { ...station, ...awardThings, state: stationState.ours, productId: portalProductId };
	if (ourStations.includes(station.key)) return { ...station, state: stationState.ours, productId: portalProductId };
	if (plannedStations.includes(station.key)) return { ...station, state: stationState.planned, productId: portalProductId };
	return station;
}

/** The June map of Jewel Bespoke Build as its Before, read back as the page reads it. */
export function juneBefore(): WorkflowMapVersion {
	return { ...juneDraft(), versionNumber: 1, recordedAt: filedAt };
}

/** The same map with two tasks in the portal, one planned, and the compliance hand-over going right. */
export function juneAfter(): WorkflowMapVersion {
	const before = juneBefore();
	return {
		...before,
		stage: mapStage.after,
		lines: before.lines.map((line) => ({ ...line, stations: line.stations.map(afterStation) })),
		handovers: before.handovers.map((handover) => ({ ...handover, goesWrong: null }))
	};
}
