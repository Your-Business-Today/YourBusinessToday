import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { fieldsOf, isRefused, readList, readOptionalText, readRequiredText } from '$lib/server/companyContext/contextText';
import type { MapHandover, MapLine } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

type Ends = Pick<MapHandover, 'fromKey' | 'toKey'>;

/** Every hand-over: from a station of this version to a station on another line, each pair once. */
export function validateMapHandovers(value: unknown, lines: MapLine[]): MapHandover[] | Refusal {
	const candidates = readList(value, limits.mostHandovers, 'handovers');
	if (isRefused(candidates)) return candidates;
	const lineOfStation = lineKeysByStation(lines);
	const handovers: MapHandover[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const handover = validateMapHandover(candidate, `Hand-over ${index + 1}`, lineOfStation);
		if (isRefused(handover)) return handover;
		const isRepeated = handovers.some((earlier) => isSamePair(earlier, handover));
		if (isRepeated) return { refusal: `Hand-over ${index + 1} repeats ${handover.fromKey} to ${handover.toKey}: give each once.` };
		handovers.push(handover);
	}
	return handovers;
}

function validateMapHandover(candidate: unknown, label: string, lineOfStation: Map<string, string>): MapHandover | Refusal {
	const fields = fieldsOf(candidate);
	const ends = readEnds(fields, label, lineOfStation);
	if (isRefused(ends)) return ends;
	const handedOver = readRequiredText(fields.handedOver, { field: `${label} handedOver`, limit: limits.handedOverLength });
	if (isRefused(handedOver)) return handedOver;
	const goesWrong = readOptionalText(fields.goesWrong, { field: `${label} goesWrong`, limit: limits.goesWrongLength });
	if (isRefused(goesWrong)) return goesWrong;
	return { ...ends, handedOver, goesWrong };
}

function readEnds(fields: Record<string, unknown>, label: string, lineOfStation: Map<string, string>): Ends | Refusal {
	const fromKey = String(fields.fromKey ?? '').trim();
	const toKey = String(fields.toKey ?? '').trim();
	const givingLine = lineOfStation.get(fromKey);
	if (givingLine === undefined) return { refusal: `${label} fromKey "${fromKey}" is not the key of a station on this map.` };
	const receivingLine = lineOfStation.get(toKey);
	if (receivingLine === undefined) return { refusal: `${label} toKey "${toKey}" is not the key of a station on this map.` };
	if (givingLine === receivingLine)
		return { refusal: `${label} joins two stations of the line "${givingLine}": a hand-over goes to another line.` };
	return { fromKey, toKey };
}

function lineKeysByStation(lines: MapLine[]): Map<string, string> {
	return new Map(lines.flatMap((line) => line.stations.map((station) => [station.key, line.key] as const)));
}

function isSamePair(earlier: Ends, later: Ends): boolean {
	return earlier.fromKey === later.fromKey && earlier.toKey === later.toKey;
}
