import { outcodeOf } from '$lib/data/postcode';
import { validatePlace, type PlaceSeed } from '$lib/data/placeRules';
import type { NearestPostcodes } from './placesByPoint';
import type { Patch } from '$lib/server/patches/patchRecord';

/**
 * A place with the postcode it is found by on the ground: its own when the listing gives one, else the postcode
 * nearest its point. The listing's own postcode is kept as it was listed.
 */
export type GroundedPlace = PlaceSeed & { groundPostcode: string };

/** The trading places of a box sorted for one territory: the ones to write, how many of them were placed by their point, and how many were left out and why. */
export type PlacesSorted = { toWrite: GroundedPlace[]; placedByPointCount: number; refusedCount: number; unplacedCount: number; outsideCount: number };

const noPostcode = '';

/** The places the rules accept, each once: a batch that named one place twice would be refused whole. */
export function fittingPlaces(trading: PlaceSeed[]): PlaceSeed[] {
	const fitting = trading.filter((place) => validatePlace(place) === null);
	return [...new Map(fitting.map((place) => [place.sourceId, place])).values()];
}

/** The places the rules accept whose listing gives no postcode: the ones to be placed by their point. */
export function placesListingNoPostcode(trading: PlaceSeed[]): PlaceSeed[] {
	return fittingPlaces(trading).filter((place) => place.postcode === noPostcode);
}

/**
 * The places a territory is to hold. A place is written when every value fits its column, its licence lets us hold it
 * and the postcode it is found by lies in one of the territory's outcodes. A place whose listing gives no postcode is
 * found by the postcode nearest its point; one with no postcode near it is left out, since a premises is found by its
 * outcode. Each place comes out once, in the order of the ids, so a load cut off part way carries on at the same place.
 */
export function sortPlacesForPatch(trading: PlaceSeed[], patch: Patch, nearest: NearestPostcodes): PlacesSorted {
	const fitting = fittingPlaces(trading);
	const placed = fitting.map((place) => groundedOf(place, nearest)).filter((place) => place.groundPostcode !== noPostcode);
	const toWrite = placed.filter((place) => patch.outcodes.includes(outcodeOf(place.groundPostcode))).sort(bySourceId);
	const placedByPointCount = toWrite.filter((place) => place.postcode === noPostcode).length;
	const leftOut = { refusedCount: trading.length - fitting.length, unplacedCount: fitting.length - placed.length, outsideCount: placed.length - toWrite.length };
	return { toWrite, placedByPointCount, ...leftOut };
}

function groundedOf(place: PlaceSeed, nearest: NearestPostcodes): GroundedPlace {
	const isListed = place.postcode !== noPostcode;
	if (isListed) return { ...place, groundPostcode: place.postcode };
	return { ...place, groundPostcode: nearest.get(place.sourceId) ?? noPostcode };
}

function bySourceId(first: PlaceSeed, second: PlaceSeed): number {
	return first.sourceId.localeCompare(second.sourceId);
}
