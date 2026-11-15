import { describe, expect, it } from 'vitest';
import { describeClientPremises } from './describeClientPremises';
import { parsePremisesRecord } from '$lib/server/premises/premisesRecord';
import { premisesRowOf } from '$lib/server/premises/premisesTable.fixture';

const aPlace = { source: 'places_dataset', business_type: 'pub', address: '73 Brighton Road', rating_value: '', phone: '+442083990000', source_url: 'https://explore.overturemaps.org/#lamb' };
const tradingPlace = parsePremisesRecord(premisesRowOf(aPlace));
const foodPremises = parsePremisesRecord(premisesRowOf());

describe('where a company made from a premises trades, as a Claude reads it', () => {
	it('gives a trading place its address, its kind, its phone number and the page it was read on', () => {
		expect(describeClientPremises([tradingPlace])).toEqual([
			'',
			'Trading at:',
			'73 Brighton Road, KT6 5NF — pub — phone +442083990000 — listed by Overture Maps Places — https://explore.overturemaps.org/#lamb'
		]);
	});

	it('gives a food business its hygiene rating, and no phone number where the register lists none', () => {
		const [, , line] = describeClientPremises([foodPremises]);
		expect(line).toBe('73 Brighton Road, Surbiton, KT6 5NF — Pub/bar/nightclub — food hygiene rating 5 — listed by the Food Standards Agency — https://ratings.food.gov.uk/business/1');
	});

	it('says so when the register no longer lists the premises', () => {
		const sinceGone = parsePremisesRecord(premisesRowOf({ ...aPlace, is_gone: true }));
		const [, , line] = describeClientPremises([sinceGone]);
		expect(line).toContain('no longer listed by Overture Maps Places');
	});

	it('says nothing for a company made any other way', () => {
		expect(describeClientPremises([])).toEqual([]);
	});
});
