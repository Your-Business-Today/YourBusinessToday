import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { fieldsOf, isRefused, readRequiredText } from '$lib/server/filing/filedText';
import { readMapKey } from './readMapWords';
import { readEach, readHandoverEnds } from './readEachOnMap';
import type { ArrivalAt, MapRemovals } from '$lib/data/workflowMap/workflowMapAmendment';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** What an amendment takes off the map, each named by its key and checked against the shape of a key. */
export function validateMapRemovals(input: Record<string, unknown>): MapRemovals | Refusal {
	const stationKeys = readEach(
		input.removeStations,
		{
			most: limits.mostStations,
			field: 'removeStations',
			label: 'Station to remove'
		},
		readMapKey
	);
	if (isRefused(stationKeys)) return stationKeys;
	const lineKeys = readEach(input.removeLines, { most: limits.mostLines, field: 'removeLines', label: 'Line to remove' }, readMapKey);
	if (isRefused(lineKeys)) return lineKeys;
	const handoverList = {
		most: limits.mostHandovers,
		field: 'removeHandovers',
		label: 'Hand-over to remove'
	};
	const handovers = readEach(input.removeHandovers, handoverList, readHandoverEnds);
	if (isRefused(handovers)) return handovers;
	const arrivalList = {
		most: limits.mostArrivals,
		field: 'removeArrivals',
		label: 'Arrival to remove'
	};
	const arrivals = readEach(input.removeArrivals, arrivalList, readArrivalAt);
	if (isRefused(arrivals)) return arrivals;
	return { stationKeys, lineKeys, handovers, arrivals };
}

function readArrivalAt(candidate: unknown, label: string): ArrivalAt | Refusal {
	const fields = fieldsOf(candidate);
	const stationKey = readMapKey(fields.stationKey, `${label} stationKey`);
	if (isRefused(stationKey)) return stationKey;
	const whatArrives = readRequiredText(fields.whatArrives, {
		field: `${label} whatArrives`,
		limit: limits.whatArrivesLength
	});
	if (isRefused(whatArrives)) return whatArrives;
	return { stationKey, whatArrives };
}
