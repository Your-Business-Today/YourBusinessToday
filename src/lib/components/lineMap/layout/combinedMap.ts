import type { LineMapModel, MapHandover, MapLine } from './lineMapModel';

function mergedStops(first: string[], second: string[]): string[] {
	const merged = [...first];
	second.forEach((stationId, index) => {
		if (merged.includes(stationId)) return;
		const previous = second.slice(0, index).findLast((earlier) => merged.includes(earlier));
		merged.splice(previous === undefined ? 0 : merged.indexOf(previous) + 1, 0, stationId);
	});
	return merged;
}

function mergedLines(maps: LineMapModel[]): MapLine[] {
	const lines = new Map<string, MapLine>();
	maps.flatMap((map) => map.lines).forEach((line) => {
		const known = lines.get(line.id);
		lines.set(line.id, known === undefined ? line : { ...line, stops: mergedStops(known.stops, line.stops) });
	});
	return [...lines.values()];
}

const handoverKey = (handover: MapHandover) => `${handover.from}→${handover.to}`;

export function combinedMap(maps: LineMapModel[]): LineMapModel {
	const handovers = new Map(maps.flatMap((map) => map.handovers).map((handover) => [handoverKey(handover), handover]));
	return {
		lines: mergedLines(maps),
		stations: Object.assign({}, ...maps.map((map) => map.stations)),
		handovers: [...handovers.values()]
	};
}

export function isSameHandover(first: MapHandover, second: MapHandover): boolean {
	return handoverKey(first) === handoverKey(second);
}
