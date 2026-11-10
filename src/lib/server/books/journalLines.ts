import type { SupabaseClient } from '@supabase/supabase-js';
import type { JournalLineInput } from '$lib/data/books/journalLine';

type JournalLineRow = { account_id: string; cost_centre_id: string | null; debit: number | string; credit: number | string };

/** The lines of one of the organisation's journals, in the order they were posted. */
export async function findJournalLines(supabase: SupabaseClient, organisationId: string, journalId: string): Promise<JournalLineInput[]> {
	const { data, error } = await supabase
		.from('books_journal_lines')
		.select('id, account_id, cost_centre_id, debit, credit')
		.eq('organisation_id', organisationId)
		.eq('journal_id', journalId)
		.order('position')
		.order('id');
	if (error !== null) throw error;
	return (data as unknown as JournalLineRow[]).map((row) => ({
		accountId: row.account_id,
		costCentreId: row.cost_centre_id,
		debit: Number(row.debit),
		credit: Number(row.credit)
	}));
}
