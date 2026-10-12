import type { Coordinates } from '$lib/data/distance';
import { parsePostcodeLocation, type PostcodeLocation } from './postcodeLocation';
import { postcodesApiOrigin, requestPostcodes } from './postcodesRequest';

const postcodesPath = '/postcodes';
const nearestOnly = 1;
const searchWidely = 'true';

/** The postcode nearest a point on the ground, searched widely so a click on a park or a field still finds one; null out at sea. */
export async function reverseLookupPostcode(point: Coordinates): Promise<PostcodeLocation | null> {
	const url = new URL(postcodesPath, postcodesApiOrigin);
	url.searchParams.set('lat', String(point.latitude));
	url.searchParams.set('lon', String(point.longitude));
	url.searchParams.set('limit', String(nearestOnly));
	url.searchParams.set('wideSearch', searchWidely);
	const body = await requestPostcodes(url);
	const results = Array.isArray(body.result) ? body.result : [];
	return parsePostcodeLocation(results[0]);
}
