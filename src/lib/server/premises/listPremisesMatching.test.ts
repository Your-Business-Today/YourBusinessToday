import { describe, expect, it } from 'vitest';
import { listPremisesMatching, mostPremisesListed, type PremisesNarrowing } from './listPremisesMatching';
import { premisesRowOf, premisesTableOf } from './premisesTable.fixture';

const surbitonOutcodes = ['KT5', 'KT6'];
const everything: PremisesNarrowing = { sector: '', source: null, category: '', firstSeenSince: null };

const lamb = premisesRowOf({ id: 'lamb', business_name: 'The Lamb', first_seen_at: '2026-10-26T02:00:00Z' });
const barber = premisesRowOf({
	id: 'barber',
	business_name: 'Maple Road Barbers',
	source: 'places_dataset',
	category: 'hair_salon',
	sector: 'KT6 4',
	first_seen_at: '2026-11-14T02:00:00Z'
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

	it('narrows by sector, by source and by the day first seen', async () => {
		expect(await idsMatching({ sector: 'KT6 4' })).toEqual(['barber']);
		expect(await idsMatching({ source: 'food_hygiene' })).toEqual(['lamb']);
		expect(await idsMatching({ firstSeenSince: '2026-11-10T00:00:00Z' })).toEqual(['barber']);
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
