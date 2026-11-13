import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { accountIdOfCode, journalsOfKind, postedLines, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { softwareId } from './booksExpenseWorld.fixture';
import { holdPartnersWhoPayCosts, jamesLedgerId, jamesLoanId, jeremyLoanId, otherBooksLoanId } from './booksPartnerPaidCostWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const insurance = { expenseDate: '2026-11-05', supplier: 'Hiscox', description: 'Insurance', amount: 600, expenseAccountId: softwareId };
const paidByJames = { ...insurance, isPaid: true, paidByLoanAccountId: jamesLoanId };

describe('a company cost a partner paid personally', () => {
	beforeEach(holdPartnersWhoPayCosts);

	it('is kept as a cost paid that day by that person, credited to their loan account and leaving the bank untouched', async () => {
		const answer = await run('record_expense', paidByJames);
		expect(answer).toContain('paid personally by James Beadle and credited to their loan account, 2300 James Beadle loan');
		const [cost] = journalsOfKind('expense');
		expect(postedLines(cost.id)).toEqual([
			{ accountId: softwareId, costCentreId: null, debit: 600, credit: 0 },
			{ accountId: jamesLedgerId, costCentreId: null, debit: 0, credit: 600 }
		]);
		expect(accountIdOfCode('1200')).toBeUndefined();
		expect(ledgerTables.books_expenses[0]).toEqual(expect.objectContaining({ paid_on: '2026-11-05', paid_by_loan_account_id: jamesLoanId }));
		const listed = await run('list_expenses', {});
		expect(listed).toContain('Hiscox, Insurance, £600.00; 6100 Software; paid 5 Nov 2026 by James Beadle personally, on their loan account.');
		expect(listed).toContain('1 shown, 0 unpaid');
	});

	it('is deleted with its journal, putting the loan account back, and the deletion record says who paid it', async () => {
		await run('record_expense', paidByJames);
		const expenseId = ledgerTables.books_expenses[0].id;
		expect(await run('delete_expense', { expenseId })).toContain('Deleted the cost from Hiscox');
		expect(ledgerTables.books_expenses).toEqual([]);
		expect(ledgerTables.books_journal_lines.filter((line) => line.account_id === jamesLedgerId)).toEqual([]);
		const [deletion] = ledgerTables.books_deletions;
		expect(deletion.record).toEqual(expect.objectContaining({ paid_by_loan_account_id: jamesLoanId }));
	});

	it('is refused by name, posting nothing, from a closed account, another organisation\'s books, or when still owed', async () => {
		const closed = await run('record_expense', { ...paidByJames, paidByLoanAccountId: jeremyLoanId });
		expect(closed).toBe('Nothing was posted. The loan account of Jeremy is closed, so no cost can be paid from it; list_loan_accounts lists those still open.');
		const elsewhere = await run('record_expense', { ...paidByJames, paidByLoanAccountId: otherBooksLoanId });
		expect(elsewhere).toBe(`Nothing was posted. No loan account ${otherBooksLoanId} is in this organisation's books; list_loan_accounts lists them.`);
		const owed = await run('record_expense', { ...insurance, paidByLoanAccountId: jamesLoanId });
		expect(owed).toContain('Nothing was posted. paidByLoanAccountId is for a cost a person has paid already from their own pocket');
		const notAnId = await run('record_expense', { ...paidByJames, paidByLoanAccountId: 'james' });
		expect(notAnId).toContain('Nothing was posted. The loan account must be an id');
		expect(ledgerWrites).toEqual([]);
	});

	it('cannot be marked paid again from the bank', async () => {
		await run('record_expense', paidByJames);
		const expenseId = ledgerTables.books_expenses[0].id;
		expect(await run('pay_expense', { expenseId, paidOn: '2026-11-06' })).toContain('was paid on 5 Nov 2026 already');
	});
});
