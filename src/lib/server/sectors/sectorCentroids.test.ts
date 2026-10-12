import { describe, expect, it } from 'vitest';
import { readUnitPostcodePoint } from './codePointRow';
import { SectorAccumulator } from './sectorCentroids';

const kingstonRow = ['KT1 1EU', '10', '517900', '169200', 'E92000001', '', '', '', 'E09000021', 'E05000400'];

describe('readUnitPostcodePoint', () => {
	it('reads a Code-Point Open row into its sector and a point on WGS84', () => {
		const point = readUnitPostcodePoint(kingstonRow);
		expect(point?.postcode).toBe('KT1 1EU');
		expect(point?.sector).toBe('KT1 1');
		expect(point?.latitude).toBeCloseTo(51.41, 1);
		expect(point?.longitude).toBeCloseTo(-0.3, 1);
	});

	it('is null for a row that is not a postcode row or has no position', () => {
		expect(readUnitPostcodePoint(['Postcode', 'Quality'])).toBeNull();
		expect(readUnitPostcodePoint([...kingstonRow.slice(0, 1), '90', '0', '0', ...kingstonRow.slice(4)])).toBeNull();
	});
});

describe('SectorAccumulator', () => {
	it('averages the unit postcodes of each sector and counts them', () => {
		const accumulator = new SectorAccumulator();
		accumulator.add({ postcode: 'KT1 1EU', sector: 'KT1 1', latitude: 51.0, longitude: -0.5 });
		accumulator.add({ postcode: 'KT1 1AA', sector: 'KT1 1', latitude: 52.0, longitude: -0.25 });
		accumulator.add({ postcode: 'KT2 5AA', sector: 'KT2 5', latitude: 51.5, longitude: -0.3 });
		expect(accumulator.centroids()).toEqual([
			{ sector: 'KT1 1', outcode: 'KT1', latitude: 51.5, longitude: -0.375, unit_postcode_count: 2 },
			{ sector: 'KT2 5', outcode: 'KT2', latitude: 51.5, longitude: -0.3, unit_postcode_count: 1 }
		]);
	});
});
