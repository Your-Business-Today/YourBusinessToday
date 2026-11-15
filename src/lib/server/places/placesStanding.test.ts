import { describe, expect, it } from 'vitest';
import { loadingMarkerOf, parsePlacesStanding } from './placesStanding';

describe("a territory's standing with its trading places", () => {
	it('is never loaded when no run has left a marker', () => {
		expect(parsePlacesStanding('')).toEqual({ heldRelease: '', loadingRelease: '', writtenCount: 0 });
	});

	it('holds a release whole when the marker is the release alone', () => {
		expect(parsePlacesStanding('2026-10-21.0')).toEqual({ heldRelease: '2026-10-21.0', loadingRelease: '', writtenCount: 0 });
	});

	it('is part way through a first load when nothing is held and a release is being written', () => {
		expect(parsePlacesStanding('>2026-10-21.0:4500')).toEqual({ heldRelease: '', loadingRelease: '2026-10-21.0', writtenCount: 4500 });
	});

	it('still holds the release before while the next one is being written', () => {
		expect(parsePlacesStanding('2026-09-23.1>2026-10-21.0:500')).toEqual({ heldRelease: '2026-09-23.1', loadingRelease: '2026-10-21.0', writtenCount: 500 });
	});

	it('counts nothing written when the count in the marker is not a whole number of places', () => {
		expect(parsePlacesStanding('>2026-10-21.0:').writtenCount).toBe(0);
		expect(parsePlacesStanding('>2026-10-21.0:many').writtenCount).toBe(0);
		expect(parsePlacesStanding('>2026-10-21.0:-3').writtenCount).toBe(0);
	});

	it('is written as a marker that reads back the same', () => {
		const standing = { heldRelease: '2026-09-23.1', loadingRelease: '2026-10-21.0', writtenCount: 1500 };
		expect(loadingMarkerOf(standing)).toBe('2026-09-23.1>2026-10-21.0:1500');
		expect(parsePlacesStanding(loadingMarkerOf(standing))).toEqual(standing);
	});
});
