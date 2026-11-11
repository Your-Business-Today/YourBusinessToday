import type { SupabaseClient } from '@supabase/supabase-js';
import type { JournalFields } from '$lib/data/books/journalRules';
import { postJournalSet } from './journalSet';
import { prepareStepJournal } from './journalStep';

const whereTheLedgerStands = 'read_trial_balance and explain_account_balance say what the ledger holds';

/**
 * Posts a journal by double entry into an organisation's books and answers its id. A journal whose debits do not
 * equal their credits, or any value its columns cannot hold, is refused with the reason before anything is written;
 * the journal and its lines are then written in one step of the database, together or not at all.
 */
export async function postJournal(supabase: SupabaseClient, organisationId: string, fields: JournalFields): Promise<string> {
	const journal = await prepareStepJournal(supabase, organisationId, fields);
	const move = `the journal "${journal.description}" dated ${journal.journalDate} was posted`;
	await postJournalSet(supabase, organisationId, [journal], { move, whereItStands: whereTheLedgerStands });
	return journal.id;
}
