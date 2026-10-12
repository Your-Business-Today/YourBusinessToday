import { describe, expect, it } from 'vitest';
import { footprintOf } from './buildingFootprint';
import { placeUprnsInBuildings } from './placeUprns';
import { readUprnPoint } from './uprnRows';

const bounds = { minEast: 518000, minNorth: 169000, maxEast: 519000, maxNorth: 170000 };
const house = footprintOf([[[518200, 169300], [518220, 169300], [518220, 169320], [518200, 169320], [518200, 169300]]]);

describe('placeUprnsInBuildings', () => {
	it('puts each addressable place in the footprint it falls in and leaves the rest outside', () => {
		const inside = readUprnPoint(['100', '518210', '169310', '51.41', '-0.30'], bounds);
		const outside = readUprnPoint(['101', '518500', '169310', '51.41', '-0.30'], bounds);
		const beyond = readUprnPoint(['102', '600000', '169310', '51.41', '-0.30'], bounds);
		expect(beyond).toBeNull();
		const placed = placeUprnsInBuildings([house], [inside!, outside!]);
		const [placedHouse] = placed.buildings;
		expect(placedHouse.uprns).toEqual([100]);
		expect(placed.outside.map((point) => point.uprn)).toEqual([101]);
	});

	it('measures the footprint and finds its centre on the ground', () => {
		expect(house.areaSquareMetres).toBe(400);
		expect(house.centre).toEqual([518210, 169310]);
		const { centreOnGround } = house;
		expect(centreOnGround.latitude).toBeCloseTo(51.41, 1);
	});
});
