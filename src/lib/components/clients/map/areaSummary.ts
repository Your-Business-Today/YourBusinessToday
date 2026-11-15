import type { AreaMap } from '$lib/server/clients/area/mapArea';
import type { AreaSearch } from '$lib/data/areaSearch';

/** More companies than anyone will look through one by one: the point at which the page asks for a type of business. */
export const crowdedAreaHits = 1000;

export function isCrowdedArea(area: AreaMap, search: AreaSearch): boolean {
	const { sicCodes } = search;
	const isUnfiltered = sicCodes.length === 0;
	return isUnfiltered && area.companiesHouseHits > crowdedAreaHits;
}

export const companiesHouseKeyNote =
	'Companies House search needs COMPANIES_HOUSE_API_KEY on the server; until then the map shows the register only.';

/** The sentence above the map: how many companies are within the radius, where from, and how many we already hold. */
export function describeAreaSummary(area: AreaMap): string {
	const { pins, centre, radiusMiles } = area;
	const heldCount = pins.filter((pin) => pin.standing !== null).length;
	const within = `${pins.length} compan${pins.length === 1 ? 'y' : 'ies'} within ${radiusMiles} mile${radiusMiles === 1 ? '' : 's'} of ${centre.postcode}`;
	const onRegister = `${heldCount} already on the register`;
	if (!area.isSearchedOnCompaniesHouse) return `${within}, all from our register — ${onRegister}.`;
	if (area.companiesHouseHits > pins.length) {
		return `${within} (Companies House holds ${area.companiesHouseHits} around here; the nearest are shown — choose a type of business or a smaller radius to see the rest) — ${onRegister}.`;
	}
	return `${within} — ${onRegister}.`;
}
