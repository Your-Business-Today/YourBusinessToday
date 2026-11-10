import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from './booksActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { chartDatabase, heldRows, writes } from './booksChartDatabase.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const organisationId = '00000000-0000-4000-8000-0000000000a1';
const salesId = '00000000-0000-4000-8000-000000004000';
const bankId = '00000000-0000-4000-8000-000000001200';
const shopId = '00000000-0000-4000-8000-00000000c001';

const switchedOnModules = vi.hoisted(() => ({ current: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => switchedOnModules.current }));

const nigel = {
	accountId: 'nigel',
	isStaff: false,
	supabase: chartDatabase,
	organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }]
} as unknown as McpCaller;

const run = (name: string, input: Record<string, unknown>) =>
	(booksActions.find((action) => action.name === name) as McpAction).run(nigel, { organisationId, ...input });

describe('the chart of accounts and cost centre actions', () => {
	beforeEach(() => {
		switchedOnModules.current = ['books'];
		writes.length = 0;
		heldRows.account = { id: salesId, code: '4000', name: 'Sales', account_type: 'income', is_system: false, is_archived: false };
		heldRows.costCentre = { id: shopId, name: 'Shop', is_archived: false };
		heldRows.failure = null;
	});

	it('change nothing for an organisation without Books', async () => {
		switchedOnModules.current = [];
		expect(await run('create_ledger_account', { code: '4010', name: 'Fees', accountType: 'income' })).toBe(moduleNotSwitchedOn('books'));
		expect(await run('create_cost_centre', { name: 'Shop' })).toBe(moduleNotSwitchedOn('books'));
		expect(writes).toEqual([]);
	});

	it('add an account to the organisation named, as given', async () => {
		heldRows.account = { id: salesId, code: '4010', name: 'Fees', account_type: 'income', is_system: false, is_archived: false };
		const answer = await run('create_ledger_account', { code: '4010', name: 'Fees', accountType: 'income' });
		expect(writes).toEqual([{ table: 'books_ledger_accounts', row: { organisation_id: organisationId, code: '4010', name: 'Fees', account_type: 'income' } }]);
		expect(answer).toContain("Added to Jewel Enterprises's chart of accounts:\n- 4010 Fees, income.");
	});

	it('refuse an account code already in the chart', async () => {
		heldRows.failure = { code: '23505' };
		expect(await run('create_ledger_account', { code: '4000', name: 'Sales', accountType: 'income' })).toBe(
			'Nothing was saved. Account code 4000 is already in this chart; give another code.'
		);
	});

	it('refuse an account of a type the column does not hold, writing nothing', async () => {
		const answer = await run('create_ledger_account', { code: '4010', name: 'Fees', accountType: 'revenue' });
		expect(answer).toContain('Nothing was saved. accountType is one of');
		expect(writes).toEqual([]);
	});

	it('archive an account and bring it back', async () => {
		expect(await run('set_ledger_account_archived', { accountId: salesId, isArchived: true })).toBe('4000 Sales is archived: nothing new posts to it.');
		expect(writes).toEqual([{ table: 'books_ledger_accounts', row: { is_archived: true } }]);
		expect(await run('set_ledger_account_archived', { accountId: salesId, isArchived: false })).toBe('4000 Sales is brought back and takes new lines.');
	});

	it('never archive a system account', async () => {
		heldRows.account = { id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false };
		expect(await run('set_ledger_account_archived', { accountId: bankId, isArchived: true })).toBe(
			'Nothing was saved. 1200 Bank is a system account, so it is never archived.'
		);
		expect(writes).toEqual([]);
	});

	it('refuse an account that is not in the chart, or an id that is not one', async () => {
		heldRows.account = null;
		expect(await run('set_ledger_account_archived', { accountId: salesId, isArchived: true })).toContain(`No account ${salesId} is in this organisation's chart`);
		expect(await run('set_ledger_account_archived', { accountId: '4000', isArchived: true })).toContain('The account must be an id');
		expect(writes).toEqual([]);
	});

	it('list, add and archive cost centres', async () => {
		expect(await run('list_cost_centres', {})).toBe(`Cost centres of Jewel Enterprises, by name:\n- Shop. Id ${shopId}`);
		expect(await run('create_cost_centre', { name: 'Shop' })).toBe(`Added to Jewel Enterprises's cost centres:\n- Shop. Id ${shopId}`);
		heldRows.costCentre = { id: shopId, name: 'Shop', is_archived: true };
		expect(await run('set_cost_centre_archived', { costCentreId: shopId, isArchived: true })).toBe('Cost centre Shop is archived: nothing new posts to it.');
		expect(writes.map((write) => write.table)).toEqual(['books_cost_centres', 'books_cost_centres']);
	});

	it('refuse a blank cost centre name and an archive choice that is not yes or no', async () => {
		expect(await run('create_cost_centre', { name: ' ' })).toBe('Nothing was saved. name cannot be blank.');
		expect(await run('set_cost_centre_archived', { costCentreId: shopId, isArchived: 'yes' })).toContain('Nothing was saved. isArchived is true');
		expect(writes).toEqual([]);
	});
});
