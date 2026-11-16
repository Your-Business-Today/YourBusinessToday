import { afterEach, describe, expect, it, vi } from 'vitest';
import { premisesActions } from './premisesActions';
import { premisesRowOf, premisesTableOf } from '$lib/server/premises/premisesTable.fixture';
import type { McpCaller } from '../resolveMcpCaller';

const territory = { id: '33333333-3333-4333-8333-333333333333', name: 'Sutton', outcodes: ['SM6', 'SM7'] };
const today = Date.parse('2026-11-15T12:00:00Z');
const aMonthOn = Date.parse('2026-12-16T12:00:00Z');

vi.mock('$lib/server/patches/getPatch', () => ({ getPatch: async () => territory }));

/** A Sutton first loaded yesterday with more food businesses than the database hands back at once, and one pub a later sweep added. */
const inWallington = { sector: 'SM6 0', outcode: 'SM6', first_seen_at: '2026-11-14T02:00:00Z' };
const wallington = Array.from({ length: 1201 }, (_, index) => premisesRowOf({ id: `wallington-${index}`, business_name: `Wallington ${index}`, ...inWallington }));
const arrivedToday = { first_seen_at: '2026-11-15T02:00:00Z', is_later_arrival: true };
const bansteadPub = premisesRowOf({ id: 'banstead', business_name: 'The Woolpack', sector: 'SM7 2', outcode: 'SM7', ...arrivedToday });
const sutton = premisesTableOf([...wallington, bansteadPub]);

async function list(input: Record<string, unknown>, supabase = sutton): Promise<string> {
	const action = premisesActions.find((candidate) => candidate.name === 'list_patch_premises');
	if (action === undefined) throw new Error('No action named list_patch_premises');
	const answer = await action.run({ accountId: 'staff-1', supabase } as unknown as McpCaller, { patchId: territory.id, ...input });
	return String(answer);
}

describe("listing a territory's premises through the connector", () => {
	afterEach(() => vi.useRealTimers());

	it('finds the premises of a sector however many the territory holds before it', async () => {
		const answer = await list({ sector: 'sm7 2' });
		expect(answer.split('\n')).toHaveLength(1);
		expect(answer).toContain('The Woolpack — SM7 2');
	});

	it('lists a hundred and says how many more there are', async () => {
		const lines = (await list({})).split('\n');
		expect(lines).toHaveLength(101);
		expect(lines.at(-1)).toBe('… and 1102 more — narrow by sector, source, category or newOnly.');
	});

	it('lists nothing as new the day after a territory was first loaded', async () => {
		vi.useFakeTimers({ now: today });
		expect(await list({ newOnly: 'true' }, premisesTableOf(wallington))).toContain('No premises in this territory match that');
	});

	it('lists the business a later sweep added, and no other, when asked for the new ones', async () => {
		vi.useFakeTimers({ now: today });
		const answer = await list({ newOnly: 'true' });
		expect(answer.split('\n')).toHaveLength(1);
		expect(answer).toContain('The Woolpack');
	});

	it('stops listing a business as new thirty days after it arrived', async () => {
		vi.useFakeTimers({ now: aMonthOn });
		expect(await list({ newOnly: 'true' })).toContain('No premises in this territory match that');
	});

	it('says nothing matches when a source or a category fits none, and where the categories are listed', async () => {
		expect(await list({ source: 'places_dataset' })).toContain('No premises in this territory match that');
		expect(await list({ category: 'solicitor' })).toContain('list_patch_place_categories lists the ones this territory holds');
	});

	it('finds a kind of business named in plain words, as Overture Maps files it', async () => {
		const estateAgent = premisesRowOf({ id: 'agent', business_name: 'Banstead Homes', source: 'places_dataset', category: 'real_estate_agent', outcode: 'SM7' });
		const answer = await list({ category: 'Estate Agent' }, premisesTableOf([estateAgent, bansteadPub]));
		expect(answer.split('\n')).toHaveLength(1);
		expect(answer).toContain('Banstead Homes');
	});
});
