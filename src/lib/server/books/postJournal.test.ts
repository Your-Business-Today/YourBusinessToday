import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { postJournal } from './postJournal';
import { BooksRefusal } from './booksRefusal';

const organisation = '00000000-0000-4000-8000-0000000000a1';
const bank = '00000000-0000-4000-8000-000000001200';
const sales = '00000000-0000-4000-8000-000000004000';
const postedJournalId = 'journal-1';

type BooksState = { accounts: { id: string; is_archived: boolean }[]; lineFailure: { code: string } | null };
type Write = { table: string; operation: string; rows?: unknown };

const BooksTables = { accounts: 'books_ledger_accounts', journalLines: 'books_journal_lines' } as const;
const Operations = { select: 'select', insert: 'insert', delete: 'delete' } as const;

function booksHolding(state: BooksState) {
	const writes: Write[] = [];
	const answerTo = (table: string, operation: string) => {
		const isAccountsTable = table === BooksTables.accounts;
		if (operation === Operations.select) return { data: isAccountsTable ? state.accounts : [], error: null };
		const isLineInsert = operation === Operations.insert;
		if (table === BooksTables.journalLines) return { error: isLineInsert ? state.lineFailure : null };
		return { data: { id: postedJournalId }, error: null };
	};
	const queryOn = (table: string) => {
		let operation: string = Operations.select;
		const chain = {
			select: () => chain,
			eq: () => chain,
			in: () => chain,
			single: () => chain,
			insert: (rows: unknown) => ((operation = Operations.insert), writes.push({ table, operation, rows }), chain),
			delete: () => ((operation = Operations.delete), writes.push({ table, operation }), chain),
			then: (resolve: (value: unknown) => unknown) => resolve(answerTo(table, operation))
		};
		return chain;
	};
	return { supabase: { from: queryOn } as unknown as SupabaseClient, writes };
}

const openAccounts = [{ id: bank, is_archived: false }, { id: sales, is_archived: false }];
const cashSale = {
	journalDate: '2026-11-10',
	description: 'Cash sale',
	kind: 'manual',
	lines: [{ accountId: bank, debit: 50 }, { accountId: sales, credit: 50 }]
};

describe('postJournal', () => {
	it("posts the journal and its lines into the organisation's books, in order", async () => {
		const { supabase, writes } = booksHolding({ accounts: openAccounts, lineFailure: null });
		expect(await postJournal(supabase, organisation, cashSale)).toBe(postedJournalId);
		expect(writes.map((write) => write.table)).toEqual(['books_journals', 'books_journal_lines']);
		const lines = writes[1].rows as { organisation_id: string; debit: number; credit: number; position: number }[];
		expect(lines.map((line) => [line.organisation_id, line.debit, line.credit, line.position])).toEqual([
			[organisation, 50, 0, 0],
			[organisation, 0, 50, 1]
		]);
	});

	it('writes nothing for a journal that does not balance', async () => {
		const { supabase, writes } = booksHolding({ accounts: openAccounts, lineFailure: null });
		const lopsided = { ...cashSale, lines: [{ accountId: bank, debit: 50 }, { accountId: sales, credit: 40 }] };
		await expect(postJournal(supabase, organisation, lopsided)).rejects.toThrow(new BooksRefusal('Debits (50) do not equal credits (40).'));
		expect(writes).toEqual([]);
	});

	it("writes nothing to an account outside the organisation's books, or archived", async () => {
		const elsewhere = booksHolding({ accounts: [openAccounts[0]], lineFailure: null });
		await expect(postJournal(elsewhere.supabase, organisation, cashSale)).rejects.toThrow(`No account ${sales} is in this organisation's books.`);
		const archived = booksHolding({ accounts: [openAccounts[0], { id: sales, is_archived: true }], lineFailure: null });
		await expect(postJournal(archived.supabase, organisation, cashSale)).rejects.toThrow('is archived, so nothing posts to it.');
		expect([...elsewhere.writes, ...archived.writes]).toEqual([]);
	});

	it('refuses an organisation that is not an id', async () => {
		const { supabase } = booksHolding({ accounts: openAccounts, lineFailure: null });
		await expect(postJournal(supabase, 'jewel', cashSale)).rejects.toBeInstanceOf(BooksRefusal);
	});

	it('takes the journal back out when its lines fail to save, so nothing is half posted', async () => {
		const { supabase, writes } = booksHolding({ accounts: openAccounts, lineFailure: { code: '23503' } });
		await expect(postJournal(supabase, organisation, cashSale)).rejects.toEqual({ code: '23503' });
		expect(writes.map((write) => `${write.operation} ${write.table}`)).toEqual([
			'insert books_journals',
			'insert books_journal_lines',
			'delete books_journals'
		]);
	});
});
