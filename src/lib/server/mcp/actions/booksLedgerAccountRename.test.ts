import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { holdChartForCosts, prepaymentsId, softwareId } from './booksExpenseWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

type Row = Record<string, unknown>;

const bankId = '00000000-0000-4000-8000-000000001200';
const renamedName = 'Software subscriptions';
const novemberEnd = '2026-11-30';
const renameAccount = (accountCode: string, name: string) => run('rename_ledger_account', { accountCode, name });
const renamesMade = () => ledgerWrites.filter((write) => write.kind === 'update');

/** A line of the month's software journal, joined to its account row as the database joins it, so a rename shows through. */
function softwareJournalLine(id: string, account: Row, amounts: { debit: number; credit: number }): Row {
	const journal = { journal_date: '2026-11-03', description: 'Claude subscription', kind: 'manual' };
	const accountId = account.id;
	const placing = { journal_id: 'journal-1', account_id: accountId, cost_centre_id: null, position: 0, description: '' };
	return { id, ...placing, ...amounts, books_journals: journal, books_ledger_accounts: account };
}

function holdSoftwareBoughtThisMonth(): void {
	holdChartForCosts();
	const [software] = ledgerTables.books_ledger_accounts;
	const bank = { id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false };
	ledgerTables.books_ledger_accounts.push(bank);
	ledgerTables.books_settings = [{ financial_year_start_month: 8 }];
	const spent = softwareJournalLine('line-1', software, { debit: 90, credit: 0 });
	const paid = softwareJournalLine('line-2', bank, { debit: 0, credit: 90 });
	ledgerTables.books_journal_lines = [spent, paid];
}

describe('renaming an account in the chart', () => {
	beforeEach(holdSoftwareBoughtThisMonth);

	it('changes only the name, and every reading names the account by it', async () => {
		const renamedLine = `- 6100 ${renamedName}, expense. Id ${softwareId}`;
		expect(await renameAccount('6100', renamedName)).toBe(`Renamed in Jewel Enterprises's chart of accounts:\n${renamedLine}`);
		expect(renamesMade()).toEqual([{ table: 'books_ledger_accounts', kind: 'update', row: { name: renamedName } }]);
		expect(await run('read_chart_of_accounts', {})).toContain(`- 6100 ${renamedName}, expense.`);
		expect(await run('read_trial_balance', { asAt: novemberEnd })).toContain(renamedName);
		expect(await run('read_profit_and_loss', { periodStart: '2026-11-01', periodEnd: novemberEnd })).toContain(renamedName);
		expect(await run('explain_account_balance', { accountCode: '6100', periodEnd: novemberEnd })).toContain(renamedName);
	});

	it("refuses each of the books' own accounts by name, renaming nothing", async () => {
		expect(await renameAccount('1200', 'Starling')).toBe("Nothing was saved. 1200 Bank is one of the books' own accounts, so it keeps its name.");
		expect(await renameAccount('1300', 'Paid ahead')).toBe("Nothing was saved. 1300 Prepayments is one of the books' own accounts, so it keeps its name.");
		const prepayments = ledgerTables.books_ledger_accounts.find((account) => account.id === prepaymentsId);
		expect(prepayments?.name).toBe('Prepayments');
		expect(renamesMade()).toEqual([]);
	});

	it('refuses a name that breaks the chart rules, and a code the chart does not hold', async () => {
		expect(await renameAccount('6100', '')).toBe('Nothing was saved. name cannot be blank.');
		expect(await renameAccount('6100', ' Software')).toBe('Nothing was saved. name starts or ends with a space; give it without one.');
		expect(await renameAccount('9999', 'Sundries')).toBe(
			`Nothing was saved. No account with the code "9999" is in this organisation's chart; read_chart_of_accounts lists them.`
		);
		expect(renamesMade()).toEqual([]);
	});
});
