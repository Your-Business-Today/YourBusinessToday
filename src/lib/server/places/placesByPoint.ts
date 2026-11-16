import { reverseLookupPostcodes } from '$lib/server/postcodes/reverseLookupPostcodes';
import type { PlaceSeed } from '$lib/data/placeRules';

/** The postcode nearest the point of each place whose listing gives none, by the place's id; a place with no postcode near it is not named. */
export type NearestPostcodes = Map<string, string>;

/** The postcode nearest each place's point, asked of postcodes.io a hundred points a request. */
export async function nearestPostcodesOf(places: PlaceSeed[]): Promise<NearestPostcodes> {
	const points = places.map(({ latitude, longitude }) => ({ latitude, longitude }));
	const nearest = await reverseLookupPostcodes(points);
	const nearestPostcodes: NearestPostcodes = new Map();
	places.forEach((place, index) => {
		const location = nearest[index] ?? null;
		if (location !== null) nearestPostcodes.set(place.sourceId, location.postcode);
	});
	return nearestPostcodes;
}
