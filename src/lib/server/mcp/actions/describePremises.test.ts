import { describe, expect, it } from 'vitest';
import { describePremisesList } from './describePremises';
import { parsePremisesRecord } from '$lib/server/premises/premisesRecord';
import { premisesRowOf } from '$lib/server/premises/premisesTable.fixture';

const lamb = parsePremisesRecord(premisesRowOf());
const barber = parsePremisesRecord(
	premisesRowOf({
		id: '22222222-2222-4222-8222-222222222222',
		source: 'places_dataset',
		business_name: 'Maple Road Barbers',
		business_type: '',
		website: 'https://maple-road-barbers.example',
		phone: '+44 20 8000 0000',
		source_url: 'https://explore.overturemaps.org/#abc'
	})
);

describe("a territory's premises as a Claude is told them", () => {
	it('gives a food business its rating and a trading place its website and phone', () => {
		const [first, second] = describePremisesList({ premises: [lamb, barber], matchedCount: 2 }, false).split('\n');
		expect(first).toBe(
			'The Lamb — KT6 5 — Pub/bar/nightclub — 73 Brighton Road, Surbiton — rating 5 — from the Food Standards Agency — first seen 26 Oct 2026 — not on the register — https://ratings.food.gov.uk/business/1 — id 11111111-1111-4111-8111-111111111111'
		);
		expect(second).toContain('type unknown — 73 Brighton Road, Surbiton — https://maple-road-barbers.example +44 20 8000 0000 — from Overture Maps Places');
	});

	it('says how many more fit than it lists', () => {
		const answer = describePremisesList({ premises: [lamb], matchedCount: 2300 }, true);
		expect(answer.split('\n').at(-1)).toBe('… and 2299 more — narrow by sector, source, category or newOnly.');
	});

	it('says none is loaded when nothing was asked for and the territory holds none', () => {
		expect(describePremisesList({ premises: [], matchedCount: 0 }, false)).toContain('No premises are listed in this territory yet. The site loads them by itself overnight');
	});

	it('says nothing matches, and not that none is loaded, when what was asked for fits none', () => {
		expect(describePremisesList({ premises: [], matchedCount: 0 }, true)).toBe(
			'No premises in this territory match that: leave out the sector, source, category or newOnly to see more.'
		);
	});
});
