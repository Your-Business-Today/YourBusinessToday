import { describe, expect, it } from 'vitest';
import { toCoordinates } from './britishNationalGrid';
import { toGridPoint } from './britishNationalGridForward';

describe('toGridPoint', () => {
	it('returns a grid point to within a metre of where it came from', () => {
		const kingston = { eastings: 518200, northings: 169300 };
		const back = toGridPoint(toCoordinates(kingston));
		expect(Math.abs(back.eastings - kingston.eastings)).toBeLessThan(1);
		expect(Math.abs(back.northings - kingston.northings)).toBeLessThan(1);
	});

	it('places Manchester town hall on its grid square', () => {
		const point = toGridPoint({ latitude: 53.4794, longitude: -2.2453 });
		expect(point.eastings).toBeGreaterThan(383_000);
		expect(point.eastings).toBeLessThan(384_500);
		expect(point.northings).toBeGreaterThan(397_500);
		expect(point.northings).toBeLessThan(399_000);
	});
});
