import type { AreaMap } from '$lib/server/clients/area/mapArea';

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
		return `${within} (Companies House holds ${area.companiesHouseHits} around here; the nearest are shown — narrow with SIC codes or a smaller radius to see the rest) — ${onRegister}.`;
	}
	return `${within} — ${onRegister}.`;
}
