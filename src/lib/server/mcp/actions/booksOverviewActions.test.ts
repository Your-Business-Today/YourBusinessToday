import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { heldInvoice, holdDraftInvoice, invoiceId, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const accounts = {
	bank: { code: '1200', name: 'Bank', account_type: 'asset' },
	debtors: { code: '1100', name: 'Trade debtors', account_type: 'asset' },
	creditors: { code: '2100', name: 'Trade creditors', account_type: 'liability' },
	capital: { code: '3000', name: 'Capital', account_type: 'equity' },
	sales: { code: '4000', name: 'Sales', account_type: 'income' },
	software: { code: '6100', name: 'Software', account_type: 'expense' }
};
type Account = (typeof accounts)[keyof typeof accounts];

function line(position: number, journalDate: string, account: Account, debit: number, credit: number) {
	const id = `line-${position}`;
	const books_journals = { journal_date: journalDate };
	return { id, account_id: `account-${account.code}`, cost_centre_id: null, debit, credit, books_journals, books_ledger_accounts: account };
}

/** Capital in, invoice 6 issued and half paid, a month's hosting billed and not paid, and a sale in December. */
function holdNovemberBooks(): void {
	holdDraftInvoice();
	Object.assign(heldInvoice(), { status: 'issued' });
	ledgerTables.books_invoice_payments = [{ id: 'payment-1', invoice_id: invoiceId, amount: 500, paid_on: '2026-11-10' }];
	const posted = [
		['2026-10-01', accounts.bank, 5000, 0], ['2026-10-01', accounts.capital, 0, 5000],
		['2026-11-01', accounts.debtors, 1020.5, 0], ['2026-11-01', accounts.sales, 0, 1020.5],
		['2026-11-05', accounts.software, 20, 0], ['2026-11-05', accounts.creditors, 0, 20],
		['2026-11-10', accounts.bank, 500, 0], ['2026-11-10', accounts.debtors, 0, 500],
		['2026-12-02', accounts.bank, 100, 0], ['2026-12-02', accounts.sales, 0, 100]
	] as const;
	ledgerTables.books_journal_lines = posted.map(([day, account, debit, credit], position) => line(position, day, account, debit, credit));
}

const novemberOverview = [
	"How Jewel Enterprises's books stand at the end of November 2026:",
	'- Bank: £5,500.00',
	'- Owed by customers: £520.50',
	'- Owed to suppliers: £20.00',
	'No bank statement has been brought in yet.',
	'',
	'November 2026, with the financial year to date:',
	'- Income: £1,020.50 in the month, £1,020.50 year to date',
	'- Costs: £20.00 in the month, £20.00 year to date',
	'- Net profit: £1,000.50 in the month, £1,000.50 year to date',
	'',
	'Invoices unpaid today: 1, owing £520.50 in all, newest first:',
	`- INV-6 to Jewel Bespoke Build, issued, dated 1 Nov 2026, due 1 Dec 2026; Total £1,020.50, paid £500.00, owed £520.50. Id ${invoiceId}`,
	'',
	'No billing schedule is running, so nothing goes out by itself.',
	'Drafts waiting to be issued: 0.'
].join('\n');

describe('reading how the books stand', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		holdNovemberBooks();
	});

	afterEach(() => vi.useRealTimers());

	it('reads nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		expect(await run('read_books_overview', { monthKey: '2026-11' })).toBe(moduleNotSwitchedOn('books'));
	});

	it('stands the bank, debtors and creditors at the month end, with the month, the year to date and who still owes', async () => {
		expect(await run('read_books_overview', { monthKey: '2026-11' })).toBe(novemberOverview);
	});

	it('reads this month on a UK clock when no month is given', async () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-09-30T23:30:00Z'));
		const answer = await run('read_books_overview', {});
		expect(answer).toContain("books stand at the end of October 2026:\n- Bank: £5,000.00\n- Owed by customers: £0.00");
		expect(answer).toContain('- Income: £0.00 in the month, £0.00 year to date');
	});

	it('says when no issued invoice is unpaid', async () => {
		Object.assign(heldInvoice(), { status: 'paid' });
		expect(await run('read_books_overview', { monthKey: '2026-11' })).toContain('\n\nNo issued invoice is unpaid today.');
	});

	it('refuses a month not written as 2026-11, reading nothing', async () => {
		expect(await run('read_books_overview', { monthKey: '2026-11-30' })).toBe(
			'No reading was taken. monthKey is a month written as 2026-11; "2026-11-30" was given.'
		);
	});
});
