import { outcodeOf } from '$lib/data/postcode';
import { validatePlace, type PlaceSeed } from '$lib/data/placeRules';
import type { Patch } from '$lib/server/patches/patchRecord';

/** The trading places of a box sorted for one territory: the ones to write, and how many were left out and why. */
export type PlacesSorted = { toWrite: PlaceSeed[]; refusedCount: number; unplacedCount: number; outsideCount: number };

const noPostcode = '';

/**
 * The places a territory is to hold. A place is written when every value fits its column, its licence lets us hold it
 * and its postcode lies in one of the territory's outcodes. One with no postcode is left out: a premises is found by
 * its outcode, so one with none would be written where nobody could read it. Each place comes out once, in the order
 * of the ids, so a load cut off part way carries on at the same place.
 */
export function sortPlacesForPatch(trading: PlaceSeed[], patch: Patch): PlacesSorted {
	const fitting = onePerId(trading.filter((place) => validatePlace(place) === null));
	const placed = fitting.filter((place) => place.postcode !== noPostcode);
	const toWrite = placed.filter((place) => patch.outcodes.includes(outcodeOf(place.postcode))).sort(bySourceId);
	return { toWrite, refusedCount: trading.length - fitting.length, unplacedCount: fitting.length - placed.length, outsideCount: placed.length - toWrite.length };
}

/** A batch that named one place twice would be refused whole, so an id the release repeats is kept once. */
function onePerId(places: PlaceSeed[]): PlaceSeed[] {
	return [...new Map(places.map((place) => [place.sourceId, place])).values()];
}

function bySourceId(first: PlaceSeed, second: PlaceSeed): number {
	return first.sourceId.localeCompare(second.sourceId);
}
