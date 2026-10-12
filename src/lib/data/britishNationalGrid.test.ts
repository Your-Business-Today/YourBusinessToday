import { describe, expect, it } from 'vitest';
import { toCoordinates } from './britishNationalGrid';

describe('toCoordinates', () => {
	it("turns Ordnance Survey's worked example near Caister into its latitude and longitude on WGS84", () => {
		const point = toCoordinates({ eastings: 651409.903, northings: 313177.27 });
		expect(point.latitude).toBeCloseTo(52.6577, 3);
		expect(point.longitude).toBeCloseTo(1.716, 2);
	});

	it('puts Kingston upon Thames where the map tiles draw it', () => {
		const point = toCoordinates({ eastings: 518000, northings: 169000 });
		expect(point.latitude).toBeCloseTo(51.409, 2);
		expect(point.longitude).toBeCloseTo(-0.305, 2);
	});
});
