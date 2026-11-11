import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { databaseStepStanding, standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { journalRefusal } from './booksStepJournal.fixture';
import { journalsOfKind, postedLines, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { expenseId, heldExpense, holdChartForCosts, holdUnpaidHosting, softwareId } from './booksExpenseWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const adobe = { expenseDate: '2026-11-05', supplier: 'Adobe', description: 'Creative Cloud', amount: 84.99, expenseAccountId: softwareId };
const readFirst = 'read it before asking again, so nothing is posted twice.';
const payHosting = () => run('pay_expense', { expenseId, paidOn: '2026-11-20' });
const takenBack = () => ledgerWrites.filter((write) => write.kind === 'delete');

describe('a move of a cost whose answer is lost', () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		holdUnpaidHosting();
	});

	it('says the cost was recorded when the step happened, keeping it with its one journal', async () => {
		databaseStepStanding.isAnswerLost = true;
		expect(await run('record_expense', adobe)).toContain('- 5 Nov 2026: Adobe, Creative Cloud, £84.99; 6100 Software; unpaid.');
		const [recording] = journalsOfKind('expense');
		const [cost] = ledgerTables.books_expenses.filter((expense) => expense.supplier === 'Adobe');
		expect(cost).toEqual(expect.objectContaining({ amount: 84.99, paid_on: null, recorded_journal_id: recording.id }));
		expect(postedLines(recording.id).map((line) => line.debit)).toEqual([84.99, 0]);
		expect(takenBack()).toEqual([]);
	});

	it('says the cost was paid when the step happened, keeping the mark and its one journal', async () => {
		databaseStepStanding.isAnswerLost = true;
		expect(await payHosting()).toContain('Marked the cost paid on 20 Nov 2026');
		const [payment] = journalsOfKind('expense_payment');
		expect(heldExpense()).toEqual(expect.objectContaining({ paid_on: '2026-11-20', payment_journal_id: payment.id }));
		expect(journalsOfKind('expense_payment')).toHaveLength(1);
		expect(takenBack()).toEqual([]);
	});
});

describe('a move of a cost that fails in the database', () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		holdUnpaidHosting();
	});

	it('records nothing, takes nothing back, and says to read the costs before asking again', async () => {
		databaseStepStanding.refusal = { message: 'TypeError: fetch failed' };
		expect(await run('record_expense', adobe)).toBe(
			`It could not be told whether the cost from Adobe was recorded for £84.99 (TypeError: fetch failed). list_expenses says where the cost from Adobe stands; ${readFirst}`
		);
		expect(await payHosting()).toContain('It could not be told whether the cost from Vercel was paid on 2026-11-20 (TypeError: fetch failed).');
		expect(ledgerTables.books_journals).toEqual([]);
		expect(ledgerTables.books_expenses).toEqual([expect.objectContaining({ supplier: 'Vercel', paid_on: null, payment_journal_id: null })]);
		expect(takenBack()).toEqual([]);
	});

	it('leaves neither journal nor cost when recording fails part-way, and neither journal nor mark when paying does', async () => {
		holdChartForCosts();
		journalRefusal.atJournal = 1;
		expect(await run('record_expense', adobe)).toContain('It could not be told whether the cost from Adobe was recorded');
		expect([ledgerTables.books_journals, ledgerTables.books_journal_lines, ledgerTables.books_expenses]).toEqual([[], [], []]);
		holdUnpaidHosting();
		expect(await payHosting()).toContain('It could not be told whether the cost from Vercel was paid');
		expect(ledgerTables.books_journal_lines).toEqual([]);
		expect(heldExpense()).toEqual(expect.objectContaining({ paid_on: null, payment_journal_id: null }));
	});
});
