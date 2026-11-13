import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { fieldsOf, isRefused, readList, readRequiredText } from '$lib/server/companyContext/contextText';
import { readMapKey } from './readMapWords';
import { validateMapStation } from './validateMapStation';
import type { MapLine, MapStation } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** One line as the connector reads it: a role, with its stations in the order they are done. */
export function validateMapLine(candidate: unknown, position: number): MapLine | Refusal {
	const fields = fieldsOf(candidate);
	const key = readMapKey(fields.key, `Line ${position} key`);
	if (isRefused(key)) return key;
	const label = `Line "${key}"`;
	const name = readRequiredText(fields.name, { field: `${label} name`, limit: limits.nameLength });
	if (isRefused(name)) return name;
	const stations = readLineStations(fields.stations, label);
	if (isRefused(stations)) return stations;
	return { key, name, stations };
}

function readLineStations(value: unknown, label: string): MapStation[] | Refusal {
	const candidates = readList(value, limits.mostStationsOnALine, `${label} stations`);
	if (isRefused(candidates)) return candidates;
	if (candidates.length === 0) return { refusal: `${label} has no stations: give the tasks that role does, in order.` };
	const stations: MapStation[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const station = validateMapStation(candidate, `${label} station ${index + 1}`);
		if (isRefused(station)) return station;
		stations.push(station);
	}
	return stations;
}
