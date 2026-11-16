import type { MapArrival, MapHandover, MapLine, MapStation, WorkflowMapDraft } from './workflowMap';
import type { AmendmentRefusal, ArrivalAt, HandoverEnds, MapChanges } from './workflowMapAmendment';

/** A version being amended: a copy of the latest one, changed step by step, with what each step did. */
export type AmendingMap = MapChanges & { lines: MapLine[]; handovers: MapHandover[]; arrivals: MapArrival[] };

export type AmendingStep = AmendmentRefusal | null;

export function startAmending(latest: WorkflowMapDraft): AmendingMap {
	const lines = latest.lines.map((line) => ({ ...line, stations: [...line.stations] }));
	const noChanges: MapChanges = { added: [], replaced: [], moved: [], removed: [], removedWith: [] };
	return { lines, handovers: [...latest.handovers], arrivals: [...latest.arrivals], ...noChanges };
}

export function changesOf({ added, replaced, moved, removed, removedWith }: AmendingMap): MapChanges {
	return { added, replaced, moved, removed, removedWith };
}

export function lineOfStation(map: AmendingMap, stationKey: string): MapLine | undefined {
	return map.lines.find((line) => line.stations.some((station) => station.key === stationKey));
}

export function lineWithKey(map: AmendingMap, lineKey: string): MapLine | undefined {
	return map.lines.find((line) => line.key === lineKey);
}

export function isSameHandover(handover: HandoverEnds, ends: HandoverEnds): boolean {
	return handover.fromKey === ends.fromKey && handover.toKey === ends.toKey;
}

export function isSameArrival(arrival: ArrivalAt, at: ArrivalAt): boolean {
	return arrival.stationKey === at.stationKey && arrival.whatArrives === at.whatArrives;
}

/** Two stations hold the same contents when every field reads the same, whatever order the fields were read in. */
export function isSameStation(earlier: MapStation, later: MapStation): boolean {
	const fieldNames = Object.keys(earlier) as (keyof MapStation)[];
	return fieldNames.every((fieldName) => JSON.stringify(earlier[fieldName]) === JSON.stringify(later[fieldName]));
}

export const stationWords = (key: string) => `station "${key}"`;
export const lineWords = (key: string) => `line "${key}"`;
export const handoverWords = ({ fromKey, toKey }: HandoverEnds) => `hand-over ${fromKey} to ${toKey}`;
export const arrivalWords = ({ whatArrives, stationKey }: ArrivalAt) => `arrival of "${whatArrives}" at ${stationKey}`;
