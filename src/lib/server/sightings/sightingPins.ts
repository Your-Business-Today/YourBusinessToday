import type { SupabaseClient } from '@supabase/supabase-js';
import { distanceInMiles, type Coordinates } from '$lib/data/distance';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { oneCompany } from '$lib/data/registerRules';
import { postcodeIn } from '$lib/data/postcode';
import { sightingKeyPrefix } from '$lib/data/sightingKeys';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { Sighting } from './sightingRecord';

/** A sighting with a postcode is pinned at it through the cache; one without is listed but not drawn. */
export async function pinsForSightings(supabase: SupabaseClient, sightings: Sighting[], centre: Coordinates): Promise<AreaPin[]> {
	const located = await geocodePostcodes(supabase, sightings.map((sighting) => sighting.postcode));
	return sightings.flatMap((sighting) => {
		const location = located.get(postcodeIn(sighting.postcode));
		if (location === undefined) return [];
		return [sightingPin(sighting, location, centre)];
	});
}

function sightingPin(sighting: Sighting, location: Coordinates, centre: Coordinates): AreaPin {
	return {
		key: `${sightingKeyPrefix}${sighting.id}`,
		companyNumber: sighting.companyNumber,
		name: sighting.businessName,
		address: sighting.address,
		postcode: sighting.postcode,
		incorporatedOn: '',
		sicCodes: [],
		latitude: location.latitude,
		longitude: location.longitude,
		distanceMiles: distanceInMiles(centre, location),
		standing: null,
		companyCount: oneCompany,
		isNonTrading: false,
		isSighting: true,
		isPremises: false,
		statusNote: ''
	};
}
