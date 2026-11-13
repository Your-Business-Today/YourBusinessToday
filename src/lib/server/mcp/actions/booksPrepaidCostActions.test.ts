import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { accountIdOfCode, journalsOfKind, postedLines, runOnTheLedger as run, writesTo } from './booksInvoicePostingWorld.fixture';
import { holdChartForCosts, prepaymentsId, softwareId } from './booksExpenseWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const prepaymentsCode = '1300';
const missingCostCentreId = '00000000-0000-4000-8000-0000000cc999';
const yearOfInsurance = { expenseDate: '2026-11-01', supplier: 'Hiscox', description: 'Insurance', amount: 1200, isPaidUpFront: true, isPaid: true };
const spreadOverAYear = { firstMonthKey: '2026-11', monthCount: 12, totalAmount: 1200, description: 'Insurance', expenseAccountId: softwareId };

function holdChartWithoutPrepayments(): void {
	holdChartForCosts();
	ledgerTables.books_ledger_accounts = ledgerTables.books_ledger_accounts.filter((account) => account.code !== prepaymentsCode);
}

function prepaymentsAccounts() {
	return ledgerTables.books_ledger_accounts.filter((account) => account.code === prepaymentsCode);
}

describe('recording a cost paid up front', () => {
	beforeEach(holdChartWithoutPrepayments);

	it('opens Prepayments in new books, records the cost to it, and is then spread, in that order', async () => {
		expect(await run('record_expense', yearOfInsurance)).toContain('Hiscox, Insurance, £1,200.00; 1300 Prepayments; paid 1 Nov 2026');
		const openedPrepayments = { code: prepaymentsCode, name: 'Prepayments', account_type: 'asset', is_system: true };
		expect(writesTo('books_ledger_accounts')[0].row).toEqual(expect.objectContaining(openedPrepayments));
		const [cost] = journalsOfKind('expense');
		expect(postedLines(cost.id)[0]).toEqual({ accountId: accountIdOfCode(prepaymentsCode), costCentreId: null, debit: 1200, credit: 0 });
		expect(await run('read_chart_of_accounts', {})).toContain('1300 Prepayments');
		expect(await run('create_prepayment_release', spreadOverAYear)).toContain('Spread £1,200.00 for Insurance across 12 months');
		expect(journalsOfKind('prepayment_release')).toHaveLength(12);
		expect(prepaymentsAccounts()).toHaveLength(1);
	});

	it('codes the cost to the Prepayments the books already hold, opening no other', async () => {
		holdChartForCosts();
		await run('record_expense', yearOfInsurance);
		expect(writesTo('books_ledger_accounts').map((write) => (write.row as { code: string }).code)).toEqual(['1200']);
		expect(postedLines(journalsOfKind('expense')[0].id)[0].accountId).toBe(prepaymentsId);
	});

	it('refuses an account at 1300 of another type by name, posting nothing', async () => {
		const loan = { id: prepaymentsId, code: prepaymentsCode, name: 'Director loan', account_type: 'liability', is_system: false, is_archived: false };
		ledgerTables.books_ledger_accounts.push(loan);
		expect(await run('record_expense', yearOfInsurance)).toContain('this chart keeps 1300 Director loan there, of type liability');
		expect(ledgerWrites).toEqual([]);
	});

	it('refuses an account named as well, or an unusable cost centre, and opens nothing', async () => {
		const withAccount = await run('record_expense', { ...yearOfInsurance, expenseAccountId: softwareId });
		expect(withAccount).toBe(
			'Nothing was posted. Give expenseAccountId or isPaidUpFront, not both: a cost paid up front is coded to Prepayments by itself.'
		);
		expect(await run('record_expense', { ...yearOfInsurance, isPaidUpFront: 'yes' })).toContain('isPaidUpFront is true or false; "yes" was given.');
		expect(await run('record_expense', { ...yearOfInsurance, costCentreId: missingCostCentreId })).toContain('cost centre');
		expect(ledgerWrites).toEqual([]);
	});
});
