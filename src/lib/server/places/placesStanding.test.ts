import { describe, expect, it } from 'vitest';
import { heldWholeMarkerOf, isHoldingWhole, loadingMarkerOf, parsePlacesStanding } from './placesStanding';

describe("a territory's standing with its trading places", () => {
	it('is never loaded when no run has left a marker', () => {
		expect(parsePlacesStanding('')).toEqual({ heldRelease: '', isPlacedByPoint: false, loadingRelease: '', writtenCount: 0 });
	});

	it('holds a release whole, from before places were placed by their point, when the marker is the release alone', () => {
		expect(parsePlacesStanding('2026-10-21.0')).toEqual({ heldRelease: '2026-10-21.0', isPlacedByPoint: false, loadingRelease: '', writtenCount: 0 });
	});

	it('holds a release whole with its places placed by their point when the release carries the mark', () => {
		expect(parsePlacesStanding('2026-10-21.0+by-point')).toEqual({ heldRelease: '2026-10-21.0', isPlacedByPoint: true, loadingRelease: '', writtenCount: 0 });
		expect(parsePlacesStanding(heldWholeMarkerOf('2026-10-21.0'))).toEqual(parsePlacesStanding('2026-10-21.0+by-point'));
	});

	it('has nothing left to load only when it holds that very release with the mark', () => {
		expect(isHoldingWhole(parsePlacesStanding('2026-10-21.0+by-point'), '2026-10-21.0')).toBe(true);
		expect(isHoldingWhole(parsePlacesStanding('2026-10-21.0'), '2026-10-21.0')).toBe(false);
		expect(isHoldingWhole(parsePlacesStanding('2026-09-23.1+by-point'), '2026-10-21.0')).toBe(false);
		expect(isHoldingWhole(parsePlacesStanding('2026-10-21.0+by-point>2026-11-18.0:500'), '2026-10-21.0')).toBe(true);
	});

	it('is part way through a first load when nothing is held and a release is being written', () => {
		expect(parsePlacesStanding('>2026-10-21.0:4500')).toEqual({ heldRelease: '', isPlacedByPoint: false, loadingRelease: '2026-10-21.0', writtenCount: 4500 });
	});

	it('still holds the release before while the next one is being written', () => {
		expect(parsePlacesStanding('2026-09-23.1>2026-10-21.0:500')).toEqual({ heldRelease: '2026-09-23.1', isPlacedByPoint: false, loadingRelease: '2026-10-21.0', writtenCount: 500 });
		expect(parsePlacesStanding('2026-09-23.1+by-point>2026-10-21.0:500')).toMatchObject({ heldRelease: '2026-09-23.1', isPlacedByPoint: true });
	});

	it('counts nothing written when the count in the marker is not a whole number of places', () => {
		expect(parsePlacesStanding('>2026-10-21.0:').writtenCount).toBe(0);
		expect(parsePlacesStanding('>2026-10-21.0:many').writtenCount).toBe(0);
		expect(parsePlacesStanding('>2026-10-21.0:-3').writtenCount).toBe(0);
	});

	it('is written as a marker that reads back the same', () => {
		const standing = { heldRelease: '2026-09-23.1', isPlacedByPoint: true, loadingRelease: '2026-10-21.0', writtenCount: 1500 };
		expect(loadingMarkerOf(standing)).toBe('2026-09-23.1+by-point>2026-10-21.0:1500');
		expect(parsePlacesStanding(loadingMarkerOf(standing))).toEqual(standing);
		const topUp = { ...standing, heldRelease: '2026-10-21.0', isPlacedByPoint: false };
		expect(parsePlacesStanding(loadingMarkerOf(topUp))).toEqual(topUp);
	});
});
