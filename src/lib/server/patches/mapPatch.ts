import type { SupabaseClient } from '@supabase/supabase-js';
import { byDistance, mergePins, type AreaPin } from '$lib/server/clients/area/areaPin';
import { countRegisterPostcodesToGeocode } from '$lib/server/register/geocodeRegisterPostcodes';
import { findRegisterAround } from '$lib/server/clients/area/findRegisterAround';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { listPremisesForPatch } from '$lib/server/premises/listPremisesForPatch';
import { listSightingsForPatch } from '$lib/server/sightings/listSightings';
import { pinsForPremises } from '$lib/server/premises/premisesPins';
import { pinsForSightings } from '$lib/server/sightings/sightingPins';
import { pinsForRegister } from '$lib/server/register/registerPins';
import { readEveryStanding } from '$lib/server/clients/area/findRegisterStanding';
import { countRegisterCompaniesIn, readRegisterForPatch } from '$lib/server/register/readRegisterForPatch';
import type { Patch } from './patchRecord';
import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';
import type { Premises } from '$lib/server/premises/premisesRecord';
import type { FiledFigures } from '$lib/data/filedFigures';
import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';
import { standingLine } from '$lib/data/standingLine';

/**
 * A patch drawn: every register company placed in it, and the clients we already hold there. The register is as at the
 * latest month any of those companies was seen, however they came to be held, and null while none is placed.
 */
export type PatchMap = {
	centre: PostcodeLocation;
	radiusMiles: number;
	pins: AreaPin[];
	asAtMonth: string | null;
	companiesHeld: number;
	premises: Premises[];
	figuresByCompanyNumber: Record<string, FiledFigures>;
	standingByCompanyNumber: Record<string, string>;
	sightingCount: number;
	companyCount: number;
	hubCount: number;
	nonTradingCount: number;
	postcodesToGeocode: number;
};

export async function mapPatch(supabase: SupabaseClient, patch: Patch): Promise<PatchMap | null> {
	const located = await geocodePostcodes(supabase, [patch.centrePostcode]);
	const centre = located.get(patch.centrePostcode);
	if (centre === undefined) return null;
	const [companies, standings, companiesHeld, clientPins, postcodesToGeocode, sightings, premises] = await Promise.all([
		readRegisterForPatch(supabase, patch.id),
		readEveryStanding(supabase),
		countRegisterCompaniesIn(supabase, patch.outcodes),
		findRegisterAround(supabase, centre, patch.radiusMiles),
		countRegisterPostcodesToGeocode(supabase),
		listSightingsForPatch(supabase, patch.outcodes),
		listPremisesForPatch(supabase, patch.outcodes)
	]);
	const { pins: registerPins, ...registerCounts } = pinsForRegister(companies, centre, patch.radiusMiles, standings);
	const [sightingPins, premisesPins] = await Promise.all([pinsForSightings(supabase, sightings, centre), pinsForPremises(supabase, premises, centre)]);
	return {
		centre,
		radiusMiles: patch.radiusMiles,
		pins: mergePins([...sightingPins, ...premisesPins, ...registerPins], clientPins).sort(byDistance),
		asAtMonth: latestMonthSeen(companies),
		companiesHeld,
		premises,
		figuresByCompanyNumber: figuresOf(companies),
		standingByCompanyNumber: standingOf(companies),
		sightingCount: sightings.length,
		...registerCounts,
		postcodesToGeocode
	};
}

function latestMonthSeen(companies: LocatedRegisterCompany[]): string | null {
	const months = companies.map((company) => company.lastSeenMonth).sort();
	return months.at(-1) ?? null;
}

/** The filed figures of every company that has some, by number, for the panel to show. */
function figuresOf(companies: LocatedRegisterCompany[]): Record<string, FiledFigures> {
	return Object.fromEntries(companies.flatMap((company) => (company.figures === null ? [] : [[company.companyNumber, company.figures]])));
}

/** One sentence on where every company with anything known stands, by number. */
function standingOf(companies: LocatedRegisterCompany[]): Record<string, string> {
	const lines = companies.map((company) => [company.companyNumber, standingLine(company)] as const);
	return Object.fromEntries(lines.filter(([, line]) => line !== ''));
}
