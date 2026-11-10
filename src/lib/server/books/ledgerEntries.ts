import type { SupabaseClient } from '@supabase/supabase-js';
import type { LedgerEntry } from '$lib/data/books/ledgerEntry';
import type { LedgerAccountType } from '$lib/data/books/ledgerAccountTypes';
import { readEveryPage } from './everyPage';

export type LedgerEntryRow = {
	id: string;
	account_id: string;
	cost_centre_id: string | null;
	debit: number | string;
	credit: number | string;
	books_journals: { journal_date: string };
	books_ledger_accounts: { code: string; name: string; account_type: LedgerAccountType };
};

const ledgerEntryColumns =
	'id, account_id, cost_centre_id, debit, credit, books_journals!inner(journal_date), books_ledger_accounts!inner(code, name, account_type)';

/** Every line posted in an organisation's books on or before the day, with its journal's date and its account. */
export async function findLedgerEntriesUpTo(supabase: SupabaseClient, organisationId: string, throughDate: string): Promise<LedgerEntry[]> {
	return readEveryPage((pageStart, pageEnd) => findEntriesPage(supabase, organisationId, throughDate, pageStart, pageEnd));
}

async function findEntriesPage(
	supabase: SupabaseClient,
	organisationId: string,
	throughDate: string,
	pageStart: number,
	pageEnd: number
): Promise<LedgerEntry[]> {
	const { data, error } = await supabase
		.from('books_journal_lines')
		.select(ledgerEntryColumns)
		.eq('organisation_id', organisationId)
		.lte('books_journals.journal_date', throughDate)
		.order('id')
		.range(pageStart, pageEnd);
	if (error !== null) throw error;
	return (data as unknown as LedgerEntryRow[]).map(fromLedgerEntryRow);
}

export function fromLedgerEntryRow(row: LedgerEntryRow): LedgerEntry {
	const journal = row.books_journals;
	const account = row.books_ledger_accounts;
	return {
		journalDate: journal.journal_date,
		accountId: row.account_id,
		accountCode: account.code,
		accountName: account.name,
		accountType: account.account_type,
		costCentreId: row.cost_centre_id,
		debit: Number(row.debit),
		credit: Number(row.credit)
	};
}
