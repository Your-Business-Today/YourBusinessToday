import { defaultRadiusMiles, parseRadiusMiles, radiusOrder, type RadiusMiles } from '$lib/data/mapRadii';
import { postcodeIn } from './postcode';
import { isBusinessTypeKey, readBusinessTypes, sicCodesOfTypes } from './businessTypes';
import { isSicCode, readSicCodeList } from './sicCodes';

export type AreaSearch = { postcode: string; radiusMiles: RadiusMiles; businessTypeKeys: string[]; sicCodes: string[] };

const businessTypeParameter = 'businessType';

export function readAreaSearch(searchParams: URLSearchParams): AreaSearch | null {
	const postcode = postcodeIn(searchParams.get('postcode') ?? '');
	if (postcode === '') return null;
	const businessTypeKeys = searchParams.getAll(businessTypeParameter).filter(isBusinessTypeKey);
	const typedCodes = readSicCodeList(searchParams.get('sicCodes') ?? '');
	const typeCodes = sicCodesOfTypes(readBusinessTypes(businessTypeKeys));
	return {
		postcode,
		radiusMiles: parseRadiusMiles(searchParams.get('radiusMiles')),
		businessTypeKeys,
		sicCodes: [...new Set([...typedCodes, ...typeCodes])]
	};
}

export function describeAreaSearchQuery(search: AreaSearch): string {
	const query = new URLSearchParams({
		postcode: search.postcode,
		radiusMiles: String(search.radiusMiles),
		sicCodes: search.sicCodes.join(',')
	});
	for (const key of search.businessTypeKeys) query.append(businessTypeParameter, key);
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
	return { postcode, radiusMiles, businessTypeKeys: [], sicCodes };
}

function readRadius(value: unknown): RadiusMiles | null {
	if (value === undefined || value === null || value === '') return defaultRadiusMiles;
	return radiusOrder.find((radius) => radius === Number(value)) ?? null;
}

/** The same postcode and radius, narrowed to one type of business, for a crowded area's suggestions. */
export function narrowedSearchQuery(search: AreaSearch, businessTypeKey: string): string {
	return describeAreaSearchQuery({ ...search, businessTypeKeys: [businessTypeKey], sicCodes: [] });
}
