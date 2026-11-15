import { describe, expect, it } from 'vitest';
import { listPremisesBeside } from './listPremisesBeside';
import { premisesRowOf, premisesTableOf } from './premisesTable.fixture';

const surbitonOutcodes = ['KT6'];
const building = { latitude: 51.3925, longitude: -0.3045 };
const metresPerDegreeLatitude = 111_195;
const metresPerDegreeLongitude = 69_390;

/** A premises row that many metres north and east of the building. */
function premisesAt(id: string, metresNorth: number, metresEast: number, facts: Record<string, unknown> = {}) {
	const latitude = building.latitude + metresNorth / metresPerDegreeLatitude;
	const longitude = building.longitude + metresEast / metresPerDegreeLongitude;
	return premisesRowOf({ id, business_name: id, latitude, longitude, ...facts });
}

describe('the premises in or beside a point', () => {
	it('keeps those within thirty metres, by name, and leaves the rest of the territory unread', async () => {
		const held = [
			premisesAt('next door', 20, 0),
			premisesAt('inside', 0, 0),
			premisesAt('down the road', 60, 0),
			premisesAt('across the corner', 28, 28)
		];
		const beside = await listPremisesBeside(premisesTableOf(held), surbitonOutcodes, building);
		expect(beside.map((one) => one.businessName)).toEqual(['inside', 'next door']);
	});

	it('leaves out a premises that has gone, one in another territory and one with no geocode of its own', async () => {
		const held = [
			premisesAt('gone', 5, 0, { is_gone: true }),
			premisesAt('elsewhere', 5, 0, { outcode: 'SM1' }),
			premisesRowOf({ id: 'unplaced', latitude: null, longitude: null })
		];
		expect(await listPremisesBeside(premisesTableOf(held), surbitonOutcodes, building)).toEqual([]);
	});

	it('asks for nothing when the territory has no outcodes', async () => {
		expect(await listPremisesBeside(premisesTableOf([premisesAt('inside', 0, 0)]), [], building)).toEqual([]);
	});
});
