import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankAccountSide } from '$lib/data/books/reconciliation/unlinedEntries';
import { entryDescription } from '$lib/data/books/journalLineDescription';
import { readEveryPage } from './everyPage';

type BankAccountSideRow = {
	journal_id: string;
	debit: number | string;
	credit: number | string;
	description: string | null;
	books_journals: { journal_date: string; description: string };
};

const noOwnDescription = '';

const bankAccountSideColumns = 'id, journal_id, debit, credit, description, books_journals!inner(journal_date, description)';

/** Every side posted on the statement's account on or before the day, with its journal's id, day and description. */
export async function findBankAccountSides(supabase: SupabaseClient, organisationId: string, accountId: string, throughDate: string): Promise<BankAccountSide[]> {
	return readEveryPage(async (pageStart, pageEnd) => {
		const { data, error } = await supabase
			.from('books_journal_lines')
			.select(bankAccountSideColumns)
			.eq('organisation_id', organisationId)
			.eq('account_id', accountId)
			.lte('books_journals.journal_date', throughDate)
			.order('id')
			.range(pageStart, pageEnd);
		if (error !== null) throw error;
		return (data as unknown as BankAccountSideRow[]).map(fromBankAccountSideRow);
	});
}

function fromBankAccountSideRow(row: BankAccountSideRow): BankAccountSide {
	const journal = row.books_journals;
	return {
		journalId: row.journal_id,
		journalDate: journal.journal_date,
		description: entryDescription(row.description ?? noOwnDescription, journal.description),
		debit: Number(row.debit),
		credit: Number(row.credit)
	};
}
