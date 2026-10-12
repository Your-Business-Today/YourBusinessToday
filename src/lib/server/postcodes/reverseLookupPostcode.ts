import type { Coordinates } from '$lib/data/distance';
import { parsePostcodeLocation, type PostcodeLocation } from './postcodeLocation';
import { postcodesApiOrigin, requestPostcodes } from './postcodesRequest';

const postcodesPath = '/postcodes';
const nearestOnly = 1;

/** The postcode nearest a point on the ground, or null out at sea or past the limit postcodes.io searches. */
export async function reverseLookupPostcode(point: Coordinates): Promise<PostcodeLocation | null> {
	const url = new URL(postcodesPath, postcodesApiOrigin);
	url.searchParams.set('lat', String(point.latitude));
	url.searchParams.set('lon', String(point.longitude));
	url.searchParams.set('limit', String(nearestOnly));
	const body = await requestPostcodes(url);
	const results = Array.isArray(body.result) ? body.result : [];
	return parsePostcodeLocation(results[0]);
}
