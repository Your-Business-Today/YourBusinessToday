import type { SupabaseClient } from '@supabase/supabase-js';
import { byDistance, mergePins, type AreaPin } from '$lib/server/clients/area/areaPin';
import { countRegisterPostcodesToGeocode } from '$lib/server/register/geocodeRegisterPostcodes';
import { findRegisterAround } from '$lib/server/clients/area/findRegisterAround';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { pinsForRegister } from '$lib/server/register/registerPins';
import { readEveryStanding } from '$lib/server/clients/area/findRegisterStanding';
import { readRegisterForPatch, readRegisterLoadState } from '$lib/server/register/readRegisterForPatch';
import type { Patch } from './patchRecord';
import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';

/** A patch drawn: every register company in it as at the last file, and the clients we already hold there. */
export type PatchMap = {
	centre: PostcodeLocation;
	radiusMiles: number;
	pins: AreaPin[];
	asAtMonth: string | null;
	companyCount: number;
	hubCount: number;
	nonTradingCount: number;
	postcodesToGeocode: number;
};

export async function mapPatch(supabase: SupabaseClient, patch: Patch): Promise<PatchMap | null> {
	const located = await geocodePostcodes(supabase, [patch.centrePostcode]);
	const centre = located.get(patch.centrePostcode);
	if (centre === undefined) return null;
	const [companies, standings, loadState, clientPins, postcodesToGeocode] = await Promise.all([
		readRegisterForPatch(supabase, patch.id),
		readEveryStanding(supabase),
		readRegisterLoadState(supabase, patch.outcodes),
		findRegisterAround(supabase, centre, patch.radiusMiles),
		countRegisterPostcodesToGeocode(supabase)
	]);
	const register = pinsForRegister(companies, centre, patch.radiusMiles, standings);
	return {
		centre,
		radiusMiles: patch.radiusMiles,
		pins: mergePins(register.pins, clientPins).sort(byDistance),
		asAtMonth: loadState.asAtMonth,
		companyCount: register.companyCount,
		hubCount: register.hubCount,
		nonTradingCount: register.nonTradingCount,
		postcodesToGeocode
	};
}
