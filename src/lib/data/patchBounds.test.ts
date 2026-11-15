import { describe, expect, it } from 'vitest';
import { boundsAround, patchBoundsOnGround } from './patchBounds';
import { distanceInMetres } from './distance';

const surbiton = { latitude: 51.3925, longitude: -0.3 };

describe('the box on the ground around a point', () => {
	it('reaches the given metres north, south, east and west of the point', () => {
		const box = boundsAround(surbiton, 30);
		const northEdge = { latitude: box.north, longitude: surbiton.longitude };
		const eastEdge = { latitude: surbiton.latitude, longitude: box.east };
		expect(distanceInMetres(surbiton, northEdge)).toBeCloseTo(30, 0);
		expect(distanceInMetres(surbiton, eastEdge)).toBeCloseTo(30, 0);
		expect(box.north - surbiton.latitude).toBeCloseTo(surbiton.latitude - box.south, 10);
		expect(box.east - surbiton.longitude).toBeCloseTo(surbiton.longitude - box.west, 10);
	});

	it('is wider in degrees of longitude than of latitude this far north', () => {
		const box = boundsAround(surbiton, 30);
		expect(box.east - box.west).toBeGreaterThan(box.north - box.south);
	});

	it("holds a territory's circle when the radius is given in miles", () => {
		const threeMilesInMetres = 4828;
		const box = patchBoundsOnGround(surbiton, 3);
		const northEdge = { latitude: box.north, longitude: surbiton.longitude };
		expect(distanceInMetres(surbiton, northEdge) / threeMilesInMetres).toBeCloseTo(1, 2);
	});
});
