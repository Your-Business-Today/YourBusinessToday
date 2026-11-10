import type { SupabaseClient } from '@supabase/supabase-js';
import type { JournalFields, JournalInput } from '$lib/data/books/journalRules';
import type { JournalLineInput } from '$lib/data/books/journalLine';
import { checkJournal } from './checkJournal';

/**
 * Posts a journal by double entry into an organisation's books and answers its id. A journal whose debits do
 * not equal its credits, or any value its columns cannot hold, is refused with the reason before anything is
 * written; lines that fail to save take their journal with them, so no half-posted journal is left behind.
 */
export async function postJournal(supabase: SupabaseClient, organisationId: string, fields: JournalFields): Promise<string> {
	const journal = await checkJournal(supabase, organisationId, fields);
	const journalId = await insertJournal(supabase, organisationId, journal);
	const lineRows = journal.lines.map((line, position) => toLineRow(organisationId, journalId, line, position));
	const { error } = await supabase.from('books_journal_lines').insert(lineRows);
	if (error === null) return journalId;
	await supabase.from('books_journals').delete().eq('organisation_id', organisationId).eq('id', journalId);
	throw error;
}

async function insertJournal(supabase: SupabaseClient, organisationId: string, journal: JournalInput): Promise<string> {
	const { data, error } = await supabase
		.from('books_journals')
		.insert({
			organisation_id: organisationId,
			journal_date: journal.journalDate,
			description: journal.description,
			kind: journal.kind,
			reverses_journal_id: journal.reversesJournalId
		})
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}

function toLineRow(organisationId: string, journalId: string, line: JournalLineInput, position: number) {
	return {
		organisation_id: organisationId,
		journal_id: journalId,
		account_id: line.accountId,
		cost_centre_id: line.costCentreId,
		debit: line.debit,
		credit: line.credit,
		position
	};
}
