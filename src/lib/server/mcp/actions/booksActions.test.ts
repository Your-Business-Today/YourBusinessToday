import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from './booksActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const organisationId = '00000000-0000-4000-8000-0000000000a1';
const bankId = '00000000-0000-4000-8000-000000001200';
const salesId = '00000000-0000-4000-8000-000000004000';

const switchedOnModules = vi.hoisted(() => ({ current: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => switchedOnModules.current }));

const writes: string[] = [];
const nothingHeld = {
	from: (table: string) => {
		const chain = {
			select: () => chain,
			eq: () => chain,
			in: () => chain,
			insert: () => {
				writes.push(table);
				return chain;
			},
			then: (resolve: (value: unknown) => unknown) => resolve({ data: [], error: null })
		};
		return chain;
	}
};
const nigel = {
	accountId: 'nigel',
	isStaff: false,
	supabase: nothingHeld,
	organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }]
} as unknown as McpCaller;

const postJournal = booksActions.find((action) => action.name === 'post_journal') as McpAction;
const cashSale = (creditAmount: number) => ({
	organisationId,
	journalDate: '2026-11-10',
	description: 'Cash sale at the shop',
	lines: [
		{ accountId: bankId, debit: 80 },
		{ accountId: salesId, credit: creditAmount }
	]
});

describe('post_journal', () => {
	beforeEach(() => {
		switchedOnModules.current = ['books'];
		writes.length = 0;
	});

	it('posts nothing for an organisation without Books', async () => {
		switchedOnModules.current = [];
		expect(await postJournal.run(nigel, cashSale(80))).toBe(moduleNotSwitchedOn('books'));
		expect(writes).toEqual([]);
	});

	it('refuses a journal whose debits do not equal its credits, writing nothing', async () => {
		expect(await postJournal.run(nigel, cashSale(70))).toBe('Nothing was posted. Debits (80) do not equal credits (70).');
		expect(writes).toEqual([]);
	});

	it('refuses an account that is not in the organisation\'s books, writing nothing', async () => {
		expect(await postJournal.run(nigel, cashSale(80))).toBe(`Nothing was posted. No account ${bankId} is in this organisation's books.`);
		expect(writes).toEqual([]);
	});
});

describe('the books actions', () => {
	it('each say how to use them, so a Claude posts and reports what the books hold and nothing it guessed', () => {
		const unguided = booksActions.filter((action) => (action.guidance ?? '') === '');
		expect(unguided.map((action) => action.name)).toEqual([]);
	});
});
