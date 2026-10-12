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
import { readRegisterForPatch, readRegisterLoadState } from '$lib/server/register/readRegisterForPatch';
import type { Patch } from './patchRecord';
import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';
import type { Premises } from '$lib/server/premises/premisesRecord';
import type { FiledFigures } from '$lib/data/filedFigures';
import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';
import { standingLine } from '$lib/data/standingLine';

/** A patch drawn: every register company in it as at the last file, and the clients we already hold there. */
export type PatchMap = {
	centre: PostcodeLocation;
	radiusMiles: number;
	pins: AreaPin[];
	asAtMonth: string | null;
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
	const [companies, standings, loadState, clientPins, postcodesToGeocode, sightings, premises] = await Promise.all([
		readRegisterForPatch(supabase, patch.id),
		readEveryStanding(supabase),
		readRegisterLoadState(supabase, patch.outcodes),
		findRegisterAround(supabase, centre, patch.radiusMiles),
		countRegisterPostcodesToGeocode(supabase),
		listSightingsForPatch(supabase, patch.outcodes),
		listPremisesForPatch(supabase, patch.outcodes)
	]);
	const register = pinsForRegister(companies, centre, patch.radiusMiles, standings);
	const [sightingPins, premisesPins] = await Promise.all([pinsForSightings(supabase, sightings, centre), pinsForPremises(supabase, premises, centre)]);
	return {
		centre,
		radiusMiles: patch.radiusMiles,
		pins: mergePins([...sightingPins, ...premisesPins, ...register.pins], clientPins).sort(byDistance),
		asAtMonth: loadState.asAtMonth,
		premises,
		figuresByCompanyNumber: figuresOf(companies),
		standingByCompanyNumber: standingOf(companies),
		sightingCount: sightings.length,
		companyCount: register.companyCount,
		hubCount: register.hubCount,
		nonTradingCount: register.nonTradingCount,
		postcodesToGeocode
	};
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
