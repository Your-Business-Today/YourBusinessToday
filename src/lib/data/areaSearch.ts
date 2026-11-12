import { defaultRadiusMiles, parseRadiusMiles, radiusOrder, type RadiusMiles } from '$lib/data/mapRadii';
import { postcodeIn } from './postcode';
import { isSicCode, readSicCodeList } from './sicCodes';

export type AreaSearch = { postcode: string; radiusMiles: RadiusMiles; sicCodes: string[] };

export function readAreaSearch(searchParams: URLSearchParams): AreaSearch | null {
	const postcode = postcodeIn(searchParams.get('postcode') ?? '');
	if (postcode === '') return null;
	return {
		postcode,
		radiusMiles: parseRadiusMiles(searchParams.get('radiusMiles')),
		sicCodes: readSicCodeList(searchParams.get('sicCodes') ?? '')
	};
}

export function describeAreaSearchQuery(search: AreaSearch): string {
	const query = new URLSearchParams({
		postcode: search.postcode,
		radiusMiles: String(search.radiusMiles),
		sicCodes: search.sicCodes.join(',')
	});
	return query.toString();
}

export const areaSearchRefusals = {
	postcode: 'postcode must be a UK postcode, such as SW1A 1AA.',
	radiusMiles: `radiusMiles is one of ${radiusOrder.join(', ')} miles; leave it out for ${defaultRadiusMiles}.`,
	sicCodes: 'sicCodes are five-digit SIC codes separated by commas, such as 43210, 43220.'
} as const;

/** The search a connector call gives, or the sentence naming the first value that does not fit; nothing is corrected quietly. */
export function validateAreaSearch(values: Record<string, unknown>): AreaSearch | string {
	const postcode = postcodeIn(String(values.postcode ?? ''));
	if (postcode === '') return areaSearchRefusals.postcode;
	const radiusMiles = readRadius(values.radiusMiles);
	if (radiusMiles === null) return areaSearchRefusals.radiusMiles;
	const sicCodes = readSicCodeList(String(values.sicCodes ?? ''));
	if (!sicCodes.every(isSicCode)) return areaSearchRefusals.sicCodes;
	return { postcode, radiusMiles, sicCodes };
}

function readRadius(value: unknown): RadiusMiles | null {
	if (value === undefined || value === null || value === '') return defaultRadiusMiles;
	return radiusOrder.find((radius) => radius === Number(value)) ?? null;
}
