import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { validateJournal, type JournalFields, type JournalInput } from '$lib/data/books/journalRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { postingTargetRefusal } from './postingTargets';

/**
 * The journal as given, once every value is checked against its column, its debits are found to equal its credits and
 * every account, cost centre and reversed journal is found to be the organisation's; otherwise the first reason it is refused.
 */
export async function checkJournal(supabase: SupabaseClient, organisationId: string, fields: JournalFields): Promise<JournalInput> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const journal = validateJournal(fields);
	if (typeof journal === 'string') throw new BooksRefusal(journal);
	refuseWhen(await postingTargetRefusal(supabase, organisationId, journal));
	return journal;
}
