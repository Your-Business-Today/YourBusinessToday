import type { SupabaseClient } from '@supabase/supabase-js';
import type { JournalFields, JournalInput } from '$lib/data/books/journalRules';
import { checkJournal } from './checkJournal';

/** A journal a step of the database posts whole, given its id by the server before the step is called. */
export type StepJournal = JournalInput & { id: string };

const journalsTable = 'books_journals';

/**
 * The journal checked as every posting is checked, and given its id now, so that when a step's answer is lost the
 * server can look for that id to know whether the step posted it.
 */
export async function prepareStepJournal(supabase: SupabaseClient, organisationId: string, fields: JournalFields): Promise<StepJournal> {
	const journal = await checkJournal(supabase, organisationId, fields);
	return { ...journal, id: crypto.randomUUID() };
}

/** The journal as a step is given it: the columns books_journals keeps, with its lines in the order they post. */
export function journalArgument(journal: StepJournal) {
	return {
		id: journal.id,
		journal_date: journal.journalDate,
		description: journal.description,
		kind: journal.kind,
		reverses_journal_id: journal.reversesJournalId,
		lines: journal.lines.map((line) => ({ account_id: line.accountId, cost_centre_id: line.costCentreId, debit: line.debit, credit: line.credit }))
	};
}

/** Whether the organisation's ledger holds the journal with that id: the sign that the step which posts it happened. */
export async function isJournalPosted(supabase: SupabaseClient, organisationId: string, journalId: string): Promise<boolean> {
	const { data, error } = await supabase.from(journalsTable).select('id').eq('organisation_id', organisationId).eq('id', journalId);
	if (error !== null) throw error;
	return (data ?? []).length > 0;
}
