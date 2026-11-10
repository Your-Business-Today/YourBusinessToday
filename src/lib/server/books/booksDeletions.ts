import type { SupabaseClient } from '@supabase/supabase-js';
import { deletionEntryRefusal, type BooksDeletionEntry } from '$lib/data/books/deletionRecordRules';
import { refuseWhen } from './booksRefusal';

export const booksDeletionsTable = 'books_deletions';

/**
 * Writes the deletion into the record that outlives what is deleted, under the person deleting it, with a copy of the
 * row, its lines and any journals that go with it. Written before the delete, so a deletion is never left unrecorded.
 */
export async function recordBooksDeletion(supabase: SupabaseClient, entry: BooksDeletionEntry): Promise<string> {
	refuseWhen(deletionEntryRefusal(entry));
	const { data, error } = await supabase
		.from(booksDeletionsTable)
		.insert({
			organisation_id: entry.organisationId,
			kind: entry.kind,
			record_id: entry.recordId,
			known_as: entry.knownAs,
			record: entry.record,
			journals: entry.journals,
			deleted_by_account_id: entry.deletedByAccountId
		})
		.select('id')
		.single();
	if (error !== null) throw error;
	return (data as { id: string }).id;
}

/** Takes back the record of a deletion the database then refused, so the record only holds what happened. */
export async function withdrawBooksDeletion(supabase: SupabaseClient, deletionId: string): Promise<void> {
	const { error } = await supabase.from(booksDeletionsTable).delete().eq('id', deletionId);
	if (error !== null) throw error;
}
