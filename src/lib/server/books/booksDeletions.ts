import type { SupabaseClient } from '@supabase/supabase-js';
import { deletionEntryRefusal, type BooksDeletionEntry } from '$lib/data/books/deletionRecordRules';
import { refuseWhen } from './booksRefusal';

export const booksDeletionsTable = 'books_deletions';

/** A step of the database that deletes a row and writes the record of it together: its name and what it is given. */
export type DeletionStep = { name: string; inputs: Record<string, unknown> };

/**
 * Deletes the row and writes its record in one step of the database, so the two happen together or not at all, and
 * answers the record's id, or null when the step found nothing it could delete and no record of it is kept. When the
 * step's answer does not come back, the record says whether the delete happened; an error it cannot settle is reported.
 */
export async function deleteKeepingRecord(supabase: SupabaseClient, entry: BooksDeletionEntry, step: DeletionStep): Promise<string | null> {
	refuseWhen(deletionEntryRefusal(entry));
	const answer = await supabase.rpc(step.name, step.inputs);
	if (answer.error === null && typeof answer.data === 'string') return answer.data;
	const recordedDeletionId = await findRecordedDeletion(supabase, entry, answer.error);
	if (recordedDeletionId !== null) return recordedDeletionId;
	if (answer.error !== null) throw answer.error;
	return null;
}

async function findRecordedDeletion(supabase: SupabaseClient, entry: BooksDeletionEntry, stepError: unknown): Promise<string | null> {
	const { data, error } = await supabase
		.from(booksDeletionsTable)
		.select('id')
		.eq('organisation_id', entry.organisationId)
		.eq('kind', entry.kind)
		.eq('record_id', entry.recordId)
		.order('deleted_at', { ascending: false })
		.limit(1);
	if (error !== null) throw stepError ?? error;
	const [recorded] = (data ?? []) as { id: string }[];
	return recorded?.id ?? null;
}
