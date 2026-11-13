import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { isRefused, readList } from '$lib/server/companyContext/contextText';
import { validateMapLine } from './validateMapLine';
import type { MapLine } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Every line of a version: at least one, each key once, and each station's key once across the whole map. */
export function validateMapLines(value: unknown): MapLine[] | Refusal {
	const candidates = readList(value, limits.mostLines, 'lines');
	if (isRefused(candidates)) return candidates;
	if (candidates.length === 0) return { refusal: 'lines is missing: give every role, each with its stations.' };
	const lines: MapLine[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const line = validateMapLine(candidate, index + 1);
		if (isRefused(line)) return line;
		const isRepeated = lines.some((earlier) => earlier.key === line.key);
		if (isRepeated) return { refusal: `Line ${index + 1} repeats the key "${line.key}": give each line once.` };
		lines.push(line);
	}
	return refuseStationsAcrossLines(lines) ?? lines;
}

function refuseStationsAcrossLines(lines: MapLine[]): Refusal | null {
	const stationKeys = lines.flatMap((line) => line.stations.map((station) => station.key));
	if (stationKeys.length > limits.mostStations)
		return { refusal: `The map holds ${stationKeys.length} stations: keep it to ${limits.mostStations}.` };
	const repeatedKey = stationKeys.find((key, index) => stationKeys.indexOf(key) !== index);
	if (repeatedKey === undefined) return null;
	return { refusal: `The station key "${repeatedKey}" is given twice: a station sits on one line, once.` };
}
