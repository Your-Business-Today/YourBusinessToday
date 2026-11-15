import type { PlacesSorted } from './placesForPatch';

/** What a finished load found beyond the places it wrote: the ones too broken to read, and the ones it marked gone. */
export type PlacesLoadEnd = { unreadableCount: number; goneCount: number };

/** What a load cut off part way says: the release it is writing and how far through it is. */
export function placesPartWayNote(release: string, writtenCount: number, toWriteCount: number): string {
	return `Release ${release}: ${writtenCount} of ${toWriteCount} trading places written so far.`;
}

/** What a finished load says: what the territory now holds, what was left out and why, and what has gone. */
export function placesHeldNote(release: string, sorted: PlacesSorted, end: PlacesLoadEnd): string {
	const { toWrite, refusedCount, unplacedCount, outsideCount } = sorted;
	const leftOut = [
		`${refusedCount} the rules refuse (unsure, share-alike or too long)`,
		`${unplacedCount} with no postcode`,
		`${outsideCount} outside its outcodes`,
		`${end.unreadableCount} with no name or point`
	];
	return `Release ${release}: ${toWrite.length} trading places held. Left out: ${leftOut.join(', ')}. ${end.goneCount} marked gone.`;
}
