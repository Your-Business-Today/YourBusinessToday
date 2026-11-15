import { asyncBufferFromUrl } from 'hyparquet';
import { isClosedForGood, isPlaceIn, placeSeedOf } from './placeRow';
import { listPlaceFiles, listRemovedPlaceFiles } from './overtureReleases';
import { placeLeaves, removedPlaceLeaves, type OverturePlace } from './overturePlace';
import { readRowsAcross, type RowsAsked } from './readParquetRows';
import type { BucketFile } from './overtureBucket';
import type { MapBounds } from '$lib/data/mapBounds';
import type { PlaceSeed } from '$lib/data/placeRules';

/** What one release says of the places in a box: the ones trading, how many of those could not be read, and the ids of those that have gone. */
export type PlacesReading = { trading: PlaceSeed[]; unreadableCount: number; goneIds: string[] };

/** A place in the box as the release has it: its seed while it trades, which is null when it carries no id, name or point. */
type PlaceInBox = { sourceId: string; isClosed: boolean; seed: PlaceSeed | null };

/**
 * The places of one release in the box. A place has gone when the release says it closed for good, or when the
 * release's changelog says it was taken out since the release before: never because it is merely absent. The places
 * are read before the changelog, never beside it, so the two are not held in memory together.
 */
export async function readPlacesInRelease(release: string, bounds: MapBounds): Promise<PlacesReading> {
	const places = await readRowsIn(await listPlaceFiles(release), { leaves: placeLeaves, bounds }, placeInBox);
	const removedIds = await readRowsIn(await listRemovedPlaceFiles(release), { leaves: removedPlaceLeaves, bounds }, (place) => place.id ?? null);
	const open = places.filter((place) => !place.isClosed);
	const closed = places.filter((place) => place.isClosed);
	const trading = open.flatMap((place) => place.seed ?? []);
	return { trading, unreadableCount: open.length - trading.length, goneIds: [...closed.map((place) => place.sourceId), ...removedIds] };
}

async function readRowsIn<Kept>(files: BucketFile[], asked: RowsAsked, keep: (place: OverturePlace) => Kept | null): Promise<Kept[]> {
	const { bounds } = asked;
	const buffers = await Promise.all(files.map((file) => asyncBufferFromUrl(file)));
	return readRowsAcross<OverturePlace, Kept>(buffers, asked, (place) => (isPlaceIn(place, bounds) ? keep(place) : null));
}

function placeInBox(place: OverturePlace): PlaceInBox {
	const isClosed = isClosedForGood(place);
	return { sourceId: place.id ?? '', isClosed, seed: isClosed ? null : placeSeedOf(place) };
}
