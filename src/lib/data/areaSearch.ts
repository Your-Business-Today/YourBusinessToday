import { parseRadiusMiles, type RadiusMiles } from '$lib/data/mapRadii';
import { postcodeIn } from './postcode';
import { readSicCodeList } from './sicCodes';

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
