import { describe, expect, it } from 'vitest';
import { getPremisesForClient } from './getPremisesForClient';
import { premisesRowOf, premisesTableOf } from './premisesTable.fixture';

const lambId = 'client-lamb';
const stillThere = premisesRowOf({ id: 'place', source: 'places_dataset', client_id: lambId, last_seen_at: '2026-11-16T02:50:00Z', phone: '+442083990000' });
const sinceGone = premisesRowOf({ id: 'food', client_id: lambId, last_seen_at: '2026-10-01T02:00:00Z', is_gone: true });
const someoneElses = premisesRowOf({ id: 'other', client_id: 'client-antelope' });
const tiedToNobody = premisesRowOf({ id: 'untied' });
const premises = premisesTableOf([sinceGone, someoneElses, tiedToNobody, stillThere]);

describe('the premises a company was put on the register from', () => {
	it('are the ones tied to it, one that has gone too, the one seen latest first', async () => {
		const found = await getPremisesForClient(premises, lambId);
		expect(found.map((one) => one.id)).toEqual(['place', 'food']);
		expect(found.map((one) => one.isGone)).toEqual([false, true]);
	});

	it('carry the phone number the register lists', async () => {
		const [place] = await getPremisesForClient(premises, lambId);
		expect(place.phone).toBe('+442083990000');
	});

	it('are none for a company made any other way', async () => {
		expect(await getPremisesForClient(premises, 'client-from-companies-house')).toEqual([]);
	});
});
