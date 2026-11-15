import { describe, expect, it } from 'vitest';
import { listPremisesMatching, mostPremisesListed, type PremisesNarrowing } from './listPremisesMatching';
import { premisesRowOf, premisesTableFailingWith, premisesTableOf } from './premisesTable.fixture';

const surbitonOutcodes = ['KT5', 'KT6'];
const everything: PremisesNarrowing = { sector: '', source: null, category: '', arrivedSince: null };
const columnNotThereYet = { code: '42703' };
const databaseDown = { code: '57P03' };

const lamb = premisesRowOf({ id: 'lamb', business_name: 'The Lamb', first_seen_at: '2026-10-26T02:00:00Z' });
const barber = premisesRowOf({
	id: 'barber',
	business_name: 'Maple Road Barbers',
	source: 'places_dataset',
	category: 'hair_salon',
	sector: 'KT6 4',
	first_seen_at: '2026-11-14T02:00:00Z',
	is_later_arrival: true
});
const solicitor = premisesRowOf({
	id: 'solicitor',
	business_name: 'Victoria Road Law',
	source: 'places_dataset',
	category: 'solicitor',
	first_seen_at: '2026-11-01T02:00:00Z'
});
const held = [lamb, barber, solicitor, premisesRowOf({ id: 'closed', is_gone: true }), premisesRowOf({ id: 'elsewhere', outcode: 'SM1' })];

async function idsMatching(narrowing: Partial<PremisesNarrowing>): Promise<string[]> {
	const { premises } = await listPremisesMatching(premisesTableOf(held), surbitonOutcodes, { ...everything, ...narrowing });
	return premises.map((one) => one.id);
}

describe("listing a territory's premises to a Claude", () => {
	it('lists those still trading in the territory, the newest first', async () => {
		expect(await idsMatching({})).toEqual(['barber', 'solicitor', 'lamb']);
	});

	it('narrows by sector and by source', async () => {
		expect(await idsMatching({ sector: 'KT6 4' })).toEqual(['barber']);
		expect(await idsMatching({ source: 'food_hygiene' })).toEqual(['lamb']);
	});

	it('keeps the premises that arrived since a day, and none that its ground was first loaded with', async () => {
		expect(await idsMatching({ arrivedSince: '2026-10-30T00:00:00Z' })).toEqual(['barber']);
		expect(await idsMatching({ arrivedSince: '2026-11-15T00:00:00Z' })).toEqual([]);
	});

	it('says none has arrived until the migration that marks the later arrivals has run', async () => {
		const beforeTheMigration = premisesTableFailingWith(columnNotThereYet);
		const arrivals = { ...everything, arrivedSince: '2026-10-30T00:00:00Z' };
		expect(await listPremisesMatching(beforeTheMigration, surbitonOutcodes, arrivals)).toEqual({ premises: [], matchedCount: 0 });
	});

	it('fails on any other failure, so a database that is down is not read as an empty territory', async () => {
		await expect(listPremisesMatching(premisesTableFailingWith(databaseDown), surbitonOutcodes, everything)).rejects.toEqual(databaseDown);
	});

	it('narrows by a word of the category, whatever its case, reading an underscore as an underscore', async () => {
		expect(await idsMatching({ category: 'SOLICIT' })).toEqual(['solicitor']);
		expect(await idsMatching({ category: 'hair_salon' })).toEqual(['barber']);
		expect(await idsMatching({ category: 'hair_salo_' })).toEqual([]);
	});

	it('lists a hundred at most and says how many fit in all, so the answer fits one reply', async () => {
		const many = Array.from({ length: 2300 }, (_, index) => premisesRowOf({ id: `premises-${index}` }));
		const matched = await listPremisesMatching(premisesTableOf(many), surbitonOutcodes, everything);
		expect(matched.premises).toHaveLength(mostPremisesListed);
		expect(matched.matchedCount).toBe(2300);
	});

	it('asks for nothing when the territory has no outcodes', async () => {
		expect(await listPremisesMatching(premisesTableOf(held), [], everything)).toEqual({ premises: [], matchedCount: 0 });
	});
});
