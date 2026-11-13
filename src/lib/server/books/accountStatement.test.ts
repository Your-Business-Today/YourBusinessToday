import { beforeEach, describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { clearLedgerTables, ledgerTables, ledgerWrites } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import { standDatabaseStepsDown } from '$lib/server/mcp/actions/booksLedgerCalls.fixture';
import { ledgerSupabase } from '$lib/server/mcp/actions/booksInvoicePostingWorld.fixture';
import { postJournal } from './postJournal';
import { readAccountStatement } from './accountStatement';

const organisation = '00000000-0000-4000-8000-0000000000a1';
const bank = { id: '00000000-0000-4000-8000-000000001200', code: '1200', name: 'Bank', account_type: 'asset', is_archived: false };
const sales = { id: '00000000-0000-4000-8000-000000004000', code: '4000', name: 'Sales', account_type: 'income', is_archived: false };
const books = ledgerSupabase as unknown as SupabaseClient;
const postedAt = '2026-11-10T09:00:00Z';

const cashSale = {
	journalDate: '2026-11-10',
	description: 'Cash sale',
	kind: 'manual',
	lines: [{ accountId: bank.id, debit: 50, description: 'Card sale at the fair' }, { accountId: sales.id, credit: 50 }]
};

/** Each posted line with its journal beside it, as the statement's reading embeds books_journals. */
function embedJournals(): void {
	const journals = ledgerTables.books_journals;
	ledgerTables.books_journal_lines = ledgerTables.books_journal_lines.map((line) => {
		const journal = journals.find((posted) => posted.id === line.journal_id);
		return { ...line, books_journals: { ...journal, created_at: postedAt } };
	});
}

async function descriptionsOn(accountCode: string): Promise<string[]> {
	const statement = await readAccountStatement(books, organisation, { accountCode, periodEnd: '2026-11-30' });
	return statement.lines.map((line) => line.description);
}

describe("an account's statement", () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		clearLedgerTables();
		ledgerTables.books_ledger_accounts = [bank, sales];
		ledgerTables.books_journals = [];
		ledgerTables.books_journal_lines = [];
	});

	it("gives the step each line's own description, and a blank one to a line given none", async () => {
		await postJournal(books, organisation, cashSale);
		const step = ledgerWrites.find((write) => write.kind === 'rpc');
		const [journal] = (step?.row as { journals: { lines: { description: string }[] }[] }).journals;
		expect(journal.lines.map((line) => line.description)).toEqual(['Card sale at the fair', '']);
	});

	it("reads each entry with its line's own description, or its journal's when the line has none", async () => {
		await postJournal(books, organisation, cashSale);
		embedJournals();
		expect(await descriptionsOn('1200')).toEqual(['Card sale at the fair']);
		expect(await descriptionsOn('4000')).toEqual(['Cash sale']);
	});

	it('reads a journal already in the books, whose lines were kept blank, as it did', async () => {
		const journal = { id: 'journal-1', journal_date: '2026-11-01', description: 'Opening capital', kind: 'manual', created_at: postedAt };
		const line = { journal_id: journal.id, cost_centre_id: null, debit: 0, credit: 0, position: 0, description: '', books_journals: journal };
		ledgerTables.books_journal_lines = [{ ...line, id: 'line-1', account_id: bank.id, debit: 100 }];
		expect(await descriptionsOn('1200')).toEqual(['Opening capital']);
	});
});
