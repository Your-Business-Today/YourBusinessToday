import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { lineKind, lineKinds, mapStages } from '$lib/data/workflowMap/workflowMap';
import { fieldsOf, isRefused, readChoice, readRequiredText } from '$lib/server/filing/filedText';
import { readEach, readHandoverEnds } from './readEachOnMap';
import { readMapKey } from './readMapWords';
import { validateArrivalWords } from './validateMapArrivals';
import { readHandoverWords } from './validateMapHandovers';
import { validateMapRemovals } from './validateMapRemovals';
import { validateMapStation } from './validateMapStation';
import type { MapArrival, MapHandover } from '$lib/data/workflowMap/workflowMap';
import type { LinePut, StationPut, WorkflowMapAmendment } from '$lib/data/workflowMap/workflowMapAmendment';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Reads one amendment from a connector call, every value checked against its column before anything is applied. */
export function validateMapAmendment(input: Record<string, unknown>): WorkflowMapAmendment | Refusal {
	const stage = readChoice(input.stage, mapStages, 'stage');
	if (isRefused(stage)) return stage;
	const lines = readEach(input.lines, { most: limits.mostLines, field: 'lines', label: 'Line' }, readLinePut);
	if (isRefused(lines)) return lines;
	const stations = readEach(input.stations, { most: limits.mostStations, field: 'stations', label: 'Station' }, readStationPut);
	if (isRefused(stations)) return stations;
	const handovers = readEach(input.handovers, { most: limits.mostHandovers, field: 'handovers', label: 'Hand-over' }, readHandover);
	if (isRefused(handovers)) return handovers;
	const arrivals = readEach(input.arrivals, { most: limits.mostArrivals, field: 'arrivals', label: 'Arrival' }, readArrival);
	if (isRefused(arrivals)) return arrivals;
	const remove = validateMapRemovals(input);
	if (isRefused(remove)) return remove;
	return { stage, lines, stations, handovers, arrivals, remove };
}

function readLinePut(candidate: unknown, label: string): LinePut | Refusal {
	const fields = fieldsOf(candidate);
	const key = readMapKey(fields.key, `${label} key`);
	if (isRefused(key)) return key;
	const name = readRequiredText(fields.name, {
		field: `Line "${key}" name`,
		limit: limits.nameLength
	});
	if (isRefused(name)) return name;
	const kind = readChoice(fields.kind ?? lineKind.role, lineKinds, `Line "${key}" kind`);
	if (isRefused(kind)) return kind;
	return { key, name, kind };
}

function readStationPut(candidate: unknown, label: string): StationPut | Refusal {
	const fields = fieldsOf(candidate);
	const station = validateMapStation(candidate, label);
	if (isRefused(station)) return station;
	const lineKey = readOptionalKey(fields.lineKey, `Station "${station.key}" lineKey`);
	if (isRefused(lineKey)) return lineKey;
	const afterKey = readOptionalKey(fields.afterKey, `Station "${station.key}" afterKey`);
	if (isRefused(afterKey)) return afterKey;
	return { station, lineKey, afterKey };
}

function readHandover(candidate: unknown, label: string): MapHandover | Refusal {
	const ends = readHandoverEnds(candidate, label);
	if (isRefused(ends)) return ends;
	const words = readHandoverWords(fieldsOf(candidate), label);
	if (isRefused(words)) return words;
	return { ...ends, ...words };
}

function readArrival(candidate: unknown, label: string): MapArrival | Refusal {
	const fields = fieldsOf(candidate);
	const stationKey = readMapKey(fields.stationKey, `${label} stationKey`);
	if (isRefused(stationKey)) return stationKey;
	const words = validateArrivalWords(fields, label);
	if (isRefused(words)) return words;
	return { stationKey, ...words };
}

function readOptionalKey(value: unknown, field: string): string | null | Refusal {
	if (value === undefined || value === null || value === '') return null;
	return readMapKey(value, field);
}
