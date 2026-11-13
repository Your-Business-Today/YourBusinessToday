import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { fieldsOf, isRefused, readList, readRequiredText } from '$lib/server/filing/filedText';
import type { MapArrival, MapLine } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Everything that arrives from outside the map: each names a station of this version, and each station takes a thing once. */
export function validateMapArrivals(value: unknown, lines: MapLine[]): MapArrival[] | Refusal {
	const candidates = readList(value, limits.mostArrivals, 'arrivals');
	if (isRefused(candidates)) return candidates;
	const stationKeys = new Set(lines.flatMap((line) => line.stations.map((station) => station.key)));
	const arrivals: MapArrival[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const arrival = validateMapArrival(candidate, `Arrival ${index + 1}`, stationKeys);
		if (isRefused(arrival)) return arrival;
		const isRepeated = arrivals.some((earlier) => isSameArrival(earlier, arrival));
		if (isRepeated) return { refusal: `Arrival ${index + 1} repeats "${arrival.whatArrives}" at ${arrival.stationKey}: give each once.` };
		arrivals.push(arrival);
	}
	return arrivals;
}

function validateMapArrival(candidate: unknown, label: string, stationKeys: Set<string>): MapArrival | Refusal {
	const fields = fieldsOf(candidate);
	const whatArrives = readRequiredText(fields.whatArrives, { field: `${label} whatArrives`, limit: limits.whatArrivesLength });
	if (isRefused(whatArrives)) return whatArrives;
	const arrivesFrom = readRequiredText(fields.arrivesFrom, { field: `${label} arrivesFrom`, limit: limits.arrivesFromLength });
	if (isRefused(arrivesFrom)) return arrivesFrom;
	const stationKey = String(fields.stationKey ?? '').trim();
	const isOnTheMap = stationKeys.has(stationKey);
	if (!isOnTheMap) return { refusal: `${label} stationKey "${stationKey}" is not the key of a station on this map: name the station it starts.` };
	return { whatArrives, arrivesFrom, stationKey };
}

function isSameArrival(earlier: MapArrival, later: MapArrival): boolean {
	return earlier.stationKey === later.stationKey && earlier.whatArrives === later.whatArrives;
}
