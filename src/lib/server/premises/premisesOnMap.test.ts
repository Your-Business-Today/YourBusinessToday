import { describe, expect, it } from 'vitest';
import { countPremisesBySector, readPremisesOnMap } from './premisesOnMap';
import { premisesRowOf, premisesTableOf, rowsHandedBackAtOnce } from './premisesTable.fixture';

const surbitonOutcodes = ['KT5', 'KT6'];

function premisesNumbered(count: number, facts: Record<string, unknown> = {}) {
	return Array.from({ length: count }, (_, index) => premisesRowOf({ id: `premises-${String(index).padStart(5, '0')}`, ...facts }));
}

describe("reading a territory's premises for its map", () => {
	it('reads every one of them, past the thousand the database hands back at once', async () => {
		const held = premisesNumbered(rowsHandedBackAtOnce * 2 + 300);
		const premises = await readPremisesOnMap(premisesTableOf(held), surbitonOutcodes);
		expect(premises).toHaveLength(2300);
		expect(new Set(premises.map((one) => one.id)).size).toBe(2300);
	});

	it('leaves out the premises that have gone and those outside the territory', async () => {
		const held = [
			premisesRowOf({ id: 'trading' }),
			premisesRowOf({ id: 'gone', is_gone: true }),
			premisesRowOf({ id: 'elsewhere', outcode: 'SM1' })
		];
		const premises = await readPremisesOnMap(premisesTableOf(held), surbitonOutcodes);
		expect(premises.map((one) => one.id)).toEqual(['trading']);
	});

	it('carries what a pin and a sector count need, and nothing else of the record', async () => {
		const [premises] = await readPremisesOnMap(premisesTableOf([premisesRowOf({ source: 'places_dataset' })]), surbitonOutcodes);
		expect(premises).toEqual({
			id: '11111111-1111-4111-8111-111111111111',
			source: 'places_dataset',
			businessName: 'The Lamb',
			address: '73 Brighton Road, Surbiton',
			postcode: 'KT6 5NF',
			sector: 'KT6 5',
			latitude: 51.3925,
			longitude: -0.3045
		});
	});

	it('asks for nothing when the territory has no outcodes', async () => {
		expect(await readPremisesOnMap(premisesTableOf(premisesNumbered(3)), [])).toEqual([]);
	});

	it('counts the premises of each sector', async () => {
		const held = [...premisesNumbered(3), ...premisesNumbered(2, { sector: 'KT6 4' })];
		const premises = await readPremisesOnMap(premisesTableOf(held), surbitonOutcodes);
		expect(countPremisesBySector(premises)).toEqual({ 'KT6 5': 3, 'KT6 4': 2 });
	});
});
