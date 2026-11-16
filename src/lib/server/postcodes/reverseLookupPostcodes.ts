import type { Coordinates } from '$lib/data/distance';
import { eachBatchInTurn, inBatches } from '$lib/data/inBatches';
import { parsePostcodeLocation, type PostcodeLocation } from './postcodeLocation';
import { postcodesApiOrigin, requestPostcodes } from './postcodesRequest';

const bulkReversePath = '/postcodes';
const longestBulkReverse = 100;
/** Bulk lookups in flight together, as for the bulk lookup of postcodes: postcodes.io refuses a burst of them all at once. */
const bulkReversesAtOnce = 4;
const nearestOnly = 1;

/**
 * The postcode nearest each point, in the order of the points, searched widely so a point in a park or a car park
 * still finds one; null for a point with no postcode near it. An answer that does not give one entry per point throws,
 * so a point is never counted as having no postcode for want of an answer.
 */
export async function reverseLookupPostcodes(points: Coordinates[]): Promise<(PostcodeLocation | null)[]> {
	return eachBatchInTurn(points, longestBulkReverse * bulkReversesAtOnce, lookupTogether);
}

async function lookupTogether(points: Coordinates[]): Promise<(PostcodeLocation | null)[]> {
	const results = await Promise.all(inBatches(points, longestBulkReverse).map(lookupBatch));
	return results.flat();
}

async function lookupBatch(points: Coordinates[]): Promise<(PostcodeLocation | null)[]> {
	const url = new URL(bulkReversePath, postcodesApiOrigin);
	const geolocations = points.map(({ latitude, longitude }) => ({ longitude, latitude, limit: nearestOnly, wideSearch: true }));
	const body = await requestPostcodes(url, { geolocations });
	const entries = Array.isArray(body.result) ? (body.result as Record<string, unknown>[]) : [];
	if (entries.length !== points.length) throw new Error(`postcodes.io answered ${entries.length} of ${points.length} points`);
	return entries.map(nearestOf);
}

function nearestOf(entry: Record<string, unknown> | null): PostcodeLocation | null {
	const found = entry?.result;
	const [nearest] = Array.isArray(found) ? found : [];
	return parsePostcodeLocation(nearest);
}
