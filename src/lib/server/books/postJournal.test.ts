import { beforeEach, describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { clearLedgerTables, ledgerTables, ledgerWrites } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import { databaseStepStanding, standDatabaseStepsDown } from '$lib/server/mcp/actions/booksLedgerCalls.fixture';
import { ledgerSupabase, postedLines } from '$lib/server/mcp/actions/booksInvoicePostingWorld.fixture';
import { journalRefusal } from '$lib/server/mcp/actions/booksStepJournal.fixture';
import { postJournal } from './postJournal';
import { BooksRefusal } from './booksRefusal';
import { UnsettledBooksStep } from './booksStep';

const organisation = '00000000-0000-4000-8000-0000000000a1';
const bank = '00000000-0000-4000-8000-000000001200';
const sales = '00000000-0000-4000-8000-000000004000';
const books = ledgerSupabase as unknown as SupabaseClient;

const cashSale = {
	journalDate: '2026-11-10',
	description: 'Cash sale',
	kind: 'manual',
	lines: [{ accountId: bank, debit: 50 }, { accountId: sales, credit: 50 }]
};

function holdAccounts(salesAccount: Record<string, unknown> | null = { id: sales, is_archived: false }): void {
	clearLedgerTables();
	ledgerTables.books_ledger_accounts = [{ id: bank, is_archived: false }, ...(salesAccount === null ? [] : [salesAccount])];
	ledgerTables.books_journals = [];
	ledgerTables.books_journal_lines = [];
}

const stepsCalled = () => ledgerWrites.filter((write) => write.kind === 'rpc').map((write) => write.table);

describe('postJournal', () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		holdAccounts();
	});

	it("posts the journal and its lines into the organisation's books in one step, in order, and answers its id", async () => {
		const journalId = await postJournal(books, organisation, cashSale);
		expect(stepsCalled()).toEqual(['post_books_journal_set']);
		expect(ledgerTables.books_journals).toEqual([expect.objectContaining({ id: journalId, organisation_id: organisation, kind: 'manual' })]);
		expect(postedLines(journalId)).toEqual([
			{ accountId: bank, costCentreId: null, debit: 50, credit: 0 },
			{ accountId: sales, costCentreId: null, debit: 0, credit: 50 }
		]);
	});

	it('writes nothing for a journal that does not balance', async () => {
		const lopsided = { ...cashSale, lines: [{ accountId: bank, debit: 50 }, { accountId: sales, credit: 40 }] };
		await expect(postJournal(books, organisation, lopsided)).rejects.toThrow(new BooksRefusal('Debits (50) do not equal credits (40).'));
		expect(ledgerWrites).toEqual([]);
	});

	it("writes nothing to an account outside the organisation's books, or archived", async () => {
		holdAccounts(null);
		await expect(postJournal(books, organisation, cashSale)).rejects.toThrow(`No account ${sales} is in this organisation's books.`);
		holdAccounts({ id: sales, is_archived: true });
		await expect(postJournal(books, organisation, cashSale)).rejects.toThrow('is archived, so nothing posts to it.');
		expect(ledgerWrites).toEqual([]);
	});

	it('refuses an organisation that is not an id', async () => {
		await expect(postJournal(books, 'jewel', cashSale)).rejects.toBeInstanceOf(BooksRefusal);
	});

	it('leaves nothing half posted when the step fails, takes nothing back, and says to read the ledger', async () => {
		journalRefusal.atJournal = 1;
		const failing = postJournal(books, organisation, cashSale);
		await expect(failing).rejects.toBeInstanceOf(UnsettledBooksStep);
		await expect(failing).rejects.toThrow('read_trial_balance and explain_account_balance say what the ledger holds; read it before asking again');
		expect(ledgerTables.books_journals).toEqual([]);
		expect(ledgerTables.books_journal_lines).toEqual([]);
		expect(ledgerWrites.filter((write) => write.kind === 'delete')).toEqual([]);
	});

	it('answers the id of a journal whose step happened though its answer was lost, posting it once', async () => {
		databaseStepStanding.isAnswerLost = true;
		const journalId = await postJournal(books, organisation, cashSale);
		expect(ledgerTables.books_journals.map((journal) => journal.id)).toEqual([journalId]);
	});
});
