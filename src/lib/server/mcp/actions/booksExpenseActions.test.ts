import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { accountIdOfCode, journalsOfKind, postedLines, runOnTheLedger as run, writesTo } from './booksInvoicePostingWorld.fixture';
import { holdChartForCosts, prepaymentsId, projectsId, salesId, softwareId } from './booksExpenseWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const adobe = { expenseDate: '2026-11-05', supplier: 'Adobe', description: 'Creative Cloud', amount: 84.99, expenseAccountId: softwareId };
const costNames = ['record_expense', 'pay_expense', 'delete_expense', 'list_expenses'];

describe('recording a supplier cost', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		holdChartForCosts();
	});

	it('changes nothing and reads nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		for (const name of costNames) expect(await run(name, { ...adobe, paidOn: '2026-11-20' })).toBe(moduleNotSwitchedOn('books'));
		expect(ledgerWrites).toEqual([]);
	});

	it('posts an unpaid cost to its account and to trade creditors, opened as a system account, and keeps it', async () => {
		const answer = await run('record_expense', { ...adobe, costCentreId: projectsId });
		expect(answer).toContain("Recorded the cost in Jewel Enterprises's books and posted it, owed to the supplier on trade creditors:");
		expect(answer).toContain('- 5 Nov 2026: Adobe, Creative Cloud, £84.99; 6100 Software, cost centre Projects; unpaid.');
		const openedCreditors = { code: '2100', name: 'Trade creditors', account_type: 'liability', is_system: true };
		expect(writesTo('books_ledger_accounts')[0].row).toEqual(expect.objectContaining(openedCreditors));
		const [cost] = journalsOfKind('expense');
		expect(cost).toEqual(expect.objectContaining({ journal_date: '2026-11-05', description: 'Adobe: Creative Cloud' }));
		expect(postedLines(cost.id)).toEqual([
			{ accountId: softwareId, costCentreId: projectsId, debit: 84.99, credit: 0 },
			{ accountId: accountIdOfCode('2100'), costCentreId: null, debit: 0, credit: 84.99 }
		]);
		expect(ledgerTables.books_expenses[0]).toEqual(expect.objectContaining({ supplier: 'Adobe', paid_on: null, recorded_journal_id: cost.id }));
	});

	it('posts a cost paid already against the bank, paid on its own day, and codes a prepayment to Prepayments', async () => {
		expect(await run('record_expense', { ...adobe, expenseAccountId: prepaymentsId, isPaid: true })).toContain('paid from the bank');
		const [cost] = journalsOfKind('expense');
		expect(postedLines(cost.id).map((line) => line.accountId)).toEqual([prepaymentsId, accountIdOfCode('1200')]);
		expect(ledgerTables.books_expenses[0].paid_on).toBe('2026-11-05');
	});

	it('refuses what the columns cannot hold, or an account a cost is not coded to, posting nothing', async () => {
		expect(await run('record_expense', { ...adobe, amount: 84.999 })).toBe('Nothing was posted. amount has at most 2 decimal places; 84.999 was given.');
		expect(await run('record_expense', { ...adobe, amount: 0 })).toBe('Nothing was posted. amount is above zero; 0 was given.');
		expect(await run('record_expense', { ...adobe, supplier: '  ' })).toContain('Nothing was posted. supplier is needed');
		expect(await run('record_expense', { ...adobe, expenseDate: '2026-11-31' })).toContain('expenseDate is not a day on the calendar');
		expect(await run('record_expense', { ...adobe, isPaid: 'yes' })).toBe('Nothing was posted. isPaid is true or false; "yes" was given.');
		const codedToSales = await run('record_expense', { ...adobe, expenseAccountId: salesId });
		expect(codedToSales).toContain('is 4000, of type income; a cost is coded to an expense account');
		expect(ledgerWrites).toEqual([]);
	});
});
