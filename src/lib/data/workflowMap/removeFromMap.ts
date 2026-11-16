import { countOf } from '../countOf';
import {
	arrivalWords,
	handoverWords,
	isSameArrival,
	isSameHandover,
	lineOfStation,
	lineWithKey,
	lineWords,
	stationWords,
	type AmendingMap,
	type AmendingStep
} from './amendingMap';
import type { MapRemovals } from './workflowMapAmendment';

/** Takes off the hand-overs and arrivals named, refusing one the map does not hold. */
export function removeLinks(map: AmendingMap, { handovers, arrivals }: MapRemovals): AmendingStep {
	for (const ends of handovers) {
		const isHeld = map.handovers.some((handover) => isSameHandover(handover, ends));
		if (!isHeld)
			return {
				refusal: `The map holds no ${handoverWords(ends)} to remove: read_workflow_map lists its hand-overs.`
			};
		map.handovers = map.handovers.filter((handover) => !isSameHandover(handover, ends));
		map.removed.push(handoverWords(ends));
	}
	for (const at of arrivals) {
		const isHeld = map.arrivals.some((arrival) => isSameArrival(arrival, at));
		if (!isHeld)
			return {
				refusal: `The map holds no ${arrivalWords(at)} to remove: read_workflow_map lists its arrivals.`
			};
		map.arrivals = map.arrivals.filter((arrival) => !isSameArrival(arrival, at));
		map.removed.push(arrivalWords(at));
	}
	return null;
}

/** Takes off the stations named, each with the hand-overs and arrivals that touch it. */
export function removeStations(map: AmendingMap, stationKeys: string[]): AmendingStep {
	for (const stationKey of stationKeys) {
		const line = lineOfStation(map, stationKey);
		if (line === undefined)
			return {
				refusal: `The map holds no ${stationWords(stationKey)} to remove.`
			};
		line.stations = line.stations.filter((station) => station.key !== stationKey);
		map.removed.push(stationWords(stationKey));
		removeLinksOfStation(map, stationKey);
	}
	return null;
}

function removeLinksOfStation(map: AmendingMap, stationKey: string): void {
	const touches = (ends: { fromKey: string; toKey: string }) => ends.fromKey === stationKey || ends.toKey === stationKey;
	const handoversGone = map.handovers.filter(touches);
	const arrivalsGone = map.arrivals.filter((arrival) => arrival.stationKey === stationKey);
	map.handovers = map.handovers.filter((handover) => !touches(handover));
	map.arrivals = map.arrivals.filter((arrival) => arrival.stationKey !== stationKey);
	const linksGone = [...handoversGone.map(handoverWords), ...arrivalsGone.map(arrivalWords)];
	map.removedWith.push(...linksGone);
}

/** Takes off the lines named, refusing one that still holds stations: remove or move them first. */
export function removeLines(map: AmendingMap, lineKeys: string[]): AmendingStep {
	for (const lineKey of lineKeys) {
		const line = lineWithKey(map, lineKey);
		if (line === undefined) return { refusal: `The map holds no ${lineWords(lineKey)} to remove.` };
		const { stations } = line;
		const stationCount = stations.length;
		if (stationCount > 0)
			return {
				refusal:
					`The ${lineWords(lineKey)} still holds ${countOf(stationCount, 'station')}: remove or move them to another line ` +
					'in the same amendment before removing the line.'
			};
		map.lines = map.lines.filter((kept) => kept.key !== lineKey);
		map.removed.push(lineWords(lineKey));
	}
	return null;
}
