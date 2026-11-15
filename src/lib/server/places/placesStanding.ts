/**
 * Where a territory stands with its trading places: the release it holds whole, and the release a load cut off part
 * way was writing with how many of its places are written. No release held is a territory never loaded.
 */
export type PlacesStanding = { heldRelease: string; loadingRelease: string; writtenCount: number };

const loadingMark = '>';
const countMark = ':';
const noRelease = '';

/** The standing a run's marker carries: a release alone is held whole, and held>loading:count is a load part way. */
export function parsePlacesStanding(marker: string): PlacesStanding {
	const [heldRelease, loading] = marker.split(loadingMark);
	if (loading === undefined) return { heldRelease, loadingRelease: noRelease, writtenCount: 0 };
	const [loadingRelease, written] = loading.split(countMark);
	const writtenCount = Number(written);
	return { heldRelease, loadingRelease, writtenCount: Number.isInteger(writtenCount) && writtenCount > 0 ? writtenCount : 0 };
}

/** The marker of a load part way: the release still held, the one being written, and how many of its places are written. */
export function loadingMarkerOf(standing: PlacesStanding): string {
	return `${standing.heldRelease}${loadingMark}${standing.loadingRelease}${countMark}${standing.writtenCount}`;
}
