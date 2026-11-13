import { placedStation } from './placedStation';
import { stationState, type MapHandover, type MapLine, type MapStation, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';
import { changeWords } from './workflowMapWords';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';

/** One row of What changes: a task that moves into a product, or a hand-over that stops going wrong. */
export type MapChange = { key: string; what: string; kind: string; role: string; before: string; after: string };

/** What changes between an organisation's Before and After; nothing until both are filed. */
export function mapChangesBetween({ before, after, productNames }: OrganisationWorkflowMaps): MapChange[] {
	if (before === null || after === null) return [];
	return mapChangesOf(before, after, productNames);
}

/** Everything the After changes from the Before: the tasks first, in the After's order, then the hand-overs. */
export function mapChangesOf(before: WorkflowMapVersion, after: WorkflowMapVersion, productNames: Record<string, string>): MapChange[] {
	const stationChanges = after.lines.flatMap((line) =>
		line.stations
			.filter((station) => movesIntoProduct(before, station))
			.map((station) => stationChangeOf(before, line, station, productNames))
	);
	const handoverChanges = before.handovers.flatMap((handover) => handoverChangesOf(before, after, handover));
	return [...stationChanges, ...handoverChanges];
}

function movesIntoProduct(before: WorkflowMapVersion, station: MapStation): boolean {
	if (station.state === stationState.elsewhere) return false;
	const earlier = placedStation(before, station.key);
	return earlier?.state !== station.state;
}

function stationChangeOf(before: WorkflowMapVersion, line: MapLine, station: MapStation, productNames: Record<string, string>): MapChange {
	const earlier = placedStation(before, station.key);
	const productName = station.productId === null ? null : (productNames[station.productId] ?? null);
	const place = productName ?? station.doneIn ?? changeWords.ourProducts;
	return {
		key: `station:${station.key}`,
		what: station.name,
		kind: changeWords.task,
		role: line.name,
		before: earlier?.doneIn ?? changeWords.notOnTheMap,
		after: `${changeWords.stateLeads[station.state]} ${place}`
	};
}

function handoverChangesOf(before: WorkflowMapVersion, after: WorkflowMapVersion, handover: MapHandover): MapChange[] {
	if (handover.goesWrong === null) return [];
	const later = after.handovers.find(({ fromKey, toKey }) => fromKey === handover.fromKey && toKey === handover.toKey);
	if (later !== undefined && later.goesWrong !== null) return [];
	const giver = placedStation(before, handover.fromKey);
	const receiver = placedStation(before, handover.toKey);
	return [
		{
			key: `handover:${handover.fromKey}:${handover.toKey}`,
			what: handover.handedOver,
			kind: changeWords.handover,
			role: `${giver?.lineName ?? ''} to ${receiver?.lineName ?? ''}`,
			before: handover.goesWrong,
			after: later === undefined ? changeWords.noLongerHandedOver : changeWords.stopsGoingWrong
		}
	];
}
