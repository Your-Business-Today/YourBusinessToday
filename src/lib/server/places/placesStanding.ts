/**
 * Where a territory stands with its trading places: the release it holds whole, whether that release was loaded with
 * the places that list no postcode placed by their point, and the release a load cut off part way was writing with
 * how many of its places are written. No release held is a territory never loaded.
 */
export type PlacesStanding = { heldRelease: string; isPlacedByPoint: boolean; loadingRelease: string; writtenCount: number };

const loadingMark = '>';
const countMark = ':';
const placedByPointMark = '+by-point';
const noRelease = '';

/**
 * The standing a run's marker carries: a release alone is held whole, a release with the point mark is held whole with
 * its places placed by their point, and held>loading:count is a load part way. A marker written before places were
 * placed by their point carries no mark, so it reads as not.
 */
export function parsePlacesStanding(marker: string): PlacesStanding {
	const [held, loading] = marker.split(loadingMark);
	const isPlacedByPoint = held.endsWith(placedByPointMark);
	const heldRelease = isPlacedByPoint ? held.slice(0, -placedByPointMark.length) : held;
	if (loading === undefined) return { heldRelease, isPlacedByPoint, loadingRelease: noRelease, writtenCount: 0 };
	const [loadingRelease, written] = loading.split(countMark);
	const writtenCount = Number(written);
	return { heldRelease, isPlacedByPoint, loadingRelease, writtenCount: Number.isInteger(writtenCount) && writtenCount > 0 ? writtenCount : 0 };
}

/** Whether the territory holds that release whole, loaded with its places placed by their point: nothing is left to load. */
export function isHoldingWhole(standing: PlacesStanding, release: string): boolean {
	return standing.heldRelease === release && standing.isPlacedByPoint;
}

/** The marker of a load part way: the release still held, the one being written, and how many of its places are written. */
export function loadingMarkerOf(standing: PlacesStanding): string {
	return `${heldMarkerOf(standing.heldRelease, standing.isPlacedByPoint)}${loadingMark}${standing.loadingRelease}${countMark}${standing.writtenCount}`;
}

/** The marker of a release held whole, loaded with its places placed by their point. */
export function heldWholeMarkerOf(release: string): string {
	return heldMarkerOf(release, true);
}

function heldMarkerOf(release: string, isPlacedByPoint: boolean): string {
	const isMarked = isPlacedByPoint && release !== noRelease;
	return isMarked ? `${release}${placedByPointMark}` : release;
}
