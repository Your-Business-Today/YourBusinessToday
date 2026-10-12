import type { SupabaseClient } from '@supabase/supabase-js';
import { distanceInMiles, type Coordinates } from '$lib/data/distance';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { oneCompany } from '$lib/data/registerRules';
import { premisesKeyPrefix } from '$lib/data/premisesKeys';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { Premises } from './premisesRecord';

/** A premises is pinned at the agency's own geocode, or at its postcode through the cache when the agency gave none. */
export async function pinsForPremises(supabase: SupabaseClient, premises: Premises[], centre: Coordinates): Promise<AreaPin[]> {
	const ungeocoded = premises.filter((one) => one.latitude === null || one.longitude === null);
	const located = await geocodePostcodes(supabase, ungeocoded.map((one) => one.postcode));
	return premises.flatMap((one) => {
		const location = locationOf(one, located);
		if (location === null) return [];
		return [premisesPin(one, location, centre)];
	});
}

function locationOf(premises: Premises, located: Map<string, Coordinates>): Coordinates | null {
	const { latitude, longitude } = premises;
	if (latitude !== null && longitude !== null) return { latitude, longitude };
	return located.get(premises.postcode) ?? null;
}

function premisesPin(premises: Premises, location: Coordinates, centre: Coordinates): AreaPin {
	return {
		key: `${premisesKeyPrefix}${premises.id}`,
		companyNumber: '',
		name: premises.businessName,
		address: premises.address,
		postcode: premises.postcode,
		incorporatedOn: '',
		sicCodes: [],
		latitude: location.latitude,
		longitude: location.longitude,
		distanceMiles: distanceInMiles(centre, location),
		standing: null,
		companyCount: oneCompany,
		isNonTrading: false,
		isSighting: false,
		isPremises: true,
		statusNote: ''
	};
}
