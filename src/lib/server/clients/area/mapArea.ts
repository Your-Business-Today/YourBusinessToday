import type { SupabaseClient } from '@supabase/supabase-js';
import { milesToMetres } from '$lib/data/mapRadii';
import { byDistance, mergePins, pinForCompany, type AreaPin } from './areaPin';
import { findCompaniesAround } from './findCompaniesAround';
import { findOutcodesWithin } from '$lib/server/postcodes/findOutcodesWithin';
import { findRegisterAround } from './findRegisterAround';
import { findRegisterStanding } from './findRegisterStanding';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import type { CompaniesHouseCompany } from '$lib/server/companiesHouse/searchCompaniesHouse';
import { lookupPostcode } from '$lib/server/postcodes/lookupPostcode';
import { postcodeIn } from '$lib/data/postcode';
import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';
import type { AreaSearch } from '$lib/data/areaSearch';

export type AreaMap = {
	centre: PostcodeLocation;
	radiusMiles: number;
	pins: AreaPin[];
	companiesHouseHits: number;
	isSearchedOnCompaniesHouse: boolean;
};

export async function mapArea(supabase: SupabaseClient, search: AreaSearch): Promise<AreaMap | null> {
	const centre = await lookupPostcode(search.postcode);
	if (centre === null) return null;
	const registerPins = await findRegisterAround(supabase, centre, search.radiusMiles);
	if (!isCompaniesHouseConfigured()) return registerOnlyMap(centre, search, registerPins);
	const outcodes = await findOutcodesWithin(centre, milesToMetres(search.radiusMiles));
	const found = await findCompaniesAround(outcodes, search.sicCodes);
	const companyPins = await pinsForCompanies(supabase, found.companies, centre, search.radiusMiles);
	return {
		centre,
		radiusMiles: search.radiusMiles,
		pins: mergePins(companyPins, registerPins).sort(byDistance),
		companiesHouseHits: found.totalHits,
		isSearchedOnCompaniesHouse: true
	};
}

function registerOnlyMap(centre: PostcodeLocation, search: AreaSearch, pins: AreaPin[]): AreaMap {
	return {
		centre,
		radiusMiles: search.radiusMiles,
		pins: pins.sort(byDistance),
		companiesHouseHits: 0,
		isSearchedOnCompaniesHouse: false
	};
}

async function pinsForCompanies(
	supabase: SupabaseClient,
	companies: CompaniesHouseCompany[],
	centre: PostcodeLocation,
	radiusMiles: number
): Promise<AreaPin[]> {
	const [located, standings] = await Promise.all([
		geocodePostcodes(supabase, companies.map((company) => company.postcode)),
		findRegisterStanding(supabase, companies.map((company) => company.companyNumber))
	]);
	return companies
		.flatMap((company) => {
			const location = located.get(postcodeIn(company.postcode));
			if (location === undefined) return [];
			return [pinForCompany(company, location, centre, standings.get(company.companyNumber) ?? null)];
		})
		.filter((pin) => pin.distanceMiles <= radiusMiles);
}
