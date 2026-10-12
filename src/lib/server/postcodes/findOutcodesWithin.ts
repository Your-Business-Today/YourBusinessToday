import type { Coordinates } from '$lib/data/distance';
import { postcodesApiOrigin, requestPostcodes } from './postcodesRequest';

const outcodesPath = '/outcodes';
/** The most outcodes postcodes.io lists around a point; a radius that reaches it is too wide to lay out. */
export const mostOutcodes = 100;
const widestRadiusMetres = 25_000;

export async function findOutcodesWithin(centre: Coordinates, radiusMetres: number): Promise<string[]> {
	const url = new URL(outcodesPath, postcodesApiOrigin);
	url.searchParams.set('lat', String(centre.latitude));
	url.searchParams.set('lon', String(centre.longitude));
	url.searchParams.set('radius', String(Math.min(radiusMetres, widestRadiusMetres)));
	url.searchParams.set('limit', String(mostOutcodes));
	const body = await requestPostcodes(url);
	const results = Array.isArray(body.result) ? (body.result as Record<string, unknown>[]) : [];
	return results.map((result) => String(result.outcode ?? '')).filter((outcode) => outcode !== '');
}
